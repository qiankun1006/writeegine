/* ===== Tilemap编辑器主类 ===== */
/**
 * TilemapEditor类 - 管理整个Tilemap编辑器的核心逻辑
 * 包括画布管理、图块编辑、撤销重做、导出等功能
 */
class TilemapEditor {
    /**
     * 构造函数 - 初始化编辑器的各个属性
     */
    constructor() {
        // ===== DOM元素引用 =====
        this.canvas = document.getElementById('tilemap-canvas'); // 获取Canvas画布DOM元素
        this.ctx = this.canvas.getContext('2d'); // 获取2D绘图上下文
        this.gridOverlay = document.getElementById('canvas-grid-overlay'); // 获取网格叠加层DOM元素

        // ===== 编辑器配置状态 =====
        this.gridSize = 16; // 网格行列数(默认16x16)
        this.tileSize = 32; // 每个图块的像素大小(32x32像素)
        this.selectedTileIndex = -1; // 当前选中的图块索引(-1表示未选中)
        this.tileImages = []; // 存储所有加载的图块图片对象数组
        this.tilemapData = []; // 存储编辑网格的图块数据(数组索引表示位置，值表示图块类型)

        // ===== 撤销/重做历史记录 =====
        this.history = []; // 保存编辑历史状态的数组(最多20个状态)
        this.historyIndex = -1; // 当前在历史记录中的位置指针

        // ===== 初始化编辑器 =====
        this.init(); // 调用初始化方法
    }

    /**
     * init方法 - 初始化编辑器的各个模块
     * 按顺序设置画布、加载图块、配置事件、绘制网格等
     */
    init() {
        this.setupCanvas(); // 1. 设置Canvas尺寸和初始化网格数据
        this.loadTileImages(); // 2. 加载所有可用的图块图片
        this.setupEventListeners(); // 3. 配置所有事件监听器
        this.setupGrid(); // 4. 创建编辑网格并配置点击事件
        this.render(); // 5. 首次渲染画布

        // 默认选择第一个图块
        this.selectTile(0); // 6. 默认选中第一个图块
    }

    /**
     * setupCanvas方法 - 初始化Canvas画布和网格数据
     */
    setupCanvas() {
        // 设置Canvas画布的宽度 = 网格列数 × 每个图块像素宽度
        this.canvas.width = this.gridSize * this.tileSize; // 16 * 32 = 512

        // 设置Canvas画布的高度 = 网格行数 × 每个图块像素高度
        this.canvas.height = this.gridSize * this.tileSize; // 16 * 32 = 512

        // 初始化网格数据为一维数组(256个元素)
        // 使用-1表示空白(未放置任何图块)
        this.tilemapData = Array(this.gridSize * this.gridSize).fill(-1);
    }

    /**
     * loadTileImages方法 - 加载所有可用的图块图片并配置选择事件
     */
    loadTileImages() {
        // 获取所有图块项DOM元素
        const tileElements = document.querySelectorAll('.tile-item'); // 返回NodeList

        // 清空图片数组
        this.tileImages = [];

        // 遍历每个图块项
        tileElements.forEach((tileEl, index) => {
            // 创建新的Image对象用于加载图片
            const img = new Image();

            // 获取该图块的图片源路径
            const imgSrc = tileEl.querySelector('img').src; // 从HTML的img标签获取src

            // 定义图片加载完成的回调函数
            img.onload = () => {
                // 将加载完的图片对象存储到数组中
                this.tileImages[index] = img;

                // 当第一个图片加载完成时，重新渲染画布
                if (index === 0) {
                    this.render(); // 这样可以立即看到编辑器
                }
            };

            // 触发图片加载(设置src属性)
            img.src = imgSrc;

            // ===== 配置图块项的点击事件(选择图块) =====
            tileEl.addEventListener('click', () => {
                // 调用selectTile方法选中该图块
                this.selectTile(index); // 更新当前选中的图块

                // 移除所有图块项的selected类
                tileElements.forEach(el => el.classList.remove('selected'));

                // 为当前点击的图块项添加selected类(高亮显示)
                tileEl.classList.add('selected');
            });
        });
    }

