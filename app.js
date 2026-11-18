import {poses, gear, zones, purposes, phases, levels, exercises, catalog, seatedDiagrams, diagramStages, footGuides} from './catalog.js?v=16';
import {defaultSettings, ratingLabels, statusLabels, generate, estimate, alternatives, allowed, floorChanges, validate, repSeconds, explainPlan, menuMinutes, setLabels, sideSwitchSeconds} from './planner.js?v=18';
import {attachDiagram, setDiagramFrame, announce, voiceAvailable, silence, unlockSound} from './media.js?v=19';
import {Guide} from './guide.js?v=19';
import {curatedSource, evidence, intensity, references} from './evidence.js?v=16';
import {defaultLibraryFilters, exerciseTypes, filterExercises, hiitById, libraryGear, libraryPoses, workoutBreakdown} from './workout-view.js?v=3';
import {hiitDifficulty, hiitGroups, hiitSubgroups} from './hiit-library.js?v=2';

const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const notice = document.querySelector('#notice');
const storageKey = 'workit:v1';
const fresh = () => ({version:1, settings:structuredClone(defaultSettings), saved:[], history:[]});
let data = fresh();
let loadError = false;
try {
  const stored = localStorage.getItem(storageKey);
  if (stored) data = validate(JSON.parse(stored));
} catch { loadError = true; }
const selectablePoses = Object.fromEntries(Object.entries(poses).filter(([pose]) =>
  catalog.some(item => item.pose === pose && Object.hasOwn(curatedSource,item.id))));
let options = {purpose:'mixed', minutes:15, poses:Object.keys(selectablePoses)};
let plan = null;
let planSettingsKey = '';
let session = null;
let summary = null;
let messageTimer;
let failedOptions = null;
let planSuggestions = [];
let libraryFilters = {...defaultLibraryFilters};
let guideFullscreen = false;

const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const button = (text, action, style='', value='', attrs='') =>
  `<button type="button" class="btn ${style}" data-action="${action}" data-value="${escape(value)}" ${attrs}>${text}</button>`;
const checkbox = (key, label, checked, name, kind='checkbox') =>
  `<label class="choice"><input type="${kind}" name="${name}" value="${escape(key)}" ${checked ? 'checked' : ''}><span>${escape(label)}</span></label>`;
const choices = (table, active, name, kind) => Object.entries(table).map(([key,label]) => checkbox(key,label,active.includes(key),name,kind)).join('');
const clock = sec => `${Math.floor(Math.max(0,sec)/60)}:${String(Math.max(0,sec)%60).padStart(2,'0')}`;
const humanTime = sec => `${Math.floor(sec/60)}分${sec%60 ? `${sec%60}秒` : ''}`;
const formatDate = date => new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeStyle:'short'}).format(new Date(date));

function snackbar(message) {
  notice.hidden = false;
  notice.textContent = message;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => { notice.hidden = true; },5000);
}

function save() {
  try {
    localStorage.setItem(storageKey,JSON.stringify(data));
    return true;
  } catch {
    snackbar('ブラウザに保存できません。設定画面からバックアップを保存できます。');
    return false;
  }
}

function openDialog(markup) {
  dialog.innerHTML = markup;
  dialog.showModal();
}

function confirmDialog(title, message, action, value='', label='確定') {
  openDialog(`<h2>${title}</h2><p>${message}</p><div class="actions end">${button('キャンセル','close')}${button(label,action,'danger',value)}</div>`);
}

function diagram(item) {
  const guide = seatedDiagrams[item.motion];
  const footGuide = item.diagram ?? footGuides[item.motion];
  const staged = item.diagram?.stages ?? diagramStages[item.motion];
  const indexed = staged?.flatMap((stage,index)=>stage.button ? [[index,stage.button]] : []) ?? footGuide?.buttons;
  const positions = indexed ? indexed.map(([index,label])=>[`pose-${index}`,label])
    : [['start','開始姿勢'],['end','動かした後']];
  positions.push(['play','アニメ']);
  const initial = item.still || matchMedia('(prefers-reduced-motion: reduce)').matches ? positions[0][0] : 'play';
  return `<figure class="diagram">
    <canvas width="600" height="460" data-diagram="${item.id}" role="img" aria-label="${escape(item.name)}の動作図">${escape(item.name)}</canvas>
    ${item.still ? '' : `<div class="diagram-controls" role="group" aria-label="動作図の表示">
      ${positions.map(([mode,label]) => button(label,'diagram','small',mode,`aria-pressed="${mode===initial}"`)).join('')}</div>`}
    <div class="foot-key"><span><i class="heel-mark"></i>かかと</span><span><i class="toe-mark"></i>つま先</span>${footGuide || item.motion==='heelDig' ? '<span><i class="contact-mark"></i>床・台に触れる部分</span>' : ''}</div>
    ${footGuide ? `<figcaption>${escape(footGuide.caption)}</figcaption>` : ''}
    ${item.motion==='heelDig' ? '<figcaption>前に出した足は、かかとだけ床につけ、つま先を上へ向けます。</figcaption>' : ''}
    ${item.motion==='kneeRoll' ? '<figcaption>両肩を床につけたまま、そろえた膝を片側へ倒し、中央に戻してから反対側へ。</figcaption>' : ''}
    ${guide?.labels.length ? `<figcaption>${guide.labels.map((label,index) => `<span>${guide.labels.length>1 ? (index===0 ? '<strong>開始</strong> ' : '<strong>動き</strong> ') : ''}${escape(label)}</span>`).join('')}</figcaption>` : ''}
    </figure>`;
}

function initDiagrams(container = document) {
  container.querySelectorAll('canvas[data-diagram]').forEach(node => {
    const {diagram:id} = node.dataset;
    attachDiagram(node,exercises[id] ?? hiitById[id]);
  });
}

function sourceLink(key, text) {
  const [label,url] = references[key];
  return `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text ?? label)}</a>`;
}

function description(item) {
  const entry = evidence[item.id];
  const sources = entry.refs.map(key => '<li>'+sourceLink(key)+'</li>').join('');
  const hiit = hiitById[item.id];
  return `<ol>${item.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>
    <p class="subtle"><strong>主に使う・伸ばす部位</strong>　${escape(entry.target)}</p>
    <p class="subtle"><strong>強度の目安</strong>　${escape(intensity[item.type])}</p>
    <p class="alert">${escape(item.cue)}</p>
    ${entry.demo ? `<p class="demo-reference">${sourceLink(entry.demo,'参考イラストを開く（外部サイト）')}</p>` : ''}
    <details class="move-sources"><summary>種目名・参考資料</summary>
      ${entry.name ? `<p class="subtle">${escape(entry.name)}</p>` : ''}
      ${curatedSource[item.id] ? `<p class="subtle">種目の出典　${sourceLink(curatedSource[item.id])}</p>` : ''}
      <p class="subtle">表示する回数や秒数は、workit での開始目安です。</p>
      <ul>${sources}</ul>
      ${hiit ? `<p class="subtle"><strong>HIIT Builder での動き方</strong>　${escape(hiit.summary)}</p>
        <ul>${hiitSourceLinks(hiit)}</ul>` : ''}</details>`;
}

