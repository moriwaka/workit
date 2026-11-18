import assert from 'node:assert/strict';
import test from 'node:test';
import {catalog, exercises, poses, purposes} from '../catalog.js?v=4';
import {curatedSource, evidence, intensity, references} from '../evidence.js?v=4';
import {allowed, alternatives, defaultSettings, estimate, floorChanges, fullSequence, generate} from '../planner.js?v=4';

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
