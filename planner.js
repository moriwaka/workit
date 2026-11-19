import {catalog, exercises, poses, gear, zones, purposes, isMainType} from './catalog.js?v=17';
import {curatedSource} from './evidence.js?v=17';

export const defaultSettings = {
  gear: ['wall'], blocked: [], excluded: [], level: 0, voice: true, volume: 75, known: [], adjustments: {}
};

export const repSeconds = 4;
export const sideSwitchSeconds = 3;
const maxPlanRows = 64;
const mainTypeBits = {strength:1,stretch:2,cardio:4};
const comparisonBeamSize = 100;
export const ratingLabels = {easy:'余裕あり', okay:'ちょうどよい', hard:'きつい'};
// Keep the old overlap status readable in existing histories and backups.
export const statusLabels = {done:'完了', skipped:'スキップ', excluded:'今後も除外', pain:'痛みで停止', stopped:'中断', overlap:'負荷の重複でスキップ'};

export function allowed(exercise, options, settings) {
  return Object.hasOwn(curatedSource,exercise.id)
    && (exercise.requiredPoses ?? [exercise.pose]).every(pose=>options.poses.includes(pose))
    && (!exercise.jumps || !options.noJump)
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
    case 'cardio': return {id:exercise.id,seconds:(15 + settings.level * 5 + adjustment * 2) * (exercise.sides ? 2 : 1),rest:35 - adjustment * 3};
    case 'strength':
      if (exercise.timed) return {id:exercise.id,seconds:2 * (10 + settings.level * 2 + adjustment),rest:30 - adjustment * 3};
      return {id:exercise.id, reps:(4 + settings.level * 2 + adjustment) * (exercise.sides ? 2 : 1), rest:30 - adjustment * 3};
  }
}

export function effort(row) {
  return row.seconds ?? row.reps * repSeconds;
}

function scheduledEffort(row) {
  return effort(row) + (exercises[row.id].sides ? sideSwitchSeconds : 0);
}

export function estimate(rows) {
  return totalTime(rows,scheduledEffort);
}

function totalTime(rows, workTime) {
  return rows.reduce((total, row, index) => total + workTime(row) + (index ? row.rest : 0), 0);
}

export function setLabels(rows) {
  const totals = new Map();
  const counts = new Map();
  for (const {id} of rows) totals.set(id,(totals.get(id) ?? 0)+1);
  return rows.map(({id})=>{
    const count = (counts.get(id) ?? 0)+1;
    counts.set(id,count);
    return totals.get(id)>1 ? `${count}セット目` : '';
  });
}

const upright = new Set(['stand','standFloor','standKneel','chair']);
const floorChange = (first,second)=>Number(upright.has(first)!==upright.has(second));
const phaseOf = item => isMainType(item.type) ? 'main' : item.type;

export function selectedTrainingTypes({types,purpose}) {
  return types ?? (purpose==='mixed' ? ['strength','stretch'] : isMainType(purpose) ? [purpose] : []);
}

export function floorChanges(rows,{includePhaseBoundaries=true}={}) {
  return rows.slice(1).reduce((count,row,index) => {
    const previous = exercises[rows[index].id];
    const current = exercises[row.id];
    if (!includePhaseBoundaries && phaseOf(previous)!==phaseOf(current)) return count;
    return count + floorChange(previous.pose,current.pose);
  },0);
}

export function arrangePhasePostures(rows) {
  const ordered = ['warm','main','cool'].flatMap(phase=>rows
    .filter(({id})=>phaseOf(exercises[id])===phase)
    .sort((a,b)=>Number(upright.has(exercises[b.id].pose))-Number(upright.has(exercises[a.id].pose))));
  if (ordered.length && ordered[0]!==rows[0]) {
    // The first row has no preceding rest. Preserve the total when it moves.
    const oldFirst = ordered.indexOf(rows[0]);
    ordered[oldFirst] = {...rows[0],rest:ordered[0].rest};
    ordered[0] = {...ordered[0],rest:rows[0].rest};
  }
  return ordered;
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
  if (phase === 'warm' && firstMove?.load.includes('shoulder') && ids.includes('warm-shoulder')) {
    ids.splice(ids.indexOf('warm-shoulder'),1);
    ids.push('warm-shoulder');
  } else if (phase === 'warm' && firstMove?.load.includes('quad') && ids.includes('warm-knee')) {
    ids.splice(ids.indexOf('warm-knee'),1);
    ids.push('warm-knee');
  }
  return phaseRows(ids,phase,minutes);
}

