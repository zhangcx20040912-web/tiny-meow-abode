/**
 * WeatherSystem - 天气系统
 * 管理天空、云朵、极光、雨雪等天气效果
 */
import * as THREE from 'three';
import { WEATHER_CONFIG } from '../data/WeatherConfig.js';
import { GameContext } from '../core/GameContext.js';

// === 天空 Shader（动森风格夜空）===
export const SkyShader = {
    vertex: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vNormal = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float starOpacity;
        uniform float auroraOpacity;
        uniform float time;
        uniform vec2 resolution;
        
        varying vec2 vUv;
        varying vec3 vNormal;

        // 高质量随机
        float hash(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }
        
        // 噪声函数（用于银河效果）
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            float h = gl_FragCoord.y / resolution.y;
            vec3 bg = mix(bottomColor, topColor, h);
            
            // ===== 动森风格星星 =====
            if (starOpacity > 0.0 && h > 0.25) {
                vec2 uv = gl_FragCoord.xy;
                
                // 大星星层（稀疏，约2%）
                vec2 bigGrid = floor(uv / 50.0);  // 50像素网格
                float bigRnd = hash(bigGrid);
                if (bigRnd > 0.98) {
                    vec2 gridCenter = (bigGrid + 0.5) * 50.0;
                    float dist = length(uv - gridCenter);
                    if (dist < 2.0) {
                        float twinkle = sin(time * 1.5 + bigRnd * 6.28) * 0.2 + 0.8;
                        float glow = smoothstep(2.0, 0.0, dist);
                        bg += vec3(1.0, 1.0, 0.95) * glow * starOpacity * twinkle * 0.8;
                    }
                }
                
                // 中星星层（较稀疏，约3%）
                vec2 medGrid = floor(uv / 35.0);
                float medRnd = hash(medGrid + 100.0);
                if (medRnd > 0.97) {
                    vec2 gridCenter = (medGrid + 0.5) * 35.0;
                    float dist = length(uv - gridCenter);
                    if (dist < 1.2) {
                        float twinkle = sin(time * 2.0 + medRnd * 6.28) * 0.3 + 0.7;
                        float glow = smoothstep(1.2, 0.0, dist);
                        bg += vec3(1.0, 1.0, 0.9) * glow * starOpacity * twinkle * 0.5;
                    }
                }
                
                // 小星星层（稍多，约5%）
                vec2 smallGrid = floor(uv / 20.0);
                float smallRnd = hash(smallGrid + 200.0);
                if (smallRnd > 0.95) {
                    vec2 gridCenter = (smallGrid + 0.5) * 20.0;
                    float dist = length(uv - gridCenter);
                    if (dist < 0.8) {
                        float twinkle = sin(time * 3.0 + smallRnd * 6.28) * 0.4 + 0.6;
                        bg += vec3(0.9, 0.95, 1.0) * starOpacity * twinkle * 0.3;
                    }
                }
                
                // 高度衰减：越靠近地平线星星越淡
                float heightFade = smoothstep(0.25, 0.5, h);
                bg = mix(mix(bottomColor, topColor, h), bg, heightFade);
            }
            
            // ===== 银河/淡紫色氛围 =====
            if (auroraOpacity > 0.0 && h > 0.4) {
                vec2 p = gl_FragCoord.xy / resolution.y;
                
                // 银河带 - 斜向的淡紫色光带
                float milkyWay = fbm(p * 3.0 + vec2(time * 0.01, 0.0));
                milkyWay *= smoothstep(0.4, 0.7, h) * smoothstep(1.0, 0.7, h);
                
                // 淡紫色到淡蓝色
                vec3 milkyColor = mix(vec3(0.3, 0.2, 0.5), vec3(0.2, 0.3, 0.5), milkyWay);
                bg += milkyColor * milkyWay * auroraOpacity * 0.15;
            }
            
            gl_FragColor = vec4(bg, 1.0);
        }
    `
};

// === 极光 Shader ===
export const AuroraShader = {
    vertex: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        uniform float time;
        varying vec2 vUv;
        void main() {
            float alpha = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
            alpha *= sin(vUv.x * 5.0 - time * 0.5) * 0.5 + 0.5;
            alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
            
            vec3 color = mix(vec3(0.0, 1.0, 0.8), vec3(0.5, 0.0, 1.0), vUv.x);
            gl_FragColor = vec4(color, alpha * 0.4);
        }
    `
};

