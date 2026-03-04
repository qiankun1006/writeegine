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

export const usePortraitStore = defineStore('portrait', () => {
  // 状态：参数
  const params = reactive<PortraitParams>({
    prompt: '',
    negativePrompt: '低质量, 模糊, 多手指, 水印, 变形, 低分辨率',
    referenceImage: null,
    referenceImagePreview: '',
    modelWeight: 0.8,
    width: 768,
    height: 512,

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
  const generationError = ref<string | null>(null)
  const results = ref<GenerationResult[]>([])

  // 状态：UI
  const showAdvanced = ref(false)

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
    params.width = 768
    params.height = 512
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
    generationError.value = null
  }

  // 方法：更新进度
  const updateProgress = (progress: number) => {
    generationProgress.value = Math.min(100, Math.max(0, progress))
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

  // 方法：清除结果
  const clearResults = () => {
    results.value = []
  }

  return {
    // 状态
    params,
    isGenerating,
    generationProgress,
    generationError,
    results,
    showAdvanced,

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
    clearResults,
  }
})

