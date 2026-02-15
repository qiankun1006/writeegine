# Tilemap编辑器当前图块预览功能修复 - 设计文档

## 问题分析

用户报告选中图块时，当前图块预览区域没有变化。这个功能涉及以下模块：

1. **HTML模板** (`tilemap-editor.html`)：当前图块预览UI
2. **JavaScript** (`tilemap-editor.js`)：事件监听和DOM更新逻辑
3. **CSS** (`tilemap-editor.css`)：样式显示

## 原始代码问题

### selectTile方法的问题

```javascript
// 原始代码
selectTile(index) {
    this.selectedTileIndex = index;
    const tileEl = document.querySelector(`.tile-item[data-tile-index="${index}"]`);

    if (tileEl) {
        const tileName = tileEl.dataset.tileName;
        const imgSrc = tileEl.querySelector('img').src;

        // 问题：直接调用getElementById，如果元素不存在会报错
        document.getElementById('current-tile-preview').src = imgSrc;
        document.getElementById('current-tile-name').textContent = tileName;
    }
}
```

**问题点**：
1. 未检查`getElementById`返回值，如果元素不存在会抛出错误
2. 没有错误日志，难以诊断问题
3. 没有设置img的alt属性（无障碍性）

### loadTileImages方法的问题

```javascript
// 原始代码
loadTileImages() {
    const tileElements = document.querySelectorAll('.tile-item');
    this.tileImages = [];

    tileElements.forEach((tileEl, index) => {
        const img = new Image();
        const imgSrc = tileEl.querySelector('img').src;

        img.onload = () => {
            this.tileImages[index] = img;
            if (index === 0) {
                this.render();
            }
        };

        // 问题：没有onerror处理，图片加载失败无法知道
        img.src = imgSrc;

        // 点击事件处理
        tileEl.addEventListener('click', () => {
            this.selectTile(index);
            // ...
        });
    });
}
```

**问题点**：
1. 没有错误处理 (`img.onerror`)
2. 没有日志记录加载过程
3. 难以诊断为什么预览不显示

## 修复方案

### 1. 增强selectTile方法

```javascript
selectTile(index) {
    // 保存当前选中的图块索引
    this.selectedTileIndex = index;

    // 根据索引查找对应的图块DOM元素
    const tileEl = document.querySelector(`.tile-item[data-tile-index="${index}"]`);

    // 调试日志
    console.log(`选中图块索引: ${index}, 找到元素: ${tileEl ? '是' : '否'}`);

    // 如果找到该图块元素
    if (tileEl) {
        // 获取图块的名称
        const tileName = tileEl.dataset.tileName;

        // 获取图块的图片源路径
        const imgSrc = tileEl.querySelector('img').src;

        // 调试日志
        console.log(`图块名称: ${tileName}, 图片: ${imgSrc}`);

        // 获取预览元素和名称元素
        const previewEl = document.getElementById('current-tile-preview');
        const nameEl = document.getElementById('current-tile-name');

        // 调试日志
        console.log(`预览元素: ${previewEl ? '存在' : '不存在'}, 名称元素: ${nameEl ? '存在' : '不存在'}`);

        // 更新当前选中图块的预览图 - 添加null检查
        if (previewEl) {
            previewEl.src = imgSrc;
            previewEl.alt = tileName;  // 添加alt属性
        }

        // 更新当前选中图块的名称文字显示 - 添加null检查
        if (nameEl) {
            nameEl.textContent = tileName;
        }
    } else {
        console.error(`未找到索引为 ${index} 的图块元素`);
    }
}
```

**改进点**：
- ✅ 添加null检查防止错误
- ✅ 添加详细的console日志用于诊断
- ✅ 设置img的alt属性提升无障碍性

### 2. 增强loadTileImages方法

```javascript
loadTileImages() {
    // 获取所有图块项DOM元素
    const tileElements = document.querySelectorAll('.tile-item');

    console.log(`找到 ${tileElements.length} 个图块项`);

    // 清空图片数组
    this.tileImages = [];

    // 遍历每个图块项
    tileElements.forEach((tileEl, index) => {
        // 创建新的Image对象用于加载图片
        const img = new Image();

        // 获取该图块的图片源路径
        const imgSrc = tileEl.querySelector('img').src;

        console.log(`加载图块 ${index}: ${imgSrc}`);

        // 定义图片加载完成的回调函数
        img.onload = () => {
            // 将加载完的图片对象存储到数组中
            this.tileImages[index] = img;

            console.log(`图块 ${index} 加载完成`);

            // 当第一个图片加载完成时，重新渲染画布
            if (index === 0) {
                this.render();
            }
        };

        // 添加错误处理 - 新增
        img.onerror = () => {
            console.error(`图块 ${index} 加载失败: ${imgSrc}`);
        };

        // 触发图片加载(设置src属性)
        img.src = imgSrc;

        // 配置图块项的点击事件(选择图块)
        tileEl.addEventListener('click', () => {
            console.log(`点击了图块 ${index}`);
            // 调用selectTile方法选中该图块
            this.selectTile(index);

            // 移除所有图块项的selected类
            tileElements.forEach(el => el.classList.remove('selected'));

            // 为当前点击的图块项添加selected类(高亮显示)
            tileEl.classList.add('selected');
        });
    });
}
```

**改进点**：
- ✅ 添加img.onerror错误处理
- ✅ 添加详细的加载过程日志
- ✅ 添加点击事件日志

## 诊断步骤

用户可以通过以下步骤诊断问题：

1. 打开浏览器F12开发者工具
2. 切换到Console标签
3. 观察日志输出
4. 点击图块并检查日志

### 预期的正常日志输出

```
找到 7 个图块项
加载图块 0: /static/images/tiles/brown.png
加载图块 1: /static/images/tiles/stone-wall.png
...
图块 0 加载完成
选中图块索引: 0, 找到元素: 是
图块名称: 棕色地块, 图片: /static/images/tiles/brown.png
预览元素: 存在, 名称元素: 存在
```

## 相关代码位置

### HTML结构 (tilemap-editor.html)

```html
<div class="current-tile">
    <span>当前图块: </span>
    <img id="current-tile-preview" src="" alt="当前选择">
    <span id="current-tile-name">未选择</span>
</div>
```

### 图块选择器 (tilemap-editor.html)

```html
<div class="tile-grid" id="tile-selector">
    <div th:each="tile, iterStat : ${tileImages}"
         class="tile-item"
         th:data-tile-index="${iterStat.index}"
         th:data-tile-name="${tileNames[iterStat.index]}">
        <img th:src="@{'/static/images/tiles/' + ${tile}}"
             th:alt="${tileNames[iterStat.index]}"
             class="tile-preview">
        <span th:text="${tileNames[iterStat.index]}">图块名称</span>
    </div>
</div>
```

### CSS样式 (tilemap-editor.css)

```css
/* 当前选择的图块显示区域 */
.current-tile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

/* 当前选择图块的预览图容器 */
#current-tile-preview {
    width: 32px;
    height: 32px;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
}

/* 当前选择的图块名称文字 */
#current-tile-name {
    font-weight: 500;
    color: #2c3e50;
}
```

## 测试验证

修复后应该能够：

1. ✅ 选中任何图块时，左侧预览区域显示该图块的缩略图
2. ✅ 当前图块的名称文字正确更新
3. ✅ 控制台没有错误信息
4. ✅ 图块加载过程有清晰的日志输出

