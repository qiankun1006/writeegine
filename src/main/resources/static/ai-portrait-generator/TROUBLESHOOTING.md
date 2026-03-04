# AI 人物立绘生成器 - 故障排查指南

## 🔍 调试步骤

### 第一步：检查浏览器控制台
按 `F12` 打开开发者工具，查看 **Console** 标签页中的错误信息。

### 第二步：检查网络请求
在 **Network** 标签页中查看：
- CSS 文件是否加载成功（200 状态码）
- JavaScript 文件是否加载成功（200 状态码）
- 是否有 404 或 500 错误

### 第三步：检查构建产物
```bash
cd src/main/resources/static/ai-portrait-generator
ls -la dist/
ls -la dist/assets/
```

应该看到：
```
dist/
├── index.html
└── assets/
    ├── index-*.css
    └── index-*.js
```

---

## ❌ 常见错误及解决方案

### 错误 1: "GET /static/ai-portrait-generator/dist/assets/*.css 404"

**症状**：样式没有加载，页面不美观

**可能原因**：
1. 构建产物不存在
2. 文件名哈希值与模板中的不匹配
3. Spring Boot 缓存问题

**解决方案**：
```bash
# 1. 重新构建
cd src/main/resources/static/ai-portrait-generator
rm -rf dist
npm run build

# 2. 验证文件存在
ls -la dist/assets/

# 3. 检查文件内容（不应为空）
wc -l dist/assets/*.js dist/assets/*.css

# 4. 重启 Spring Boot 应用
# （停止并重新启动服务器）

# 5. 清除浏览器缓存
# Ctrl+Shift+Delete (Windows)
# Cmd+Shift+Delete (Mac)

# 6. 使用硬刷新
# Ctrl+F5 (Windows)
# Cmd+Shift+R (Mac)
```

---

### 错误 2: "Failed to fetch dynamically imported module"

**症状**：页面显示"应用加载失败"

**可能原因**：
1. dist/index.html 不存在或损坏
2. 动态脚本加载器的正则表达式不匹配
3. 文件路径不正确

**调试步骤**：
```javascript
// 在浏览器控制台运行以下代码
fetch('/static/ai-portrait-generator/dist/index.html')
  .then(r => r.text())
  .then(html => {
    console.log('HTML 获取成功，长度:', html.length);
    const match = html.match(/<script[^>]*src="([^"]*)"[^>]*><\/script>/);
    if (match) {
      console.log('找到脚本:', match[1]);
    } else {
      console.log('未找到脚本标签');
      console.log('HTML 片段:', html.substring(0, 500));
    }
  })
  .catch(err => console.error('获取失败:', err));
```

**解决方案**：
```bash
# 1. 验证 index.html 存在且格式正确
cat dist/index.html

# 2. 检查 dist 目录权限
chmod -R 755 dist/

# 3. 确保 Spring Boot 能访问文件
# 检查应用日志中是否有权限错误

# 4. 如果上述都不行，重新构建
npm run build
```

---

### 错误 3: "Cannot read properties of null (reading 'classList')"

**症状**：控制台出现 JavaScript 错误，应用崩溃

**可能原因**：
1. Vue 应用挂载失败（找不到 #app 元素）
2. 其他脚本干扰

**解决方案**：
```bash
# 1. 检查 character-portrait.html 中是否有 <div id="app"> 元素
grep -n 'id="app"' src/main/resources/templates/asset-editors/character-portrait.html

# 2. 检查是否有其他脚本冲突
# 查看浏览器控制台，看是否有其他错误在 Vue 应用加载前发生

# 3. 清除浏览器缓存和 LocalStorage
# 在浏览器控制台执行：
localStorage.clear();
sessionStorage.clear();
// 然后刷新页面

# 4. 尝试在隐私模式/无痕浏览中打开
```

---

### 错误 4: "Sass 变量未定义 ($gray-50 等)"

**症状**：构建时出现 SCSS 编译错误

**可能原因**：
1. theme.scss 中未定义必要的变量
2. vite.config.ts 中的 SCSS 注入配置有误

**解决方案**：
```bash
# 1. 检查 theme.scss 中是否定义了所有需要的变量
grep '\$gray-' src/styles/theme.scss

# 2. 验证 vite.config.ts 中的配置
grep -A 5 'preprocessorOptions' vite.config.ts

# 3. 如果变量缺失，添加它们
# 编辑 src/styles/theme.scss，确保包含：
# $gray-50, $gray-100, $gray-200, ...

# 4. 重新构建
npm run build
```

---

### 错误 5: npm 安装失败或超时

**症状**：`npm install` 命令卡住或失败

**可能原因**：
1. 网络连接问题
2. npm 源配置不当
3. 硬盘空间不足