function duration(row) {
  const side = exercises[row.id].sides;
  const value = row.seconds ?? row.reps;
  const perSide = value / (side ? 2 : 1);
  return (side ? '左右各' : '') + (row.seconds
    ? perSide>=60 ? humanTime(perSide) : `${perSide}秒`
    : `${perSide}回`);
}

function details(item) {
  return [poses[item.pose], ...item.gear.map(key => gear[key])].join(' · ');
}

const hero = `<section class="hero">
  <div class="hero-copy"><h1>自宅トレーニング</h1><p>目的と今日できる姿勢を選び、動きと音声のガイドに沿って進めます。</p></div>
  <svg class="hero-art" viewBox="0 0 520 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <ellipse cx="377" cy="113" rx="164" ry="99" fill="#402860"/>
    <ellipse cx="377" cy="113" rx="180" ry="117" fill="none" stroke="#674d8b" stroke-width="1"/>
    <ellipse cx="377" cy="113" rx="198" ry="135" fill="none" stroke="#543b75" stroke-width="1"/>
    <path d="M18 125h103l18-27 32 42 26-91 39 123 31-81 22 34h225" fill="none" stroke="#614780" stroke-width="2"/>
    <path d="M264 127h37l22-29 22 45 29-75 30 88 22-29h55" fill="none" stroke="#f5a282" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="374" cy="68" r="5" fill="#ffe4d8"/><circle cx="481" cy="127" r="4" fill="#f5a282"/>
  </svg>
</section>`;

function renderPlan() {
  planSuggestions = [];
  app.innerHTML = hero + `<div class="layout">
  <form id="plan-form" class="panel stack">
    <h2>メニュー作成</h2>
    <fieldset><legend>目的</legend><div class="chips">${choices(purposes,[options.purpose],'purpose','radio')}</div></fieldset>
    <fieldset><legend>所要時間の目安</legend><div class="chips">${menuMinutes.map(n => checkbox(n,`${n}分`,options.minutes===n,'minutes','radio')).join('')}</div></fieldset>
    <fieldset><legend>今日できる姿勢</legend><div class="chips">${choices(selectablePoses,options.poses,'pose')}</div></fieldset>
    <div class="subtle plan-settings"><p>強度 ${levels[data.settings.level]}　·　道具 ${data.settings.gear.map(key => gear[key]).join('、') || 'なし'}　<a href="#settings">変更</a></p>
      <p>除外中の部位 ${data.settings.blocked.map(key=>zones[key]).join('、') || 'なし'}</p></div>
    <button class="btn primary wide" type="submit">メニューを作る <span aria-hidden="true">→</span></button>
  </form>
  <section id="plan-result" class="panel" aria-label="作成したメニュー">${planResult()}</section></div>`;
}

function planResult() {
  return plan ? planMarkup() : `<div class="section-title"><h2>トレーニングメニュー</h2></div>
    ${failedOptions ? limitationNotice(failedOptions,null) : '<div class="empty"><p>目的・時間・姿勢を選んで、今日のメニューを作りましょう。</p><p>先に動きを確認するなら、<a href="#library">種目ライブラリへ</a>。</p></div>'}`;
}

function focusPlanResult() {
  const heading = document.querySelector('#plan-result h2');
  heading?.setAttribute('tabindex','-1');
  heading?.focus();
}

function generationSettings() {
  const {gear,blocked,excluded,level,adjustments} = data.settings;
  return JSON.stringify([level,[...gear].sort(),[...blocked].sort(),[...excluded].sort(),Object.entries(adjustments).sort()]);
}

function planNeedsRefresh() {
  if (!plan) return false;
  const old = plan.options;
  return old.purpose!==options.purpose || old.minutes!==options.minutes
    || old.poses.length!==options.poses.length || old.poses.some(pose=>!options.poses.includes(pose))
    || generationSettings()!==planSettingsKey;
}

const mainRows = rows => rows.filter(row=>['strength','stretch'].includes(exercises[row.id].type));

function mainCount(rows) {
  const main = mainRows(rows);
  const count = new Set(main.map(row=>row.id)).size;
  return `${count}種目${main.length>count ? `・計${main.length}セット` : ''}`;
}

function planMarkup() {
  const time = estimate(plan.rows);
  const labels = setLabels(plan.rows);
  const breakdown = workoutBreakdown(plan.rows);
  const unavailable = validPlan() ? '' : 'disabled';
  return `<div class="section-title"><h2>${escape(plan.name)}</h2><span class="badge">約${humanTime(time)}</span></div>
    <p class="subtle">${mainCount(plan.rows)} ＋ 準備運動・整理運動　·　種目名を押すと動き・負荷部位・出典を確認できます</p>
    <section class="workout-overview" aria-label="メニューの時間配分">
      <div class="phase-strip" aria-hidden="true">${breakdown.map(block=>`<span class="phase-${block.phase}" style="flex:${block.percent}"></span>`).join('')}</div>
      <dl class="phase-totals">${breakdown.map(block=>`<div class="phase-total-${block.phase}"><dt>${phases[block.phase]}</dt><dd>${humanTime(block.seconds)}</dd></div>`).join('')}</dl>
      <p class="subtle">休憩・左右の切り替えを含む目安</p>
    </section>
    ${planNotice()}
    <div class="actions plan-start">${button('ガイドを始める','start-dialog','primary','',unavailable)}${button('メニューを保存','save-dialog','','',unavailable)}</div>
    ${Object.entries(phases).map(([phase,label]) => `<section class="routine-section"><h3>${label}${phase==='main' ? '' :
      ` · 約${humanTime(breakdown.find(block=>block.phase===phase)?.seconds ?? 0)}`}</h3>
      ${plan.rows.map((row,index) => {
        const item = exercises[row.id];
        const kind = ['warm','cool'].includes(item.type) ? item.type : 'main';
        if (kind !== phase) return '';
        const set = labels[index] ? ` · ${labels[index]}` : '';
        return `<div class="routine-row"><div><button type="button" class="move-name" data-action="preview" data-value="${row.id}">${escape(item.name)}${set}</button>
          <div class="move-meta">${details(item)}${item.sides ? ` · 左右の切り替え ${sideSwitchSeconds}秒` : ''}${index ? ` · 前に休憩 ${row.rest}秒` : ''}</div></div>
          <span class="badge">${duration(row)}</span>${button('差し替え','replace','small',index, `aria-label="${escape(item.name)}${set}を差し替え"`)}</div>`;
      }).join('')}</section>`).join('')}
    `;
}

