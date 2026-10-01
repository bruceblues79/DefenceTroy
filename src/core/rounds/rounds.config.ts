// 轮次/小波配置
// 所有发兵相关参数集中于此，不得散落在发兵逻辑中。
// 追加轮次只需向 ROUNDS 数组末尾追加，胜利结算自动移动到最后一个已配置轮次之后。

// sapper 攻城兵（干扰/送钱） / archer 弩兵（标准体） / pikeman 长枪兵（速度 2×，抗弓箭） / ram 攻城车（厚血百分比砸墙）
export type EnemyType = 'sapper' | 'archer' | 'pikeman' | 'ram'

export interface WaveEnemy {
  type: EnemyType
  count: number
}

export interface WaveConfig {
  enemies: WaveEnemy[]
  /** 单位生成间隔（秒） */
  spawnInterval: number
}

export interface RoundPrompt {
  title: string
  body: string
  /** 操作提示（仅开场有） */
  tip?: string
}

export interface RoundConfig {
  intro: RoundPrompt
  waves: WaveConfig[]
  /** 小波之间的等待时间（秒） */
  waveGap: number
  ending: RoundPrompt
  /** 整备金奖励 */
  gold: number
}

const SPAWN_INTERVAL = 1
const WAVE_GAP = 5

export const ROUNDS: RoundConfig[] = [
  // ── 第一轮 ──
  {
    intro: {
      title: '希腊联军登陆',
      body: '希腊联军登陆海岸，发起试探性进攻。保卫城墙！',
      tip: '点击拖动瞄准按钮至敌方单位，在守军攻击范围内即可集火；也可拖动城墙上守军至目标，满足距离则切换攻击目标。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退第一轮',
      body: '城墙暂无重大威胁，但这场战争注定漫长！',
      tip: '获胜奖金100g。拖动单位可调整城墙站位，也可互相交换位置。',
    },
    gold: 100,
  },

  // ── 第二轮 ──
  {
    intro: {
      title: '弓兵侵扰',
      body: '希腊联军派出步兵与弓兵混合部队，优先击杀敌方弓兵！',
      tip: '你已获得收入，点击购物车图标，选择兵种雇佣。雇佣单位存入兵种栏，点击拖动至城墙完成部署。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 4 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退第2轮',
      body: '城墙压力不大，但我方守军开始出现伤亡！',
      tip: '获胜奖金200g。将城墙单位拖下城墙，可返回兵营缓慢恢复生命。',
    },
    gold: 200,
  },

  // ── 第三轮 ──
  {
    intro: {
      title: '长矛兵强袭',
      body: '希腊联军集结高速长矛兵，对我方弓兵威胁极大！',
      tip: '破矛兵可有效克制长矛兵。雇佣后从兵营拖至城墙，可部署在原有单位位置；被替换单位自动返回兵营待命。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 4 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退第3轮',
      body: '城墙尚且稳固，敌军已开始使用多样战术向我方施压！',
      tip: '获胜奖金200g。灵活掌握守军轮换与位置调整，稳住防守节奏。',
    },
    gold: 200,
  },

  // ── 第四轮 ──
  {
    intro: {
      title: '联军混合方阵进攻',
      body: '敌军混合方阵逼近，对方已经熟悉我方防守配置。',
      tip: '破矛兵防御出众，可短暂承受攻势。灵活轮换、移动守军，能够改变敌方攻击目标。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退第4轮',
      body: '敌军现阶段不以破城为目标，意图持续消耗我方兵力。',
      tip: '获胜奖金200g。熟练掌握守军轮换与位置调整，稳住防守节奏。',
    },
    gold: 200,
  },

  // ── 第五轮 ──
  {
    intro: {
      title: '攻城车阴影',
      body: '在混合方阵中，攻城车非常结实，会对城墙造成极大威胁。',
      tip: '用矛兵集火攻城车，造成最大伤害。弓兵对攻城车伤害减半。灵活地更换守军位置，优先击破攻城车。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'ram', count: 1 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退第5轮',
      body: '敌军对我方展开了立体攻势。',
      tip: '获胜奖金200g。灵活地切换目标与我方单位。',
    },
    gold: 200,
  },
]
