import {catalog, exercises, poses, gear, zones, purposes} from './catalog.js?v=4';
import {curatedSource} from './evidence.js?v=4';

export const defaultSettings = {
  gear: ['wall'], blocked: [], excluded: [], level: 0, voice: true, volume: 75, known: [], adjustments: {}
};

export const repSeconds = 4;
export const ratingLabels = {easy:'余裕あり', okay:'ちょうどよい', hard:'きつい'};
export const statusLabels = {done:'完了', skipped:'スキップ', excluded:'今後も除外', pain:'痛みで停止', stopped:'中断', overlap:'負荷の重複でスキップ'};

export function overlaps(a, b) {
  return Boolean(a && b && a.load.some(zone => b.load.includes(zone)));
}

export function allowed(exercise, options, settings) {
  return Object.hasOwn(curatedSource,exercise.id)
    && options.poses.includes(exercise.pose)
    && exercise.level <= settings.level
    && exercise.gear.every(item => settings.gear.includes(item))
    && !exercise.load.some(zone => settings.blocked.includes(zone))
    && !settings.excluded.includes(exercise.id);
}

export function dose(exercise, settings) {
  const adjustment = settings.adjustments[exercise.id] || 0;
  switch (exercise.type) {
    case 'warm': return {id:exercise.id, seconds:45, rest:12};
    case 'cool': return {id:exercise.id, seconds:45, rest:10};
    case 'stretch': return {id:exercise.id, seconds:Math.max(10,15 + settings.level * 3 + adjustment * 3) * (exercise.sides ? 2 : 1), rest:25 - adjustment * 3};
    case 'strength': return {id:exercise.id, reps:(4 + settings.level * 2 + adjustment) * (exercise.sides ? 2 : 1), rest:30 - adjustment * 3};
  }
}

export function effort(row) {
  return row.seconds ?? row.reps * repSeconds;
}

export function estimate(rows) {
  return rows.reduce((total, row, index) => total + effort(row) + (index ? row.rest : 0), 0);
}

export function compatible(row, previous) {
  // Gentle preparation and recovery are outside the loaded main sequence.
  const exercise = exercises[row.id];
  if (['warm','cool'].includes(exercise.type)) return true;
  return !overlaps(exercise, previous ? exercises[previous.id] : null);
}

export function nextLoad(row, previous) {
  return ['strength','stretch'].includes(exercises[row.id].type) ? row : previous;
}

export function fullSequence(rows) {
  let previous = null;
  for (const row of rows) {
    if (!compatible(row, previous)) return false;
    previous = nextLoad(row, previous);
  }
  return true;
}

function floorChange(first, second) {
  return Number((first === 'stand') !== (second === 'stand'));
}

export function floorChanges(rows) {
  return rows.slice(1).reduce((count,row,index) =>
    count + floorChange(exercises[rows[index].id].pose,exercises[row.id].pose),0);
}

