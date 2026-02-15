/**
 * 游戏广场交互逻辑
 */
class GamePlaza {
    constructor() {
        this.searchInput = null;
        this.filterTags = null;
        this.gameCards = null;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
    }

    bindElements() {
        this.searchInput = document.getElementById('search-input');
        this.filterTags = document.querySelectorAll('.tag');
        this.gameCards = document.querySelectorAll('.game-card');
    }

    bindEvents() {
        // 搜索输入事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.search(e.target.value));
        }

        // 筛选标签点击事件
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => this.filter(e.target.dataset.filter));
        });
    }

    search(keyword) {
        keyword = keyword.toLowerCase();
        this.gameCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
            const author = card.querySelector('p')?.textContent?.toLowerCase() || '';
            const matches = title.includes(keyword) || author.includes(keyword);
            card.style.display = matches ? 'flex' : 'none';
        });
    }

    filter(filterType) {
        this.currentFilter = filterType;

        // 更新活跃标签
        this.filterTags.forEach(tag => {
            tag.classList.remove('active');
            if (tag.dataset.filter === filterType) {
                tag.classList.add('active');
            }
        });

        console.log(`筛选条件: ${filterType}`);
        // 这里可以调用后端 API 重新加载游戏列表
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new GamePlaza();
});