function planNotice() {
  if (planNeedsRefresh()) return '<div class="alert plan-limit" role="status"><p>条件が変わりました。このメニューの開始・保存には作り直しが必要です。</p><div><button class="btn small" type="submit" form="plan-form">この条件で作り直す</button></div></div>';
  if (plan.rows.some(row => !Object.hasOwn(curatedSource,row.id))) {
    return '<p class="alert">この保存メニューには現在の種目集にない動作が含まれています。「メニューを作る」を押すと、出典のある種目で作り直せます。</p>';
  }
  if (!validPlan()) return '<p class="alert">現在の設定で使えない種目があります。差し替えるか、メニューを作り直してください。</p>';
  if (floorChanges(plan.rows) > 1) return '<p class="alert">このメニューは立位と床を複数回切り替えます。「メニューを作る」を押すと、現在の条件で姿勢をまとめたメニューを作れます。</p>';
  return limitationNotice(plan.options,plan.rows);
}

function limitationNotice(request, rows) {
  const limitation = explainPlan(request,data.settings,rows);
  if (!limitation) return '';
  planSuggestions = limitation.suggestions;
  const labels = {strength:'筋力',stretch:'柔軟性'};
  const reasons = {
    poses:'できる姿勢が選ばれていません。今日できる姿勢を選んでください。',
    main:'選んだ姿勢・目的・設定に合う本編の種目がありません。',
    warm:'選んだ姿勢と設定で使えるウォームアップがありません。',
    cool:'選んだ姿勢と設定で使えるクールダウンがありません。',
    type:'選んだ姿勢と設定に合う種目が、片方の種類に限られています。',
    sequence:`条件に合う本編の候補は ${limitation.eligibleMain} 種目です。${request.minutes>=30 ? '自動作成では、各種目を最大3セットまで組み込みます。' : '立位と床を往復せず、運動時間と休憩を含めて組みました。'}`,
    fit:'休憩・準備運動・整理運動を含めると、今の条件で本編まで組めません。'
  };
  const summary = rows
    ? `指定 ${request.minutes}分 → 約${humanTime(limitation.time)}${limitation.gap>75 ? `（約${humanTime(limitation.gap)}短い）` : ''}`
    : `指定 ${request.minutes}分のメニューを作れませんでした`;
  const missing = rows && limitation.missing.length ? `<p>${limitation.missing.map(type=>labels[type]).join('・')}の種目を組み込めませんでした。</p>` : '';
  const actions = planSuggestions.map((item,index)=>{
    const label = item.kind==='pose' ? `「${poses[item.value]}」を追加`
      : item.kind==='time' ? `${item.value}分に変更` : `目的を「${purposes[item.value]}」に変更`;
    return button(`${label}（約${humanTime(item.time)}）`,'apply-plan-suggestion','small',index);
  });
  const next = actions.length
    ? `<p>${rows ? '今のメニューで始めることもできます。' : ''}今日できる条件があれば、下のボタンで作り直せます。</p><div class="actions">${actions.join('')}</div>`
    : rows ? '<p>この時間でそのまま始められます。</p>'
      : limitation.reason==='poses' ? '' : '<p>使える道具があれば <a href="#settings">設定</a> に追加するか、別の目的・姿勢を選んでください。</p>';
  return `<div class="alert plan-limit" role="region" aria-label="メニューの条件"><p><strong>${summary}</strong></p>
    ${missing}<p>${reasons[limitation.reason]}</p>${next}</div>`;
}

function validPlan() {
  return plan && !planNeedsRefresh() && plan.rows.every(row => allowed(exercises[row.id],plan.options,data.settings)
    && options.poses.includes(exercises[row.id].pose));
}

function renderLibrary() {
  const option = (key,text,value) => `<option value="${key}" ${value===key ? 'selected' : ''}>${escape(text)}</option>`;
  const optionsFor = (table,value) => Object.entries(table).map(([key,text])=>option(key,text,value)).join('');
  const select = (name,label,options) => `<label class="stack">${label}<select name="${name}"><option value="">すべて</option>${options}</select></label>`;
  const classifications = Object.entries(hiitGroups).map(([key,label])=>`<optgroup label="${label}">
    ${option(key,label+'（すべて）',libraryFilters.classification)}
    ${Object.entries(hiitSubgroups).filter(([,sub])=>sub.group===key)
      .map(([id,sub])=>option(id,sub.name,libraryFilters.classification)).join('')}</optgroup>`).join('');
  app.innerHTML = `<section class="page library-page"><div class="page-head"><h1>種目ライブラリ</h1><a class="btn" href="#plan">メニューを作る</a></div>
    <p class="library-intro">種目を開くと、動き方・負荷の目安・参考資料を確認できます。</p>
    <form id="library-filters" class="panel library-filters" role="search" aria-label="種目を検索">
      <label class="stack library-query">種目名・部位・道具<input type="search" name="query" value="${escape(libraryFilters.query)}" placeholder="例：スクワット、太もも、壁" autocomplete="off"></label>
      ${select('pose','姿勢',optionsFor(libraryPoses,libraryFilters.pose))}
      ${select('type','種類',optionsFor(exerciseTypes,libraryFilters.type))}
      ${select('classification','HIIT の分類',classifications)}
      <div class="library-checks">
        <label><input type="checkbox" name="available" ${libraryFilters.availableOnly ? 'checked' : ''}>現在の設定でメニューに使える種目だけ</label>
        <label><input type="checkbox" name="noJump" ${libraryFilters.noJump ? 'checked' : ''}>ジャンプなし</label>
      </div>
      <a href="#settings" class="subtle">道具・強度・除外する部位の設定</a>
    </form>
    <p id="library-count" class="subtle library-count" role="status" aria-live="polite"></p>
    <div id="library-results" class="library-grid"></div></section>`;
  updateLibraryResults();
}

function libraryEquipment(item) {
  return item.gear.map(key=>libraryGear[key]).join('・') || '道具なし';
}

function hiitSourceLinks(item) {
  return item.sources.map(({title,url})=>`<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(title)}（HIIT Builder）</a></li>`).join('');
}

function previewHiit(item) {
  const referenceLinks = item.diagram?.references.map(({title,url})=>
    `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(title)}</a></li>`).join('') ?? '';
  openDialog(`<h2>${escape(item.name)}</h2>
    <p class="subtle">${hiitGroups[item.group]} · ${hiitSubgroups[item.subgroup].name} · ${libraryPoses[item.pose]}</p>
    ${item.diagram ? diagram(item) : ''}
    <dl class="hiit-details">
      <dt>動き方</dt><dd>${escape(item.summary)}</dd>
      <dt>主に使う部位</dt><dd>${escape(item.target)}</dd>
      <dt>道具</dt><dd>${libraryEquipment(item)}</dd>
      <dt>強度・跳躍</dt><dd>${hiitDifficulty[item.difficulty]} · ${item.jumps ? 'ジャンプあり' : 'ジャンプなし'}</dd>
    </dl>
    <p class="subtle">${item.diagram ? '動作図の参考資料' : '出典ページで動作アニメーションや難易度を変えた例を確認できます。'}</p>
    <ul>${referenceLinks}${hiitSourceLinks(item)}</ul>
    <div class="actions end">${button('閉じる','close')}</div>`);
  initDiagrams(dialog);
}

