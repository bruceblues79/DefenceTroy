import { relation } from 'koota'

/**
 * 目标指向关系（互斥：一个实体只能有一个目标）
 * 用法：entity.add(Targeting(targetEntity))
 */
export const Targeting = relation({ exclusive: true })
