import {catalog, exercises, poses, gear, zones, purposes} from './catalog.js?v=11';
import {curatedSource} from './evidence.js?v=11';

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
    case 'strength':
      if (exercise.timed) return {id:exercise.id,seconds:2 * (10 + settings.level * 2 + adjustment),rest:30 - adjustment * 3};
      return {id:exercise.id, reps:(4 + settings.level * 2 + adjustment) * (exercise.sides ? 2 : 1), rest:30 - adjustment * 3};
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

const phaseExercises = {
  stand:{warm:['march','warm-heel','warm-knee','warm-shoulder','warm-elbow'],cool:['slow-march','cool-calf','cool-side','cool-stand-breath']},
  sit:{warm:['sit-ankles','warm-sit-hip','warm-sit-wrist'],cool:['cool-sit-ankles','cool-sit-ham','cool-sit-hip','sit-breathe']},
  back:{warm:['heel-slide','warm-pelvic'],cool:['cool-slide','cool-back-ham','back-breathe']},
  all4:{warm:['rock-warm'],cool:['rock-cool']},
  side:{warm:['warm-side-clam'],cool:['cool-side-clam']}
};

function phasePlan(pool, targetPose, phase, minutes, firstMove) {
  const candidatePoses = [targetPose,...Object.keys(poses).filter(pose=>pose!==targetPose
    && !floorChange(targetPose,pose)),...Object.keys(poses).filter(pose=>floorChange(targetPose,pose))];
  const available = new Set(pool.map(item=>item.id));
  const ids = candidatePoses.map(pose=>phaseExercises[pose]?.[phase].filter(id=>available.has(id)) ?? [])
    .find(items=>items.length);
  if (!ids) return [];
  if (ids.includes('march') && ids.includes('warm-elbow')) ids.splice(ids.indexOf('warm-elbow'),1);
  if (ids.includes('slow-march') && ids.includes('cool-stand-breath')) ids.splice(ids.indexOf('cool-stand-breath'),1);
  if (ids.includes('sit-ankles') && ids.includes('warm-sit-wrist')) ids.splice(ids.indexOf('warm-sit-wrist'),1);
  const standard = minutes >= 20;
  if (phase === 'warm' && firstMove?.load.includes('shoulder') && ids.includes('warm-shoulder')) {
    ids.splice(ids.indexOf('warm-shoulder'),1);
    ids.push('warm-shoulder');
  } else if (phase === 'warm' && firstMove?.load.includes('quad') && ids.includes('warm-knee')) {
    ids.splice(ids.indexOf('warm-knee'),1);
    ids.push('warm-knee');
  }
  return ids.map((id,index)=>{
    const item = exercises[id];
    let seconds;
    if (item.held) seconds = (standard ? 20 : 15) * (item.sides ? 2 : 1);
    else if (id === 'march') seconds = standard ? 150 : 90;
    else if (id === 'slow-march') seconds = standard ? 225 : 90;
    else if (item.pose === 'stand') seconds = standard ? (id === 'warm-heel' ? 60 : 45) : 30;
    else if (item.pose === 'all4') seconds = 35;
    else seconds = standard ? 60 : 40;
    return {id,seconds,rest:phase==='warm' && index===0 ? 0 : 10};
  });
}

