// Game State and Main Logic
const Game = {
  state: {
    phase: 'title', // title, prologue, explore, dialogue, search, deduction, casefile, ending
    currentScene: null,
    currentNPC: null,
    collectedClues: [],
    visitedScenes: [],
    talkedTo: {},
    challengesCompleted: 0,
    challengedNPCs: [],
    hintsUsed: 0,
    hintsRevealed: [],
    score: 0,
  },

  init() {
    this.bindEvents();
    this.showTitle();
  },

  bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => this.showPrologue());
    document.getElementById('btn-enter-game').addEventListener('click', () => this.enterExplore());
    document.getElementById('btn-clues').addEventListener('click', () => this.showClueBook());
    document.getElementById('btn-hint').addEventListener('click', () => this.showHintPanel());
    document.getElementById('btn-casefile').addEventListener('click', () => this.showCaseFile());
    document.getElementById('btn-back-explore').addEventListener('click', () => this.enterExplore());
    document.getElementById('close-clues').addEventListener('click', () => this.closeOverlay('clue-book'));
    document.getElementById('close-hints').addEventListener('click', () => this.closeOverlay('hint-panel'));
    document.getElementById('submit-casefile').addEventListener('click', () => this.submitCaseFile());
    document.getElementById('btn-replay').addEventListener('click', () => location.reload());
  },

  // --- SCREENS ---
  showTitle() {
    this.hideAllScreens();
    document.getElementById('screen-title').classList.add('active');
    const bg = document.getElementById('title-bg');
    ImageSystem.loadImage('title_bg', bg, 1200, 700);
  },

  showPrologue() {
    this.hideAllScreens();
    document.getElementById('screen-prologue').classList.add('active');
  },

  enterExplore() {
    this.hideAllScreens();
    document.getElementById('screen-explore').classList.add('active');
    this.renderSceneMap();
    this.updateUI();
  },

  showScene(sceneId) {
    const scene = SCENES[sceneId];
    if (!scene || !scene.unlocked) return;

    this.state.currentScene = sceneId;
    if (!this.state.visitedScenes.includes(sceneId)) {
      this.state.visitedScenes.push(sceneId);
      scene.visited = true;
    }

    this.hideAllScreens();
    document.getElementById('screen-scene').classList.add('active');
    this.renderScene(scene);
  },

  showDialogue(npcId) {
    const char = CHARACTERS[npcId];
    if (!char) return;
    this.state.currentNPC = npcId;
    this.hideAllScreens();
    document.getElementById('screen-dialogue').classList.add('active');
    this.renderDialogue(char);
  },

  showClueBook() {
    document.getElementById('clue-book').classList.add('active');
    this.renderClueBook();
  },

  showHintPanel() {
    document.getElementById('hint-panel').classList.add('active');
    this.renderHints();
  },

  showCaseFile() {
    this.hideAllScreens();
    document.getElementById('screen-casefile').classList.add('active');
    this.renderCaseFile();
  },

  showEnding(result) {
    this.hideAllScreens();
    document.getElementById('screen-ending').classList.add('active');
    this.renderEnding(result);
  },

  closeOverlay(id) {
    document.getElementById(id).classList.remove('active');
  },

  hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  },

  // --- RENDERING ---
  renderSceneMap() {
    const container = document.getElementById('scene-grid');
    container.innerHTML = '';
    checkSceneUnlocks(this.state.collectedClues);

    Object.values(SCENES).forEach(scene => {
      const card = document.createElement('div');
      card.className = `scene-card ${scene.unlocked ? 'unlocked' : 'locked'} ${scene.visited ? 'visited' : ''}`;
      card.innerHTML = `
        <div class="scene-img-wrap">
          <img class="scene-img" data-key="${scene.imageKey}" alt="${scene.name}">
          ${!scene.unlocked ? '<div class="lock-overlay"><span class="lock-icon">🔒</span></div>' : ''}
        </div>
        <div class="scene-info">
          <h3>${scene.name}</h3>
          <p class="scene-subtitle">${scene.subtitle}</p>
          ${scene.visited ? '<span class="badge visited-badge">已探索</span>' : ''}
          ${!scene.unlocked ? '<span class="badge locked-badge">需要更多线索</span>' : ''}
        </div>
      `;
      if (scene.unlocked) {
        card.addEventListener('click', () => this.showScene(scene.id));
      }
      container.appendChild(card);

      const img = card.querySelector('.scene-img');
      ImageSystem.loadImage(scene.imageKey, img, 400, 250);
    });
  },

  renderScene(scene) {
    document.getElementById('scene-title').textContent = scene.name;
    document.getElementById('scene-subtitle').textContent = scene.subtitle;
    document.getElementById('scene-description').textContent = scene.description;

    const sceneImg = document.getElementById('scene-main-img');
    ImageSystem.loadImage(scene.imageKey, sceneImg, 800, 450);

    // Auto-collect public clues
    scene.clues.public.forEach(clue => {
      if (!clue.found) {
        clue.found = true;
        this.addClue(clue.id, clue);
      }
    });

    // NPCs
    const npcContainer = document.getElementById('scene-npcs');
    npcContainer.innerHTML = '';
    scene.npcs.forEach(npcId => {
      const char = CHARACTERS[npcId];
      if (!char) return;
      const btn = document.createElement('button');
      btn.className = 'npc-btn';
      btn.innerHTML = `<img class="npc-avatar" data-key="${char.imageKey}"><span>${char.name}<br><small>${char.title}</small></span>`;
      btn.addEventListener('click', () => this.showDialogue(npcId));
      npcContainer.appendChild(btn);

      const avatar = btn.querySelector('.npc-avatar');
      ImageSystem.loadImage(char.imageKey, avatar, 80, 80);
    });

    // Search areas
    const searchContainer = document.getElementById('scene-search');
    searchContainer.innerHTML = '<h4>🔍 搜查区域</h4>';
    scene.searchAreas.forEach(area => {
      const btn = document.createElement('button');
      btn.className = 'search-btn';
      btn.textContent = area.name;
      btn.title = area.description;
      btn.addEventListener('click', () => this.searchArea(scene, area.name));
      searchContainer.appendChild(btn);
    });

    // Back button
    document.getElementById('btn-back-from-scene').onclick = () => this.enterExplore();
  },

  searchArea(scene, areaName) {
    let found = [];
    scene.clues.hidden.forEach(clue => {
      if (!clue.found && clue.searchArea === areaName) {
        clue.found = true;
        this.addClue(clue.id, clue);
        found.push(clue);
      }
    });

    const msg = document.getElementById('scene-message');
    if (found.length > 0) {
      msg.innerHTML = found.map(c => `<div class="clue-found">🔎 发现隐藏线索：<strong>${c.name}</strong><br><small>${c.description}</small></div>`).join('');
      msg.classList.add('show');
    } else {
      msg.innerHTML = '<div class="clue-found empty">这里没有发现更多线索了。</div>';
      msg.classList.add('show');
    }
    setTimeout(() => msg.classList.remove('show'), 5000);
    this.updateUI();
    checkSceneUnlocks(this.state.collectedClues);
  },

  renderDialogue(char) {
    document.getElementById('dialogue-name').textContent = char.name;
    document.getElementById('dialogue-header-name').textContent = `对话 · ${char.name}`;
    document.getElementById('dialogue-title').textContent = char.title;
    document.getElementById('dialogue-desc').textContent = char.description;

    const portrait = document.getElementById('dialogue-portrait');
    ImageSystem.loadImage(char.imageKey, portrait, 300, 400);

    const topicContainer = document.getElementById('dialogue-topics');
    topicContainer.innerHTML = '';

    const topics = getAvailableTopics(char.id, this.state.collectedClues);
    topics.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.textContent = t.topic;
      btn.addEventListener('click', () => this.selectTopic(char, t));
      topicContainer.appendChild(btn);
    });

    // Pressure button for Atong
    if (char.id === 'atong' && this.state.collectedClues.includes('clue_atong_reaction')) {
      const pressBtn = document.createElement('button');
      pressBtn.className = 'topic-btn pressure';
      pressBtn.textContent = '施压追问真相';
      pressBtn.addEventListener('click', () => {
        const topic = char.topics['说实话'];
        this.selectTopic(char, { topic: '说实话', ...topic });
      });
      topicContainer.appendChild(pressBtn);
    }

    // Challenge button
    if (char.challenge && !this.state.challengedNPCs.includes(char.id)) {
      if (canChallenge(char.id, this.state.collectedClues)) {
        const challengeBtn = document.createElement('button');
        challengeBtn.className = 'topic-btn challenge';
        challengeBtn.textContent = `⚡ 质疑 ${char.name} 的证词`;
        challengeBtn.addEventListener('click', () => this.challengeNPC(char, true));
        topicContainer.appendChild(challengeBtn);
      } else if (canPartialChallenge(char.id, this.state.collectedClues)) {
        const partialBtn = document.createElement('button');
        partialBtn.className = 'topic-btn challenge partial';
        partialBtn.textContent = `⚡ 尝试质疑 ${char.name}`;
        partialBtn.addEventListener('click', () => this.challengeNPC(char, false));
        topicContainer.appendChild(partialBtn);
      }
    }

    document.getElementById('dialogue-text').textContent = `你面前站着${char.name}——${char.title}。选择一个话题开始对话。`;
    document.getElementById('btn-back-from-dialogue').onclick = () => {
      if (this.state.currentScene) this.showScene(this.state.currentScene);
      else this.enterExplore();
    };
  },

  selectTopic(char, topicData) {
    const textEl = document.getElementById('dialogue-text');
    textEl.innerHTML = `<strong>${char.name}：</strong>"${topicData.text}"`;

    if (topicData.clueGiven && !this.state.collectedClues.includes(topicData.clueGiven)) {
      const allClues = this.getAllClueData();
      const clue = allClues[topicData.clueGiven];
      if (clue) {
        this.addClue(topicData.clueGiven, clue);
        textEl.innerHTML += `<div class="clue-found">📝 获得线索：<strong>${clue.name}</strong></div>`;
      }
    }

    if (topicData.isLie) {
      textEl.innerHTML += '<div class="lie-hint">（这段证词似乎有疑点……）</div>';
    }
    if (topicData.isSlip) {
      textEl.innerHTML += '<div class="lie-hint">（他提到了"水道"——但你从未在他面前说过这个词！）</div>';
    }
    if (topicData.suspicious) {
      textEl.innerHTML += '<div class="lie-hint">（反应有些可疑……）</div>';
    }

    this.updateUI();
  },

  challengeNPC(char, fullEvidence) {
    const textEl = document.getElementById('dialogue-text');
    if (fullEvidence) {
      textEl.innerHTML = `<div class="challenge-result success"><strong>⚡ 质疑成功！</strong><br>${char.challenge.successText}</div>`;
      this.state.challengesCompleted++;
      this.state.challengedNPCs.push(char.id);
    } else if (char.challenge.partialText) {
      textEl.innerHTML = `<div class="challenge-result partial"><strong>⚡ 部分突破</strong><br>${char.challenge.partialText}</div>`;
    } else {
      textEl.innerHTML = `<div class="challenge-result fail"><strong>质疑失败</strong><br>${char.challenge.failText}</div>`;
    }
    this.updateUI();
  },

  // --- CLUE SYSTEM ---
  addClue(clueId, clueData) {
    if (!this.state.collectedClues.includes(clueId)) {
      this.state.collectedClues.push(clueId);
      this.showNotification(`发现线索：${clueData.name}`);
    }
  },

  getAllClueData() {
    const all = {};
    Object.values(SCENES).forEach(scene => {
      [...scene.clues.public, ...scene.clues.hidden].forEach(c => { all[c.id] = c; });
    });
    return all;
  },

  renderClueBook() {
    const container = document.getElementById('clue-list');
    container.innerHTML = '';
    const allClues = this.getAllClueData();

    if (this.state.collectedClues.length === 0) {
      container.innerHTML = '<p class="empty-state">还未收集到任何线索。探索场景和与角色对话以获取线索。</p>';
      return;
    }

    this.state.collectedClues.forEach(clueId => {
      const clue = allClues[clueId];
      if (!clue) return;
      const card = document.createElement('div');
      card.className = 'clue-card';
      card.innerHTML = `<h4>${clue.name}</h4><p>${clue.description}</p>`;
      container.appendChild(card);
    });

    document.getElementById('clue-count').textContent = this.state.collectedClues.length;
  },

  // --- HINTS ---
  renderHints() {
    const container = document.getElementById('hint-list');
    container.innerHTML = '';

    DeductionSystem.hints.forEach((hint, i) => {
      const div = document.createElement('div');
      div.className = `hint-item ${this.state.hintsRevealed.includes(i) ? 'revealed' : ''}`;
      if (this.state.hintsRevealed.includes(i)) {
        div.innerHTML = `<p><strong>提示 ${hint.level}：</strong>${hint.text}</p>`;
      } else {
        div.innerHTML = `<p><strong>提示 ${hint.level}</strong>（扣${hint.cost}分）</p><button class="hint-btn" data-idx="${i}">查看提示</button>`;
        div.querySelector('.hint-btn').addEventListener('click', () => {
          this.state.hintsRevealed.push(i);
          this.state.hintsUsed++;
          this.renderHints();
        });
      }
      container.appendChild(div);
    });
  },

  // --- CASE FILE ---
  renderCaseFile() {
    // Suspect select
    const killerSelect = document.getElementById('cf-killer');
    killerSelect.innerHTML = '<option value="">-- 选择凶手 --</option>';
    DeductionSystem.suspectOptions.forEach(s => {
      killerSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });

    // Motive select
    const motiveSelect = document.getElementById('cf-motive');
    motiveSelect.innerHTML = '<option value="">-- 选择动机 --</option>';
    DeductionSystem.motiveOptions.forEach(m => {
      motiveSelect.innerHTML += `<option value="${m.id}">${m.text}</option>`;
    });

    // Method select
    const methodSelect = document.getElementById('cf-method');
    methodSelect.innerHTML = '<option value="">-- 选择手法 --</option>';
    DeductionSystem.methodOptions.forEach(m => {
      methodSelect.innerHTML += `<option value="${m.id}">${m.text}</option>`;
    });

    // Evidence checkboxes
    const evidenceDiv = document.getElementById('cf-evidence');
    evidenceDiv.innerHTML = '';
    DeductionSystem.evidenceOptions.forEach(e => {
      if (this.state.collectedClues.includes(e.id)) {
        evidenceDiv.innerHTML += `<label class="evidence-option"><input type="checkbox" value="${e.id}"> ${e.text}</label>`;
      }
    });
  },

  submitCaseFile() {
    const killer = document.getElementById('cf-killer').value;
    const motive = document.getElementById('cf-motive').value;
    const method = document.getElementById('cf-method').value;
    const evidence = [...document.querySelectorAll('#cf-evidence input:checked')].map(el => el.value);

    if (!killer || !motive || !method) {
      this.showNotification('请完整填写所有档案项目！');
      return;
    }

    const result = DeductionSystem.calculateScore(
      { killer, motive, method, evidence },
      this.state
    );

    this.showEnding(result);
  },

  renderEnding(result) {
    document.getElementById('ending-score').textContent = result.score;
    document.getElementById('ending-rank').textContent = result.rank.title;
    document.getElementById('ending-stars').innerHTML = '★'.repeat(result.rank.stars) + '☆'.repeat(5 - result.rank.stars);
    document.getElementById('ending-desc').textContent = result.rank.description;

    const feedbackEl = document.getElementById('ending-feedback');
    feedbackEl.innerHTML = '';
    result.feedback.forEach(f => {
      feedbackEl.innerHTML += `<div class="feedback-item ${f.type}">${f.type === 'correct' ? '✅' : f.type === 'wrong' ? '❌' : f.type === 'bonus' ? '🌟' : f.type === 'penalty' ? '⚠️' : '🔶'} ${f.text}</div>`;
    });
  },

  // --- UI ---
  updateUI() {
    const count = this.state.collectedClues.length;
    document.querySelectorAll('[id^="toolbar-clue-count"]').forEach(el => el.textContent = count);

    const casefileBtn = document.getElementById('btn-casefile');
    if (casefileBtn) {
      casefileBtn.disabled = count < 10;
    }
  },

  showNotification(text) {
    const notif = document.getElementById('notification');
    notif.textContent = text;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => Game.init());
