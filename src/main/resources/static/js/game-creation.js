/**
 * 编辑器选项卡管理类
 */
class EditorTabManager {
    constructor() {
        this.currentTab = 'tilemap';
        this.init();
    }

    init() {
        this.bindTabButtons();
    }

    /**
     * 绑定选项卡按钮事件
     */
    bindTabButtons() {
        const tabButtons = document.querySelectorAll('.editor-tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    /**
     * 切换到指定选项卡
     * @param {string} tabName - 选项卡名称 ('tilemap' 或 'image')
     */
    switchTab(tabName) {
        // 移除所有活跃状态
        const tabButtons = document.querySelectorAll('.editor-tab-button');
        const tabContents = document.querySelectorAll('.editor-tab-content');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 设置新的活跃状态
        const activeButton = document.querySelector(`.editor-tab-button[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);

        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        this.currentTab = tabName;

        // 触发编辑器初始化回调
        this.onTabSwitch(tabName);
    }

    /**
     * 选项卡切换时的回调处理
     * @param {string} tabName - 当前选项卡名称
     */
    onTabSwitch(tabName) {
        console.log(`切换到: ${tabName} 编辑器`);

        if (tabName === 'tilemap') {
            // Tilemap 编辑器初始化逻辑
            if (typeof TilemapEditor !== 'undefined') {
                console.log('✓ Tilemap 编辑器已就绪');
            }
        } else if (tabName === 'image') {
            // 图片编辑器初始化逻辑 (后续添加)
            console.log('📋 图片编辑器初始化接口预留');
        }
    }
}

/**
 * 游戏创作页面交互逻辑
 */
class GameCreation {
    constructor() {
        this.gameName = null;
        this.gameDescription = null;
        this.tilemapEditor = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.initializeEditors();
    }

    bindElements() {
        this.gameName = document.getElementById('game-name');
        this.gameDescription = document.getElementById('game-description');
    }

    bindEvents() {
        // 保存游戏按钮
        const btnSave = document.querySelector('.btn-save');
        if (btnSave) {
            btnSave.addEventListener('click', () => this.saveGame());
        }

        // 发布到广场按钮
        const btnPublish = document.querySelector('.btn-publish');
        if (btnPublish) {
            btnPublish.addEventListener('click', () => this.publishGame());
        }

        // 取消按钮
        const btnCancel = document.querySelector('.btn-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.cancel());
        }
    }

    initializeEditors() {
        // 初始化编辑器选项卡管理器
        this.tabManager = new EditorTabManager();

        // 等待 Tilemap 编辑器初始化完成
        if (typeof TilemapEditor !== 'undefined') {
            console.log('✓ Tilemap 编辑器已初始化');
        }
    }

    saveGame() {
        const gameName = this.gameName?.value?.trim();

        if (!gameName) {
            alert('请输入游戏名称');
            return;
        }

        console.log('保存游戏:', {
            name: gameName,
            description: this.gameDescription?.value || ''
        });

        // 这里可以调用后端 API 保存游戏
        alert(`游戏 "${gameName}" 已保存！`);
    }

    publishGame() {
        const gameName = this.gameName?.value?.trim();

        if (!gameName) {
            alert('请先输入游戏名称');
            return;
        }

        console.log('发布游戏:', {
            name: gameName,
            description: this.gameDescription?.value || ''
        });

        // 这里可以调用后端 API 发布游戏
        alert(`游戏 "${gameName}" 已发布到广场！`);
    }

    cancel() {
        if (confirm('取消创作？')) {
            window.location.href = '/';
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new GameCreation();
});