function updateLibraryResults() {
  const matches = filterExercises(libraryFilters,data.settings);
  document.querySelector('#library-count').textContent = `${matches.length}種目`;
  document.querySelector('#library-results').innerHTML = matches.length ? matches.map(item=> {
    const available = item.supportsGuide && allowed(item,{poses:Object.keys(selectablePoses)},data.settings);
    const category = item.hiit ? hiitGroups[item.hiit.group] : exerciseTypes[item.type];
    const status = item.supportsGuide ? levels[item.level]+(available ? '' : ' · 現在の設定では対象外')
      : hiitDifficulty[item.difficulty]+(item.jumps ? ' · ジャンプあり' : '')+' · 資料参照';
    return `<article class="list-card library-card"><div class="section-title"><span class="mini">${category}</span><span class="badge">${libraryPoses[item.pose]}</span></div>
      <h2>${escape(item.name)}</h2><p class="subtle">${escape(item.target)}</p>
      <p class="subtle">${libraryEquipment(item)} · ${status}</p>
      <div>${button('動きを確認',item.supportsGuide ? 'preview' : 'preview-hiit','',item.id,`aria-label="${escape(item.name)}の動きを確認"`)}</div></article>`;
  }).join('') : `<div class="empty library-empty"><p>条件に合う種目がありません。</p><p>検索語や絞り込みを変えてみてください。</p>${button('絞り込みをリセット','reset-library')}</div>`;
}

function readLibraryFilters(form) {
  const values = new FormData(form);
  libraryFilters = {
    query:values.get('query'),pose:values.get('pose'),type:values.get('type'),classification:values.get('classification'),
    availableOnly:values.has('available'),noJump:values.has('noJump')
  };
  updateLibraryResults();
}

function renderSaved() {
  app.innerHTML = `<section class="page"><div class="page-head"><h1>保存メニュー</h1><a class="btn" href="#plan">メニュー作成</a></div>
  <div class="stack">${data.saved.length ? data.saved.map(entry => `<article class="panel list-card">
  <h2>${escape(entry.name)}</h2><p class="subtle">${purposes[entry.options.purpose]} · 約${humanTime(estimate(entry.rows))} · ${mainCount(entry.rows)}</p>
  <div class="actions">${button('メニューを開く','open-plan','primary',entry.id)}${button('削除','delete-plan-dialog','danger',entry.id)}</div></article>`).join('') : '<p class="empty">保存したメニューはまだありません。</p>'}</div></section>`;
}

function renderHistory() {
  app.innerHTML = `<section class="page"><div class="page-head"><h1>トレーニング履歴</h1><a class="btn" href="#settings">バックアップ</a></div>
  <div class="stack">${data.history.length ? [...data.history].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).map(entry => `<article class="panel list-card">
  <h2>${escape(entry.name)}</h2><p class="subtle">${formatDate(entry.date)} · 運動 ${humanTime(entry.active)} · ${entry.ended ? '途中終了' : '終了'}${entry.rating ? ' · '+ratingLabels[entry.rating] : ''}</p>
  <details><summary>種目別の記録（${entry.results.length}件）</summary><ul>${entry.results.map(res => `<li>${escape(exercises[res.row.id].name)} · ${statusLabels[res.status]}${res.rating ? ' · '+ratingLabels[res.rating] : ''} <span class="subtle">（予定 ${duration(res.row)}）</span></li>`).join('')}</ul></details>
  <div>${button('削除','delete-history-dialog','danger small',entry.id)}</div></article>`).join('') : '<p class="empty">トレーニングの記録はまだありません。</p>'}</div></section>`;
}

function voiceStatus() {
  return voiceAvailable() ? '端末の日本語音声を使います。' : '端末内の日本語音声を利用できない場合は、合図音と画面表示で案内します。';
}

function renderSettings() {
  const s = data.settings;
  app.innerHTML = `<section class="page"><div class="page-head"><h1>設定</h1></div><div class="stack">
  <section class="panel stack"><h2>運動の条件</h2>
    <fieldset><legend>使える道具</legend><div class="chips">${choices(gear,s.gear,'gear')}</div></fieldset>
    <fieldset><legend>ふだんの強度</legend><div class="chips">${levels.map((item,i) => checkbox(i,item,s.level===i,'level','radio')).join('')}</div>
    <p class="subtle">筋トレの開始目安は入門4回・軽め6回・標準8回。左右で行う種目は片側ごとの回数です。バンドの抵抗や動かす範囲によって、同じ回数でもきつさが変わります。</p></fieldset>
    <fieldset><legend>負荷を避けたい部位</legend><div class="chips">${choices(zones,s.blocked,'blocked')}</div></fieldset>
    <div><h3 class="field-label">今後も除外する種目</h3>${s.excluded.length ? `<div class="actions">${s.excluded.map(id => button(escape(exercises[id].name)+'の除外を解除','allow','small',id)).join('')}</div>` : '<p class="subtle">除外した種目はありません。</p>'}</div>
    ${Object.keys(s.adjustments).length ? '<div>'+button('種目ごとの負荷調整をリセット','reset-adjust')+'</div>' : ''}
  </section>
  <section class="panel stack"><h2>音声と合図</h2>
    <label><input type="checkbox" name="voice" ${s.voice ? 'checked' : ''}> 音声ガイドと合図音を使う</label>
    <label>音量 <input type="range" name="volume" min="0" max="100" value="${s.volume}"> <output id="volume-label">${s.volume}%</output></label>
    <p class="subtle" id="voice-info">${voiceStatus()}</p><div>${button('音声を試す','test-voice')}</div>
  </section>
  <section class="panel stack"><h2>バックアップ</h2>
    <p class="subtle">履歴・設定・保存メニューをJSONでまとめて保存します。復元すると、このブラウザのworkitデータが置き換わります。</p>
    <div class="actions">${button('JSONで保存','export')}${button('JSONから復元','import')}<input id="import-file" type="file" accept=".json,application/json" hidden></div>
  </section></div></section>`;
}