export function generate(options, settings, random = Math.random) {
  const pool = catalog.filter(item => allowed(item, options, settings));
  const warm = pool.filter(item => item.type === 'warm');
  const cool = pool.filter(item => item.type === 'cool');
  const main = pool.filter(item => ['strength','stretch'].includes(item.type)
    && (options.purpose === 'mixed' || options.purpose === item.type));
  if (!warm.length || !cool.length || !main.length) return null;

  const seconds = options.minutes * 60;
  const phaseSeconds = seconds >= 1200 ? 300 : seconds >= 900 ? 210 : 120;
  const shortPose = item => ['all4','kneel'].includes(item.pose);
  const endForPose = (items,pose) =>
    items.find(item => item.pose === pose && !shortPose(item))
    ?? items.find(item => !floorChange(item.pose,pose) && !shortPose(item))
    ?? items.find(item => item.pose === pose)
    ?? items.find(item => !floorChange(item.pose,pose))
    ?? items.find(item => !shortPose(item)) ?? items[0];
  const openings = Object.fromEntries(Object.keys(poses).map(pose => [pose,endForPose(warm,pose)]));
  const closings = Object.fromEntries(Object.keys(poses).map(pose => [pose,endForPose(cool,pose)]));
  const phaseDose = item => shortPose(item) ? 45 : phaseSeconds;
  const maxRepeats = seconds >= 1800 ? 3 : 2;
  const priorities = Object.fromEntries(main.map(item => [item.id, random()]));

  function compare(a,b) {
    return Number(b.types.size === 2) - Number(a.types.size === 2)
      || b.rows.length - a.rows.length
      || b.used.size - a.used.size
      || a.floorChanges - b.floorChanges
      || a.poseChanges - b.poseChanges
      || b.preference - a.preference;
  }

  let beam = [{rows:[], used:new Set(), types:new Set(), time:0, mainFloorChanges:0, mainPoseChanges:0, preference:0}];
  let best = null;
  for (let round = 0; round < 16 && beam.length; round++) {
    const expanded = [];
    for (const candidate of beam) {
      const last = candidate.rows.at(-1);
      for (const item of main) {
        const row = dose(item, settings);
        const time = candidate.time + effort(row) + row.rest;
        if (!compatible(row,last) || candidate.rows.filter(previous => previous.id === row.id).length >= maxRepeats) continue;
        const firstPose = candidate.firstPose ?? item.pose;
        const opening = openings[firstPose];
        const closing = closings[item.pose];
        if (time + phaseDose(opening) + phaseDose(closing) + 10 > seconds) continue;
        const lastPose = last ? exercises[last.id].pose : item.pose;
        const mainFloorChanges = candidate.mainFloorChanges + floorChange(lastPose,item.pose);
        const standingFloorChanges = mainFloorChanges + floorChange(opening.pose,firstPose) + floorChange(item.pose,closing.pose);
        if (standingFloorChanges > 1) continue;
        const mainPoseChanges = candidate.mainPoseChanges + Number(lastPose !== item.pose);
        expanded.push({
          rows:[...candidate.rows,row], used:new Set([...candidate.used,item.id]),
          types:new Set([...candidate.types,item.type]), time, firstPose, opening, closing,
          mainFloorChanges, mainPoseChanges,
          floorChanges:standingFloorChanges,
          poseChanges:mainPoseChanges + Number(opening.pose !== firstPose) + Number(item.pose !== closing.pose),
          preference:candidate.preference + priorities[item.id]
        });
      }
    }
    expanded.sort(compare);
    beam = expanded.slice(0,100);
    if (beam.length && (!best || compare(beam[0],best) < 0)) best = beam[0];
  }
  if (!best) return null;

  const {opening,closing} = best;
  return [
    {...dose(opening,settings), seconds:phaseDose(opening), rest:0},
    ...best.rows,
    {...dose(closing,settings), seconds:phaseDose(closing), rest:10}
  ];
}

export function alternatives(rows, index, options, settings) {
  const current = exercises[rows[index].id];
  const candidates = catalog.filter(item => item.id !== current.id && allowed(item, options, settings)
    && (item.type === current.type || (options.purpose === 'mixed'
      && ['strength','stretch'].includes(item.type) && ['strength','stretch'].includes(current.type))));
  return candidates.map(item => {
    const row = dose(item, settings);
    if (['warm','cool'].includes(current.type)) {
      row.seconds = ['all4','kneel'].includes(item.pose) ? Math.min(45,rows[index].seconds) : rows[index].seconds;
      row.rest = rows[index].rest;
    }
    return row;
  }).filter(row => {
    const changed = rows.with(index, row);
    return fullSequence(changed) && estimate(changed) <= options.minutes * 60
      && floorChanges(changed) <= Math.max(1,floorChanges(rows));
  }).sort((a,b) => floorChanges(rows.with(index,a)) - floorChanges(rows.with(index,b))
    || Number(exercises[b.id].pose === current.pose) - Number(exercises[a.id].pose === current.pose));
}

function uniqueKeys(list, table) {
  if (!Array.isArray(list) || list.some(key => typeof key !== 'string' || !Object.hasOwn(table,key))) {
    throw new Error('バックアップの設定項目が不正です。');
  }
  return [...new Set(list)];
}

