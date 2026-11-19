import assert from 'node:assert/strict';
import test from 'node:test';
import {alternatives, defaultSettings, validate} from '../planner.js?v=23';

test('two-sided preparation and cooldown substitutions survive backup restore', () => {
  const options = {purpose:'strength',minutes:10,poses:['all4','side']};
  const settings = {...defaultSettings,level:1};
  const rows = [{id:'rock-warm',seconds:35,rest:0},
    {id:'bird',reps:4,rest:30},{id:'rock-cool',seconds:35,rest:10}];
  for (const [index,id] of [[0,'warm-side-clam'],[2,'cool-side-clam']]) {
    const swaps = alternatives(rows,index,options,settings);
    assert.ok(swaps.some(row=>row.id===id));
    for (const row of swaps) {
      const saved = [{id:'swapped',name:'差し替え',options,rows:rows.with(index,row)}];
      assert.deepEqual(validate({version:1,settings,saved,history:[]}).saved,saved);
    }
  }
});

test('set labels follow the remaining plan after future excluded sets are removed', async t => {
  globalThis.matchMedia = () => ({matches:false});
  globalThis.requestAnimationFrame = () => {};
  globalThis.window = {};
  t.after(() => {
    for (const key of ['matchMedia','requestAnimationFrame','window']) delete globalThis[key];
  });
  const {Guide} = await import('../guide.js?v=18');
  const guide = new Guide({name:'テスト',rows:[
    {id:'march',seconds:45,rest:0},{id:'calf',reps:4,rest:30},
    {id:'calf',reps:4,rest:30},{id:'squat',reps:4,rest:30}
  ]},{...defaultSettings,voice:false},{save(){},render(){},finish(){}});
  t.after(() => clearInterval(guide.interval));
  guide.index = 1;
  // This is how the UI removes later sets when excluding the current exercise.
  guide.plan.rows = guide.plan.rows.filter((row,index)=>index<=guide.index || row.id!=='calf');
  guide.advance('excluded');
  assert.equal(guide.row.id,'squat');
  assert.equal(guide.setLabel,'');
});

async function workout(t, rows) {
  globalThis.matchMedia = () => ({matches:false});
  globalThis.requestAnimationFrame = () => {};
  globalThis.document = {hidden:false};
  globalThis.window = {};
  t.after(() => {
    for (const key of ['matchMedia','requestAnimationFrame','document','window']) delete globalThis[key];
  });
  const {Guide} = await import('../guide.js?v=18');
  const finished = [];
  const guide = new Guide({name:'テスト',rows},
    {...defaultSettings,voice:false,known:rows.map(row=>row.id)},
    {save(){},render(){},finish:entry=>finished.push(entry)});
  t.after(() => clearInterval(guide.interval));
  return {guide,finished};
}

test('pausing and hiding the page exclude paused time from workout history', async t => {
  let now = 0;
  t.mock.method(performance,'now',()=>now);
  const row = {id:'march',seconds:10,rest:0};
  const {guide,finished} = await workout(t,[row]);
  guide.begin();
  now = 2000;
  guide.pause();
  now = 12000;
  guide.tick();
  assert.equal(guide.elapsed,2);
  guide.resume();
  now = 13000;
  document.hidden = true;
  guide.tick();
  assert.equal(guide.paused,true);
  guide.resume();
  assert.equal(guide.paused,true);
  now = 23000;
  document.hidden = false;
  guide.resume();
  now = 24000;
  guide.finish();
  assert.equal(finished.length,1);
  assert.equal(finished[0].active,4);
  assert.deepEqual(finished[0].results,[{row,status:'stopped',rating:''}]);
});

test('pain during a side transition records effort once when ending the session', async t => {
  let now = 0;
  t.mock.method(performance,'now',()=>now);
  const row = {id:'side-bend',seconds:10,rest:0};
  const {guide,finished} = await workout(t,[row]);
  guide.warmed = true;
  guide.begin();
  now = 5000;
  guide.tick();
  assert.equal(guide.phase,'switch');
  now = 6000;
  guide.pain();
  guide.pain();
  guide.finish();
  assert.equal(finished[0].active,5);
  assert.deepEqual(finished[0].results,[{row,status:'pain',rating:''}]);
});

test('skipping a warm-up requires confirmation before the main exercise starts', async t => {
  const {guide} = await workout(t,[{id:'march',seconds:45,rest:0},
    {id:'calf',reps:4,rest:30}]);
  guide.advance('skipped');
  guide.started = null;
  guide.offset = 30;
  guide.tick();
  assert.equal(guide.phase,'waiting');
  guide.begin();
  assert.equal(guide.phase,'waiting');
  guide.warmed = true;
  guide.begin();
  assert.equal(guide.phase,'work');
});

test('skipping rest starts the pending exercise without recording another skip', async t => {
  const rows = [{id:'march',seconds:45,rest:0},{id:'squat',reps:4,rest:30}];
  const {guide} = await workout(t,rows);
  guide.begin();
  guide.advance('skipped');
  assert.equal(guide.phase,'rest');
  guide.warmed = true;
  guide.skipRest();
  assert.equal(guide.phase,'work');
  assert.equal(guide.index,1);
  assert.deepEqual(guide.results,[{row:rows[0],status:'skipped',rating:''}]);
});
