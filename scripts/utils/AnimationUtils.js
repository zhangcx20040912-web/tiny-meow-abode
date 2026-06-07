/**
 * AnimationUtils.js - 动画工具函数
 */

/**
 * 弹跳动画（放置家具时）
 */
export function playBounce(mesh) {
    let frame = 0;
    const baseScale = mesh.userData.parentClass?.dbItem?.modelScale || 1;
    
    function animate() {
        if (frame < 20) {
            const k = frame / 20;
            const s = 0.1 + (0.9) * (Math.sin(k * Math.PI * 1.5) * 0.2 + k);
            mesh.scale.set(baseScale * s, baseScale * s, baseScale * s);
            frame++;
            requestAnimationFrame(animate);
        } else {
            mesh.scale.set(baseScale, baseScale, baseScale);
        }
    }
    animate();
}

/**
 * 玩具挤压动画
 */
export function playToyAnim(mesh) {
    let frame = 0;
    const originalScale = mesh.userData.parentClass?.dbItem?.modelScale || 1.0;
    
    function animate() {
        frame++;
        if (frame <= 5) {
            // 压扁
            const s = 1.0 - (frame / 5) * 0.3;
            const s_fat = 1.0 + (frame / 5) * 0.1;
            mesh.scale.set(originalScale * s_fat, originalScale * s, originalScale * s_fat);
        } else if (frame <= 15) {
            // 回弹
            const t = (frame - 5) / 10;
            const s = 0.7 + t * 0.4;
            const s_thin = 1.1 - t * 0.15;
            mesh.scale.set(originalScale * s_thin, originalScale * s, originalScale * s_thin);
        } else if (frame <= 20) {
            mesh.scale.set(originalScale, originalScale, originalScale);
            return;
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/**
 * 漂浮文字动画（爱心 +5）
 */
export function spawnFloatingText(camera, position, text, className = 'heart-float') {
    const v = position.clone();
    v.y += 1;
    v.project(camera);
    
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
    
    const el = document.createElement('div');
    el.className = className;
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 1500);
}

/**
 * 表情气泡动画
 */
export function showEmoteBubble(camera, position, emoji) {
    const v = position.clone();
    v.y += 1.2;
    v.project(camera);
    
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
    
    const el = document.createElement('div');
    el.className = 'emote-bubble';
    el.innerText = emoji;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 1000);
}
