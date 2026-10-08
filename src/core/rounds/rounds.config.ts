// 轮次/小波配置
// 所有发兵相关参数集中于此，不得散落在发兵逻辑中。
// 追加轮次只需向 ROUNDS 数组末尾追加，胜利结算自动移动到最后一个已配置轮次之后。

// sapper 攻城兵（干扰/送钱） / archer 弩兵（标准体） / pikeman 长枪兵（速度 2×，抗弓箭） / ram 攻城车（厚血百分比砸墙） / prayer 祷言师（吟唱给己方攻速 buff）
export type EnemyType = 'sapper' | 'archer' | 'pikeman' | 'ram' | 'prayer'

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
const WAVE_GAP = 7.5

export const ROUNDS: RoundConfig[] = [
  // ── 第一轮 ──
  {
    intro: {
      title: 'Greek Alliance Landing',
      body: 'The Greek Alliance lands on the coast, launching a probing attack. Defend the walls!',
      tip: 'Drag the aim button onto an enemy unit to focus fire within defender range; or drag a wall defender onto a target to switch attack targets if in range.',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 1 Repelled',
      body: 'The walls face no major threat yet, but this war is bound to be long!',
      tip: 'Victory bonus: 100g. Drag units to reposition on the wall, or swap positions with each other.',
    },
    gold: 100,
  },

  // ── 第二轮 ──
  {
    intro: {
      title: 'Archer Harassment',
      body: 'The Greek Alliance sends a mixed force of infantry and archers. Prioritize enemy archers!',
      tip: 'You have earned income. Click the cart icon to hire units. Hired units go to the barracks; drag them onto the wall to deploy.',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 2 Repelled',
      body: 'Wall pressure is light, but our defenders are taking casualties!',
      tip: 'Victory bonus: 200g. Drag units off the wall to return to barracks and slowly recover HP.',
    },
    gold: 200,
  },

  // ── 第三轮 ──
  {
    intro: {
      title: 'Pikeman Assault',
      body: 'The Greek Alliance musters fast pikemen, a grave threat to our archers!',
      tip: 'Pikeman counters are effective against pikemen. Hire and drag from barracks to the wall; you can deploy on existing unit slots, and the replaced unit returns to barracks.',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 3 Repelled',
      body: 'The walls still hold, but the enemy is employing varied tactics to pressure us!',
      tip: 'Victory bonus: 200g. Master defender rotation and positioning to maintain defensive rhythm.',
    },
    gold: 200,
  },

  // ── 第四轮 ──
  {
    intro: {
      title: 'Alliance Mixed Phalanx',
      body: 'The enemy mixed phalanx approaches; they have grown familiar with our defenses.',
      tip: 'Pikeman counters have strong defense and can briefly withstand assaults. Rotate and move defenders to redirect enemy targets.',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 4 Repelled',
      body: 'The enemy is not aiming to breach the walls now, seeking to wear down our forces.',
      tip: 'Victory bonus: 200g. Master defender rotation and positioning to maintain defensive rhythm.',
    },
    gold: 200,
  },

  // ── 第五轮 ──
  {
    intro: {
      title: 'Shadow of the Battering Ram',
      body: 'Amid the mixed phalanx, the battering ram is heavily armored and poses a grave threat to the walls.',
      tip: 'Focus fire on the ram with spearmen for maximum damage. Archers deal half damage to rams. Reposition defenders flexibly to destroy the ram first.',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'ram', count: 1 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 2 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 5 Repelled',
      body: 'The enemy has launched a multi-dimensional offensive.',
      tip: 'Victory bonus: 200g. Flexibly switch targets and our units.',
    },
    gold: 200,
  },

  // ── 第六轮 ──
  {
    intro: {
      title: 'The Annoying Prayer',
      body: 'Unable to break through, the enemy deploys a surprise unit: the Prayer. They do not deal direct damage, but are hard to kill.',
      tip: 'Units buffed by the Prayer are highly threatening — it enhances both offense and defense. Coordinate your forces to focus fire on the Prayer.',
    },
    waves: [
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'prayer', count: 1 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'ram', count: 1 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 6 Repelled',
      body: 'The enemy\'s tactics have grown more sophisticated.',
      tip: 'Victory bonus: 200g. Choose focus-fire targets wisely and replenish your forces.',
    },
    gold: 200,
  },
]

// ── 测试关卡配置（agent 按用户要求修改）──
// 起始轮次：0 = 正常游戏（从第一轮开始），-1 = 测试关卡（仅单轮 + 足额金币）
export const START_ROUND: number = 0

// 测试关卡起始金币
export const TEST_GOLD = 999999

// 测试关卡发兵小波：3 步兵 + 1 祷言 + 3 弓兵（验祷言师 buff 流程）
export const TEST_WAVE: WaveEnemy[] = [
  { type: 'sapper', count: 3 },
  { type: 'prayer', count: 1 },
  { type: 'archer', count: 3 },
]

/** 构建测试轮：单小波，intro/ending 标注 Test Round，整备金 0 */
export function buildTestRound(wave: WaveEnemy[]): RoundConfig {
  return {
    intro: {
      title: 'Test Round',
      body: 'Unit testing ground. Gold is abundant; configure the wave in rounds.config.ts.',
      tip: 'Modify TEST_WAVE in src/core/rounds/rounds.config.ts to change enemies.',
    },
    waves: [{ enemies: wave, spawnInterval: SPAWN_INTERVAL }],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Test Round Cleared',
      body: 'Wave eliminated. Adjust TEST_WAVE and redeploy to test other units.',
    },
    gold: 0,
  }
}
