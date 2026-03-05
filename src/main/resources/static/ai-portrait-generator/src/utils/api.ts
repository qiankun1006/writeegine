/**
 * API 工具 - 与后端 API 通信
 */

import axios from 'axios'
import type {GenerationResult, PortraitParams} from '@/stores/portraitStore'

const apiBase = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器
apiBase.interceptors.response.use(
  (response) => {
    console.log('✓ API 响应:', response.data)
    return response
  },
  (error) => {
    console.error('✗ API 错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 生成 AI 立绘
 */
export async function generatePortrait(params: PortraitParams): Promise<string> {
  try {
    // 如果有参考图，转换为 Base64
    let referenceImageBase64 = ''
    if (params.referenceImage && params.referenceImagePreview) {
      referenceImageBase64 = params.referenceImagePreview
    }

    const response = await apiBase.post('/ai/portrait/generate', {
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      referenceImage: referenceImageBase64,
      modelWeight: params.modelWeight,
      width: params.width,
      height: params.height,
      provider: params.provider,
      modelVersion: params.modelVersion,
      imageStrength: params.imageStrength,
      generateCount: params.generateCount,
      sampler: params.sampler,
      steps: params.steps,
      stylePreset: params.stylePreset,
      seed: params.seed,
      faceEnhance: params.faceEnhance,
      outputFormat: params.outputFormat,
    })

    const taskId = response.data?.taskId
    if (!taskId) {
      throw new Error('服务器未返回 taskId')
    }

    return taskId
  } catch (error) {
    console.error('生成失败:', error)
    throw new Error('生成请求失败，请检查网络或参数')
  }
}

/**
 * 查询生成进度
 */
export interface ProgressResponse {
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  message?: string
  results?: Array<{
    id: string
    url: string
    generatedAt: string
  }>
  error?: string
}

export async function getGenerationProgress(taskId: string): Promise<ProgressResponse> {
  try {
    const response = await apiBase.get<ProgressResponse>(`/ai/portrait/progress/${taskId}`)
    return response.data
  } catch (error) {
    console.error('查询进度失败:', error)
    throw new Error('查询进度失败，请重试')
  }
}

/**
 * 轮询生成进度（直到完成）
 */
export async function pollGenerationProgress(
  taskId: string,
  onProgress: (progress: ProgressResponse) => void,
  maxAttempts: number = 120,
  intervalMs: number = 1000
): Promise<ProgressResponse> {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts++

      try {
        const progress = await getGenerationProgress(taskId)
        onProgress(progress)

        if (progress.status === 'completed') {
          clearInterval(interval)
          resolve(progress)
        } else if (progress.status === 'error') {
          clearInterval(interval)
          reject(new Error(progress.error || '生成失败'))
        } else if (attempts >= maxAttempts) {
          clearInterval(interval)
          reject(new Error('生成超时'))
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          clearInterval(interval)
          reject(error)
        }
      }
    }, intervalMs)
  })
}

/**
 * 导出图片
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    const response = await axios.get(imageUrl, { responseType: 'blob' })
    const blob = response.data
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    throw new Error('图片下载失败')
  }
}

/**
 * 保存生成结果到项目
 */
export interface SaveResultRequest {
  generationId: string
  resultId: string
  name: string
  description?: string
  tags?: string[]
}

export async function saveResultToProject(data: SaveResultRequest): Promise<any> {
  try {
    const response = await apiBase.post('/ai/portrait/save', data)
    return response.data
  } catch (error) {
    console.error('保存失败:', error)
    throw new Error('保存到项目失败')
  }
}

/**
 * 获取生成历史
 */
export async function getGenerationHistory(limit: number = 20): Promise<GenerationResult[]> {
  try {
    const response = await apiBase.get(`/ai/portrait/history?limit=${limit}`)
    return response.data || []
  } catch (error) {
    console.error('获取历史失败:', error)
    return []
  }
}

/**
 * 删除生成结果
 */
export async function deleteGenerationResult(resultId: string): Promise<void> {
  try {
    await apiBase.delete(`/ai/portrait/results/${resultId}`)
  } catch (error) {
    console.error('删除失败:', error)
    throw new Error('删除失败')
  }
}

export default apiBase

