import assert from 'node:assert/strict';
import test from 'node:test';
import {diagramFloor, exercises} from '../catalog.js?v=16';
import {hiitExercises} from '../hiit-library.js?v=2';

test('heel tap jumps show both hands reaching the heels in flight and both feet landing', () => {
  const exercise = hiitExercises.find(item=>item.id==='hiit-heel-tap-jumps');
  assert.ok(exercise.diagram);
  const {stages} = exercise.diagram;
  const pose = label=>stages.find(stage=>stage.button===label).points;
  const start = pose('構え');
  const takeoff = pose('踏み切り');
  const tap = pose('空中でタッチ');
  const landing = pose('両足で着地');
  for (const side of ['l','r']) {
    const heel = side+'f', toe = side+'t', knee = side+'k', hand = side+'h';
    assert.equal(start[heel][1],diagramFloor-3);
    assert.equal(takeoff[toe][1],diagramFloor-3);
    assert.ok(takeoff[heel][1]<takeoff[toe][1]);
    assert.ok(tap[heel][0]<tap[knee][0] && tap[heel][1]<tap[knee][1]);
    assert.deepEqual(tap[hand],tap[heel]);
    assert.ok(tap[toe][1]<diagramFloor-20);
    assert.equal(landing[heel][1],diagramFloor-3);
    assert.equal(landing[toe][1],diagramFloor-3);
    for (let index=1;index<stages.length;index++) {
      const a = stages[index-1].points, b = stages[index].points;
      const midShin = [0,1].map(axis=>(a[knee][axis]+b[knee][axis]-a[heel][axis]-b[heel][axis])/2);
      assert.ok(Math.hypot(...midShin)>30,'the shin keeps its shape while the knee bends');
    }
  }
  assert.ok(tap.hip[1]<takeoff.hip[1] && landing.hip[1]>start.hip[1]);
  assert.deepEqual(stages.at(-1).points,start);
});

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
  const {attachDiagram,setDiagramFrame} = await import('../media.js?v=19');
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
