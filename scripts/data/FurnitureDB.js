/**
 * FurnitureDB.js - 家具数据库
 * 包含所有可购买家具的配置信息
 * 
 * 墙面家具配置说明 (type: 'wall'):
 * - wallFace: 定义模型的哪一面是贴墙面，取值为:
 *   - 'back'   或 '+z' : 模型的背面(+Z方向)贴墙 (默认值)
 *   - 'front'  或 '-z' : 模型的正面(-Z方向)贴墙
 *   - 'left'   或 '-x' : 模型的左侧(-X方向)贴墙
 *   - 'right'  或 '+x' : 模型的右侧(+X方向)贴墙
 */

export const FURNITURE_DB = [
    // ==========================================
    // 1. 核心功能 (Functional)
    // ==========================================
    {
        id: 'food_bowl', name: '猫食盆', price: 50, type: 'functional', subType: 'food', color: 0xffffff,
        modelFile: 'FoodBowl_Empty.glb',
        fullModelFile: 'FoodBowl_Full.glb',
        modelScale: 0.3, fixBottom: true, size: { x: 0.5, y: 0.3, z: 0.5 }
    },
    {
        id: 'litter_box', name: '猫砂盆', price: 80, type: 'functional', subType: 'toilet', color: 0x888888,
        modelFile: 'LitterBox_Dirty.glb',
        fullModelFile: 'LitterBox_Clean.glb',
        modelScale: 0.5, fixBottom: true, size: { x: 1.0, y: 0.4, z: 1.0 }
    },

    // ==========================================
    // 2. 睡眠与休息 (Sleeping & Resting)
    // ==========================================
    { id: 'bed', type: 'floor', layer: 1, name: '猫窝', price: 40, color: 0xe67e22, size: { x: 1, y: 0.5, z: 0.8 }, modelFile: 'bed.glb', modelScale: 0.8, canSleep: true, fixBottom: true },
    { id: 'PetBed', type: 'floor', layer: 1, name: '竹编猫窝', price: 40, color: 0xe67e22, size: { x: 1, y: 0.5, z: 0.8 }, modelFile: 'PetBed.glb', modelScale: 0.6, canSleep: true, fixBottom: true },
    { id: 'PersonBed', type: 'floor', layer: 1, name: '木床', price: 100, color: 0xe74c3c, size: { x: 2, y: 1.2, z: 2 }, modelFile: 'PersonBed.glb', modelScale: 1.6, canSleep: true, fixBottom: true },
    { id: 'MidnightSlumber', type: 'floor', layer: 1, name: '黑色床', price: 100, color: 0xe74c3c, size: { x: 2, y: 1.2, z: 2 }, modelFile: 'Midnight_Slumber.glb', modelScale: 1.6, canSleep: true, fixBottom: true },

    { id: 'cat_tree', type: 'floor', layer: 1, name: '猫爬架', price: 100, color: 0x8e44ad, size: { x: 1, y: 1.8, z: 1 }, modelFile: 'cat_tree.glb', modelScale: 1.0, fixBottom: true },
    { id: 'CatPlayground', type: 'floor', layer: 1, name: '木制猫爬架', price: 100, color: 0x8e44ad, size: { x: 1, y: 1.8, z: 1 }, modelFile: 'CatPlayground.glb', modelScale: 1.0, fixBottom: true },
    { id: 'Cushion_Roundel', type: 'floor', layer: 1, name: '圆垫子', price: 40, color: 0xe67e22, size: { x: 1, y: 0.2, z: 0.8 }, modelFile: 'Cushion_Roundel.glb', modelScale: 0.5, canSleep: true, fixBottom: true },
    { id: 'swing', type: 'floor', layer: 1, name: '秋千', price: 150, color: 0xe67e22, size: { x: 1.5, y: 0.6, z: 0.8 }, modelFile: 'swing.glb', modelScale: 0.1, canSleep: true, fixBottom: true },

    // ==========================================
    // 3. 座椅与沙发 (Seating)
    // ==========================================
    { id: 'sofa', type: 'floor', layer: 1, name: '大沙发', price: 150, color: 0xe74c3c, size: { x: 3, y: 1, z: 1 }, modelFile: 'sofa.glb', modelScale: 2.0, canSleep: true, fixBottom: true },
    { id: 'ArmChair', type: 'floor', layer: 1, name: '扶手椅', price: 150, color: 0xe74c3c, size: { x: 1.2, y: 1, z: 1.2 }, modelFile: 'ArmChair.glb', modelScale: 1.0, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.1 } },
    { id: 'CozyChair', type: 'floor', layer: 1, name: '单人沙发', price: 150, color: 0xe74c3c, size: { x: 1.2, y: 1, z: 1.2 }, modelFile: 'CozyChair.glb', modelScale: 0.9, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.1 } },
    { id: 'ArmChair2', type: 'floor', layer: 1, name: '绿色椅子', price: 100, color: 0xe74c3c, size: { x: 1.2, y: 0.6, z: 1.2 }, modelFile: 'Chair.glb', modelScale: 0.8, canSleep: true, fixBottom: true },
    { id: 'Chair_Comfort', type: 'floor', layer: 1, name: '摇摇椅', price: 100, color: 0xe74c3c, size: { x: 1, y: 0.6, z: 1 }, modelFile: 'Chair_Comfort.glb', modelScale: 0.8, canSleep: true, fixBottom: true },
    { id: 'cozy_computer_chair', type: 'floor', layer: 1, name: '舒适电脑椅', price: 120, color: 0x3498db, size: { x: 0.5, y: 0.8, z: 0.5 }, modelFile: 'cozycomputerchair.glb', modelScale: 1.5, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.15 } },
    { id: 'wooden_chair', type: 'floor', layer: 1, name: '木椅子', price: 60, color: 0x8d6e63, size: { x: 0.5, y: 0.8, z: 0.5 }, modelFile: 'woodenchair.glb', modelScale: 1.2, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.1 } },
    { id: 'red_plaid_loveseat', type: 'floor', layer: 1, name: '红格子双人沙发', price: 150, color: 0xe74c3c, size: { x: 2, y: 1, z: 1 }, modelFile: 'Red_plaid_loveseat.glb', modelScale: 1.5, canSleep: true, fixBottom: true },
    { id: 'red_plaid_armchair', type: 'floor', layer: 1, name: '红格子单人沙发', price: 100, color: 0xe74c3c, size: { x: 1, y: 0.8, z: 1 }, modelFile: 'Red_plaid_armchair.glb', modelScale: 0.8, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.15 } },
    { id: 'beige_check_sofa_small', type: 'floor', layer: 1, name: '米色卡座', price: 100, color: 0xf5f5dc, size: { x: 1.5, y: 0.7, z: 1 }, modelFile: 'Beige_Checkerboard_Sofa_Small.glb', modelScale: 1.0, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.2 } },
    { id: 'cozy_reading_nook', type: 'floor', layer: 1, name: '舒适阅读角', price: 200, color: 0x8d6e63, size: { x: 1.5, y: 0.7, z: 0.7 }, modelFile: 'Cozy_Reading_Nook.glb', modelScale: 1.5, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.25 } },
    { id: 'orange_tufted_round_chair', type: 'floor', layer: 1, name: '橙色小圆椅', price: 100, color: 0xe67e22, size: { x: 0.8, y: 0.6, z: 0.8 }, modelFile: 'Orange_Tufted_Round_Chair.glb', modelScale: 0.6, canSleep: true, fixBottom: true },
    { id: 'swivel_office_chair', type: 'floor', layer: 1, name: '电脑椅', price: 150, color: 0x333333, size: { x: 0.6, y: 1.2, z: 0.6 }, modelFile: 'Ergonomic_Swivel_OfficeChair.glb', modelScale: 0.8, canSleep: true, fixBottom: true, sleepOffset: { x: 0, y: 0, z: 0.15 } },

    // ==========================================
    // 4. 桌子 (Tables)
    // ==========================================
    { id: 'table', type: 'floor', layer: 1, isSurface: true, surfaceHeight: 0.8, name: '木桌', price: 60, color: 0x8d6e63, size: { x: 1.5, y: 0.6, z: 1.5 }, modelFile: 'table.glb', modelScale: 1.0, fixBottom: true },
    { id: 'TeaSetTable', type: 'floor', layer: 1, name: '茶台', price: 100, color: 0xe74c3c, size: { x: 1.2, y: 1, z: 1.2 }, modelFile: 'TeaSetTable.glb', modelScale: 0.6, canSleep: false, fixBottom: true },
    { id: 'TelevisionTable', type: 'floor', layer: 1, name: '电视柜', price: 100, color: 0xe74c3c, size: { x: 1.2, y: 1, z: 1.2 }, modelFile: 'TelevisionTable.glb', modelScale: 1.5, canSleep: false, fixBottom: true },
    { id: 'Tabletop', type: 'floor', layer: 1, isSurface: true, name: '绿色小桌', price: 40, color: 0xe67e22, size: { x: 0.8, y: 0.8, z: 0.8 }, modelFile: 'Tabletop.glb', modelScale: 0.5, canSleep: false, fixBottom: true },
    { id: 'FlowerStool', type: 'floor', layer: 1, isSurface: true, name: '小花桌', price: 40, color: 0xe67e22, size: { x: 0.8, y: 0.8, z: 0.8 }, modelFile: 'FlowerStool.glb', modelScale: 0.5, canSleep: false, fixBottom: true },
    { id: 'wooden_dining_table', type: 'floor', layer: 1, isSurface: true, name: '木餐桌', price: 100, color: 0x8d6e63, size: { x: 1.5, y: 1, z: 1.5 }, modelFile: 'woodendiningtable.glb', modelScale: 1.8, fixBottom: true },
    { id: 'dining_table', type: 'floor', layer: 1, isSurface: true, name: '方形餐桌', price: 100, color: 0xffffff, size: { x: 1.5, y: 0.8, z: 1.5 }, modelFile: 'diningtable.glb', modelScale: 1.5, fixBottom: true },
    { id: 'study_desk', type: 'floor', layer: 1, isSurface: true, name: '学习桌', price: 120, color: 0x95a5a6, size: { x: 1.2, y: 1, z: 0.8 }, modelFile: 'studydesk.glb', modelScale: 0.12, fixBottom: true },
    { id: 'table_stainless', type: 'floor', layer: 1, isSurface: true, name: '不锈钢桌', price: 80, color: 0xbdc3c7, size: { x: 1.2, y: 0.8, z: 0.8 }, modelFile: 'tablestainess.glb', modelScale: 0.1, fixBottom: true },
    { id: 'wooden_table_small', type: 'floor', layer: 1, isSurface: true, name: '床头柜', price: 60, color: 0x8d6e63, size: { x: 0.8, y: 0.6, z: 0.8 }, modelFile: 'woodentablesmall.glb', modelScale: 0.08, fixBottom: true },
    { id: 'work_table', type: 'floor', layer: 1, isSurface: true, name: '工作台', price: 120, color: 0x34495e, size: { x: 1.5, y: 1, z: 1 }, modelFile: 'worktable.glb', modelScale: 0.1, fixBottom: true },
    { id: 'kitchen_island_small', type: 'floor', layer: 1, isSurface: true, name: '小岛台', price: 150, color: 0xffffff, size: { x: 1.2, y: 1, z: 1 }, modelFile: 'kitchenislandsmall.glb', modelScale: 1.2, fixBottom: true },
    { id: 'monolithic_black_table', type: 'floor', layer: 1, isSurface: true, name: '黑色方桌', price: 130, color: 0x1a1a1a, size: { x: 1.5, y: 1, z: 1.5 }, modelFile: 'Monolithic_Black_Table.glb', modelScale: 1.2, fixBottom: true },
    { id: 'black_square_table', type: 'floor', layer: 1, isSurface: true, name: '黑色边几', price: 80, color: 0x1a1a1a, size: { x: 0.8, y: 0.8, z: 0.8 }, modelFile: 'Black_square_table.glb', modelScale: 0.6, fixBottom: true },
    { id: 'obsidian_coffee_table', type: 'floor', layer: 1, isSurface: true, name: '黑曜石茶几', price: 100, color: 0x111111, size: { x: 1.5, y: 0.6, z: 0.8 }, modelFile: 'Obsidian_Coffee_Table.glb', modelScale: 0.9, fixBottom: true },
    { id: 'natural_oak_coffee_table', type: 'floor', layer: 1, isSurface: true, name: '原木咖啡桌', price: 100, color: 0x8d6e63, size: { x: 1.5, y: 0.6, z: 0.8 }, modelFile: 'Natural_Oak_Coffee_Table.glb', modelScale: 1.0, fixBottom: true },

    // ==========================================
    // 5. 储物与柜子 (Storage)
    // ==========================================
    { id: 'Closet', type: 'floor', layer: 1, name: '衣柜', price: 40, color: 0xe67e22, size: { x: 2, y: 3.0, z: 0.8 }, modelFile: 'Closet.glb', modelScale: 1.6, canSleep: false, fixBottom: true },
    { id: 'Cabinet', type: 'floor', layer: 1, isSurface: true, name: '矮柜', price: 40, color: 0xe67e22, size: { x: 1, y: 1, z: 0.8 }, modelFile: 'Cabinet.glb', modelScale: 0.5, canSleep: false, fixBottom: true },
    { id: 'WoodenCabi', type: 'floor', layer: 1, isSurface: true, name: '矮木柜', price: 40, color: 0xe67e22, size: { x: 1.5, y: 1.2, z: 0.8 }, modelFile: 'WoodenCabi.glb', modelScale: 0.8, canSleep: false, fixBottom: true },
    { id: 'GreenCabinet', type: 'floor', layer: 1, isSurface: true, name: '绿柜子', price: 40, color: 0xe67e22, size: { x: 1.5, y: 1.6, z: 1 }, modelFile: 'GreenCabinet.glb', modelScale: 1.0, canSleep: false, fixBottom: true },
    { id: 'BathroomCabinet', type: 'floor', layer: 1, isSurface: true, name: '洗手池', price: 40, color: 0xe67e22, size: { x: 1.2, y: 1.3, z: 1.2 }, modelFile: 'BathroomCabinet.glb', modelScale: 1.0, canSleep: false, fixBottom: true },
    { id: 'book_shelf', type: 'floor', layer: 1, name: '书架', price: 100, color: 0x8e44ad, size: { x: 2, y: 2, z: 1 }, modelFile: 'book_shelf.glb', modelScale: 1.0, fixBottom: true, isSurface: true, surfaceHeight: 2.0 },
    { id: 'kitchencabinet', type: 'floor', layer: 1, isSurface: true, name: '橱柜', price: 150, color: 0xffffff, size: { x: 1.2, y: 1, z: 1 }, modelFile: 'kitchencabinet.glb', modelScale: 2.0, fixBottom: true },
    { id: 'wooden_chest', type: 'floor', layer: 1, isSurface: true, name: '矮木柜', price: 80, color: 0x8d6e63, size: { x: 1, y: 0.8, z: 0.8 }, modelFile: 'woodenchest.glb', modelScale: 0.1, fixBottom: true },
    { id: 'kitchen_sink', type: 'floor', layer: 1, name: '厨房水槽', price: 150, color: 0xbdc3c7, size: { x: 1.2, y: 1, z: 0.8 }, modelFile: 'kitchensink.glb', modelScale: 1.5, fixBottom: true },
    { id: 'laundry_basket', type: 'floor', layer: 1, name: '脏衣篮', price: 30, color: 0xf39c12, size: { x: 0.8, y: 0.6, z: 0.8 }, modelFile: 'wovenbasket.glb', modelScale: 1.0, canSleep: true, fixBottom: true },
    { id: 'wooden_bookshelf', type: 'floor', layer: 1, isSurface: true, name: '木质小书架', price: 80, color: 0x8d6e63, size: { x: 0.8, y: 2, z: 1.5 }, modelFile: 'wooden_bookshelf.glb', modelScale: 2.0, canSleep: false, fixBottom: true },
    { id: 'six_drawer_dresser', type: 'floor', layer: 1, isSurface: true, name: '黑色六屉柜', price: 160, color: 0x222222, size: { x: 1.5, y: 1, z: 0.6 }, modelFile: 'Six_Drawer_Dresser.glb', modelScale: 1.0, fixBottom: true },
    { id: 'wooden_two_door_dresser', type: 'floor', layer: 1, isSurface: true, name: '木质玩具柜', price: 130, color: 0x8d6e63, size: { x: 1.2, y: 1.2, z: 0.6 }, modelFile: 'Wooden_two_door_toydresser.glb', modelScale: 0.8, fixBottom: true },

    // ==========================================
    // 6. 家电 (Appliances)
    // ==========================================
    { id: 'Television', type: 'floor', layer: 1, name: '电视', price: 100, color: 0x8e44ad, size: { x: 1.9, y: 1.5, z: 0.8 }, modelFile: 'Television.glb', modelScale: 2.0, fixBottom: true },
    { id: 'tv_retro', type: 'floor', layer: 1, name: '复古电视', price: 200, color: 0x2c3e50, size: { x: 1, y: 1, z: 0.6 }, modelFile: 'tvretro.glb', modelScale: 1.0, fixBottom: true },
    { id: 'stereo_retro', type: 'floor', layer: 1, name: '复古音响', price: 180, color: 0x2c3e50, size: { x: 0.8, y: 1, z: 0.6 }, modelFile: 'stereoretro.glb', modelScale: 0.1, fixBottom: true },
    { id: 'frigerator', type: 'floor', layer: 1, name: '冰箱', price: 100, color: 0x8d6e63, size: { x: 1, y: 1.8, z: 1 }, modelFile: 'frigerator.glb', modelScale: 1.0, isSurface: true, fixBottom: true },
    { id: 'black_two_door_fridge', type: 'floor', layer: 1, name: '黑色冰箱', price: 250, color: 0x111111, size: { x: 1, y: 2.3, z: 0.8 }, modelFile: 'Black_Two_Door_frigerator.glb', modelScale: 1.2, isSurface: true, fixBottom: true },
    { id: 'RobotVacuum', type: 'floor', layer: 1, name: '扫地机器人', price: 100, color: 0x8d6e63, size: { x: 0.8, y: 0.3, z: 0.8 }, modelFile: 'RobotVacuum.glb', modelScale: 0.5, fixBottom: true, isVehicle: true, moveSpeed: 1.5 },
    { id: 'retro_crt_tv', type: 'floor', layer: 1, name: '复古老电视', price: 180, color: 0x222222, size: { x: 0.8, y: 1.2, z: 0.6 }, modelFile: 'Retro_CRT_TV_on_tripoleg.glb', modelScale: 0.6, fixBottom: true },

    // ==========================================
    // 7. 大型装饰 (Large Decor & Plants)
    // ==========================================
    { id: 'Go_Board', type: 'floor', layer: 1, name: '围棋', price: 100, color: 0xe67e22, size: { x: 1, y: 0.6, z: 1 }, modelFile: 'Go_Board.glb', modelScale: 1.2, canSleep: true, fixBottom: true },
    { id: 'Folding_Screen', type: 'floor', layer: 1, name: '屏风', price: 100, color: 0xe74c3c, size: { x: 1.2, y: 1, z: 1.2 }, modelFile: 'Folding_Screen.glb', modelScale: 2, canSleep: false, fixBottom: true },
    { id: 'fireplace', type: 'floor', layer: 1, name: '壁炉', price: 100, color: 0x8d6e63, size: { x: 1.5, y: 1.5, z: 1 }, modelFile: 'fireplace.glb', modelScale: 3.0, fixBottom: true },
    {
        id: 'ChrismasTree',
        type: 'floor',
        layer: 1,
        name: '圣诞树',
        price: 100,
        color: 0x8d6e63,
        size: { x: 1.5, y: 2, z: 1.5 },
        modelFile: 'ChrismasTree2.glb',
        modelScale: 1.5,
        fixBottom: true,
        light: true,
        lightType: 'point',
        lightOffset: { x: 0, y: 1.8, z: 0 }
    },
    { id: 'CafeTree', type: 'floor', layer: 1, name: '大盆栽', price: 100, color: 0x8e44ad, size: { x: 1, y: 2, z: 1 }, modelFile: 'CafeTree.glb', modelScale: 1.0, fixBottom: true },
    { id: 'PottedGreenPlant', type: 'floor', layer: 1, name: '大盆栽', price: 100, color: 0x8e44ad, size: { x: 1, y: 2, z: 1 }, modelFile: 'PottedGreenPlant.glb', modelScale: 1.0, fixBottom: true },
    { id: 'GreenPlant', type: 'floor', layer: 1, name: '盆栽', price: 100, color: 0x8e44ad, size: { x: 1, y: 2, z: 1 }, modelFile: 'GreenPlant.glb', modelScale: 1.0, fixBottom: true },
    { id: 'OrangeTree', type: 'floor', layer: 1, name: '橘子盆摘', price: 100, color: 0x8e44ad, size: { x: 1, y: 2, z: 1 }, modelFile: 'OrangeTree.glb', modelScale: 1.5, fixBottom: true },
    { id: 'wooden_standing_mirror', type: 'floor', layer: 1, name: '穿衣镜', price: 80, color: 0x8d6e63, size: { x: 0.8, y: 1.8, z: 0.8 }, modelFile: 'Wooden_Standing_Mirro.glb', modelScale: 1.2, fixBottom: true },

    // ==========================================
    // 8. 地毯 (Rugs)
    // ==========================================
    { id: 'rug', type: 'floor', layer: 0, name: '圆地毯', price: 50, color: 0x3498db, size: { x: 2, y: 0.02, z: 2 }, modelFile: 'RoundRug.glb', modelScale: 1.5, yFix: 0.02, autoCenter: true },
    { id: 'rug_squre', type: 'floor', layer: 0, name: '方地毯', price: 50, color: 0x3498db, size: { x: 2, y: 0.02, z: 2 }, modelFile: 'rug_squre.glb', modelScale: 1.5, yFix: 0.02, autoCenter: true },

    // ==========================================
    // 9. 小型物品 (Small Items)
    // ==========================================
    // 饮食
    { id: 'mug', type: 'small', layer: 2, name: '马克杯', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'mug.glb', modelScale: 0.2, fixBottom: true },
    { id: 'DalMug', type: 'small', layer: 2, name: '马克杯蓝', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'DalMug.glb', modelScale: 0.8, fixBottom: true },
    { id: 'CoffeeCup', type: 'small', layer: 2, name: '咖啡杯', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'CoffeeCup.glb', modelScale: 0.8, fixBottom: true },
    { id: 'PumpkinDrink', type: 'small', layer: 2, name: '南瓜咖啡', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'PumpkinDrink.glb', modelScale: 0.2, fixBottom: true },
    { id: 'GlassCoffee', type: 'small', layer: 2, name: '冰咖啡', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'GlassCoffee.glb', modelScale: 0.1, fixBottom: true },
    { id: 'teaset_luxury', type: 'small', layer: 2, name: '豪华茶具', price: 60, color: 0xf1c40f, size: { x: 0.4, y: 0.3, z: 0.4 }, modelFile: 'teasetluxury.glb', modelScale: 0.1, fixBottom: true },
    { id: 'teaset_china', type: 'small', layer: 2, name: '中式茶具', price: 60, color: 0xffffff, size: { x: 0.4, y: 0.3, z: 0.4 }, modelFile: 'teasechina.glb', modelScale: 0.1, fixBottom: true },

    // 杂物
    { id: 'BlossomVase', type: 'small', layer: 2, name: '小花瓶', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'BlossomVase.glb', modelScale: 0.3, fixBottom: true },
    { id: 'Phonograph', type: 'small', layer: 2, name: '唱片机', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'Phonograph.glb', modelScale: 0.5, fixBottom: true },
    { id: 'WovenElegance', type: 'small', layer: 2, name: '竹编包', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'WovenElegance.glb', modelScale: 0.3, fixBottom: true },
    { id: 'bouquet', type: 'small', layer: 2, name: '花束', price: 100, color: 0xecf0f1, size: { x: 0.2, y: 0.1, z: 0.2 }, modelFile: 'bouquet.glb', modelScale: 0.8, fixBottom: true },
    { id: 'sugar_jar', type: 'small', layer: 2, name: '糖罐', price: 5, color: 0xffffff, size: { x: 0.2, y: 0.2, z: 0.2 }, modelFile: 'Sugar_Jar.glb', modelScale: 0.25, fixBottom: true },
    { id: 'study_essentials', type: 'small', layer: 2, name: '学习用品', price: 15, color: 0xffffff, size: { x: 0.4, y: 0.2, z: 0.4 }, modelFile: 'Study_Essentials.glb', modelScale: 0.4, fixBottom: true },
    { id: 'book_stack', type: 'small', layer: 2, name: '一叠书', price: 10, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'book_stack.glb', modelScale: 0.2, fixBottom: true },
    { id: 'row_of_miniature_book', type: 'small', layer: 2, name: '整排书', price: 15, color: 0xffffff, size: { x: 0.5, y: 0.3, z: 0.2 }, modelFile: 'Row_of_Miniature_Book.glb', modelScale: 0.5, fixBottom: true },
    { id: 'open_book', type: 'small', layer: 2, name: '打开的书', price: 10, color: 0xffffff, size: { x: 0.4, y: 0.1, z: 0.3 }, modelFile: 'Open_Book.glb', modelScale: 0.3, fixBottom: true },
    { id: 'black_bookshelf_speaker', type: 'small', layer: 2, name: '黑色音箱', price: 80, color: 0x1a1a1a, size: { x: 0.4, y: 0.6, z: 0.3 }, modelFile: 'Black_bookshelf_speak.glb', modelScale: 0.4, fixBottom: true },

    // 玩具
    { id: 'ToyCarrot', type: 'small', layer: 2, name: '胡萝卜', price: 5, color: 0xffffff, size: { x: 0.3, y: 0.3, z: 0.3 }, modelFile: 'Carrot.glb', modelScale: 0.3, fixBottom: true, isToy: true },
    { id: 'CrochetedCarrot', type: 'small', layer: 2, name: '编织胡萝卜', price: 25, color: 0xffffff, size: { x: 0.4, y: 0.3, z: 0.4 }, modelFile: 'crochetedcarrot.glb', modelScale: 0.6, fixBottom: true, isToy: true, proximityAudio: 'nicejob', audioCooldown: 0.5 },
    { id: 'TissueBox', type: 'small', layer: 2, name: '抽纸盒', price: 20, color: 0xffffff, size: { x: 0.4, y: 0.3, z: 0.4 }, modelFile: 'tissuebox.glb', modelScale: 0.6, fixBottom: true, isToy: true, proximityAudio: 'nicejob', audioCooldown: 0.5 },

    { id: 'cute_white_bird', type: 'small', layer: 2, name: '小白鸟', price: 80, color: 0xffffff, size: { x: 0.2, y: 0.2, z: 0.2 }, modelFile: 'cutewhitebird.glb', modelScale: 1.0, fixBottom: true, isCushion: true },

    // 数码
    { id: 'nintendo_switch_dock', type: 'small', layer: 2, name: 'NintendoSwitch（动森版）', price: 300, color: 0x333333, size: { x: 0.3, y: 0.2, z: 0.1 }, modelFile: 'nintendoswitchdock.glb', modelScale: 0.1, fixBottom: true },
    { id: 'nintendo_switch_body', type: 'small', layer: 2, name: 'NintendoSwitch2', price: 500, color: 0xe74c3c, size: { x: 0.3, y: 0.2, z: 0.1 }, modelFile: 'nintendoswitch2.glb', modelScale: 0.8, fixBottom: true },
    { id: 'playstation5', type: 'small', layer: 2, name: 'Playstation5', price: 500, color: 0xe74c3c, size: { x: 0.3, y: 0.2, z: 0.1 }, modelFile: 'playstation5.glb', modelScale: 1, fixBottom: true },
    { id: 'game_controller', type: 'small', layer: 2, name: '游戏手柄', price: 80, color: 0xecf0f1, size: { x: 0.2, y: 0.1, z: 0.2 }, modelFile: 'gamecontroller.glb', modelScale: 0.5, fixBottom: true, isToy: true },
    { id: 'catear_computer_pink', type: 'small', layer: 2, name: '粉色电脑', price: 200, color: 0xffc0cb, size: { x: 0.5, y: 0.5, z: 0.4 }, modelFile: 'catearcomputerpink.glb', modelScale: 0.7, fixBottom: true },

    // 灯具
    {
        id: 'ChrismasTree_Small',
        type: 'small',
        layer: 2,
        name: '小圣诞树',
        price: 5,
        color: 0xffffff,
        size: { x: 0.3, y: 0.3, z: 0.3 },
        modelFile: 'ChrismasTree_Small.glb',
        modelScale: 1.0,
        fixBottom: true,
        light: true,
        lightType: 'point',
        lightOffset: { x: 0, y: 0.25, z: 0 }
    },
    { id: 'lamp', type: 'small', layer: 2, name: '台灯', price: 25, color: 0xf1c40f, size: { x: 0.4, y: 0.6, z: 0.4 }, light: true, lightType: 'point', modelFile: 'lamp.glb', modelScale: 1.0, fixBottom: true },
    { id: 'tiffany_lamp', type: 'small', layer: 2, name: '精致台灯', price: 25, color: 0xf1c40f, size: { x: 0.4, y: 0.6, z: 0.4 }, light: true, lightType: 'point', modelFile: 'tiffany_lamp.glb', modelScale: 0.4, fixBottom: true },
    { id: 'floor_lamp', type: 'small', layer: 2, name: '落地灯', price: 25, color: 0xf1c40f, size: { x: 0.4, y: 0.6, z: 0.4 }, light: true, lightType: 'point', modelFile: 'floor_lamp.glb', modelScale: 1.0, fixBottom: true, lightOffset: { x: 0, y: 1.8, z: 0 } },
    { id: 'cutelamp', type: 'small', layer: 2, name: '可爱落地灯', price: 25, color: 0xf1c40f, size: { x: 0.4, y: 0.6, z: 0.4 }, light: true, lightType: 'point', modelFile: 'cutelamp.glb', modelScale: 1.0, fixBottom: true, lightOffset: { x: 0, y: 1.8, z: 0 } },
    { id: 'Cupboardlamp', type: 'small', layer: 2, name: '柜子灯', price: 25, color: 0xf1c40f, size: { x: 0.4, y: 0.6, z: 0.4 }, light: true, lightType: 'point', modelFile: 'Cupboardlamp.glb', modelScale: 0.6, fixBottom: true, lightOffset: { x: 0, y: 1.8, z: 0 } },
    { id: 'desk_lamp', type: 'small', layer: 2, name: '现代台灯', price: 40, color: 0x333333, size: { x: 0.3, y: 0.4, z: 0.3 }, light: true, lightType: 'point', modelFile: 'Desk_Lamp.glb', modelScale: 0.6, fixBottom: true, lightOffset: { x: 1, y: 1, z: 0 } },

    // ==========================================
    // 10. 壁挂 (Wall Items)
    // ==========================================
    { id: 'wall_plant', type: 'wall', layer: 1, name: '壁挂植物', price: 20, color: 0x2ecc71, size: { x: 2, y: 0.5, z: 0.5 }, modelFile: 'wall_plant.glb', modelScale: 0.8 },
    { id: 'WallBooksShelf', type: 'wall', layer: 1, name: '壁挂书架', price: 20, color: 0x2ecc71, size: { x: 2, y: 0.5, z: 0.5 }, modelFile: 'WallBooksShelf.glb', modelScale: 0.6 },
    { id: 'WoodenCabinet', type: 'wall', layer: 1, name: '壁柜', price: 20, color: 0x2ecc71, size: { x: 0.5, y: 0.5, z: 2.0 }, modelFile: 'WoodenCabinet.glb', wallFace: 'left', modelScale: 0.8 },
    { id: 'green_cupboard', type: 'wall', layer: 1, name: '绿色橱柜', price: 30, color: 0x2ecc71, size: { x: 0.8, y: 0.7, z: 0.5 }, modelFile: 'Green_Cupboard.glb', modelScale: 0.4 },
    { id: 'mini_two_tier_bottle', type: 'wall', layer: 1, name: '双层调料架', price: 20, color: 0xffffff, size: { x: 0.2, y: 0.3, z: 0.2 }, modelFile: 'Miniature_two_tier_bottle.glb', modelScale: 0.5 },

    { id: 'WallClock', type: 'wall', layer: 1, name: '挂钟', price: 20, color: 0x2ecc71, size: { x: 0.6, y: 0.5, z: 0.5 }, modelFile: 'WallClock.glb', modelScale: 0.5 },
    { id: 'CalligraphyFu', type: 'wall', layer: 1, name: '春节福', price: 20, color: 0x2ecc71, size: { x: 0.6, y: 0.5, z: 0.5 }, modelFile: 'CalligraphyFu.glb', modelScale: 0.5, wallOffset: -0.22, allowOverlap: true },
    { id: 'XingshiMask', type: 'wall', layer: 1, name: '醒狮面具', price: 20, color: 0x2ecc71, size: { x: 0.6, y: 0.5, z: 0.5 }, modelFile: 'XingshiMask.glb', modelScale: 0.5 },
    { id: 'RedKnot', type: 'wall', layer: 1, name: '中国结', price: 20, color: 0x2ecc71, size: { x: 0.6, y: 0.5, z: 0.5 }, modelFile: 'RedKnot.glb', modelScale: 0.5 },
    { id: 'painting', type: 'wall', layer: 1, name: '风景画', price: 50, color: 0xFFD700, size: { x: 1, y: 1, z: 0.1 }, modelFile: 'painting.glb', modelScale: 1.0 },
    { id: 'curtain', type: 'wall', layer: 1, name: '窗帘', price: 80, color: 0xFFFFFF, size: { x: 2.0, y: 2.0, z: 0.5 }, modelFile: 'curtain.glb', modelScale: 1.5, autoCenter: true, allowOverlap: true },
    { id: 'red_plaid_curtains', type: 'wall', layer: 1, name: '红格子窗帘', price: 80, color: 0xe74c3c, size: { x: 2.0, y: 2.0, z: 0.5 }, modelFile: 'Red_plaid_curtains.glb', modelScale: 1.2, autoCenter: true, allowOverlap: true },
    { id: 'wall_star', type: 'wall', layer: 1, name: '星星挂饰', price: 30, color: 0xFFFF00, size: { x: 0.5, y: 0.5, z: 0.5 }, modelFile: 'WallDecorate_Star.glb', modelScale: 1.0, autoCenter: true, allowOverlap: true },
    { id: 'ChrismaxSock', type: 'wall', layer: 1, name: '圣诞袜', price: 30, color: 0xFFFF00, size: { x: 0.5, y: 0.5, z: 0.5 }, modelFile: 'ChrismaxSock.glb', modelScale: 1.0, autoCenter: true, allowOverlap: true },
    { id: 'window', type: 'wall', layer: 1, name: '圆角窗', price: 120, color: 0x87CEEB, size: { x: 1.8, y: 1.8, z: 0.2 }, light: true, lightType: 'spot', modelFile: 'window_large.glb', autoCenter: true, modelScale: 1, manualOffset: { x: 0, y: 0, z: 0 } },
    { id: 'window2', type: 'wall', layer: 1, name: '平窗', price: 120, color: 0x87CEEB, size: { x: 1.8, y: 2, z: 0.2 }, light: true, lightType: 'spot', modelFile: 'Window2.glb', modelScale: 1, autoCenter: true },
    { id: 'black_square_window', type: 'wall', layer: 1, name: '黑色方窗户', price: 60, color: 0x1a1a1a, size: { x: 1.8, y: 2, z: 0.1 }, light: true, lightType: 'spot', modelFile: 'Black_Square_WindowFrame.glb', modelScale: 1.0, autoCenter: true },
    { id: 'terrarium_wall', type: 'wall', layer: 1, name: '壁挂生态瓶', price: 50, color: 0x27ae60, size: { x: 0.5, y: 0.5, z: 0.2 }, modelFile: 'terrariumwall.glb', modelScale: 0.1 },
    {
        id: 'bird_on_stand',
        type: 'wall',
        layer: 1,
        name: '木架小鸟',
        price: 40,
        color: 0x8d6e63,
        size: { x: 0.4, y: 0.6, z: 0.3 },
        modelFile: 'cutewhitebirdstandonwood.glb',
        modelScale: 0.8,
        // [Fix] Rotate 180 degrees to face away from wall
        manualRotation: { x: 0, y: Math.PI, z: 0 }
    },
    {
        id: 'door',
        type: 'wall',
        layer: 1,
        name: '门',
        price: 100,
        color: 0x8d6e63,
        size: { x: 1, y: 2, z: 0.2 },
        modelFile: 'door.glb',
        modelScale: 0.12,
        // [Fix] Wall type to snap to wall, wallOffset to bring closer (ignore handle)
        wallOffset: -0.05,
        // [New] Force to snap to floor (y = size.y / 2)
        snapToFloor: true,
        // [Fix] Center model vertically so it aligns with pivot (at h/2) instead of floating
        autoCenter: true
    },
    { id: 'green_cuckoo_clock', type: 'wall', layer: 1, name: '布谷鸟钟', price: 30, color: 0x2ecc71, size: { x: 0.5, y: 0.8, z: 0.3 }, modelFile: 'Green_Cuckoo_Clock.glb', modelScale: 0.5 },

    // ==========================================
    // 11. 装修 (Renovation)
    // ==========================================
    // 装饰类型 - 地板
    { id: 'floor_default', type: 'decor', name: '经典米色', price: 0, color: 0xF5F5DC, decorType: 'floor' },
    { id: 'floor_wood', type: 'decor', name: '木纹地板', price: 50, color: 0x8d6e63, decorType: 'floor', textureFile: 'WoodenFloor.jpg' },
    { id: 'floor_tile', type: 'decor', name: '浅色木地板', price: 50, color: 0xdbc2a3, decorType: 'floor', textureFile: 'tile.jpg' },
    { id: 'floor_plank', type: 'decor', name: '原木板地板', price: 60, color: 0x9e7b5d, decorType: 'floor', textureFile: 'plank_flooring_04_diff_1k.jpg' },
    { id: 'floor_flower', type: 'decor', name: '花砖地板', price: 80, color: 0xe8d4c4, decorType: 'floor', textureFile: 'FlowerFloor.png' },
    { id: 'floor_darkwood', type: 'decor', name: '深色木地板', price: 70, color: 0x5d4037, decorType: 'floor', textureFile: 'wood.jpg' },
    { id: 'floor_black', type: 'decor', name: '黑色地板', price: 30, color: 0x161616, decorType: 'floor' },
    { id: 'floor_brown', type: 'decor', name: '棕色地板', price: 30, color: 0x4e360a, decorType: 'floor' },
    { id: 'floor_lightgreen', type: 'decor', name: '浅绿色地板', price: 30, color: 0xa7b175, decorType: 'floor' },

    // [New] 近期新增地板
    { id: 'floor_WhiteBrownGrid', type: 'decor', name: '白棕格子地板', price: 60, color: 0xffffff, decorType: 'floor', textureFile: 'WhiteBrownGridFloor.png', wallpaperUnitWidth: 0.5 },
    { id: 'floor_BlackWhiteGridFloor', type: 'decor', name: '黑白格子地板', price: 60, color: 0xffffff, decorType: 'floor', textureFile: 'BlackWhiteGridFloor.png', wallpaperUnitWidth: 0.8 },
    { id: 'floor_WoodFloor', type: 'decor', name: '明木纹地板', price: 60, color: 0xffffff, decorType: 'floor', textureFile: 'WoodFloor.png', wallpaperUnitWidth: 0.8 },

    // 装饰类型 - 墙壁
    { id: 'wall_default', type: 'decor', name: '经典暖灰', price: 0, color: 0xEBE5D1, decorType: 'wall' },
    { id: 'wall_pink', type: 'decor', name: '温馨粉墙', price: 50, color: 0xc9a2a6, decorType: 'wall' },
    { id: 'wall_blue', type: 'decor', name: '清爽蓝墙', price: 50, color: 0xb3e5fc, decorType: 'wall' },
    { id: 'wall_lightgreen', type: 'decor', name: '浅绿色墙', price: 50, color: 0x9ba080, decorType: 'wall' },
    { id: 'wall_red', type: 'decor', name: '福气红墙', price: 50, color: 0x942c24, decorType: 'wall' },
    { id: 'wall_blueWooden', type: 'decor', name: '蓝色木墙', price: 50, color: 0xc9a2a6, decorType: 'wall', textureFile: 'BlueWooden.jpg' },
    { id: 'MintWallpaper', type: 'decor', name: '薄荷墙纸', price: 50, color: 0xc9a2a6, decorType: 'wall', textureFile: 'MintWallpaper.jpg' },
    { id: 'CatFishWallpaper', type: 'decor', name: '猫咪墙纸', price: 50, color: 0xc9a2a6, decorType: 'wall', textureFile: 'CatFishWallpaper.png', wallpaperUnitWidth: 1 },
    { id: 'WoodWallpaper', type: 'decor', name: '木纹墙纸', price: 50, color: 0xc9a2a6, decorType: 'wall', textureFile: 'Wallpaper_1.png', wallpaperStyle: 'horizontal', wallpaperUnitWidth: 1.5 },
    { id: 'AppleWallpaper', type: 'decor', name: '苹果墙纸', price: 50, color: 0xc9a2a6, decorType: 'wall', textureFile: 'Wallpaper_2.png', wallpaperStyle: 'horizontal', wallpaperUnitWidth: 1.5 },

    // [New] 近期新增墙纸
    { id: 'Wallpaper_3', type: 'decor', name: '绿底花纹墙纸', price: 60, color: 0xffffff, decorType: 'wall', textureFile: 'Wallpaper_3.png', wallpaperStyle: 'horizontal', wallpaperUnitWidth: 1.5 },
    { id: 'GreenGreidWallpaper', type: 'decor', name: '绿色格子墙纸', price: 60, color: 0xffffff, decorType: 'wall', textureFile: 'GreenGreidWallpaper.png', wallpaperUnitWidth: 0.5 },
    { id: 'brickWallpaper', type: 'decor', name: '红砖墙纸', price: 60, color: 0xffffff, decorType: 'wall', textureFile: 'brickWallpaper.png', wallpaperUnitWidth: 1.5 },
    { id: 'floor_FloorWallpaper', type: 'decor', name: '花色墙纸', price: 60, color: 0xffffff, decorType: 'wall', textureFile: 'FloorWallpaper.png', wallpaperUnitWidth: 1 },
    // ==========================================
    // 12. 特殊物品 (Special / Blind Box)
    // ==========================================
    {
        id: 'blind_box_horse',
        type: 'small',
        layer: 2,
        name: '马年盲盒',
        price: 30,
        color: 0xffffff,
        size: { x: 0.4, y: 0.4, z: 0.4 },
        modelFile: 'giftbox.glb',
        modelScale: 0.2,
        fixBottom: true,
        isBlindBox: true,
        blindBoxPool: ['horse_figure_ponyta', 'horse_figure_black', 'horse_figure_cute']
    },
    // 隐藏款 (Hidden)
    {
        id: 'horse_figure_ponyta',
        type: 'small',
        layer: 2,
        name: '烈焰小马',
        price: 0,
        color: 0xffffff,
        size: { x: 0.4, y: 0.5, z: 0.4 },
        modelFile: 'Ponyta.glb',
        modelScale: 0.4,
        fixBottom: true,
        // [修复] 向右转90度
        manualRotation: { x: 0, y: -Math.PI / 2, z: 0 },
        isToy: true,
        toyAnimation: 'jump',
        excludeFromShop: true // 不在商店显示
    },
    {
        id: 'horse_figure_black',
        type: 'small',
        layer: 2,
        name: '黑骏马',
        price: 0,
        color: 0x333333,
        size: { x: 0.4, y: 0.6, z: 0.4 },
        modelFile: 'BlackHorse.glb',
        modelScale: 0.4,
        fixBottom: true,
        isToy: true,
        toyAnimation: 'spin',
        excludeFromShop: true // 不在商店显示
    },
    {
        id: 'horse_figure_cute',
        type: 'small',
        layer: 2,
        name: '萌萌小马',
        price: 0,
        color: 0xffc0cb,
        size: { x: 0.4, y: 0.5, z: 0.4 },
        modelFile: 'cutehorse.glb',
        modelScale: 0.4,
        fixBottom: true,
        // [修复] 修正模型倒下的问题 (向后转90度)
        manualRotation: { x: -Math.PI / 2, y: 0, z: 0 },
        isToy: true,
        toyAnimation: 'bounce',
        excludeFromShop: true // 不在商店显示
    },
];