    /**
     * selectTile方法 - 选中指定索引的图块，更新UI显示
     * @param {number} index - 要选中的图块在tileImages数组中的索引
     */
    selectTile(index) {
        // 保存当前选中的图块索引
        this.selectedTileIndex = index;

        // 根据索引查找对应的图块DOM元素
        const tileEl = document.querySelector(`.tile-item[data-tile-index="${index}"]`);

        // 如果找到该图块元素
        if (tileEl) {
            // 获取图块的名称
            const tileName = tileEl.dataset.tileName; // 从data属性获取

            // 获取图块的图片源路径
            const imgSrc = tileEl.querySelector('img').src;

            // 更新当前选中图块的预览图
            document.getElementById('current-tile-preview').src = imgSrc;

            // 更新当前选中图块的名称文字显示
            document.getElementById('current-tile-name').textContent = tileName;
        }
    }

    /**
     * setupGrid方法 - 创建网格叠加层(显示网格线和可点击单元格)
     */
    setupGrid() {
        // ===== 创建网格HTML =====
        const gridHTML = []; // 用于存储所有网格单元格的HTML字符串
        const cellSize = 100 / this.gridSize; // 计算每个单元格占容器的百分比宽/高 = 100/16 = 6.25%

        // 嵌套循环遍历每一行和每一列创建网格单元格
        for (let y = 0; y < this.gridSize; y++) { // y从0到15(行)
            for (let x = 0; x < this.gridSize; x++) { // x从0到15(列)
                // 构建单个网格单元格的HTML
                gridHTML.push(
                    `<div class="grid-cell" // 网格单元格容器
                          style="position: absolute; // 绝对定位，相对于canvas-grid父容器
                                 width: ${cellSize}%; // 宽度为容器的6.25%
                                 height: ${cellSize}%; // 高度为容器的6.25%
                                 left: ${x * cellSize}%; // 左边距 = 列号 * 6.25%
                                 top: ${y * cellSize}%; // 上边距 = 行号 * 6.25%
                                 border-right: 1px solid rgba(0,0,0,0.1); // 右边框(网格线)
                                 border-bottom: 1px solid rgba(0,0,0,0.1);" // 下边框(网格线)
                          data-x="${x}" // 保存该单元格的X坐标(列号)
                          data-y="${y}"></div>` // 保存该单元格的Y坐标(行号)
                );
            }
        }

        // ===== 将所有网格HTML插入到DOM中 =====
        this.gridOverlay.innerHTML = gridHTML.join(''); // 将数组拼接成一个字符串并设置为innerHTML

        // ===== 配置网格单元格的事件监听器 =====
        this.gridOverlay.querySelectorAll('.grid-cell').forEach(cell => {
            // ===== 左键点击事件(放置图块) =====
            cell.addEventListener('click', (e) => {
                // 获取被点击单元格的X坐标
                const x = parseInt(cell.dataset.x);

                // 获取被点击单元格的Y坐标
                const y = parseInt(cell.dataset.y);

                // 调用放置图块方法
                this.placeTile(x, y);
            });

            // ===== 右键点击事件(清除图块) =====
            cell.addEventListener('contextmenu', (e) => {
                // 阻止浏览器默认右键菜单
                e.preventDefault();

                // 获取被右键点击单元格的X坐标
                const x = parseInt(cell.dataset.x);

                // 获取被右键点击单元格的Y坐标
                const y = parseInt(cell.dataset.y);

                // 调用移除图块方法
                this.removeTile(x, y);

                // 返回false阻止事件传播
                return false;
            });
        });
    }

    /**
     * placeTile方法 - 在指定位置放置选中的图块
     * @param {number} x - 放置的列号(0-15)
     * @param {number} y - 放置的行号(0-15)
     */
    placeTile(x, y) {
        // 检查是否已选择图块(selectedTileIndex为-1表示未选择)
        if (this.selectedTileIndex === -1) return; // 如果没选中就直接返回

        // 保存当前编辑状态到历史记录(用于撤销功能)
        this.saveHistory();

        // 计算该位置在一维数组中的索引
        // 一维数组索引 = 行号 * 列数 + 列号
        const index = y * this.gridSize + x; // 例如:(2,3) -> 2*16+3 = 35

        // 将当前选中的图块索引赋值到该位置
        this.tilemapData[index] = this.selectedTileIndex;

        // 重新渲染画布以显示新放置的图块
        this.render();

        // 更新已放置图块的计数显示
        this.updateTileCount();

        // 更新右侧面板显示当前选中的图块信息
        this.selectTile(this.selectedTileIndex);
    }

