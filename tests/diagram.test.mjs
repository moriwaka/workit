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
  const {attachDiagram,setDiagramFrame} = await import('../media.js?v=16');
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
});
