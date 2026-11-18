import assert from 'node:assert/strict';
import test from 'node:test';
import {catalog, exercises, poses, purposes, frames, stepLayout, stepStages, heelDigFloor, heelDigStages, diagramFloor, footGuides} from '../catalog.js?v=12';
import {curatedSource, evidence, intensity, references} from '../evidence.js?v=12';
import {allowed, alternatives, defaultSettings, estimate, floorChanges, generate, validate, explainPlan} from '../planner.js?v=14';

const defaultOptions = {purpose:'stretch', minutes:15, poses:Object.keys(poses)};

test('the reported floor-to-standing round trips count across warm-up and cooldown', () => {
  const rows = ['heel-slide','fallout','sit-ham','sit-hips','sit-turn','sit-hips',
    'calf-stretch','side-bend','calf-stretch','rock-stretch','toe'].map(id => ({id}));
  assert.equal(floorChanges(rows),3);
  const replacement = generate(defaultOptions,defaultSettings,()=>.42);
  assert.ok(replacement);
  assert.ok(floorChanges(replacement)<=1);
});

test('generator keeps standing and floor in blocks while honoring excluded regions, equipment, and time', () => {
  let plans = 0;
  for (let mask=1; mask<(1<<Object.keys(poses).length); mask++) {
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
          assert.ok(plan.every(row=>allowed(exercises[row.id],options,settings) && Object.hasOwn(curatedSource,row.id)));
          assert.ok(floorChanges(plan)<=1,JSON.stringify({options,plan}));
        }
      }
    }
  }
  assert.ok(plans>900);
});

test('substitutions preserve the posture and time limits', () => {
  const plan = generate(defaultOptions,defaultSettings,()=>.42);
  let substitutions = 0;
  for (const index of plan.keys()) {
    for (const option of alternatives(plan,index,defaultOptions,defaultSettings)) {
      const replaced = plan.with(index,option);
      assert.ok(floorChanges(replaced)<=1);
      assert.ok(estimate(replaced)<=defaultOptions.minutes*60);
      substitutions++;
    }
  }
  assert.ok(substitutions>0);
});

