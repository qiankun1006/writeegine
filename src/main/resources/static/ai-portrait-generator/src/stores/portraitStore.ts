import {defineStore} from 'pinia'
import {computed, reactive, ref} from 'vue'

export interface PortraitParams {
  // 核心参数
  prompt: string
  negativePrompt: string
  referenceImage: File | null
  referenceImagePreview: string
  modelWeight: number
  width: number
  height: number

  // 模型选择
  provider: 'aliyun' | 'volcengine' | 'meituan'
  modelVersion: string

  // 高级参数
  imageStrength: number
  generateCount: number
  sampler: 'euler' | 'dpm++' | 'autocfg'
  steps: number
  stylePreset: string
  seed: number
  faceEnhance: boolean
  outputFormat: 'png' | 'jpg'
}

export interface GenerationResult {
  id: string
  imageUrl: string
  generatedAt: string
  params: PortraitParams
}

// 骨骼素材参数
export interface SkeletonParams {
  style: 'anime' | 'realistic' | 'chibi' | 'cartoon' | 'pixel'
  template: 'standard' | 'animation'
  openPoseTemplate: 'openpose_18' | 'openpose_25'
  pose: string
  /** 图片上传后的 HTTP URL（推荐，优先于 referenceImageBase64） */
  referenceImageUrl: string
  /** @deprecated 兼容旧版，新代码请使用 referenceImageUrl */
  referenceImageBase64: string
}

// 骨骼素材部件
export interface SkeletonParts {
  head: string
  torso: string
  leftArm: string
  rightArm: string
  leftLeg: string
  rightLeg: string
}

// 骨骼素材生成结果
export interface SkeletonResult {
  id: string
  fullImageUrl: string
  parts: SkeletonParts
  generatedAt: string
  params: PortraitParams
  skeletonParams: SkeletonParams
}