function phaseRows(ids,phase,minutes) {
  const standard = minutes >= 20;
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

const breathingMotions = new Set(['sitBreathe','breatheBack','standingStill']);

function cooldownOrder(item) {
  if (item.id==='slow-march') return 0;
  if (breathingMotions.has(item.motion)) return 3;
  return item.held ? 2 : 1;
}

function mixPhase(rows,pool,phase,minutes,spareSeconds,spareRows) {
  const pose = exercises[rows[0].id].pose;
  for (const item of pool) {
    if (item.pose===pose) continue;
    const [extra] = phaseRows([item.id],phase,minutes);
    extra.rest = 10;
    const index = rows.findLastIndex((row,i)=>i>0 && (phase==='warm' || (item.held && exercises[row.id].held))
      && scheduledEffort(extra)-scheduledEffort(row)<=spareSeconds);
    if (index>=0) return rows.with(index,extra);
    if (spareRows && scheduledEffort(extra)+extra.rest<=spareSeconds) {
      const next = phase==='cool' ? rows.findIndex(row=>cooldownOrder(exercises[row.id])>cooldownOrder(item)) : -1;
      return rows.toSpliced(next<0 ? rows.length : next,0,extra);
    }
  }
  return rows;
}

export function generate(options, settings, random = Math.random) {
  const selected = selectedTrainingTypes(options);
  if (!selected.length) return null;
  const pool = catalog.filter(item => allowed(item, options, settings));
  const warm = pool.filter(item => item.type === 'warm');
  const cool = pool.filter(item => item.type === 'cool');
  const main = pool.filter(item => isMainType(item.type) && selected.includes(item.type));
  if (!warm.length || !cool.length || !main.length) return null;

  const seconds = options.minutes * 60;
  const byId = (items, key) => Object.fromEntries(items.map(item=>[item.id,
    phasePlan(key==='warm' ? warm : cool,item.pose,key,options.minutes,item)]));
  const openings = byId(main,'warm');
  const closings = byId(main,'cool');
  const warmTimes = Object.fromEntries(main.map(item=>[item.id,estimate(openings[item.id])]));
  const coolTimes = Object.fromEntries(main.map(item=>[item.id,estimate(closings[item.id])+10]));
  const extended = options.minutes >= 30;
  const maxRepeats = extended ? 3 : 2;
  const maxRounds = extended ? Math.min(maxPlanRows,main.length*maxRepeats) : 16;
  const moves = main.map((item,index)=> {
    const row = dose(item,settings);
    return {
      item,index,row,priority:random(),time:scheduledEffort(row)+row.rest,
      opening:openings[item.id],closing:closings[item.id],
      warmTime:warmTimes[item.id],coolTime:coolTimes[item.id]
    };
  });

  function compare(a,b) {
    return b.typeCount - a.typeCount
      || b.length - a.length
      || b.distinct - a.distinct
      || a.floorChanges - b.floorChanges
      || a.poseChanges - b.poseChanges
      || (extended ? b.total - a.total : 0)
      || b.preference - a.preference;
  }

  function compareFinished(a,b) {
    if (!extended) return compare(a,b);
    return b.typeCount-a.typeCount || b.total-a.total || compare(a,b);
  }

  let beam = [{rows:[], counts:new Uint8Array(moves.length), distinct:0, types:0, typeCount:0, time:0,
    floorChanges:0, poseChanges:0, preference:0}];
  let best = null;
  for (let round = 0; round < maxRounds && beam.length; round++) {
    const expanded = [];
    for (const candidate of beam) {
      for (const move of moves) {
        const {item,index,closing,coolTime} = move;
        const repetitions = candidate.counts[index];
        if (repetitions>=maxRepeats) continue;
        const first = candidate.first ?? move;
        const {opening,warmTime} = first;
        const time = candidate.time+move.time;
        const total = time+warmTime+coolTime;
        const length = candidate.rows.length+1;
        if (!opening.length || !closing.length || total>seconds || length+opening.length+closing.length>maxPlanRows) continue;
        const lastPose = candidate.lastPose ?? item.pose;
        const standingFloorChanges = candidate.floorChanges+floorChange(lastPose,item.pose);
        if (standingFloorChanges > 1) continue;
        expanded.push({
          parent:candidate,move,first,lastPose:item.pose,length,
          distinct:candidate.distinct+Number(repetitions===0),
          types:candidate.types|mainTypeBits[item.type],
          typeCount:candidate.typeCount+Number(!(candidate.types & mainTypeBits[item.type])),
          time,total,opening,closing,
          floorChanges:standingFloorChanges,
          poseChanges:candidate.poseChanges + Number(lastPose !== item.pose),
          preference:candidate.preference+move.priority
        });
      }
    }
    expanded.sort(compare);
    // Build full row lists only for the candidates that survive this round.
    beam = expanded.slice(0,comparisonBeamSize).map(({parent,move,...score})=> {
      const counts = parent.counts.slice();
      counts[move.index]++;
      return {...score,counts,rows:[...parent.rows,move.row]};
    });
    for (const candidate of beam) {
      if (!best || compareFinished(candidate,best)<0) best = candidate;
    }
  }
  if (!best) return null;

  const {opening,closing} = best;
  const spareSeconds = seconds-best.total;
  const spareRows = maxPlanRows-best.rows.length-opening.length-closing.length;
  const mixedOpening = mixPhase(opening,warm,'warm',options.minutes,spareSeconds,spareRows);
  const mixedClosing = mixPhase(closing,cool,'cool',options.minutes,
    spareSeconds+estimate(opening)-estimate(mixedOpening),spareRows+opening.length-mixedOpening.length);
  return arrangePhasePostures([...mixedOpening,...best.rows.map(row=>({...row})),...mixedClosing]);
}

export const menuMinutes = [10,15,20,30,40];

function mainTypes(rows) {
  return new Set(rows?.map(row=>exercises[row.id].type).filter(isMainType));
}

export function explainPlan(options, settings, rows) {
  const time = rows ? estimate(rows) : 0;
  const selected = selectedTrainingTypes(options);
  const gap = options.minutes*60-time;
  if (!selected.length) return {reason:'types',gap,time,missing:[],eligibleMain:0,suggestions:[]};
  const types = mainTypes(rows);
  const missing = selected.filter(type=>!types.has(type));
  if (rows && gap<=75 && !missing.length) return null;

  const eligible = catalog.filter(item=>allowed(item,options,settings));
  const eligibleMain = eligible.filter(item=>isMainType(item.type) && selected.includes(item.type));
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
    for (const type of Object.keys(mainTypeBits)) {
      if (selected.length!==1 || selected[0]!==type) tryOption({types:[type]},'type',type);
    }
  }
  suggestions.sort((a,b)=>Number(b.addsType)-Number(a.addsType)
    || (options.minutes*60-a.time<0) - (options.minutes*60-b.time<0)
    || Math.abs(options.minutes*60-a.time)-Math.abs(options.minutes*60-b.time));
  return {reason,gap,time,missing,eligibleMain:eligibleMain.length,suggestions:suggestions.slice(0,3)};
}

