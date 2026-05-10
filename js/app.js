/* 《金沙迷雾》主程序 */
(function () {
  'use strict';

  /* ========== 工具 ========== */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function track() {}
  function playTone(kind) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      window._audioCtx = window._audioCtx || new Ctx();
      var ctx = window._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      var freqs = { ding: 880, tap: 440, gold: [980, 1320], dull: 220, bell: [660, 880], stamp: 200 };
      var f = freqs[kind] || 600;
      var t0 = ctx.currentTime;
      var notes = Array.isArray(f) ? f : [f];
      notes.forEach(function (freq, i) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = kind === 'dull' ? 'sine' : (kind === 'gold' || kind === 'bell' ? 'triangle' : 'sine');
        o.frequency.setValueAtTime(freq, t0 + i * 0.07);
        g.gain.setValueAtTime(0.0001, t0 + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.18, t0 + i * 0.07 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.07 + 0.4);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + i * 0.07);
        o.stop(t0 + i * 0.07 + 0.42);
      });
    } catch (e) { /* noop */ }
  }

  /* ========== 状态管理 ========== */
  var STORAGE_KEY = 'jinsha_mist_v1';
  var DEFAULT_STATE = {
    introSeen: false,
    activeStage: 1,
    activeView: 'investigate',
    activeScene: null,
    activeCharId: null,
    collected: [],
    challengedLies: [],
    searchedAreas: [],
    dialogueHistory: {},
    topicCounts: {},
    walkthroughUnlocked: [],
    walkthroughPenalty: 0,
    deductionBoard: { nodes: [], edges: [] },
    caseAnswers: null,
    caseResult: null
  };
  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      var parsed = JSON.parse(raw);
      var s = JSON.parse(JSON.stringify(DEFAULT_STATE));
      Object.keys(parsed).forEach(function (k) { s[k] = parsed[k]; });
      return s;
    } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { showToast('存档失败:' + e.message, 'error'); }
  }
  function resetState() {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
  }

  /* ========== 数据访问 ========== */
  function getStageById(id) { return GAME_DATA.stages.filter(function (s) { return s.id === id; })[0]; }
  function getScene(id) { return GAME_DATA.scenes[id]; }
  function getCharacter(id) { return GAME_DATA_CHARS.characters[id]; }
  function getClue(id) { return GAME_DATA.clues[id]; }
  function isStageUnlocked(stageId) {
    if (stageId === 1) return true;
    var stageOneCount = state.collected.filter(function (cid) { return getClue(cid) && getClue(cid).stage === 1; }).length;
    var stageTwoCount = state.collected.filter(function (cid) { return getClue(cid) && getClue(cid).stage === 2; }).length;
    if (stageId === 2) return stageOneCount >= 5;
    if (stageId === 3) return (stageOneCount + stageTwoCount) >= 9;
    return false;
  }
  function hasForeignerPrivilege() { return true; }

  /* ========== 视图渲染 ========== */
  var root = document.getElementById('app');

  function render() {
    if (!state.introSeen) {
      renderShell();
      openIntroModal(true);
      return;
    }
    renderShell();
    var main = document.querySelector('.app-main');
    main.innerHTML = '';
    var view = el('div', 'view');
    main.appendChild(view);

    if (state.activeView === 'investigate') renderInvestigate(view);
    else if (state.activeView === 'interrogate') renderInterrogate(view);
    else if (state.activeView === 'clues') renderClues(view);
    else if (state.activeView === 'deduce') renderDeduce(view);
  }

  function renderShell() {
    if (root.dataset.shellRendered === '1') {
      updateActiveStageIndicator();
      updateNavBadges();
      updateNavActive();
      return;
    }
    root.innerHTML = '';

    // 顶部栏
    var topbar = el('header', 'app-topbar');
    var title = el('div', 'app-topbar-title');
    var seal = el('span', 'seal', '断');
    title.appendChild(seal);
    title.appendChild(document.createTextNode(GAME_DATA.caseInfo.title));
    topbar.appendChild(title);

    var indicator = el('div', 'stage-indicator');
    indicator.id = 'stage-indicator';
    topbar.appendChild(indicator);

    topbar.appendChild(el('div', 'app-topbar-spacer'));

    var btnIntro = el('button', 'app-topbar-btn');
    btnIntro.innerHTML = '<span>📜</span><span>引导</span>';
    btnIntro.addEventListener('click', function () { openIntroModal(false); track('button_click', { buttonName: 'open_intro' }); });
    topbar.appendChild(btnIntro);

    var btnGuide = el('button', 'app-topbar-btn');
    btnGuide.innerHTML = '<span>🗝</span><span>攻略</span>';
    btnGuide.addEventListener('click', function () { openWalkthroughModal(); track('button_click', { buttonName: 'open_walkthrough' }); });
    topbar.appendChild(btnGuide);

    var btnShare = el('button', 'app-topbar-btn');
    btnShare.id = 'btn-share';
    btnShare.setAttribute('data-share-trigger', 'true');
    btnShare.setAttribute('data-runtime-share-ignore', 'true');
    btnShare.innerHTML = '<span>📤</span><span>分享</span>';
    btnShare.addEventListener('click', function () { triggerShare(); track('button_click', { buttonName: 'open_share' }); });
    topbar.appendChild(btnShare);

    var btnMenu = el('button', 'app-topbar-btn');
    btnMenu.innerHTML = '<span>☰</span><span>菜单</span>';
    btnMenu.addEventListener('click', function () { openMenuModal(); track('button_click', { buttonName: 'open_menu' }); });
    topbar.appendChild(btnMenu);

    root.appendChild(topbar);

    // 导航
    var nav = el('nav', 'app-nav');
    nav.id = 'app-nav';
    var navItems = [
      { key: 'investigate', label: '调查', icon: '🏛' },
      { key: 'interrogate', label: '审讯', icon: '💬' },
      { key: 'clues', label: '线索', icon: '🪶' },
      { key: 'deduce', label: '推理', icon: '🧭' }
    ];
    navItems.forEach(function (it) {
      var btn = el('button', 'nav-btn');
      btn.dataset.view = it.key;
      btn.innerHTML = '<span>' + it.icon + '</span><span>' + esc(it.label) + '</span>' +
        (it.key === 'clues' ? '<span class="badge" id="badge-clues">0</span>' : '');
      btn.addEventListener('click', function () {
        state.activeView = it.key;
        if (it.key === 'investigate') state.activeScene = null;
        if (it.key === 'interrogate') state.activeCharId = null;
        saveState();
        track('button_click', { buttonName: 'nav_' + it.key });
        render();
      });
      nav.appendChild(btn);
    });
    root.appendChild(nav);

    // 主区
    var main = el('main', 'app-main');
    main.setAttribute('data-share-root', '');
    root.appendChild(main);

    // toast 容器
    var toastHost = el('div', 'app-toast-host');
    toastHost.id = 'app-toast-host';
    document.body.appendChild(toastHost);

    // 模态框容器
    if (!document.getElementById('app-modal-host')) {
      var modal = el('div', 'app-modal-mask');
      modal.id = 'app-modal-host';
      document.body.appendChild(modal);
    }

    root.dataset.shellRendered = '1';
    updateActiveStageIndicator();
    updateNavBadges();
    updateNavActive();
  }

  function updateActiveStageIndicator() {
    var ind = document.getElementById('stage-indicator');
    if (!ind) return;
    ind.innerHTML = '';
    GAME_DATA.stages.forEach(function (s) {
      var dot = el('span', 'stage-dot');
      if (isStageUnlocked(s.id)) dot.classList.add('active');
      if (s.id < state.activeStage) dot.classList.add('done');
      ind.appendChild(dot);
    });
    ind.appendChild(el('span', '', '阶段 ' + state.activeStage + ' / 3'));
  }
  function updateNavBadges() {
    var b = document.getElementById('badge-clues');
    if (b) b.textContent = state.collected.length;
  }
  function updateNavActive() {
    var nav = document.getElementById('app-nav');
    if (!nav) return;
    var btns = nav.querySelectorAll('.nav-btn');
    btns.forEach(function (btn) { btn.classList.toggle('active', btn.dataset.view === state.activeView); });
  }

  /* ========== 调查视图 ========== */
  function renderInvestigate(host) {
    if (state.activeScene) return renderSceneDetail(host, state.activeScene);

    var stage = getStageById(state.activeStage);
    var banner = el('div', 'stage-banner');
    var h2 = el('h2'); h2.textContent = stage.name;
    banner.appendChild(h2);
    banner.appendChild(el('div', 'brief', stage.brief));
    banner.appendChild(el('div', 'intro', stage.intro));
    var stageTabs = el('div');
    stageTabs.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';
    GAME_DATA.stages.forEach(function (s) {
      var unlocked = isStageUnlocked(s.id);
      var btn = el('button', 'app-topbar-btn');
      btn.textContent = '阶段 ' + s.id + ' · ' + s.brief;
      if (s.id === state.activeStage) {
        btn.style.background = 'var(--c-accent)';
        btn.style.color = '#fff';
      }
      if (!unlocked) { btn.disabled = true; btn.style.opacity = '0.45'; btn.title = s.unlockHint; }
      btn.addEventListener('click', function () {
        if (!unlocked) { showToast(s.unlockHint, 'warn'); return; }
        state.activeStage = s.id;
        saveState();
        playTone('bell');
        render();
      });
      stageTabs.appendChild(btn);
    });
    banner.appendChild(stageTabs);
    host.appendChild(banner);

    // 场景网格
    var grid = el('div', 'scene-grid');
    stage.scenes.forEach(function (sceneId) {
      var sc = getScene(sceneId);
      var card = el('div', 'scene-card');
      card.appendChild(el('span', 'scene-tag', '场景 · ' + sc.name));
      var h3 = el('h3'); h3.textContent = sc.name;
      card.appendChild(h3);
      card.appendChild(el('div', 'scene-desc', sc.desc));
      var meta = el('div', 'scene-meta');
      meta.appendChild(el('span', '', '可调查 ' + sc.areas.length + ' 处'));
      meta.appendChild(el('span', '', '人物 ' + sc.characters.length + ' 人'));
      var found = sc.areas.filter(function (a) { return state.searchedAreas.indexOf(a.id) >= 0; }).length;
      meta.appendChild(el('span', '', '已发现 ' + found + ' / ' + sc.areas.length));
      card.appendChild(meta);
      card.addEventListener('click', function () {
        state.activeScene = sceneId;
        saveState();
        playTone('tap');
        render();
        track('button_click', { buttonName: 'enter_scene', scene: sceneId });
      });
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }

  function renderSceneDetail(host, sceneId) {
    var sc = getScene(sceneId);
    var wrap = el('div', 'scene-view');
    var left = el('div', 'scene-illust');
    var back = el('button', 'scene-back', '← 返回场景列表');
    back.addEventListener('click', function () { state.activeScene = null; saveState(); render(); });
    left.appendChild(back);
    var h2 = el('h2'); h2.textContent = sc.name;
    left.appendChild(h2);
    left.appendChild(el('div', 'desc', sc.desc));

    var areasWrap = el('div', 'areas');
    sc.areas.forEach(function (a) {
      var btn = el('button', 'scene-area-btn');
      var pulse = el('span', 'pulse');
      btn.appendChild(pulse);
      btn.appendChild(el('span', '', a.name));
      var meta = el('span', 'meta');
      var searched = state.searchedAreas.indexOf(a.id) >= 0;
      if (searched) {
        btn.classList.add('searched');
        meta.textContent = '已搜查';
      } else {
        meta.textContent = a.requirePrivilege ? '需外来者特权 · ' + a.hint : a.hint;
      }
      btn.appendChild(meta);
      btn.addEventListener('click', function () { searchArea(sc, a); });
      areasWrap.appendChild(btn);
    });
    left.appendChild(areasWrap);
    wrap.appendChild(left);

    // 右侧
    var right = el('div', 'scene-side');
    if (sc.characters && sc.characters.length) {
      right.appendChild(el('h3', '', '此处之人'));
      sc.characters.forEach(function (cid) {
        var ch = getCharacter(cid);
        if (!ch) return;
        var row = el('div', 'character-row');
        var av = el('div', 'character-avatar');
        av.style.background = ch.portraitColor;
        av.textContent = ch.avatar;
        row.appendChild(av);
        var info = el('div', 'info');
        info.appendChild(el('div', 'name', ch.name));
        info.appendChild(el('div', 'role', ch.role));
        row.appendChild(info);
        row.addEventListener('click', function () {
          state.activeView = 'interrogate';
          state.activeCharId = cid;
          saveState();
          render();
          track('button_click', { buttonName: 'open_dialogue', char: cid });
        });
        right.appendChild(row);
      });
    } else {
      right.appendChild(el('h3', '', '此处无人'));
      var emp1 = el('div', 'empty-state');
      emp1.appendChild(el('div', 'empty-icon', '🌫'));
      emp1.appendChild(el('div', '', '只有水声相伴。'));
      right.appendChild(emp1);
    }

    var foundClues = state.collected.filter(function (cid) {
      var c = getClue(cid);
      return c && c.from === sc.name;
    });
    right.appendChild(el('h3', '', '此处已得线索'));
    if (!foundClues.length) {
      var emp = el('div', 'empty-state');
      emp.appendChild(el('div', 'empty-icon', '🪶'));
      emp.appendChild(el('h4', '', '此处尚无发现'));
      emp.appendChild(el('div', '', '试着搜查一下,或与在场的人谈谈。'));
      right.appendChild(emp);
    } else {
      foundClues.forEach(function (cid) {
        var c = getClue(cid);
        var card = el('div', 'clue-card');
        card.style.padding = '10px 12px';
        card.appendChild(el('div', 'clue-name', c.name));
        card.appendChild(el('div', 'clue-desc', c.desc));
        right.appendChild(card);
      });
    }

    wrap.appendChild(right);
    host.appendChild(wrap);
  }

  function searchArea(scene, area) {
    if (state.searchedAreas.indexOf(area.id) >= 0) {
      showToast('此处已搜查过。', 'warn');
      return;
    }
    if (area.requirePrivilege && !hasForeignerPrivilege()) {
      showToast('此处需要"外来者特权"才能进入深查。', 'warn');
      return;
    }
    state.searchedAreas.push(area.id);
    var clue = area.clue ? getClue(area.clue) : null;
    if (clue && state.collected.indexOf(clue.id) < 0) {
      state.collected.push(clue.id);
      saveState();
      flyClueAnim(area.name);
      showToast('🪶 发现线索:' + clue.name, 'success');
      track('clue_collected', { clue: clue.id, source: 'scene' });
    } else {
      saveState();
      showToast(area.searchTip || '此处无重要发现。');
    }
    playTone('ding');
    checkStageUnlock();
    render();
  }

  function flyClueAnim(label) {
    var fly = el('div');
    fly.style.cssText =
      'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'background:var(--c-bg-paper);border:2px solid var(--c-accent);' +
      'border-radius:10px;padding:12px 20px;font-family:Ma Shan Zheng,serif;' +
      'font-size:18px;color:var(--c-accent-d);box-shadow:0 0 30px rgba(154,109,56,.6);' +
      'z-index:300;pointer-events:none;animation:flyClue 1.0s var(--easing) forwards;';
    fly.textContent = '🪶 ' + label;
    document.body.appendChild(fly);
    setTimeout(function () { fly.remove(); }, 1100);
  }
  (function injectAnim() {
    var s = document.createElement('style');
    s.textContent =
      '@keyframes flyClue {' +
      '  0% { opacity:0; transform: translate(-50%,-50%) scale(.6); }' +
      '  20% { opacity:1; transform: translate(-50%,-50%) scale(1.1); }' +
      '  60% { opacity:1; transform: translate(-50%,-50%) scale(1); }' +
      '  100% { opacity:0; transform: translate(calc(50vw - 80px), -45vh) scale(.5); }' +
      '}';
    document.head.appendChild(s);
  })();

  function checkStageUnlock() {
    for (var i = 3; i >= 1; i--) {
      if (isStageUnlocked(i) && state.activeStage < i) {
        state.activeStage = i;
        saveState();
        playTone('bell');
        showToast('🔔 阶段已解锁:' + getStageById(i).name, 'success');
        break;
      }
    }
  }

  /* ========== 审讯视图 ========== */
  function renderInterrogate(host) {
    var view = el('div', 'interrogate-view');
    var charList = el('div', 'char-list');
    charList.appendChild(el('h3', '', '在场人物'));

    var visibleStages = [1];
    if (isStageUnlocked(2)) visibleStages.push(2);
    if (isStageUnlocked(3)) visibleStages.push(3);
    var allChars = [];
    visibleStages.forEach(function (sid) {
      var s = getStageById(sid);
      s.characters.forEach(function (cid) {
        if (allChars.indexOf(cid) < 0) allChars.push(cid);
      });
    });

    if (!allChars.length) {
      charList.appendChild(el('div', 'empty-state', '尚无可审讯人物。'));
    }
    allChars.forEach(function (cid) {
      var ch = getCharacter(cid);
      if (!ch) return;
      var row = el('div', 'character-row');
      if (state.activeCharId === cid) row.classList.add('selected');
      var av = el('div', 'character-avatar');
      av.style.background = ch.portraitColor;
      av.textContent = ch.avatar;
      row.appendChild(av);
      var info = el('div', 'info');
      info.appendChild(el('div', 'name', ch.name));
      info.appendChild(el('div', 'role', ch.role));
      row.appendChild(info);
      row.addEventListener('click', function () {
        state.activeCharId = cid;
        saveState();
        render();
      });
      charList.appendChild(row);
    });
    view.appendChild(charList);

    var pane = el('div', 'dialogue-pane');
    if (!state.activeCharId) {
      var emp = el('div', 'empty-state');
      emp.style.flex = '1';
      emp.style.padding = '60px 30px';
      emp.appendChild(el('div', 'empty-icon', '💬'));
      emp.appendChild(el('h4', '', '请选择一位人物开始问话'));
      emp.appendChild(el('div', '', '左侧列表中点选,即可进入对话。'));
      pane.appendChild(emp);
    } else {
      renderDialoguePane(pane, state.activeCharId);
    }
    view.appendChild(pane);
    host.appendChild(view);
  }

  function renderDialoguePane(pane, charId) {
    var ch = getCharacter(charId);
    var header = el('div', 'dialogue-header');
    var av = el('div', 'character-avatar');
    av.style.background = ch.portraitColor;
    av.textContent = ch.avatar;
    header.appendChild(av);
    var info = el('div', 'info');
    info.appendChild(el('div', 'name', ch.name));
    info.appendChild(el('div', 'role', ch.role));
    info.appendChild(el('div', 'desc', ch.desc));
    header.appendChild(info);
    pane.appendChild(header);

    var history = el('div', 'dialogue-history');
    history.id = 'dialogue-history-' + charId;
    var hist = state.dialogueHistory[charId] || [];
    if (!hist.length) {
      var greet = el('div', 'dialogue-bubble npc');
      greet.textContent = ch.greeting;
      history.appendChild(greet);
    } else {
      hist.forEach(function (item) {
        var b = el('div', 'dialogue-bubble ' + item.role);
        b.textContent = item.text;
        history.appendChild(b);
      });
    }
    pane.appendChild(history);

    var input = el('div', 'dialogue-input');
    var rec = el('div', 'dialogue-recommend');
    var recommendList = computeRecommendations(charId);
    if (recommendList.length) {
      var lbl = el('span', '');
      lbl.style.cssText = 'font-size:12px;color:var(--c-muted);margin-right:6px;align-self:center';
      lbl.textContent = '推荐话题:';
      rec.appendChild(lbl);
      recommendList.forEach(function (r) {
        var c = el('button', 'recommend-chip', r.label);
        c.addEventListener('click', function () { handleSpeak(charId, r.topic); });
        rec.appendChild(c);
      });
    }
    input.appendChild(rec);

    var inputRow = el('div', 'input-row');
    var ipt = el('input');
    ipt.placeholder = '输入关键词或问题(如:案发夜、水道、玉佩……)';
    ipt.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { handleSpeak(charId, ipt.value); ipt.value = ''; }
    });
    var sendBtn = el('button', 'btn-primary', '问话');
    sendBtn.addEventListener('click', function () { handleSpeak(charId, ipt.value); ipt.value = ''; });
    inputRow.appendChild(ipt);
    inputRow.appendChild(sendBtn);
    input.appendChild(inputRow);

    if (Object.keys(ch.lies || {}).length) {
      var trig = el('div', 'challenge-trigger');
      trig.appendChild(el('strong', '', '⚖ 质疑谎言:'));
      var lieIds = Object.keys(ch.lies);
      lieIds.forEach(function (lid) {
        var lie = ch.lies[lid];
        var done = state.challengedLies.indexOf(lid) >= 0;
        var btn = el('button', 'btn-danger');
        btn.textContent = (done ? '✓ 已戳穿:' : '指出:') + briefLie(lie.statement);
        btn.disabled = done;
        btn.addEventListener('click', function () { openChallengePicker(charId, lid); });
        trig.appendChild(btn);
      });
      input.appendChild(trig);
    }
    pane.appendChild(input);

    setTimeout(function () { history.scrollTop = history.scrollHeight; }, 30);
  }

  function briefLie(s) { return s.length > 24 ? s.slice(0, 24) + '…' : s; }

  function handleSpeak(charId, raw) {
    var text = (raw || '').trim();
    if (!text) return;
    var ch = getCharacter(charId);
    if (!ch) return;

    pushDialogue(charId, 'user', text);

    var matched = null;
    for (var i = 0; i < ch.topics.length; i++) {
      var t = ch.topics[i];
      var hit = t.keywords.some(function (k) { return text.indexOf(k) >= 0; });
      if (hit) { matched = t; break; }
    }

    if (!matched) {
      pushDialogue(charId, 'npc', ch.defaultReply);
      track('dialogue_unmatched', { char: charId, text: text.slice(0, 24) });
      return;
    }

    var topicKey = charId + '::' + matched.keywords[0];
    state.topicCounts[topicKey] = (state.topicCounts[topicKey] || 0) + 1;
    if (state.topicCounts[topicKey] > (ch.maxRepeat || 3)) {
      pushDialogue(charId, 'npc', ch.tiredReply);
      saveState();
      return;
    }

    pushDialogue(charId, 'npc', matched.text);

    if (matched.unlockClueIds && matched.unlockClueIds.length) {
      matched.unlockClueIds.forEach(function (cid) {
        if (state.collected.indexOf(cid) < 0) {
          state.collected.push(cid);
          var clue = getClue(cid);
          if (clue) {
            flyClueAnim(clue.name);
            showToast('🪶 发现线索:' + clue.name, 'success');
            track('clue_collected', { clue: cid, source: 'dialogue', char: charId });
          }
        }
      });
    }

    saveState();
    checkStageUnlock();
    updateNavBadges();
    refreshDialogue(charId);
  }

  function pushDialogue(charId, role, text) {
    state.dialogueHistory[charId] = state.dialogueHistory[charId] || [];
    state.dialogueHistory[charId].push({ role: role, text: text });
    saveState();
    var host = document.getElementById('dialogue-history-' + charId);
    if (host) {
      var b = el('div', 'dialogue-bubble ' + role);
      b.textContent = text;
      host.appendChild(b);
      host.scrollTop = host.scrollHeight;
    }
  }

  function refreshDialogue(charId) {
    var pane = document.querySelector('.dialogue-pane');
    if (!pane) return;
    pane.innerHTML = '';
    renderDialoguePane(pane, charId);
  }

  function computeRecommendations(charId) {
    var rules = (GAME_DATA_EXTRA.recommendations || {})[charId];
    if (!rules) return [];
    var out = [];
    var ch = getCharacter(charId);
    rules.forEach(function (r) {
      try {
        if (r.cond({ collected: state.collected, challenged: state.challengedLies })) {
          var match = ch.topics.find(function (t) { return t.keywords.indexOf(r.topic) >= 0; });
          var key = charId + '::' + ((match && match.keywords[0]) || r.topic);
          var count = state.topicCounts[key] || 0;
          if (count < (ch.maxRepeat || 3)) out.push(r);
        }
      } catch (e) { /* ignore */ }
    });
    return out.slice(0, 3);
  }

  /* ========== 质疑流程 ========== */
  function openChallengePicker(charId, lieId) {
    var ch = getCharacter(charId);
    var lie = ch.lies[lieId];
    var available = state.collected.map(getClue).filter(function (c) { return c; });

    openModal('挑选线索质疑', function (body, footer) {
      body.appendChild(el('p', '', '【声称】' + lie.statement));
      body.appendChild(el('p', '', '请选择一条线索作为质疑武器(只能选一条):'));
      var picker = el('div', 'challenge-clue-picker');
      var picked = null;
      available.forEach(function (c) {
        var chip = el('button', 'clue-chip', c.name);
        chip.addEventListener('click', function () {
          picker.querySelectorAll('.clue-chip').forEach(function (x) { x.classList.remove('selected'); });
          chip.classList.add('selected');
          picked = c.id;
        });
        picker.appendChild(chip);
      });
      body.appendChild(picker);
      if (!available.length) {
        body.appendChild(el('p', '', '尚无线索,无从质疑。'));
      }

      var doBtn = el('button', 'btn-primary', '出示线索 · 质疑');
      doBtn.addEventListener('click', function () {
        if (!picked) { showToast('请先选择一条线索。', 'warn'); return; }
        closeModal();
        executeChallenge(charId, lieId, picked);
      });
      var cancelBtn = el('button', 'btn-ghost', '取消');
      cancelBtn.addEventListener('click', closeModal);
      footer.appendChild(cancelBtn);
      footer.appendChild(doBtn);
    });
  }

  function executeChallenge(charId, lieId, clueId) {
    var ch = getCharacter(charId);
    var lie = ch.lies[lieId];
    var ok = lie.challengeClueIds.indexOf(clueId) >= 0;
    if (ok) {
      var flash = el('div', 'challenge-flash');
      document.body.appendChild(flash);
      setTimeout(function () { flash.remove(); }, 700);
      playTone('gold');
      if (state.challengedLies.indexOf(lieId) < 0) state.challengedLies.push(lieId);
      pushDialogue(charId, 'success', '⚖ 质疑成功!');
      pushDialogue(charId, 'npc', lie.successText);
      if (lie.unlockClueIds) {
        lie.unlockClueIds.forEach(function (cid) {
          if (state.collected.indexOf(cid) < 0) {
            state.collected.push(cid);
            var c = getClue(cid);
            if (c) { flyClueAnim(c.name); showToast('🪶 解锁线索:' + c.name, 'success'); }
          }
        });
      }
      track('challenge_success', { char: charId, lie: lieId, clue: clueId });
      showToast('谎言被戳穿!', 'success');
      saveState();
      checkStageUnlock();
      updateNavBadges();
    } else {
      var pane = document.querySelector('.dialogue-pane');
      if (pane) { pane.classList.add('shake'); setTimeout(function () { pane.classList.remove('shake'); }, 400); }
      playTone('dull');
      pushDialogue(charId, 'fail', '? 质疑失败:' + (lie.failHints && lie.failHints[0] ? lie.failHints[0] : '此线索不足以戳穿。'));
      track('challenge_fail', { char: charId, lie: lieId, clue: clueId });
      showToast('线索不足以戳穿此谎言。', 'error');
    }
    refreshDialogue(charId);
  }

  /* ========== 线索视图 ========== */
  function renderClues(host) {
    var banner = el('div', 'stage-banner');
    var h2 = el('h2', '', '🪶 线索册');
    banner.appendChild(h2);
    banner.appendChild(el('div', 'brief', '已收 ' + state.collected.length + ' / ' + Object.keys(GAME_DATA.clues).length + ' 条'));
    banner.appendChild(el('div', 'intro', '可按阶段、类型、来源筛选查阅。'));
    host.appendChild(banner);

    var toolbar = el('div', 'clue-toolbar');
    var stageFilter = document.createElement('select');
    [{v: 'all', l: '全部阶段'}, {v: '1', l: '阶段一'}, {v: '2', l: '阶段二'}, {v: '3', l: '阶段三'}].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.v; opt.textContent = o.l; stageFilter.appendChild(opt);
    });
    var typeFilter = document.createElement('select');
    [{v: 'all', l: '全部类型'}, {v: '物证', l: '物证'}, {v: '证言', l: '证言'}].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.v; opt.textContent = o.l; typeFilter.appendChild(opt);
    });
    var sourceFilter = document.createElement('select');
    [{v: 'all', l: '全部来源'}, {v: 'scene', l: '场景搜查'}, {v: 'character', l: '人物对话'}].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.v; opt.textContent = o.l; sourceFilter.appendChild(opt);
    });
    toolbar.appendChild(stageFilter);
    toolbar.appendChild(typeFilter);
    toolbar.appendChild(sourceFilter);
    host.appendChild(toolbar);

    var grid = el('div', 'clue-grid');
    grid.id = 'clue-grid';
    host.appendChild(grid);

    function refresh() {
      grid.innerHTML = '';
      var sf = stageFilter.value, tf = typeFilter.value, srcf = sourceFilter.value;
      var list = state.collected.map(getClue).filter(function (c) { return c; });
      if (sf !== 'all') list = list.filter(function (c) { return String(c.stage) === sf; });
      if (tf !== 'all') list = list.filter(function (c) { return c.type === tf; });
      if (srcf !== 'all') list = list.filter(function (c) { return c.source === srcf; });
      if (!list.length) {
        var emp = el('div', 'empty-state');
        emp.appendChild(el('div', 'empty-icon', '🪶'));
        emp.appendChild(el('h4', '', '此处尚无发现'));
        emp.appendChild(el('div', '', '试着搜查一下,或与在场的人谈谈。'));
        grid.appendChild(emp);
        return;
      }
      list.forEach(function (c) {
        var card = el('div', 'clue-card');
        card.appendChild(el('div', 'clue-name', c.name));
        var tags = el('div', 'clue-tags');
        tags.appendChild(el('span', 'clue-tag stage', '阶段 ' + c.stage));
        tags.appendChild(el('span', 'clue-tag ' + (c.type === '物证' ? 'physical' : 'testimony'), c.type));
        if (c.viaChallenge) tags.appendChild(el('span', 'clue-tag', '质疑解锁'));
        card.appendChild(tags);
        card.appendChild(el('div', 'clue-desc', c.desc));
        card.appendChild(el('div', 'clue-from', '来源:' + c.from));
        grid.appendChild(card);
      });
    }
    [stageFilter, typeFilter, sourceFilter].forEach(function (s) { s.addEventListener('change', refresh); });
    refresh();
  }

  /* ========== 推理板 ========== */
  function renderDeduce(host) {
    var banner = el('div', 'stage-banner');
    var h2 = el('h2', '', '🧭 推理画板');
    banner.appendChild(h2);
    banner.appendChild(el('div', 'brief', '把线索气泡拖到画布,记录笔记并连线,梳理你的推理。'));
    banner.appendChild(el('div', 'intro', '将线索从左侧拖至画布;点击"+ 添加笔记"补充推断;点击节点的"连线"再点另一节点完成连线;双击节点查看详情。准备好后点击"提交档案卡"断案。'));
    host.appendChild(banner);

    var view = el('div', 'deduce-view');
    var box = el('div', 'clue-box');
    box.appendChild(el('h3', '', '线索箱(拖至画布)'));
    var bubbleList = el('div', 'clue-bubble-list');
    state.collected.forEach(function (cid) {
      var c = getClue(cid);
      if (!c) return;
      var bubble = el('div', 'clue-bubble');
      bubble.draggable = true;
      bubble.dataset.clue = cid;
      bubble.appendChild(document.createTextNode('🪶 ' + c.name));
      var onBoard = state.deductionBoard.nodes.some(function (n) { return n.type === 'clue' && n.clueId === cid; });
      if (onBoard) bubble.classList.add('on-board');
      bubble.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', cid);
        e.dataTransfer.effectAllowed = 'copy';
      });
      bubble.addEventListener('click', function () { showPopover(bubble, c); });
      bubbleList.appendChild(bubble);
    });
    box.appendChild(bubbleList);
    if (!state.collected.length) {
      var emp = el('div', 'empty-state');
      emp.style.padding = '20px';
      emp.appendChild(el('div', 'empty-icon', '🪶'));
      emp.appendChild(el('div', '', '尚无线索。请先去调查与审讯。'));
      box.appendChild(emp);
    }
    view.appendChild(box);

    var canvasWrap = el('div', 'deduce-canvas-wrap');
    var toolbar = el('div', 'deduce-toolbar');
    var addNoteBtn = el('button', 'btn-primary', '+ 添加笔记');
    addNoteBtn.addEventListener('click', addNote);
    var clearBtn = el('button', 'btn-ghost', '清空画布');
    clearBtn.addEventListener('click', function () {
      if (!confirm('确认清空推理画布?')) return;
      state.deductionBoard = { nodes: [], edges: [] };
      saveState();
      render();
    });
    var submitBtn = el('button', 'btn-primary', '📜 提交档案卡');
    submitBtn.style.background = 'linear-gradient(180deg, var(--c-danger), #832D2D)';
    submitBtn.style.boxShadow = '0 2px 6px rgba(166,61,61,.30)';
    submitBtn.addEventListener('click', openCaseFile);
    toolbar.appendChild(addNoteBtn);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(submitBtn);
    canvasWrap.appendChild(toolbar);

    var canvas = el('div', 'deduce-canvas');
    canvas.id = 'deduce-canvas';
    canvasWrap.appendChild(canvas);

    canvas.addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    canvas.addEventListener('drop', function (e) {
      e.preventDefault();
      var cid = e.dataTransfer.getData('text/plain');
      if (!cid) return;
      var rect = canvas.getBoundingClientRect();
      addClueNode(cid, e.clientX - rect.left, e.clientY - rect.top);
    });

    view.appendChild(canvasWrap);
    host.appendChild(view);

    setTimeout(redrawBoard, 30);
  }

  function addClueNode(clueId, x, y) {
    var exist = state.deductionBoard.nodes.find(function (n) { return n.type === 'clue' && n.clueId === clueId; });
    if (exist) { showToast('该线索已在画布上。', 'warn'); return; }
    var node = {
      id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'clue', clueId: clueId, x: Math.max(8, x - 60), y: Math.max(8, y - 20)
    };
    state.deductionBoard.nodes.push(node);
    saveState();
    redrawBoard();
    playTone('tap');
    refreshClueBubbles();
  }
  function refreshClueBubbles() {
    var bubbles = document.querySelectorAll('.clue-bubble');
    bubbles.forEach(function (b) {
      var cid = b.dataset.clue;
      var on = state.deductionBoard.nodes.some(function (n) { return n.type === 'clue' && n.clueId === cid; });
      b.classList.toggle('on-board', on);
    });
  }
  function addNote() {
    var text = prompt('输入笔记内容:');
    if (!text || !text.trim()) return;
    var canvas = document.getElementById('deduce-canvas');
    var rect = canvas ? canvas.getBoundingClientRect() : { width: 600, height: 400 };
    var node = {
      id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'note', text: text.trim(),
      x: 40 + Math.random() * Math.max(40, rect.width - 220),
      y: 40 + Math.random() * Math.max(40, rect.height - 100),
      struck: false
    };
    state.deductionBoard.nodes.push(node);
    saveState();
    redrawBoard();
  }

  var connectingFrom = null;

  function redrawBoard() {
    var canvas = document.getElementById('deduce-canvas');
    if (!canvas) return;
    canvas.innerHTML = '';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'edge-layer');
    svg.setAttribute('preserveAspectRatio', 'none');
    canvas.appendChild(svg);
    state.deductionBoard.nodes.forEach(function (n) { renderBoardNode(canvas, n); });
    setTimeout(function () { drawEdges(svg); }, 10);
  }

  function renderBoardNode(canvas, n) {
    var node = el('div', 'deduce-node');
    node.dataset.id = n.id;
    if (n.type === 'note') node.classList.add('note');
    if (connectingFrom === n.id) node.classList.add('connecting');

    if (n.type === 'clue') {
      var c = getClue(n.clueId);
      node.appendChild(el('div', 'node-title', '🪶 ' + (c ? c.name : '?')));
    } else {
      var t = el('div', 'note-text', n.text);
      if (n.struck) t.classList.add('struck');
      node.appendChild(t);
    }

    var actions = el('div', 'node-actions');
    var connBtn = el('button', '', '连线');
    connBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!connectingFrom) {
        connectingFrom = n.id;
        showToast('已选起点,点击另一节点的"连线"完成。', 'warn');
      } else if (connectingFrom === n.id) {
        connectingFrom = null;
        showToast('已取消。');
      } else {
        var fromId = connectingFrom, toId = n.id;
        if (!state.deductionBoard.edges.some(function (eg) { return (eg.from === fromId && eg.to === toId) || (eg.from === toId && eg.to === fromId); })) {
          state.deductionBoard.edges.push({ from: fromId, to: toId });
          saveState();
          showToast('已连线。', 'success');
        }
        connectingFrom = null;
      }
      redrawBoard();
    });
    actions.appendChild(connBtn);
    if (n.type === 'note') {
      var strike = el('button', '', n.struck ? '复原' : '划掉');
      strike.addEventListener('click', function (e) {
        e.stopPropagation();
        n.struck = !n.struck;
        saveState();
        redrawBoard();
      });
      actions.appendChild(strike);
      var edit = el('button', '', '改');
      edit.addEventListener('click', function (e) {
        e.stopPropagation();
        var v = prompt('编辑笔记:', n.text);
        if (v != null) { n.text = v; saveState(); redrawBoard(); }
      });
      actions.appendChild(edit);
    }
    var del = el('button', 'danger', n.type === 'clue' ? '下板' : '删除');
    del.addEventListener('click', function (e) {
      e.stopPropagation();
      state.deductionBoard.nodes = state.deductionBoard.nodes.filter(function (x) { return x.id !== n.id; });
      state.deductionBoard.edges = state.deductionBoard.edges.filter(function (eg) { return eg.from !== n.id && eg.to !== n.id; });
      saveState();
      redrawBoard();
      refreshClueBubbles();
    });
    actions.appendChild(del);
    node.appendChild(actions);

    node.addEventListener('dblclick', function () {
      if (n.type === 'clue') {
        var c = getClue(n.clueId);
        if (c) showPopover(node, c);
      } else {
        showToast(n.text);
      }
    });

    node.style.left = n.x + 'px';
    node.style.top = n.y + 'px';

    var startX, startY, ox, oy;
    var draggingNow = false;
    function moveHandler(e) {
      if (!draggingNow) return;
      var cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
      var cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
      if (cx == null || cy == null) return;
      var dx = cx - startX, dy = cy - startY;
      n.x = Math.max(0, ox + dx);
      n.y = Math.max(0, oy + dy);
      node.style.left = n.x + 'px';
      node.style.top = n.y + 'px';
      drawEdges(canvas.querySelector('svg.edge-layer'));
      e.preventDefault();
    }
    function upHandler() {
      if (!draggingNow) return;
      draggingNow = false;
      node.classList.remove('dragging');
      saveState();
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', upHandler);
    }
    node.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      draggingNow = true;
      startX = e.clientX; startY = e.clientY;
      ox = n.x; oy = n.y;
      node.classList.add('dragging');
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
      e.preventDefault();
    });
    node.addEventListener('touchstart', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var t = e.touches[0];
      draggingNow = true;
      startX = t.clientX; startY = t.clientY;
      ox = n.x; oy = n.y;
      node.classList.add('dragging');
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', upHandler);
    }, { passive: true });

    canvas.appendChild(node);
  }

  function drawEdges(svg) {
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var canvas = document.getElementById('deduce-canvas');
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
    state.deductionBoard.edges.forEach(function (eg) {
      var fromN = state.deductionBoard.nodes.find(function (n) { return n.id === eg.from; });
      var toN = state.deductionBoard.nodes.find(function (n) { return n.id === eg.to; });
      if (!fromN || !toN) return;
      var fromEl = canvas.querySelector('[data-id="' + fromN.id + '"]');
      var toEl = canvas.querySelector('[data-id="' + toN.id + '"]');
      if (!fromEl || !toEl) return;
      var f = fromEl.getBoundingClientRect();
      var t = toEl.getBoundingClientRect();
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(f.left + f.width / 2 - rect.left));
      line.setAttribute('y1', String(f.top + f.height / 2 - rect.top));
      line.setAttribute('x2', String(t.left + t.width / 2 - rect.left));
      line.setAttribute('y2', String(t.top + t.height / 2 - rect.top));
      svg.appendChild(line);
    });
  }

  function showPopover(anchor, clue) {
    var existing = document.querySelector('.popover');
    if (existing) existing.remove();
    var pop = el('div', 'popover');
    pop.appendChild(el('div', 'pop-name', clue.name));
    pop.appendChild(el('div', 'pop-desc', clue.desc));
    pop.appendChild(el('div', 'pop-from', '来源:' + clue.from));
    var close = el('button', 'popover-close', '×');
    close.addEventListener('click', function () { pop.remove(); });
    pop.appendChild(close);
    var rect = anchor.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.left = Math.min(window.innerWidth - 300, rect.right + 8) + 'px';
    pop.style.top = Math.max(8, rect.top) + 'px';
    document.body.appendChild(pop);
    setTimeout(function () {
      var off = function (e) {
        if (!pop.contains(e.target) && e.target !== anchor) { pop.remove(); document.removeEventListener('click', off); }
      };
      document.addEventListener('click', off);
    }, 50);
  }

  /* ========== 模态框工具 ========== */
  function openModal(title, builder, opts) {
    var mask = document.getElementById('app-modal-host');
    mask.innerHTML = '';
    var modal = el('div', 'app-modal' + (opts && opts.wide ? ' wide' : ''));
    var head = el('div', 'app-modal-header');
    head.appendChild(el('h3', '', title));
    var close = el('button', 'app-modal-close', '×');
    close.addEventListener('click', closeModal);
    head.appendChild(close);
    modal.appendChild(head);
    var body = el('div', 'app-modal-body');
    modal.appendChild(body);
    var footer = el('div', 'app-modal-footer');
    modal.appendChild(footer);
    builder(body, footer);
    mask.appendChild(modal);
    mask.classList.add('open');
    return modal;
  }
  function closeModal() {
    var mask = document.getElementById('app-modal-host');
    if (!mask) return;
    mask.classList.remove('open');
    mask.innerHTML = '';
  }

  /* ========== 引导 / 菜单 / 攻略 ========== */
  function openIntroModal(autoFromStart) {
    openModal('📜 ' + GAME_DATA.caseInfo.title + ' · ' + GAME_DATA.caseInfo.subtitle, function (body, footer) {
      body.classList.add('intro-modal-body');
      body.appendChild(el('div', 'scroll-decoration'));
      body.appendChild(el('p', '', GAME_DATA.caseInfo.intro));
      body.appendChild(el('h4', '', '玩法概要'));
      var howto = GAME_DATA.caseInfo.howto.split('\n').slice(1);
      howto.forEach(function (line) {
        if (line.trim()) body.appendChild(el('div', '', line));
      });
      body.appendChild(el('div', 'scroll-decoration'));
      var startBtn = el('button', 'btn-primary', autoFromStart ? '开始调查' : '继续游戏');
      startBtn.addEventListener('click', function () {
        state.introSeen = true;
        saveState();
        closeModal();
        render();
      });
      footer.appendChild(startBtn);
    });
  }

  function openMenuModal() {
    openModal('☰ 菜单', function (body, footer) {
      body.appendChild(el('p', '', '已收集线索:' + state.collected.length + ' / ' + Object.keys(GAME_DATA.clues).length));
      body.appendChild(el('p', '', '已戳穿谎言:' + state.challengedLies.length + ' 条'));
      body.appendChild(el('p', '', '攻略已扣分:' + state.walkthroughPenalty + ' 分'));
      var resetBtn = el('button', 'btn-danger', '🗑 重新开始(清除存档)');
      resetBtn.addEventListener('click', function () {
        if (!confirm('确认重新开始?所有进度将被清除。')) return;
        resetState();
        closeModal();
        location.reload();
      });
      var closeBtn = el('button', 'btn-ghost', '关闭');
      closeBtn.addEventListener('click', closeModal);
      footer.appendChild(resetBtn);
      footer.appendChild(closeBtn);
    });
  }

  function openWalkthroughModal() {
    openModal('🗝 渐进攻略', function (body, footer) {
      body.appendChild(el('p', '', '解锁每条提示将不可撤回地扣减分数。请谨慎使用。当前已扣 ' + state.walkthroughPenalty + ' 分。'));
      GAME_DATA_EXTRA.walkthrough.stages.forEach(function (st) {
        var sec = el('div', 'walkthrough-section');
        sec.appendChild(el('h4', '', st.name));
        st.hints.forEach(function (h) {
          var row = el('div', 'hint-row');
          var unlocked = state.walkthroughUnlocked.indexOf(h.id) >= 0;
          if (unlocked) row.classList.add('unlocked');
          row.appendChild(el('div', 'hint-meta', h.level + ' · 解锁扣 ' + h.cost + ' 分'));
          row.appendChild(el('div', 'hint-text', h.text));
          if (!unlocked) {
            var btn = el('button', 'btn-ghost', '解锁此提示(扣 ' + h.cost + ' 分)');
            btn.addEventListener('click', function () {
              if (!confirm('解锁此提示将扣 ' + h.cost + ' 分,且不可撤回。是否继续?')) return;
              state.walkthroughUnlocked.push(h.id);
              state.walkthroughPenalty += h.cost;
              saveState();
              track('walkthrough_unlock', { hint: h.id, cost: h.cost });
              closeModal();
              openWalkthroughModal();
            });
            row.appendChild(btn);
          }
          sec.appendChild(row);
        });
        body.appendChild(sec);
      });
      var closeBtn = el('button', 'btn-ghost', '关闭');
      closeBtn.addEventListener('click', closeModal);
      footer.appendChild(closeBtn);
    });
  }

  /* ========== 档案卡 ========== */
  function openCaseFile() {
    if (state.collected.length < 6) {
      showToast('线索过少,先继续调查吧。', 'warn');
      return;
    }
    var cf = GAME_DATA_EXTRA.caseFile;
    openModal('📜 ' + cf.title, function (body, footer) {
      body.appendChild(el('p', '', cf.intro));
      var form = el('div', 'case-file-form');
      var picks = {};
      cf.questions.forEach(function (q) {
        var qDiv = el('div', 'question');
        qDiv.appendChild(el('h4', '', q.title));
        var opts = el('div', 'options');
        q.options.forEach(function (op) {
          var opt = el('label', 'option');
          var radio = document.createElement('input');
          radio.type = 'radio'; radio.name = q.id; radio.value = op.id;
          opt.appendChild(radio);
          var lbl = el('div', '');
          lbl.appendChild(el('div', '', op.label));
          opt.appendChild(lbl);
          radio.addEventListener('change', function () {
            picks[q.id] = op.id;
            opts.querySelectorAll('.option').forEach(function (o) { o.classList.remove('selected'); });
            opt.classList.add('selected');
          });
          opts.appendChild(opt);
        });
        qDiv.appendChild(opts);
        form.appendChild(qDiv);
      });
      body.appendChild(form);
      var submit = el('button', 'btn-primary', '盖印 · 提交断案');
      submit.addEventListener('click', function () {
        var allDone = cf.questions.every(function (q) { return picks[q.id]; });
        if (!allDone) { showToast('请回答全部四问。', 'warn'); return; }
        if (!confirm('一经提交,卷轴落朱印,不可改写。确定?')) return;
        scoreCaseFile(picks);
      });
      var cancel = el('button', 'btn-ghost', '取消');
      cancel.addEventListener('click', closeModal);
      footer.appendChild(cancel);
      footer.appendChild(submit);
    }, { wide: true });
  }

  function scoreCaseFile(picks) {
    var cf = GAME_DATA_EXTRA.caseFile;
    var correct = 0;
    var detail = [];
    cf.questions.forEach(function (q) {
      var pickedId = picks[q.id];
      var pickedOpt = q.options.find(function (o) { return o.id === pickedId; });
      var correctOpt = q.options.find(function (o) { return o.correct; });
      var ok = pickedOpt && pickedOpt.correct;
      if (ok) correct++;
      detail.push({
        title: q.title,
        picked: pickedOpt ? pickedOpt.label : '未答',
        ok: ok,
        comment: pickedOpt ? pickedOpt.comment : '',
        correctLabel: correctOpt.label
      });
    });
    var baseScore = Math.round((correct / cf.questions.length) * 100);
    var finalScore = Math.max(0, baseScore - state.walkthroughPenalty);
    state.caseAnswers = picks;
    state.caseResult = {
      base: baseScore,
      penalty: state.walkthroughPenalty,
      finalScore: finalScore,
      correct: correct,
      total: cf.questions.length,
      detail: detail,
      submittedAt: new Date().toISOString()
    };
    saveState();
    track('case_submit', { correct: correct, total: cf.questions.length, score: finalScore, penalty: state.walkthroughPenalty });
    showCaseResult();
  }

  function showCaseResult() {
    var r = state.caseResult;
    if (!r) return;
    playTone('stamp');
    openModal('断案 · 落印', function (body, footer) {
      var resultDiv = el('div', 'case-result');
      var seal = el('div', 'seal-stamp', r.correct === r.total ? '断' : (r.correct === 0 ? '冤' : '审'));
      resultDiv.appendChild(seal);
      var verdict = r.correct === r.total ? '案情大白,惊为天人' :
                    r.correct >= 3 ? '虽未尽善,然主线清晰' :
                    r.correct >= 2 ? '雾未尽散,尚需深思' :
                    '迷雾深锁,需重审之';
      resultDiv.appendChild(el('div', '', verdict));
      resultDiv.appendChild(el('div', 'score', r.finalScore + ' 分'));
      resultDiv.appendChild(el('div', 'score-detail',
        '答对 ' + r.correct + ' / ' + r.total + ' · 基础 ' + r.base + ' 分 · 攻略扣 ' + r.penalty + ' 分'));

      var ans = el('div', 'answer-detail');
      ans.appendChild(el('h5', '', '【真相复盘】'));
      r.detail.forEach(function (d) {
        var row = el('div', 'answer-row');
        var line1 = el('div', '');
        line1.innerHTML = '<strong>' + esc(d.title) + '</strong> · 你的答案:' +
          '<span style="color:' + (d.ok ? 'var(--c-success)' : 'var(--c-danger)') + '">' + esc(d.picked) + '</span>' +
          (d.ok ? ' ✓' : ' ✗ 正解:' + esc(d.correctLabel));
        row.appendChild(line1);
        if (d.comment) {
          var c = el('div', '');
          c.style.cssText = 'font-size:13px;color:var(--c-muted);margin-top:4px';
          c.textContent = d.comment;
          row.appendChild(c);
        }
        ans.appendChild(row);
      });
      resultDiv.appendChild(ans);
      body.appendChild(resultDiv);

      var shareBtn = el('button', 'btn-primary', '📤 生成分享卷轴');
      shareBtn.addEventListener('click', function () { closeModal(); triggerShare(); });
      var againBtn = el('button', 'btn-ghost', '重新调查(清存)');
      againBtn.addEventListener('click', function () {
        if (!confirm('确认重新开始?')) return;
        resetState();
        closeModal();
        location.reload();
      });
      var closeBtn = el('button', 'btn-ghost', '关闭');
      closeBtn.addEventListener('click', closeModal);
      footer.appendChild(againBtn);
      footer.appendChild(shareBtn);
      footer.appendChild(closeBtn);
    }, { wide: true });
  }

  /* ========== Toast ========== */
  function showToast(msg, kind) {
    var host = document.getElementById('app-toast-host');
    if (!host) return;
    var t = el('div', 'app-toast' + (kind ? ' ' + kind : ''));
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      setTimeout(function () { t.remove(); }, 320);
    }, kind === 'error' ? 4000 : 2600);
  }

  /* ========== 分享 ========== */
  function triggerShare() {
    var r = state.caseResult || {};
    var score = r.finalScore != null ? r.finalScore : '—';
    var text = '我在《金沙迷雾》中调查了金沙神殿大祭司之死,得分 ' + score + '。来试试这桩古蜀秘案吧 → ' + window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('分享文案已复制到剪贴板!');
      }).catch(function () {
        prompt('复制以下文字分享:', text);
      });
    } else {
      prompt('复制以下文字分享:', text);
    }
  }

  /* ========== 启动 ========== */
  document.addEventListener('DOMContentLoaded', function () {
    track('app_load', {});
    render();
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
    window.addEventListener('resize', function () {
      if (state.activeView === 'deduce') {
        var svg = document.querySelector('#deduce-canvas svg.edge-layer');
        if (svg) drawEdges(svg);
      }
    });
  });

  window.addEventListener('error', function (e) {
    console.error('[app error]', e.message);
  });
})();
