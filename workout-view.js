import {catalog, exercises, gear, phases, poses, zones} from './catalog.js?v=17';
import {curatedSource, evidence} from './evidence.js?v=17';
import {allowed, effort, sideSwitchSeconds} from './planner.js?v=19';
import {hiitExercises, hiitGroups, hiitPoses, hiitSubgroups} from './hiit-library.js?v=3';

export const exerciseTypes = {warm:'準備運動',strength:'筋力',stretch:'柔軟性',cool:'整理運動',cardio:'有酸素'};
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

const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja').trim();
const groupsByZone = {shoulder:'arms',forearm:'arms',chest:'arms',upper:'arms',core:'abs',
  hip:'legs',quad:'legs',ham:'legs',calf:'legs'};

const library = catalog.filter(item=>Object.hasOwn(curatedSource,item.id)).map(item=> {
  const hiit = hiitById[item.id];
  const group = hiit?.group ?? groupsByZone[item.load[0]] ?? 'abs';
  return {...item, target:evidence[item.id].target, hiit, group};
}).map(item=>({
  ...item,
  searchText: normalize([
    item.name, item.target, libraryPoses[item.pose], exerciseTypes[item.type], hiitGroups[item.group],
    ...item.gear.map(key=>libraryGear[key]), ...item.load.map(key=>zones[key]),
    ...(item.hiit ? [
      item.hiit.name, hiitGroups[item.hiit.group], hiitSubgroups[item.hiit.subgroup].name,
      ...item.hiit.sources.map(source=>source.title)
    ] : [])
  ].join(' '))
}));

export function filterExercises({
  query='',pose='',type='',classification='',availableOnly=false,noJump=false
}, settings) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return library.filter(item=>
    (!pose || item.pose===pose) && (!type || item.type===type)
    && (!classification || item.group===classification || item.hiit?.subgroup===classification)
    && (!noJump || !item.hiit?.jumps)
    && (!availableOnly || allowed(item,{poses:Object.keys(poses),noJump},settings))
    && terms.every(term=>item.searchText.includes(term))
  );
}