// === 窗户 Shader（带星星效果）===
export const WindowSkyShader = {
    vertex: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float starOpacity;
        uniform float time;
        varying vec2 vUv;

        float hash(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }

        void main() {
            vec3 bg = mix(bottomColor, topColor, vUv.y);
            
            // 窗户内的星星（基于UV坐标，极度稀疏）
            if (starOpacity > 0.0 && vUv.y > 0.3) {
                // 少量中星星
                vec2 medGrid = floor(vUv * 30.0);
                float medRnd = hash(medGrid + 50.0);
                if (medRnd > 0.98) {
                    vec2 gridCenter = (medGrid + 0.5) / 30.0;
                    float dist = length(vUv - gridCenter) * 30.0;
                    if (dist < 0.4) {
                        float twinkle = sin(time * 2.0 + medRnd * 6.28) * 0.3 + 0.7;
                        float glow = smoothstep(0.4, 0.0, dist);
                        bg += vec3(1.0, 1.0, 0.95) * glow * starOpacity * twinkle * 0.5;
                    }
                }
                
                // 少量小星星
                vec2 smallGrid = floor(vUv * 45.0);
                float smallRnd = hash(smallGrid + 100.0);
                if (smallRnd > 0.97) {
                    vec2 gridCenter = (smallGrid + 0.5) / 45.0;
                    float dist = length(vUv - gridCenter) * 45.0;
                    if (dist < 0.3) {
                        float twinkle = sin(time * 3.0 + smallRnd * 6.28) * 0.4 + 0.6;
                        bg += vec3(0.9, 0.95, 1.0) * starOpacity * twinkle * 0.3;
                    }
                }
                
                // 高度衰减
                float heightFade = smoothstep(0.3, 0.6, vUv.y);
                bg = mix(mix(bottomColor, topColor, vUv.y), bg, heightFade);
            }
            
            gl_FragColor = vec4(bg, 1.0);
        }
    `
};

// === 动态生成粒子贴图 (雨/雪) ===
export function createParticleTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (type === 'snow') {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
    } else if (type === 'rain') {
        ctx.fillStyle = 'rgba(200, 220, 255, 1.0)';
        ctx.fillRect(12, 0, 8, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// === 天气系统类 ===
export class WeatherSystem {
    constructor(scene, statusCallback = null) {
        this.scene = scene;
        this.statusCallback = statusCallback;
        this.dome = null;
        this.skyMat = null;

        this.clouds = [];
        this.rainSystem = null;
        this.snowSystem = null;

        this.windowMaterials = [];
        this.currentWeather = 'clear';
        this.lastWeatherCheckDate = null; // 记录上次检查天气的日期
        this.isManualWeather = false; // 标记是否为玩家手动切换的天气

        // [优化] 预分配复用对象，避免每帧 new THREE.Color 导致 GC 压力
        this._cloudColor = new THREE.Color();
        // 天空颜色预分配（晴天 + 阴天各8个）
        this._skyColors = {
            cloudyDayTop: new THREE.Color(0x8899aa),
            cloudyDayBot: new THREE.Color(0xc0c8d0),
            cloudyDawnTop: new THREE.Color(0x6a7a8a),
            cloudyDawnBot: new THREE.Color(0xb0b8c0),
            cloudyDuskTop: new THREE.Color(0x4a5568),
            cloudyDuskBot: new THREE.Color(0x8090a0),
            cloudyNightTop: new THREE.Color(0x1a1a28),
            cloudyNightBot: new THREE.Color(0x3a3a50),
            dawnTop: new THREE.Color(0x607d8b),
            dawnBot: new THREE.Color(0xffe0b2),
            dayTop: new THREE.Color(0x4fc3f7),
            dayBot: new THREE.Color(0xffffff),
            duskTop: new THREE.Color(0x2c3e50),
            duskBot: new THREE.Color(0xffcc80),
            nightTop: new THREE.Color(0x0a0a12),
            nightBot: new THREE.Color(0x1a237e),
        };

        this.initSky();
        this.initClouds();
        this.initPrecipitation();
    }

    initSky() {
        const geo = new THREE.SphereGeometry(400, 32, 15);

        this.skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                starOpacity: { value: 0.0 },
                auroraOpacity: { value: 0.0 },
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: SkyShader.vertex,
            fragmentShader: SkyShader.fragment,
            side: THREE.BackSide,
            depthWrite: false
        });

        this.dome = new THREE.Mesh(geo, this.skyMat);
        this.dome.renderOrder = -1;
        this.scene.add(this.dome);
    }

    initClouds() {
        const cloudGeo = new THREE.SphereGeometry(1, 12, 12);
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            flatShading: true,
            opacity: 0.8,
            transparent: true,
            depthWrite: false
        });

        const directions = [
            { name: 'back', axis: 'x', minX: -25, maxX: 20, baseZ: -25, moveDir: 1 },
            { name: 'front', axis: 'x', minX: -25, maxX: 20, baseZ: 15, moveDir: -1 },
            { name: 'left', axis: 'z', minZ: -30, maxZ: 20, baseX: -25, moveDir: 1 },
            { name: 'right', axis: 'z', minZ: -30, maxZ: 20, baseX: 20, moveDir: -1 }
        ];

        directions.forEach(dir => {
            for (let i = 0; i < 3; i++) {
                const cloudGroup = new THREE.Group();

                for (let j = 0; j < 3 + Math.random() * 2; j++) {
                    const mesh = new THREE.Mesh(cloudGeo, cloudMat.clone());
                    mesh.position.set(Math.random() * 2 - 1, Math.random() * 1 - 0.5, Math.random() * 1 - 0.5);
                    mesh.scale.setScalar(0.8 + Math.random() * 0.5);
                    cloudGroup.add(mesh);
                }

                cloudGroup.scale.setScalar(1.0);

                // 云的高度：-4 到 4 之间随机（范围8）
                const cloudHeight = -12 + Math.random() * 12;

                if (dir.axis === 'x') {
                    cloudGroup.userData = {
                        axis: 'x',
                        speed: 1.5 + Math.random() * 1.5,
                        direction: dir.moveDir,
                        minX: dir.minX,
                        maxX: dir.maxX,
                        baseY: cloudHeight,
                        baseZ: dir.baseZ
                    };
                    cloudGroup.position.set(
                        dir.minX + Math.random() * (dir.maxX - dir.minX),
                        cloudGroup.userData.baseY,
                        dir.baseZ
                    );
                } else {
                    cloudGroup.userData = {
                        axis: 'z',
                        speed: 1.5 + Math.random() * 1.5,
                        direction: dir.moveDir,
                        minZ: dir.minZ,
                        maxZ: dir.maxZ,
                        baseY: cloudHeight,
                        baseX: dir.baseX
                    };
                    cloudGroup.position.set(
                        dir.baseX,
                        cloudGroup.userData.baseY,
                        dir.minZ + Math.random() * (dir.maxZ - dir.minZ)
                    );
                }

                this.scene.add(cloudGroup);
                this.clouds.push(cloudGroup);
            }
        });
    }

    initPrecipitation() {
        const count = 2000;
        const geo = new THREE.BufferGeometry();
        const pos = [];
        const sizes = []; // [新增]

        const isMobile = GameContext.isMobile; // 获取移动端标记

        for (let i = 0; i < count; i++) {
            pos.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 60,
                (Math.random() - 0.5) * 100
            );

            // [新增] 随机大小逻辑
            let s;
            if (isMobile) {
                // 手机端：以当前(20)为最大，范围 10~20
                s = 10 + Math.random() * 10;
            } else {
                // 电脑端：范围更广 8~35，增加层次感
                s = 8 + Math.random() * 27;
            }
            sizes.push(s);
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1)); // [新增] 传入Shader

        this.rainMat = new THREE.PointsMaterial({
            color: 0xddddff,
            size: 8.0,
            map: createParticleTexture('rain'),
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.snowMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 20.0, // 默认值（会被 aSize 覆盖）
            map: createParticleTexture('snow'),
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // [新增] 修改 Shader 使用 attribute size
        this.snowMat.onBeforeCompile = (shader) => {
            shader.vertexShader = `
                attribute float aSize;
                ${shader.vertexShader}
            `.replace(
                'gl_PointSize = size;',
                'gl_PointSize = aSize;'
            );
        };

        this.precipSystem = new THREE.Points(geo, this.rainMat);
        this.precipSystem.visible = false;
        this.precipSystem.renderOrder = 2;

        this.scene.add(this.precipSystem);
    }

    /**
     * 设置天气
     * @param {string} type - 天气类型：'clear', 'rain', 'snow'
     * @param {boolean} isManual - 是否为玩家手动切换（true=手动，false=自然变化）
     */
    setWeather(type, isManual = false) {
        this.currentWeather = type;
        this.isManualWeather = isManual;

        if (type === 'clear') {
            this.precipSystem.visible = false;
        } else {
            this.precipSystem.visible = true;
            this.precipSystem.material = (type === 'snow') ? this.snowMat : this.rainMat;
        }
        if (this.statusCallback) {
            this.statusCallback("天气变成了: " + type);
        }
    }

    /**
     * 检查并随机设置每日天气（基于月份概率或特殊日期）
     * @returns {string} 返回当前天气类型：'clear', 'rain', 'snow'
     */
    checkDailyWeather() {
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

        // 如果今天已经检查过天气，直接返回当前天气
        if (this.lastWeatherCheckDate === todayKey) {
            return this.currentWeather;
        }

        // 新的一天，重新随机天气
        this.lastWeatherCheckDate = todayKey;
        this.isManualWeather = false; // 重置手动标记（新的一天开始自然天气）

        const month = now.getMonth() + 1; // 1-12
        const dateKey = `${month}-${now.getDate()}`;

        // 优先检查特殊日期配置
        if (WEATHER_CONFIG.special_date_weather && WEATHER_CONFIG.special_date_weather[dateKey]) {
            const specialWeather = WEATHER_CONFIG.special_date_weather[dateKey];
            this.setWeather(specialWeather, false);
            return specialWeather;
        }

        // 使用月度概率配置
        const config = WEATHER_CONFIG.monthly_probability[month];

        if (!config) {
            this.setWeather('clear', false);
            return 'clear';
        }

        const rainProb = config.rain || 0;
        const snowProb = config.snow || 0;
        const random = Math.random();

        // 优先判断下雪，然后下雨，最后晴天
        if (random < snowProb) {
            this.setWeather('snow', false);
            return 'snow';
        } else if (random < snowProb + rainProb) {
            this.setWeather('rain', false);
            return 'rain';
        } else {
            this.setWeather('clear', false);
            return 'clear';
        }
    }

    /**
     * 获取当前天气对应的日记描述文案
     * 注意：如果是玩家手动切换的天气，不应该调用此方法
     * @returns {string} 天气描述文案
     */
    getWeatherDescription() {
        // 如果是手动天气，返回 null，让日记系统使用默认描述
        if (this.isManualWeather) {
            return null;
        }

        const descriptions = WEATHER_CONFIG.weather_descriptions[this.currentWeather];
        if (!descriptions || descriptions.length === 0) {
            return "☀️ 阳光正好，适合烤毛";
        }
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    // 即时设置时间（用于滑块快速拖动时）
    setTimeInstant(hour) {
        // 即时更新天空颜色
        this.updateSkyColor(hour, true);

        // 即时更新星星
        const targetStarOpacity = (hour >= 19 || hour <= 5) ? 1.0 : 0.0;
        this.skyMat.uniforms.starOpacity.value = targetStarOpacity;

        // 即时更新极光（融入shader）
        const targetAuroraOpacity = (hour >= 22 || hour < 3) ? 1.0 : 0.0;
        this.skyMat.uniforms.auroraOpacity.value = targetAuroraOpacity;
    }

    update(dt, hour) {
        this.updateSkyColor(hour);

        // 更新shader时间（用于极光动画）
        this.skyMat.uniforms.time.value += dt;

        // 星星渐变
        let targetStarOpacity = 0;
        if (hour >= 19 || hour <= 5) targetStarOpacity = 1.0;

        const currentStarOp = this.skyMat.uniforms.starOpacity.value;
        this.skyMat.uniforms.starOpacity.value += (targetStarOpacity - currentStarOp) * dt * 0.5;

        // 极光渐变 (22:00 - 03:00)
        let targetAuroraOpacity = 0;
        if (hour >= 22 || hour < 3) targetAuroraOpacity = 1.0;

        const currentAuroraOp = this.skyMat.uniforms.auroraOpacity.value;
        this.skyMat.uniforms.auroraOpacity.value += (targetAuroraOpacity - currentAuroraOp) * dt * 0.5;

        // 同步窗户材质的星星和时间
        this.windowMaterials.forEach(mat => {
            if (mat && mat.uniforms) {
                if (mat.uniforms.starOpacity) {
                    mat.uniforms.starOpacity.value = this.skyMat.uniforms.starOpacity.value;
                }
                if (mat.uniforms.time) {
                    mat.uniforms.time.value = this.skyMat.uniforms.time.value;
                }
            }
        });

        this.clouds.forEach(c => {
            if (c.userData.axis === 'x') {
                c.position.x += c.userData.speed * c.userData.direction * dt;

                if (c.position.x > c.userData.maxX) {
                    c.position.x = c.userData.minX;
                } else if (c.position.x < c.userData.minX) {
                    c.position.x = c.userData.maxX;
                }
            } else {
                c.position.z += c.userData.speed * c.userData.direction * dt;

                if (c.position.z > c.userData.maxZ) {
                    c.position.z = c.userData.minZ;
                } else if (c.position.z < c.userData.minZ) {
                    c.position.z = c.userData.maxZ;
                }
            }

            let cloudColor = 0xffffff;
            if (hour >= 5 && hour < 9) {
                cloudColor = 0xffcba4;
            } else if (hour >= 9 && hour < 17) {
                cloudColor = 0xffffff;
            } else if (hour >= 17 && hour < 20) {
                cloudColor = 0xffa07a;
            } else {
                cloudColor = 0x4a5568;
            }

            // [优化] 复用预分配的 _cloudColor，避免每帧每朵云 new THREE.Color
            this._cloudColor.set(cloudColor);
            c.children.forEach(m => {
                if (m.material && m.material.color) {
                    m.material.color.lerp(this._cloudColor, dt * 0.5);
                }
            });
        });

        if (this.currentWeather !== 'clear' && this.precipSystem.visible) {
            const positions = this.precipSystem.geometry.attributes.position.array;
            const isRain = (this.currentWeather === 'rain');

            const speed = isRain ? 12 : 0.8;

            const time = Date.now() * 0.001;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= speed * dt;

                if (!isRain) {
                    positions[i] += Math.sin(time + positions[i + 1] * 0.1) * 0.05 * dt;
                }

                if (positions[i + 1] < -5) {
                    // 重置Y坐标，并重新随机X和Z坐标，防止雪花飘出可见范围
                    positions[i] = (Math.random() - 0.5) * 100;   // 重置X
                    positions[i + 1] = 50;                           // 重置Y
                    positions[i + 2] = (Math.random() - 0.5) * 100;  // 重置Z
                }
            }
            this.precipSystem.geometry.attributes.position.needsUpdate = true;

            if (isRain) {
                this.clouds.forEach(c => c.children.forEach(m => m.material.color.setHex(0x888888)));
            } else {
                this.clouds.forEach(c => c.children.forEach(m => m.material.color.setHex(0xffffff)));
            }
        }
    }

    updateSkyColor(hour, isInstant = false) {
        // [优化] 使用构造函数中预分配的颜色对象，不再每帧创建 16 个 new THREE.Color
        const sc = this._skyColors;

        let t = this.skyMat.uniforms.topColor.value;
        let b = this.skyMat.uniforms.bottomColor.value;

        const lerpFactor = isInstant ? 1.0 : 0.01;

        // [修改] 根据天气类型选择颜色
        const isCloudy = (this.currentWeather === 'rain' || this.currentWeather === 'snow');

        if (hour >= 5 && hour < 9) {
            if (isCloudy) {
                t.lerp(sc.cloudyDawnTop, lerpFactor);
                b.lerp(sc.cloudyDawnBot, lerpFactor);
            } else {
                t.lerp(sc.dawnTop, lerpFactor);
                b.lerp(sc.dawnBot, lerpFactor);
            }
        } else if (hour >= 9 && hour < 17) {
            if (isCloudy) {
                t.lerp(sc.cloudyDayTop, lerpFactor);
                b.lerp(sc.cloudyDayBot, lerpFactor);
            } else {
                t.lerp(sc.dayTop, lerpFactor);
                b.lerp(sc.dayBot, lerpFactor);
            }
        } else if (hour >= 17 && hour < 20) {
            if (isCloudy) {
                t.lerp(sc.cloudyDuskTop, lerpFactor);
                b.lerp(sc.cloudyDuskBot, lerpFactor);
            } else {
                t.lerp(sc.duskTop, lerpFactor);
                b.lerp(sc.duskBot, lerpFactor);
            }
        } else {
            if (isCloudy) {
                t.lerp(sc.cloudyNightTop, lerpFactor);
                b.lerp(sc.cloudyNightBot, lerpFactor);
            } else {
                t.lerp(sc.nightTop, lerpFactor);
                b.lerp(sc.nightBot, lerpFactor);
            }
        }

        this.windowMaterials.forEach(mat => {
            if (mat && mat.uniforms && mat.uniforms.topColor) {
                mat.uniforms.topColor.value.copy(t);
                mat.uniforms.bottomColor.value.copy(b);
            }
        });
    }
}
