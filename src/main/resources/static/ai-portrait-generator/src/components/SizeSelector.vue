<template>
  <div class="size-selector">
    <!-- 模块标题：📐 生成尺寸 -->
    <h3 class="module-title">📐 生成尺寸</h3>

    <div class="size-options">
      <!-- 预设尺寸选项 -->
      <div class="preset-sizes">
        <el-radio-group v-model="selectedSize" @change="handleSizeChange">
          <el-radio label="512x768" class="size-option">
            <div class="size-content">
              <span class="size-icon">📱</span>
              <div class="size-info">
                <p class="size-name">手机壁纸</p>
                <p class="size-dimensions">512×768</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="768x512" class="size-option">
            <div class="size-content">
              <span class="size-icon">💻</span>
              <div class="size-info">
                <p class="size-name">电脑壁纸</p>
                <p class="size-dimensions">768×512</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="1024x1024" class="size-option">
            <div class="size-content">
              <span class="size-icon">🖼️</span>
              <div class="size-info">
                <p class="size-name">方形头像</p>
                <p class="size-dimensions">1024×1024</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="2048x2048" class="size-option">
            <div class="size-content">
              <span class="size-icon">🎨</span>
              <div class="size-info">
                <p class="size-name">高清画作</p>
                <p class="size-dimensions">2048×2048</p>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 自定义尺寸 -->
      <div class="custom-size">
        <div class="custom-header">
          <span class="custom-label">自定义尺寸</span>
          <el-switch
            v-model="useCustomSize"
            size="small"
            @change="handleCustomToggle"
          />
        </div>

        <div v-if="useCustomSize" class="custom-inputs">
          <div class="dimension-input">
            <label>宽度</label>
            <el-select
              v-model="customWidth"
              placeholder="选择宽度"
              @change="handleCustomSizeChange"
            >
              <el-option v-for="size in validSizes" :key="size" :label="size" :value="size" />
            </el-select>
          </div>

          <div class="dimension-input">
            <label>高度</label>
            <el-select
              v-model="customHeight"
              placeholder="选择高度"
              @change="handleCustomSizeChange"
            >
              <el-option v-for="size in validSizes" :key="size" :label="size" :value="size" />
            </el-select>
          </div>

          <div class="size-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>建议使用2的幂次方尺寸以获得最佳效果</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 尺寸验证提示 -->
    <div v-if="!store.isSizeValid" class="error-hint">
      <el-icon><Warning /></el-icon>
      <span>请选择有效的尺寸（256、512、1024、2048）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {usePortraitStore} from '@/stores/portraitStore'
import {InfoFilled, Warning} from '@element-plus/icons-vue'

// ========== 获取全局数据管理 ==========
// store 是用来存储整个应用的参数数据，比如：图片宽度、高度等
// 它相当于一个全局的"记忆库"，应用中任何地方都可以访问和修改这里面的数据
const store = usePortraitStore()

// ========== 定义允许的尺寸 ==========
// validSizes 是允许用户选择的宽度和高度的值
// 只有这 4 个数值可以选择：256、512、1024、2048 像素
// （为什么是这些数？因为这些是 2 的倍数，AI 图生图模型对这些尺寸支持最好）
const validSizes = [256, 512, 1024, 2048]

// ========== 预设的常用尺寸组合 ==========
// sizePresets 是预先定义好的、常见的图片尺寸组合
// 就像手机壳的常见尺寸一样，不用每次都自己输入
// 例如：'512x768' 表示宽 512 像素、高 768 像素的竖屏手机壁纸尺寸
const sizePresets = {
  '512x768': { width: 512, height: 768 },      // 手机壁纸（竖屏）
  '768x512': { width: 768, height: 512 },      // 电脑壁纸（横屏）
  '1024x1024': { width: 1024, height: 1024 },  // 方形头像
  '2048x2048': { width: 2048, height: 2048 }   // 高清画作
}

// ========== 当前用户选中的预设尺寸 ==========
// selectedSize 记录用户点击了哪个预设尺寸
// 初始值是空字符串，表示还没有选择
// 例如：当用户点击"手机壁纸"时，这里就会变成 '512x768'
const selectedSize = ref<string>('')

// ========== 是否开启自定义尺寸模式 ==========
// useCustomSize 是一个开关，用来控制是否显示"自定义尺寸"输入框
// 值为 true 时：显示自定义输入框，用户可以手动输入宽和高
// 值为 false 时：隐藏自定义输入框，只显示预设尺寸选项
const useCustomSize = ref(false)