const safetyContent = `<p>体調と足元を確認し、軽い強度から始めましょう。伸ばす動きは痛みが出る手前で止め、反動をつけず、息を止めずに行います。</p>
<ul><li>運動できる広さを確保し、踏み台は低く安定したものを使います。バンドは使う前に傷や劣化がないか確かめてください。</li>
<li>胸の痛み、めまい、強い息切れ、強い痛みなどの異常を感じたら、すぐに運動を中止してください。</li>
<li>けがや持病があり、運動を始めてよいか判断がつかない場合は、事前に医療専門職に相談してください。</li></ul>`;

function renderSafety() {
  app.innerHTML = `<section class="page"><div class="page-head"><h1>運動前の確認・出典</h1></div><article class="panel readable">
    ${safetyContent}<h2>ウォームアップとクールダウン</h2>
    <p>準備運動は軽い足踏みなどから始め、本編で使う関節を小さく動かします。整理運動は徐々にペースを落とし、姿勢や道具の条件が合えば軽いストレッチを入れます。短時間・低強度の室内メニューや、床の姿勢に限定したメニューでは時間を調整します。</p>
    <h2>リハビリ資料・ヨガの種目</h2>
    <p>リハビリ資料は動作を確認するために使っています。治療中は担当の医師や理学療法士の指示を優先してください。ヨガは呼吸を止めず、関節を強く押し込まずに行い、姿勢を保ちづらいときはスキップできます。</p>
    <h2>強度の決め方</h2>
    <p>準備運動は会話できる軽いペースから始めます。筋トレは無理なく続けられる回数から始め、フォームと運動後のきつさを見て徐々に調整します。ストレッチは軽い張りを目安にします。表示する回数・秒数は workit の開始設定です。</p>
    <h2>参考資料</h2><ul>
    <li>${sourceLink('jpStrength')}</li><li>${sourceLink('cdc')}</li><li>${sourceLink('yogaSafety')}</li>
    <li>${sourceLink('nhsWarm')}</li><li>${sourceLink('nhsStretch')}</li><li>${sourceLink('nhsCool')}</li>
    <li><a href="https://kennet.mhlw.go.jp/information/information/exercise/s-00-008.html" target="_blank" rel="noopener noreferrer">厚生労働省「身体活動・運動を安全に行うためのポイント」</a></li>
    <li><a href="https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down" target="_blank" rel="noopener noreferrer">American Heart Association「Warm Up, Cool Down」</a></li>
    <li><a href="https://www.cuh.nhs.uk/patient-information/hip-strengthening-exercises/" target="_blank" rel="noopener noreferrer">Cambridge University Hospitals「Hip strengthening exercises」</a></li>
    <li><a href="https://www.nhs.uk/live-well/exercise/strength-exercises/" target="_blank" rel="noopener noreferrer">NHS「Strength exercises」</a></li>
    </ul></article></section>`;
}

function renderGuide(focus=false) {
  if (!session) return;
  const guide = session;
  const item = guide.exercise;
  const next = guide.plan.rows[guide.index+1];
  const nextSet = next ? setLabels(guide.plan.rows)[guide.index+1] : '';
  const preview = ['preview','rest','waiting'].includes(guide.phase);
  const resting = guide.phase==='rest';
  const betweenExercises = resting || guide.phase==='waiting';
  const exerciseName = escape(item.name) + (guide.setLabel ? ` · ${guide.setLabel}` : '');
  const stage = {preview:'最初の種目',switch:'反対側へ切り替え',work:guide.phaseLabel,pain:'痛みで停止中'}[guide.phase];
  const restBanner = betweenExercises ? `<section class="guide-rest ${resting ? '' : 'guide-rest-ended'}" aria-labelledby="guide-stage">
    <div><h2 id="guide-stage" tabindex="-1">${resting ? '休憩中' : '休憩終了'}</h2>
      <p>次は ${exerciseName}</p></div>
    ${resting ? `<div class="rest-countdown"><span id="count-caption">${guide.paused ? '一時停止中' : '残り'}</span>
      <span class="clock" id="count" role="timer"></span></div>` : guide.paused ? '<span>一時停止中</span>' : ''}
    </section>` : '';
  let primary = '';
  if (guide.phase==='pain') primary = button('トレーニングを終了','guide-end','danger');
  else if (!guide.paused) {
    if (preview && !guide.known) primary = button('動きがわかった','ack','primary');
    else if (preview && guide.isMain && !guide.warmed) primary = button('準備運動を済ませた','confirm-warm','primary');
    else if (preview && guide.needsPreparation) primary = button('準備できた','guide-ready','primary');
    else if (guide.phase==='preview') primary = button('運動を開始','begin','primary');
    else if (guide.phase==='work' && guide.row.reps) primary = button(guide.firstSide ? '片側を終えた' : '完了','done','primary');
  }
  const fixedControls = guide.phase==='pain' ? primary
    : primary + (guide.paused ? button('再開','resume','primary') : button('一時停止','pause'))
      + button('痛みが出た','pain','danger');
  const secondary = guide.phase==='pain'
    ? button('症状が落ち着いたので種目を飛ばす','pain-skip')
    : (!guide.paused && preview ? button('説明を聞く','replay') : '')
      + button('スキップ','skip')
      + '<details class="guide-more"><summary>その他の操作</summary>'
      + button('今後も除外','exclude-dialog') + '</details>';
  app.innerHTML = `<div class="guide-head"><h1>${guide.phaseLabel}</h1><div class="inline"><span class="subtle">${guide.index+1} / ${guide.plan.rows.length}</span>
    ${document.fullscreenEnabled ? button(document.fullscreenElement ? '全画面を閉じる' : '全画面','fullscreen','small','',`aria-pressed="${Boolean(document.fullscreenElement)}"`) : ''}
    ${button('終了','guide-end-dialog','danger small')}</div></div>
    <progress class="progress" value="${guide.index}" max="${guide.plan.rows.length}" aria-label="トレーニングの進行"></progress>
    ${restBanner}
    <div class="guide-grid">${diagram(item)}
    <section class="panel guide-copy">
      ${betweenExercises ? '<p class="mini">次の種目の動き</p>' : `<p class="mini" id="guide-stage" tabindex="-1">${guide.paused ? '一時停止中' : stage}</p>
        <h2>${exerciseName}</h2>`}
      <p class="subtle">${details(item)} · ${duration(guide.row)}</p>
      ${betweenExercises ? '' : '<div class="scores"><span class="clock" id="count"></span><span class="subtle" id="count-caption"></span></div>'}
      ${guide.phase === 'pain' ? '<p class="alert">運動を止めてください。強い痛み、胸の痛み、めまいなどがある場合は、セッションを終了してください。</p>' : description(item)}
      ${preview && !guide.known ? '<p class="subtle">アニメと説明を確認してから「動きがわかった」を押してください。</p>' : ''}
      ${preview && guide.isMain && !guide.warmed ? '<p class="alert">準備運動を飛ばしました。本編へ進む前に準備運動を済ませてください。</p>' : ''}
      ${preview && guide.needsPreparation ? '<p class="alert">姿勢や道具が変わります。「準備できた」を押すまで次の種目は始まりません。</p>' : ''}
      <div class="guide-next"><span class="mini">${next ? 'この種目の次' : '最後の種目'}</span><p>${next ? `${escape(exercises[next.id].name)}${nextSet ? ` · ${nextSet}` : ''}` : '終わったら、今日の記録を確認しましょう。'}</p>
        ${next ? `<span class="subtle">${duration(next)} · 前に休憩 ${next.rest}秒${item.pose!==exercises[next.id].pose ? ` · ${poses[exercises[next.id].pose]}へ` : ''}</span>` : ''}</div>
      <div class="controls">${secondary}</div>
    </section></div>
    <div class="guide-actions" role="group" aria-label="運動中の操作"><div>${fixedControls}</div></div>`;
  initDiagrams(app);
  updateClock();
  if (focus) document.querySelector('#guide-stage').focus({preventScroll:true});
}

