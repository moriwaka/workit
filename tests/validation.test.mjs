import assert from 'node:assert/strict';
import test from 'node:test';
import {defaultSettings, validate} from '../planner.js?v=20';

const backup = () => ({version:1,settings:structuredClone(defaultSettings),
  saved:[{id:'menu',name:'メニュー',options:{purpose:'strength',minutes:10,poses:['stand']},
    rows:[{id:'march',seconds:45,rest:0},{id:'calf',reps:4,rest:30},
      {id:'slow-march',seconds:45,rest:10}]}],
  history:[{id:'session',name:'履歴',date:'2026-11-18T00:00:00.000Z',active:16,
    ended:false,rating:'',results:[{row:{id:'calf',reps:4,rest:30},status:'done',rating:''}]}]});

test('valid backups round-trip without mutating their input', () => {
  const input = backup();
  const original = structuredClone(input);
  assert.deepEqual(validate(input),original);
  assert.deepEqual(input,original);
});

test('legacy settings get default adjustments and duplicate choices are normalized', () => {
  const input = backup();
  delete input.settings.adjustments;
  input.settings.gear = ['wall','wall'];
  input.saved[0].options.poses = ['stand','stand'];
  const clean = validate(input);
  assert.deepEqual(clean.settings.adjustments,{});
  assert.deepEqual(clean.settings.gear,['wall']);
  assert.deepEqual(clean.saved[0].options.poses,['stand']);
});

const invalid = [
  ['unsupported version',data=>{data.version=2;}],
  ['missing history',data=>{delete data.history;}],
  ['out-of-range level',data=>{data.settings.level=3;}],
  ['invalid volume',data=>{data.settings.volume=-1;}],
  ['non-boolean voice',data=>{data.settings.voice='true';}],
  ['unknown equipment',data=>{data.settings.gear=['unknown'];}],
  ['unknown blocked region',data=>{data.settings.blocked=['unknown'];}],
  ['unknown excluded exercise',data=>{data.settings.excluded=['unknown'];}],
  ['unknown known exercise',data=>{data.settings.known=['unknown'];}],
  ['invalid adjustment',data=>{data.settings.adjustments={calf:3};}],
  ['unknown adjustment exercise',data=>{data.settings.adjustments={unknown:1};}],
  ['invalid menu id',data=>{data.saved[0].id='<script>'; }],
  ['blank menu name',data=>{data.saved[0].name=' ';}],
  ['unknown purpose',data=>{data.saved[0].options.purpose='unknown';}],
  ['unknown posture',data=>{data.saved[0].options.poses=['unknown'];}],
  ['too few rows',data=>{data.saved[0].rows.pop();}],
  ['unknown exercise',data=>{data.saved[0].rows[1].id='unknown';}],
  ['negative rest',data=>{data.saved[0].rows[1].rest=-1;}],
  ['zero duration',data=>{data.saved[0].rows[0].seconds=0;}],
  ['fractional reps',data=>{data.saved[0].rows[1].reps=1.5;}],
  ['mixed reps and duration',data=>{data.saved[0].rows[1].seconds=10;}],
  ['unequal sides',data=>{data.saved[0].rows[1]={id:'side-bend',seconds:15,rest:0};}],
  ['over-budget menu',data=>{data.saved[0].rows[0].seconds=600;}],
  ['out-of-order phases',data=>{data.saved[0].rows.reverse();}],
  ['duplicate menu ids',data=>{data.saved.push(structuredClone(data.saved[0]));}],
  ['invalid date',data=>{data.history[0].date='invalid';}],
  ['negative active time',data=>{data.history[0].active=-1;}],
  ['non-boolean ended flag',data=>{data.history[0].ended=1;}],
  ['unknown overall rating',data=>{data.history[0].rating='unknown';}],
  ['unknown result status',data=>{data.history[0].results[0].status='unknown';}],
  ['unknown result rating',data=>{data.history[0].results[0].rating='unknown';}],
  ['duplicate history ids',data=>{data.history.push(structuredClone(data.history[0]));}]
];

for (const [name,corrupt] of invalid) {
  test(`backup rejects ${name}`, () => {
    const data = backup();
    corrupt(data);
    assert.throws(()=>validate(data));
  });
}
