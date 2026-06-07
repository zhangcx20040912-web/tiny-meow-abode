/**
 * Furniture - 家具类
 * 管理家具的状态和交互
 */
import * as THREE from 'three';
import { GameContext } from '../core/GameContext.js';

export class Furniture {
    /**
     * @param {Object} mesh - Three.js 网格对象
     * @param {Object} dbItem - 家具数据库配置
     * @param {Object} callbacks - 回调函数集合
     */
    constructor(mesh, dbItem, callbacks = {}) {
        this.mesh = mesh;
        this.dbItem = dbItem;
        this.mesh.userData.parentClass = this;
        this.callbacks = callbacks;

        this.functionalState = null;
        this.isBox = false;
        this.isTipped = false;
        this.boxHeight = 0;
        this.modelEmpty = null;
        this.modelFull = null;

        if (this.dbItem.type === 'functional') {
            this.initFunctionalState();
        }

        // 载具属性 - 三阶段扫地机器人 AI
        this.isVehicle = dbItem.isVehicle || false;

        // 基础运动状态
        this.isMoving = false;
        this.isTurning = false;
        this.targetRotation = 0;
        this.turnSpeed = 2.0; // 弧度/秒

        // 阶段状态机
        this.robotPhase = 'WALL_FOLLOW';  // 'WALL_FOLLOW' | 'ZIGZAG' | 'RESCUE' | 'IDLE'
        this.robotState = 'INIT';         // 当前子状态

        // 第一阶段：边缘巡航 (Wall Following)
        this.wallFollowStartPos = null;   // 起始位置
        this.wallFollowDistance = 0;      // 已行驶距离
        this.minLoopDistance = 8.0;       // 最小行驶距离才能判定闭环
        this.wallDetectDistance = 0.5;    // 墙体检测距离
        this.lastWallCheckRight = false;  // 上次右侧是否有墙

        // 第二阶段：Z字形填充 (Zigzag Filling)
        this.zigzagDirection = 1;         // 1=向东, -1=向西
        this.zigzagRow = 0;               // 当前扫描行
        this.brushWidth = 0.6;            // 刷头宽度（换行步长）
        this.zigzagStartPos = null;       // Z字形起始位置
        this.zigzagShiftStep = 0;         // 换行步骤计数 (0-3)
        this.zigzagShiftDistance = 0;     // 换行已移动距离

        // 救援模式：随机碰撞 (Random Bounce)
        this.stuckCounter = 0;            // 连续碰撞计数
        this.stuckThreshold = 5;          // 连续碰撞多少次视为卡住
        this.rescueDuration = 0;          // 救援模式持续时间
        this.rescueMaxDuration = 5.0;     // 最大救援时间（秒）
        this.successMoveFrames = 0;       // 连续成功移动帧数

        // 通用移动参数
        this.moveSpeed = dbItem.moveSpeed || 1.5;
        this.boundary = 4.3;              // 房间边界

        if (this.isVehicle && this.callbacks.logToScreen) {
            // this.callbacks.logToScreen(`Vehicle initialized: ${dbItem.id}`);
        }

        // [新增] 音频触发冷却 & 激活状态
        this.audioCooldownTimer = 0;
        this.isActivated = false; // 默认为未激活

        // [Debug] Check callbacks
        console.log(`[Furniture] ${dbItem.id} initialized. Audio: ${!!this.callbacks.audioManager}`);
    }

    initFunctionalState() {
        if (this.mesh.children.length > 0) {
            this.modelEmpty = this.mesh.children[0];
        }

        if (this.dbItem.fullModelFile && this.callbacks.prepareModel) {
            const fullItemConfig = {
                ...this.dbItem,
                id: this.dbItem.id + '_full',
                modelFile: this.dbItem.fullModelFile
            };
            const fullGroup = this.callbacks.prepareModel(fullItemConfig);
            if (fullGroup) {
                this.modelFull = fullGroup.children[0];
                this.mesh.add(this.modelFull);
            } else if (this.callbacks.logToScreen) {
                this.callbacks.logToScreen(`Warning: Full model missing: ${this.dbItem.fullModelFile}`, 'error');
            }
        }

        // 新购买的功能性家具初始状态：食物盆是空的，猫砂盆是干净的
        if (this.dbItem.subType === 'food') {
            this.functionalState = 'full';  // [修改] 新买的碗是满的 (用户体验优化)
        } else if (this.dbItem.subType === 'toilet') {
            this.functionalState = 'clean';  // 新买的猫砂盆是干净的
        }

        this.updateVisuals();
    }

