// NPC Character Data and Dialogue Trees
const CHARACTERS = {
  cancon: {
    id: 'cancon', name: '蚕丛', title: '大祭司长（已故）',
    imageKey: 'char_cancon', isLiar: false, isDead: true,
    description: '五十余岁，面容消瘦。穿太阳鸟纹黑色祭袍。作为祭司长守护占卜碎片六十年，因预见政变阴谋被杀。',
    topics: {
      '身份': { text: '蚕丛，古蜀大祭司长。守护通天神树占卜碎片六十年。据说能预见国运兴衰。', clueGiven: null },
      '死因': { text: '胸口被一把蛇纹青铜短剑刺中，当场毙命。面容震惊，似乎看到了认识的人。右手死死攥着碎片不放。', clueGiven: null },
    }
  },

  baiguan: {
    id: 'baiguan', name: '柏灌', title: '大祭司副手',
    imageKey: 'char_baiguan', isLiar: true, isDead: false,
    description: '五十出头，面色苍白，指尖有常年接触草药的暗色沉淀。神态谦卑但眼神游移。',
    lieAbout: '当晚行踪',
    truth: '实际中途离开药房约一个时辰，去河边老树洞取烛龙铸造的秘纹令牌——为政变做准备。',
    topics: {
      '当晚行踪': { text: '我整晚都在药房配药。望帝最近病情反复，需要每日更换药方。药童可以作证。', clueGiven: 'clue_baiguan_alibi', isLie: true },
      '与蚕丛关系': { text: '蚕丛大人是我的上级，我一直辅佐他主持祭祀。虽然在一些事务上有分歧，但我敬重他。', clueGiven: null },
      '关于碎片': { text: '碎片？那是大祭司长的职责范围，我不敢僭越。', clueGiven: null, suspicious: true },
      '秘纹令牌': { text: '（面色大变）你……你怎么知道这件事的？那是……是一些普通的祭祀用品罢了。', clueGiven: null, requireClue: 'clue_secret_tokens' },
    },
    challenge: {
      evidence: ['clue_secret_tokens', 'clue_secret_memo'],
      successText: '柏灌双膝发软，瘫坐在地。"是……是的，我和鱼凫确实有过……一些不当的想法。但我们没有杀蚕丛！我发誓！那天晚上我是去取令牌的……我承认我说了谎，但杀人的不是我！"',
      failText: '柏灌摇头："你没有证据，外来者。不要凭空猜测。"'
    }
  },

  yufu: {
    id: 'yufu', name: '鱼凫', title: '王城守备将军',
    imageKey: 'char_yufu', isLiar: true, isDead: false,
    description: '身材魁梧，方脸阔鼻，目光锐利。穿将军甲胄，腰佩长剑，坐姿如松。',
    lieAbout: '当晚行踪',
    truth: '当晚确实离开城墙去了祭坛附近踩点，为政变做准备。铠甲上的朱砂粉末暴露了他。',
    topics: {
      '当晚行踪': { text: '昨夜我在城墙北段巡逻，从戌时到丑时，之后回营就寝。城墙士兵都看到我了。', clueGiven: 'clue_yufu_alibi', isLie: true },
      '关于短剑': { text: '什么定制短剑？我没有向烛龙下过任何订单。你去问他，看他是不是记错了。', clueGiven: null },
      '铠甲朱砂': { text: '（表情微变）……那可能是训练场的红土。没什么大不了的。', clueGiven: null, requireClue: 'clue_yufu_cinnabar', suspicious: true },
      '与柏灌关系': { text: '我和柏灌？不过是公事上的往来。你不要乱猜。', clueGiven: null },
    },
    challenge: {
      evidence: ['clue_yufu_cinnabar', 'clue_secret_memo'],
      successText: '鱼凫紧攥拳头，铁青的脸上肌肉抽动。"……好吧。那天晚上我确实去了祭坛附近。但我只是去看地形！我和柏灌的计划还没有实施，我绝没有杀蚕丛！那个时候蚕丛还活着！"',
      failText: '鱼凫冷冷地看着你："城墙上的朱砂？荒谬。拿出真凭实据再来。"'
    }
  },

  duyu: {
    id: 'duyu', name: '杜宇', title: '开明国使者',
    imageKey: 'char_duyu', isLiar: false, isDead: false, isKiller: true,
    description: '面容俊朗的年轻男子，约三十岁。皮肤比古蜀人略深，穿蓝黑色异域长袍。举止优雅从容，嘴角总带着礼貌微笑。',
    topics: {
      '自我介绍': { text: '我来自开明国，此行是商议两国水利合作事宜。贵国的水利技术令人钦佩。', clueGiven: null },
      '当晚行踪': { text: '昨夜我在客馆休息。侍女阿月可以作证——她在我房外守夜，直到天明。', clueGiven: 'clue_duyu_alibi' },
      '关于水道': { text: '水道？啊，我对古蜀的水利确实很有兴趣，毕竟这是我此行的目的……等等，你说的是什么水道？', clueGiven: null, isSlip: true },
      '开明国油脂': { text: '（微笑僵硬了一瞬）防水油？那是我们行旅时的常备之物，过河渡水用的。你为什么问这个？', clueGiven: null, requireClue: 'clue_duyu_oil' },
    },
    challenge: {
      evidence: ['clue_duyu_oil', 'clue_duyu_belt', 'clue_scale'],
      successText: '杜宇闭上了眼睛。优雅的面具碎裂，露出间谍的冷漠。"你比我想象中聪明，外来者。你赢了。"他承认了一切——从水道潜入密室，用偷来的短剑杀害蚕丛，嫁祸烛龙和鱼凫以制造内乱。',
      failText: '杜宇微微一笑："这些都是巧合。你需要更有力的证据。"',
      partialEvidence: ['clue_duyu_oil', 'clue_scale'],
      partialText: '杜宇脸色变了，但仍在强撑。"油脂？不过是旅途用品……" 他的声音开始发颤。你感觉离真相只差一步了。'
    }
  },

  empress: {
    id: 'empress', name: '望帝妃', title: '王后',
    imageKey: 'char_empress', isLiar: false, isDead: false,
    description: '二十五六岁，金冠下面容美丽而冷漠。眉宇间有远超年龄的威严。代替病重的望帝主持朝政。',
    topics: {
      '当晚行踪': { text: '我整晚在寝宫，三名侍女陪伴在侧。寝宫在东面山丘，与祭坛隔了一条河和半座山。', clueGiven: 'clue_empress_alibi' },
      '与蚕丛关系': { text: '蚕丛是先王老臣，忠心耿耿。但他对新政多有保留。我们有分歧，但不至于刀剑相向。', clueGiven: null },
      '密档室': { text: '……如果你真能破案，密档室对你开放。但你查到的东西，第一个告诉我。', clueGiven: null },
      '关于政变': { text: '（目光冰冷）柏灌和鱼凫的异心，蚕丛生前已告知望帝。我们一直在观察。但没想到有人比我们先动了手。', clueGiven: null, requireClue: 'clue_secret_memo' },
    }
  },

  zhulong: {
    id: 'zhulong', name: '烛龙', title: '青铜铸造师',
    imageKey: 'char_zhulong', isLiar: true, isDead: false,
    description: '身材矮壮，双臂粗壮，裸露小臂满是烫伤疤痕。双手粗糙有力，指甲缝嵌着铜绿。声音沙哑。',
    lieAbout: '当晚行踪',
    truth: '亥时末离开铸造坊约一个时辰，去河边老树洞给柏灌送秘密铸造的青铜令牌。',
    topics: {
      '当晚行踪': { text: '我整晚在铸造坊赶工。王后催着要新祭祀礼器，工期紧。学徒阿铜和小锡都在，他们可以作证。', clueGiven: 'clue_zhulong_alibi', isLie: true },
      '关于短剑': { text: '看着像我的手艺。蛇纹是我今年新启用的标记。那把短剑是为鱼凫将军定制的。', clueGiven: 'clue_snake_mark' },
      '鱼凫否认': { text: '（僵住两秒）那……那他可能忘了。三个月前的事了……', clueGiven: 'clue_order_claim', requireClue: 'clue_snake_mark' },
      '秘密铸件': { text: '（叹气）……好吧。柏灌找我铸了一批秘纹令牌，说是密令。那天晚上他催我去河边老树洞送货。', clueGiven: 'clue_secret_tokens', requireClue: 'clue_missing_sword' },
    },
    challenge: {
      evidence: ['clue_atong_reaction', 'clue_missing_sword'],
      successText: '烛龙闭上眼睛，双手紧攥围裙。"……我确实在亥时末离开过铸造坊，大约一个时辰。我是去给柏灌送令牌的。至于那把短剑……一个月前就不见了，我不知道是谁拿的。"',
      failText: '烛龙摇头："我说的都是实话。你没有证据说我离开过。"'
    }
  },

  atong: {
    id: 'atong', name: '阿铜', title: '铸造坊学徒',
    imageKey: 'char_atong', isLiar: false, isDead: false,
    description: '十六七岁少年，圆脸，眼神里有掩饰不住的不安。烛龙的学徒。',
    topics: {
      '师父行踪': { text: '（看了烛龙一眼）是……是的，师父整晚都在。（嘴唇发抖）', clueGiven: null },
      '说实话': { text: '（低下头）师父……师父在亥时末离开过。大概走了一个多时辰才回来。他说去河边取水淬火，但平时取水从来不用那么久……', clueGiven: 'clue_atong_reaction', requirePressure: true },
      '短剑记忆': { text: '那把蛇纹短剑我记得！做得特别精细。一直放在库房里，但上个月师父说找不到了……', clueGiven: 'clue_missing_sword' },
    }
  },

  ayue: {
    id: 'ayue', name: '阿月', title: '客馆侍女',
    imageKey: 'char_ayue', isLiar: false, isDead: false, isAccomplice: true,
    description: '面容清秀的年轻女子，约二十岁，穿青灰色侍女布衣。但双手太过细嫩，不像做粗活的人。',
    topics: {
      '守夜': { text: '（低头）是的，我在杜宇大人房外守夜，他整晚都没有出来过。', clueGiven: null },
      '来历': { text: '我……我是古蜀人，城南的。已经在客馆做了三个月了。', clueGiven: null },
      '方言测试': { text: '（脸瞬间发白，后退一步）我……我不太会说方言……我从小在外长大……', clueGiven: 'clue_ayue_accent', requireClue: 'clue_kaiming' },
      '真相': { text: '（防线崩溃）杜宇大人让我守在门口……他从窗户走的，客馆后面有棵老树。亥时出去，寅时回来。回来时全身湿的……身上涂着一种油，开明国带来的。', clueGiven: 'clue_duyu_oil', requireClue: 'clue_ayue_accent' },
    }
  }
};

// Get available topics based on collected clues
function getAvailableTopics(charId, collectedClues) {
  const char = CHARACTERS[charId];
  if (!char) return [];
  const available = [];
  Object.entries(char.topics).forEach(([topic, data]) => {
    if (data.requireClue && !collectedClues.includes(data.requireClue)) return;
    if (data.requirePressure) return; // handled separately
    available.push({ topic, ...data });
  });
  return available;
}

function canChallenge(charId, collectedClues) {
  const char = CHARACTERS[charId];
  if (!char || !char.challenge) return false;
  return char.challenge.evidence.every(e => collectedClues.includes(e));
}

function canPartialChallenge(charId, collectedClues) {
  const char = CHARACTERS[charId];
  if (!char || !char.challenge || !char.challenge.partialEvidence) return false;
  return char.challenge.partialEvidence.every(e => collectedClues.includes(e)) &&
         !char.challenge.evidence.every(e => collectedClues.includes(e));
}
