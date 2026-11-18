import assert from 'node:assert/strict';
import test from 'node:test';
import {exercises} from '../catalog.js?v=16';
import {curatedSource} from '../evidence.js?v=16';
import {allowed, defaultSettings, estimate} from '../planner.js?v=18';
import {filterExercises, workoutBreakdown} from '../workout-view.js?v=1';

test('workout breakdown includes rests and side transitions exactly once', () => {
  const rows = [{id:'march',seconds:45,rest:12},
    {id:'side-bend',seconds:30,rest:25},{id:'calf',reps:4,rest:30},
    {id:'slow-march',seconds:45,rest:10}];
  const phases = workoutBreakdown(rows);
  assert.deepEqual(phases.map(({phase,seconds,count})=>({phase,seconds,count})),[
    {phase:'warm',seconds:45,count:1},{phase:'main',seconds:104,count:2},
    {phase:'cool',seconds:55,count:1}
  ]);
  assert.equal(phases.reduce((total,phase)=>total+phase.seconds,0),estimate(rows));
  assert.ok(Math.abs(phases.reduce((total,phase)=>total+phase.percent,0)-100)<1e-10);
});

test('empty and partial workouts have no empty phase blocks', () => {
  assert.deepEqual(workoutBreakdown([]),[]);
  assert.deepEqual(workoutBreakdown([{id:'calf',reps:4,rest:30}]),[
    {phase:'main',seconds:16,count:1,percent:100}
  ]);
});

test('library only displays source-checked exercises', () => {
  const all = filterExercises({availableOnly:false},defaultSettings);
  assert.equal(all.length,Object.keys(curatedSource).length);
  assert.ok(all.every(item=>Object.hasOwn(curatedSource,item.id)));
});

test('library search normalizes half-width characters and whitespace', () => {
  const matches = filterExercises({query:'  ｽｸﾜｯﾄ  ',availableOnly:false},defaultSettings);
  assert.ok(matches.some(item=>item.id==='squat'));
  assert.deepEqual(filterExercises({query:'該当しない検索語'},defaultSettings),[]);
});

test('library combines posture, exercise type, and available settings', () => {
  const settings = {...defaultSettings,gear:[],blocked:['shoulder']};
  const matches = filterExercises({pose:'stand',type:'strength',availableOnly:true},settings);
  assert.ok(matches.length);
  assert.ok(matches.every(item=>item.pose==='stand' && item.type==='strength'
    && allowed(item,{poses:['stand']},settings)));
  assert.ok(!matches.some(item=>item.id==='wall-push'));
  const all = filterExercises({pose:'stand',type:'strength',availableOnly:false},settings);
  assert.ok(all.some(item=>item.id==='wall-push'));
});

test('library can be searched by equipment and target region', () => {
  const matches = filterExercises({query:'踏み台',availableOnly:false},defaultSettings);
  assert.ok(matches.some(item=>item.id==='step-up'));
  assert.ok(filterExercises({query:'太もも',availableOnly:false},defaultSettings)
    .some(item=>exercises[item.id].load.includes('quad')));
});
