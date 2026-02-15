/**
 * 我的游戏管理页面交互逻辑
 */
class GameManagement {
    constructor() {
        this.gameItems = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
    }

    bindElements() {
        this.gameItems = document.querySelectorAll('.game-item');
    }

    bindEvents() {
        // 为每个游戏项绑定删除按钮事件
        this.gameItems.forEach(item => {
            const deleteBtn = item.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const gameName = item.querySelector('h3')?.textContent || '游戏';
                    this.deleteGame(gameName, item);
                });
            }
        });
    }

    deleteGame(gameName, gameItem) {
        if (confirm(`确定要删除游戏"${gameName}"吗？`)) {
            // 这里可以调用后端 API 删除游戏
            gameItem.style.opacity = '0.5';
            console.log(`删除游戏: ${gameName}`);
            alert(`游戏"${gameName}"已删除！`);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new GameManagement();
});

