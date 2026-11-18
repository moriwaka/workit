import assert from 'node:assert/strict';
import test from 'node:test';
import {exercises, zones} from '../catalog.js?v=16';
import {curatedSource} from '../evidence.js?v=16';
import {allowed, defaultSettings, estimate} from '../planner.js?v=18';
import {hiitDifficulty, hiitExercises, hiitSubgroups} from '../hiit-library.js?v=2';
import {filterExercises, libraryGear, libraryPoses, workoutBreakdown} from '../workout-view.js?v=3';

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
  const guided = all.filter(item=>item.supportsGuide);
  assert.equal(guided.length,Object.keys(curatedSource).length);
  assert.ok(guided.every(item=>Object.hasOwn(curatedSource,item.id)));
  assert.ok(all.every(item=>item.supportsGuide || item.sources.length));
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
    .some(item=>item.load.includes('quad')));
});

test('all HIIT Builder source pages are represented once, including merged duplicates', () => {
  const totals = Object.fromEntries(['arms','abs','legs','cardio'].map(group=>[group,0]));
  const sourceUrls = new Set();
  const itemIds = new Set();
  for (const item of hiitExercises) {
    assert.ok(!itemIds.has(item.id),item.id);
    itemIds.add(item.id);
    assert.equal(hiitSubgroups[item.subgroup].group,item.group);
    assert.ok(Object.hasOwn(libraryPoses,item.pose));
    assert.ok(Object.hasOwn(hiitDifficulty,item.difficulty));
    assert.ok(item.load.length && item.load.every(key=>Object.hasOwn(zones,key)));
    assert.ok(item.gear.every(key=>Object.hasOwn(libraryGear,key)));
    assert.ok(item.summary.length && item.sources.length);
    assert.equal(item.supportsGuide,Object.hasOwn(exercises,item.id));
    for (const {url} of item.sources) {
      assert.match(url,/^https:\/\/hiitbuilder\.app\/moves\/[a-z0-9-]+\/$/);
      assert.ok(!sourceUrls.has(url),url);
      sourceUrls.add(url);
      totals[item.group]++;
    }
  }
  assert.deepEqual(totals,{arms:35,abs:60,legs:64,cardio:71});
  assert.equal(filterExercises({},defaultSettings).length,Object.keys(curatedSource).length+224);
});

test('calf raises and two-leg glute bridges reuse their existing library and guide entries', () => {
  const search = query=>filterExercises({query,classification:'legs'},defaultSettings);
  assert.deepEqual(search('自重カーフレイズ').map(item=>item.id),['calf']);
  assert.deepEqual(search('Glute bridges both legs').map(item=>item.id),['bridge']);
  assert.deepEqual(search('自重カーフレイズ')[0].gear,['wall']);
  assert.equal(search('Glute bridges both legs')[0].supportsGuide,true);
  assert.ok(search('片脚グルートブリッジ').some(item=>item.id==='hiit-right-leg-glute-bridge'));
  assert.ok(search('エアスクワット').some(item=>item.id==='hiit-air-squats'));
});

test('HIIT categories, subtitles, English aliases, and restrictions compose', () => {
  const search = filters=>filterExercises(filters,defaultSettings);
  const jumpFree = search({classification:'burpees',type:'cardio',pose:'standFloor',noJump:true});
  assert.deepEqual(jumpFree.map(item=>item.id),[
    'hiit-step-back-burpees','hiit-step-back-burpee-punches'
  ]);
  assert.equal(search({query:'standing jacks',classification:'cardio'})[0].id,
    search({query:'step jacks',classification:'jacks'})[0].id);
  assert.deepEqual(search({classification:'abs',query:'deadbugs'}).map(item=>item.id),['dead-bug']);
  assert.equal(search({classification:'abs',query:'bird dogs'})[0].id,'bird');
  assert.deepEqual(search({classification:'cardio',availableOnly:true}),[]);
  assert.deepEqual(search({query:'トライセプス 椅子'}).map(item=>item.id),['hiit-tricep-dips-on-couch']);
});