    updateVisuals() {
        if (!this.modelEmpty) return;

        const setVis = (emptyVis, fullVis) => {
            this.modelEmpty.visible = emptyVis;
            if (this.modelFull) this.modelFull.visible = fullVis;
        };

        if (this.dbItem.subType === 'food') {
            this.functionalState === 'full' ? setVis(false, true) : setVis(true, false);
            // [新增] 空碗显示气泡
            if (this.functionalState === 'empty') this.showBubble('🥣');
            else this.hideBubble();

        } else if (this.dbItem.subType === 'toilet') {
            this.functionalState === 'clean' ? setVis(false, true) : setVis(true, false);
            // [新增] 脏猫砂盆显示气泡
            if (this.functionalState === 'dirty') this.showBubble('💩');
            else this.hideBubble();
        }
    }

    // [新增] 显示持久化气泡
    showBubble(emoji) {
        if (!this.bubbleElement) {
            this.bubbleElement = document.createElement('div');
            this.bubbleElement.className = 'furniture-bubble';
            document.body.appendChild(this.bubbleElement);
        }
        this.bubbleElement.innerText = emoji;
        this.bubbleElement.style.display = 'block';
        this.updateBubblePosition();
    }

    // [新增] 隐藏气泡
    hideBubble() {
        if (this.bubbleElement) {
            this.bubbleElement.style.display = 'none';
        }
    }

    // [新增] 更新气泡位置 (3D -> 2D)
    updateBubblePosition() {
        if (!this.mesh || !GameContext.camera) return;

        const pos = this.mesh.position.clone();
        pos.y += 0.5; // [修改] 降低高度 (从1.5改为0.5)，贴近物体

        // 投影到屏幕坐标
        pos.project(GameContext.camera);

        // 检查是否在相机视野后方 (NDZ z > 1)
        // 注意：OrthographicCamera 的 project 结果 z 在 -1 到 1 之间
        // 如果是 PerspectiveCamera，z > 1 说明在后面。
        // 但 OrthographicCamera 即使在后面 z 也可能在范围内？
        // 不，project() 会正确处理。
        // 关键是：如果 z > 1 或 z < -1 (视锥体外)，应该隐藏？
        // 这里简单判断 x, y 是否在屏幕内

        const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(pos.y * 0.5) + 0.5) * window.innerHeight;

