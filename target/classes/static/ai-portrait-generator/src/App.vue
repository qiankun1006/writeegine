<template>
  <div id="app" class="ai-portrait-app">
    <NavigationBar />
    <main class="main-container">
      <div class="layout-wrapper">
        <!-- 左侧控制区：集合所有参数配置 -->
        <aside class="control-panel">
          <!-- 提示词模块 -->
          <div class="control-section">
            <CoreParamsPanel />
          </div>

          <!-- 参数配置模块（默认折叠） -->
          <div class="control-section">
            <AdvancedParamsPanel />
          </div>
        </aside>

        <!-- 右侧预览区：占据剩余宽度 -->
        <section class="preview-panel">
          <ResultsPanel />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import NavigationBar from '@/components/NavigationBar.vue'
import CoreParamsPanel from '@/components/CoreParamsPanel.vue'
import AdvancedParamsPanel from '@/components/AdvancedParamsPanel.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'

onMounted(() => {
  console.log('🎨 AI 人物立绘生成器已就绪')
})
</script>

<style scoped lang="scss">
// 导入主题变量（颜色、间距、圆角等）
@import '@/styles/theme.scss';

// ========== 应用根容器 ==========
.ai-portrait-app {
  width: 100%;                           // 占据父容器宽度
  height: 100vh;                         // 占据整个视口高度（100% of viewport height）
  display: flex;                         // 使用Flex布局
  flex-direction: column;                // 子元素垂直排列（上下方向）
  background-color: $light-gray;         // 背景色为浅灰色（从主题变量中取）
}

// ========== 主容器 ==========
.main-container {
  flex: 1;                               // 占据剩余所有高度（flex-grow: 1）
  overflow: hidden;                      // 超出内容隐藏（不显示滚动条）
  display: flex;                         // 使用Flex布局
  flex-direction: column;                // 子元素垂直排列
  width: 100%;                           // 占据父容器宽度
  min-height: 0;                         // 关键：让Flex容器能正确计算高度，允许内容收缩
}

// ========== 布局容器（Flexbox 双栏布局） ==========
.layout-wrapper {
  display: flex;                         // 使用 Flexbox 布局（简洁双栏）
  gap: 20px;                             // 左右栏间距 20px
  padding: 20px;                         // 整体内边距 20px
  height: 100%;                          // 占据父容器完整高度
  overflow: hidden;                      // 超出内容隐藏
  width: 100%;                           // 占据父容器宽度
  max-width: 100%;                       // 最大宽度不超过父容器
  min-width: 1200px;                     // 最小宽度限制 1200px（PC 端优化）
}

// ========== 左侧控制区（固定 380px） ==========
.control-panel {
  width: 380px;                          // 固定宽度 380px
  flex-shrink: 0;                        // 防止被压缩
  background-color: #f5f5f5;             // 浅灰背景
  border-radius: 8px;                    // 圆角 8px
  padding: 16px;                         // 内边距 16px
  overflow-y: auto;                      // 垂直滚动
  display: flex;                         // Flex 布局
  flex-direction: column;                // 竖向排列模块
  gap: 12px;                             // 模块间距 12px
}

// ========== 控制区内部模块 ==========
.control-section {
  display: flex;                         // Flex 布局
  flex-direction: column;                // 竖向排列
  gap: 8px;                              // 内部间距 8px
}

// ========== 右侧预览区（自适应填充） ==========
.preview-panel {
  flex: 1;                               // 占据剩余宽度
  display: flex;                         // Flex 布局
  flex-direction: column;                // 竖向排列（上方预览 + 下方按钮）
  background-color: #ffffff;             // 纯白背景
  border-radius: 8px;                    // 圆角 8px
  overflow: hidden;                      // 隐藏超出内容
  min-width: 0;                          // 允许内容收缩
}
</style>

