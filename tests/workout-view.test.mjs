import assert from 'node:assert/strict';
import test from 'node:test';
import {exercises, frames, levels, zones} from '../catalog.js?v=17';
import {curatedSource, evidence, references} from '../evidence.js?v=17';
import {allowed, alternatives, defaultSettings, estimate, generate, validate} from '../planner.js?v=20';
import {hiitExercises, hiitSubgroups} from '../hiit-library.js?v=3';
import {filterExercises, libraryExercise, libraryGear, libraryPoses, libraryTypes, workoutBreakdown} from '../workout-view.js?v=8';

test('verified HIIT exercises generate timed cardio rows and survive backup restore', () => {
  const exercise = exercises['hiit-standing-jacks-low-impact'];
  assert.ok(exercise?.diagram.stages.length);
  const options = {purpose:'cardio',minutes:10,poses:['stand'],noJump:true};
  const settings = {...defaultSettings,level:1};
  assert.ok(allowed(exercise,options,settings));
  const rows = generate(options,settings,()=>0);
  assert.ok(rows.some(row=>exercises[row.id].type==='cardio' && row.seconds));
  assert.ok(rows.every(row=>!exercises[row.id].jumps));
  const saved = [{id:'test-hiit',name:'HIIT',rows,options}];
  assert.deepEqual(validate({version:1,settings,saved,history:[]}).saved,saved);
  const main = rows.findIndex(row=>exercises[row.id].type==='cardio');
  assert.ok(alternatives(rows,main,options,settings).some(row=>exercises[row.id].type==='cardio'));
  assert.ok(!allowed(exercises['hiit-jumping-jacks'],options,settings));
  assert.ok(allowed(exercises['hiit-jumping-jacks'],{...options,noJump:false},settings));
});

test('movement requirements apply to all library entries and the exercise both starts and ends upright', () => {
  const stepBack = exercises['hiit-step-back-burpees'];
  const settings = {...defaultSettings,level:2};
  assert.ok(!allowed(stepBack,{poses:['stand'],noJump:true},settings));
  assert.ok(!allowed(stepBack,{poses:['plank'],noJump:true},settings));
  assert.ok(allowed(stepBack,{poses:['stand','plank'],noJump:true},settings));
  assert.deepEqual(frames(stepBack)[0],frames(stepBack).at(-1));
  const dip = exercises['hiit-tricep-dips-on-couch'];
  assert.ok(!allowed(dip,{poses:['stand']},settings));
  assert.ok(allowed(dip,{poses:['stand']},{...settings,gear:['chair']}));
});

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
  const variantIds = all.flatMap(item=>item.variants.map(variant=>variant.id));
  assert.deepEqual(variantIds.sort(),Object.keys(curatedSource).sort());
  assert.ok(variantIds.every(id=>Object.hasOwn(exercises,id)));
  assert.equal(new Set(all.map(item=>item.name)).size,all.length);
});

test('shared stretches appear once under either use while retaining phase-specific availability', () => {
  for (const [id,cooldownId] of [
    ['calf-stretch','cool-calf'],['side-bend','cool-side'],['sit-ham','cool-sit-ham'],
    ['sit-hips','cool-sit-hip'],['back-ham','cool-back-ham']
  ]) {
    const item = libraryExercise(id);
    const {name:query} = item;
    assert.equal(exercises[cooldownId].name,query);
    assert.deepEqual(frames(exercises[cooldownId]),frames(exercises[id]));
    assert.deepEqual(item.types,['stretch','cool']);
    assert.deepEqual(item.steps,exercises[cooldownId].steps);
    for (const type of ['', 'stretch', 'cool']) {
      assert.deepEqual(filterExercises({query,type},defaultSettings).map(move=>move.id),[id]);
    }
    const settings = {...defaultSettings,excluded:[cooldownId]};
    assert.equal(filterExercises({query,availableOnly:true},settings).length,1);
    assert.equal(filterExercises({query,type:'cool',availableOnly:true},settings).length,0);
    assert.equal(filterExercises({query,type:'cool'},settings)[0].available,false);
  }
  assert.deepEqual(libraryExercise('warm-sit-hip').types,['warm']);
  assert.notEqual(libraryExercise('warm-sit-hip').name,libraryExercise('sit-hips').name);
});

