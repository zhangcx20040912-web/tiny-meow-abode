/**
 * PostProcessing.js - 后期处理效果管理
 * 包含 SSAO、Bloom、移轴、抗锯齿等效果
 * 支持运行时动态开关各效果
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CustomTiltShiftShader } from '../shaders/TiltShiftShader.js';

// 保存各 pass 的引用，用于动态开关
let _passes = {
    render: null,
    ssao: null,
    bloom: null,
    tiltShift: null,
    smaa: null,
    output: null,
};

/**
 * 初始化后期处理管线（所有效果都创建，通过 enabled 控制开关）
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {Object} settings - 初始开关设置 { ssao, bloom, tiltShift, smaa }
 * @returns {EffectComposer}
 */
export function initPostProcessing(renderer, scene, camera, settings = {}) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const composer = new EffectComposer(renderer);

    // 1. 基础场景渲染（始终开启）
    _passes.render = new RenderPass(scene, camera);
    composer.addPass(_passes.render);

    // 2. SSAO (环境光遮蔽)
    _passes.ssao = new SAOPass(scene, camera, false, true);
    _passes.ssao.params.output = 0;
    _passes.ssao.params.saoBias = 0.5;
    _passes.ssao.params.saoIntensity = 0.05;
    _passes.ssao.params.saoScale = 100;
    _passes.ssao.params.saoKernelRadius = 30;
    _passes.ssao.enabled = settings.ssao !== undefined ? settings.ssao : true;
    composer.addPass(_passes.ssao);

    // 3. Bloom (辉光)
    _passes.bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    _passes.bloom.threshold = 0.95;
    _passes.bloom.strength = 0.15;
    _passes.bloom.radius = 0.5;
    _passes.bloom.enabled = settings.bloom !== undefined ? settings.bloom : true;
    composer.addPass(_passes.bloom);

    // 4. 移轴效果 (TiltShift)
    _passes.tiltShift = new ShaderPass(CustomTiltShiftShader);
    _passes.tiltShift.uniforms['blurradius'].value = 3.0;
    _passes.tiltShift.uniforms['focus'].value = 0.5;
    _passes.tiltShift.uniforms['aspect'].value = width / height;
    _passes.tiltShift.enabled = settings.tiltShift !== undefined ? settings.tiltShift : true;
    composer.addPass(_passes.tiltShift);

    // 5. SMAA (抗锯齿)
    _passes.smaa = new SMAAPass(width, height);
    _passes.smaa.enabled = settings.smaa !== undefined ? settings.smaa : true;
    composer.addPass(_passes.smaa);

    // 6. Output (色彩输出，始终开启)
    _passes.output = new OutputPass();
    composer.addPass(_passes.output);

    return composer;
}

/**
 * 动态设置某个后期效果的开关
 * @param {string} name - 效果名: 'ssao' | 'bloom' | 'tiltShift' | 'smaa'
 * @param {boolean} enabled
 */
export function setPassEnabled(name, enabled) {
    if (_passes[name]) {
        _passes[name].enabled = enabled;
        console.log(`[后处理] ${name} ${enabled ? '开启' : '关闭'}`);
    }
}

/**
 * 获取当前各效果的开关状态
 * @returns {Object}
 */
export function getPassStates() {
    return {
        ssao: _passes.ssao ? _passes.ssao.enabled : false,
        bloom: _passes.bloom ? _passes.bloom.enabled : false,
        tiltShift: _passes.tiltShift ? _passes.tiltShift.enabled : false,
        smaa: _passes.smaa ? _passes.smaa.enabled : false,
    };
}

/**
 * 窗口大小改变时更新后期处理
 * @param {EffectComposer} composer
 */
export function resizePostProcessing(composer) {
    if (!composer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    composer.setSize(width, height);
    composer.passes.forEach(pass => {
        if (pass.uniforms && pass.uniforms['aspect']) {
            pass.uniforms['aspect'].value = width / height;
        }
    });
}