export const usePortraitStore = defineStore('portrait', () => {
  // 状态：参数
  const params = reactive<PortraitParams>({
    prompt: '',
    negativePrompt: '低质量, 模糊, 多手指, 水印, 变形, 低分辨率',
    referenceImage: null,
    referenceImagePreview: '',
    modelWeight: 0.8,
    width: 512,
    height: 768,

    provider: 'meituan',
    modelVersion: 'Qwen-Image-Meituan',

    imageStrength: 0.6,
    generateCount: 1,
    sampler: 'euler',
    steps: 30,
    stylePreset: 'none',
    seed: -1,
    faceEnhance: true,
    outputFormat: 'png',
  })

  // 状态：生成过程
  const isGenerating = ref(false)
  const generationProgress = ref(0)
  const currentStage = ref('准备生成...')
  const generationError = ref<string | null>(null)
  const results = ref<GenerationResult[]>([])
  const pollInterval = ref<number | null>(null)

  // 状态：UI
  const showAdvanced = ref(false)

  // 状态：当前选中的素材类型
  const currentAssetType = ref<string | null>(null)

  // 状态：骨骼素材参数
  const skeletonParams = reactive<SkeletonParams>({
    style: 'anime',
    template: 'animation',
    openPoseTemplate: 'openpose_18',
    pose: 'standing',
    referenceImageUrl: '',
    referenceImageBase64: '',
  })

  // 状态：生成模式
  const currentGenerationMode = ref<'basic' | 'enhanced'>('basic')

  // 状态：骨骼素材生成结果
  const skeletonResults = ref<SkeletonResult[]>([])

  // 计算属性：验证状态
  const isPromptValid = computed(() => params.prompt.length >= 1 && params.prompt.length <= 500)
  const isNegativePromptValid = computed(() => params.negativePrompt.length >= 0 && params.negativePrompt.length <= 500)
  const isSizeValid = computed(() => {
    const validSizes = [256, 512, 1024, 2048]
    return validSizes.includes(params.width) && validSizes.includes(params.height)
  })

  const isAllValid = computed(() => {
    return isPromptValid.value && isNegativePromptValid.value && isSizeValid.value
  })

  // 方法：加载本地存储的参数
  const loadParams = () => {
    const saved = localStorage.getItem('portraitParams')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 不加载二进制文件和图片预览
        Object.assign(params, {
          ...parsed,
          referenceImage: null,
          referenceImagePreview: '',
        })
      } catch (error) {
        console.error('无法加载保存的参数:', error)
      }
    }
  }

  // 方法：保存参数到本地存储
  const saveParams = () => {
    const toSave = {
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
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
    }
    localStorage.setItem('portraitParams', JSON.stringify(toSave))
  }

  // 方法：重置参数
  const resetParams = () => {
    params.prompt = ''
    params.negativePrompt = '低质量, 模糊, 多手指, 水印, 变形, 低分辨率'
    params.referenceImage = null
    params.referenceImagePreview = ''
    params.modelWeight = 0.8
    params.width = 512
    params.height = 768
    params.provider = 'meituan'
    params.modelVersion = 'Qwen-Image-Meituan'
    params.imageStrength = 0.6
    params.generateCount = 1
    params.sampler = 'euler'
    params.steps = 30
    params.stylePreset = 'none'
    params.seed = -1
    params.faceEnhance = true
    params.outputFormat = 'png'
    generationError.value = null
    localStorage.removeItem('portraitParams')
  }

  // 方法：设置参考图片
  const setReferenceImage = (file: File | null) => {
    params.referenceImage = file
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        params.referenceImagePreview = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      params.referenceImagePreview = ''
    }
  }

  // 方法：开始生成
  const startGeneration = () => {
    if (!isAllValid.value) {
      generationError.value = '请检查参数是否有效'
      return
    }
    isGenerating.value = true
    generationProgress.value = 0
    currentStage.value = '准备生成...'
    generationError.value = null
  }

  // 方法：开始骨骼素材生成
  const startSkeletonGeneration = (taskId: string) => {
    if (!isAllValid.value) {
      generationError.value = '请检查参数是否有效'
      return
    }
    isGenerating.value = true
    generationProgress.value = 0
    currentStage.value = '任务已提交，等待处理...'
    generationError.value = null

    // 开始进度轮询
    startProgressPolling(taskId)
  }

  // 方法：更新进度
  const updateProgress = (progress: number, stage?: string) => {
    generationProgress.value = Math.min(100, Math.max(0, progress))
    if (stage) {
      currentStage.value = stage
    }
  }

  // 方法：开始进度轮询
  const startProgressPolling = (taskId: string) => {
    const pollIntervalMs = 2000 // 每2秒轮询一次

    pollInterval.value = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/portrait/skeleton/status/${taskId}`)
        const status = await response.json()

        // 更新进度和阶段
        updateProgress(status.progress, status.progressMessage)

        // 检查是否完成
        if (status.status === 'SUCCESS' || status.status === 'FAILED') {
          clearProgressPolling()
          isGenerating.value = false

          if (status.status === 'SUCCESS') {
            // 获取完整结果
            const resultResponse = await fetch(`/api/ai/portrait/skeleton/result/${taskId}`)
            const result = await resultResponse.json()
            addSkeletonResult(result)
          } else {
            generationError.value = status.errorMessage || '生成失败'
          }
        }

      } catch (error) {
        console.error('进度轮询失败:', error)
        clearProgressPolling()
      }
    }, pollIntervalMs) as any
  }

  // 方法：清除进度轮询
  const clearProgressPolling = () => {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
      pollInterval.value = null
    }
  }

  // 方法：完成生成
  const completeGeneration = (result: GenerationResult) => {
    isGenerating.value = false
    generationProgress.value = 100
    results.value.unshift(result)
  }

  // 方法：生成失败
  const failGeneration = (error: string) => {
    isGenerating.value = false
    generationError.value = error
  }

  // 方法：设置生成错误信息
  const setGenerationError = (error: string) => {
    generationError.value = error
  }

  // 方法：结束生成
  const endGeneration = () => {
    isGenerating.value = false
    clearProgressPolling()
  }

  // 方法：添加生成结果（支持部分字段的对象）
  const addResult = (resultData: any) => {
    const result: GenerationResult = {
      id: resultData.id || `result_${Date.now()}`,
      imageUrl: resultData.imageUrl || resultData.url || '',
      generatedAt: resultData.generatedAt || new Date().toISOString(),
      params: resultData.params || { ...params }
    }
    results.value.unshift(result)
  }

  // 方法：清除结果
  const clearResults = () => {
    results.value = []
  }

  // 方法：清除骨骼素材结果
  const clearSkeletonResults = () => {
    skeletonResults.value = []
  }

  // 方法：添加骨骼素材结果
  const addSkeletonResult = (resultData: Partial<SkeletonResult>) => {
    const result: SkeletonResult = {
      id: resultData.id || `skeleton_${Date.now()}`,
      fullImageUrl: resultData.fullImageUrl || '',
      parts: resultData.parts || {
        head: '',
        torso: '',
        leftArm: '',
        rightArm: '',
        leftLeg: '',
        rightLeg: '',
      },
      generatedAt: resultData.generatedAt || new Date().toISOString(),
      params: resultData.params || { ...params },
      skeletonParams: resultData.skeletonParams || { ...skeletonParams },
    }
    skeletonResults.value.unshift(result)
  }

  // 方法：设置当前素材类型
  const setCurrentAssetType = (type: string | null) => {
    currentAssetType.value = type
  }

  // 方法：更新骨骼参数
  const updateSkeletonParams = (newParams: Partial<SkeletonParams>) => {
    Object.assign(skeletonParams, newParams)
  }

  // 方法：重置骨骼参数
  const resetSkeletonParams = () => {
    skeletonParams.style = 'anime'
    skeletonParams.template = 'animation'
    skeletonParams.openPoseTemplate = 'openpose_18'
    skeletonParams.pose = 'standing'
    skeletonParams.referenceImageUrl = ''
    skeletonParams.referenceImageBase64 = ''
  }

  // 方法：设置生成模式
  const setGenerationMode = (mode: 'basic' | 'enhanced') => {
    currentGenerationMode.value = mode
  }

  // 方法：检查是否为骨骼素材模式
  const isSkeletonMode = computed(() => currentAssetType.value === 'character-skeleton')

  return {
    // 状态
    params,
    isGenerating,
    generationProgress,
    currentStage,
    generationError,
    results,
    showAdvanced,
    currentAssetType,
    skeletonParams,
    skeletonResults,
    currentGenerationMode,

    // 计算属性
    isPromptValid,
    isNegativePromptValid,
    isSizeValid,
    isAllValid,

    // 方法
    loadParams,
    saveParams,
    resetParams,
    setReferenceImage,
    startGeneration,
    updateProgress,
    completeGeneration,
    failGeneration,
    setGenerationError,
    endGeneration,
    addResult,
    clearResults,
    clearSkeletonResults,
    addSkeletonResult,
    setCurrentAssetType,
    updateSkeletonParams,
    resetSkeletonParams,
    setGenerationMode,
    startSkeletonGeneration,
    startProgressPolling,
    clearProgressPolling,

    // 计算属性
    isSkeletonMode,
  }
})

