/**
 * AudioManager - 音频管理器
 * 管理游戏中的背景音乐和音效播放
 */
export class AudioManager {
    constructor() {
        this.sounds = {};
        this.bgm = null;
        this.isMuted = false;
        this.hasInteracted = false; // 是否已经交互过（用于启动BGM）

        // 预定义音效列表
        this.sources = {
            'ui_click': './assets/audio/ui_click.wav',
            'ui_popup': './assets/audio/ui_popup.wav',
            'ui_close': './assets/audio/ui_close.wav',
            'place_item': './assets/audio/place_item.wav',
            'get_money': './assets/audio/meow_happy.ogg',
            'pour_food': './assets/audio/pour_food.wav',
            'scoop_sand': './assets/audio/scoop_sand.wav',
            'meow_normal': './assets/audio/meow_normal.ogg',
            'meow_happy': './assets/audio/meow_happy.ogg',
            'meow_purr': './assets/audio/meow_purr_loop_01.ogg', // 打呼噜
            'meow_angry': './assets/audio/meow_angry.ogg',
            'meow_urgent': './assets/audio/meow_urgent.ogg',
            'toy_squeak': './assets/audio/toy_squeak.wav',
            'nicejob': './assets/audio/nicejob.mp3',
            'bgm': './assets/audio/bgm.mp3'
        };

        this.loadAll();
    }

    loadAll() {
        for (let key in this.sources) {
            const audio = new Audio(this.sources[key]);
            if (key === 'bgm') {
                audio.loop = true;
                audio.volume = 0.2; // 背景音乐稍微小声点
                this.bgm = audio;
            } else {
                audio.volume = 0.6; // 音效正常音量
                this.sounds[key] = audio;
            }
        }
    }

    // 播放音效 (支持同音效叠加播放)
    playSfx(key) {
        if (this.isMuted || !this.sounds[key]) return;

        // 克隆节点以支持连点播放（例如连续点击按钮）
        const sound = this.sounds[key].cloneNode();
        sound.volume = this.sounds[key].volume;
        sound.play().catch(e => console.warn("Audio play blocked", e));
    }

    // 尝试播放 BGM
    tryPlayBgm() {
        if (this.bgm && !this.isMuted && this.bgm.paused) {
            this.bgm.play().catch(e => {
                // 浏览器策略拦截是正常的，等待第一次点击再试
                console.log("Waiting for user interaction to play BGM...");
            });
        }
    }

    // 用户首次点击后调用
    unlockAudio() {
        if (!this.hasInteracted) {
            this.hasInteracted = true;
            this.tryPlayBgm();
        }
    }

    // 切换静音
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgm) {
            if (this.isMuted) {
                this.bgm.pause();
            } else {
                this.tryPlayBgm();
            }
        }
        return this.isMuted;
    }
}