**解决方案**：
```bash
# 1. 清除 npm 缓存
npm cache clean --force

# 2. 尝试不同的 npm 源
npm config set registry https://registry.npmmirror.com

# 3. 用 --verbose 重试以查看详细信息
npm install --verbose

# 4. 删除 node_modules 和 package-lock.json 后重新安装
rm -rf node_modules package-lock.json
npm install

# 5. 如果仍然失败，尝试使用 yarn
yarn install
```

---

### 错误 6: 页面显示"AI 立绘生成器加载中..."但永远没有加载完成

**症状**：加载动画一直显示

**可能原因**：
1. Vue 应用加载失败但没有显示错误
2. 脚本URL 错误导致无限加载
3. CORS 问题

**调试步骤**：
```javascript
// 在浏览器控制台运行
console.log('当前 URL:', window.location.href);
console.log('文档 readyState:', document.readyState);

// 检查 index.html 是否存在
fetch('/static/ai-portrait-generator/dist/index.html')
  .then(r => {
    console.log('index.html 状态:', r.status);
    return r.text();
  })
  .then(html => console.log('HTML 长度:', html.length))
  .catch(err => console.error('获取错误:', err));

// 检查是否有其他脚本加载
console.log('页面上的所有脚本:', document.querySelectorAll('script'));
```

**解决方案**：
```bash
# 1. 检查 Spring Boot 日志中是否有 500 错误
# 查看应用启动日志

# 2. 检查文件权限
ls -l dist/
ls -l dist/assets/

# 3. 验证 index.html 文件完整性
file dist/index.html
wc -l dist/index.html

# 4. 重启 Spring Boot 应用
# 确保新的构建被正确加载

# 5. 检查防火墙或代理设置
```

---

## 🧪 自动化诊断

运行以下脚本进行全面检查：

```bash
#!/bin/bash
# 保存为 diagnose.sh

echo "=== AI 人物立绘生成器诊断 ==="

# 检查 Node.js 和 npm
echo "1. 检查 Node.js 环境..."
node --version
npm --version

# 检查依赖
echo "2. 检查依赖..."
if [ -d "node_modules" ]; then
    echo "✓ node_modules 存在"
    echo "  包数量: $(ls -1 node_modules | wc -l)"
else
    echo "✗ node_modules 不存在"
fi

# 检查构建产物
echo "3. 检查构建产物..."
if [ -d "dist" ]; then
    echo "✓ dist 目录存在"
    echo "  文件列表:"
    find dist -type f | sort
    echo "  总大小: $(du -sh dist)"
else
    echo "✗ dist 目录不存在"
fi

# 检查源代码
echo "4. 检查源代码..."
echo "  Vue 组件数: $(ls -1 src/components/*.vue 2>/dev/null | wc -l)"
echo "  样式文件数: $(ls -1 src/styles/*.scss 2>/dev/null | wc -l)"

# 检查配置
echo "5. 检查配置文件..."
for file in vite.config.ts tsconfig.json package.json; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file 缺失"
    fi
done

echo "=== 诊断完成 ==="
```

运行诊断：
```bash
chmod +x diagnose.sh
./diagnose.sh
```

---

## 🆘 当所有方法都失效时

### 完全重建

```bash
# 1. 停止 Spring Boot 应用

# 2. 进入项目目录
cd src/main/resources/static/ai-portrait-generator

# 3. 完全清空
rm -rf node_modules dist package-lock.json

# 4. 重新安装
npm install

# 5. 构建
npm run build

# 6. 验证
ls -la dist/assets/

# 7. 启动 Spring Boot 应用

# 8. 清除浏览器缓存并访问页面
```

### 收集诊断信息

如果仍然无法解决，请收集以下信息：

1. **浏览器信息**
   - 浏览器名称和版本
   - 操作系统

2. **控制台错误**
   - 完整的错误消息
   - 堆栈跟踪

3. **网络错误**
   - 失败的请求 URL
   - HTTP 状态码
   - 响应信息

4. **系统信息**
   ```bash
   node --version
   npm --version
   uname -a  # 或 systeminfo (Windows)
   ```

5. **日志文件**
   - Spring Boot 应用日志
   - npm 构建日志

---

## 📊 性能检查

如果应用缓慢，检查以下项目：

```javascript
// 在浏览器控制台运行
// 1. 检查初始加载时间
performance.timing.navigationStart;
performance.timing.loadEventEnd;
console.log('总加载时间:',
  performance.timing.loadEventEnd - performance.timing.navigationStart,
  'ms'
);

// 2. 检查资源大小
Array.from(performance.getEntriesByType('resource'))
  .filter(r => r.name.includes('ai-portrait'))
  .forEach(r => {
    console.log(r.name, 'Size:', r.transferSize, 'bytes');
  });

// 3. 检查 Vue 应用大小
// 打开 Network 标签，查看 .js 和 .css 文件大小
```

---

**最后更新**：2026年3月4日
**版本**：1.0.0

如需进一步帮助，请提供完整的错误信息和上述诊断信息。