// ========== 自定义的宽度 ==========
// customWidth 保存用户自定义输入的图片宽度（单位：像素）
// 初始值是 512，用户可以从 validSizes 中选择
const customWidth = ref<number>(512)

// ========== 自定义的高度 ==========
// customHeight 保存用户自定义输入的图片高度（单位：像素）
// 初始值是 768，用户可以从 validSizes 中选择
const customHeight = ref<number>(768)

// ========== 计算属性：根据当前宽高找出对应的预设尺寸 ==========
// currentSizeKey 会自动查找 store 中的宽度和高度
// 然后在 sizePresets 中查找是否有对应的预设尺寸
// 例如：如果宽=512，高=768，就返回 '512x768'
// 如果找不到对应的预设，就返回空字符串
const currentSizeKey = computed(() => {
  const { width, height } = store.params
  for (const [key, size] of Object.entries(sizePresets)) {
    if (size.width === width && size.height === height) {
      return key
    }
  }
  return ''
})

// ========== 监听器：当 store 中的宽高改变时 ==========
// 这个监听器会检查 store 中的宽高是否改变
// 如果改变了，并且不是在自定义模式下，就自动更新 selectedSize
// 目的是让用户界面始终显示正确的预设尺寸
watch(() => [store.params.width, store.params.height], () => {
  if (!useCustomSize.value) {
    selectedSize.value = currentSizeKey.value
  }
})

// ========== 函数：当用户点击预设尺寸时 ==========
// handleSizeChange 被用户点击某个预设尺寸（比如"手机壁纸"）时触发
// 它的作用是：
//   1. 获取用户选中的尺寸参数（宽度、高度）
//   2. 更新 store 中的宽度和高度
//   3. 保存参数到本地存储（这样下次用户打开时会记住这个选择）
//   4. 关闭自定义模式
const handleSizeChange = (sizeKey: string) => {
  if (sizeKey && sizePresets[sizeKey as keyof typeof sizePresets]) {
    const size = sizePresets[sizeKey as keyof typeof sizePresets]
    store.params.width = size.width
    store.params.height = size.height
    store.saveParams()
    useCustomSize.value = false
  }
}

// ========== 函数：当用户切换预设/自定义模式时 ==========
// handleCustomToggle 被用户打开或关闭"自定义尺寸"开关时触发
// useCustom 参数表示用户选择的状态：
//   - 如果 useCustom 为 true：用户打开了自定义模式
//     -> 把当前 store 中的宽高临时保存到 customWidth 和 customHeight
//     -> 清除预设选择
//   - 如果 useCustom 为 false：用户关闭了自定义模式
//     -> 回到预设模式，调用 handleSizeChange 来更新数据
const handleCustomToggle = (useCustom: boolean) => {
  if (useCustom) {
    // 切换到自定义模式：先把现有的宽高保存起来
    customWidth.value = store.params.width
    customHeight.value = store.params.height
    selectedSize.value = ''
  } else {
    // 切换回预设模式：应用预设参数
    handleSizeChange(currentSizeKey.value || '512x768')
  }
}

// ========== 函数：当用户在自定义模式下改变宽度或高度时 ==========
// handleCustomSizeChange 被用户在自定义输入框中改变宽或高时触发
// 它的作用是：
//   1. 检查是否处于自定义模式，且宽高都有值
//   2. 更新 store 中的宽度和高度
//   3. 保存参数到本地存储
const handleCustomSizeChange = () => {
  if (useCustomSize.value && customWidth.value && customHeight.value) {
    store.params.width = customWidth.value
    store.params.height = customHeight.value
    store.saveParams()
  }
}

// ========== 生命周期钩子：组件首次加载时 ==========
// onMounted 在组件首次出现在页面上时被执行一次
// 这里的作用是：初始化组件状态
//   1. 检查 store 中的宽高是否在预设列表中
//   2. 如果在预设中：显示对应的预设选项，隐藏自定义输入框
//   3. 如果不在预设中：显示自定义输入框，同时把 store 中的宽高显示出来
onMounted(() => {
  // 检查当前尺寸是否在预设中
  const sizeKey = currentSizeKey.value
  if (sizeKey) {
    // 在预设中：选中对应的预设，关闭自定义模式
    selectedSize.value = sizeKey
    useCustomSize.value = false
  } else {
    // 不在预设中：打开自定义模式，把现有的宽高显示出来
    useCustomSize.value = true
    customWidth.value = store.params.width
    customHeight.value = store.params.height
  }
})
</script>

