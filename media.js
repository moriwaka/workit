import {frames} from './catalog.js?v=2';

const pink = '#ed865f';
const purple = '#523290';
const far = '#b8a8d7';
const ink = '#2e2046';
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

function pointBetween(a,b,ratio) {
  return a.map((value,i) => value + (b[i]-value)*ratio);
}

function draw(canvas, exercise, first, last, ratio) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(canvas.width/300,0,0,canvas.height/230,0,0);
  ctx.clearRect(0,0,300,230);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.ellipse(151,116,86,87,0,0,Math.PI*2);
  ctx.fillStyle = '#eee7fb';
  ctx.fill();
  line(ctx,[[40,201],[263,201]],'#d7cae9',2);
  if (exercise.gear.includes('wall') && ['push','calfStretch'].includes(exercise.motion)) {
    line(ctx,[[245,53],[245,200]],'#a68dc4',4);
    for (let y=65;y<190;y+=12) line(ctx,[[246,y],[254,y-8]],'#d6c6ec',1.5);
  }
  if (exercise.gear.includes('step')) {
    ctx.fillStyle = '#bba8df';
    ctx.fillRect(191,175,51,25);
    line(ctx,[[191,175],[242,175]],purple,3);
  }
  const p = Object.fromEntries(Object.keys(first).map(key => [key,pointBetween(first[key],last[key],ratio)]));
  line(ctx,[p.hip,p.rk,p.rf],far,9);
  line(ctx,[p.rs,p.re,p.rh],far);
  line(ctx,[p.neck,p.hip],purple,16);
  line(ctx,[p.ls,p.rs],purple,9);
  line(ctx,[p.hip,p.lk,p.lf],purple,9);
  line(ctx,[p.ls,p.le,p.lh],purple);
  line(ctx,[p.rf,[p.rf[0]+8,p.rf[1]+3]],far,5);
  line(ctx,[p.lf,[p.lf[0]+9,p.lf[1]+3]],purple,5);
  disk(ctx,p.head,13,pink);
  disk(ctx,[p.head[0]+5,p.head[1]-2],1.6,ink);
  disk(ctx,p.lk,3.2,pink);
  disk(ctx,p.le,3.2,pink);
  if (exercise.gear.includes('band')) {
    line(ctx,[pointBetween(p.hip,p.lk,.86),pointBetween(p.hip,p.rk,.86)],pink,4);
  }
}

export function attachDiagram(canvas, exercise) {
  const [first,last] = frames(exercise);
  diagrams.set(canvas,{exercise,first,last,started:performance.now(), paused:reducedMotion.matches});
  draw(canvas,exercise,first,last,0);
}

export function toggleDiagram(canvas) {
  const state = diagrams.get(canvas);
  state.paused = !state.paused;
  if (state.paused) {
    draw(canvas,state.exercise,state.first,state.last,1);
  } else {
    state.started = performance.now();
  }
  return state.paused;
}

function animate(now) {
  for (const canvas of document.querySelectorAll('canvas[data-diagram]')) {
    const state = diagrams.get(canvas);
    if (!state || state.paused || state.exercise.still) continue;
    const cycle = state.exercise.type === 'stretch' ? 5 : 4;
    const elapsed = (now - state.started) / 1000;
    const phase = (elapsed % cycle) / cycle;
    const ratio = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    draw(canvas,state.exercise,state.first,state.last,ratio);
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
