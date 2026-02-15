/**
 * 首页交互增强
 */
class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.trackPageView();
    }

    bindEvents() {
        // 菜单卡片点击事件
        const cards = document.querySelectorAll('.menu-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-button')) {
                    const link = card.querySelector('.card-button');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
            });
        });
    }

    trackPageView() {
        console.log('用户访问了首页');
        // 后续可以添加统计代码
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});

