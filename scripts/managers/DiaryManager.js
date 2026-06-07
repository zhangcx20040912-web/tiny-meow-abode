/**
 * DiaryManager - 日记管理器
 * 管理游戏中的日记系统，包括事件记录、离线事件、节日事件等
 */

export class DiaryManager {
    constructor(diaryConfig, statusCallback = null, weatherSystem = null) {
        this.DIARY_CONFIG = diaryConfig;
        this.statusCallback = statusCallback;
        this.weatherSystem = weatherSystem; // 引用天气系统
        
        this.storageKey = 'cat_game_diary_v1';
        this.lastReadKey = 'cat_game_last_read_diary'; // 新增：记录最后阅读的日记key
        this.entries = {}; // 结构: { "YYYY-MM-DD": { meta: {}, events: [] } }
        this.eventCooldowns = {};
        this.viewingDate = new Date();
        
        this.MAX_ENTRIES_PER_DAY = 10;
        this.pendingEvents = []; // 暂存池

        this.load();
        this.init();
    }

    // 初始化逻辑：处理离线事件
    init() {
        const now = Date.now();
        const lastLogin = localStorage.getItem('last_login_time');
        
        if (lastLogin) {
            const lastLoginTime = parseInt(lastLogin);
            const offlineDurationHours = (now - lastLoginTime) / (1000 * 60 * 60);

            if (offlineDurationHours >= 1) {
                this.generateOfflineEvents(offlineDurationHours);
            }
        }
        localStorage.setItem('last_login_time', now.toString());

        this.checkSpecialDayEvent();
        
        // [新增] 初始化时检查红点状态
        this.checkAndUpdateRedDot();
    }

    checkSpecialDayEvent() {
        const now = new Date();
        const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
        const specialConfig = this.DIARY_CONFIG.special_days[dateKey];

        if (specialConfig) {
            const todayKey = this.getTodayKey();
            
            if (!this.entries[todayKey]) {
                this.entries[todayKey] = {
                    meta: this.generateDailyMeta(), 
                    events: []
                };
            }
            
            const dayEntry = this.entries[todayKey];

            if (dayEntry.meta.isSpecialProcessed) {
                return; 
            }

            dayEntry.meta.weather = specialConfig.weather[Math.floor(Math.random() * specialConfig.weather.length)];
            dayEntry.meta.mood = specialConfig.mood[Math.floor(Math.random() * specialConfig.mood.length)];
            
            dayEntry.meta.isSpecialProcessed = true; 

            const todayEvents = dayEntry.events || [];
            const hasLogged = todayEvents.some(e => specialConfig.events.includes(e.text));
            
            if (!hasLogged) {
                const text = specialConfig.events[Math.floor(Math.random() * specialConfig.events.length)];
                
                this.pendingEvents.push({
                    time: this.getTimeString(),
                    type: 'special',
                    text: text,
                    weight: 200, 
                    rawType: 'special_day'
                });
                
                this.flushPendingEvents();
            } else {
                this.save();
            }
        }
    }

    formatDateKey(date) {
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
    }

    getTodayKey() { 
        return this.formatDateKey(new Date()); 
    }

