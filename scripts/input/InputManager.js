/**
 * InputManager.js - 统一输入管理
 * 处理鼠标、键盘、触摸输入的底层事件
 */

import * as THREE from 'three';

export class InputManager {
    constructor(renderer, camera, controls) {
        this.renderer = renderer;
        this.camera = camera;
        this.controls = controls;

        this.controls = controls;

        // 输入状态
        this.pointer = new THREE.Vector2();
        this.startPointer = { x: 0, y: 0 };
        this.lastTapTime = 0;
        this.tapCount = 0;
        this.raycaster = new THREE.Raycaster();
        this.moveKeys = { w: false, a: false, s: false, d: false };

        // 长按定时器
        this.longPressTimer = null;
        this.longPressDelay = 500;

        // 事件回调
        this.callbacks = {
            onPointerDown: null,
            onPointerUp: null,
            onPointerMove: null,
            onRightClick: null,
            onPointerMove: null,
            onRightClick: null,
            onRotateKey: null,
            onRotateCwKey: null,
            onRotateCcwKey: null,
            onCameraReset: null
        };

        this._bound = false;
    }

    /**
     * 设置回调
     */
    setCallbacks(callbacks) {
        Object.assign(this.callbacks, callbacks);
    }

    /**
     * 绑定 DOM 事件
     */
    bind() {
        if (this._bound) return;
        this._bound = true;

        this._onPointerMove = this._handlePointerMove.bind(this);
        this._onPointerDown = this._handlePointerDown.bind(this);
        this._onPointerUp = this._handlePointerUp.bind(this);
        this._onContextMenu = this._handleContextMenu.bind(this);
        this._onKeyDown = this._handleKeyDown.bind(this);
        this._onKeyUp = this._handleKeyUp.bind(this);

        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerdown', this._onPointerDown);
        window.addEventListener('pointerup', this._onPointerUp);
        window.addEventListener('contextmenu', this._onContextMenu);
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    /**
     * 解绑事件
     */
    unbind() {
        if (!this._bound) return;
        this._bound = false;

        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerdown', this._onPointerDown);
        window.removeEventListener('pointerup', this._onPointerUp);
        window.removeEventListener('contextmenu', this._onContextMenu);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    /**
     * 更新指针和射线
     */
    updatePointer(clientX, clientY) {
        this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
    }

    /**
     * 鼠标移动
     */
    _handlePointerMove(e) {
        this.updatePointer(e.clientX, e.clientY);

        // 检测是否取消长按（移动距离过大）
        if (this.longPressTimer) {
            if (Math.hypot(e.clientX - this.startPointer.x, e.clientY - this.startPointer.y) > 5) {
                this.cancelLongPress();
            }
        }

        if (this.callbacks.onPointerMove) {
            this.callbacks.onPointerMove(e, this.raycaster, this.pointer);
        }
    }

    /**
     * 鼠标按下
     */
    _handlePointerDown(e) {
        if (e.target !== this.renderer.domElement) return;

        this.startPointer.x = e.clientX;
        this.startPointer.y = e.clientY;
        this.updatePointer(e.clientX, e.clientY);

        if (this.callbacks.onPointerDown) {
            this.callbacks.onPointerDown(e, this.raycaster, this.pointer);
        }

        // [新增] 三击检测 (Triple Tap)
        const now = Date.now();
        if (now - this.lastTapTime < 300) {
            this.tapCount++;
        } else {
            this.tapCount = 1;
        }
        this.lastTapTime = now;

        if (this.tapCount === 3) {
            console.log("[Input] Triple tap detected");
            if (this.callbacks.onCameraReset) {
                this.callbacks.onCameraReset();
            }
            this.tapCount = 0;
        }
    }

    /**
     * 鼠标释放
     */
    _handlePointerUp(e) {
        // [修复] 不在这里自动恢复 controls，由回调函数根据当前模式决定
        // 原来的: this.controls.enabled = true;

        const wasLongPress = !this.longPressTimer;
        this.cancelLongPress();

        if (this.callbacks.onPointerUp) {
            this.callbacks.onPointerUp(e, this.raycaster, wasLongPress);
        }
    }

    /**
     * 右键菜单
     */
    _handleContextMenu(e) {
        e.preventDefault();
        if (this.callbacks.onRightClick) {
            this.callbacks.onRightClick(e);
        }
    }

    /**
     * 键盘按下
     */
    _handleKeyDown(e) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        const key = e.key.toLowerCase();

        // R 键旋转 (向右)
        if (key === 'r') {
            if (this.callbacks.onRotateKey) {
                this.callbacks.onRotateKey();
            }
            return;
        }

        // Q 键旋转 (向左)
        if (key === 'q') {
            if (this.callbacks.onRotateCcwKey) {
                this.callbacks.onRotateCcwKey();
            }
            return;
        }

        // E 键旋转 (向右)
        if (key === 'e') {
            if (this.callbacks.onRotateCwKey) {
                this.callbacks.onRotateCwKey();
            }
            return;
        }

        // H 键复位视角
        if (key === 'h') {
            if (this.callbacks.onCameraReset) {
                this.callbacks.onCameraReset();
            }
            return;
        }

        // WASD 移动
        switch (key) {
            case 'w': this.moveKeys.w = true; break;
            case 'a': this.moveKeys.a = true; break;
            case 's': this.moveKeys.s = true; break;
            case 'd': this.moveKeys.d = true; break;
        }
    }

    /**
     * 键盘释放
     */
    _handleKeyUp(e) {
        const key = e.key.toLowerCase();
        switch (key) {
            case 'w': this.moveKeys.w = false; break;
            case 'a': this.moveKeys.a = false; break;
            case 's': this.moveKeys.s = false; break;
            case 'd': this.moveKeys.d = false; break;
        }
    }

    /**
     * 启动长按定时器
     */
    startLongPress(callback) {
        this.cancelLongPress();
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = null;
            callback();
        }, this.longPressDelay);
    }

    /**
     * 取消长按定时器
     */
    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    /**
     * 检查长按是否还在等待
     */
    isWaitingLongPress() {
        return this.longPressTimer !== null;
    }

    /**
     * 禁用视角控制（拖拽时）
     */
    disableControls() {
        this.controls.enabled = false;
    }

    /**
     * 启用视角控制
     */
    enableControls() {
        this.controls.enabled = true;
    }

    /**
     * 更新相机移动 (WASD)
     */
    updateCameraMovement(dt) {
        if (!(this.moveKeys.w || this.moveKeys.a || this.moveKeys.s || this.moveKeys.d)) return;

        const moveSpeed = 10.0 * dt;
        const displacement = new THREE.Vector3();

        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, this.camera.up).normalize();

        if (this.moveKeys.w) displacement.add(forward.clone().multiplyScalar(moveSpeed));
        if (this.moveKeys.s) displacement.sub(forward.clone().multiplyScalar(moveSpeed));
        if (this.moveKeys.d) displacement.add(right.clone().multiplyScalar(moveSpeed));
        if (this.moveKeys.a) displacement.sub(right.clone().multiplyScalar(moveSpeed));

        this.camera.position.add(displacement);
        this.controls.target.add(displacement);
    }
}
