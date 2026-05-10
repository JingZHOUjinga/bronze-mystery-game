// 档案卡 / 攻略 / 推荐话题
window.GAME_DATA_EXTRA = (function () {
  'use strict';

  var caseFile = {
    title: '断案档案卡',
    intro: '请依据所掌握的线索,在四问之下圈出你心中的真相。一经提交,卷轴落朱印,不可改写。',
    questions: [
      {
        id: 'q1',
        title: '凶手是谁?',
        options: [
          { id: 'A', label: '神殿守卫长"坚"', correct: false, comment: '坚虽离岗收贿,但他并未进入净室,亦无杀人之意。' },
          { id: 'B', label: '宫廷将军"厉"', correct: false, comment: '厉提供了凶器,但案发当夜未亲临神殿——他是同谋而非凶手。' },
          { id: 'C', label: '贵族"昭"(实为开明国间谍)', correct: true, comment: '昭借更衣脱身,自水道潜入净室行刺,正是真凶。' },
          { id: 'D', label: '副祭司"博官"', correct: false, comment: '博官在政变中是策划者,但案发夜并未亲自动手。' },
          { id: 'E', label: '低级祭司"芸"', correct: false, comment: '芸是受害者的弟子,无作案动机与能力。' }
        ]
      },
      {
        id: 'q2',
        title: '杀人动机为何?',
        options: [
          { id: 'A', label: '灭口大祭司,掩盖政变阴谋', correct: true, comment: '大祭司持占卜碎片可窥宫廷异动,一旦上奏,政变必败,故必除之。' },
          { id: 'B', label: '私人恩怨,寻仇雪耻', correct: false, comment: '昭与残从无私交,亦无私仇可言。' },
          { id: 'C', label: '掠夺神器,自立为王', correct: false, comment: '昭虽夺占卜碎片,但目的是输送给开明国,而非自立。' },
          { id: 'D', label: '神殿派系内斗', correct: false, comment: '凶手为外人,与神殿派系无涉。' }
        ]
      },
      {
        id: 'q3',
        title: '行凶手法为何?',
        options: [
          { id: 'A', label: '走主门,贿赂守卫', correct: false, comment: '守卫虽离岗,但凶手并未走门——证据是非连续水渍与油脂。' },
          { id: 'B', label: '翻越窗户(实际无窗)', correct: false, comment: '净室无窗,纯属推测。' },
          { id: 'C', label: '内鬼下毒,远程取命', correct: false, comment: '凶器为蜷蛇青铜短剑,致命伤为刺创,非毒杀。' },
          { id: 'D', label: '自东南角水道暗道潜入,以蜷蛇青铜短剑刺杀', correct: true, comment: '东南角水道终端石板下,凶手以油脂麻绳降下,持厉所赠短剑行凶,原路返回。' }
        ]
      },
      {
        id: 'q4',
        title: '本案与政变阴谋有何关联?',
        options: [
          { id: 'A', label: '与政变无关,系个人犯罪', correct: false, comment: '密信残片与勾连记奏疏皆指向政变阴谋。' },
          { id: 'B', label: '副祭司博官、将军厉与开明国合谋政变,昭为执行者', correct: true, comment: '博官、厉以神器换军援,昭奉命灭口,大祭司之死乃政变前奏。' },
          { id: 'C', label: '神殿长老与开明国合谋', correct: false, comment: '神殿长老乃任务发布者,一切线索都来自他的指引。' },
          { id: 'D', label: '昭一人单干,与他人无涉', correct: false, comment: '昭背后有博官与厉,凶器与情报皆由内部提供。' }
        ]
      }
    ]
  };

  // 渐进式攻略 —— 每阶段 2 层
  var walkthrough = {
    deduction: 25, // 每条提示扣 25 分
    stages: [
      {
        id: 1,
        name: '阶段一 · 祭祀现场',
        hints: [
          {
            id: 'w1_1',
            level: '具体建议',
            cost: 25,
            text:
              '净室门由内反闩,主门走不通。请仔细搜查净室东南角的地面与死者手中之物——古蜀祭坛常有暗道。同时不要忘记与守卫长"坚"对话时,使用一些钟楼相关的证据反问他。'
          },
          {
            id: 'w1_2',
            level: '直接揭示',
            cost: 25,
            text:
              '凶手是从东南角石板下的水道暗道潜入。守卫长"坚"在亥时三刻被一枚"厉"字玉佩贿赂离岗一炷香。请在阶段二的「议事厅」调取「钟楼夜班簿」,质疑坚使其招供。'
          }
        ]
      },
      {
        id: 2,
        name: '阶段二 · 宫廷暗流',
        hints: [
          {
            id: 'w2_1',
            level: '具体建议',
            cost: 25,
            text:
              '请同时关注两条线:厉将军的征南军令时间是否成立?昭府家训石碑的字句是否合古蜀语习?二人皆有伪装,需以实物戳穿。'
          },
          {
            id: 'w2_2',
            level: '直接揭示',
            cost: 25,
            text:
              '厉将军定制了凶器(朱龙坊兵器册),昭乃开明国间谍(舌音卷与开明家书可证)。先用兵器册质疑厉,再用舌音卷或家书质疑昭——他会承认全部罪行。'
          }
        ]
      },
      {
        id: 3,
        name: '阶段三 · 水道迷踪',
        hints: [
          {
            id: 'w3_1',
            level: '具体建议',
            cost: 25,
            text:
              '与水道老人"老川"详谈,他在亥时末见过身披绛袍的瘦高身影。地下密室内的麻绳、占卜碎片、密奏皆是结案铁证。'
          },
          {
            id: 'w3_2',
            level: '直接揭示',
            cost: 25,
            text:
              '档案卡答案 —— 凶手:昭(开明国间谍);动机:灭口大祭司,掩盖政变;手法:东南角水道潜入,以蜷蛇短剑刺杀;政变关联:博官、厉、开明国合谋,昭执行。'
          }
        ]
      }
    ]
  };

  // 智能推荐:基于已收集线索 + 已问过话题,给出建议关键词
  // 逻辑为:对每个角色,定义一系列推荐规则,按线索 / 已问情况触发
  var recommendations = {
    char_jian: [
      { topic: '岗位', cond: function () { return true; }, label: '问问他案发当夜的岗位' },
      { topic: '水道', cond: function (state) { return state.collected.indexOf('c04') >= 0; }, label: '提及"水道"试探一下' },
      { topic: '玉佩', cond: function (state) { return state.collected.indexOf('c10') >= 0; }, label: '问他"玉佩"是否收受过' },
      { topic: '净室', cond: function () { return true; }, label: '问他净室门窗的封闭情况' },
      { topic: '芸', cond: function () { return true; }, label: '问他对"芸"的看法' }
    ],
    char_yun: [
      { topic: '反常', cond: function () { return true; }, label: '问她大祭司"近日反常"的事' },
      { topic: '碎片', cond: function (state) { return state.collected.indexOf('c02') >= 0 || state.collected.indexOf('c06') >= 0; }, label: '问她"碎片"的下落' },
      { topic: '政变', cond: function () { return true; }, label: '问她是否听过"政变"传闻' },
      { topic: '昭', cond: function () { return true; }, label: '问她对"昭"的印象' },
      { topic: '厉', cond: function () { return true; }, label: '问她对"厉"的印象' },
      { topic: '水道', cond: function (state) { return state.collected.indexOf('c04') >= 0; }, label: '问她神殿底下的"水道"' }
    ],
    char_zhao: [
      { topic: '案发夜', cond: function () { return true; }, label: '问他案发当夜的"不在场"证明' },
      { topic: '家世', cond: function () { return true; }, label: '问他的"家世"出身' },
      { topic: '水道', cond: function () { return true; }, label: '聊聊"水道"看他反应' },
      { topic: '手', cond: function (state) { return state.collected.indexOf('c13') >= 0; }, label: '观察他的"手"' },
      { topic: '开明', cond: function (state) { return state.collected.indexOf('c14') >= 0 || state.collected.indexOf('c15') >= 0; }, label: '试探"开明"二字' },
      { topic: '碎片', cond: function () { return true; }, label: '问他对"神树碎片"的看法' }
    ],
    char_li: [
      { topic: '案发夜', cond: function () { return true; }, label: '问他案发当夜在何处' },
      { topic: '短剑', cond: function (state) { return state.collected.indexOf('c03') >= 0; }, label: '问他"蜷蛇短剑"' },
      { topic: '朱龙坊', cond: function (state) { return state.collected.indexOf('c03') >= 0; }, label: '问他与"朱龙坊"的关系' },
      { topic: '博官', cond: function () { return true; }, label: '问他与"博官"的往来' },
      { topic: '玉佩', cond: function (state) { return state.collected.indexOf('c08') >= 0; }, label: '问他"玉佩"赏赐之事' }
    ],
    char_laochuan: [
      { topic: '水道', cond: function () { return true; }, label: '问问"水道"的构造' },
      { topic: '案发', cond: function () { return true; }, label: '问他"案发"当夜所见' },
      { topic: '油脂', cond: function (state) { return state.collected.indexOf('c04') >= 0; }, label: '问他"油脂"在水道里的痕迹' },
      { topic: '开明', cond: function () { return true; }, label: '问他是否捡到过"开明"之物' },
      { topic: '昭', cond: function (state) { return state.collected.indexOf('c20') >= 0; }, label: '问他那夜见的人是否是"昭"' }
    ]
  };

  return {
    caseFile: caseFile,
    walkthrough: walkthrough,
    recommendations: recommendations
  };
})();
