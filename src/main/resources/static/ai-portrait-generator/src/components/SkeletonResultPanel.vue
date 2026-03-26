<template>
  <div class="skeleton-result-panel">
    <!-- 完整图预览 -->
    <div class="full-image-section">
      <h4>完整人体图</h4>
      <div class="image-preview">
        <img :src="result.fullImageUrl" alt="完整图" />
        <el-button size="small" @click="downloadFullImage">下载完整图</el-button>
      </div>
    </div>

    <!-- 部件网格 -->
    <div class="parts-section">
      <h4>分离的肢体部件</h4>
      <div class="parts-grid">
        <div
          v-for="(partUrl, partName) in result.parts"
          :key="partName"
          class="part-item"
          :data-part="partName"
          @mouseover="highlightPart(partName)"
          @mouseleave="clearHighlight"
        >
          <div class="part-preview">
            <img :src="partUrl" :alt="getPartDisplayName(partName)" />
          </div>
          <div class="part-info">
            <span class="part-name">{{ getPartDisplayName(partName) }}</span>
            <el-button size="small" @click="downloadPart(partName, partUrl)">
              下载
            </el-button>
          </div>
        </div>
      </div>

      <!-- 批量下载 -->
      <div class="batch-actions">
        <el-button type="primary" @click="downloadAllParts">
          批量下载所有部件 (ZIP)
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import {saveAs} from 'file-saver'

interface Props {
  result: {
    fullImageUrl: string
    parts: Record<string, string>
  }
}

const props = defineProps<Props>()

// 部件显示名称映射
const partDisplayNames: Record<string, string> = {
  head: '头部',
  torso: '躯干',
  leftArm: '左臂',
  rightArm: '右臂',
  leftLeg: '左腿',
  rightLeg: '右腿'
}

const getPartDisplayName = (partName: string) => {
  return partDisplayNames[partName] || partName
}

// 下载单个部件
const downloadPart = async (partName: string, partUrl: string) => {
  try {
    const response = await fetch(partUrl)
    const blob = await response.blob()
    saveAs(blob, `skeleton_${partName}.png`)
  } catch (error) {
    console.error('下载部件失败:', error)
  }
}

// 下载完整图
const downloadFullImage = async () => {
  try {
    const response = await fetch(props.result.fullImageUrl)
    const blob = await response.blob()
    saveAs(blob, 'skeleton_full.png')
  } catch (error) {
    console.error('下载完整图失败:', error)
  }
}

// 批量下载所有部件
const downloadAllParts = async () => {
  try {
    const zip = new JSZip()

    // 添加完整图
    const fullImageResponse = await fetch(props.result.fullImageUrl)
    const fullImageBlob = await fullImageResponse.blob()
    zip.file('skeleton_full.png', fullImageBlob)

    // 添加所有部件
    for (const [partName, partUrl] of Object.entries(props.result.parts)) {
      const partResponse = await fetch(partUrl)
      const partBlob = await partResponse.blob()
      zip.file(`skeleton_${partName}.png`, partBlob)
    }

    // 生成并下载 ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'skeleton_assets.zip')

  } catch (error) {
    console.error('批量下载失败:', error)
  }
}

// 高亮显示部件
const highlightPart = (partName: string) => {
  // 为部件添加高亮效果
  const partElement = document.querySelector(`[data-part="${partName}"]`)
  if (partElement) {
    partElement.classList.add('highlighted')
  }
}

const clearHighlight = () => {
  // 清除所有高亮效果
  const highlightedElements = document.querySelectorAll('.highlighted')
  highlightedElements.forEach(el => {
    el.classList.remove('highlighted')
  })
}
</script>

<style scoped lang="scss">
.skeleton-result-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

.full-image-section {
  .image-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    img {
      max-width: 300px;
      max-height: 400px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
    }
  }
}

.parts-section {
  .parts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin: 16px 0;
  }

  .part-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fafafa;

    .part-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
      background: white;
      border-radius: 4px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .part-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;

      .part-name {
        font-size: 12px;
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .batch-actions {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  // 高亮效果
  .part-item.highlighted {
    border-color: #409eff;
    background: #e3f2fd;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

    .part-preview {
      background: #ffffff;
    }

    .part-name {
      color: #409eff;
      font-weight: 600;
    }
  }
}
</style>

