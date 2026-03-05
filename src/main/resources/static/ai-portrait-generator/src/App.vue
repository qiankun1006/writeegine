<template>
  <div id="app" class="ai-portrait-app">
    <NavigationBar />
    <main class="main-container">
      <div class="layout-wrapper">
        <!-- 左侧核心参数面板 -->
        <aside class="core-params-panel">
          <CoreParamsPanel />
        </aside>

        <!-- 模型选择面板 -->
        <aside class="model-selection-panel">
          <ModelSelectionPanel />
        </aside>

        <!-- 中间高级参数面板 -->
        <aside class="advanced-params-panel">
          <AdvancedParamsPanel />
        </aside>

        <!-- 右侧结果展示面板 -->
        <section class="results-panel">
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
import ModelSelectionPanel from '@/components/ModelSelectionPanel.vue'
import AdvancedParamsPanel from '@/components/AdvancedParamsPanel.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'

onMounted(() => {
  console.log('🎨 AI 人物立绘生成器已就绪')
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.ai-portrait-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $light-gray;
}

.main-container {
  flex: 1;
  overflow: visible;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.layout-wrapper {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100%;
  gap: $spacing-md;
  padding: $spacing-md;
  overflow: visible;
  width: 100%;
  max-width: 100%;

  @media (min-width: 1440px) {
    grid-template-columns: 320px 320px 320px 1fr;
    padding: $spacing-lg;
    gap: $spacing-lg;
  }
}

// 核心参数面板
.core-params-panel {
  width: 320px;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;
  box-shadow: $shadow-md;
  flex-shrink: 0;
  max-height: calc(100vh - 80px); // 减去导航栏高度

  @include responsive-tablet {
    width: 280px;
    padding: $spacing-md;
  }

  @include responsive-mobile {
    display: none;
  }
}

// 模型选择面板
.model-selection-panel {
  width: 320px;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;
  box-shadow: $shadow-md;
  flex-shrink: 0;
  max-height: calc(100vh - 80px);

  @include responsive-tablet {
    width: 280px;
    padding: $spacing-md;
  }

  @include responsive-mobile {
    display: none;
  }
}

// 高级参数面板
.advanced-params-panel {
  width: 320px;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;
  box-shadow: $shadow-md;
  flex-shrink: 0;
  max-height: calc(100vh - 80px);

  @include responsive-tablet {
    width: 280px;
    padding: $spacing-md;
  }

  @include responsive-mobile {
    display: none;
  }
}

.results-panel {
  flex: 1;
  background-color: $white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  overflow-y: auto;
  box-shadow: $shadow-md;
  min-width: 0; // 允许 grid 内容收缩
  width: 100%; // 填充剩余空间

  @include responsive-mobile {
    width: 100%;
    padding: $spacing-md;
  }
}

// 所有屏幕<1440px时：隐藏高级参数面板
@media (max-width: 1439px) {
  .advanced-params-panel {
    display: none !important; // 高级参数折叠在核心参数中
  }
}

// 平板端（768-1023px）：两栏堆叠
@include responsive-tablet {
  .layout-wrapper {
    flex-direction: column;
    gap: $spacing-md;
  }

  .core-params-panel,
  .advanced-params-panel {
    width: 100%;
    max-height: 40%;
  }

  .results-panel {
    flex: 1;
  }
}

// 手机端（<768px）：单栏堆叠
@include responsive-mobile {
  .layout-wrapper {
    flex-direction: column;
    padding: $spacing-sm;
    gap: $spacing-sm;
  }

  .results-panel {
    width: 100%;
  }
}
</style>