test('same-region exercises can be generated, swapped and restored from a backup', () => {
  const options = {purpose:'strength',minutes:10,poses:['stand']};
  const settings = {...defaultSettings,excluded:Object.keys(curatedSource).filter(id=>
    exercises[id].type==='strength' && id!=='calf' && id!=='toe-raise')};
  const generated = generate(options,settings,()=>0);
  const main = generated.filter(row=>exercises[row.id].type==='strength');
  assert.ok(main.length>=2);
  assert.deepEqual(new Set(main.map(row=>row.id)),new Set(['calf','toe-raise']));
  assert.ok(main.every(row=>exercises[row.id].load.includes('calf')));

  const rows = [{id:'march',seconds:45,rest:0},{id:'calf',reps:4,rest:30},
    {id:'squat',reps:4,rest:30},{id:'slow-march',seconds:45,rest:10}];
  const swap = alternatives(rows,2,options,defaultSettings).find(row=>row.id==='toe-raise');
  assert.ok(swap);
  const saved = [{id:'test-saved',name:'テスト',options,rows:rows.with(2,swap)}];
  const history = [{id:'test-history',name:'テスト',date:new Date(0).toISOString(),active:0,ended:false,
    rating:'',results:[{row:swap,status:'overlap',rating:''}]}];
  const restored = validate({version:1,settings:defaultSettings,saved,history});
  assert.deepEqual(restored.saved,saved);
  assert.deepEqual(restored.history,history);
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

test('expanded catalog provides beginner options without equipment or shoulder load', () => {
  const settings = {...defaultSettings,gear:[],blocked:['shoulder']};
  const standing = {purpose:'mixed',minutes:15,poses:['stand']};
  const candidate = generate(standing,settings,()=>.42);
  assert.ok(candidate);
  assert.ok(allowed(exercises['mountain-basic'],standing,settings));
  assert.ok(allowed(exercises['elbow-range'],standing,settings));
  assert.ok(!allowed(exercises.mountain,standing,settings));
  const side = {...standing,poses:['side'],purpose:'strength'};
  const sidePlan = generate(side,settings,()=>.42);
  assert.ok(sidePlan, 'side-lying should work as the only enabled posture');
  assert.ok(sidePlan.every(row=>exercises[row.id].pose==='side'));
  assert.ok(sidePlan.some(row=>row.id==='side-clam' || row.id==='side-leg-raise'));
  assert.ok(!allowed(exercises['side-band-clam'],side,settings));
  assert.ok(!allowed(exercises['quad-arm'],{...standing,poses:['all4']},{...defaultSettings,level:1,blocked:['forearm']}));
});

test('step-up plants heel and toe on the platform while the knee and body move', () => {
  const poses=frames(exercises['step-up']);
  const labels=stepStages.map(stage=>stage.button).filter(Boolean);
  assert.deepEqual(labels,['台の前','片足を置く','両足が台上','片足を下ろす']);
  const [start,,placed,lifting,both,,lowered]=poses;
  assert.deepEqual([start.lf[1],start.rf[1]],[stepLayout.floor-3,stepLayout.floor-3]);
  for(const pose of [placed,lifting,both,lowered]) {
    assert.deepEqual(pose.lf,placed.lf);
    assert.deepEqual(pose.lt,placed.lt);
    assert.equal(pose.lf[1],stepLayout.top-3);
  }
  assert.ok(both.hip[1]<placed.hip[1]);
  assert.ok(lowered.hip[1]>both.hip[1]);
  assert.equal(both.rf[1],stepLayout.top-3);
  assert.equal(lowered.rf[1],stepLayout.floor-3);
  for(const [i,first] of poses.entries()) {
    const next=poses[(i+1)%poses.length];
    for (const tip of ['lf','lt','rf','rt']) {
      for(let progress=0;progress<=100;progress++) {
        const [x,y]=first[tip].map((p,axis)=>p+(next[tip][axis]-p)*progress/100);
        if(x>=stepLayout.left-2 && x<=stepLayout.right+2) assert.ok(y<=stepLayout.top-3);
      }
    }
  }
});

test('front-facing knees track the feet, and planted toes stay fixed in calf raises', () => {
  for(const pose of frames(exercises.squat)) {
    for(const side of ['l','r']) {
      const [heelX,heelY]=pose[side+'f'];
      const [toeX,toeY]=pose[side+'t'];
      const [kneeX]=pose[side+'k'];
      assert.ok(kneeX>=Math.min(heelX,toeX)-1 && kneeX<=Math.max(heelX,toeX)+1);
      assert.equal(heelY,toeY);
    }
  }
  const [down,up]=frames(exercises.calf);
  assert.deepEqual(down.lt,up.lt);
  assert.deepEqual(down.rt,up.rt);
  assert.ok(up.lf[1]<down.lf[1]);
  for(const exercise of catalog) {
    assert.ok(frames(exercise).every(pose=>['lf','lt','rf','rt'].every(key=>pose[key].every(Number.isFinite))));
  }
});

test('alternating foot demonstrations start and return with both feet on the floor', () => {
  for (const id of ['march','slow-march']) {
    const [start,first,center,second,end]=frames(exercises[id]);
    assert.deepEqual(center,start);
    assert.deepEqual(end,start);
    assert.notDeepEqual(first,start);
    assert.notDeepEqual(second,start);
    assert.notDeepEqual(first,second);
    assert.equal(start.lf[1],start.rf[1]);
  }
});

test('guide waits for equipment or posture changes and advances automatically otherwise', async () => {
  globalThis.matchMedia=()=>({matches:false});
  globalThis.requestAnimationFrame=()=>{};
  globalThis.document={hidden:false};
  globalThis.window={};
  const {Guide}=await import('../guide.js?v=14');
  const settings={...defaultSettings,voice:false,known:['march','warm-heel','wall-push','sit-hips']};
  const rows=[
    {id:'march',seconds:5,rest:0},{id:'warm-heel',seconds:5,rest:2},
    {id:'wall-push',reps:4,rest:2},{id:'wall-push',reps:4,rest:2},{id:'sit-hips',seconds:10,rest:2}
  ];
  const guide=new Guide({name:'テスト',rows},settings,{save(){},render(){},finish(){}});
  const endRest=()=>{guide.offset=guide.limit+1;guide.tick();};
  try {
    guide.begin();
    guide.complete();
    assert.equal(guide.phase,'rest');
    assert.equal(guide.needsPreparation,false);
    endRest();
    assert.equal(guide.phase,'work');
    guide.complete();
    assert.equal(guide.needsPreparation,true);
    endRest();
    assert.equal(guide.phase,'waiting');
    guide.confirmPreparation();
    assert.equal(guide.phase,'work');
    guide.complete();
    assert.equal(guide.row.id,'wall-push');
    assert.equal(guide.needsPreparation,false);
    endRest();
    assert.equal(guide.phase,'work');
    guide.complete();
    assert.equal(guide.needsPreparation,true);
    guide.confirmPreparation();
    assert.equal(guide.phase,'rest');
    endRest();
    assert.equal(guide.phase,'work');
  } finally {
    clearInterval(guide.interval);
    for(const key of ['matchMedia','requestAnimationFrame','document','window']) delete globalThis[key];
  }
});

test('heel digs alternate with only the forward heel touching and its toes elevated', () => {
  const sequence=frames(exercises['warm-heel']);
  assert.deepEqual(heelDigStages.map(pose=>pose.button).filter(Boolean),['両足を床に','片足のかかと','反対のかかと']);
  const [start,leftLift,leftContact,leftReturn,center,rightLift,rightContact,rightReturn,end]=sequence;
  assert.deepEqual(start,center);
  assert.deepEqual(start,end);
  for (const [side,resting,lift,contact,returning] of [
    ['l','r',leftLift,leftContact,leftReturn],['r','l',rightLift,rightContact,rightReturn]
  ]) {
    assert.equal(contact[side+'f'][1],heelDigFloor-3);
    assert.ok(contact[side+'t'][1]<=heelDigFloor-15);
    assert.ok(contact[side+'f'][0]>start[side+'t'][0]);
    assert.deepEqual(contact[resting+'f'],start[resting+'f']);
    assert.deepEqual(contact[resting+'t'],start[resting+'t']);
    assert.ok(lift[side+'f'][1]<heelDigFloor-15);
    assert.deepEqual(lift[side+'f'],returning[side+'f']);
  }
});

test('the foot guides distinguish sole, heel and toe contact on the floor and the step', async () => {
  globalThis.matchMedia=()=>({matches:false});
  globalThis.requestAnimationFrame=()=>{};
  const {footContacts}=await import('../media.js?v=13');
  const contacts=(pose)=>footContacts(pose,diagramFloor).map(({kind})=>kind);
  for (const [id,expected] of [
    ['toe-raise',['heel','heel']], ['calf',['toe','toe']], ['sit-ankles',['heel','heel']],
    ['heel-slide',['sole','heel']], ['bridge',['sole','sole']], ['band-open',['sole','sole']],
    ['calf-stretch',['sole','sole']], ['free-calf',['sole','sole']], ['warrior-one',['sole','sole']],
    ['wall-slide',['sole','sole']], ['straight-raise',['sole']], ['sit-ham',['heel','sole']],
    ['sit-march',['sole']], ['back-ham',['sole']], ['fallout',['sole','heel']]
  ]) {
    const exercise=exercises[id];
    assert.deepEqual(contacts(frames(exercise).at(-1)),expected,id);
    for (const [index] of footGuides[exercise.motion].buttons ?? []) assert.ok(frames(exercise)[index],id);
  }
  const [start,,placed,,both]=frames(exercises['step-up']);
  for (const [pose,surfaces] of [[start,[202,202]],[placed,[179,202]],[both,[179,179]]]) {
    const contact=footContacts(pose,stepLayout.floor,stepLayout);
    assert.deepEqual(contact.map(({y})=>y),surfaces);
    assert.ok(contact.every(({kind})=>kind==='sole'));
  }
  const [neutral,liftRight,right,,center,liftLeft,left,,end]=frames(exercises.toe);
  assert.deepEqual(center,neutral);
  assert.deepEqual(end,neutral);
  assert.deepEqual(contacts(liftRight),['sole']);
  assert.deepEqual(contacts(liftLeft),['sole']);
  assert.deepEqual(contacts(right),['sole','toe']);
  assert.deepEqual(contacts(left),['toe','sole']);
  const [bent,extended]=frames(exercises['heel-slide']);
  assert.equal(bent.rf[1],extended.rf[1]);
  assert.ok(extended.rf[0]>bent.rf[0]);
  assert.deepEqual(bent.lf,extended.lf);
});
