/**
 * 图片压缩工具
 * 前端压缩图片以减少上传体积
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param maxSizeInBytes 目标最大大小（字节）
 * @param options 压缩选项
 * @returns 压缩后的图片文件
 */
export async function compressImage(
  file: File,
  maxSizeInBytes: number = 1024 * 1024,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.8,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const img = new Image()
        img.src = e.target?.result as string

        img.onload = () => {
          // 计算压缩尺寸
          let { width, height } = img
          const aspectRatio = width / height

          if (width > maxWidth) {
            width = maxWidth
            height = width / aspectRatio
          }

          if (height > maxHeight) {
            height = maxHeight
            width = height * aspectRatio
          }

          // 创建 canvas 并绘制
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(width)
          canvas.height = Math.round(height)

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('无法获取 Canvas 上下文'))
            return
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // 导出为 Blob 并检查大小
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('无法导出图片'))
                return
              }

              // 如果仍然超过大小限制，进一步降低质量
              if (blob.size > maxSizeInBytes && quality > 0.5) {
                const newQuality = quality - 0.1
                compressImage(file, maxSizeInBytes, {
                  ...options,
                  quality: newQuality,
                }).then(resolve).catch(reject)
                return
              }

              // 转换为文件对象
              const compressedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg' }
              )

              resolve(compressedFile)
            },
            'image/jpeg',
            quality
          )
        }

        img.onerror = () => {
          reject(new Error('图片加载失败'))
        }
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 生成图片缩略图
 * @param file 图片文件
 * @param maxSize 缩略图最大尺寸（像素）
 * @returns 缩略图 DataURL
 */
export function generateThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const img = new Image()
        img.src = e.target?.result as string

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const size = Math.min(img.width, img.height)
          canvas.width = maxSize
          canvas.height = maxSize

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('无法获取 Canvas 上下文'))
            return
          }

          // 绘制正方形缩略图（居中裁剪）
          const offsetX = (img.width - size) / 2
          const offsetY = (img.height - size) / 2
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, maxSize, maxSize)

          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }

        img.onerror = () => {
          reject(new Error('图片加载失败'))
        }
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

