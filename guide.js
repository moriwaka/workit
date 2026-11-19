import {exercises, phases, isMainType} from './catalog.js?v=17';
import {effort, repSeconds, setLabels, sideSwitchSeconds} from './planner.js?v=23';
import {announce, silence} from './media.js?v=24';

export class Guide {
  constructor(plan, settings, callbacks) {
    this.plan = plan;
    this.settings = settings;
    this.callbacks = callbacks;
    this.index = 0;
    this.phase = 'preview';
    this.results = [];
    this.lastExercise = null;
    this.prepared = false;
    this.firstSideTime = null;
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

  get setLabel() { return setLabels(this.plan.rows)[this.index]; }
  get row() { return this.plan.rows[this.index]; }
  get exercise() { return exercises[this.row.id]; }
  get known() { return this.settings.known.includes(this.row.id); }
  get elapsed() { return this.offset + (this.started === null ? 0 : (performance.now() - this.started)/1000); }
  get isTiming() { return this.phase === 'rest' || this.phase === 'work' || this.phase === 'switch'; }
  get firstSide() { return this.exercise.sides && this.firstSideTime === null; }
  get isMain() { return isMainType(this.exercise.type); }
  get limit() {
    if (this.phase==='rest') return this.row.rest;
    if (this.phase==='switch') return sideSwitchSeconds;
    return effort(this.row) / (this.exercise.sides ? 2 : 1);
  }
  get needsPreparation() {
    if (!this.lastExercise || this.prepared) return false;
    return this.lastExercise.pose !== this.exercise.pose
      || this.lastExercise.gear.length !== this.exercise.gear.length
      || this.lastExercise.gear.some(tool=>!this.exercise.gear.includes(tool));
  }
  get canBegin() {
    return this.known && !this.needsPreparation && (!this.isMain || this.warmed);
  }

  speak(message, sound) { announce(message, this.settings, sound); }
  stopAudio() { silence(); }

  givePreview() {
    const intro = this.phase === 'rest' ? '休憩です。次は、' : '';
    const explanation = this.known ? '' : '。' + this.exercise.steps.join('') + this.exercise.cue;
    const setup = this.needsPreparation ? '。姿勢や道具を確認し、準備できたらボタンを押してください。' : '';
    this.speak(intro + this.exercise.name + '。' + (this.setLabel ? this.setLabel + '。' : '') + this.doseText + explanation + setup,520);
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
    if (this.phase==='waiting' && this.canBegin && !document.hidden) this.begin();
    else this.callbacks.render(true);
  }

  confirmPreparation() {
    if (this.paused || !['rest','waiting'].includes(this.phase) || !this.needsPreparation) return;
    this.prepared = true;
    if (this.phase==='waiting' && this.canBegin && !document.hidden) this.begin();
    else this.callbacks.render(true);
  }

  begin() {
    if (this.paused || !this.canBegin || document.hidden || !['preview','rest','waiting'].includes(this.phase)) return;
    this.stopAudio();
    this.reset('work',true);
    this.lastExercise = this.exercise;
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
    } else if (this.phase==='switch') {
      if (left<=0) {
        this.reset('work',true);
        this.cue('side-start','始めます。',880);
        this.callbacks.render(true);
        return;
      }
    } else if (this.firstSide && left<=0) {
      this.switchSide();
      return;
    } else if (this.row.reps) {
      const total = this.row.reps / (this.exercise.sides ? 2 : 1);
      const reps = Math.min(total,Math.floor(this.elapsed/repSeconds));
      if (reps === total) {
        this.cue('end',`${reps}。終えたら完了を押してください。`,740);
      } else if (reps > 0) {
        this.cue('rep'+reps,String(reps),520);
      }
    } else {
      if (left <= 0) {
        this.complete();
        return;
      }
      if (!this.exercise.sides && this.elapsed >= this.limit/2) {
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

  switchSide() {
    this.firstSideTime = Math.min(this.elapsed,this.limit);
    this.reset('switch',true);
    this.cue('switch','反対側へ。',590);
    this.callbacks.render(true);
  }

  complete() {
    if (this.phase !== 'work' || this.paused) return;
    if (this.firstSide) {
      this.switchSide();
      return;
    }
    if (this.exercise.type==='warm'
      && !this.plan.rows.slice(this.index+1).some(row=>exercises[row.id].type==='warm')
      && this.results.every(result=>result.status==='done')) this.warmed = true;
    this.advance('done');
  }

  record(status) {
    this.active += this.firstSideTime ?? 0;
    if (this.phase === 'work') this.active += this.row.seconds && status === 'done'
      ? Math.min(this.elapsed,this.limit) : this.elapsed;
    this.results.push({row:this.row,status,rating:''});
  }

  advance(status, alreadyRecorded=false) {
    this.stopAudio();
    if (!alreadyRecorded) this.record(status);
    this.index++;
    if (this.index >= this.plan.rows.length) {
      this.finish(false);
      return;
    }
    this.prepared = false;
    this.firstSideTime = null;
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
    if (ended && ['work','switch'].includes(this.phase)) this.record('stopped');
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