test('existing cooldown IDs survive backup restore in plans and history', () => {
  const row = {id:'cool-calf',seconds:30,rest:10};
  const saved = [{id:'saved-stretch',name:'柔軟性',options:{purpose:'stretch',minutes:10,poses:['stand']},
    rows:[{id:'march',seconds:30,rest:0},{id:'side-bend',seconds:30,rest:10},row]}];
  const history = [{id:'history-stretch',name:'柔軟性',date:'2026-01-01T00:00:00.000Z',active:30,ended:false,
    rating:'',results:[{row,status:'done',rating:''}]}];
  const restored = validate({version:1,settings:defaultSettings,saved,history});
  assert.deepEqual(restored.saved,saved);
  assert.deepEqual(restored.history,history);
});

test('library search normalizes kana, half-width characters, and whitespace', () => {
  const matches = filterExercises({query:'  ｽｸﾜｯﾄ  ',availableOnly:false},defaultSettings);
  assert.ok(matches.some(item=>item.id==='squat'));
  assert.deepEqual(filterExercises({query:'すくわっと'},defaultSettings),matches);
  assert.deepEqual(filterExercises({query:'該当しない検索語'},defaultSettings),[]);
});

test('library search offers movement types and finds phase exercises by movement', () => {
  assert.deepEqual(Object.keys(libraryTypes),['strength','stretch','cardio']);
  assert.ok(filterExercises({query:'足踏み'},defaultSettings).some(item=>item.id==='march'));
  assert.ok(filterExercises({query:'呼吸'},defaultSettings).some(item=>item.id==='sit-breathe'));
  for (const query of ['準備運動','整理運動']) {
    assert.deepEqual(filterExercises({query},defaultSettings),[]);
  }
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
  const equipmentFree = filterExercises({query:'道具なし'},defaultSettings);
  assert.ok(equipmentFree.length && equipmentFree.every(item=>!item.gear.length));
  assert.ok(filterExercises({query:'太もも',availableOnly:false},defaultSettings)
    .some(item=>item.load.includes('quad')));
});

test('curated HIIT pages resolve to unique exercises with native figures and independent written sources', () => {
  const sourceUrls = new Set();
  const itemIds = new Set();
  for (const item of hiitExercises) {
    assert.ok(!itemIds.has(item.id),item.id);
    itemIds.add(item.id);
    assert.equal(hiitSubgroups[item.subgroup].group,item.group);
    assert.ok(Object.hasOwn(libraryPoses,item.pose));
    assert.ok(Object.hasOwn(levels,item.level));
    assert.ok(item.load.length && item.load.every(key=>Object.hasOwn(zones,key)));
    assert.ok(item.gear.every(key=>Object.hasOwn(libraryGear,key)));
    assert.ok(item.steps.length && item.sources.length);
    const exercise = exercises[item.id];
    assert.ok(exercise);
    assert.ok(frames(exercise).every(pose=>Object.values(pose).every(point=>point.every(Number.isFinite))));
    assert.ok(evidence[item.id].refs.length);
    assert.ok(evidence[item.id].refs.every(key=>new URL(references[key][1]).hostname!=='hiitbuilder.app'));
    if (!item.existingId) {
      assert.ok(item.diagram?.stages.length>2,item.id);
      assert.ok(new Set(item.diagram.stages.map(stage=>stage.points)).size>1,item.id);
      assert.ok(item.writtenSources.length,item.id);
    }
    for (const {url} of item.sources) {
      assert.match(url,/^https:\/\/hiitbuilder\.app\/moves\/[a-z0-9-]+\/$/);
      assert.ok(!sourceUrls.has(url),url);
      sourceUrls.add(url);
    }
  }
});

test('calf raises and two-leg glute bridges reuse their existing library and guide entries', () => {
  const search = query=>filterExercises({query,classification:'legs'},defaultSettings);
  assert.deepEqual(search('自重カーフレイズ').map(item=>item.id),['calf']);
  assert.deepEqual(search('Glute bridges both legs').map(item=>item.id),['bridge']);
  assert.deepEqual(search('自重カーフレイズ')[0].gear,['wall']);
  assert.equal(search('Glute bridges both legs')[0].id,'bridge');
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
  assert.ok(search({classification:'cardio',availableOnly:true}).some(item=>item.id==='hiit-standing-jacks-low-impact'));
  assert.deepEqual(search({query:'トライセプス 椅子'}).map(item=>item.id),['hiit-tricep-dips-on-couch']);
});
