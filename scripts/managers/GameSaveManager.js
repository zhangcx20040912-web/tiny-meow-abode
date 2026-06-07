/**
 * GameSaveManager - 游戏存档管理器
 * 负责保存和加载游戏进度
 */

export class GameSaveManager {
    /**
     * @param {Function} getGameData - 获取游戏数据的回调，返回 { cats, heartScore, activeDecorId, placedFurniture, unrestoredFurniture }
     * @param {Function} restoreCallbacks - 恢复数据的回调对象 { setHeartScore, setActiveDecor, applyDecorVisuals, FURNITURE_DB }
     */
    constructor(getGameData, restoreCallbacks) {
        this.saveKey = 'cat_game_save_v1';
        this.getGameData = getGameData;
        this.restoreCallbacks = restoreCallbacks;

        // 自动保存间隔 (30秒)
        setInterval(() => this.saveGame(), 30000);
    }

    // 收集当前游戏数据并保存
    saveGame() {
        const data = this.getGameData();
        if (!data.cats || !data.cats[0]) return; // 还没初始化好

        // [Fix] Prevent saving while restoration is in progress to avoid data loss
        if (data.isRestoring) {
            console.warn("[Save] Skipped: Restoration in progress...");
            return;
        }

        const saveData = {
            // 1. 基础数据
            heartScore: data.heartScore,
            activeDecor: data.activeDecorId, // 装修状态

            // 2. 猫咪状态 (只存一只)
            catStats: {
                hunger: data.cats[0].stats.hunger,
                toilet: data.cats[0].stats.toilet,
                angryTime: data.cats[0].angryTime || 0 // [新增] 保存生气时间
            },

            // 3. 家具列表
            furniture: data.placedFurniture.map(f => {
                const p = f.userData.parentClass;
                return {
                    id: p.dbItem.id, // 核心ID
                    pos: { x: f.position.x, y: f.position.y, z: f.position.z },
                    rot: { x: f.rotation.x, y: f.rotation.y, z: f.rotation.z },
                    funcState: p.functionalState,
                    isBox: p.isBox,
                    isTipped: p.isTipped,
                    boxHeight: p.boxHeight
                };
                // [修复] 合并未能恢复的家具原始数据，防止跨设备存档丢失
            }).concat(data.unrestoredFurniture || [])
        };

        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
        console.log("Game Saved:", saveData);
    }

    // 读取并恢复游戏
    loadGame() {
        const json = localStorage.getItem(this.saveKey);
        if (!json) return false; // 没有存档

        try {
            const data = JSON.parse(json);
            const cb = this.restoreCallbacks;

            // 1. 恢复金钱
            if (data.heartScore !== undefined && cb.setHeartScore) {
                cb.setHeartScore(data.heartScore);
            }

            // 2. 恢复装修 (地板/墙壁)
            if (data.activeDecor && cb.setActiveDecor) {
                cb.setActiveDecor(data.activeDecor);
                if (data.activeDecor.floor) {
                    const item = cb.FURNITURE_DB.find(i => i.id === data.activeDecor.floor);
                    if (item && cb.applyDecorVisuals) cb.applyDecorVisuals(item);
                }
                if (data.activeDecor.wall) {
                    const item = cb.FURNITURE_DB.find(i => i.id === data.activeDecor.wall);
                    if (item && cb.applyDecorVisuals) cb.applyDecorVisuals(item);
                }
            }

            // 3. 返回数据供外部恢复猫咪状态和家具
            return data;

        } catch (e) {
            console.error("Save file corrupted", e);
            return false;
        }
    }

    // [新增] 导出存档为 JSON 字符串（含日记数据）
    exportSave() {
        const gameSave = localStorage.getItem(this.saveKey) || '{}';
        const diarySave = localStorage.getItem('cat_game_diary_v1') || '{}';
        const dailyRewardDate = localStorage.getItem('daily_reward_date') || '';
        const lastLoginTime = localStorage.getItem('last_login_time') || '';

        const fullSave = {
            game: JSON.parse(gameSave),
            diary: JSON.parse(diarySave),
            dailyRewardDate: dailyRewardDate,
            lastLoginTime: lastLoginTime
        };
        return JSON.stringify(fullSave);
    }

    // [新增] 从 JSON 字符串导入存档（含日记数据）
    importSave(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);

            // [新增] 检测 debug 模式标记
            if (parsed.debug === true) {
                localStorage.setItem('cat_game_debug_restore', 'true');
                console.log('[Import] 检测到 debug 标记，将进入逐步恢复模式');
            } else {
                localStorage.removeItem('cat_game_debug_restore');
            }

            // 兼容新格式（含 diary）和旧格式（仅 game）
            if (parsed.game && typeof parsed.game === 'object') {
                // 新格式：包含 game + diary
                localStorage.setItem(this.saveKey, JSON.stringify(parsed.game));

                if (parsed.diary && typeof parsed.diary === 'object') {
                    localStorage.setItem('cat_game_diary_v1', JSON.stringify(parsed.diary));
                    console.log('[Import] 日记数据已恢复');
                }
                if (parsed.dailyRewardDate) {
                    localStorage.setItem('daily_reward_date', parsed.dailyRewardDate);
                }
                if (parsed.lastLoginTime) {
                    localStorage.setItem('last_login_time', parsed.lastLoginTime);
                }
            } else {
                // 旧格式：整个 JSON 就是 game save
                localStorage.setItem(this.saveKey, jsonString);
            }
            return true;
        } catch (e) {
            console.error("Invalid save data", e);
            return false;
        }
    }
}
