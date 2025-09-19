/**
 * 共享图片池系统
 * 节省AI生图算力，多用户共享AI生成的图片
 */

import { cloudStorage } from './cloudReadyStorage';
import { generateWordImage as originalGenerateWordImage } from './aiImage';

export interface SharedImage {
  word: string;
  imageUrl: string;
  prompt: string;
  generatedAt: number;
  usageCount: number;
  quality: 'low' | 'medium' | 'high';
  hash: string; // 图片内容哈希，用于去重
}

/**
 * 智能图片生成器 - 优先使用共享池，节省算力
 */
export class SmartImageGenerator {
  private static instance: SmartImageGenerator;
  
  private constructor() {}
  
  static getInstance(): SmartImageGenerator {
    if (!this.instance) {
      this.instance = new SmartImageGenerator();
    }
    return this.instance;
  }

  /**
   * 智能生成图片 - 优先从共享池获取
   */
  async generateWordImage(word: string, forceRegenerate: boolean = false): Promise<{ success: boolean; imageUrl?: string; error?: string; source: 'shared' | 'ai' | 'error' }> {
    try {
      console.log(`🎨 开始为"${word}"生成图片...`);
      
      // 1. 首先检查共享图片池（除非强制重新生成）
      if (!forceRegenerate) {
        const sharedImage = await this.getFromSharedPool(word);
        if (sharedImage) {
          console.log(`✅ 从共享池获取"${word}"的图片，节省AI算力`);
          return {
            success: true,
            imageUrl: sharedImage,
            source: 'shared'
          };
        }
      } else {
        console.log(`🔄 强制重新生成"${word}"的图片，跳过共享池`);
      }

      // 2. 共享池没有，使用AI生成
      console.log(`🤖 共享池中没有"${word}"，使用AI生成...`);
      const aiResult = await originalGenerateWordImage(word);
      
      if (aiResult.success && aiResult.imageUrl) {
        // 3. 将AI生成的图片添加到共享池（只存储图片，不存储完整单词数据）
        await this.addToSharedPool(word, aiResult.imageUrl);
        
        console.log(`✅ "${word}"图片生成成功并添加到共享池`);
        
        return {
          success: true,
          imageUrl: aiResult.imageUrl,
          source: 'ai'
        };
      } else {
        console.error(`❌ AI生成"${word}"图片失败:`, aiResult.error);
        return {
          success: false,
          error: aiResult.error,
          source: 'error'
        };
      }
      
    } catch (error) {
      console.error(`❌ 智能图片生成失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'error'
      };
    }
  }

  /**
   * 从共享池获取图片
   */
  private async getFromSharedPool(word: string): Promise<string | null> {
    try {
      return await cloudStorage.getSharedImage(word);
    } catch (error) {
      console.error('❌ 从共享池获取图片失败:', error);
      return null;
    }
  }

  /**
   * 添加图片到共享池
   */
  private async addToSharedPool(word: string, imageUrl: string): Promise<void> {
    try {
      // 生成提示词（用于记录）
      const prompt = this.generatePromptForWord(word);
      
      await cloudStorage.addToSharedImagePool(word, imageUrl, prompt);
      
      // 记录统计信息
      this.recordImageGeneration(word, 'ai');
    } catch (error) {
      console.error('❌ 添加到共享池失败:', error);
      // 不抛出错误，因为主要功能（图片生成）已经成功
    }
  }

  /**
   * 为单词生成提示词（用于记录）
   */
  private generatePromptForWord(word: string): string {
    // 这里可以复用 aiImage.ts 中的逻辑
    return `AI generated image for word: ${word}`;
  }

  /**
   * 将完整单词数据添加到共享池的words存储
   */
  private async addCompleteWordToSharedPool(word: string, imageUrl: string): Promise<void> {
    try {
      // 创建完整的单词对象
      const completeWord = {
        id: this.generateWordId(word),
        word: word.toLowerCase(),
        translation: '', // 可以从主题词库获取
        example: '', // 可以从主题词库获取
        imageUrl: imageUrl,
        categories: ['uncategorized'],
        reviewCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await cloudStorage.addSharedWord(completeWord);
      console.log(`✅ 完整单词数据已添加到共享池: ${word}`);
    } catch (error) {
      console.error('❌ 添加完整单词数据失败:', error);
      // 不抛出错误，因为主要功能（图片生成）已经成功
      // 即使存储失败，图片生成本身是成功的
    }
  }

  /**
   * 生成单词ID
   */
  private generateWordId(word: string): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 记录图片生成统计
   */
  private recordImageGeneration(word: string, source: 'shared' | 'ai'): void {
    try {
      const stats = this.getImageGenerationStats();
      stats.total += 1;
      
      if (source === 'shared') {
        stats.fromSharedPool += 1;
        stats.aiSaved += 1; // 节省的AI调用次数
      } else {
        stats.aiGenerated += 1;
      }
      
      localStorage.setItem('image_generation_stats', JSON.stringify(stats));
      
      // 每10次统计输出一次报告
      if (stats.total % 10 === 0) {
        this.printSavingsReport(stats);
      }
    } catch (error) {
      console.error('❌ 记录统计信息失败:', error);
    }
  }

  /**
   * 获取图片生成统计
   */
  private getImageGenerationStats(): ImageGenerationStats {
    try {
      const stored = localStorage.getItem('image_generation_stats');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ 获取统计信息失败:', error);
    }
    
    return {
      total: 0,
      aiGenerated: 0,
      fromSharedPool: 0,
      aiSaved: 0,
      startTime: Date.now()
    };
  }

  /**
   * 打印算力节省报告
   */
  private printSavingsReport(stats: ImageGenerationStats): void {
    const savingsPercentage = stats.total > 0 ? (stats.aiSaved / stats.total * 100).toFixed(1) : '0';
    const daysRunning = Math.floor((Date.now() - stats.startTime) / (1000 * 60 * 60 * 24));
    
    console.log('\n🎉 AI算力节省报告:');
    console.log(`📊 总图片请求: ${stats.total}`);
    console.log(`🤖 AI生成: ${stats.aiGenerated}`);
    console.log(`♻️ 共享池复用: ${stats.fromSharedPool}`);
    console.log(`💰 节省AI调用: ${stats.aiSaved} (${savingsPercentage}%)`);
    console.log(`📅 运行天数: ${daysRunning}`);
    console.log('---');
  }

  /**
   * 获取共享池统计信息
   */
  async getSharedPoolStats(): Promise<SharedPoolStats> {
    try {
      const sharedDB = await cloudStorage['openSharedDatabase']();
      const transaction = sharedDB.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      return new Promise((resolve, reject) => {
        const countRequest = store.count();
        const getAllRequest = store.getAll();
        
        Promise.all([
          new Promise(resolve => { countRequest.onsuccess = () => resolve(countRequest.result); }),
          new Promise(resolve => { getAllRequest.onsuccess = () => resolve(getAllRequest.result); })
        ]).then(([totalImages, allImages]) => {
          const images = allImages as SharedImage[];
          const totalUsage = images.reduce((sum, img) => sum + img.usageCount, 0);
          const avgUsage = (totalImages as number) > 0 ? (totalUsage / (totalImages as number)).toFixed(1) : '0';
          
          resolve({
            totalImages: totalImages as number,
            totalUsage,
            averageUsagePerImage: parseFloat(avgUsage),
            mostUsedWords: images
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 10)
              .map(img => ({ word: img.word, usage: img.usageCount }))
          });
        }).catch(reject);
      });
    } catch (error) {
      console.error('❌ 获取共享池统计失败:', error);
      return {
        totalImages: 0,
        totalUsage: 0,
        averageUsagePerImage: 0,
        mostUsedWords: []
      };
    }
  }

  /**
   * 清理共享池（移除使用率低的图片）
   */
  async cleanupSharedPool(minUsageCount: number = 1): Promise<number> {
    try {
      const sharedDB = await cloudStorage['openSharedDatabase']();
      const transaction = sharedDB.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      return new Promise((resolve, reject) => {
        let deletedCount = 0;
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const image = cursor.value as SharedImage;
            if (image.usageCount < minUsageCount) {
              cursor.delete();
              deletedCount++;
            }
            cursor.continue();
          } else {
            console.log(`🧹 共享池清理完成，删除了 ${deletedCount} 个低使用率图片`);
            resolve(deletedCount);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 清理共享池失败:', error);
      return 0;
    }
  }
}

// 类型定义
interface ImageGenerationStats {
  total: number;
  aiGenerated: number;
  fromSharedPool: number;
  aiSaved: number;
  startTime: number;
}

interface SharedPoolStats {
  totalImages: number;
  totalUsage: number;
  averageUsagePerImage: number;
  mostUsedWords: { word: string; usage: number }[];
}

// 导出智能图片生成器实例
export const smartImageGenerator = SmartImageGenerator.getInstance();

// 导出便捷函数
export const generateWordImageSmart = (word: string) => {
  return smartImageGenerator.generateWordImage(word);
};