function updateClock() {
  const count = document.querySelector('#count');
  if (!count || !session) return;
  const caption = document.querySelector('#count-caption');
  const inWork = session.phase === 'work';
  const split = session.exercise.sides;
  const side = split ? session.firstSide ? '片側 · ' : '反対側 · ' : '';
  if (inWork && session.row.reps) {
    const total = session.row.reps / (split ? 2 : 1);
    const reps = Math.min(total, Math.floor(session.elapsed/repSeconds));
    count.textContent = `${reps} / ${total}`;
    caption.textContent = reps === total && !session.firstSide ? '終えたら「完了」' : side + '回数の目安';
  } else if (session.isTiming) {
    count.textContent = clock(Math.max(0,Math.ceil(session.limit-session.elapsed)));
    if (session.phase!=='rest') caption.textContent = inWork ? side + '運動の残り時間' : '切り替えの残り時間';
  } else {
    count.textContent = '';
    caption.textContent = '';
  }
}

function recommendations(entry) {
  const adjustments = [];
  const s = data.settings;
  const pain = entry.results.some(result => result.status === 'pain');
  if (entry.rating === 'hard' && s.level > 0) {
    adjustments.push({key:'level',value:s.level-1,label:`全体の強度を「${levels[s.level-1]}」へ`});
  }
  if (entry.rating === 'easy' && s.level < levels.length-1 && !entry.ended && !pain
    && entry.results.every(result => result.status === 'done' && result.rating !== 'hard')) {
    adjustments.push({key:'level',value:s.level+1,label:`全体の強度を「${levels[s.level+1]}」へ`});
  }
  const ratings = new Map();
  for (const result of entry.results) {
    const item = exercises[result.row.id];
    if (result.status !== 'done' || !['strength','stretch'].includes(item.type)) continue;
    if (result.rating === 'hard') ratings.set(item.id,'hard');
    else if (result.rating === 'easy' && !ratings.has(item.id)) ratings.set(item.id,'easy');
  }
  for (const result of entry.results.filter(result => result.status === 'pain')) ratings.delete(result.row.id);
  for (const [key,rating] of ratings) {
    if (rating === 'easy' && (pain || entry.ended || entry.rating === 'hard')) continue;
    const old = s.adjustments[key] || 0;
    const value = Math.max(-2,Math.min(2,old + (rating === 'easy' ? 1 : -1)));
    if (value !== old) adjustments.push({key,value,label:exercises[key].name + (value < old ? 'の回数・時間を減らし、休憩を延ばす' : 'の回数・時間を少し増やす')});
  }
  if (!adjustments.length && entry.rating === 'hard' && s.level === 0) {
    for (const key of new Set(entry.results.filter(result => result.status === 'done'
      && ['strength','stretch'].includes(exercises[result.row.id].type)).map(result => result.row.id))) {
      const old = s.adjustments[key] || 0;
      if (old > -2) adjustments.push({key,value:old-1,label:exercises[key].name+'の負荷を下げる'});
    }
  }
  return adjustments;
}

function ratingSelect(value, key, label) {
  return `<label class="stack"><span>${escape(label)}</span><select name="${key}">
    <option value="">未選択</option>${Object.entries(ratingLabels).map(([id,text]) => `<option value="${id}" ${id===value?'selected':''}>${text}</option>`).join('')}
    </select></label>`;
}

function renderSummary() {
  const entry = summary.entry;
  app.innerHTML = `<section class="page"><div class="page-head"><h1>${entry.ended ? 'トレーニングを中断しました' : 'トレーニング終了'}</h1></div>
  <div class="stack"><section class="panel stack"><h2>${escape(entry.name)}</h2>
    <p class="subtle">運動 ${humanTime(entry.active)} · ${entry.results.filter(result=>result.status==='done').length}種目を完了</p>
    ${ratingSelect(entry.rating,'rating','全体のきつさ')}
    <details ${summary.expanded ? 'open' : ''}><summary>種目ごとのきつさを記録する（任意）</summary>
      <ul>${entry.results.map((result,index) => `<li>${result.status === 'done'
        ? ratingSelect(result.rating,'result-'+index,exercises[result.row.id].name)
        : escape(exercises[result.row.id].name)+' · '+statusLabels[result.status]}</li>`).join('')}</ul></details>
  </section>
  ${summary.proposals.length ? `<section class="panel stack"><h2>次回の負荷調整</h2>
    <p class="subtle">選んだ調整は、次に作るメニューに反映されます。</p>
    <fieldset class="chips"><legend>採用する調整</legend>${summary.proposals.map((proposal,index) => checkbox(index,proposal.label,true,'proposal')).join('')}</fieldset>
    <div>${button('選んだ調整を採用する','apply-proposals','primary')}</div></section>` : ''}
  <div class="actions"><a class="btn primary" href="#history">履歴を見る</a><a class="btn" href="#plan">メニューに戻る</a></div></div></section>`;
}

function requestGuideExit(destination) {
  session.pause();
  if (dialog.open) dialog.close();
  confirmDialog('トレーニングを終了して移動しますか？',
    'ここまでの実施内容が履歴に残ります。キャンセルすると現在の画面に留まります。',
    'leave-guide',destination,'終了して移動');
}

function route() {
  const page = location.hash.slice(1);
  if (page!=='guide' && session) {
    history.replaceState(null,'','#guide');
    requestGuideExit(page || 'plan');
    return;
  }
  document.body.classList.toggle('guide-active',page==='guide' && Boolean(session));
  document.querySelectorAll('.top nav a').forEach(link => {
    if (link.hash === (['library','saved','history','settings'].includes(page) ? location.hash : page && page !== 'plan' ? '' : '#plan')) {
      link.setAttribute('aria-current','page');
    } else link.removeAttribute('aria-current');
  });
  switch (page) {
    case 'library': renderLibrary(); break;
    case 'saved': renderSaved(); break;
    case 'history': renderHistory(); break;
    case 'settings': renderSettings(); break;
    case 'safety': renderSafety(); break;
    case 'guide': if (session) renderGuide(true); else go('plan'); break;
    case 'summary': if (summary) renderSummary(); else go('history'); break;
    default: renderPlan(); break;
  }
}

