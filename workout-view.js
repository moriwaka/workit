import {catalog, exercises, gear, phases, poses, zones} from './catalog.js?v=16';
import {curatedSource, evidence} from './evidence.js?v=16';
import {allowed, effort, sideSwitchSeconds} from './planner.js?v=18';
import {hiitExercises, hiitGroups, hiitPoses, hiitSubgroups} from './hiit-library.js?v=2';

export const exerciseTypes = {warm:'準備運動',strength:'筋力',stretch:'柔軟性',cool:'整理運動',cardio:'有酸素'};
export const libraryPoses = {...poses,...hiitPoses};
export const libraryGear = {...gear,chair:'安定した椅子・ソファ'};
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

const library = [
  ...catalog.filter(item=>Object.hasOwn(curatedSource,item.id)).map(item=>({
    ...item, supportsGuide:true, target:evidence[item.id].target, hiit:hiitById[item.id]
  })),
  ...hiitExercises.filter(item=>!item.supportsGuide).map(item=>({
    ...item, hiit:item
  }))
].map(item=>({
  ...item,
  searchText: normalize([
    item.name, item.target, libraryPoses[item.pose], exerciseTypes[item.type],
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
    && (!classification || item.hiit?.group===classification || item.hiit?.subgroup===classification)
    && (!noJump || !item.hiit?.jumps)
    && (!availableOnly || (item.supportsGuide && allowed(item,{poses:Object.keys(poses)},settings)))
    && terms.every(term=>item.searchText.includes(term))
  );
}
