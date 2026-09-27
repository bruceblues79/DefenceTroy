// 轮次/小波配置
// 所有发兵相关参数集中于此，不得散落在发兵逻辑中。
// 追加轮次只需向 ROUNDS 数组末尾追加，胜利结算自动移动到最后一个已配置轮次之后。

// sapper 攻城兵（干扰/送钱） / archer 弓兵（标准体） / pikeman 长枪兵（速度 2×，抗弓箭）
export type EnemyType = 'sapper' | 'archer' | 'pikeman'

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
      body: '希腊联军登陆了海岸，开始了试探性攻击。来，保卫我们的城墙！',
      tip: '点击并拖动瞄准按钮到进攻单位，符合攻击距离的守军单位会集火攻击。也可以点击并拖动城墙上的防守单位到目标，符合攻击距离的话，会切换目标。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 5 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退了第一轮',
      body: '城墙并没有什么实质性危险，但看起来这将是持久战！',
      tip: '获胜奖金100g',
    },
    gold: 100,
  },

  // ── 第二轮 ──
  {
    intro: {
      title: '弓兵的侵扰',
      body: '希腊联军开始用步兵与弓兵的混合了，优先考虑击杀弓兵！',
      tip: '你现在有一定收入，点击购物车图标，可以点击兵种按钮雇佣更多单位，他们将出现在兵种按钮里，点击并拖动到城墙部署。',
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
      title: '击退了第2轮',
      body: '城墙没有太大压力，但我方部队开始损失了！',
      tip: '获胜奖金200g，把城墙单位拖下来，可收入兵营，缓缓回血。',
    },
    gold: 200,
  },

  // ── 第三轮 ──
  {
    intro: {
      title: '长矛兵的强袭',
      body: '希腊联军集结了快速长矛兵，他们对我方弓兵是巨大的威胁！',
      tip: '我方的长矛盾骑士是克制他们的好单位，雇佣他们，从兵营按钮拖上城墙，替换或者站到防守单位上，被替换的目标会自动返回兵营，等待再次部署。',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: '击退了第3轮',
      body: '城墙尚可，但我方部队已经开始遭受不同战术的挑战！',
      tip: '获胜奖金300g，灵活的拖动单位，集火，将减轻你的压力。',
    },
    gold: 300,
  },
]
