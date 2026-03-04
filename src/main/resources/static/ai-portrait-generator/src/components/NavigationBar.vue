<template>
  <nav class="navigation-bar" :class="{ scrolling: isScrolling }">
    <div class="nav-container">
      <!-- 左侧品牌 -->
      <div class="nav-brand">
        <span class="brand-icon">🎨</span>
        <h1 class="brand-name">AI立绘生成器</h1>
      </div>

      <!-- 右侧用户中心 -->
      <div class="nav-user">
        <div class="user-placeholder">
          <el-icon><User /></el-icon>
          <span>用户中心</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {User} from '@element-plus/icons-vue'

const isScrolling = ref(false)

const handleScroll = () => {
  isScrolling.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">

.navigation-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  background: linear-gradient(135deg, $primary-purple 0%, lighten($primary-purple, 5%) 100%);
  color: $white;
  box-shadow: none;
  transition: all 0.3s ease;

  &.scrolling {
    box-shadow: $shadow-lg;
    background: rgba(108, 92, 231, 0.95);
  }
}

.nav-container {
  height: 100%;
  padding: 0 $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  margin: 0 auto;

  @include responsive-mobile {
    padding: 0 $spacing-md;
  }
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    opacity: 0.9;
  }
}

.brand-icon {
  font-size: 28px;
  display: flex;
  align-items: center;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;

  @include responsive-mobile {
    font-size: 16px;
  }
}

.nav-user {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.user-placeholder {
  @include flex-center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background-color: rgba($white, 0.1);
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-fast;
  font-size: 14px;

  &:hover {
    background-color: rgba($white, 0.2);
  }

  :deep(.el-icon) {
    font-size: 18px;
  }
}
</style>

