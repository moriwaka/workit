import {catalog, exercises, gear, phases, poses, zones} from './catalog.js?v=17';
import {curatedSource, evidence} from './evidence.js?v=17';
import {allowed, effort, sideSwitchSeconds} from './planner.js?v=23';
import {hiitExercises, hiitGroups, hiitPoses, hiitSubgroups} from './hiit-library.js?v=3';

export function latestExerciseResults(history) {
  const latest = new Map();
  for (const entry of history) {
    const timestamp = Date.parse(entry.date);
    for (const result of entry.results) {
      const {id} = result.row;
      const previous = latest.get(id);
      if (!previous || timestamp >= previous.timestamp) {
        latest.set(id,{result,timestamp});
      }
    }
  }
  return latest;
}

export function weeklyActivity(history, now = new Date()) {
  const start = new Date(now);
  start.setHours(0,0,0,0);
  start.setDate(start.getDate() - (start.getDay()+6)%7);
  const end = new Date(start);
  end.setDate(end.getDate()+7);
  const days = new Set();
  let seconds = 0;
  for (const entry of history) {
    const date = new Date(entry.date);
    if (date < start || date >= end || entry.active <= 0) continue;
    days.add(date.getDay());
    seconds += entry.active;
  }
  return {days:days.size,seconds};
}

export const exerciseTypes = {warm:'準備運動',strength:'筋力',stretch:'柔軟性',cool:'整理運動',cardio:'有酸素'};
export const trainingTypes = {strength:exerciseTypes.strength,stretch:exerciseTypes.stretch,cardio:exerciseTypes.cardio};
export const libraryPoses = {...poses,...hiitPoses};
export const libraryGear = gear;
export const defaultLibraryFilters = {query:'',pose:'',type:'',classification:'',availableOnly:false,noJump:false};
export const hiitById = Object.fromEntries(hiitExercises.map(item=>[item.id,item]));

export function workoutBreakdown(rows) {
  const blocks = Object.keys(phases).map(phase=>({phase,seconds:0,count:0}));
  for (const [index,row] of rows.entries()) {
    const item = exercises[row.id];
    const phase = ['warm','cool'].includes(item.type) ? item.type : 'main';
    const block = blocks.find(block=>block.phase===phase);
    block.seconds += effort(row) + (item.sides ? sideSwitchSeconds : 0) + (index ? row.rest : 0);
    block.count++;
  }
  const total = blocks.reduce((sum,block)=>sum+block.seconds,0);
  return blocks.filter(block=>block.count).map(block=>({...block,percent:block.seconds/total*100}));
}

const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja')
  .replace(/[ァ-ヶ]/g, kana=>String.fromCharCode(kana.charCodeAt(0) - 0x60)).trim();
const groupsByZone = {shoulder:'arms',forearm:'arms',chest:'arms',upper:'arms',core:'abs',
  hip:'legs',quad:'legs',ham:'legs',calf:'legs'};

// These catalog IDs preserve the cooldown role and timing of the same movement.
const cooldownByMovement = {
  'calf-stretch':'cool-calf', 'side-bend':'cool-side', 'sit-ham':'cool-sit-ham',
  'sit-hips':'cool-sit-hip', 'back-ham':'cool-back-ham'
};
const mergedIds = new Set(Object.values(cooldownByMovement));
const library = new Map(catalog.filter(item=>Object.hasOwn(curatedSource,item.id) && !mergedIds.has(item.id)).map(item=> {
  const hiit = hiitById[item.id];
  const group = hiit?.group ?? groupsByZone[item.load[0]] ?? 'abs';
  const cooldown = exercises[cooldownByMovement[item.id]];
  const variants = cooldown ? [item,cooldown] : [item];
  const types = variants.map(variant=>variant.type);
  const target = evidence[item.id].target;
  const searchText = normalize([
    item.name, target, libraryPoses[item.pose], ...types.map(type=>trainingTypes[type]), hiitGroups[group],
    item.gear.length ? item.gear.map(key=>libraryGear[key]).join(' ') : '道具なし',
    ...item.load.map(key=>zones[key]),
    ...(hiit ? [
      hiit.name, hiitGroups[hiit.group], hiitSubgroups[hiit.subgroup].name,
      ...hiit.sources.map(source=>source.title)
    ] : [])
  ].join(' '));
  return [item.id,{...item,steps:cooldown?.steps ?? item.steps,types,variants,target,hiit,group,searchText}];
}));

export const libraryExercise = id => library.get(id);

export function filterExercises({
  query='',pose='',type='',classification='',availableOnly=false,noJump=false
}, settings) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const matches = [...library.values()].filter(item=>
    (!pose || item.pose===pose) && (!type || item.types.includes(type))
    && (!classification || item.group===classification || item.hiit?.subgroup===classification)
    && (!noJump || !item.jumps)
    && terms.every(term=>item.searchText.includes(term))
  );
  const options = {poses:Object.keys(poses),noJump};
  return matches.map(item=>({...item,available:item.variants.some(variant=>
    (!type || variant.type===type) && allowed(variant,options,settings)
  )})).filter(item=>!availableOnly || item.available);
}
