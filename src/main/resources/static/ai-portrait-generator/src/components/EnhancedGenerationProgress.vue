<template>
  <div class="enhanced-generation-progress">

    <!-- 整体进度条 -->
    <div class="overall-progress-bar">
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: overallProgress + '%' }"></div>
      </div>
      <span class="bar-label">{{ overallProgress }}%</span>
    </div>

    <!-- 8步流水线状态列表 -->
    <div class="pipeline-steps">
      <div
        v-for="step in displaySteps"
        :key="step.stepNo"
        class="step-item"
        :class="'step-' + step.status.toLowerCase()"
        @click="toggleExpand(step.stepNo)"
      >
        <!-- 左侧：状态图标 -->
        <div class="step-icon" :title="statusLabel(step.status)">
          <span v-if="step.status === 'SUCCESS'"    class="icon icon-success">✓</span>
          <span v-else-if="step.status === 'PROCESSING'" class="icon icon-spinning">⟳</span>
          <span v-else-if="step.status === 'FAILED'"     class="icon icon-failed">✗</span>
          <span v-else                                    class="icon icon-pending">○</span>
        </div>

        <!-- 中间：步骤信息 -->
        <div class="step-info">
          <div class="step-header">
            <span class="step-number">步骤{{ step.stepNo }}</span>
            <span class="step-name">{{ step.stepName }}</span>
            <span v-if="step.durationMs" class="step-duration">{{ formatDuration(step.durationMs) }}</span>
          </div>
          <div v-if="step.status === 'FAILED' && step.errorMessage" class="step-error">
            {{ step.errorMessage }}
          </div>
          <!-- 展开：中间结果缩略图 -->
          <div v-if="expandedStep === step.stepNo && step.outputImageUrl" class="step-preview">
            <img :src="step.outputImageUrl" :alt="step.stepName + ' 中间结果'" />
          </div>
        </div>

        <!-- 右侧：可展开指示（有中间结果图时才显示） -->
        <div v-if="step.outputImageUrl" class="step-expand-hint"
             :title="expandedStep === step.stepNo ? '收起' : '查看中间结果'">
          {{ expandedStep === step.stepNo ? '▲' : '▼' }}
        </div>
      </div>
    </div>

    <!-- 生成日志 -->
    <div class="logs-section" v-if="logs.length > 0">
      <div class="logs-header">
        <span>生成日志</span>
        <div class="logs-controls">
          <button class="ctrl-btn" @click="clearLogs">清空</button>
          <button class="ctrl-btn" @click="autoScroll = !autoScroll">
            {{ autoScroll ? '暂停滚动' : '自动滚动' }}
          </button>
        </div>
      </div>
      <div class="logs-container" ref="logsContainer">
        <div
          v-for="(logItem, index) in logs"
          :key="index"
          class="log-item"
          :class="'log-' + logItem.type"
        >
          <span class="log-time">{{ formatLogTime(logItem.timestamp) }}</span>
          <span class="log-tag">{{ logTypeText(logItem.type) }}</span>
          <span class="log-message">{{ logItem.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onUnmounted, ref} from 'vue'
import axios from 'axios'

// ======================================================
// 类型定义
// ======================================================

interface StepStatus {
  stepNo: number
  stepName: string
  stepKey: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  progress: number
  outputImageUrl?: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
  errorMessage?: string
}

interface Log {
  timestamp: number
  type: 'info' | 'success' | 'warning' | 'error' | 'processing'
  message: string
}

// ======================================================
// Props / Emits
// ======================================================

const props = defineProps<{
  taskId?: string
}>()

const emit = defineEmits<{
  (e: 'complete', taskId: string): void
  (e: 'failed', taskId: string, error: string): void
}>()

// ======================================================
// 状态
// ======================================================

/** 从后端返回的步骤列表（真实数据） */
const serverSteps = ref<StepStatus[]>([])

/** 整体进度 0-100 */
const overallProgress = ref(0)

/** 当前展开显示中间结果的步骤序号 */
const expandedStep = ref<number | null>(null)

/** 日志列表 */
const logs = ref<Log[]>([])
const autoScroll = ref(true)
const logsContainer = ref<HTMLElement | null>(null)

/** SSE 连接实例 */
let sseSource: EventSource | null = null

/**
 * 轮询降级定时器
 * 仅当 SSE 连接失败或浏览器不支持时启用
 */
let pollingTimer: ReturnType<typeof setInterval> | null = null

/** SSE 重连次数，超过阈值后降级到轮询 */
let sseRetryCount = 0
const SSE_MAX_RETRY = 3

// ======================================================
// 计算属性
// ======================================================

/**
 * 若后端还未返回步骤数据，则展示默认的8步占位（均为 PENDING）
 */
const displaySteps = computed<StepStatus[]>(() => {
  if (serverSteps.value.length > 0) {
    return serverSteps.value
  }
  // 默认占位
  const defaultNames = [
    '生成T-pose骨骼线图',
    '应用ControlNet姿势约束',
    '提取IP-Adapter特征',
    'Flux.1-dev高清生成',
    '背景去除',
    'SAM 2肢体分割',
    '骨骼绑定数据生成',
    '保存最终结果'
  ]
  const defaultKeys = [
    'skeleton_line', 'controlnet', 'ip_adapter', 'flux_generate',
    'bg_remove', 'sam_segment', 'binding_data', 'save_result'
  ]
  return defaultNames.map((name, i) => ({
    stepNo:   i + 1,
    stepName: name,
    stepKey:  defaultKeys[i],
    status:   'PENDING' as const,
    progress: 0
  }))
})

// ======================================================
// SSE 主逻辑
// ======================================================

/**
 * 启动 SSE 订阅。
 * 若浏览器不支持 EventSource 或 SSE 连接反复失败，自动降级到轮询。
 */
function startSse(taskId: string) {
  if (typeof EventSource === 'undefined') {
    addLog('warning', 'SSE 不支持，降级轮询')
    startPolling(taskId)
    return
  }

  addLog('processing', `SSE 订阅任务进度: ${taskId}`)
  closeSse()
  sseRetryCount = 0

  const url = `/api/ai/portrait/skeleton/enhanced-stream/${taskId}`
  sseSource = new EventSource(url)

  sseSource.onmessage = (event) => {
    handleSseData(event.data, taskId)
  }

  sseSource.onerror = () => {
    sseRetryCount++
    addLog('warning', `SSE 连接中断（第 ${sseRetryCount} 次），${sseRetryCount >= SSE_MAX_RETRY ? '降级到轮询' : '等待重连…'}`)
    if (sseRetryCount >= SSE_MAX_RETRY) {
      closeSse()
      // SSE 多次失败，降级到轮询
      startPolling(taskId)
    }
    // 未超限时 EventSource 会自动重连，无需手动处理
  }
}

/** 解析并处理 SSE 数据帧 */
function handleSseData(raw: string, taskId: string) {
  try {
    const data = JSON.parse(raw)

    // 握手确认帧，忽略
    if (data.event === 'connected') {
      addLog('info', 'SSE 连接已建立')
      return
    }

    // 进度帧
    if (data.progress !== undefined) {
      overallProgress.value = data.progress
    }
    if (Array.isArray(data.steps) && data.steps.length > 0) {
      serverSteps.value = data.steps
    }
    if (data.progressMessage) {
      addLog('info', data.progressMessage)
    }

    // 终态处理
    if (data.status === 'SUCCESS') {
      closeSse()
      clearPolling()
      addLog('success', '骨骼素材生成完成！')
      emit('complete', taskId)
    } else if (data.status === 'FAILED') {
      closeSse()
      clearPolling()
      addLog('error', '生成失败: ' + (data.errorMessage || '未知错误'))
      emit('failed', taskId, data.errorMessage || '未知错误')
    }
  } catch (e) {
    addLog('warning', 'SSE 数据解析失败: ' + raw)
  }
}

/** 关闭 SSE 连接 */
function closeSse() {
  if (sseSource) {
    sseSource.close()
    sseSource = null
  }
}

// ======================================================
// 轮询降级逻辑（SSE 不可用时启用）
// ======================================================

function startPolling(taskId: string) {
  addLog('processing', `开始轮询任务状态: ${taskId}`)
  fetchStatus(taskId)
  pollingTimer = setInterval(() => fetchStatus(taskId), 2000)
}

async function fetchStatus(taskId: string) {
  try {
    const res = await axios.get(`/api/ai/portrait/skeleton/enhanced-status/${taskId}`)
    const data = res.data

    overallProgress.value = data.progress ?? 0

    if (Array.isArray(data.steps) && data.steps.length > 0) {
      serverSteps.value = data.steps
    }
    if (data.progressMessage) {
      addLog('info', data.progressMessage)
    }

    if (data.status === 'SUCCESS') {
      clearPolling()
      addLog('success', '骨骼素材生成完成！')
      emit('complete', taskId)
    } else if (data.status === 'FAILED') {
      clearPolling()
      addLog('error', '生成失败: ' + (data.errorMessage || '未知错误'))
      emit('failed', taskId, data.errorMessage || '未知错误')
    }
  } catch (err: any) {
    addLog('warning', '轮询请求失败: ' + (err?.message || err))
  }
}

function clearPolling() {
  if (pollingTimer !== null) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// ======================================================
// 公开方法（父组件调用）
// ======================================================

/**
 * 开始追踪指定任务 ID 的进度（优先 SSE，降级轮询）
 */
function trackTask(taskId: string) {
  resetProgress()
  startSse(taskId)
}

/**
 * 重置进度（开始新任务前调用）
 */
function resetProgress() {
  closeSse()
  clearPolling()
  serverSteps.value = []
  overallProgress.value = 0
  expandedStep.value = null
  logs.value = []
}

defineExpose({ trackTask, resetProgress })

// ======================================================
// 如果父组件在 mount 时就传入了 taskId，自动订阅
// ======================================================
if (props.taskId) {
  trackTask(props.taskId)
}

// ======================================================
// 交互
// ======================================================

function toggleExpand(stepNo: number) {
  expandedStep.value = expandedStep.value === stepNo ? null : stepNo
}

// ======================================================
// 格式化
// ======================================================

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${s % 60}s`
}

function formatLogTime(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function statusLabel(status: string): string {
  switch (status) {
    case 'SUCCESS':    return '已完成'
    case 'PROCESSING': return '进行中'
    case 'PENDING':    return '等待中'
    case 'FAILED':     return '失败'
    default:           return status
  }
}

function logTypeText(type: string): string {
  switch (type) {
    case 'info':       return '信息'
    case 'success':    return '成功'
    case 'warning':    return '警告'
    case 'error':      return '错误'
    case 'processing': return '处理中'
    default:           return type
  }
}

// ======================================================
// 日志
// ======================================================

function addLog(type: Log['type'], message: string) {
  logs.value.push({ timestamp: Date.now(), type, message })
  if (autoScroll.value) {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight
      }
    })
  }
}

function clearLogs() {
  logs.value = []
}

// ======================================================
// 生命周期
// ======================================================

onUnmounted(() => {
  closeSse()
  clearPolling()
})
</script>

<style scoped lang="scss">
/* ===================== 整体容器 ===================== */
.enhanced-generation-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* ===================== 整体进度条 ===================== */
.overall-progress-bar {
  display: flex;
  align-items: center;
  gap: 10px;

  .bar-track {
    flex: 1;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #409eff, #1677ff);
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .bar-label {
    min-width: 40px;
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    color: #1677ff;
  }
}

/* ===================== 步骤列表 ===================== */
.pipeline-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  user-select: none;

  &:hover {
    background: #f0f7ff;
    border-color: #c0d8ff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  }

  /* PENDING：置灰弱化 */
  &.step-pending {
    opacity: 0.5;
  }

  /* PROCESSING：蓝色高亮，动画旋转 */
  &.step-processing {
    background: rgba(59, 130, 246, 0.06);
    border-color: #91caff;
    box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.08);
  }

  /* SUCCESS：淡绿色 */
  &.step-success {
    background: rgba(34, 197, 94, 0.06);
    border-color: #b7eb8f;
    opacity: 1;
  }

  /* FAILED：淡红色 */
  &.step-failed {
    background: rgba(239, 68, 68, 0.06);
    border-color: #ffa39e;
  }
}

/* ===================== 状态图标 ===================== */
.step-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  border-radius: 50%;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.icon-success {
  background: #52c41a;
  color: #fff;
}

.icon-spinning {
  background: #1677ff;
  color: #fff;
  animation: spin 1s linear infinite;
}

.icon-failed {
  background: #f5222d;
  color: #fff;
}

.icon-pending {
  background: transparent;
  color: #bfbfbf;
  border: 2px solid #bfbfbf;
  font-size: 10px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ===================== 步骤信息 ===================== */
.step-info {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.step-number {
  font-size: 12px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.step-duration {
  font-size: 12px;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
}

.step-error {
  margin-top: 4px;
  font-size: 12px;
  color: #f5222d;
  background: rgba(245, 34, 45, 0.06);
  padding: 4px 8px;
  border-radius: 6px;
}

/* ===================== 中间结果预览 ===================== */
.step-preview {
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;

  img {
    display: block;
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
    background: #f5f5f5;
  }
}

/* ===================== 展开箭头 ===================== */
.step-expand-hint {
  flex-shrink: 0;
  font-size: 10px;
  color: #8c8c8c;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.2s;
  align-self: center;

  &:hover {
    color: #1677ff;
  }
}

/* ===================== 日志区域 ===================== */
.logs-section {
  border-radius: 10px;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.logs-controls {
  display: flex;
  gap: 6px;
}

.ctrl-btn {
  font-size: 12px;
  padding: 3px 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;

  &:hover {
    border-color: #1677ff;
    color: #1677ff;
  }
}

.logs-container {
  max-height: 180px;
  overflow-y: auto;
  padding: 8px 12px;
  background: #fff;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 2px; }
  &::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 2px; }
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child { border-bottom: none; }

  .log-time {
    color: #8c8c8c;
    min-width: 56px;
    flex-shrink: 0;
  }

  .log-tag {
    min-width: 42px;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 11px;
    text-align: center;
    flex-shrink: 0;
  }

  .log-message { flex: 1; color: #303133; }

  &.log-success  { .log-tag { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; } }
  &.log-error    { .log-tag { background: #fff2f0; color: #f5222d; border: 1px solid #ffa39e; } }
  &.log-warning  { .log-tag { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; } }
  &.log-processing { .log-tag { background: #e6f4ff; color: #1677ff; border: 1px solid #91caff; } }
  &.log-info     { .log-tag { background: #f5f5f5; color: #8c8c8c; border: 1px solid #d9d9d9; } }
}
</style>

