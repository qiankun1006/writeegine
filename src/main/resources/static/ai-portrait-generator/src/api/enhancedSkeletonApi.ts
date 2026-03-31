/**
 * 增强骨骼素材生成 API 接口
 */

export interface EnhancedProgressData {
  step: number
  progress: number
  message?: string
  logs?: Array<{
    type: 'info' | 'success' | 'warning' | 'error' | 'processing'
    message: string
    timestamp: number
    duration?: number
  }>
}

export interface EnhancedSkeletonResult {
  taskId: string
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED'
  stepResults?: Array<{
    step: string
    result: any
    duration: number
  }>
  finalResult?: {
    skeletonJson: string
    characterImageUrl: string
    skeletonLineImageUrl: string
    segmentedParts: Array<{
      part: string
      imageUrl: string
      maskUrl?: string
    }>
    boneData: {
      spine: string
      dragonbones: string
    }
    downloadUrl: string
  }
  errorMessage?: string
}

/**
 * 开始增强骨骼素材生成
 */
export async function startEnhancedSkeletonGeneration(params: {
  prompt: string
  negativePrompt: string
  referenceImageBase64: string
  style: string
  openPoseTemplate: string
  pose: string
  width: number
  height: number
}): Promise<{ taskId: string }> {
  const response = await fetch('/api/ai/portrait/skeleton/enhanced-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': localStorage.getItem('userId') || '1'
    },
    body: JSON.stringify({
      ...params,
      generationMode: 'enhanced'
    })
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }

  const data = await response.json()
  if (!data.taskId) {
    throw new Error('后端未返回任务ID')
  }

  return { taskId: data.taskId }
}

/**
 * 查询增强骨骼素材生成进度
 */
export async function getEnhancedSkeletonProgress(taskId: string): Promise<EnhancedProgressData> {
  const response = await fetch(`/api/ai/portrait/skeleton/enhanced-status/${taskId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': localStorage.getItem('userId') || '1'
    }
  })

  if (!response.ok) {
    throw new Error(`查询进度失败: ${response.status}`)
  }

  const data = await response.json()

  if (response.status === 202) {
    // 任务处理中
    return {
      step: data.step || 0,
      progress: data.progress || 0,
      message: data.message,
      logs: data.logs
    }
  } else if (response.status === 200) {
    // 任务完成
    return {
      step: 7, // 最后一步
      progress: 100,
      message: data.message || '任务已完成',
      logs: data.logs || []
    }
  }

  throw new Error(`未知的响应状态: ${response.status}`)
}

/**
 * 获取增强骨骼素材生成结果
 */
export async function getEnhancedSkeletonResult(taskId: string): Promise<EnhancedSkeletonResult> {
  const response = await fetch(`/api/ai/portrait/skeleton/enhanced-result/${taskId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': localStorage.getItem('userId') || '1'
    }
  })

  if (!response.ok) {
    throw new Error(`获取结果失败: ${response.status}`)
  }

  const data = await response.json()
  return data
}

/**
 * 取消增强骨骼素材生成任务
 */
export async function cancelEnhancedSkeletonGeneration(taskId: string): Promise<void> {
  const response = await fetch(`/api/ai/portrait/skeleton/enhanced-cancel/${taskId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': localStorage.getItem('userId') || '1'
    }
  })

  if (!response.ok) {
    throw new Error(`取消任务失败: ${response.status}`)
  }
}

/**
 * 模拟增强骨骼素材生成进度（用于开发测试）
 */
export function simulateEnhancedProgress(
  onProgress: (data: EnhancedProgressData) => void,
  onComplete: (result: EnhancedSkeletonResult) => void
): () => void {
  const steps = [
    { step: 0, title: '生成OpenPose骨骼模板', duration: 5 },
    { step: 1, title: '应用ControlNet约束', duration: 15 },
    { step: 2, title: '提取IP-Adapter特征', duration: 10 },
    { step: 3, title: 'Flux.1-dev高清生成', duration: 30 },
    { step: 4, title: '背景去除', duration: 10 },
    { step: 5, title: 'SAM 2精确分割', duration: 20 },
    { step: 6, title: '生成骨骼绑定数据', duration: 15 },
    { step: 7, title: '打包导出', duration: 5 }
  ]

  let currentStep = 0
  let currentProgress = 0
  let intervalId: NodeJS.Timeout | null = null

  const startSimulation = () => {
    intervalId = setInterval(() => {
      if (currentStep >= steps.length) {
        // 所有步骤完成
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }

        // 发送完成结果
        onComplete({
          taskId: 'test_' + Date.now(),
          status: 'SUCCESS',
          stepResults: steps.map((s, i) => ({
            step: s.title,
            result: { success: true },
            duration: s.duration
          })),
          finalResult: {
            skeletonJson: '{}',
            characterImageUrl: '/api/test/image/character.png',
            skeletonLineImageUrl: '/api/test/image/skeleton.png',
            segmentedParts: [
              { part: 'head', imageUrl: '/api/test/parts/head.png' },
              { part: 'torso', imageUrl: '/api/test/parts/torso.png' },
              { part: 'leftArm', imageUrl: '/api/test/parts/left_arm.png' },
              { part: 'rightArm', imageUrl: '/api/test/parts/right_arm.png' },
              { part: 'leftLeg', imageUrl: '/api/test/parts/left_leg.png' },
              { part: 'rightLeg', imageUrl: '/api/test/parts/right_leg.png' }
            ],
            boneData: {
              spine: '{}',
              dragonbones: '{}'
            },
            downloadUrl: '/api/test/download/skeleton.zip'
          }
        })
        return
      }

      // 更新当前步骤进度
      currentProgress += 5
      if (currentProgress > 100) {
        currentProgress = 0
        currentStep++

        if (currentStep < steps.length) {
          // 记录步骤完成日志
          onProgress({
            step: currentStep - 1,
            progress: 100,
            message: `${steps[currentStep - 1].title} 完成`,
            logs: [{
              type: 'success',
              message: `${steps[currentStep - 1].title} 完成 (${steps[currentStep - 1].duration}秒)`,
              timestamp: Date.now(),
              duration: steps[currentStep - 1].duration
            }]
          })

          // 开始新步骤
          onProgress({
            step: currentStep,
            progress: 0,
            message: `开始: ${steps[currentStep].title}`,
            logs: [{
              type: 'info',
              message: `开始处理: ${steps[currentStep].title}`,
              timestamp: Date.now()
            }]
          })
        }
      } else {
        // 更新当前步骤进度
        onProgress({
          step: currentStep,
          progress: currentProgress,
          message: `${steps[currentStep].title} 处理中...`,
          logs: currentProgress % 20 === 0 ? [{
            type: 'processing',
            message: `${steps[currentStep].title} 进度 ${currentProgress}%`,
            timestamp: Date.now()
          }] : undefined
        })
      }
    }, 300) // 每300ms更新一次
  }

  startSimulation()

  // 返回停止函数
  return () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}

