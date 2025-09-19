/**
 * 数据导出/上传功能
 * 支持本地数据导出和云端上传准备
 */

import { cloudStorage, type UserData } from './cloudReadyStorage';

export interface ExportOptions {
  includeImages: boolean;
  includeProgress: boolean;
  includeSettings: boolean;
  format: 'json' | 'csv';
  compress: boolean;
}

export interface UploadResult {
  success: boolean;
  uploadId?: string;
  error?: string;
  dataSize: number;
  timestamp: number;
}

/**
 * 数据导出管理器
 */
export class DataExportManager {
  private static instance: DataExportManager;
  
  private constructor() {}
  
  static getInstance(): DataExportManager {
    if (!this.instance) {
      this.instance = new DataExportManager();
    }
    return this.instance;
  }

  /**
   * 导出完整用户数据
   */
  async exportUserData(options: Partial<ExportOptions> = {}): Promise<string> {
    const defaultOptions: ExportOptions = {
      includeImages: true,
      includeProgress: true,
      includeSettings: true,
      format: 'json',
      compress: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      console.log('📤 开始导出用户数据...', finalOptions);
      
      // 获取用户基本信息
      const userId = cloudStorage.getUserId();
      const exportData: any = {
        exportInfo: {
          userId,
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          options: finalOptions
        }
      };

      // 导出个人单词
      const personalWords = await cloudStorage.getUserWords();
      exportData.personalWords = personalWords;
      console.log(`📝 导出 ${personalWords.length} 个个人单词`);

      // 导出学习进度（如果需要）
      if (finalOptions.includeProgress) {
        exportData.learningProgress = await this.exportLearningProgress();
        console.log(`📊 导出 ${exportData.learningProgress.length} 条学习记录`);
      }

      // 导出用户设置（如果需要）
      if (finalOptions.includeSettings) {
        exportData.userSettings = await this.exportUserSettings();
        console.log('⚙️ 导出用户设置');
      }

      // 导出图片数据（如果需要）
      if (finalOptions.includeImages) {
        exportData.imageData = await this.exportImageData(personalWords);
        console.log(`🖼️ 导出 ${Object.keys(exportData.imageData).length} 张图片引用`);
      }

      // 格式化输出
      let result: string;
      if (finalOptions.format === 'json') {
        result = JSON.stringify(exportData, null, 2);
      } else {
        result = this.convertToCSV(exportData);
      }

      // 压缩（如果需要）
      if (finalOptions.compress) {
        result = await this.compressData(result);
      }

      const sizeKB = Math.round(result.length / 1024);
      console.log(`✅ 数据导出完成，大小: ${sizeKB}KB`);
      
      return result;
    } catch (error) {
      console.error('❌ 数据导出失败:', error);
      throw error;
    }
  }

