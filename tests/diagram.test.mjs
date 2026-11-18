import assert from 'node:assert/strict';
import test from 'node:test';
import {exercises} from '../catalog.js?v=16';

test('heel digs animate when a scheduled frame predates opening or replaying the diagram', async (t) => {
  const callbacks = [];
  const marks = [];
  const ctx = new Proxy({
    clearRect() { marks.length = 0; },
    arc(x,y,radius) { marks.push([x,y,radius]); }
  }, {
    get(target,key) { return target[key] ?? (() => {}); }
  });
  const canvas = {width:600,height:460,getContext:()=>ctx};
  globalThis.matchMedia = () => ({matches:false});
  globalThis.requestAnimationFrame = callback => callbacks.push(callback);
  globalThis.document = {querySelectorAll:()=>[canvas]};
  t.after(() => {
    for (const key of ['matchMedia','requestAnimationFrame','document']) delete globalThis[key];
  });
  const {attachDiagram,setDiagramFrame} = await import('../media.js?v=18');
  const frame = time => {
    assert.equal(callbacks.length,1);
    callbacks.shift()(time);
  };

  const beforeOpen = performance.now()-1;
  attachDiagram(canvas,exercises['warm-heel']);
  const standing = [...marks];
  frame(beforeOpen);
  assert.deepEqual(marks,standing);
  frame(beforeOpen+1700);
  assert.notDeepEqual(marks,standing);

  setDiagramFrame(canvas,'pose-2');
  const heelDown = [...marks];
  frame(beforeOpen+2200);
  assert.deepEqual(marks,heelDown);
  const beforeReplay = performance.now()-1;
  setDiagramFrame(canvas,'play');
  frame(beforeReplay);
  assert.deepEqual(marks,standing);
  frame(beforeReplay+1700);
  assert.notDeepEqual(marks,standing);

  await t.test('knee rolls stay centered for three seconds before the other side', () => {
    attachDiagram(canvas,exercises['knee-roll']);
    const center=[...marks];
    frame(10000);
    frame(11500);
    const left=[...marks];
    assert.notDeepEqual(left,center);
    for(const time of [13000,14000,15999]) {
      frame(time);
      assert.deepEqual(marks,center);
    }
    frame(17500);
    assert.notDeepEqual(marks,center);
    assert.notDeepEqual(marks,left);
  });
});
