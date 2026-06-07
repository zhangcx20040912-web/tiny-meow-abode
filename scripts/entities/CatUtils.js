/**
 * Cat 工具函数
 * 纯逻辑函数，不依赖全局变量
 */
import * as THREE from 'three';

/**
 * 创建方块猫（模型加载失败时的备用方案）
 * @param {number} color - 颜色值
 * @returns {THREE.Group} 方块猫模型
 */
export function createBlockCat(color) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: color });
    
    // 身体
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.6), material);
    body.position.y = 0.15;
    group.add(body);
    
    // 头
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.3), material);
    head.position.set(0, 0.4, 0.4);
    group.add(head);
    
    return group;
}

/**
 * 计算状态衰减
 * @param {Object} stats - 当前状态 { hunger, toilet }
 * @param {number} dt - 时间增量
 * @param {number} decayRate - 衰减速率
 * @returns {Object} 更新后的状态
 */
export function decayStats(stats, dt, decayRate = 0.5) {
    const newStats = {
        hunger: Math.max(0, stats.hunger - dt * decayRate),
        toilet: Math.max(0, stats.toilet - dt * decayRate)
    };
    return newStats;
}

/**
 * 计算路径方向和距离
 * @param {THREE.Vector3} currentPos - 当前位置
 * @param {THREE.Vector3} targetPos - 目标位置
 * @returns {Object} { direction, distance }
 */
export function calculatePathInfo(currentPos, targetPos) {
    const direction = new THREE.Vector3().subVectors(targetPos, currentPos);
    direction.y = 0;
    const distance = direction.length();
    direction.normalize();
    return { direction, distance };
}

/**
 * 计算跳跃位置（带抛物线）
 * @param {THREE.Vector3} start - 起始位置
 * @param {THREE.Vector3} end - 结束位置
 * @param {number} t - 进度 (0-1)
 * @param {number} jumpHeight - 跳跃高度
 * @returns {THREE.Vector3} 当前位置
 */
export function calculateJumpPosition(start, end, t, jumpHeight = 0.5) {
    const pos = new THREE.Vector3().lerpVectors(start, end, t);
    pos.y += Math.sin(t * Math.PI) * jumpHeight;
    return pos;
}

/**
 * 限制位置在房间范围内
 * @param {THREE.Vector3} pos - 位置
 * @param {number} minX - 最小X
 * @param {number} maxX - 最大X
 * @param {number} minZ - 最小Z
 * @param {number} maxZ - 最大Z
 * @returns {THREE.Vector3} 限制后的位置
 */
export function clampPositionToRoom(pos, minX = -4, maxX = 4, minZ = -4, maxZ = 4) {
    pos.x = Math.max(minX, Math.min(maxX, pos.x));
    pos.z = Math.max(minZ, Math.min(maxZ, pos.z));
    return pos;
}

/**
 * 生成随机闲逛目标位置
 * @param {THREE.Vector3} currentPos - 当前位置
 * @param {number} minDist - 最小距离
 * @param {number} maxDist - 最大距离
 * @returns {THREE.Vector3} 目标位置
 */
export function generateWanderTarget(currentPos, minDist = 1, maxDist = 4) {
    const angle = Math.random() * Math.PI * 2;
    const dist = minDist + Math.random() * (maxDist - minDist);
    
    const target = new THREE.Vector3(
        currentPos.x + Math.cos(angle) * dist,
        0,
        currentPos.z + Math.sin(angle) * dist
    );
    
    return clampPositionToRoom(target);
}
