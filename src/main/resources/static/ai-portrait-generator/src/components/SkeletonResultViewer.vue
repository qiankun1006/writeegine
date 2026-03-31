<template>
  <div class="skeleton-result-viewer">
    <!-- 骨骼素材生成结果展示 -->
    <div v-if="!result" class="empty-result">
      <div class="empty-icon">🦴</div>
      <p class="empty-title">骨骼素材生成结果</p>
      <p class="empty-description">请先完成骨骼素材生成</p>
    </div>

    <div v-else class="result-container">
      <!-- 头部信息 -->
      <div class="result-header">
        <div class="header-left">
          <h2>🎨 骨骼素材生成完成</h2>
          <div class="generation-info">
            <el-tag type="success">已完成</el-tag>
            <span class="timestamp">{{ formatTime(result.generatedAt) }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="downloadAll">
            <el-icon><Download /></el-icon>
            下载所有文件
          </el-button>
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 主要内容区域 -->
      <div class="result-content">
        <!-- 左侧：骨骼预览 -->
        <div class="result-left">
          <!-- 角色图像 -->
          <div class="image-section">
            <h3>🎨 生成的角色图像</h3>
            <div class="image-container">
              <img :src="result.characterImageUrl" alt="角色图像" class="character-image" />
              <div class="image-overlay">
                <el-button type="primary" size="small" @click="downloadImage(result.characterImageUrl, 'character.png')">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 骨骼线图 -->
          <div class="image-section">
            <h3>📐 OpenPose 骨骼线图</h3>
            <div class="image-container">
              <img :src="result.skeletonLineImageUrl" alt="骨骼线图" class="skeleton-image" />
              <div class="image-overlay">
                <el-button type="primary" size="small" @click="downloadImage(result.skeletonLineImageUrl, 'skeleton.png')">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：部件预览和导出 -->
        <div class="result-right">
          <!-- 部件预览网格 -->
          <div class="parts-section">
            <h3>🔧 分割部件预览</h3>
            <div class="parts-grid">
              <div
                v-for="part in result.segmentedParts"
                :key="part.part"
                class="part-card"
                :class="{ active: selectedPart === part }"
                @click="selectedPart = part"
              >
                <div class="part-header">
                  <div class="part-icon">
                    {{ getPartIcon(part.part) }}
                  </div>
                  <div class="part-name">{{ getPartName(part.part) }}</div>
                </div>
                <div class="part-image">
                  <img :src="part.imageUrl" :alt="part.part" />
                </div>
              </div>
            </div>
          </div>

          <!-- 当前选中部件详情 -->
          <div v-if="selectedPart" class="part-detail">
            <h3>📋 部件详情 - {{ getPartName(selectedPart.part) }}</h3>
            <div class="detail-content">
              <div class="detail-image">
                <img :src="selectedPart.imageUrl" :alt="selectedPart.part" />
              </div>
              <div class="detail-actions">
                <el-button type="primary" @click="downloadImage(selectedPart.imageUrl, `${selectedPart.part}.png`)">
                  <el-icon><Download /></el-icon>
                  下载此部件
                </el-button>
                <el-button @click="previewPart(selectedPart)">
                  <el-icon><ZoomIn /></el-icon>
                  预览大图
                </el-button>
                <el-button v-if="selectedPart.maskUrl" @click="toggleMask">
                  <el-icon><View /></el-icon>
                  {{ showMask ? '隐藏' : '显示' }}遮罩
                </el-button>
              </div>
            </div>
          </div>

          <!-- 骨骼绑定数据 -->
          <div class="bone-data-section">
            <h3>🦴 骨骼绑定数据</h3>
            <div class="bone-format-tabs">
              <el-tabs v-model="activeBoneFormat" type="card">
                <el-tab-pane label="Spine" name="spine">
                  <div class="bone-data-container">
                    <pre class="bone-data-code">{{ result.boneData.spine }}</pre>
                    <div class="bone-data-actions">
                      <el-button type="primary" @click="copyBoneData('spine')">
                        <el-icon><CopyDocument /></el-icon>
                        复制JSON
                      </el-button>
                      <el-button @click="downloadBoneData('spine')">
                        <el-icon><Download /></el-icon>
                        下载配置文件
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="DragonBones" name="dragonbones">
                  <div class="bone-data-container">
                    <pre class="bone-data-code">{{ result.boneData.dragonbones }}</pre>
                    <div class="bone-data-actions">
                      <el-button type="primary" @click="copyBoneData('dragonbones')">
                        <el-icon><CopyDocument /></el-icon>
                        复制JSON
                      </el-button>
                      <el-button @click="downloadBoneData('dragonbones')">
                        <el-icon><Download /></el-icon>
                        下载配置文件
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <!-- 生成信息 -->
          <div class="generation-info-section">
            <h3>📊 生成信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">总耗时</div>
                <div class="info-value">{{ result.duration }} 秒</div>
              </div>
              <div class="info-item">
                <div class="info-label">部件数量</div>
                <div class="info-value">{{ result.segmentedParts.length }} 个</div>
              </div>
              <div class="info-item">
                <div class="info-label">OpenPose模板</div>
                <div class="info-value">{{ result.openPoseTemplate === 'openpose_18' ? '18点' : '25点' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">生成模式</div>
                <div class="info-value">{{ result.generationMode === 'enhanced' ? '增强模式' : '基础模式' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 部件预览对话框 -->
    <el-dialog v-model="partPreviewVisible" :title="`部件预览 - ${getPartName(selectedPart?.part || '')}`" width="60%">
      <div class="part-preview-dialog">
        <div class="preview-image-container">
          <img :src="selectedPart?.imageUrl" alt="部件预览" />
        </div>
        <div v-if="selectedPart?.maskUrl && showMask" class="mask-overlay">
          <div class="mask-label">遮罩</div>
          <img :src="selectedPart.maskUrl" alt="遮罩" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="partPreviewVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadImage(selectedPart?.imageUrl || '', `${selectedPart?.part || 'part'}.png`)">
            下载
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {CopyDocument, Download, View, ZoomIn} from '@element-plus/icons-vue'

interface SegmentedPart {
  part: string
  imageUrl: string
  maskUrl?: string
}

interface BoneData {
  spine: string
  dragonbones: string
}

interface SkeletonGenerationResult {
  generatedAt: string
  taskId: string
  characterImageUrl: string
  skeletonLineImageUrl: string
  segmentedParts: SegmentedPart[]
  boneData: BoneData
  openPoseTemplate: string
  generationMode: string
  duration: number
}

// Props
interface Props {
  result: SkeletonGenerationResult | null
}

const props = withDefaults(defineProps<Props>(), {
  result: null
})

// Local state
const selectedPart = ref<SegmentedPart | null>(null)
const partPreviewVisible = ref(false)
const showMask = ref(false)
const activeBoneFormat = ref('spine')

// Part icons mapping
const partIcons: Record<string, string> = {
  head: '👤',
  torso: '🧍',
  leftArm: '💪',
  rightArm: '💪',
  leftLeg: '🦵',
  rightLeg: '🦵',
  leftHand: '✋',
  rightHand: '✋',
  leftFoot: '👣',
  rightFoot: '👣',
  weapon: '⚔️',
  accessory: '💍'
}

const partNames: Record<string, string> = {
  head: '头部',
  torso: '躯干',
  leftArm: '左臂',
  rightArm: '右臂',
  leftLeg: '左腿',
  rightLeg: '右腿',
  leftHand: '左手',
  rightHand: '右手',
  leftFoot: '左脚',
  rightFoot: '右脚',
  weapon: '武器',
  accessory: '饰品'
}

// Computed
const formattedBoneData = computed(() => {
  if (!props.result) return ''
  const data = props.result.boneData[activeBoneFormat.value as keyof BoneData]
  try {
    return JSON.stringify(JSON.parse(data), null, 2)
  } catch {
    return data
  }
})

// Methods
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

const getPartIcon = (part: string) => {
  return partIcons[part] || '🔧'
}

const getPartName = (part: string) => {
  return partNames[part] || part
}

const previewPart = (part: SegmentedPart) => {
  selectedPart.value = part
  partPreviewVisible.value = true
}

const toggleMask = () => {
  showMask.value = !showMask.value
}

const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    ElMessage.success(`已下载: ${filename}`)
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

const downloadAll = async () => {
  try {
    ElMessageBox.confirm(
      '确认下载所有骨骼素材文件？这将包含完整的角色图像、骨骼线图、所有部件图像和骨骼绑定数据。',
      '下载所有文件',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(async () => {
      // 创建ZIP文件（实际应该从后端获取）
      if (props.result?.downloadUrl) {
        window.open(props.result.downloadUrl, '_blank')
        ElMessage.success('开始下载...')
      } else {
        // 如果没有downloadUrl，模拟下载单个文件
        if (props.result) {
          // 下载角色图像
          await downloadImage(props.result.characterImageUrl, 'character.png')
          // 下载骨骼线图
          await downloadImage(props.result.skeletonLineImageUrl, 'skeleton.png')
          // 下载所有部件
          for (const part of props.result.segmentedParts) {
            await downloadImage(part.imageUrl, `${part.part}.png`)
          }
          // 下载骨骼数据
          downloadBoneData('spine')
          downloadBoneData('dragonbones')
        }
        ElMessage.success('所有文件已开始下载')
      }
    })
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

const copyBoneData = async (format: string) => {
  if (!props.result) return

  const data = props.result.boneData[format as keyof BoneData]
  try {
    await navigator.clipboard.writeText(data)
    ElMessage.success(`${format === 'spine' ? 'Spine' : 'DragonBones'} 骨骼数据已复制到剪贴板`)
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

const downloadBoneData = (format: string) => {
  if (!props.result) return

  const data = props.result.boneData[format as keyof BoneData]
  const blob = new Blob([data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${format}_skeleton.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  ElMessage.success(`已下载: ${format}_skeleton.json`)
}

// Initialize selected part when result changes
watch(() => props.result, (newResult) => {
  if (newResult && newResult.segmentedParts.length > 0) {
    selectedPart.value = newResult.segmentedParts[0]
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.skeleton-result-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #606266;
  }

  .empty-description {
    font-size: 14px;
    color: #909399;
  }
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  overflow-y: auto;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    .generation-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .timestamp {
        font-size: 13px;
        color: #909399;
      }
    }
  }
}

.result-content {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;

  .result-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 400px;
  }

  .result-right {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.image-section {
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .image-container {
    position: relative;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e8e8e8;

    img {
      width: 100%;
      height: auto;
      display: block;
    }

    .image-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }
    }

    &:hover .image-overlay {
      opacity: 1;
    }
  }
}

.character-image {
  max-height: 300px;
  object-fit: contain;
}

.skeleton-image {
  max-height: 250px;
  object-fit: contain;
  background: linear-gradient(45deg, #f0f0f0 25%, #ffffff 25%, #ffffff 50%, #f0f0f0 50%, #f0f0f0 75%, #ffffff 75%);
  background-size: 20px 20px;
}

.parts-section {
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .parts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .part-card {
    background: white;
    border: 2px solid #e8e8e8;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:hover {
      border-color: #409eff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    }

    &.active {
      border-color: #409eff;
      background: #f0f7ff;
    }

    .part-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      width: 100%;

      .part-icon {
        font-size: 20px;
      }

      .part-name {
        font-size: 12px;
        font-weight: 500;
        color: #606266;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .part-image {
      width: 100%;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
}

.part-detail {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .detail-content {
    display: flex;
    gap: 16px;

    .detail-image {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
      min-height: 200px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .detail-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 140px;
    }
  }
}

.bone-data-section {
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .bone-format-tabs {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    overflow: hidden;

    :deep(.el-tabs__nav-wrap) {
      padding: 0 16px;
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }
  }

  .bone-data-container {
    padding: 16px;
    background: #f8f9fa;
  }

  .bone-data-code {
    background: #2d2d2d;
    color: #f8f8f2;
    border-radius: 4px;
    padding: 16px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 12px;
    line-height: 1.5;
    overflow: auto;
    max-height: 200px;
    margin-bottom: 16px;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #1e1e1e;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #555;
      border-radius: 4px;

      &:hover {
        background: #777;
      }
    }
  }

  .bone-data-actions {
    display: flex;
    gap: 8px;
  }
}

.generation-info-section {
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .info-label {
      font-size: 12px;
      color: #909399;
    }

    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }
}

.part-preview-dialog {
  .preview-image-container {
    text-align: center;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;

    img {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
    }
  }

  .mask-overlay {
    position: relative;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 16px;
    padding: 8px;

    .mask-label {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    img {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
      opacity: 0.7;
    }
  }
}

// Responsive adjustments
@media (max-width: 1200px) {
  .result-content {
    flex-direction: column;

    .result-left {
      max-width: 100%;
    }

    .parts-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .parts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-content {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>

