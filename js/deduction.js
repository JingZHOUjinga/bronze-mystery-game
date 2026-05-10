// Deduction System - Case file submission and scoring
const DeductionSystem = {
  // Correct answers
  correctAnswers: {
    killer: 'duyu',
    motive: 'spy_chaos',
    method: 'waterway',
    evidence: ['clue_duyu_oil', 'clue_scale', 'clue_duyu_belt']
  },

  motiveOptions: [
    { id: 'spy_chaos', text: '间谍身份，杀害预言者制造内乱，保护政变阴谋' },
    { id: 'power_grab', text: '觊觎祭司长之位，夺取碎片权力' },
    { id: 'revenge', text: '个人恩怨复仇' },
    { id: 'military_coup', text: '军事政变，夺取王权' },
    { id: 'theft', text: '偷取通天神树碎片' },
  ],

  methodOptions: [
    { id: 'waterway', text: '通过地下水道潜入密室，涂防水油脂穿越暗渠，从东南角石板进入杀人后原路返回' },
    { id: 'poison', text: '在祭祀净水中下毒' },
    { id: 'inside', text: '藏在密室内等待时机' },
    { id: 'guard', text: '买通守卫从正门进入' },
    { id: 'window', text: '从密室窗户翻入' },
  ],

  evidenceOptions: [
    { id: 'clue_duyu_oil', text: '杜宇的桐油虫蜡防水油脂（与密室油脂成分一致）' },
    { id: 'clue_scale', text: '水道中的青铜腰带鳞片（与杜宇腰带缺损吻合）' },
    { id: 'clue_duyu_belt', text: '杜宇腰带缺损处（与鳞片完全吻合）' },
    { id: 'clue_water', text: '密室地面水渍' },
    { id: 'clue_oil', text: '墙角油脂痕迹' },
    { id: 'clue_ayue_accent', text: '阿月的开明国口音' },
    { id: 'clue_secret_memo', text: '蚕丛的告密奏简' },
    { id: 'clue_missing_sword', text: '库房短剑失窃记录' },
  ],

  suspectOptions: [
    { id: 'duyu', name: '杜宇（开明国使者）' },
    { id: 'baiguan', name: '柏灌（大祭司副手）' },
    { id: 'yufu', name: '鱼凫（王城将军）' },
    { id: 'zhulong', name: '烛龙（铸造师）' },
    { id: 'empress', name: '望帝妃（王后）' },
    { id: 'ayue', name: '阿月（侍女）' },
  ],

  calculateScore(submission, gameState) {
    let score = 0;
    let feedback = [];

    // Killer (40 points)
    if (submission.killer === this.correctAnswers.killer) {
      score += 40;
      feedback.push({ type: 'correct', text: '凶手判定正确：杜宇（开明国间谍）' });
    } else {
      feedback.push({ type: 'wrong', text: `凶手判定错误。正确答案：杜宇` });
    }

    // Motive (20 points)
    if (submission.motive === this.correctAnswers.motive) {
      score += 20;
      feedback.push({ type: 'correct', text: '动机判定正确：间谍制造内乱' });
    } else {
      feedback.push({ type: 'wrong', text: '动机判定错误。正确答案：间谍身份，杀害预言者保护政变阴谋' });
    }

    // Method (20 points)
    if (submission.method === this.correctAnswers.method) {
      score += 20;
      feedback.push({ type: 'correct', text: '手法判定正确：水道潜入密室' });
    } else {
      feedback.push({ type: 'wrong', text: '手法判定错误。正确答案：通过地下水道潜入' });
    }

    // Evidence (20 points - partial credit)
    const correctEvidence = submission.evidence.filter(e => this.correctAnswers.evidence.includes(e));
    const evidenceScore = Math.round((correctEvidence.length / this.correctAnswers.evidence.length) * 20);
    score += evidenceScore;
    if (evidenceScore === 20) {
      feedback.push({ type: 'correct', text: '关键证据全部正确' });
    } else if (evidenceScore > 0) {
      feedback.push({ type: 'partial', text: `关键证据部分正确（${correctEvidence.length}/${this.correctAnswers.evidence.length}）` });
    } else {
      feedback.push({ type: 'wrong', text: '关键证据判定错误' });
    }

    // Bonus/Penalty
    if (gameState.hintsUsed > 0) {
      const penalty = gameState.hintsUsed * 5;
      score -= penalty;
      feedback.push({ type: 'penalty', text: `使用攻略提示 ${gameState.hintsUsed} 次，扣除 ${penalty} 分` });
    }

    if (gameState.challengesCompleted >= 3) {
      score += 10;
      feedback.push({ type: 'bonus', text: '完成所有谎言质疑，奖励 10 分' });
    } else if (gameState.challengesCompleted > 0) {
      const bonus = gameState.challengesCompleted * 3;
      score += bonus;
      feedback.push({ type: 'bonus', text: `完成 ${gameState.challengesCompleted} 次质疑，奖励 ${bonus} 分` });
    }

    score = Math.max(0, Math.min(100, score));

    return { score, feedback, rank: this.getRank(score) };
  },

  getRank(score) {
    if (score >= 95) return { title: '神探', description: '完美破案！蚕丛在天之灵可以安息了。', stars: 5 };
    if (score >= 80) return { title: '名侦探', description: '出色的推理！你揭开了古蜀王国的阴谋。', stars: 4 };
    if (score >= 60) return { title: '调查员', description: '基本还原了真相，但还有些细节遗漏。', stars: 3 };
    if (score >= 40) return { title: '见习侦探', description: '找到了一些线索，但推理链还不完整。', stars: 2 };
    return { title: '迷途者', description: '真相仍被迷雾笼罩……再试一次吧。', stars: 1 };
  },

  // Progressive hints system
  hints: [
    { level: 1, text: '密室的关键在于——它真的是密室吗？注意地面上那些不起眼的痕迹。', cost: 5 },
    { level: 2, text: '想想谁最了解古蜀的水利系统？不一定是古蜀本地人。"不在场证明"太完美本身就是一种破绽。', cost: 5 },
    { level: 3, text: '凶手是杜宇。他是开明国间谍，通过地下水道进入密室。阿月是他的同伙。去客馆搜查他的防水油脂和腰带。', cost: 5 },
  ]
};