const numberBetween = (n, low, high) => Number.isInteger(n) && n >= low && n <= high;

export function validate(data) {
  if (data?.version !== 1 || !Array.isArray(data.saved) || !Array.isArray(data.history) || !data.settings) {
    throw new Error('workit のバックアップ（バージョン1）を選んでください。');
  }
  const s = data.settings;
  const adjustmentEntries = Object.entries(s.adjustments ?? {});
  if (!numberBetween(s.level, 0, 2) || !numberBetween(s.volume, 0, 100) || typeof s.voice !== 'boolean'
    || adjustmentEntries.some(([key,value]) => !Object.hasOwn(exercises,key) || !numberBetween(value,-2,2))) {
    throw new Error('バックアップの強度または音声設定が不正です。');
  }
  const settings = {
    gear: uniqueKeys(s.gear, gear), blocked: uniqueKeys(s.blocked, zones),
    excluded: uniqueKeys(s.excluded, exercises), known: uniqueKeys(s.known, exercises),
    level:s.level, volume:s.volume, voice:s.voice, adjustments:Object.fromEntries(adjustmentEntries)
  };
  const id = val => typeof val === 'string' && /^[\w-]{1,64}$/.test(val);
  const name = val => typeof val === 'string' && val.trim().length && val.length <= 100;
  const dates = val => typeof val === 'string' && Number.isFinite(Date.parse(val));
  const cleanRow = row => {
    if (!Object.hasOwn(exercises,row.id) || !numberBetween(row.rest,0,180)
      || (row.reps === undefined ? !numberBetween(row.seconds,1,600)
        : row.seconds !== undefined || !numberBetween(row.reps,1,60))) throw new Error('種目データが不正です。');
    if (exercises[row.id].sides && (row.seconds ?? row.reps) % 2) throw new Error('左右の種目データが不正です。');
    return row.reps === undefined ? {id:row.id, rest:row.rest, seconds:row.seconds} : {id:row.id, rest:row.rest, reps:row.reps};
  };
  const saved = data.saved.map(entry => {
    if (!id(entry.id) || !name(entry.name) || !Object.hasOwn(purposes,entry.options?.purpose)
      || !numberBetween(entry.options.minutes,10,40) || !Array.isArray(entry.rows)
      || entry.rows.length < 3 || entry.rows.length > 30) throw new Error('保存メニューが不正です。');
    const rows = entry.rows.map(cleanRow);
    if (estimate(rows) > entry.options.minutes*60 || !fullSequence(rows) || exercises[rows[0].id].type !== 'warm' || exercises[rows.at(-1).id].type !== 'cool'
      || rows.slice(1,-1).some(row => ['warm','cool'].includes(exercises[row.id].type))) throw new Error('保存メニューの並び順が不正です。');
    return {id:entry.id, name:entry.name, options:{
      purpose:entry.options.purpose, minutes:entry.options.minutes, poses:uniqueKeys(entry.options.poses, poses)
    }, rows};
  });
  const history = data.history.map(entry => {
    if (!id(entry.id) || !name(entry.name) || !dates(entry.date) || !numberBetween(entry.active,0,86400)
      || typeof entry.ended !== 'boolean' || !Array.isArray(entry.results) || entry.results.length > 30
      || (entry.rating !== '' && !Object.hasOwn(ratingLabels,entry.rating))) throw new Error('履歴の形式が不正です。');
    const results = entry.results.map(item => {
      const row = cleanRow(item.row);
      if (!Object.hasOwn(statusLabels,item.status) || (item.rating && !Object.hasOwn(ratingLabels,item.rating))) {
        throw new Error('履歴の種目データが不正です。');
      }
      return {row, status:item.status, rating:item.rating || ''};
    });
    return {id:entry.id, name:entry.name, date:entry.date, active:entry.active, ended:entry.ended, results, rating:entry.rating};
  });
  for (const entries of [saved,history]) {
    if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('同じ記録が複数あります。');
  }
  return {version:1, settings, saved, history};
}
