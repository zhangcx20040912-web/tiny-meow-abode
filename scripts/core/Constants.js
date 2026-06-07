/**
 * 游戏常量配置
 * @module core/Constants
 */
import * as THREE from 'three';

// ========== 猫咪配置 ==========
export const CAT_CONFIG = {
    scale: 0.35,
    rotateX: 0,
    rotateY: 0,
    yOffset: 0,
    anim: {
        sleep: 0,   // Action 1: 倒下/侧躺
        happy: 1,   // Action 2: 乞讨/高兴
        idle: 2,    // Action 3: 寻找 (作为待机)
        eat: 3,     // Action 4: 吃饭
        urgent: 5,  // Action 6: 着急 (上厕所)
        hop: 6,     // Action 7: 跳着走
        walk: 7     // Action 8: 走路
    }
};

// ========== 天空颜色配置 ==========
export const SKY_COLORS = {
    night: new THREE.Color(0x1a1a2e),
    dawn: new THREE.Color(0xffaa99),
    day: new THREE.Color(0xe0f7fa),
    dusk: new THREE.Color(0x6a5acd)
};

// ========== 默认装修配置 ==========
export const DEFAULT_DECOR = {
    floor: { color: 0xF5F5DC, texture: null },
    wall: { color: 0xEBE5D1, texture: null }
};

// ========== 渲染配置 ==========
export const RENDER_CONFIG = {
    cameraDistance: 8,
    panOffset: -6,
    shadowMapSize: 2048,
    pixelRatioMax: 2,
    exposure: 1.2
};

// ========== 音频路径配置 ==========
export const AUDIO_SOURCES = {
    'ui_click': './assets/audio/ui_click.wav',
    'ui_popup': './assets/audio/ui_popup.wav',
    'ui_close': './assets/audio/ui_close.wav',
    'place_item': './assets/audio/place_item.wav',
    'get_money': './assets/audio/meow_happy.ogg',
    'pour_food': './assets/audio/pour_food.wav',
    'scoop_sand': './assets/audio/scoop_sand.wav',
    'meow_normal': './assets/audio/meow_normal.ogg',
    'meow_happy': './assets/audio/meow_happy.ogg',
    'meow_purr': './assets/audio/meow_purr_loop_01.ogg',
    'meow_angry': './assets/audio/meow_angry.ogg',
    'meow_urgent': './assets/audio/meow_urgent.ogg',
    'toy_squeak': './assets/audio/toy_squeak.wav',
    'bgm': './assets/audio/bgm.mp3'
};