    getTimeString() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try { 
                this.entries = JSON.parse(saved); 
                
                const keys = Object.keys(this.entries);
                if (keys.length > 0) {
                    const firstVal = this.entries[keys[0]];
                    if (Array.isArray(firstVal)) {
                        console.warn("Detected old diary format, resetting...");
                        this.entries = {};
                    }
                }
            } 
            catch(e) { console.error("Diary load failed", e); this.entries = {}; }
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    }

    logEvent(eventType, params = {}, weight = 20) {
        const cooldownTime = eventType.startsWith('pet') ? 10 * 60 * 1000 : 60 * 1000;
        const now = Date.now();
        if (this.eventCooldowns[eventType] && (now - this.eventCooldowns[eventType] < cooldownTime)) return;
        this.eventCooldowns[eventType] = now;

        let text = '';
        if (params.id && this.DIARY_CONFIG.specific_items[params.id]) {
            const specifics = this.DIARY_CONFIG.specific_items[params.id];
            text = specifics[Math.floor(Math.random() * specifics.length)];
            weight = Math.max(weight, 60);
        } else {
            const templates = this.DIARY_CONFIG[eventType];
            if (!templates || templates.length === 0) return;
            text = templates[Math.floor(Math.random() * templates.length)];
            if (params.item) text = text.replace('{item}', params.item);
        }

        this.pendingEvents.push({
            time: this.getTimeString(),
            type: 'interaction',
            text: text,
            weight: weight,
            rawType: eventType
        });
        
        // [修复] 立即保存，防止关闭游戏时丢失日记
        this.flushPendingEvents();
    }

    generateOfflineEvents(offlineDurationHours) {
        const numEvents = Math.min(3, Math.floor(offlineDurationHours / 2));
        if (numEvents === 0) return;

        if (this.statusCallback) {
            this.statusCallback(`检测到离线 ${offlineDurationHours.toFixed(1)} 小时，正在生成日记...`);
        }
        
        for (let i = 0; i < numEvents; i++) {
            let eventPool = this.DIARY_CONFIG.offline_events;
            
            let totalWeight = eventPool.reduce((sum, e) => sum + e.weight, 0);
            let randomPoint = Math.random() * totalWeight;
            
            let chosenEvent = null;
            for (const event of eventPool) {
                randomPoint -= event.weight;
                if (randomPoint <= 0) {
                    chosenEvent = event;
                    break;
                }
            }

            if (chosenEvent) {
                const text = chosenEvent.text[Math.floor(Math.random() * chosenEvent.text.length)];
                const final_text = text.replace('{hours}', offlineDurationHours.toFixed(1));
                
                this.pendingEvents.push({
                    time: this.getTimeString(),
                    type: 'offline',
                    text: final_text,
                    weight: chosenEvent.weight,
                    rawType: 'offline_event'
                });
            }
        }
    }

    flushPendingEvents() {
        if (this.pendingEvents.length === 0) return;

        const key = this.getTodayKey();
        if (!this.entries[key]) {
            this.entries[key] = {
                meta: this.generateDailyMeta(),
                events: []
            };
        }
        
        let currentDayEntries = this.entries[key].events;
        
        currentDayEntries.push(...this.pendingEvents);
        this.pendingEvents = [];

        // [修复] 按时间倒序排列（最新的在最前面），而非按权重
        currentDayEntries.sort((a, b) => {
            if (a.time && b.time) return b.time.localeCompare(a.time);
            return 0;
        });

        const uniqueEntries = [];
        const seenTexts = new Set();
        for (const entry of currentDayEntries) {
            if (!seenTexts.has(entry.text)) {
                uniqueEntries.push(entry);
                seenTexts.add(entry.text);
            }
        }
        currentDayEntries = uniqueEntries;

        if (currentDayEntries.length > this.MAX_ENTRIES_PER_DAY) {
            currentDayEntries = currentDayEntries.slice(0, this.MAX_ENTRIES_PER_DAY);
        }
        
        this.entries[key].events = currentDayEntries;
        this.save();
        this.checkAndUpdateRedDot(); // 修改：使用新方法检查是否显示红点
    }

    generateDailyMeta() {
        const now = new Date();
        const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
        const specialConfig = this.DIARY_CONFIG.special_days[dateKey];

        const metaConfig = this.DIARY_CONFIG.diary_meta;
        
        let weather = metaConfig.weathers[Math.floor(Math.random() * metaConfig.weathers.length)];
        let mood = metaConfig.moods[Math.floor(Math.random() * metaConfig.moods.length)];
        let keyword = metaConfig.keywords[Math.floor(Math.random() * metaConfig.keywords.length)];

        // 优先级1：特殊节日配置
        if (specialConfig) {
            weather = specialConfig.weather[Math.floor(Math.random() * specialConfig.weather.length)];
            mood = specialConfig.mood[Math.floor(Math.random() * specialConfig.mood.length)];
        }
        // 优先级2：天气系统同步（如果有天气系统且不是特殊节日）
        // 只有在非手动天气时才使用天气系统的描述
        else if (this.weatherSystem) {
            const weatherDesc = this.weatherSystem.getWeatherDescription();
            // 如果返回 null，说明是手动天气，使用默认随机描述
            if (weatherDesc !== null) {
                weather = weatherDesc;
            }
        }

        return { weather, mood, keyword };
    }

    renderPage() {
        const dateTitle = document.getElementById('diary-date-title'); 
        const weatherMeta = document.getElementById('diary-weather');
        const moodMeta = document.getElementById('diary-mood');
        const photoDate = document.getElementById('diary-photo-date');
        const photoWeather = document.getElementById('diary-photo-weather');
        const photoImg = document.querySelector('.polaroid-photo');
        const entriesContainer = document.getElementById('diary-entries-scroll');

        const key = this.formatDateKey(this.viewingDate);
        const dayEntry = this.entries[key];
        const list = dayEntry ? dayEntry.events : [];
        const meta = dayEntry ? dayEntry.meta : null;

        if (dateTitle) dateTitle.innerText = key;

        if (weatherMeta) weatherMeta.innerText = meta ? meta.weather : '🌤️ 心情随笔';
        if (moodMeta) moodMeta.innerText = meta ? meta.mood : '😐 心情一般';

        if (photoDate) photoDate.innerText = key;
        if (photoWeather) photoWeather.innerText = meta ? meta.weather.split(' ')[1] : '适合睡觉';

        // [新增] 加载照片
        if (photoImg && window.photoManager) {
            const photo = window.photoManager.getPhoto(key);
            if (photo) {
                photoImg.src = photo;
                photoImg.style.display = 'block';
            } else {
                // 使用占位图
                photoImg.src = './assets/ui/diary_photo_placeholder_Chrismas.png';
                photoImg.style.display = 'block';
            }
        }

        entriesContainer.innerHTML = ''; 

        if (list.length === 0) {
            entriesContainer.innerHTML = '<div class="entry empty-tip">今天猫咪很懒，没有留下记录...</div>';
        } else {
            // [修复] 按时间倒序显示，最新的排在最上面
            const sorted = [...list].sort((a, b) => {
                if (a.time && b.time) return b.time.localeCompare(a.time);
                return 0;
            });
            sorted.forEach(item => {
                const div = document.createElement('div');
                div.className = 'entry';
                div.innerHTML = `<div class="entry-time">${item.time}</div><div class="entry-text">${item.text}</div>`;
                entriesContainer.appendChild(div);
            });
        }

        const btnNext = document.getElementById('btn-diary-next');
        const btnPrev = document.getElementById('btn-diary-prev');
        
        const currentKey = key;
        const todayKey = this.getTodayKey();
        
        const allDates = Object.keys(this.entries).sort();
        const earliestKey = allDates.length > 0 ? allDates[0] : todayKey;

        const hasNext = currentKey < todayKey;
        const hasPrev = currentKey > earliestKey;
        
        if (btnNext) {
            btnNext.style.visibility = hasNext ? 'visible' : 'hidden';
        }
        if (btnPrev) {
            btnPrev.style.visibility = hasPrev ? 'visible' : 'hidden';
        }
    }

    updateUIHint(hasNew) {
        const dot = document.getElementById('diary-red-dot-hud');
        if(dot) dot.style.display = hasNew ? 'block' : 'none';
    }

    // 新增：检查是否有未读日记并更新红点
    checkAndUpdateRedDot() {
        const todayKey = this.getTodayKey();
        const lastReadKey = localStorage.getItem(this.lastReadKey);
        
        // 如果今天的日记还没被阅读过，显示红点
        const hasUnread = (todayKey !== lastReadKey) && this.entries[todayKey] && this.entries[todayKey].events.length > 0;
        this.updateUIHint(hasUnread);
    }

    // 修改：当用户打开日记时，标记为已读
    markAsRead() {
        const todayKey = this.getTodayKey();
        localStorage.setItem(this.lastReadKey, todayKey);
        this.updateUIHint(false);
    }

    changePage(delta) {
        this.viewingDate.setDate(this.viewingDate.getDate() + delta);
        this.renderPage();
    }
    
    clearAll() {
        this.entries = {};
        this.save();
        const modal = document.getElementById('diary-modal');
        if (modal && !modal.classList.contains('hidden')) {
            this.renderPage();
        }
    }
}
