/**
 * 首页交互增强
 * 该文件负责处理首页的各种交互功能，包括菜单卡片的点击跳转和页面访问统计
 */

// 定义一个名为 HomePage 的类，用于封装首页的所有交互逻辑
class HomePage {
    // 构造函数，创建 HomePage 实例时自动调用
    constructor() {
        // 调用 init 方法进行初始化操作
        this.init();
    }

    // 初始化方法，设置页面的事件绑定和统计功能
    init() {
        // 调用 bindEvents 方法，为页面元素绑定事件监听器
        this.bindEvents();
        // 调用 trackPageView 方法，记录页面访问
        this.trackPageView();
    }

    // 绑定事件方法，为各个菜单卡片绑定点击事件
    bindEvents() {
        // 通过 CSS 选择器获取所有 class 为 'menu-card' 的菜单卡片元素
        const cards = document.querySelectorAll('.menu-card');
        // 遍历每一个菜单卡片，为其绑定点击事件
        cards.forEach(card => {
            // 为当前卡片添加 'click' 点击事件监听器
            card.addEventListener('click', (e) => {
                // 判断点击的目标元素是否不在 '.card-button' 按钮内部
                // 这样可以避免点击按钮时触发卡片的跳转逻辑
                if (!e.target.closest('.card-button')) {
                    // 在当前卡片内查找 '.card-button' 链接元素
                    const link = card.querySelector('.card-button');
                    // 如果找到了链接元素，则执行跳转
                    if (link) {
                        // 将页面导航到链接指定的地址
                        window.location.href = link.href;
                    }
                }
            });
        });
    }

    // 页面访问统计方法，用于记录用户访问首页的行为
    trackPageView() {
        // 在浏览器控制台输出用户访问首页的日志信息
        console.log('用户访问了首页');
        // 此处预留了扩展接口，后续可以接入真实的统计服务代码
        // 例如：百度统计、Google Analytics、神策统计等
    }
}

// 监听 DOMContentLoaded 事件，确保 DOM 加载完成后再执行初始化
// 这样可以避免在 DOM 未完全加载时执行代码导致找不到页面元素的问题
document.addEventListener('DOMContentLoaded', () => {
    // DOM 加载完成后，创建 HomePage 类的实例，启动首页交互功能
    new HomePage();
});