    /**
     * removeTile方法 - 清除指定位置的图块
     * @param {number} x - 清除的列号(0-15)
     * @param {number} y - 清除的行号(0-15)
     */
    removeTile(x, y) {
        // 保存当前编辑状态到历史记录(用于撤销功能)
        this.saveHistory();

        // 计算该位置在一维数组中的索引
        const index = y * this.gridSize + x;

        // 将该位置设为-1(表示空白/未放置)
        this.tilemapData[index] = -1;

        // 重新渲染画布以移除该图块
        this.render();

        // 更新已放置图块的计数显示
        this.updateTileCount();
    }

    /**
     * render方法 - 在Canvas上绘制整个Tilemap
     * 包括背景、图块和网格线
     */
    render() {
        // ===== 清空画布 =====
        // 清除矩形区域的所有内容(清空整个画布)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ===== 绘制背景 =====
        this.ctx.fillStyle = '#f8f9fa'; // 设置填充颜色为浅灰色
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // 填充整个画布矩形

        // ===== 绘制已放置的图块 =====
        // 遍历网格的每一行和每一列
        for (let y = 0; y < this.gridSize; y++) { // y从0到15(行)
            for (let x = 0; x < this.gridSize; x++) { // x从0到15(列)
                // 计算该位置在一维数据数组中的索引
                const tileIndex = this.tilemapData[y * this.gridSize + x];

                // 检查该位置是否有图块(tileIndex != -1)且图片已加载
                if (tileIndex !== -1 && this.tileImages[tileIndex]) {
                    // 在Canvas上绘制图块图片
                    this.ctx.drawImage(
                        this.tileImages[tileIndex], // 要绘制的图片
                        x * this.tileSize, // 绘制位置的X坐标(列号 * 图块宽度)
                        y * this.tileSize, // 绘制位置的Y坐标(行号 * 图块高度)
                        this.tileSize, // 绘制图片的宽度(32像素)
                        this.tileSize // 绘制图片的高度(32像素)
                    );
                }
            }
        }

        // ===== 绘制网格线 =====
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)'; // 设置线条颜色为半透明黑色
        this.ctx.lineWidth = 1; // 设置线条宽度为1像素

