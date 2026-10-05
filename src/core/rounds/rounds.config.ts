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
      { enemies: [{ type: 'archer', count: 4 }], spawnInterval: SPAWN_INTERVAL },
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
      { enemies: [{ type: 'pikeman', count: 4 }], spawnInterval: SPAWN_INTERVAL },
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
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 4 }], spawnInterval: SPAWN_INTERVAL },
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
      { enemies: [{ type: 'ram', count: 1 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'sapper', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'pikeman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'Round 5 Repelled',
      body: 'The enemy has launched a multi-dimensional offensive.',
      tip: 'Victory bonus: 200g. Flexibly switch targets and our units.',
    },
    gold: 200,
  },
]