<style scoped lang="scss">
// ========== 整个尺寸选择器的容器 ==========
// 使用 flex 布局让内容纵向排列（从上到下）
// gap: 12px 表示各元素之间间隔 12 像素
.size-selector {
  display: flex;           // 开启弹性布局
  flex-direction: column;  // 从上到下排列
  gap: 24px;              // 元素之间间隔 12 像素
}

// ========== 模块标题样式（"📐 生成尺寸"） ==========
.module-title {
  font-size: 13px;      // 字体大小 13 像素
  font-weight: 600;     // 字体粗细（600 = 粗体）
  color: #303133;       // 字体颜色（深灰色）
  margin: 0;            // 外边距为 0（紧贴周围元素）
  padding: 0;           // 内边距为 0（内容与边界贴住）
}

// ========== 尺寸选项容器 ==========
// 包含预设尺寸和自定义尺寸两个部分
// 纵向排列，间隔 24 像素
.size-options {
  display: flex;           // 弹性布局
  flex-direction: column;  // 纵向排列
  gap: 24px;              // 预设和自定义部分之间间隔 24 像素
}

// ========== 预设尺寸选项的网格布局 ==========
// 显示 4 个预设尺寸方块：手机壁纸、电脑壁纸、方形头像、高清画作
// 排成 2 行 2 列的网格
.preset-sizes {
  :deep(.el-radio-group) {
    display: grid;                      // 网格布局（表格一样的排列方式）
    grid-template-columns: repeat(2, 1fr); // 分成 2 列，每列宽度相等
    column-gap: 24px;                   // 横向间距：左右两个方块之间的距离 24 像素
    row-gap: 24px;                      // 纵向间距：上下两个方块之间的距离 16 像素
    width: 100%;                        // 占满整个容器宽度
  }
}

// ========== 单个尺寸选项方块的样式 ==========
// 这是 4 个方块中的每一个
.size-option {
  width: 100%;  // 占满所在列的宽度
  margin: 0;    // 没有外边距

  // 隐藏原生的单选框圆点（因为我们用自定义样式）
  :deep(.el-radio__input) {
    display: none;  // 不显示
  }

  // 方块本体的样式
  :deep(.el-radio__label) {
    padding: 4px 16px;             // 内边距：上下 14px，左右 16px（给内容留出空间）
    border: 2px solid #e0e0e0;      // 边框：2 像素灰色边线
    border-radius: 8px;             // 圆角：8 像素（四个角都是圆的）
    background: white;              // 背景色：白色
    transition: all 0.3s ease;      // 过渡动画：所有属性在 0.3 秒内平滑变化
    cursor: pointer;                // 鼠标指针变成手指（表示可点击）
    width: 100%;                    // 占满整个方块
    display: block;                 // 让方块占据一行

    // 鼠标悬停时的效果
    &:hover {
      border-color: #c0c0c0;        // 边框颜色变浅
      background: #fafafa;          // 背景变成浅灰色
    }
  }

  // 方块被选中时的样式
  :deep(.el-radio.is-checked .el-radio__label) {
    border-color: #6c5ce7;                                  // 边框变成紫色
    background: #f0f2ff;                                    // 背景变成浅紫色
    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);         // 添加淡紫色阴影（有立体感）
  }
}

// ========== 方块内容的布局 ==========
// 包含图标、名称、尺寸信息
.size-content {
  display: flex;           // 水平排列
  align-items: center;     // 竖直方向居中
  gap: 12px;              // 图标和文字之间间隔 12 像素
}

// ========== 图标样式 ==========
// 比如 📱 💻 🖼️ 🎨 这样的大表情符号
.size-icon {
  font-size: 24px;  // 字体大小 24 像素
  flex-shrink: 0;   // 禁止缩小（防止被挤压）
}

// ========== 文字信息的容器 ==========
// 包含名称（如"手机壁纸"）和尺寸（如"512×768"）
.size-info {
  display: flex;           // 弹性布局
  flex-direction: column;  // 纵向排列（名称在上，尺寸在下）
  gap: 2px;               // 名称和尺寸之间间隔 2 像素
  min-width: 0;           // 允许文字被挤压（防止超出方块）
}

// ========== 尺寸选项名称样式 ==========
// 比如"手机壁纸"、"电脑壁纸"等
.size-name {
  font-size: 12px;            // 字体大小 12 像素
  font-weight: 600;           // 字体粗细（粗体）
  color: #303133;             // 字体颜色（深灰色）
  margin: 0;                  // 没有外边距
  white-space: nowrap;        // 不换行（保持在一行上）
  overflow: hidden;           // 超出部分隐藏
  text-overflow: ellipsis;    // 超出用省略号（...）表示
}