function go(page) {
  if (location.hash === '#'+page) route();
  else location.hash = page;
}

function startSession() {
  if (session || !validPlan()) return;
  dialog.close();
  unlockSound();
  const snapshot = structuredClone(plan);
  session = new Guide(snapshot,data.settings,{
    save,
    render:full => { if (full) renderGuide(true); else updateClock(); },
    finish:entry => {
      if (guideFullscreen && document.fullscreenElement) document.exitFullscreen().catch(()=>{});
      guideFullscreen = false;
      session = null;
      if (entry.results.length) {
        data.history.push(entry);
        save();
      }
      summary = {entry,proposals:[],expanded:false};
      if (location.hash === '#guide') go(entry.results.length ? 'summary' : 'plan');
    }
  });
  go('guide');
}

function replaceDialog(index) {
  const swaps = alternatives(plan.rows,index,{...plan.options,poses:options.poses},data.settings);
  openDialog(`<h2>種目を差し替える</h2><div class="stack">
    ${swaps.length ? swaps.map(row => `<div class="list-card"><div><strong>${escape(exercises[row.id].name)}</strong><p class="subtle">${details(exercises[row.id])} · ${duration(row)}</p></div>
      <div>${button('この種目に変更','swap','small',`${index}:${row.id}`,`aria-label="${escape(exercises[row.id].name)}に変更"`)}</div></div>`).join('') : '<p>現在の姿勢・道具・負荷の条件に合う差し替え候補がありません。</p>'}</div>
    <div class="actions end">${button('閉じる','close')}</div>`);
}

function download() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'workit-backup.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}

let pendingImport;
app.addEventListener('change',async event => {
  const input = event.target;
  if (input.closest('#library-filters')) {
    if (input.name !== 'query') readLibraryFilters(input.form);
    return;
  }
  if (input.closest('#plan-form')) {
    const form = new FormData(input.form);
    options = {purpose:form.get('purpose'), minutes:Number(form.get('minutes')), poses:form.getAll('pose')};
    failedOptions = null;
    planSuggestions = [];
    document.querySelector('#plan-result').innerHTML = planResult();
  }
  if (input.id === 'import-file' && input.files[0]) {
    const file = input.files[0];
    input.value = '';
    try {
      pendingImport = validate(JSON.parse(await file.text()));
      confirmDialog('バックアップを復元する',`保存メニュー${pendingImport.saved.length}件、履歴${pendingImport.history.length}件と設定を復元します。このブラウザの現在のデータが置き換わります。`,'restore','','復元する');
    } catch { snackbar('復元できませんでした。workit で保存したJSONファイルを選んでください。'); }
  } else if (['gear','blocked'].includes(input.name)) {
    const list = data.settings[input.name];
    data.settings[input.name] = input.checked ? [...new Set([...list,input.value])] : list.filter(key => key!==input.value);
    save();
  } else if (['level','voice','volume'].includes(input.name)) {
    data.settings[input.name] = input.name === 'voice' ? input.checked : Number(input.value);
    if (input.name === 'voice' && !input.checked) silence();
    save();
  } else if (summary && (input.name === 'rating' || input.name.startsWith('result-'))) {
    if (input.name === 'rating') summary.entry.rating = input.value;
    else {
      summary.entry.results[Number(input.name.slice(7))].rating = input.value;
    }
    summary.expanded = app.querySelector('details')?.open;
    summary.proposals = recommendations(summary.entry);
    save();
    renderSummary();
    app.querySelector(`select[name="${input.name}"]`)?.focus();
  }
});
app.addEventListener('input',event => {
  if (event.target.name==='query' && event.target.closest('#library-filters')) readLibraryFilters(event.target.form);
  if (event.target.name === 'volume') document.querySelector('#volume-label').textContent = event.target.value+'%';
});

function setGeneratedPlan(next,rows) {
  options = structuredClone(next);
  failedOptions = rows ? null : structuredClone(options);
  plan = rows ? {name:purposes[options.purpose]+'メニュー',options:structuredClone(options),rows} : null;
  planSettingsKey = generationSettings();
  renderPlan();
  focusPlanResult();
}

document.addEventListener('submit',event => {
  if (event.target.id==='library-filters') {
    event.preventDefault();
    readLibraryFilters(event.target);
    return;
  }
  if (event.target.id !== 'plan-form' && event.target.id !== 'save-form') return;
  event.preventDefault();
  if (event.target.id === 'save-form') {
    const name = new FormData(event.target).get('name').trim();
    if (!name) return;
    data.saved.push({...structuredClone(plan),name,id:crypto.randomUUID()});
    plan.name = name;
    if (save()) snackbar('メニューを保存しました。');
    dialog.close();
    renderPlan();
    return;
  }
  const rows = generate(options,data.settings);
  setGeneratedPlan(options,rows);
});

