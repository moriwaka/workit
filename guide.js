import {exercises, phases} from './catalog.js?v=6';
import {compatible, effort, nextLoad, repSeconds} from './planner.js?v=6';
import {announce, silence} from './media.js?v=6';

export class Guide {
  constructor(plan, settings, callbacks) {
    this.plan = plan;
    this.settings = settings;
    this.callbacks = callbacks;
    this.index = 0;
    this.phase = 'preview';
    this.results = [];
    this.lastLoad = null;
    this.active = 0;
    this.offset = 0;
    this.started = null;
    this.paused = false;
    this.lastCue = null;
    this.warmed = false;
    this.date = new Date().toISOString();
    this.interval = setInterval(() => this.tick(),100);
    this.givePreview();
  }

  get row() { return this.plan.rows[this.index]; }
  get exercise() { return exercises[this.row.id]; }
  get known() { return this.settings.known.includes(this.row.id); }
  get elapsed() { return this.offset + (this.started === null ? 0 : (performance.now() - this.started)/1000); }
  get isTiming() { return this.phase === 'rest' || this.phase === 'work'; }
  get isMain() { return ['strength','stretch'].includes(this.exercise.type); }
  get limit() { return this.phase === 'rest' ? this.row.rest : effort(this.row); }
  get canBegin() { return this.known && (!this.isMain || this.warmed); }

  speak(message, sound) { announce(message, this.settings, sound); }
  stopAudio() { silence(); }

  givePreview() {
    const intro = this.phase === 'rest' ? '休憩です。次は、' : '';
    const explanation = this.known ? '' : '。' + this.exercise.steps.join('') + this.exercise.cue;
    this.speak(intro + this.exercise.name + '。' + this.doseText + explanation, 520);
  }

  get doseText() {
    const row = this.row;
    if (!this.exercise.sides) return row.seconds ? `${row.seconds}秒` : `${row.reps}回`;
    return row.seconds ? `片側${row.seconds/2}秒ずつ` : `片側${row.reps/2}回ずつ`;
  }

  reset(phase, timed=false) {
    this.phase = phase;
    this.offset = 0;
    this.started = timed ? performance.now() : null;
    this.lastCue = null;
    this.paused = false;
  }

  acknowledge() {
    if (this.paused || !['preview','rest','waiting'].includes(this.phase)) return;
    if (!this.known) {
      this.settings.known.push(this.row.id);
      this.callbacks.save();
    }
    if (this.phase === 'waiting' && this.canBegin && !document.hidden) this.begin();
    this.callbacks.render(true);
  }

  begin() {
    if (this.paused || !this.canBegin || document.hidden || !['preview','rest','waiting'].includes(this.phase)) return;
    this.stopAudio();
    this.reset('work',true);
    this.lastLoad = nextLoad(this.row,this.lastLoad);
    const prompt = this.exercise.type === 'warm' ? '軽い動きから始めます。'
      : this.exercise.held ? '軽く伸ばし、その姿勢を保ちます。'
      : this.exercise.type === 'cool' ? 'ペースを落とします。力を抜きましょう。'
      : this.row.reps ? '始めます。' : '始めます。無理のない範囲で。';
    this.speak(prompt,880);
    this.callbacks.render(true);
  }

  pause() {
    if (this.paused || this.phase === 'pain') return;
    this.offset = this.elapsed;
    this.started = null;
    this.paused = true;
    this.stopAudio();
    this.callbacks.render(true);
  }

  resume() {
    if (!this.paused || document.hidden) return;
    this.paused = false;
    if (this.isTiming) this.started = performance.now();
    this.callbacks.render(true);
  }

  tick() {
    if (document.hidden) {
      this.pause();
      return;
    }
    if (this.paused || !this.isTiming) return;
    const left = Math.ceil(this.limit-this.elapsed);
    if (this.phase === 'rest') {
      if (left <= 0) {
        if (this.canBegin) this.begin();
        else {
          this.reset('waiting');
          this.speak('休憩終了です。画面を確認してください。',740);
          this.callbacks.render(true);
        }
        return;
      }
      if (left <= 3 && this.canBegin) this.cue('rest'+left, String(left),600);
    } else if (this.row.reps) {
      const reps = Math.min(this.row.reps, Math.floor(this.elapsed/repSeconds));
      if (reps === this.row.reps) {
        this.cue('end',`${reps}。終えたら完了を押してください。`,740);
      } else if (reps > 0) {
        const halfway = this.row.reps/2;
        const cue = this.exercise.sides && reps === halfway ? `${reps}。反対側へ。` : String(reps);
        this.cue('rep'+reps,cue,520);
      }
    } else {
      if (left <= 0) {
        this.complete();
        return;
      }
      if (this.exercise.sides && this.elapsed >= this.limit/2) this.cue('side','反対側へ。',590);
      else if (!this.exercise.sides && this.elapsed >= this.limit/2) {
        if (this.row.id==='march') this.cue('pace','息が上がらない範囲で、いつもの歩くペースへ。',590);
        if (this.row.id==='slow-march' || this.row.id==='cool-slide' || this.row.id==='cool-sit-ankles') {
          this.cue('pace','動きを小さくして、もう少しゆっくり。',590);
        }
      }
    }
    this.callbacks.render(false);
  }

  cue(key, message, tone) {
    if (this.lastCue === key) return;
    this.lastCue = key;
    this.stopAudio();
    this.speak(message,tone);
  }

  complete() {
    if (this.phase !== 'work' || this.paused) return;
    if (this.exercise.type==='warm'
      && !this.plan.rows.slice(this.index+1).some(row=>exercises[row.id].type==='warm')
      && this.results.every(result=>result.status==='done')) this.warmed = true;
    this.advance('done');
  }

  record(status) {
    if (this.phase === 'work') this.active += this.row.seconds && status === 'done'
      ? Math.min(this.elapsed,this.limit) : this.elapsed;
    this.results.push({row:this.row,status,rating:''});
  }

  advance(status, alreadyRecorded=false) {
    this.stopAudio();
    if (!alreadyRecorded) this.record(status);
    this.index++;
    while (this.index < this.plan.rows.length && !compatible(this.row,this.lastLoad)) {
      this.results.push({row:this.row,status:'overlap',rating:''});
      this.index++;
    }
    if (this.index >= this.plan.rows.length) {
      this.finish(false);
      return;
    }
    this.reset('rest',true);
    this.givePreview();
    this.callbacks.render(true);
  }

  pain() {
    if (this.phase === 'pain') return;
    this.stopAudio();
    this.record('pain');
    this.reset('pain');
    this.callbacks.render(true);
  }

  finish(ended=true) {
    clearInterval(this.interval);
    this.stopAudio();
    if (ended && this.phase === 'work') this.record('stopped');
    this.callbacks.finish({
      id:crypto.randomUUID(), date:this.date, name:this.plan.name,
      active:Math.round(this.active), ended,
      results:this.results, rating:''
    });
  }

  get phaseLabel() {
    return phases[this.isMain ? 'main' : this.exercise.type];
  }
}