        this.bubbleElement.style.left = x + 'px';
        this.bubbleElement.style.top = y + 'px';
    }

    interact() {
        // [新增] 盲盒开启逻辑
        if (this.dbItem.isBlindBox) {
            // 随机抽取
            const pool = this.dbItem.blindBoxPool || [];
            if (pool.length > 0) {
                const pickedId = pool[Math.floor(Math.random() * pool.length)];

                // 调用替换回调
                if (this.callbacks.replaceFurniture) {
                    this.callbacks.replaceFurniture(this.mesh, pickedId);

                    // 记录日记
                    if (this.callbacks.diaryManager) {
                        this.callbacks.diaryManager.logEvent('open_blind_box', {}, 80);
                    }
                    return true;
                }
            }
        }

        const needsRefill =
            (this.dbItem.subType === 'food' && this.functionalState === 'empty') ||
            (this.dbItem.subType === 'toilet' && this.functionalState === 'dirty');

        if (needsRefill && this.callbacks.showConfirmDialog) {
            const title = this.dbItem.subType === 'food' ? "补充猫粮?" : "清理猫砂?";
            this.callbacks.showConfirmDialog(title, "需要消耗 10 爱心", () => {
                this.confirmRefill();
            });
            return true;
        }

        // [新增] 玩具交互逻辑：点击激活 "等待猫咪" 状态
        if (this.dbItem.proximityAudio || this.dbItem.isToy) {
            if (!this.isActivated) {
                this.isActivated = true;
                // [修改] 移除了 playSfx 和 playBounce，因为 main.js 中的 onDown 已经处理了通用的玩具音效和动画
                // [修改] 返回 false 以允许 main.js 继续执行长按检测 (显示移动/删除菜单)

                console.log(`[Furniture] ${this.dbItem.name} 激活，等待猫咪触发...`);
                return false;
            } else {
                // 如果已经激活了，也返回 false 允许长按
                return false;
            }
        }

        return false;
    }

    confirmRefill() {
        const cb = this.callbacks;

        if (!cb.getHeartScore || cb.getHeartScore() < 10) {
            alert("爱心不足！");
            return;
        }

        if (cb.updateMoney) cb.updateMoney(-10);

        if (this.dbItem.subType === 'food') {
            this.functionalState = 'full';
            if (cb.showEmote) cb.showEmote(this.mesh.position, '🍚');
            if (cb.updateStatusText) cb.updateStatusText("猫粮已加满");
            if (cb.diaryManager) cb.diaryManager.logEvent('feed', {}, 50);
            if (cb.audioManager) cb.audioManager.playSfx('pour_food');
        } else {
            this.functionalState = 'clean';
            if (cb.showEmote) cb.showEmote(this.mesh.position, '✨');
            if (cb.updateStatusText) cb.updateStatusText("猫砂盆已清理");
            if (cb.diaryManager) cb.diaryManager.logEvent('clean', {}, 50);
            if (cb.audioManager) cb.audioManager.playSfx('scoop_sand');
        }

        this.updateVisuals();
        if (cb.saveGame) cb.saveGame();
    }

    useByCat() {
        if (this.dbItem.subType === 'food' && this.functionalState === 'full') {
            this.functionalState = 'empty';
            this.updateVisuals();
            if (this.callbacks.showEmote) this.callbacks.showEmote(this.mesh.position, '😋');
        } else if (this.dbItem.subType === 'toilet' && this.functionalState === 'clean') {
            this.functionalState = 'dirty';
            this.updateVisuals();
            if (this.callbacks.showEmote) this.callbacks.showEmote(this.mesh.position, '💩');
        }

        if (this.callbacks.saveGame) this.callbacks.saveGame();
    }

    // 更新逻辑 (每一帧调用)
    update(dt) {
        // [新增] 更新气泡位置 (如果有)
        if (this.bubbleElement && this.bubbleElement.style.display !== 'none') {
            this.updateBubblePosition();
        }

        // [新增] 接近触发音频逻辑
        if (this.dbItem.proximityAudio) {
            // [修改] 只有激活状态下才检查接近
            if (this.isActivated) {
                this.updateProximityAudio(dt);
            }
        }

        if (!this.isVehicle) return;

        // 根据当前阶段执行不同逻辑
        if (this.robotPhase === 'WALL_FOLLOW') {
            this.updateWallFollowPhase(dt);
        } else if (this.robotPhase === 'ZIGZAG') {
            this.updateZigzagPhase(dt);
        } else if (this.robotPhase === 'RESCUE') {
            this.updateRescueMode(dt);
        }

        // 更新骑乘者位置
        if (this.rider && this.rider.mesh) {
            const riderPos = this.mesh.position.clone();
            riderPos.y += 0.15;
            this.rider.mesh.position.copy(riderPos);
            this.rider.mesh.rotation.y = this.mesh.rotation.y + Math.PI;
        }
    }

    /**
     * [新增] 更新接近音频触发逻辑
     */
    updateProximityAudio(dt) {
        if (!GameContext.cats || GameContext.cats.length === 0) return;

        // 冷却时间处理
        if (this.audioCooldownTimer > 0) {
            this.audioCooldownTimer -= dt;
            // [Debug] 如果还在冷却中，偶尔打个日志
            // if (Math.random() < 0.01) console.log(`[Furniture Debug] Cooldown: ${this.audioCooldownTimer.toFixed(2)}`);
            return;
        }

        const cat = GameContext.cats[0];
        if (!cat || !cat.mesh) {
            console.warn('[Furniture Debug] Cat mesh missing!');
            return;
        }

        const dist = this.mesh.position.distanceTo(cat.mesh.position);

        // [Debug] 每1秒只打印一次
        if (!this._lastDebugTime || Date.now() - this._lastDebugTime > 1000) {
            this._lastDebugTime = Date.now();
            console.log(`[Furniture Debug] ${this.dbItem.name} dist: ${dist.toFixed(2)}, catPos: (${cat.mesh.position.x.toFixed(1)}, ${cat.mesh.position.z.toFixed(1)})`);
        }

        // 触发距离 1.5 米
        if (dist < 1.5) {
            // 播放音频
            if (this.callbacks.audioManager) {
                this.callbacks.audioManager.playSfx(this.dbItem.proximityAudio);
                console.log(`[Furniture] ${this.dbItem.name} 触发接近语音: ${this.dbItem.proximityAudio}`);
            }

            // [修改] 移除气泡显示 (用户要求只要声音)
            // this.showBubble("真棒！");
            // setTimeout(() => this.hideBubble(), 2000);

            // [新增] 触发后重置激活状态 (一次性触发)
            this.isActivated = false;
            console.log(`[Furniture] ${this.dbItem.name} 触发完毕，恢复待机状态`);

            // 触发猫咪反应 (看向)
            if (cat.reactToSound) {
                // 避免打断正在进行的交互
                if (cat.state === 'idle' || cat.state === 'walking') {
                    cat.mesh.lookAt(this.mesh.position.x, cat.mesh.position.y, this.mesh.position.z);
                    if (this.callbacks.showEmote) {
                        this.callbacks.showEmote(cat.mesh.position, '👂');
                    }
                }
            }

            // 重置冷却 (默认 15秒)
            this.audioCooldownTimer = this.dbItem.audioCooldown || 15;
        }
    }

    /**
     * 第一阶段：边缘巡航 (Wall Following)
     */
    updateWallFollowPhase(dt) {
        // 初始化阶段
        if (this.robotState === 'INIT') {
            this.wallFollowStartPos = this.mesh.position.clone();
            this.wallFollowDistance = 0;
            this.robotState = 'FINDING_WALL';
            this.isMoving = true;
            this.postTurnMoveDistance = 0; // 转向后移动距离
            this.justTurnedForWall = false; // 是否刚为找墙而转向
            console.debug('[Robot Phase 1] 开始边缘巡航，寻找墙壁...');
        }

        // 处理转向
        if (this.isTurning) {
            this.performTurning(dt);
            return;
        }

        // 寻找墙壁阶段
        if (this.robotState === 'FINDING_WALL') {
            const moveResult = this.tryMove(dt);
            if (!moveResult.success) {
                // 找到墙了，转向开始贴墙
                console.debug('[Robot Phase 1] 找到墙壁，开始贴墙行走');
                this.turnClockwise90(); // 右转90度
                this.robotState = 'FOLLOWING_WALL';
                this.lastWallCheckRight = true; // 刚从墙边开始，假设右边有墙
                this.postTurnMoveDistance = 0;
            }
            return;
        }

        // 贴墙行走阶段
        if (this.robotState === 'FOLLOWING_WALL') {
            const hasFrontObstacle = this.checkFrontObstacle();

            // 前方有墙，左转90度继续贴墙
            if (hasFrontObstacle) {
                console.log('[Robot Phase 1] 前方碰墙，左转90度');
                this.turnCounterClockwise90();
                this.postTurnMoveDistance = 0;
                this.justTurnedForWall = false;
                return;
            }

            // 先尝试移动
            const moveResult = this.tryMove(dt);

            if (moveResult.success) {
                this.wallFollowDistance += moveResult.distance;
                this.postTurnMoveDistance += moveResult.distance;

                // 只有走了一段距离后才检测右侧墙
                if (this.postTurnMoveDistance > 0.3) {
                    const hasRightWall = this.checkRightWall();

                    // 右侧墙消失了，右转试图找回墙
                    if (!hasRightWall && this.lastWallCheckRight && !this.justTurnedForWall) {
                        console.log('[Robot Phase 1] 右侧墙消失，右转找墙');
                        this.turnClockwise90();
                        this.postTurnMoveDistance = 0;
                        this.justTurnedForWall = true; // 标记刚为找墙而转向
                        return;
                    }

                    // 如果刚为找墙转向后，现在又检测到墙了，重置标记
                    if (hasRightWall) {
                        this.justTurnedForWall = false;
                    }

                    this.lastWallCheckRight = hasRightWall;
                }

                // 检测是否完成闭环
                if (this.wallFollowDistance > this.minLoopDistance) {
                    const distToStart = this.mesh.position.distanceTo(this.wallFollowStartPos);
                    if (distToStart < 0.8) {
                        console.log('[Robot Phase 1] 闭环完成！切换到Z字形填充阶段');
                        this.switchToZigzagPhase();
                    }
                }
            } else {
                // 移动失败（碰到障碍），左转避开
                console.log('[Robot Phase 1] 移动受阻，左转避开');
                this.turnCounterClockwise90();
                this.postTurnMoveDistance = 0;
            }
        }
    }

    /**
     * 第二阶段：Z字形填充 (Zigzag Filling)
     */
    updateZigzagPhase(dt) {
        // 初始化阶段
        if (this.robotState === 'INIT') {
            // 移动到角落位置（简化：直接开始Z字形）
            this.zigzagStartPos = this.mesh.position.clone();
            this.zigzagDirection = 1; // 向东
            this.zigzagRow = 0;
            this.mesh.rotation.y = 0; // 朝向东
            this.robotState = 'ZIGZAG_HORIZONTAL';
            this.isMoving = true;
            console.log('[Robot Phase 2] 开始Z字形填充...');
        }

        // 处理转向
        if (this.isTurning) {
            this.performTurning(dt);
            return;
        }

        // 横向扫描
        if (this.robotState === 'ZIGZAG_HORIZONTAL') {
            const moveResult = this.tryMove(dt);

            if (!moveResult.success) {
                // 碰到边界或障碍，开始换行
                console.log(`[Robot Phase 2] 第${this.zigzagRow}行扫描完成，准备换行`);
                this.robotState = 'ZIGZAG_SHIFTING';
                this.zigzagShiftStep = 0;
                this.zigzagShiftDistance = 0;
                this.startZigzagShift();
            } else {
                // 成功移动，重置卡住计数
                this.stuckCounter = Math.max(0, this.stuckCounter - 0.1);
            }
        }

        // 换行过程
        if (this.robotState === 'ZIGZAG_SHIFTING') {
            if (this.zigzagShiftStep === 1) {
                // 步骤1：前进刷头宽度
                const moveResult = this.tryMove(dt, this.brushWidth - this.zigzagShiftDistance);
                this.zigzagShiftDistance += moveResult.distance;

                if (this.zigzagShiftDistance >= this.brushWidth - 0.05 || !moveResult.success) {
                    // 完成前进或碰到障碍
                    if (!moveResult.success && this.zigzagShiftDistance < this.brushWidth * 0.3) {
                        // 刚开始就碰到了，说明无法继续换行，清扫完成
                        console.log('[Robot Phase 2] 无法继续换行，Z字形填充完成！');
                        this.switchToIdlePhase();
                        return;
                    }
                    this.zigzagShiftStep = 2;
                    this.startZigzagShift();
                }
            }
        }
    }

    /**
     * 救援模式：随机碰撞 (Random Bounce)
     */
    updateRescueMode(dt) {
        if (this.robotState === 'INIT') {
            this.rescueDuration = 0;
            this.successMoveFrames = 0;
            this.robotState = 'RANDOM_BOUNCE';
            // 随机选择一个方向
            this.mesh.rotation.y = Math.random() * Math.PI * 2;
            this.isMoving = true;
            console.log('[Robot RESCUE] 进入救援模式，随机移动脱困...');
        }

        // 处理转向
        if (this.isTurning) {
            this.performTurning(dt);
            return;
        }

        this.rescueDuration += dt;

        const moveResult = this.tryMove(dt);

        if (moveResult.success) {
            this.successMoveFrames++;
            // 连续成功移动足够长，说明脱困了
            if (this.successMoveFrames > 30) {
                console.log('[Robot RESCUE] 脱困成功！返回边缘巡航模式');
                this.switchToWallFollowPhase();
                return;
            }
        } else {
            // 碰到障碍，随机转向
            this.successMoveFrames = 0;
            this.mesh.rotation.y = Math.random() * Math.PI * 2;
        }

        // 超时退出
        if (this.rescueDuration > this.rescueMaxDuration) {
            console.log('[Robot RESCUE] 救援超时，返回边缘巡航模式');
            this.switchToWallFollowPhase();
        }
    }

    /**
     * 尝试移动
     * @param {number} dt Delta time
     * @param {number} maxDistance 最大移动距离（可选）
     * @returns {Object} { success: boolean, distance: number }
     */
    tryMove(dt, maxDistance = null) {
        const moveStep = this.moveSpeed * dt;
        const actualStep = maxDistance !== null ? Math.min(moveStep, maxDistance) : moveStep;

        const dir = new THREE.Vector3(0, 0, 1)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

        const currentPos = this.mesh.position;
        const nextPos = currentPos.clone().add(dir.clone().multiplyScalar(actualStep));

        // 边界检查
        if (Math.abs(nextPos.x) > this.boundary || Math.abs(nextPos.z) > this.boundary) {
            this.stuckCounter++;
            this.checkIfStuck();
            return { success: false, distance: 0 };
        }

        // 碰撞检查
        const lookAheadDist = 0.4;
        const predictedPos = currentPos.clone().add(dir.clone().multiplyScalar(actualStep + lookAheadDist));

        if (this.hasObstacleAt(predictedPos)) {
            this.stuckCounter++;
            this.checkIfStuck();
            return { success: false, distance: 0 };
        }

        // 移动成功
        this.mesh.position.copy(nextPos);
        return { success: true, distance: actualStep };
    }

    /**
     * 执行转向动作
     */
    performTurning(dt) {
        let diff = this.targetRotation - this.mesh.rotation.y;

        // 规范化角度差到 [-PI, PI]
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) < 0.05) {
            // 转向完成
            this.mesh.rotation.y = this.targetRotation;
            this.normalizeRotation();
            this.isTurning = false;
            this.isMoving = true;
        } else {
            // 插值旋转
            const step = this.turnSpeed * dt;
            if (diff > 0) this.mesh.rotation.y += Math.min(diff, step);
            else this.mesh.rotation.y -= Math.min(-diff, step);
        }
    }

    /**
     * 规范化角度到 [-PI, PI]
     */
    normalizeRotation() {
        while (this.mesh.rotation.y > Math.PI) this.mesh.rotation.y -= Math.PI * 2;
        while (this.mesh.rotation.y < -Math.PI) this.mesh.rotation.y += Math.PI * 2;
    }

    /**
     * 检测右侧是否有墙
     */
    checkRightWall() {
        const rightDir = new THREE.Vector3(1, 0, 0)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

        const checkPos = this.mesh.position.clone()
            .add(rightDir.multiplyScalar(this.wallDetectDistance));

        return this.hasObstacleAt(checkPos) || this.isNearBoundary(checkPos, 0.3);
    }

    /**
     * 检测前方是否有障碍
     */
    checkFrontObstacle() {
        const frontDir = new THREE.Vector3(0, 0, 1)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

        const checkPos = this.mesh.position.clone()
            .add(frontDir.multiplyScalar(this.wallDetectDistance));

        return this.hasObstacleAt(checkPos) || this.isNearBoundary(checkPos, 0.2);
    }

    /**
     * 检测指定位置是否有障碍物
     */
    hasObstacleAt(position) {
        if (!GameContext.placedFurniture) return false;

        const robotRadius = 0.35;

        for (const otherMesh of GameContext.placedFurniture) {
            if (otherMesh === this.mesh) continue;
            if (!otherMesh.userData || !otherMesh.userData.parentClass) continue;

            const dbItem = otherMesh.userData.parentClass.dbItem;
            if (!dbItem) continue;
            if (dbItem.layer === 0) continue; // 忽略地板
            if (dbItem.type === 'wall') continue; // 忽略墙面装饰
            if (dbItem.layer === 2) continue; // 忽略小物件
            if (dbItem.isVehicle) continue; // 忽略其他载具

            const otherBox = new THREE.Box3().setFromObject(otherMesh);
            otherBox.expandByScalar(robotRadius);

            if (otherBox.containsPoint(position)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检测是否接近边界
     */
    isNearBoundary(position, threshold = 0.2) {
        return Math.abs(position.x) > this.boundary - threshold ||
            Math.abs(position.z) > this.boundary - threshold;
    }

    /**
     * 顺时针转90度（右转）
     */
    turnClockwise90() {
        this.isMoving = false;
        this.isTurning = true;
        this.targetRotation = this.mesh.rotation.y - Math.PI / 2;
    }

    /**
     * 逆时针转90度（左转）
     */
    turnCounterClockwise90() {
        this.isMoving = false;
        this.isTurning = true;
        this.targetRotation = this.mesh.rotation.y + Math.PI / 2;
    }

    /**
     * 检测是否卡住，触发救援模式
     */
    checkIfStuck() {
        if (this.stuckCounter > this.stuckThreshold) {
            console.log('[Robot] 检测到卡住，切换到救援模式！');
            this.switchToRescueMode();
        }
    }

    /**
     * 开始Z字形换行
     */
    startZigzagShift() {
        if (this.zigzagShiftStep === 0) {
            // 步骤0：第一次转向
            if (this.zigzagDirection === 1) {
                // 刚才向东，右转
                this.turnClockwise90();
            } else {
                // 刚才向西，左转
                this.turnCounterClockwise90();
            }
            this.zigzagShiftStep = 1;
        } else if (this.zigzagShiftStep === 2) {
            // 步骤2：第二次转向
            if (this.zigzagDirection === 1) {
                // 右转（现在朝西）
                this.turnClockwise90();
            } else {
                // 左转（现在朝东）
                this.turnCounterClockwise90();
            }
            this.zigzagShiftStep = 3;
            // 换向
            this.zigzagDirection *= -1;
            this.zigzagRow++;
            this.robotState = 'ZIGZAG_HORIZONTAL';
            console.log(`[Robot Phase 2] 开始第${this.zigzagRow}行扫描`);
        }
    }

    /**
     * 切换到Z字形填充阶段
     */
    switchToZigzagPhase() {
        this.robotPhase = 'ZIGZAG';
        this.robotState = 'INIT';
        this.stuckCounter = 0;
    }

    /**
     * 切换到救援模式
     */
    switchToRescueMode() {
        this.robotPhase = 'RESCUE';
        this.robotState = 'INIT';
        this.stuckCounter = 0;
    }

    /**
     * 切换到边缘巡航阶段
     */
    switchToWallFollowPhase() {
        this.robotPhase = 'WALL_FOLLOW';
        this.robotState = 'INIT';
        this.stuckCounter = 0;
    }

    /**
     * 切换到待机阶段
     */
    switchToIdlePhase() {
        this.robotPhase = 'IDLE';
        this.robotState = 'IDLE';
        this.isMoving = false;
        console.log('[Robot] 清扫完成，进入待机模式');

        // 循环：重新开始边缘巡航
        setTimeout(() => {
            this.switchToWallFollowPhase();
        }, 3000);
    }

    /**
     * 旧方法兼容性（用于其他系统调用）
     */
    turnRandomly() {
        // 随机转向
        this.mesh.rotation.y = Math.random() * Math.PI * 2;
    }
}
