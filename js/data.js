// 《金沙迷雾》游戏数据 —— 案件、人物、线索、对话
window.GAME_DATA = (function () {
  'use strict';

  var caseInfo = {
    title: '金沙迷雾',
    subtitle: '古蜀秘案 · 大祭司之死',
    intro:
      '亥时三刻,金沙神殿净室门由内闩死,大祭司"残从"伏尸殿中,胸口插着一柄蜷蛇绿松石短剑。' +
      '神殿长老于梦境中召唤了你——一名外来者,以"通天神树"碎片之名,赐你勘察特权。' +
      '净室无窗,门由内反闩,守卫整夜值守却称未见一人。这是一场不可能的密室。' +
      '你将穿行于神殿、王宫与地下水道,在祭祀文化与宫廷阴谋之间,揭开金沙之上层层迷雾。',
    howto:
      '【玩法概要】\n' +
      '· 在「调查」中点击场景的高亮区域搜查线索。\n' +
      '· 在「审讯」中输入关键词或点选推荐话题与角色对话。\n' +
      '· 已掌握线索可在审讯时点击「质疑」戳穿谎言。\n' +
      '· 在「线索」中筛选与查阅所有发现。\n' +
      '· 在「推理」中拖拽线索气泡上板,添加笔记并连线。\n' +
      '· 完成后在推理板提交「档案卡」断案。卡关时右上角的「攻略」会渐次给出提示。'
  };

  var stages = [
    {
      id: 1,
      name: '阶段一 · 祭祀现场',
      brief: '神殿密室,真凶不明',
      intro:
        '神殿外烛火摇曳,血色尚未干透。大祭司殒命于由内反闩的净室,无窗、无暗门、无外人。' +
        '神殿长老梦见的"外来者",此刻正立于祭坛石阶之下。先从主祭坛与净室开始,听听守卫与低级祭司的话。',
      unlockHint: '调查神殿,与守卫与低阶祭司对话,寻找密室成因。',
      requireClues: 0,
      scenes: ['scene_zhutan', 'scene_jingshi'],
      characters: ['char_jian', 'char_yun']
    },
    {
      id: 2,
      name: '阶段二 · 宫廷暗流',
      brief: '权势之下,谎言织网',
      intro:
        '神殿之外,另有暗潮。宫廷议事厅与贵族昭府之中,军令、家训、家书之间,蛛丝马迹隐伏。' +
        '此阶段你需在权贵的辞令中辨析真伪,在宴客之笑中识破伪装,记得用线索质疑谎言。',
      unlockHint: '收集 5 条以上阶段一线索后开放',
      requireClues: 5,
      scenes: ['scene_yishiting', 'scene_zhaofu'],
      characters: ['char_zhao', 'char_li']
    },
    {
      id: 3,
      name: '阶段三 · 水道迷踪',
      brief: '水声潺潺,真相浮现',
      intro:
        '王城地下,古蜀水道纵横如鳞。东南角石板之下,水流幽暗,通向神殿之底。' +
        '一切谋杀的密室、政变的暗影,皆在这条水道里汇聚。寻一位水道老人,与他对谈,把所有线索连缀成网。',
      unlockHint: '累计收集 9 条以上线索后开放',
      requireClues: 9,
      scenes: ['scene_shuidaoinkou', 'scene_dixia'],
      characters: ['char_laochuan']
    }
  ];

  var scenes = {
    scene_zhutan: {
      id: 'scene_zhutan',
      name: '金沙神殿主祭坛',
      stage: 1,
      ambient: 'temple',
      desc:
        '青铜神树残桩矗立于祭坛中央,八方烛火摇曳,焚香未尽。东南角石阶下泥土微湿,几只鸬鹚铜雀俯首列阵。',
      areas: [
        { id: 'a_zhutan_layout', name: '祭坛布局', clue: 'c01', hint: '观察祭坛整体的方位与陈设', searched: false, searchTip: '东南方向的石阶角度异于他处,似有移位。' },
        { id: 'a_zhutan_floor', name: '地砖夹缝', clue: 'c02', hint: '蹲下看地砖间的细缝', hidden: true, searchTip: '砖缝间有一缕极淡的青色微光余晖,似神器残留。' }
      ],
      characters: ['char_yun']
    },
    scene_jingshi: {
      id: 'scene_jingshi',
      name: '大祭司净室',
      stage: 1,
      ambient: 'crime',
      desc:
        '空气尚带血腥,残从伏于净室正中。门由内反闩,顶上无天窗,墙壁青砖严丝合缝。' +
        '一柄青铜短剑刺入其胸,蜷蛇盘旋,绿松石嵌目,寒光森森。',
      areas: [
        { id: 'a_jingshi_body', name: '尸首与凶器', clue: 'c03', hint: '观察凶器的形制与刻纹', searched: false, searchTip: '凶器为蜷蛇形青铜短剑,绿松石嵌目,做工精细,绝非市井所出。' },
        { id: 'a_jingshi_floor', name: '地面水渍', clue: 'c04', hint: '凑近闻一闻地面的水渍', hidden: true, searchTip: '从东南角延至中央有数滴水渍,间隔约 80 公分,触感滑腻,有兽脂与茶树的混合气味。' },
        { id: 'a_jingshi_hand', name: '残从的手', clue: 'c05', hint: '检查死者的手中之物', hidden: true, searchTip: '死者紧握半张帛书残片:"厉…博官…明日上奏…警…"' }
      ],
      characters: ['char_jian']
    },
    scene_yishiting: {
      id: 'scene_yishiting',
      name: '宫廷议事厅',
      stage: 2,
      ambient: 'court',
      desc:
        '议事厅高悬几面青铜军令牌,玉案陈列简册。香烟袅袅,殿外有甲士肃立。',
      areas: [
        { id: 'a_yishi_junling', name: '征南军令', clue: 'c09', hint: '细看墙上军令的落款', searched: false, searchTip: '墙上悬挂厉将军最新军令,落款日期与案发同夜,但调兵之地距神殿不过六十里。' },
        { id: 'a_yishi_zhonglou', name: '钟楼夜班簿', clue: 'c10', hint: '翻阅角落的钟楼记录', hidden: true, searchTip: '钟楼夜班簿记载:案发当夜亥时三刻,神殿大门附近无人值守。' },
        { id: 'a_yishi_zhulong', name: '朱龙坊兵器册', clue: 'c11', hint: '翻找议事厅深处的兵器登记', hidden: true, requirePrivilege: true, searchTip: '朱龙坊呈交议事厅的兵器登记册中,赫然记载:"将军厉,定制蜷蛇短剑一柄,绿松石嵌目。"' }
      ],
      characters: ['char_li']
    },
    scene_zhaofu: {
      id: 'scene_zhaofu',
      name: '贵族"昭"的府邸',
      stage: 2,
      ambient: 'noble',
      desc:
        '昭府院落雅致,玉砌石阶,堂上挂祖训石碑。后院花影婆娑,处处陈设却隐隐透出陌生格调。',
      areas: [
        { id: 'a_zhaofu_jiaxun', name: '家训石碑', clue: 'c13', hint: '诵读家训碑文', searched: false, searchTip: '碑文字句倒装生硬,不合古蜀语习,似由他乡之人代笔。' },
        { id: 'a_zhaofu_shoji', name: '卧房暗格', clue: 'c14', hint: '搜查卧房的暗格', hidden: true, searchTip: '暗格藏一卷《舌音正习》,反复练习卷舌音 —— 古蜀方言无此发音。' },
        { id: 'a_zhaofu_letter', name: '未寄出的家书', clue: 'c15', hint: '翻动书桌上的笺纸', hidden: true, requirePrivilege: true, searchTip: '一封未寄家书,落款"开明",字里行间问候母亲在故国安康,提及"碎片即将到手"。' }
      ],
      characters: ['char_zhao']
    },
    scene_shuidaoinkou: {
      id: 'scene_shuidaoinkou',
      name: '王城地下水道入口',
      stage: 3,
      ambient: 'water',
      desc:
        '王城西郊苇丛深深,泥岸湿滑。水道入口由几块乱石遮掩,水声潺潺,带着腐叶与铜锈之气。',
      areas: [
        { id: 'a_shuid_zuji', name: '苇丛足迹', clue: 'c18', hint: '观察泥地上的足印', searched: false, searchTip: '苇丛中数串浅深不一的足迹,长度与昭公子相符,但沾有非贵族应有的水道泥垢。' },
        { id: 'a_shuid_daigou', name: '苇丛深处', clue: 'c19', hint: '拨开苇丛深处的杂物', hidden: true, searchTip: '一枚开明国制式铜带钩遗落于苇丛深处,做工细致,显是仓促之间脱落。' }
      ],
      characters: ['char_laochuan']
    },
    scene_dixia: {
      id: 'scene_dixia',
      name: '地下水道密室',
      stage: 3,
      ambient: 'water',
      desc:
        '水道尽头,一间四壁青砖的密室浮现。墙上钉着锈铁环,壁龛里隐有微光。空气滞重,水声从更深处传来。',
      areas: [
        { id: 'a_dixia_rope', name: '壁上麻绳', clue: 'c21', hint: '检视墙壁挂钩上的物事', hidden: true, searchTip: '墙壁挂钩上一条麻绳,浸透茶油与兽脂,绳长正好可降至神殿净室东南角竖井。' },
        { id: 'a_dixia_fragment', name: '神龛微光', clue: 'c22', hint: '掀开神龛上的供布', hidden: true, searchTip: '一片青铜碎片在神龛深处微微发光 —— 残从遗失的"占卜碎片"。' },
        { id: 'a_dixia_zoushu', name: '神龛之后', clue: 'c23', hint: '撬开神龛后的暗夹层', hidden: true, requirePrivilege: true, searchTip: '一卷《博官、厉与开明勾连记》密奏藏于神龛之后,详述政变阴谋与神器交易。' }
      ],
      characters: []
    }
  };

  var clues = {
    c01: { id: 'c01', name: '主祭坛东南布局', stage: 1, source: 'scene', from: '金沙神殿主祭坛', type: '物证',
      desc: '主祭坛东南角石阶有移位痕迹,与古蜀地下水道传说指向之东南方位吻合,疑有暗道。', open: true },
    c02: { id: 'c02', name: '神器残留余晖', stage: 1, source: 'scene', from: '金沙神殿主祭坛', type: '物证',
      desc: '祭坛地砖夹缝中残存极淡青光余晖,似有神器碎片曾置于此 —— 极可能是大祭司随身的"占卜碎片"。', open: false },
    c03: { id: 'c03', name: '蜷蛇青铜短剑', stage: 1, source: 'scene', from: '大祭司净室', type: '物证',
      desc: '凶器为蜷蛇形青铜短剑,绿松石嵌目,做工精致 —— 必为定制礼器,非市井凡器。', open: true },
    c04: { id: 'c04', name: '非连续水渍带油脂', stage: 1, source: 'scene', from: '大祭司净室', type: '物证',
      desc: '净室东南角至中央有数滴水渍,间隔约 80 公分,触感滑腻、混茶油兽脂气 —— 非祭祀净水,而是有人涂油绳降时滴落。', open: false },
    c05: { id: 'c05', name: '残从手中的密信残片', stage: 1, source: 'scene', from: '大祭司净室', type: '物证',
      desc: '半张帛书残片:"厉…博官…明日上奏…警…"。大祭司临死之前似在揭露阴谋。', open: false },
    c06: { id: 'c06', name: '大祭司近日反常', stage: 1, source: 'character', from: '低级祭司"芸"', type: '证言',
      desc: '据芸所述,大祭司近七日眉头紧锁,常深夜入藏书阁翻阅《通天神树录》。', open: true },
    c07: { id: 'c07', name: '占卜碎片下落', stage: 1, source: 'character', from: '低级祭司"芸"', type: '证言',
      desc: '残从手中确握有"占卜碎片",可窥宫廷异动 —— 案发后不知所踪。', open: false },
    c08: { id: 'c08', name: '坚收受厉字玉佩', stage: 1, source: 'character', from: '神殿守卫长"坚"', type: '证言',
      desc: '坚被钟楼记录戳穿后承认:亥时三刻收受了一枚"厉"字款玉佩,离岗一炷香,期间神殿大门无人值守。', open: false, viaChallenge: true },

    c09: { id: 'c09', name: '厉的征南军令', stage: 2, source: 'scene', from: '宫廷议事厅', type: '物证',
      desc: '军令落款日期与案发同夜,且调兵之地距神殿仅六十里 —— 厉远非"无暇分身"。', open: true },
    c10: { id: 'c10', name: '钟楼夜班簿', stage: 2, source: 'scene', from: '宫廷议事厅', type: '物证',
      desc: '钟楼记录显示:案发当夜亥时三刻,神殿大门附近无人值守 —— 守卫长"坚"声称整夜在岗,与此矛盾。', open: false },
    c11: { id: 'c11', name: '朱龙坊定制单据', stage: 2, source: 'scene', from: '宫廷议事厅', type: '物证',
      desc: '朱龙坊兵器登记册:"将军厉,定制蜷蛇短剑一柄,绿松石嵌目。" —— 凶器与厉直接相连。', open: false, requirePrivilege: true },
    c12: { id: 'c12', name: '厉的不在场证明', stage: 2, source: 'character', from: '宫廷将军"厉"', type: '证言',
      desc: '厉自称案发当夜亥时至寅时,全程在征南大营议事,有十二亲兵作证 —— alibi 过于完美。', open: true },
    c13: { id: 'c13', name: '昭府家训倒装', stage: 2, source: 'scene', from: '贵族"昭"的府邸', type: '物证',
      desc: '家训石碑字句倒装生硬,不合古蜀语习,显是异乡之人代笔 —— 昭氏世居蜀地之说存疑。', open: true },
    c14: { id: 'c14', name: '舌音练习卷', stage: 2, source: 'scene', from: '贵族"昭"的府邸', type: '物证',
      desc: '《舌音正习》手抄本反复练习卷舌音 —— 古蜀方言无此发音,而开明国语正含此音。', open: false },
    c15: { id: 'c15', name: '落款"开明"的家书', stage: 2, source: 'scene', from: '贵族"昭"的府邸', type: '物证',
      desc: '未寄家书落款"开明",问候母亲在故国安康,并提及"碎片即将到手"。昭实为开明国间谍。', open: false, requirePrivilege: true },
    c16: { id: 'c16', name: '昭对水道太熟悉', stage: 2, source: 'character', from: '贵族"昭"', type: '证言',
      desc: '昭闲谈中提及"神殿东南角石板下"暗道,但他声称从未涉足神殿 —— 显然口误漏馅。', open: true },
    c17: { id: 'c17', name: '昭手部反常', stage: 2, source: 'character', from: '贵族"昭"', type: '证言',
      desc: '昭手掌光滑,无贵族剑士应有的剑茧 —— 与其声称的"昭氏世代尚武"背道而驰。', open: true },

    c18: { id: 'c18', name: '苇丛足迹', stage: 3, source: 'scene', from: '王城地下水道入口', type: '物证',
      desc: '苇丛中数串足迹,长度与昭公子吻合,沾有非贵族应有的水道泥垢。', open: true },
    c19: { id: 'c19', name: '开明国铜带钩', stage: 3, source: 'scene', from: '王城地下水道入口', type: '物证',
      desc: '一枚开明国制式铜带钩遗落苇丛 —— 与昭府家书互证,凶手身份呼之欲出。', open: false },
    c20: { id: 'c20', name: '老川夜见之人', stage: 3, source: 'character', from: '水道维护工"老川"', type: '证言',
      desc: '老川亥时末在水道东头见过一人:湿身爬出,身披贵族绛色外袍,身材瘦高 —— 与昭体型一致。', open: true },
    c21: { id: 'c21', name: '油脂麻绳', stage: 3, source: 'scene', from: '地下水道密室', type: '物证',
      desc: '麻绳浸透茶油与兽脂,长度恰好可降至净室东南角竖井 —— 凶手凭此潜入密室。', open: false },
    c22: { id: 'c22', name: '占卜碎片', stage: 3, source: 'scene', from: '地下水道密室', type: '物证',
      desc: '神龛深处一片青铜碎片微光熠熠,正是大祭司遗失的"占卜碎片" —— 凶手意在此物。', open: false },
    c23: { id: 'c23', name: '《博官厉开明勾连记》', stage: 3, source: 'scene', from: '地下水道密室', type: '物证',
      desc: '密奏详述:副祭司博官、将军厉与开明国合谋政变,以神器换军援,大祭司之死乃灭口之举。', open: false, requirePrivilege: true }
  };

  return {
    caseInfo: caseInfo,
    stages: stages,
    scenes: scenes,
    clues: clues
  };
})();
