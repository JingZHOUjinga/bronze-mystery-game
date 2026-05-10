// Scene Data - 6 explorable scenes with clues
const SCENES = {
  altar: {
    id: 'altar',
    name: '金沙祭坛',
    subtitle: '案发密室',
    description: '祭坛建在天然石丘之上，四面环水。方形石殿内，蚕丛祭司长的尸体倒卧在石台旁，胸口插着一把青铜短剑。密室从内部反锁，守卫整夜未离开。',
    imageKey: 'scene_altar',
    unlocked: true,
    visited: false,
    npcs: ['cancon'],
    clues: {
      public: [
        { id: 'clue_body', name: '蚕丛遗体', description: '五十余岁男性，穿太阳鸟纹祭袍，胸口插青铜短剑，双眼圆睁，面容震惊。右手紧握一片青铜碎片。', found: false },
        { id: 'clue_locked', name: '密室封锁', description: '铜门从内部反锁，门外四名守卫整夜未离开。房间四面厚重石墙，无窗户。', found: false },
        { id: 'clue_dagger', name: '青铜短剑', description: '剑身约一尺长，剑格处铸有蛇形纹章，蛇目嵌绿松石。做工精细，非普通武器，更像定制礼器。', found: false },
        { id: 'clue_fragment', name: '通天神树碎片', description: '掌心大小的青铜碎片，边缘锯齿状，表面刻有精细树枝纹样。死者右手紧握不放。', found: false },
      ],
      hidden: [
        { id: 'clue_water', name: '地面水渍', description: '东南角地面有几处极不显眼的水渍，从角落延伸到石台附近，间距约70-80厘米，如同一个人的步幅。触摸残留滑腻感。', found: false, searchArea: '地面' },
        { id: 'clue_oil', name: '墙角油脂', description: '东南角墙壁下方石板缝隙处有淡淡油光，带有草本植物和动物脂肪混合的气息。与普通祭祀净水完全不同。', found: false, searchArea: '墙角' },
        { id: 'clue_coldstone', name: '石板温差', description: '敲击东南角石板，声音与其他位置不同——带有水汽共鸣的闷响，像下方有含水腔体。', found: false, searchArea: '地面' },
      ]
    },
    searchAreas: [
      { name: '地面', description: '仔细检查黑色石板地面' },
      { name: '墙角', description: '查看东南角的墙壁根部' },
      { name: '石台', description: '检查祭坛石台周围' },
    ]
  },

  court: {
    id: 'court',
    name: '王宫议事厅',
    subtitle: '嫌疑人问询',
    description: '王宫第三层台地的宽敞大厅。五个嫌疑人坐在各自位置上，望帝妃坐在主位代行审问。气氛紧张而凝重。',
    imageKey: 'scene_court',
    unlocked: true,
    visited: false,
    npcs: ['baiguan', 'yufu', 'duyu', 'empress', 'zhulong'],
    clues: {
      public: [
        { id: 'clue_baiguan_alibi', name: '柏灌的证词', description: '声称整晚在药房配药，药童可以作证。但说话时左手食指不自觉摩挲拇指——典型紧张动作。', found: false },
        { id: 'clue_yufu_alibi', name: '鱼凫的证词', description: '声称整夜在城墙北段巡逻，从戌时到丑时。回答简短有力。', found: false },
        { id: 'clue_duyu_alibi', name: '杜宇的证词', description: '声称在客馆休息，侍女阿月在房外守夜直到天明。不在场证明最为完整。', found: false },
        { id: 'clue_empress_alibi', name: '望帝妃的证词', description: '整晚在东面山丘寝宫，三名侍女陪伴。与祭坛隔一条河和半座山。', found: false },
        { id: 'clue_zhulong_alibi', name: '烛龙的证词', description: '声称整晚在铸造坊赶工，学徒阿铜和小锡可作证。说话坚定。', found: false },
      ],
      hidden: [
        { id: 'clue_yufu_cinnabar', name: '鱼凫铠甲朱砂', description: '鱼凫左肩护甲缝隙有暗红粉末——那是祭坛入口处的朱砂粉。城墙上不会有朱砂。他去过祭坛。', found: false, searchArea: '观察' },
        { id: 'clue_atong_reaction', name: '学徒表情异常', description: '烛龙说"整晚没离开"时，身旁学徒阿铜眼睛闪了一下，嘴唇动了动却没说话。', found: false, searchArea: '观察' },
      ]
    },
    searchAreas: [
      { name: '观察', description: '仔细观察每个人的细节表现' },
    ]
  },

  waterway: {
    id: 'waterway',
    name: '祭坛地下水道',
    subtitle: '密室诡计破解',
    description: '从祭坛东南角掀开的石板下方，一条暗渠延伸向远方。水只到小腿肚，但寒意刺骨。弯腰通过约十分钟即可到达河岸出口。',
    imageKey: 'scene_waterway',
    unlocked: false,
    unlockCondition: ['clue_water', 'clue_coldstone'],
    visited: false,
    npcs: [],
    clues: {
      public: [
        { id: 'clue_tunnel', name: '地下暗渠', description: '直径约两尺的圆形洞口向下延伸，连接暗渠。渠高三尺、宽两尺半，勉强可弯腰通过。水面漂浮一层油膜。', found: false },
        { id: 'clue_exit', name: '河岸出口', description: '水道在芦苇丛中有出口，距祭坛约三百步。但通过水道只需十分钟。出口边缘有相同的油脂痕迹。', found: false },
      ],
      hidden: [
        { id: 'clue_scale', name: '青铜腰带鳞片', description: '在水道靠近祭坛出口处发现一片拇指甲大小的青铜鳞片，铸有精细云纹。这是开明国使者礼服腰带的装饰。', found: false, searchArea: '水道壁' },
        { id: 'clue_marks', name: '石壁工匠刻痕', description: '水道石壁上有修建工匠留下的标记。分岔口右侧有较新的油脂擦痕。', found: false, searchArea: '水道壁' },
      ]
    },
    searchAreas: [
      { name: '水道壁', description: '摸索水道两侧石壁' },
    ]
  },

  forge: {
    id: 'forge',
    name: '烛龙铸造坊',
    subtitle: '凶器追溯',
    description: '王城西南角的铸造坊，三座炼铜炉并排而立。焦灼气味扑鼻——铜、锡、木炭和泥范的混合。精铸间、库房一应俱全。',
    imageKey: 'scene_forge',
    unlocked: true,
    visited: false,
    npcs: ['zhulong', 'atong'],
    clues: {
      public: [
        { id: 'clue_snake_mark', name: '蛇形纹章', description: '凶器短剑的蛇形纹章是烛龙今年新启用的识别标记。确认是烛龙铸造。', found: false },
        { id: 'clue_order_claim', name: '烛龙的说法', description: '烛龙称短剑是三个月前为鱼凫将军定制的佩剑。但鱼凫否认下过这个订单。', found: false },
      ],
      hidden: [
        { id: 'clue_missing_sword', name: '库房失窃', description: '短剑一个月前从库房消失。库房锁不复杂，"任何会用铜丝的人都能打开"。烛龙未报失窃。', found: false, searchArea: '库房' },
        { id: 'clue_secret_tokens', name: '秘密令牌订单', description: '烛龙为柏灌铸造了一批刻有秘纹的青铜令牌，案发当晚去河边老树洞交货。这是他离开铸造坊的真正原因。', found: false, searchArea: '记录' },
      ]
    },
    searchAreas: [
      { name: '库房', description: '检查铸造坊的武器库房' },
      { name: '记录', description: '查看铸造订单和出入记录' },
    ]
  },

  archive: {
    id: 'archive',
    name: '王宫密档室',
    subtitle: '动机揭露',
    description: '第五层台地深处的无标记石墙后。数百卷竹简整齐码放，更古老的记录刻在龟甲兽骨上。年迈史官瞿上负责看管。',
    imageKey: 'scene_archive',
    unlocked: false,
    unlockCondition: ['clue_snake_mark', 'clue_order_claim'],
    visited: false,
    npcs: [],
    clues: {
      public: [
        { id: 'clue_fragment_power', name: '碎片真正功能', description: '通天神树碎片不只是重生材料——每片对应一种力量：占卜、祈雨、镇灾、通灵、定命、聚财、统御。蚕丛持有的是"占卜"之片。', found: false },
        { id: 'clue_prophecy', name: '蚕丛的预见', description: '蚕丛通过占卜碎片预见了政变阴谋，并向望帝呈送绝密奏简。', found: false },
      ],
      hidden: [
        { id: 'clue_secret_memo', name: '告密奏简', description: '标题为"论副祭司柏灌与将军鱼凫私通外邦事"。蚕丛发现柏灌与鱼凫密谋夺碎片、架空望帝，背后有开明国支持。', found: false, searchArea: '密卷' },
        { id: 'clue_kaiming', name: '开明国关联', description: '外邦势力明确指向开明国——而杜宇正是开明国使者。三个月前到访，与阴谋时间线完全吻合。', found: false, searchArea: '密卷' },
      ]
    },
    searchAreas: [
      { name: '密卷', description: '翻阅标注为"绝密"的竹简档案' },
    ]
  },

  inn: {
    id: 'inn',
    name: '客馆',
    subtitle: '真相揭露',
    description: '王宫东侧的两层木构建筑，外邦来客的住所。廊下灯笼洒出昏黄光芒。杜宇和侍女阿月就在这里。',
    imageKey: 'scene_inn',
    unlocked: false,
    unlockCondition: ['clue_secret_memo', 'clue_kaiming'],
    visited: false,
    npcs: ['ayue', 'duyu'],
    clues: {
      public: [
        { id: 'clue_ayue_hands', name: '阿月的手', description: '阿月双手太过细嫩，不像长年做粗活的侍女。更像养尊处优之人刻意伪装。', found: false },
      ],
      hidden: [
        { id: 'clue_ayue_accent', name: '阿月的口音', description: '要求阿月说城南方言时，她脸色瞬间发白。她有开明国特有的卷舌习惯，与杜宇一样。', found: false, searchArea: '质问' },
        { id: 'clue_duyu_oil', name: '杜宇的防水油', description: '杜宇腰间系着一个小铜瓶，内含桐油虫蜡混合防水油脂——开明国特产。成分与密室水渍旁的油脂完全一致。', found: false, searchArea: '搜查' },
        { id: 'clue_duyu_belt', name: '杜宇腰带缺损', description: '杜宇礼服腰带上的装饰鳞片缺了一片，位置和大小与水道中发现的青铜鳞片完全吻合。', found: false, searchArea: '搜查' },
      ]
    },
    searchAreas: [
      { name: '质问', description: '用方言测试质问阿月身份' },
      { name: '搜查', description: '搜查杜宇的随身物品' },
    ]
  }
};

// Scene unlock logic
function checkSceneUnlocks(collectedClues) {
  Object.values(SCENES).forEach(scene => {
    if (!scene.unlocked && scene.unlockCondition) {
      const allMet = scene.unlockCondition.every(clueId => collectedClues.includes(clueId));
      if (allMet) {
        scene.unlocked = true;
      }
    }
  });
}