        // 从0到gridSize(含)逐个绘制网格线
        for (let i = 0; i <= this.gridSize; i++) { // i从0到16(共17条线)
            // ===== 绘制垂直线(竖线) =====
            this.ctx.beginPath(); // 开始绘制新路径
            this.ctx.moveTo(i * this.tileSize, 0); // 移动到线的起点(上方)
            this.ctx.lineTo(i * this.tileSize, this.canvas.height); // 绘制到线的终点(下方)
            this.ctx.stroke(); // 描绘路径(绘制线)

            // ===== 绘制水平线(横线) =====
            this.ctx.beginPath(); // 开始绘制新路径
            this.ctx.moveTo(0, i * this.tileSize); // 移动到线的起点(左侧)
            this.ctx.lineTo(this.canvas.width, i * this.tileSize); // 绘制到线的终点(右侧)
            this.ctx.stroke(); // 描绘路径(绘制线)
        }
    }

    /**
     * saveHistory方法 - 保存当前编辑状态到历史记录
     * 用于实现撤销/重做功能
     */
    saveHistory() {
        // 剪切历史记录到当前位置(删除当前位置之后的所有"重做"状态)
        // 这样做是为了确保新操作后，之前的重做历史失效
        this.history = this.history.slice(0, this.historyIndex + 1);

        // 将当前网格数据的副本添加到历史记录
        // 使用...(展开操作符)创建数组副本，避免引用同一个数组
        this.history.push([...this.tilemapData]);

        // 更新历史记录指针到最新位置
        this.historyIndex = this.history.length - 1;

        // 如果历史记录超过20个，删除最旧的
        if (this.history.length > 20) {
            this.history.shift(); // 删除数组的第一个元素(最旧的状态)
            this.historyIndex--; // 因为删除了一个元素，指针也要往前移一位
        }
    }

    /**
     * updateTileCount方法 - 更新UI显示已放置的图块数量
     */
    updateTileCount() {
        // 计数已放置的图块数量(计数不等于-1的元素)
        // filter过滤出tileIndex !== -1的元素，length得到数量
        const count = this.tilemapData.filter(index => index !== -1).length;

        // 更新页面上的已放置图块计数显示
        document.getElementById('placed-tiles').textContent = count;
    }

    /**
     * clearCanvas方法 - 清空整个编辑画布
     * 询问用户确认后清除所有图块
     */
    clearCanvas() {
        // 显示确认对话框，询问用户是否确定清空
        if (confirm('确定要清空整个画布吗？')) {
            // 保存清空前的状态到历史记录(以便撤销)
            this.saveHistory();

            // 将所有网格数据设为-1(清空所有图块)
            this.tilemapData.fill(-1);

            // 重新渲染画布显示清空后的结果
            this.render();

            // 更新已放置图块的计数显示(应该显示0)
            this.updateTileCount();
        }
    }

    /**
     * exportAsPNG方法 - 将当前编辑的Tilemap导出为PNG图片文件
     * 用户可以下载到本地保存
     */
    exportAsPNG() {
        // ===== 创建用于导出的临时Canvas =====
        // 创建一个新的canvas元素(不在DOM中显示)
        const exportCanvas = document.createElement('canvas');

        // 获取导出Canvas的2D绘图上下文
        const exportCtx = exportCanvas.getContext('2d');

        // ===== 设置导出图片的尺寸 =====
        // 设置导出倍数(2倍=高质量)
        const scale = 2; // 2倍尺寸导出 = 1024x1024

        // 设置导出Canvas的宽度 = 编辑Canvas宽度 * 倍数
        exportCanvas.width = this.canvas.width * scale; // 512 * 2 = 1024

        // 设置导出Canvas的高度 = 编辑Canvas高度 * 倍数
        exportCanvas.height = this.canvas.height * scale; // 512 * 2 = 1024

        // ===== 填充白色背景 =====
        exportCtx.fillStyle = '#ffffff'; // 设置填充颜色为白色
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height); // 填充整个导出Canvas

        // ===== 禁用图片平滑处理 =====
        // 关闭图片抗锯齿(保持像素风格)
        exportCtx.imageSmoothingEnabled = false; // 保持原始像素效果

        // ===== 绘制缩放后的图块 =====
        // 遍历网格的每一行和每一列
        for (let y = 0; y < this.gridSize; y++) { // y从0到15(行)
            for (let x = 0; x < this.gridSize; x++) { // x从0到15(列)
                // 获取该位置的图块索引
                const tileIndex = this.tilemapData[y * this.gridSize + x];

                // 检查该位置是否有图块且图片已加载
                if (tileIndex !== -1 && this.tileImages[tileIndex]) {
                    // 在导出Canvas上绘制缩放后的图块
                    exportCtx.drawImage(
                        this.tileImages[tileIndex], // 要绘制的图片
                        x * this.tileSize * scale, // X坐标(缩放后)
                        y * this.tileSize * scale, // Y坐标(缩放后)
                        this.tileSize * scale, // 缩放后的宽度(64像素)
                        this.tileSize * scale // 缩放后的高度(64像素)
                    );
                }
            }
        }

        // ===== 创建下载链接并触发下载 =====
        // 将Canvas转换为PNG图片的Data URL
        const dataURL = exportCanvas.toDataURL('image/png');

        // 获取隐藏的下载链接元素
        const link = document.getElementById('download-link');

        // 设置链接的href为图片Data URL
        link.href = dataURL;

        // 设置下载文件名(包含时间戳确保文件名唯一)
        link.download = `tilemap_${new Date().getTime()}.png`; // 例如: tilemap_1707200000000.png

        // 模拟点击链接触发浏览器下载
        link.click();

        // 显示导出成功的提示信息
        alert('图片已导出，开始下载！');
    }

    /**
     * setupEventListeners方法 - 配置所有UI按钮和控件的事件监听器
     */
    setupEventListeners() {
        // ===== 清空画布按钮 =====
        document.getElementById('btn-clear').addEventListener('click', () => {
            this.clearCanvas(); // 调用清空画布方法
        });

        // ===== 导出为PNG按钮 =====
        document.getElementById('btn-export').addEventListener('click', () => {
            this.exportAsPNG(); // 调用导出方法
        });

        // ===== 网格尺寸下拉菜单 =====
        document.getElementById('grid-size').addEventListener('change', (e) => {
            // 获取用户选择的新网格尺寸
            const newSize = parseInt(e.target.value); // 转换为整数(8、16、24或32)

            // 检查新尺寸是否与当前不同
            if (newSize !== this.gridSize) {
                // 更新网格大小
                this.gridSize = newSize;

                // 重新初始化画布(新尺寸)
                this.setupCanvas();

                // 重新创建网格叠加层(新尺寸)
                this.setupGrid();

                // 重新渲染画布
                this.render();

                // 更新页面显示的网格尺寸信息
                document.getElementById('grid-dimensions').textContent = `${newSize}x${newSize}`;
            }
        });

        // ===== 撤销按钮 =====
        document.getElementById('btn-undo').addEventListener('click', () => {
            // 检查是否可以撤销(不在历史记录的最开始)
            if (this.historyIndex > 0) {
                // 历史指针向前移动一位(回到前一个状态)
                this.historyIndex--;

                // 恢复到指针指向的状态(深拷贝)
                this.tilemapData = [...this.history[this.historyIndex]];

                // 重新渲染画布显示撤销后的结果
                this.render();

                // 更新图块计数显示
                this.updateTileCount();
            }
        });

        // ===== 重做按钮 =====
        document.getElementById('btn-redo').addEventListener('click', () => {
            // 检查是否可以重做(不在历史记录的最末)
            if (this.historyIndex < this.history.length - 1) {
                // 历史指针向后移动一位(回到下一个状态)
                this.historyIndex++;

                // 恢复到指针指向的状态(深拷贝)
                this.tilemapData = [...this.history[this.historyIndex]];

                // 重新渲染画布显示重做后的结果
                this.render();

                // 更新图块计数显示
                this.updateTileCount();
            }
        });

        // ===== 加载示例按钮 =====
        document.getElementById('btn-load-example').addEventListener('click', () => {
            this.loadExamplePattern(); // 调用加载示例方法
        });

        // ===== 键盘快捷键 =====
        document.addEventListener('keydown', (e) => {
            // 检查是否同时按下Ctrl或Cmd(Mac)键
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z': // Ctrl+Z / Cmd+Z
                        if (e.shiftKey) {
                            // Ctrl+Shift+Z: 重做
                            document.getElementById('btn-redo').click();
                        } else {
                            // Ctrl+Z: 撤销
                            document.getElementById('btn-undo').click();
                        }
                        e.preventDefault(); // 阻止浏览器默认行为
                        break;

                    case 's': // Ctrl+S / Cmd+S
                        // Ctrl+S: 导出为PNG
                        e.preventDefault(); // 阻止浏览器默认的保存行为
                        document.getElementById('btn-export').click();
                        break;

                    case 'e': // Ctrl+E / Cmd+E
                        // Ctrl+E: 清空画布
                        e.preventDefault(); // 阻止浏览器默认行为
                        document.getElementById('btn-clear').click();
                        break;
                }
            }
        });
    }

    /**
     * loadExamplePattern方法 - 加载一个示例地图图案
     * 用于演示编辑器功能或作为编辑的起点
     */
    loadExamplePattern() {
        // ===== 保存当前状态 =====
        // 在加载示例前保存当前的编辑状态(以便用户能撤销)
        this.saveHistory();

        // ===== 清空网格 =====
        // 将所有网格数据设为-1(清空所有图块)
        this.tilemapData.fill(-1);

        // ===== 创建示例地图图案 =====
        // 绘制边框和中心图案
        for (let y = 0; y < this.gridSize; y++) { // 遍历每一行
            for (let x = 0; x < this.gridSize; x++) { // 遍历每一列
                // 检查是否在边缘(最上、最下、最左、最右)
                if (y === 0 || y === this.gridSize - 1 || x === 0 || x === this.gridSize - 1) {
                    // 在边框位置放置石墙(索引1)
                    // 这样会创建一个完整的边框
                    this.tilemapData[y * this.gridSize + x] = 1;
                } else if (x === Math.floor(this.gridSize / 2) && y === Math.floor(this.gridSize / 2)) {
                    // 在中心位置放置障碍物(索引6)
                    // Math.floor(16/2) = 8，即中心位置
                    this.tilemapData[y * this.gridSize + x] = 6;
                }
            }
        }

        // ===== 更新界面显示 =====
        // 重新渲染画布显示示例地图
        this.render();

        // 更新已放置图块的计数显示
        this.updateTileCount();
    }
}

/* ===== 页面初始化 ===== */
/**
 * DOMContentLoaded事件监听器 - 当页面DOM加载完成后执行
 * 确保所有HTML元素都已加载，再初始化JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
    // 创建TilemapEditor实例并保存到window对象(全局可访问)
    window.tilemapEditor = new TilemapEditor();

    // 在浏览器控制台输出初始化成功的消息
    console.log('Tilemap编辑器已初始化'); // 调试时可以看到这条消息
});

