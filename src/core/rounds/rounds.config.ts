// 轮次/小波配置
// 所有发兵相关参数集中于此，不得散落在发兵逻辑中。
// 追加轮次只需向 ROUNDS 数组末尾追加，胜利结算自动移动到最后一个已配置轮次之后。

export type EnemyType = 'infantry' | 'archer' | 'spearman'

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

const SPAWN_INTERVAL = 0.5
const WAVE_GAP = 3

export const ROUNDS: RoundConfig[] = [
  // ── 第一轮 ──
  {
    intro: {
      title: 'THE GREEKS ARRIVE',
      body: 'The Greek army has reached Troy and begun its first advance toward the wall.',
      tip: 'Open the shop to view available defenders. Preparation gold can be used to recruit them after this round.',
    },
    waves: [
      { enemies: [{ type: 'infantry', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'infantry', count: 4 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'infantry', count: 6 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'THE LINE HOLDS',
      body: 'The war has only begun. The wall still stands, but the size of the enemy force proves this will not be a short conflict.',
    },
    gold: 100,
  },

  // ── 第二轮 ──
  {
    intro: {
      title: 'ARROWS FROM AFAR',
      body: 'The enemy has begun attacking Troy\'s defenders from a distance.',
      tip: 'Drag a deployed defender back to the barracks to recover health over time.',
    },
    waves: [
      { enemies: [{ type: 'infantry', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'infantry', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 4 }], spawnInterval: SPAWN_INTERVAL },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'NO PLACE IS SAFE',
      body: 'The wall is no longer the only thing under threat. Troy\'s defenders can also be worn down.',
    },
    gold: 200,
  },

  // ── 第三轮 ──
  {
    intro: {
      title: 'A MIXED ASSAULT',
      body: 'A mixed enemy force is advancing against both the defenders and the wall.',
      tip: 'Drag deployed defenders between wall positions to rearrange the defense.',
    },
    waves: [
      { enemies: [{ type: 'infantry', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'archer', count: 2 }], spawnInterval: SPAWN_INTERVAL },
      { enemies: [{ type: 'spearman', count: 3 }], spawnInterval: SPAWN_INTERVAL },
      {
        enemies: [
          { type: 'infantry', count: 2 },
          { type: 'spearman', count: 2 },
          { type: 'archer', count: 2 },
        ],
        spawnInterval: SPAWN_INTERVAL,
      },
    ],
    waveGap: WAVE_GAP,
    ending: {
      title: 'DIVIDED PRESSURE',
      body: 'The attack is no longer simple. Protecting one part of the defense may leave another exposed.',
    },
    gold: 300,
  },
]
