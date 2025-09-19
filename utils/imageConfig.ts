// 图片生成配置和质量保证
export const IMAGE_GENERATION_CONFIG = {
  // API配置
  api: {
    maxRetries: 3,
    retryDelay: 1000, // 基础延迟，会递增
    timeout: 15000,   // 增加到15秒超时
    enhance: false,   // 暂时禁用图片增强，避免API问题
    nologo: false,    // 暂时禁用nologo参数
  },
  
  // 图片质量配置
  quality: {
    width: 256,
    height: 256,
    model: 'default', // 使用默认模型，避免API问题
    format: 'png',    // 默认格式
  },
  
  // 验证配置
  validation: {
    minSize: 100,     // 降低最小文件大小要求
    maxSize: 500000,  // 最大文件大小（字节）
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
  
  // 备选方案配置
  fallback: {
    useSVG: true,           // 启用SVG备选
    useEmoji: true,         // 启用emoji备选
    preferAI: true,         // 优先使用AI生成
    retryOnFailure: true,   // 失败时重试
  }
};

/**
 * 验证图片URL的有效性
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log('🔍 验证图片URL:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_GENERATION_CONFIG.api.timeout);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📊 HTTP状态:', response.status);
    console.log('📋 Content-Type:', response.headers.get('content-type'));
    console.log('📏 Content-Length:', response.headers.get('content-length'));
    
    if (!response.ok) {
      console.warn(`图片URL验证失败: HTTP ${response.status}`);
      return false;
    }
    
    console.log('✅ 图片URL验证成功');
    return true;
    
  } catch (error) {
    console.error('❌ 图片URL验证出错:', error);
    if (error instanceof Error) {
      console.error('❌ 错误详情:', error.message);
      console.error('❌ 错误类型:', error.name);
    }
    return false;
  }
}

/**
 * 获取图片并转换为Blob URL（解决CORS问题）
 */
export async function fetchImageAsBlob(url: string): Promise<string> {
  try {
    console.log('🔄 获取图片数据:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('📏 图片文件大小:', blob.size, '字节');
    console.log('📋 图片类型:', blob.type);
    
    // 检查文件大小
    if (blob.size === 0) {
      throw new Error('图片文件为空（0字节）');
    }
    
    if (blob.size < IMAGE_GENERATION_CONFIG.validation.minSize) {
      throw new Error(`图片文件过小: ${blob.size} < ${IMAGE_GENERATION_CONFIG.validation.minSize} 字节`);
    }
    
    if (blob.size > IMAGE_GENERATION_CONFIG.validation.maxSize) {
      console.warn(`⚠️ 图片文件较大: ${blob.size} > ${IMAGE_GENERATION_CONFIG.validation.maxSize} 字节`);
    }
    
    // 检查文件类型
    if (blob.type && !IMAGE_GENERATION_CONFIG.validation.allowedTypes.includes(blob.type)) {
      console.warn(`⚠️ 意外的图片类型: ${blob.type}`);
    }
    
    const blobUrl = URL.createObjectURL(blob);
    console.log('✅ 图片Blob URL创建成功:', blobUrl);
    
    return blobUrl;
    
  } catch (error) {
    console.error('❌ 获取图片Blob失败:', error);
    if (error instanceof Error) {
      console.error('❌ Blob错误详情:', error.message);
      console.error('❌ Blob错误类型:', error.name);
    }
    throw error;
  }
}

/**
 * 构建优化的API URL
 */
export function buildOptimizedImageUrl(prompt: string, seed: number): string {
  const config = IMAGE_GENERATION_CONFIG;
  const encodedPrompt = encodeURIComponent(prompt);
  
  // 使用最简单的参数组合，避免API问题
  const params = new URLSearchParams({
    width: config.quality.width.toString(),
    height: config.quality.height.toString(),
  });
  
  // 构建完整的API URL - 尝试不同的端点
  const baseUrl = 'https://image.pollinations.ai/prompt';
  const fullUrl = `${baseUrl}/${encodedPrompt}?width=256&height=256&model=flux&nologo=true&enhance=true`;
  
  console.log(`🖼️ 生成图片URL: ${fullUrl.substring(0, 100)}...`);
  return fullUrl;
}

/**
 * 记录图片生成统计
 */
export class ImageGenerationStats {
  private static stats = {
    total: 0,
    successful: 0,
    failed: 0,
    retries: 0,
    aiGenerated: 0,
    svgFallback: 0,
  };
  
  static recordAttempt() {
    this.stats.total++;
  }
  
  static recordSuccess(type: 'ai' | 'svg') {
    this.stats.successful++;
    if (type === 'ai') {
      this.stats.aiGenerated++;
    } else {
      this.stats.svgFallback++;
    }
  }
  
  static recordFailure() {
    this.stats.failed++;
  }
  
  static recordRetry() {
    this.stats.retries++;
  }
  
  static getStats() {
    return {
      ...this.stats,
      successRate: this.stats.total > 0 ? (this.stats.successful / this.stats.total * 100).toFixed(1) + '%' : '0%',
      aiSuccessRate: this.stats.successful > 0 ? (this.stats.aiGenerated / this.stats.successful * 100).toFixed(1) + '%' : '0%',
    };
  }
  
  static printStats() {
    const stats = this.getStats();
    console.log('\n📊 图片生成统计:');
    console.log(`  总尝试: ${stats.total}`);
    console.log(`  成功率: ${stats.successRate}`);
    console.log(`  AI成功: ${stats.aiGenerated} (${stats.aiSuccessRate})`);
    console.log(`  SVG备选: ${stats.svgFallback}`);
    console.log(`  重试次数: ${stats.retries}`);
    console.log(`  失败次数: ${stats.failed}`);
  }
}