export function alternatives(rows, index, options, settings) {
  const current = exercises[rows[index].id];
  const selected = selectedTrainingTypes(options);
  const candidates = catalog.filter(item => item.id !== current.id && allowed(item, options, settings)
    && (item.type === current.type || (selected.includes(item.type) && selected.includes(current.type))))
    .filter(item => !['warm','cool'].includes(current.type)
      || (Boolean(current.held)===Boolean(item.held) && !rows.some(row=>row.id===item.id)));
  return candidates.map(item => {
    const row = dose(item, settings);
    if (['warm','cool'].includes(current.type)) {
      if (item.held) row.seconds = (options.minutes>=20 ? 20 : 15) * (item.sides ? 2 : 1);
      else row.seconds = Math.min(item.pose==='all4' ? 35 : 90,rows[index].seconds);
      if (item.sides) row.seconds = Math.max(2,row.seconds - row.seconds % 2);
      row.rest = rows[index].rest;
    }
    return row;
  }).filter(row => estimate(rows.with(index,row)) <= options.minutes * 60)
    .sort((a,b) => Number(exercises[b.id].pose === current.pose) - Number(exercises[a.id].pose === current.pose));
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
    if (!id(entry.id) || !name(entry.name)
      || !numberBetween(entry.options?.minutes,10,40) || !Array.isArray(entry.rows)
      || entry.rows.length < 3 || entry.rows.length > maxPlanRows) throw new Error('保存メニューが不正です。');
    const rows = entry.rows.map(cleanRow);
    const order = rows.map(row=>({warm:0,strength:1,stretch:1,cardio:1,cool:2})[exercises[row.id].type]);
    // Older menus used the same format and did not budget for side switches.
    if (totalTime(rows,effort) > entry.options.minutes*60 || order[0]!==0 || order.at(-1)!==2
      || !order.includes(1) || order.some((phase,index)=>index>0 && phase<order[index-1])) {
      throw new Error('保存メニューの並び順が不正です。');
    }
    const {purpose,types,minutes,noJump} = entry.options;
    const selection = types===undefined ? {purpose} : {types:uniqueKeys(types,mainTypeBits)};
    if (types===undefined ? typeof purpose!=='string' || !Object.hasOwn(purposes,purpose) : !selection.types.length) {
      throw new Error('保存メニューの運動の種類が不正です。');
    }
    if (noJump!==undefined && typeof noJump!=='boolean') {
      throw new Error('保存メニューのジャンプ設定が不正です。');
    }
    return {id:entry.id, name:entry.name, options:{
      ...selection, minutes, poses:uniqueKeys(entry.options.poses,poses),
      ...(noJump===undefined ? {} : {noJump})
    }, rows};
  });
  const history = data.history.map(entry => {
    if (!id(entry.id) || !name(entry.name) || !dates(entry.date) || !numberBetween(entry.active,0,86400)
      || typeof entry.ended !== 'boolean' || !Array.isArray(entry.results) || entry.results.length > maxPlanRows
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