document.addEventListener('click',event => {
  const link = event.target.closest('a[href^="#"]');
  if (session && link && link.hash!=='#guide' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    requestGuideExit(link.hash.slice(1));
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const {action,value} = target.dataset;
  const s = data.settings;
  switch (action) {
    case 'reset-library':
      libraryFilters = {...defaultLibraryFilters};
      renderLibrary();
      document.querySelector('#library-filters input').focus();
      break;
    case 'fullscreen': toggleFullscreen(); break;
    case 'close': dialog.close(); break;
    case 'apply-plan-suggestion': {
      const suggestion = planSuggestions[Number(value)];
      if (suggestion) {
        setGeneratedPlan(suggestion.options,suggestion.rows);
      }
      break;
    }
    case 'preview-hiit': previewHiit(hiitById[value]); break;
    case 'preview': {
      const item = exercises[value];
      openDialog(`<h2>${escape(item.name)}</h2><p class="subtle">${details(item)}</p>${diagram(item)}${description(item)}
        <div class="actions end">${button('閉じる','close')}</div>`);
      initDiagrams(dialog);
      break;
    }
    case 'diagram': {
      const figure = target.closest('.diagram');
      setDiagramFrame(figure.querySelector('canvas'),value);
      figure.querySelectorAll('[data-action=diagram]').forEach(control =>
        control.setAttribute('aria-pressed',String(control === target)));
      break;
    }
    case 'replace': replaceDialog(Number(value)); break;
    case 'swap': {
      const [index,id] = value.split(':');
      const row = alternatives(plan.rows,Number(index),{...plan.options,poses:options.poses},s).find(row => row.id===id);
      if (row) plan.rows[Number(index)] = row;
      dialog.close();
      renderPlan();
      break;
    }
    case 'save-dialog':
      if (!validPlan()) { snackbar('姿勢・道具・部位の条件に合うメニューに作り直してください。'); break; }
      openDialog(`<h2>メニューを保存する</h2><form id="save-form" class="stack"><label>メニュー名<input type="text" name="name" maxlength="60" required value="${escape(plan.name)}"></label>
        <div class="actions end">${button('キャンセル','close')}<button class="btn primary" type="submit">保存</button></div></form>`);
      break;
    case 'open-plan': {
      const entry = data.saved.find(item => item.id===value);
      if (!entry) break;
      plan = structuredClone(entry);
      planSettingsKey = generationSettings();
      options = {...plan.options,poses:plan.options.poses.filter(pose => Object.hasOwn(selectablePoses,pose))};
      failedOptions = null;
      go('plan');
      break;
    }
    case 'delete-plan-dialog': confirmDialog('保存メニューを削除する','このメニューを一覧から削除します。','delete-plan',value,'削除する'); break;
    case 'delete-history-dialog': confirmDialog('履歴を削除する','このトレーニングの記録を削除します。','delete-history',value,'削除する'); break;
    case 'delete-plan':
    case 'delete-history': {
      const key = action === 'delete-plan' ? 'saved' : 'history';
      data[key] = data[key].filter(item => item.id!==value);
      save();
      dialog.close();
      route();
      break;
    }
    case 'start-dialog':
      if (!validPlan()) { snackbar('姿勢・道具・部位の条件に合うメニューに作り直してください。'); break; }
      openDialog(`<h2>運動を始める前に</h2><p>体調・足元・使う道具を確認しましょう。胸の痛み、めまい、強い痛みを感じたらすぐに中止してください。</p>
        ${s.known.length ? '' : `<details open><summary>運動中の注意</summary>${safetyContent}</details>`}
        <div class="actions end">${button('戻る','close')}${button('確認してガイドを開く','start','primary')}</div>`);
      break;
    case 'start': startSession(); break;
    case 'ack': session?.acknowledge(); break;
    case 'begin': session?.begin(); break;
    case 'guide-ready': session?.confirmPreparation(); break;
    case 'pause': session?.pause(); break;
    case 'resume': session?.resume(); break;
    case 'done': session?.complete(); break;
    case 'replay':
      session?.stopAudio();
      if (session) session.speak(session.exercise.steps.join('')+session.exercise.cue,520);
      break;
    case 'confirm-warm':
      if (session) {
        session.warmed = true;
        if (session.phase === 'waiting' && session.canBegin) session.begin();
        else renderGuide(true);
      }
      break;
    case 'skip': session?.advance('skipped'); break;
    case 'exclude-dialog':
      session?.pause();
      confirmDialog('この種目を今後も除外する','現在の種目をスキップし、今後のメニュー候補から外します。設定から元に戻せます。','exclude','','除外する');
      break;
    case 'exclude':
      if (session) {
        if (!s.excluded.includes(session.row.id)) s.excluded.push(session.row.id);
        const exerciseId = session.row.id;
        session.plan.rows = session.plan.rows.filter((row,index) => index <= session.index || row.id !== exerciseId);
        save();
        dialog.close();
        session.advance('excluded');
      }
      break;
    case 'allow':
      s.excluded = s.excluded.filter(id => id!==value);
      save();
      renderSettings();
      break;
    case 'reset-adjust':
      s.adjustments = {};
      save();
      renderSettings();
      break;
    case 'pain': session?.pain(); break;
    case 'pain-skip': session?.advance('pain',true); break;
    case 'guide-end-dialog':
      session?.pause();
      confirmDialog('トレーニングを終了する','ここまでの実施内容が履歴に残ります。「キャンセル」のあとで再開できます。','guide-end','','終了する');
      break;
    case 'leave-guide':
      if (dialog.open) dialog.close();
      if (session) {
        location.hash = value || 'plan';
        session.finish(true);
      }
      break;
    case 'guide-end':
      if (dialog.open) dialog.close();
      session?.finish(true);
      break;
    case 'apply-proposals':
      document.querySelectorAll('input[name=proposal]:checked').forEach(input => {
        const proposal = summary.proposals[Number(input.value)];
        if (proposal.key === 'level') s.level = proposal.value;
        else s.adjustments[proposal.key] = proposal.value;
      });
      summary.proposals = [];
      if (save()) snackbar('次回の負荷に反映しました。');
      renderSummary();
      break;
    case 'test-voice':
      unlockSound();
      silence();
      announce('ワークイットの音声ガイドです。',s,660);
      break;
    case 'export': download(); break;
    case 'import': document.querySelector('#import-file').click(); break;
    case 'restore':
      try {
        localStorage.setItem(storageKey,JSON.stringify(pendingImport));
        data = pendingImport;
        plan = null;
        summary = null;
        failedOptions = null;
        snackbar('バックアップを復元しました。');
      } catch { snackbar('ブラウザに保存できなかったため、復元を中止しました。'); }
      pendingImport = null;
      dialog.close();
      route();
      break;
  }
});

window.addEventListener('hashchange',route);
async function toggleFullscreen() {
  if (!session) return;
  const currentSession = session;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else {
      await document.documentElement.requestFullscreen();
      if (session!==currentSession && document.fullscreenElement) await document.exitFullscreen();
      else guideFullscreen = Boolean(document.fullscreenElement);
    }
  } catch { snackbar('全画面表示を利用できません。ブラウザのウィンドウを広げてご利用ください。'); }
}
document.addEventListener('fullscreenchange',()=> {
  if (!document.fullscreenElement) guideFullscreen = false;
  document.querySelectorAll('[data-action="fullscreen"]').forEach(control=> {
    control.textContent = document.fullscreenElement ? '全画面を閉じる' : '全画面';
    control.setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));
  });
});
document.addEventListener('visibilitychange',() => { if (document.hidden) session?.pause(); });
document.addEventListener('keydown',event => {
  if (!session || dialog.open || event.repeat || event.altKey || event.ctrlKey || event.metaKey
    || event.target.closest('button,a,input,select,textarea,summary')) return;
  if (event.code === 'Space' && session.phase !== 'pain') {
    event.preventDefault();
    if (session.paused) session.resume();
    else session.pause();
  }
  if (event.code==='KeyF' && document.fullscreenEnabled) {
    event.preventDefault();
    toggleFullscreen();
  }
});
window.speechSynthesis?.addEventListener('voiceschanged',() => {
  const info = document.querySelector('#voice-info');
  if (info) info.textContent = voiceStatus();
});
route();
if (loadError) snackbar('以前のデータを読み込めませんでした。バックアップがあれば設定から復元できます。');