// ========== 尺寸数值样式 ==========
// 比如"512×768"、"1024×1024"等
.size-dimensions {
  font-size: 11px;    // 字体大小 11 像素（比名称小）
  color: #909399;     // 字体颜色（浅灰色）
  margin: 0;          // 没有外边距
}

// ========== 自定义尺寸容器 ==========
// 当用户打开"自定义尺寸"开关时显示
// 包含一个标题、一个开关、两个输入框
.custom-size {
  display: flex;           // 弹性布局
  flex-direction: column;  // 纵向排列
  gap: 12px;              // 内部元素间隔 12 像素
  padding: 12px;          // 内边距 12 像素（给内容留出空间）
  background: #f9f9f9;    // 背景色：浅灰色（与预设区域区分开）
  border-radius: 8px;     // 圆角 8 像素
  border: 1px solid #f0f0f0; // 边框：浅灰色，1 像素
}

// ========== 自定义尺寸的标题行 ==========
// 包含"自定义尺寸"文字和 on/off 开关
.custom-header {
  display: flex;              // 水平排列
  justify-content: space-between; // 两端对齐（文字在左，开关在右）
  align-items: center;        // 竖直居中
}

// ========== "自定义尺寸"标签文字 ==========
.custom-label {
  font-size: 12px;      // 字体大小 12 像素
  font-weight: 500;     // 字体粗细（中等粗）
  color: #606266;       // 字体颜色（中等灰色）
}

// ========== 自定义输入框的容器 ==========
// 包含宽度输入框、高度输入框、提示信息
.custom-inputs {
  display: flex;           // 弹性布局
  flex-direction: column;  // 纵向排列
  gap: 12px;              // 各输入框间隔 12 像素
}

// ========== 单个输入框组（宽度或高度） ==========
// 包含标签文字和下拉选择框
.dimension-input {
  display: flex;           // 弹性布局
  flex-direction: column;  // 纵向排列（标签在上，选择框在下）
  gap: 6px;               // 标签和选择框间隔 6 像素

  // 标签文字样式（"宽度"、"高度"）
  label {
    font-size: 12px;      // 字体大小 12 像素
    color: #606266;       // 字体颜色（中等灰色）
    font-weight: 500;     // 字体粗细（中等粗）
  }

  // 下拉选择框的宽度
  :deep(.el-select) {
    width: 100%;  // 占满整个容器宽度
  }
}

// ========== 提示信息框 ==========
// 显示"建议使用2的幂次方尺寸以获得最佳效果"
.size-hint {
  display: flex;           // 弹性布局
  align-items: center;     // 竖直居中
  gap: 6px;               // 图标和文字间隔 6 像素
  padding: 8px;           // 内边距 8 像素
  background: #e8f4ff;    // 背景色：浅蓝色（信息提示色）
  border-radius: 4px;     // 圆角 4 像素
  border: 1px solid #b3d9ff; // 边框：浅蓝色，1 像素

  // 信息图标样式
  :deep(.el-icon) {
    color: #1890ff;       // 颜色：蓝色
    font-size: 14px;      // 大小 14 像素
    flex-shrink: 0;       // 禁止缩小
  }

  // 提示文字样式
  span {
    font-size: 11px;      // 字体大小 11 像素（比较小）
    color: #1890ff;       // 字体颜色：蓝色（与图标统一）
    line-height: 1.4;     // 行高 1.4（让多行文字更清晰）
  }
}

// ========== 错误提示框 ==========
// 当用户选择的尺寸不合法时显示
// 显示错误信息："请选择有效的尺寸（256、512、1024、2048）"
.error-hint {
  display: flex;           // 弹性布局
  align-items: center;     // 竖直居中
  gap: 6px;               // 图标和文字间隔 6 像素
  padding: 8px;           // 内边距 8 像素
  background-color: rgba(245, 34, 45, 0.1); // 背景色：浅红色（错误提示色）
  border: 1px solid #f5222d;                 // 边框：深红色，1 像素
  border-radius: 4px;                        // 圆角 4 像素
  color: #f5222d;                            // 字体颜色：深红色
  font-size: 12px;                           // 字体大小 12 像素

  // 错误图标样式
  :deep(.el-icon) {
    font-size: 14px;  // 大小 14 像素
    flex-shrink: 0;   // 禁止缩小
  }
}
</style>