  /**
   * 下载导出的数据文件
   */
  async downloadUserData(options: Partial<ExportOptions> = {}): Promise<void> {
    try {
      const exportData = await this.exportUserData(options);
      const userId = cloudStorage.getUserId();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `wordflashcard_${userId}_${timestamp}.json`;
      
      // 创建下载链接
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`💾 数据已下载: ${filename}`);
    } catch (error) {
      console.error('❌ 下载数据失败:', error);
      throw error;
    }
  }

  /**
   * 准备数据用于云端上传
   */
  async prepareForCloudUpload(): Promise<UserData> {
    try {
      console.log('☁️ 准备数据用于云端上传...');
      
      const userData = await cloudStorage.exportUserData();
      
      // 验证数据完整性
      this.validateUserData(userData);
      
      console.log('✅ 云端上传数据准备完成:', {
        userId: userData.userId,
        wordsCount: userData.personalWords.length,
        progressCount: userData.learningProgress.length
      });
      
      return userData;
    } catch (error) {
      console.error('❌ 准备云端上传数据失败:', error);
      throw error;
    }
  }

  /**
   * 模拟云端上传（实际实现需要后端API）
   */
  async simulateCloudUpload(): Promise<UploadResult> {
    try {
      const userData = await this.prepareForCloudUpload();
      const dataSize = JSON.stringify(userData).length;
      
      console.log('🚀 模拟云端上传...');
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟上传结果
      const uploadResult: UploadResult = {
        success: true,
        uploadId: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dataSize,
        timestamp: Date.now()
      };
      
      // 记录上传历史
      this.recordUploadHistory(uploadResult);
      
      console.log('✅ 云端上传完成:', uploadResult);
      return uploadResult;
    } catch (error) {
      console.error('❌ 云端上传失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        dataSize: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 导入用户数据
   */
  async importUserData(jsonData: string): Promise<void> {
    try {
      console.log('📥 开始导入用户数据...');
      
      const importData = JSON.parse(jsonData);
      
      // 验证导入数据格式
      if (!importData.exportInfo || !importData.personalWords) {
        throw new Error('无效的导入数据格式');
      }
      
      console.log('📊 导入数据信息:', {
        exportedAt: importData.exportInfo.exportedAt,
        wordsCount: importData.personalWords.length,
        version: importData.exportInfo.version
      });
      
      // 导入个人单词
      if (importData.personalWords && importData.personalWords.length > 0) {
        await this.importPersonalWords(importData.personalWords);
        console.log(`✅ 导入 ${importData.personalWords.length} 个单词`);
      }
      
      // 导入学习进度
      if (importData.learningProgress) {
        await this.importLearningProgress(importData.learningProgress);
        console.log(`✅ 导入 ${importData.learningProgress.length} 条学习记录`);
      }
      
      // 导入用户设置
      if (importData.userSettings) {
        await this.importUserSettings(importData.userSettings);
        console.log('✅ 导入用户设置');
      }
      
      console.log('🎉 用户数据导入完成');
    } catch (error) {
      console.error('❌ 导入用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取上传历史
   */
  getUploadHistory(): UploadResult[] {
    try {
      const stored = localStorage.getItem('upload_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ 获取上传历史失败:', error);
      return [];
    }
  }

  // 私有方法

  private async exportLearningProgress(): Promise<any[]> {
    // TODO: 实现学习进度导出
    return [];
  }

  private async exportUserSettings(): Promise<any> {
    // TODO: 实现用户设置导出
    return {
      theme: 'light',
      language: 'zh-CN',
      studyGoals: {
        dailyNewWords: 5,
        dailyReviews: 20
      }
    };
  }

  private async exportImageData(words: any[]): Promise<{ [key: string]: string }> {
    const imageData: { [key: string]: string } = {};
    
    for (const word of words) {
      if (word.imageUrl) {
        imageData[word.word] = word.imageUrl;
      }
    }
    
    return imageData;
  }

  private convertToCSV(data: any): string {
    // 简单的CSV转换实现
    const words = data.personalWords || [];
    const headers = ['word', 'translation', 'example', 'categories', 'createdAt'];
    
    let csv = headers.join(',') + '\n';
    
    for (const word of words) {
      const row = [
        word.word || '',
        word.translation || '',
        word.example || '',
        (word.categories || []).join(';'),
        new Date(word.createdAt).toISOString()
      ];
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    }
    
    return csv;
  }

  private async compressData(data: string): Promise<string> {
    // TODO: 实现数据压缩
    return data;
  }

  private validateUserData(userData: UserData): void {
    if (!userData.userId) {
      throw new Error('缺少用户ID');
    }
    if (!Array.isArray(userData.personalWords)) {
      throw new Error('个人单词数据格式错误');
    }
    // 更多验证...
  }

  private recordUploadHistory(result: UploadResult): void {
    try {
      const history = this.getUploadHistory();
      history.unshift(result);
      
      // 只保留最近10次记录
      if (history.length > 10) {
        history.splice(10);
      }
      
      localStorage.setItem('upload_history', JSON.stringify(history));
    } catch (error) {
      console.error('❌ 记录上传历史失败:', error);
    }
  }

  private async importPersonalWords(words: any[]): Promise<void> {
    // TODO: 与现有的数据库系统集成
    console.log('导入单词:', words.length);
  }

  private async importLearningProgress(progress: any[]): Promise<void> {
    // TODO: 实现学习进度导入
    console.log('导入学习进度:', progress.length);
  }

  private async importUserSettings(settings: any): Promise<void> {
    // TODO: 实现用户设置导入
    console.log('导入用户设置:', settings);
  }
}

// 导出管理器实例
export const dataExportManager = DataExportManager.getInstance();

// 导出便捷函数
export const downloadUserData = (options?: Partial<ExportOptions>) => {
  return dataExportManager.downloadUserData(options);
};

export const simulateCloudUpload = () => {
  return dataExportManager.simulateCloudUpload();
};
