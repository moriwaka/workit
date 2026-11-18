import {catalog, exercises, gear, phases, poses, zones} from './catalog.js?v=16';
import {curatedSource, evidence} from './evidence.js?v=16';
import {allowed, effort, sideSwitchSeconds} from './planner.js?v=18';

export const exerciseTypes = {warm:'準備運動',strength:'筋力',stretch:'柔軟性',cool:'整理運動'};

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

export function filterExercises({query='',pose='',type='',availableOnly=true}, settings) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return catalog.filter(item=> {
    if (!Object.hasOwn(curatedSource,item.id) || (pose && item.pose!==pose) || (type && item.type!==type)) return false;
    if (availableOnly && !allowed(item,{poses:Object.keys(poses)},settings)) return false;
    const text = normalize([item.name,evidence[item.id].target,poses[item.pose],exerciseTypes[item.type],
      ...item.gear.map(key=>gear[key]),...item.load.map(key=>zones[key])].join(' '));
    return terms.every(term=>text.includes(term));
  });
}
