/**
 * GameContext - 游戏全局上下文
 * 集中管理所有共享依赖，供模块化组件使用
 */

export const GameContext = {
    // === Three.js 核心对象 ===
    scene: null,
    camera: null,
    renderer: null,
    floorPlane: null,

    // === 游戏数据 ===
    loadedModels: null,
    placedFurniture: null,  // 引用数组
    cats: null,             // 引用数组

    // === 游戏状态 ===
    get visualHour() { return this._visualHour; },
    set visualHour(val) { this._visualHour = val; },
    _visualHour: 12,
    isMobile: false, // [新增] 移动端标记

    // === 管理器 ===
    audioManager: null,
    diaryManager: null,
    gameSaveManager: null,
    weatherSystem: null,

    // === UI 函数 ===
    updateStatusText: null,
    showEmote: null,
    spawnHeart: null,
    logToScreen: null,
    showConfirmDialog: null,

    // === 配置 ===
    CAT_CONFIG: null,
    FURNITURE_DB: null,
    DIARY_CONFIG: null,

    /**
     * 初始化上下文（在 startGame 中调用）
     */
    init(options) {
        Object.assign(this, options);
    },

    /**
     * 检查是否已初始化
     */
    isReady() {
        return this.scene !== null && this.camera !== null;
    }
};
