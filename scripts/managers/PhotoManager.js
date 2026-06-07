/**
 * 照片管理系统
 * - 自动拍照（每天随机时刻）
 * - 手动拍照（玩家触发）
 * - 照片存储与加载
 */

export class PhotoManager {
    constructor() {
        // 配置参数
        this.autoPhotoInterval = 2 * 60 * 60 * 1000; // 2小时检查一次（毫秒）
        this.photoChance = 0.3; // 30%概率触发自动拍照
        this.maxPhotoDays = 30; // 保留最近30天的照片
        this.photoWidth = 240; // 照片宽度（4:5比例）
        this.photoHeight = 300; // 照片高度（4:5比例）
        this.photoQuality = 0.7; // JPEG质量
        
        // 内部状态
        this.photos = {}; // { 'YYYY-MM-DD': base64ImageData }
        this.manualPhotoFlags = {}; // { 'YYYY-MM-DD': true } - 记录哪些天手动拍过照
        this.lastAutoPhotoTime = 0;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.cats = null;
        this.isInPhotoMode = false; // 是否处于拍照模式
        this.originalUIState = {}; // 保存UI原始状态
        
        // 加载已存储的照片
        this.loadPhotos();
        this.loadManualFlags();
    }
    
    /**
     * 初始化照片系统
     */
    init(renderer, scene, camera, cats) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.cats = cats;
        console.log('📷 照片系统已初始化');
    }
    
    /**
     * 每帧更新（用于自动拍照检查）
     */
    update() {
        const now = Date.now();
        
        // 检查是否需要自动拍照
        if (now - this.lastAutoPhotoTime > this.autoPhotoInterval) {
            this.lastAutoPhotoTime = now;
            this.tryAutoPhoto();
        }
    }
    
    /**
     * 尝试自动拍照
     */
    tryAutoPhoto() {
        const dateKey = this.getCurrentDateKey();
        
        // 检查今天是否已有照片
        if (this.hasTodayPhoto()) {
            return;
        }
        
        // [新增] 如果今天手动拍过照，就不自动拍了
        if (this.manualPhotoFlags[dateKey]) {
            return;
        }
        
        // 30%概率触发
        if (Math.random() < this.photoChance) {
            this.autoTakePhoto();
        }
    }
    
    /**
     * 自动拍照（智能选择时机）
     */
    autoTakePhoto() {
        if (!this.cats || this.cats.length === 0) return;
        
        const cat = this.cats[0];
        
        // 优先选择猫咪在活动的时刻
        const interestingStates = ['eating', 'pooping', 'sleeping', 'playing'];
        const isInteresting = interestingStates.includes(cat.state);
        
        if (isInteresting || Math.random() < 0.5) {
            console.log('📷 自动拍照：捕捉到有趣时刻！');
            
            // 隐藏UI
            this.hideUI();
            
            // 等待一帧后拍照
            requestAnimationFrame(() => {
                this.showFlashEffect();
                
                // 拍照
                const screenshot = this.renderer.domElement.toDataURL('image/jpeg', this.photoQuality);
                
                // 调整大小为4:5比例
                this.resizeImage(screenshot, this.photoWidth, this.photoHeight, (resizedImage) => {
                    const dateKey = this.getCurrentDateKey();
                    this.photos[dateKey] = resizedImage;
                    this.savePhotos();
                    
                    console.log(`📷 自动拍照完成: ${dateKey}`);
                    
                    // 恢复UI
                    this.showUI();
                    
                    // 更新日记显示
                    if (window.diaryManager) {
                        window.diaryManager.renderPage();
                    }
                });
            });
        }
    }
    
    /**
     * 进入手动拍照模式
     */
    enterPhotoMode() {
        this.isInPhotoMode = true;
        
        // 显示拍照界面
        const photoModeUI = document.getElementById('photo-mode-overlay');
        if (photoModeUI) {
            photoModeUI.style.display = 'flex';
        }
        
        // 保存并隐藏所有其他UI
        this.hideUI();
        
        console.log('📷 进入拍照模式（可调整视角和位置）');
    }
    
    /**
     * 退出拍照模式
     */
    exitPhotoMode() {
        this.isInPhotoMode = false;
        
        const photoModeUI = document.getElementById('photo-mode-overlay');
        if (photoModeUI) {
            photoModeUI.style.display = 'none';
        }
        
        // 恢复UI
        this.showUI();
        
        console.log('📷 退出拍照模式');
    }
    
    /**
     * 在拍照模式下拍摄
     * 只截取取景框内的区域
     */
    captureInPhotoMode() {
        const dateKey = this.getCurrentDateKey();
        
        // 检查今天是否已有照片
        if (this.photos[dateKey]) {
            if (!confirm('今天已经拍过照片了，是否替换？')) {
                return;
            }
        }
        
        try {
            const cameraFrame = document.getElementById('camera-frame-container');
            const exitBtn = document.getElementById('exit-photo-mode-btn');
            const viewfinder = document.getElementById('viewfinder-area');
            const canvas = this.renderer.domElement;
            
            if (!viewfinder || !canvas) {
                console.error('📷 找不到取景框或画布');
                return;
            }
            
            // 先获取取景框位置
            const vfRect = viewfinder.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            
            // 计算取景框相对于画布的位置（像素）
            const cropX = Math.round((vfRect.left - canvasRect.left) * (canvas.width / canvasRect.width));
            const cropY = Math.round((vfRect.top - canvasRect.top) * (canvas.height / canvasRect.height));
            const cropWidth = Math.round(vfRect.width * (canvas.width / canvasRect.width));
            const cropHeight = Math.round(vfRect.height * (canvas.height / canvasRect.height));
            
            console.log('📷 取景框屏幕位置:', vfRect);
            console.log('📷 画布屏幕位置:', canvasRect);
            console.log('📷 画布内部分辨率:', canvas.width, 'x', canvas.height);
            console.log('📷 裁剪区域(像素):', { cropX, cropY, cropWidth, cropHeight });
            
            // 隐藏相机界面
            if (cameraFrame) cameraFrame.style.visibility = 'hidden';
            if (exitBtn) exitBtn.style.visibility = 'hidden';
            
            // [关键修复] 等待两帧：第一帧隐藏UI，第二帧重新渲染场景
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 拍照闪光效果
                    this.showFlashEffect();
                    
                    // 创建临时canvas进行裁剪（4:5比例）
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = this.photoWidth;
                    tempCanvas.height = this.photoHeight;
                    const ctx = tempCanvas.getContext('2d');
                    
                    // 从原始画布裁剪取景框区域，缩放到240x300（4:5）
                    ctx.drawImage(
                        canvas,
                        cropX, cropY, cropWidth, cropHeight,  // 源区域
                        0, 0, this.photoWidth, this.photoHeight   // 目标区域（4:5比例）
                    );
                    
                    const croppedImage = tempCanvas.toDataURL('image/jpeg', this.photoQuality);
                    
                    this.photos[dateKey] = croppedImage;
                    this.manualPhotoFlags[dateKey] = true;
                    this.savePhotos();
                    this.saveManualFlags();
                    
                    console.log(`📷 手动拍摄完成: ${dateKey}`);
                    
                    // 恢复相机界面
                    if (cameraFrame) cameraFrame.style.visibility = 'visible';
                    if (exitBtn) exitBtn.style.visibility = 'visible';
                    
                    // 退出拍照模式
                    this.exitPhotoMode();
                    
                    // 打开日记本，展示刚拍的照片
                    setTimeout(() => {
                        if (window.diaryManager) {
                            const diaryModal = document.getElementById('diary-modal');
                            const isHidden = diaryModal && (
                                diaryModal.classList.contains('hidden') || 
                                window.getComputedStyle(diaryModal).display === 'none'
                            );
                            
                            if (isHidden) {
                                window.toggleDiary();
                            } else {
                                window.diaryManager.renderPage();
                            }
                        }
                    }, 100);
                    
                    // 显示提示
                    if (window.updateStatusText) {
                        window.updateStatusText('📷 拍摄成功！');
                    }
                });
            });
        } catch (error) {
            console.error('拍照失败:', error);
            // 恢复相机界面
            const cameraFrame = document.getElementById('camera-frame-container');
            const exitBtn = document.getElementById('exit-photo-mode-btn');
            if (cameraFrame) cameraFrame.style.visibility = 'visible';
            if (exitBtn) exitBtn.style.visibility = 'visible';
        }
    }
    
    /**
     * 隐藏UI元素
     */
    hideUI() {
        // 保存当前UI状态（保存 CSS 类状态，而不是 display 值）
        const hudTopLeft = document.getElementById('hud-top-left');
        const hudBottomBar = document.getElementById('hud-bottom-bar');
        const debugPanel = document.getElementById('debug-panel');
        const shopPanel = document.getElementById('shop-panel-container');
        const contextMenu = document.getElementById('context-menu');
        const diaryModal = document.getElementById('diary-modal');
        const catBubble = document.getElementById('cat-bubble'); // 添加泡泡元素
        
        this.originalUIState = {
            // 日记和商店使用 CSS 类控制，保存类名状态
            diaryHidden: diaryModal ? diaryModal.classList.contains('hidden') : true,
            shopHidden: shopPanel ? shopPanel.classList.contains('hidden-bottom') : true,
            // 保存泡泡的显示状态
            bubbleHidden: catBubble ? catBubble.classList.contains('hidden') : true
        };
        
        console.log('📷 保存UI状态:', this.originalUIState);
        
        // 隐藏基础UI（这些使用内联样式即可）
        if (hudTopLeft) hudTopLeft.style.display = 'none';
        if (hudBottomBar) hudBottomBar.style.display = 'none';
        if (debugPanel) debugPanel.style.display = 'none';
        if (contextMenu) contextMenu.style.display = 'none';
        
        // 隐藏泡泡
        if (catBubble && !catBubble.classList.contains('hidden')) {
            catBubble.classList.add('hidden');
        }
        
        // 日记和商店使用 CSS 类隐藏
        if (diaryModal && !diaryModal.classList.contains('hidden')) {
            diaryModal.classList.add('hidden');
        }
        if (shopPanel && !shopPanel.classList.contains('hidden-bottom')) {
            shopPanel.classList.add('hidden-bottom');
        }
    }
    
    /**
     * 恢复UI元素
     */
    showUI() {
        console.log('📷 恢复UI状态:', this.originalUIState);
        
        // 恢复到进入拍照模式前的状态
        const hudTopLeft = document.getElementById('hud-top-left');
        const hudBottomBar = document.getElementById('hud-bottom-bar');
        const debugPanel = document.getElementById('debug-panel');
        const shopPanel = document.getElementById('shop-panel-container');
        const contextMenu = document.getElementById('context-menu');
        const diaryModal = document.getElementById('diary-modal');
        const catBubble = document.getElementById('cat-bubble'); // 添加泡泡元素
        
        // 恢复基础UI（清除内联样式，让CSS接管）
        if (hudTopLeft) hudTopLeft.style.display = '';
        if (hudBottomBar) hudBottomBar.style.display = '';
        if (debugPanel) debugPanel.style.display = '';
        if (contextMenu) contextMenu.style.display = '';
        
        // 恢复泡泡状态
        if (catBubble) {
            if (this.originalUIState.bubbleHidden) {
                catBubble.classList.add('hidden');
            } else {
                catBubble.classList.remove('hidden');
            }
        }
        
        // 日记：根据原始状态恢复 CSS 类
        if (diaryModal) {
            if (this.originalUIState.diaryHidden) {
                diaryModal.classList.add('hidden');
            } else {
                diaryModal.classList.remove('hidden');
            }
        }
        
        // 商店：根据原始状态恢复 CSS 类
        if (shopPanel) {
            if (this.originalUIState.shopHidden) {
                shopPanel.classList.add('hidden-bottom');
            } else {
                shopPanel.classList.remove('hidden-bottom');
            }
        }
    }
    
    /**
     * 拍照闪光效果
     */
    showFlashEffect() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: white;
            z-index: 99999;
            pointer-events: none;
            animation: flashFade 0.3s ease-out;
        `;
        
        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes flashFade {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(flash);
        setTimeout(() => {
            document.body.removeChild(flash);
            document.head.removeChild(style);
        }, 300);
    }
    
    /**
     * 调整图片大小
     */
    resizeImage(dataURL, width, height, callback) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // 计算裁剪区域（居中裁剪）
            const sourceSize = Math.min(img.width, img.height);
            const sx = (img.width - sourceSize) / 2;
            const sy = (img.height - sourceSize) / 2;
            
            ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = dataURL;
    }
    
    /**
     * 检查今天是否已有照片
     */
    hasTodayPhoto() {
        const dateKey = this.getCurrentDateKey();
        return !!this.photos[dateKey];
    }
    
    /**
     * 获取指定日期的照片
     */
    getPhoto(dateKey) {
        return this.photos[dateKey] || null;
    }
    
    /**
     * 获取当前日期键（YYYY-MM-DD）
     */
    getCurrentDateKey() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * 保存照片到LocalStorage
     */
    savePhotos() {
        try {
            // 清理超过30天的旧照片
            this.cleanOldPhotos();
            localStorage.setItem('catGamePhotos', JSON.stringify(this.photos));
        } catch (error) {
            console.error('保存照片失败:', error);
        }
    }
    
    /**
     * 从LocalStorage加载照片
     */
    loadPhotos() {
        try {
            const data = localStorage.getItem('catGamePhotos');
            if (data) {
                this.photos = JSON.parse(data);
                console.log(`📷 已加载 ${Object.keys(this.photos).length} 张照片`);
            }
        } catch (error) {
            console.error('加载照片失败:', error);
            this.photos = {};
        }
    }
    
    /**
     * 清理超过30天的旧照片
     */
    cleanOldPhotos() {
        const now = new Date();
        const cutoffTime = now.getTime() - (this.maxPhotoDays * 24 * 60 * 60 * 1000);
        
        for (const dateKey in this.photos) {
            const photoDate = new Date(dateKey);
            if (photoDate.getTime() < cutoffTime) {
                delete this.photos[dateKey];
                delete this.manualPhotoFlags[dateKey]; // 同时清理标记
                console.log(`📷 清理旧照片: ${dateKey}`);
            }
        }
    }
    
    /**
     * 保存手动拍照标记
     */
    saveManualFlags() {
        try {
            localStorage.setItem('catGameManualPhotoFlags', JSON.stringify(this.manualPhotoFlags));
        } catch (error) {
            console.error('保存手动拍照标记失败:', error);
        }
    }
    
    /**
     * 加载手动拍照标记
     */
    loadManualFlags() {
        try {
            const data = localStorage.getItem('catGameManualPhotoFlags');
            if (data) {
                this.manualPhotoFlags = JSON.parse(data);
            }
        } catch (error) {
            console.error('加载手动拍照标记失败:', error);
            this.manualPhotoFlags = {};
        }
    }
}