export function generate(options, settings, random = Math.random) {
  const pool = catalog.filter(item => allowed(item, options, settings));
  const warm = pool.filter(item => item.type === 'warm');
  const cool = pool.filter(item => item.type === 'cool');
  const main = pool.filter(item => ['strength','stretch'].includes(item.type)
    && (options.purpose === 'mixed' || options.purpose === item.type));
  if (!warm.length || !cool.length || !main.length) return null;

  const seconds = options.minutes * 60;
  const byId = (items, key) => Object.fromEntries(items.map(item=>[item.id,
    phasePlan(key==='warm' ? warm : cool,item.pose,key,options.minutes,item)]));
  const openings = byId(main,'warm');
  const closings = byId(main,'cool');
  const warmTimes = Object.fromEntries(main.map(item=>[item.id,estimate(openings[item.id])]));
  const coolTimes = Object.fromEntries(main.map(item=>[item.id,estimate(closings[item.id])+10]));
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
        const firstId = candidate.rows[0]?.id ?? item.id;
        const firstPose = exercises[firstId].pose;
        const opening = openings[firstId];
        const closing = closings[item.id];
        if (!opening.length || !closing.length || time + warmTimes[firstId] + coolTimes[item.id] > seconds) continue;
        const warmPose = exercises[opening.at(-1).id].pose;
        const coolPose = exercises[closing[0].id].pose;
        const lastPose = last ? exercises[last.id].pose : item.pose;
        const mainFloorChanges = candidate.mainFloorChanges + floorChange(lastPose,item.pose);
        const standingFloorChanges = mainFloorChanges + floorChange(warmPose,firstPose) + floorChange(item.pose,coolPose);
        if (standingFloorChanges > 1) continue;
        const mainPoseChanges = candidate.mainPoseChanges + Number(lastPose !== item.pose);
        expanded.push({
          rows:[...candidate.rows,row], used:new Set([...candidate.used,item.id]),
          types:new Set([...candidate.types,item.type]), time, opening, closing,
          mainFloorChanges, mainPoseChanges,
          floorChanges:standingFloorChanges,
          poseChanges:mainPoseChanges + Number(warmPose !== firstPose) + Number(item.pose !== coolPose),
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
  return [...opening,...best.rows,...closing];
}

export const menuMinutes = [10,15,20,30,40];

function mainTypes(rows) {
  return new Set(rows?.map(row=>exercises[row.id].type).filter(type=>['strength','stretch'].includes(type)));
}

export function explainPlan(options, settings, rows) {
  const time = rows ? estimate(rows) : 0;
  const types = mainTypes(rows);
  const missing = options.purpose==='mixed' ? ['strength','stretch'].filter(type=>!types.has(type)) : [];
  const gap = options.minutes*60-time;
  if (rows && gap<=75 && !missing.length) return null;

  const eligible = catalog.filter(item=>allowed(item,options,settings));
  const eligibleMain = eligible.filter(item=>['strength','stretch'].includes(item.type)
    && (options.purpose==='mixed' || item.type===options.purpose));
  const eligibleTypes = new Set(eligibleMain.map(item=>item.type));
  const reason = !options.poses.length ? 'poses'
    : !eligibleMain.length ? 'main'
    : !eligible.some(item=>item.type==='warm') ? 'warm'
    : !eligible.some(item=>item.type==='cool') ? 'cool'
    : missing.some(type=>!eligibleTypes.has(type)) ? 'type'
    : rows ? 'sequence' : 'fit';

  const suggestions = [];
  const tryOption = (change, kind, value) => {
    const next = {...options,...change};
    const candidate = generate(next,settings,()=>0);
    if (!candidate) return;
    const duration = estimate(candidate);
    const nextTypes = mainTypes(candidate);
    const addsType = missing.some(type=>nextTypes.has(type)) && [...types].every(type=>nextTypes.has(type));
    const keepsTypes = [...types].every(type=>nextTypes.has(type));
    const fitsBetter = next.minutes*60-duration < gap
      && (kind==='time' ? next.minutes*60-duration<=75 : duration>=time);
    if (!rows || addsType || (keepsTypes && (fitsBetter || duration >= time+45))) {
      suggestions.push({kind,value,options:next,rows:candidate,time:duration,addsType});
    }
  };

  for (const pose of Object.keys(phaseExercises)) {
    if (!options.poses.includes(pose)) tryOption({poses:[...options.poses,pose]},'pose',pose);
  }
  if (rows && gap>75) {
    const shorter = menuMinutes.find(minutes=>minutes<options.minutes && minutes*60>=time-75);
    if (shorter) tryOption({minutes:shorter},'time',shorter);
  } else if (!rows && options.minutes<40) {
    for (const longer of menuMinutes.filter(minutes=>minutes>options.minutes)) {
      tryOption({minutes:longer},'time',longer);
      if (suggestions.some(item=>item.kind==='time')) break;
    }
  }
  if (!rows && options.poses.length) {
    for (const purpose of Object.keys(purposes)) {
      if (purpose!==options.purpose) tryOption({purpose},'purpose',purpose);
    }
  }
  suggestions.sort((a,b)=>Number(b.addsType)-Number(a.addsType)
    || (options.minutes*60-a.time<0) - (options.minutes*60-b.time<0)
    || Math.abs(options.minutes*60-a.time)-Math.abs(options.minutes*60-b.time));
  return {reason,gap,time,missing,eligibleMain:eligibleMain.length,suggestions:suggestions.slice(0,3)};
}

export function alternatives(rows, index, options, settings) {
  const current = exercises[rows[index].id];
  const candidates = catalog.filter(item => item.id !== current.id && allowed(item, options, settings)
    && (item.type === current.type || (options.purpose === 'mixed'
      && ['strength','stretch'].includes(item.type) && ['strength','stretch'].includes(current.type))))
    .filter(item => !['warm','cool'].includes(current.type)
      || (Boolean(current.held)===Boolean(item.held) && !rows.some(row=>row.id===item.id)));
  return candidates.map(item => {
    const row = dose(item, settings);
    if (['warm','cool'].includes(current.type)) {
      if (item.held) row.seconds = (options.minutes>=20 ? 20 : 15) * (item.sides ? 2 : 1);
      else row.seconds = Math.min(item.pose==='all4' ? 35 : 90,rows[index].seconds);
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
    const order = rows.map(row=>({warm:0,strength:1,stretch:1,cool:2})[exercises[row.id].type]);
    if (estimate(rows) > entry.options.minutes*60 || !fullSequence(rows) || order[0]!==0 || order.at(-1)!==2
      || !order.includes(1) || order.some((phase,index)=>index>0 && phase<order[index-1])) {
      throw new Error('保存メニューの並び順が不正です。');
    }
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
