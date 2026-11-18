import assert from 'node:assert/strict';
import test from 'node:test';
import {catalog, exercises, poses, purposes} from '../catalog.js?v=7';
import {curatedSource, evidence, intensity, references} from '../evidence.js?v=7';
import {allowed, alternatives, defaultSettings, estimate, floorChanges, fullSequence, generate, validate, explainPlan} from '../planner.js?v=7';

const defaultOptions = {purpose:'stretch', minutes:15, poses:Object.keys(poses)};

test('the reported floor-to-standing round trips count across warm-up and cooldown', () => {
  const rows = ['heel-slide','fallout','sit-ham','sit-hips','sit-turn','sit-hips',
    'calf-stretch','side-bend','calf-stretch','rock-stretch','toe'].map(id => ({id}));
  assert.equal(floorChanges(rows),3);
  const replacement = generate(defaultOptions,defaultSettings,()=>.42);
  assert.ok(replacement);
  assert.ok(floorChanges(replacement)<=1);
  assert.ok(fullSequence(replacement));
});

test('generator keeps standing and floor in blocks while honoring load, available equipment, and time', () => {
  let plans = 0;
  for (let mask=1; mask<32; mask++) {
    for (const purpose of Object.keys(purposes)) {
      for (const minutes of [10,15,20,30,40]) {
        for (const settings of [
          defaultSettings,
          {...defaultSettings,level:2,gear:['wall','step','band']},
          {...defaultSettings,blocked:['shoulder','calf'],gear:[]}
        ]) {
          const options = {purpose,minutes,poses:Object.keys(poses).filter((_,i)=>mask&(1<<i))};
          const plan = generate(options,settings,()=>.37);
          if (!plan) continue;
          plans++;
          assert.ok(estimate(plan)<=minutes*60);
          assert.ok(fullSequence(plan));
          assert.ok(plan.every(row=>allowed(exercises[row.id],options,settings) && Object.hasOwn(curatedSource,row.id)));
          assert.ok(floorChanges(plan)<=1,JSON.stringify({options,plan}));
        }
      }
    }
  }
  assert.ok(plans>900);
});

test('substitutions preserve the posture limit and body-region alternation', () => {
  const plan = generate(defaultOptions,defaultSettings,()=>.42);
  let substitutions = 0;
  for (const index of plan.keys()) {
    for (const option of alternatives(plan,index,defaultOptions,defaultSettings)) {
      const replaced = plan.with(index,option);
      assert.ok(fullSequence(replaced));
      assert.ok(floorChanges(replaced)<=1);
      substitutions++;
    }
  }
  assert.ok(substitutions>0);
});

test('every exercise has a load description, intensity guidance, and references', () => {
  for (const exercise of catalog) {
    const entry = evidence[exercise.id];
    assert.ok(entry.target,exercise.id);
    assert.ok(intensity[exercise.type],exercise.id);
    assert.ok(entry.refs.length,exercise.id);
    assert.ok(entry.refs.every(ref=>new URL(references[ref][1]).protocol==='https:'),exercise.id);
  }
});

test('only source-checked exercises are eligible, including when swapping a move', () => {
  const options = {...defaultOptions,poses:['sit']};
  const plan = generate(options,defaultSettings,()=>.42);
  assert.ok(plan);
  assert.ok(plan.some(row=>row.id==='sit-ham'));
  assert.ok(!allowed(exercises['sit-march'],options,defaultSettings));
  for (const id of Object.keys(curatedSource)) {
    assert.ok(evidence[id].refs.includes(curatedSource[id]));
    assert.ok(references[curatedSource[id]]);
  }
  for (const index of plan.keys()) {
    assert.ok(alternatives(plan,index,options,defaultSettings).every(row=>Object.hasOwn(curatedSource,row.id)));
  }
});

test('warm-up progresses from light movement and cooldown slows down before stretch holds', () => {
  const standing = {...defaultOptions,poses:['stand'],minutes:20};
  const plan = generate(standing,defaultSettings,()=>.42);
  const warm = plan.filter(row=>exercises[row.id].type==='warm');
  const cool = plan.filter(row=>exercises[row.id].type==='cool');
  assert.equal(warm[0].id,'march');
  assert.ok(warm.length>=3);
  assert.ok(estimate(warm)>=300);
  assert.equal(cool[0].id,'slow-march');
  assert.ok(cool.slice(1).every(row=>exercises[row.id].held && row.seconds===40));
  assert.ok(estimate(cool)>=300);
  const backup = rows => ({version:1,settings:defaultSettings,history:[],
    saved:[{id:'demo',name:'テスト',rows,options:standing}]});
  assert.deepEqual(validate(backup(plan)).saved[0].rows,plan);
  const old = [{id:'march',seconds:120,rest:0},{id:'side-bend',seconds:30,rest:25},
    {id:'slow-march',seconds:120,rest:10}];
  assert.deepEqual(validate(backup(old)).saved[0].rows,old);
  assert.throws(()=>validate(backup([old[0],old[2],old[1],old[2]])));
});

test('seated and supine preparations and recovery stay on the selected posture', () => {
  for (const pose of ['sit','back']) {
    const plan = generate({...defaultOptions,poses:[pose]},defaultSettings,()=>.42);
    assert.ok(plan);
    assert.ok(plan.every(row=>exercises[row.id].pose===pose));
    assert.ok(plan.filter(row=>exercises[row.id].type==='warm').length>=2);
    const cool = plan.filter(row=>exercises[row.id].type==='cool');
    assert.ok(exercises[cool.at(-1).id].id.endsWith('-breathe'));
    assert.ok(cool[0].id==='cool-slide' || cool[0].id==='cool-sit-ankles');
  }
});

test('limited plans report duration and only offer changes backed by an eligible menu', () => {
  const options = {purpose:'mixed',minutes:20,poses:['sit']};
  const settings = {...defaultSettings,blocked:['shoulder']};
  const rows = generate(options,settings,()=>0);
  const result = explainPlan(options,settings,rows);
  assert.equal(result.time,estimate(rows));
  assert.equal(result.gap,1200-estimate(rows));
  assert.equal(result.reason,'sequence');
  assert.ok(result.suggestions.some(item=>item.kind==='pose'));
  for (const item of result.suggestions) {
    assert.equal(item.time,estimate(item.rows));
    assert.ok(item.rows.every(row=>allowed(exercises[row.id],item.options,settings)));
    assert.ok(fullSequence(item.rows));
    assert.ok(floorChanges(item.rows)<=1);
  }
  const noPose = explainPlan({...options,poses:[]},settings,null);
  assert.equal(noPose.reason,'poses');
  assert.ok(noPose.suggestions.every(item=>item.kind==='pose'));
  const noMain = explainPlan({...options,purpose:'strength',poses:['all4']},settings,null);
  assert.equal(noMain.reason,'main');
  const fit = {...options,poses:['stand']};
  const complete = generate(fit,defaultSettings,()=>0);
  assert.equal(explainPlan({...fit,minutes:estimate(complete)/60},defaultSettings,complete),null);
});
