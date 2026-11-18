import {frames, seatedDiagrams, stepLayout, stepStages, heelDigFloor, diagramFloor, footGuides} from './catalog.js?v=16';
import {sideSwitchSeconds} from './planner.js?v=17';

const pink = '#ed865f';
const purple = '#523290';
const far = '#b8a8d7';
const ink = '#2e2046';
const heelColor = '#08645b';
const toeColor = '#a33e15';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const diagrams = new WeakMap();

function line(ctx, points, color, width=7) {
  ctx.beginPath();
  points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function disk(ctx, [x,y], radius, color) {
  ctx.beginPath();
  ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
}

function footMarkers(ctx, heel, toe) {
  const length = Math.hypot(toe[0]-heel[0],toe[1]-heel[1]);
  if (!length) return;
  const size = Math.min(4.6,length*.30);
  disk(ctx,heel,size+.9,'#fff');
  disk(ctx,heel,size,heelColor);
  ctx.beginPath();
  ctx.moveTo(toe[0],toe[1]-size);
  ctx.lineTo(toe[0]+size,toe[1]);
  ctx.lineTo(toe[0],toe[1]+size);
  ctx.lineTo(toe[0]-size,toe[1]);
  ctx.closePath();
  ctx.strokeStyle='#fff';
  ctx.lineWidth=1.4;
  ctx.fillStyle=toeColor;
  ctx.stroke();
  ctx.fill();
}

export function footContacts(points, floor, platform) {
  return [['lf','lt'],['rf','rt']].flatMap(([heelKey,toeKey]) => {
    const surface = ([x,y]) => {
      if (platform && x>=platform.left && x<=platform.right) {
        return Math.abs(y-(platform.top-3))<=.5 ? platform.top : null;
      }
      return Math.abs(y-(floor-3))<=.5 ? floor : null;
    };
    const [heel,toe] = [points[heelKey],points[toeKey]];
    const [heelSurface,toeSurface] = [surface(heel),surface(toe)];
    if (heelSurface!==null && heelSurface===toeSurface) {
      return [{kind:'sole',x1:heel[0],x2:toe[0],y:heelSurface}];
    }
    return [[heel,heelSurface,'heel'],[toe,toeSurface,'toe']]
      .filter(([,y])=>y!==null).map(([[x],y,kind])=>({kind,x1:x-5,x2:x+5,y}));
  });
}

function drawFootContacts(ctx, points, floor, platform) {
  for (const {x1,x2,y} of footContacts(points,floor,platform)) {
    line(ctx,[[x1,y],[x2,y]],heelColor,2.6);
  }
}

function movementArrows(ctx, guide, points, start, moving) {
  if (!moving) return;
  for (const key of guide.arrows ?? []) {
    const [x,y] = points[key];
    const [startX,startY] = start[key];
    if (Math.hypot(x-startX,y-startY)<4) continue;
    if (Math.abs(y-startY)<2) {
      const sign = Math.sign(x-startX);
      arrow(ctx,[[x-sign*21,215],[x+sign*4,215]]);
    } else {
      const arrowX = x + (key.endsWith('f') ? -10 : 11);
      arrow(ctx,[[arrowX,startY],[arrowX,y-5]]);
    }
  }
}

function warriorAlignment(ctx) {
  ctx.fillStyle='#fff';
  ctx.fillRect(8,24,91,103);
  ctx.fillStyle=ink;
  ctx.font='600 10px system-ui, sans-serif';
  ctx.fillText('真上から見た足',16,39);
  arrow(ctx,[[24,69],[24,50]]);
  ctx.fillStyle=ink;
  ctx.fillText('正面',34,57);
  for (const [heel,toe,label,labelAt] of [
    [[70,78],[70,61],'前足',[43,75]], [[65,111],[50,98],'後ろ足',[18,112]]
  ]) {
    line(ctx,[heel,toe],purple,7);
    footMarkers(ctx,heel,toe);
    ctx.fillStyle=ink;
    ctx.fillText(label,...labelAt);
  }
}

function heelDigContact(ctx, points) {
  // Only label a forward heel close to the floor with visibly elevated toes.
  const feet = [[points.lf,points.lt],[points.rf,points.rt]];
  const touching = feet.find(([heel,toe]) => heel[1]>=heelDigFloor-3.5 && heel[1]-toe[1]>10);
  ctx.fillStyle=ink;
  ctx.font='600 11px system-ui, sans-serif';
  ctx.fillText('斜め横から',15,22);
  ctx.fillText('床',268,heelDigFloor+3);
  if (!touching) return;
  const [heel,toe] = touching;
  line(ctx,[[heel[0]-7,heelDigFloor],[heel[0]+7,heelDigFloor]],heelColor,3);
  arrow(ctx,[[toe[0]+11,toe[1]+5],[toe[0]+11,toe[1]-10]]);
  ctx.fillStyle=heelColor;
  ctx.fillText('かかとが床に触れる',heel[0]-38,222);
  ctx.fillStyle=toeColor;
  ctx.fillText('つま先は上',toe[0]+17,toe[1]-12);
}

function pointBetween(a,b,ratio) {
  return a.map((value,i) => value + (b[i]-value)*ratio);
}

function arrow(ctx, points) {
  const end = points.at(-1);
  const start = points.at(-2);
  const angle = Math.atan2(end[1]-start[1],end[0]-start[0]);
  const tip = side => [end[0]-9*Math.cos(angle+side*.55),end[1]-9*Math.sin(angle+side*.55)];
  line(ctx,points,'#ab431d',2.5);
  line(ctx,[tip(-1),end,tip(1)],'#ab431d',2.5);
}

function seatDetails(ctx, guide, floor) {
  ctx.fillStyle='#d9ccec';
  ctx.beginPath();
  ctx.moveTo(65,185);
  ctx.lineTo(230,185);
  ctx.lineTo(257,floor);
  ctx.lineTo(38,floor);
  ctx.closePath();
  ctx.fill();
  line(ctx,[[38,floor],[257,floor]],'#9c83be',2);
  ctx.font='600 11px system-ui, sans-serif';
  ctx.fillStyle=ink;
  ctx.fillText(guide.front ? '正面から' : '斜め横から',15,19);
  ctx.fillText('床',262,floor+3);
}

function stepPlatform(ctx) {
  const {left,right,top,floor} = stepLayout;
  ctx.fillStyle='#bba8df';
  ctx.fillRect(left,top,right-left,floor-top);
  line(ctx,[[left,top],[right,top]],purple,2);
}

function stepAlignment(ctx) {
  ctx.fillStyle='#fff';
  ctx.fillRect(7,27,103,110);
  ctx.font='600 10px system-ui, sans-serif';
  ctx.fillStyle=ink;
  ctx.fillText('正面から見た膝',15,42);
  const legs = [{x:34,color:'#b8a8d7'},{x:67,color:'#ab431d'}];
  for (const {x,color} of legs) {
    line(ctx,[[x,61],[x,84],[x,111]],color,5);
    line(ctx,[[x,110],[x,120]],color,7);
    disk(ctx,[x,84],4,'#fff');
    disk(ctx,[x,84],2.6,color);
    footMarkers(ctx,[x,109],[x,120]);
  }
  ctx.fillStyle=ink;
  ctx.fillText('膝とつま先は同じ向き',11,132);
}

function kneeRollMat(ctx) {
  ctx.fillStyle = '#e1d5f5';
  ctx.fillRect(76,26,148,188);
  ctx.fillStyle = ink;
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.fillText('斜め上から',15,22);
  ctx.fillText('床',231,208);
}

function kneeRollDetails(ctx, points, horizontalMotion) {
  const {ls,rs,lk,rk} = points;
  for (const shoulder of [ls,rs]) {
    disk(ctx,shoulder,5,'#fff');
    disk(ctx,shoulder,3,heelColor);
  }
  ctx.fillStyle = heelColor;
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.fillText('両肩は床に',14,73);
  line(ctx,[[73,71],[106,71],[116,76]],heelColor,1.5);
  disk(ctx,lk,4,pink);
  disk(ctx,rk,4,pink);

  const kneeCenter = (lk[0]+rk[0])/2;
  if (Math.abs(kneeCenter-150)>10) {
    const direction = Math.sign(horizontalMotion || kneeCenter-150);
    const edge = direction<0 ? lk : rk;
    const [x,y] = edge;
    arrow(ctx,[[x+direction*8,y-13],[x+direction*20,y-10],[x+direction*27,y-3]]);
  }

  // This side view makes the bend visible even when the legs are foreshortened.
  ctx.fillStyle = '#fff';
  ctx.fillRect(214,27,80,55);
  ctx.fillStyle = ink;
  ctx.font = '600 9px system-ui, sans-serif';
  ctx.fillText('横から見た開始姿勢',216,39);
  line(ctx,[[220,73],[289,73]],'#9c83be',1.5);
  disk(ctx,[226,67],4,pink);
  line(ctx,[[232,69],[250,69],[267,51],[279,69],[287,69]],purple,4);
  disk(ctx,[267,51],3,pink);
}

function draw(canvas, first, last, ratio, stepIndex = 0) {
  const {exercise,poses} = diagrams.get(canvas);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(canvas.width/300,0,0,canvas.height/230,0,0);
  ctx.clearRect(0,0,300,230);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.ellipse(151,116,86,87,0,0,Math.PI*2);
  ctx.fillStyle = '#eee7fb';
  ctx.fill();
  const seated = seatedDiagrams[exercise.motion];
  const guide = footGuides[exercise.motion];
  const step = exercise.motion==='step';
  const floor = step ? stepLayout.floor : diagramFloor;
  const kneeRoll = exercise.motion==='kneeRoll';
  if (kneeRoll) kneeRollMat(ctx);
  else if (seated) seatDetails(ctx,seated,guide ? floor : 205);
  else line(ctx,[[40,floor],[step ? stepLayout.right : 273,floor]],'#9c83be',2);
  if (guide && !seated) {
    ctx.fillStyle=ink;
    ctx.font='600 11px system-ui, sans-serif';
    ctx.fillText('床',275,floor+3);
  }
  if (exercise.gear.includes('wall') && ['push','calfStretch','calf'].includes(exercise.motion)) {
    line(ctx,[[245,53],[245,200]],'#a68dc4',4);
    for (let y=65;y<190;y+=12) line(ctx,[[246,y],[254,y-8]],'#d6c6ec',1.5);
  }
  if (['toeRaise','wallSlide'].includes(exercise.motion)) {
    line(ctx,[[111,44],[111,200]],'#a68dc4',4);
    for (let y=54;y<190;y+=12) line(ctx,[[110,y],[103,y-8]],'#d6c6ec',1.5);
  }
  if (exercise.motion==='side') line(ctx,[[88,53],[88,floor]],'#a68dc4',4);
  if (step) stepPlatform(ctx);
  const p = Object.fromEntries(Object.keys(first).map(key => [key,pointBetween(first[key],last[key],ratio)]));
  const farSide = seated?.front ? purple : far;
  const shoeWidth = exercise.motion==='sitHip' ? 10 : guide || seated || exercise.motion==='heelDig' ? 6 : 5;
  if (guide) drawFootContacts(ctx,p,floor,step ? stepLayout : null);
  line(ctx,[p.rp ?? p.hip,p.rk,p.rf],farSide,9);
  line(ctx,[p.rs,p.re,p.rh],farSide);
  line(ctx,[p.rf,p.rt],farSide,shoeWidth);
  footMarkers(ctx,p.rf,p.rt);
  line(ctx,[p.neck,p.hip],purple,16);
  line(ctx,[p.ls,p.rs],purple,9);
  line(ctx,[p.lp ?? p.hip,p.lk,p.lf],purple,9);
  line(ctx,[p.ls,p.le,p.lh],purple);
  if (p.lhTip) line(ctx,[p.lh,p.lhTip],'#ab431d',4);
  if (p.rhTip) line(ctx,[p.rh,p.rhTip],'#ab431d',4);
  line(ctx,[p.lf,p.lt],step ? '#ab431d' : purple,shoeWidth);
  footMarkers(ctx,p.lf,p.lt);
  if (exercise.motion==='heelDig') heelDigContact(ctx,p);
  if (guide?.arrows) movementArrows(ctx,guide,p,poses[0],ratio>.08);
  if (exercise.motion==='warrior') warriorAlignment(ctx);
  disk(ctx,p.head,13,seated ? '#bfa7dd' : pink);
  disk(ctx,[p.head[0]+(seated?.front ? -4 : 5),p.head[1]-2],1.6,ink);
  if (seated?.front) disk(ctx,[p.head[0]+4,p.head[1]-2],1.6,ink);
  if (seated) {
    for (const key of seated.highlights) disk(ctx,p[key],key === 'head' ? 5 : 4,'#ab431d');
    if (ratio > .08) for (const path of seated.arrows) arrow(ctx,path);
  } else {
    disk(ctx,p.lk,3.2,pink);
    disk(ctx,p.le,3.2,pink);
  }
  if (kneeRoll) kneeRollDetails(ctx,p,last.lk[0]-first.lk[0]);
  if (step) {
    stepAlignment(ctx);
    ctx.font='600 11px system-ui, sans-serif';
    ctx.fillStyle=ink;
    ctx.fillText(stepStages[stepIndex].caption,15,222);
  }
  if (exercise.gear.includes('band')) {
    line(ctx,[pointBetween(p.hip,p.lk,.86),pointBetween(p.hip,p.rk,.86)],pink,4);
  }
}

export function attachDiagram(canvas, exercise) {
  const poses = frames(exercise);
  diagrams.set(canvas,{exercise,poses,started:null,paused:reducedMotion.matches});
  draw(canvas,poses[0],poses[0],0);
}

export function setDiagramFrame(canvas, frame) {
  const state = diagrams.get(canvas);
  state.paused = frame !== 'play';
  state.started = null;
  const last = state.poses.length-1;
  const index = frame === 'end' ? (last===4 ? 1 : last) : frame.startsWith('pose-') ? Number(frame.slice(5)) : 0;
  draw(canvas,state.poses[index],state.poses[index],index ? 1 : 0,index);
}

function drawSequence(canvas,state,elapsed) {
  const motion = state.exercise.motion;
  const count = motion==='step' ? state.poses.length : state.poses.length-1;
  const stageSeconds = motion==='step' ? .95 : motion==='kneeRoll' ? 1.5 : .8;
  if (motion==='kneeRoll') {
    const oneSide = 2*stageSeconds;
    const interval = oneSide+sideSwitchSeconds;
    elapsed = Math.floor(elapsed/interval)*oneSide + Math.min(elapsed%interval,oneSide);
  }
  const step = (elapsed / stageSeconds) % count;
  const stage = Math.floor(step);
  const next = (stage+1) % state.poses.length;
  const ratio = Math.max(0,Math.min(1,(step-stage-.24)/.63));
  const smooth = ratio * ratio * (3-2*ratio);
  draw(canvas,state.poses[stage],state.poses[next],smooth,ratio<.5 ? stage : next);
}

function animate(now) {
  for (const canvas of document.querySelectorAll('canvas[data-diagram]')) {
    const state = diagrams.get(canvas);
    if (!state || state.paused || state.exercise.still) continue;
    const cycle = state.exercise.type === 'stretch' ? 5 : 4;
    // Use the frame clock for both ends of the interval. A pending frame's
    // timestamp can precede the click that opened or replayed the diagram.
    state.started ??= now;
    const elapsed = (now - state.started) / 1000;
    if (state.poses.length>2) {
      drawSequence(canvas,state,elapsed);
      continue;
    }
    const [first,last] = state.poses;
    if (state.exercise.held) {
      const ratio = Math.max(0,Math.min(1,(elapsed-.7)/1.4));
      draw(canvas,first,last,ratio);
      if (ratio===1) state.paused = true;
      continue;
    }
    const phase = (elapsed % cycle) / cycle;
    const posed = Math.max(0,Math.min(1,(phase % .5 - .08) / .34));
    const eased = posed * posed * (3 - 2 * posed);
    draw(canvas,first,last,phase < .5 ? eased : 1 - eased);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

let soundContext;
let soundNodes = [];
export function unlockSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    soundContext ??= new AudioContext();
    soundContext.resume().catch(() => {});
  } catch { /* Visual cues stay available. */ }
}

export function voiceAvailable() {
  return Boolean(japaneseVoice());
}

function japaneseVoice() {
  return window.speechSynthesis?.getVoices().find(voice => /^ja(?:-|_|$)/i.test(voice.lang) && voice.localService);
}

export function silence() {
  window.speechSynthesis?.cancel();
  soundNodes.forEach(node => { try { node.stop(); } catch { /* Ended already. */ } });
  soundNodes = [];
}

export function announce(text, settings, frequency = 0) {
  if (!settings.voice || !settings.volume) return;
  const voice = japaneseVoice();
  if (voice && text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.volume = settings.volume / 100;
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
    return;
  }
  if (!soundContext || !frequency) return;
  const t = soundContext.currentTime;
  const tone = soundContext.createOscillator();
  const volume = soundContext.createGain();
  tone.frequency.value = frequency;
  volume.gain.setValueAtTime(.0001,t);
  volume.gain.exponentialRampToValueAtTime(.1 * settings.volume / 100,t+.02);
  volume.gain.exponentialRampToValueAtTime(.0001,t+.19);
  tone.connect(volume).connect(soundContext.destination);
  tone.onended = () => { soundNodes = soundNodes.filter(node => node !== tone); };
  soundNodes.push(tone);
  tone.start(t);
  tone.stop(t+.2);
}
