// WriteMyself 主JavaScript文件

document.addEventListener('DOMContentLoaded', function() {
    console.log('WriteMyself Web界面已加载');

    // 显示加载时间
    const loadTime = performance.now();
    console.log(`页面加载时间: ${loadTime.toFixed(2)}ms`);

    // 示例：为所有段落添加点击事件
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.addEventListener('click', function() {
            this.style.color = this.style.color === 'blue' ? '' : 'blue';
            console.log('段落被点击:', this.textContent.substring(0, 30));
        });
    });

    // 为所有标题添加悬停效果
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
        heading.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });

        heading.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // 导航链接活跃状态
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath ||
            (currentPath === '/' && link.getAttribute('href') === '/') ||
            (currentPath.includes('about') && link.getAttribute('href') === '/about')) {
            link.style.fontWeight = 'bold';
            link.style.color = '#0056b3';
        }
    });

    // 表单输入增强（如果有的话）
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#007bff';
            this.style.boxShadow = '0 0 0 0.2rem rgba(0,123,255,.25)';
        });

        input.addEventListener('blur', function() {
            this.style.borderColor = '#ced4da';
            this.style.boxShadow = 'none';
        });
    });

    // 显示当前年份（用于页脚）
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

    // 如果没有元素，在页脚添加年份
    const footer = document.querySelector('footer p');
    if (footer && !footer.innerHTML.includes(currentYear)) {
        footer.innerHTML = footer.innerHTML.replace('2025', currentYear);
    }

    // 添加简单的主题切换按钮（可选功能）
    const themeToggle = document.createElement('button');
    themeToggle.textContent = '切换主题';
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '20px';
    themeToggle.style.right = '20px';
    themeToggle.style.padding = '0.5rem 1rem';
    themeToggle.style.backgroundColor = '#007bff';
    themeToggle.style.color = 'white';
    themeToggle.style.border = 'none';
    themeToggle.style.borderRadius = '4px';
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.zIndex = '1000';

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            document.body.style.backgroundColor = '#343a40';
            document.body.style.color = '#f8f9fa';
            themeToggle.textContent = '切换亮色';
        } else {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            themeToggle.textContent = '切换暗色';
        }
    });

    document.body.appendChild(themeToggle);

    console.log('JavaScript初始化完成');
});

// 工具函数：简单的消息提示
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#28a745';
    toast.style.color = 'white';
    toast.style.padding = '1rem';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1001';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => document.body.removeChild(toast), 500);
    }, duration);
}

