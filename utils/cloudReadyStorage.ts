/**
 * 云端准备的存储架构
 * 支持本地开发 → 云端发布的平滑迁移
 */

import { Word } from '@/types';

// 用户数据结构（可上传到云端）
export interface UserData {
  userId: string;
  personalWords: Word[];          // 用户添加的单词
  learningProgress: LearningProgress[];  // 学习进度
  customSettings: UserSettings;   // 个人设置
  createdAt: number;
  lastSyncAt: number;
}

// 学习进度记录
export interface LearningProgress {
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  lastReviewAt: number;
  masteryLevel: number; // 0-5 掌握程度
  reviewIntervals: number[]; // 复习间隔记录
}

// 用户设置
export interface UserSettings {
  preferredCategories: string[];
  studyGoals: {
    dailyNewWords: number;
    dailyReviews: number;
  };
  displayPreferences: {
    showTranslation: boolean;
    showExample: boolean;
    cardStyle: 'simple' | 'detailed';
  };
}

// 共享资源结构（云端全局共享）
export interface SharedResources {
  wordImages: SharedImagePool;     // AI图片池
  templates: WordTemplate[];       // 单词模板
  prebuiltLibrary: PrebuiltWord[]; // 预制词库
  categories: SharedCategory[];    // 标准分类
}

// 共享图片池（节省AI算力）
export interface SharedImagePool {
  [wordKey: string]: {
    imageUrl: string;      // AI生成的图片
    prompt: string;        // 生成提示词
    generatedAt: number;   // 生成时间
    usageCount: number;    // 使用次数
    quality: 'low' | 'medium' | 'high';
  };
}

// 单词模板
export interface WordTemplate {
  word: string;
  translations: { [language: string]: string };
  examples: { [language: string]: string[] };
  categories: string[];
  difficulty: number;
  frequency: number; // 使用频率
}

// 预制词库单词
export interface PrebuiltWord extends Word {
  isPrebuilt: true;
  difficulty: number;
  frequency: number;
  ageGroup: string; // '4-6' | '7-9' | '10-12'
}

// 共享分类
export interface SharedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  ageGroup: string;
}

/**
 * 云端准备的存储管理器
 */
export class CloudReadyStorageManager {
  private static instance: CloudReadyStorageManager;
  private userId: string;
  
  private constructor() {
    this.userId = this.generateOrGetUserId();
  }

  static getInstance(): CloudReadyStorageManager {
    if (!this.instance) {
      this.instance = new CloudReadyStorageManager();
    }
    return this.instance;
  }

  /**
   * 生成或获取用户ID
   */
  private generateOrGetUserId(): string {
    const storageKey = 'wordflashcard_user_id';
    
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') {
      return 'server-side-user';
    }
    
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      // 生成基于浏览器特征的稳定ID
      const browserFingerprint = this.generateBrowserFingerprint();
      userId = `user_${browserFingerprint}_${Date.now()}`;
      localStorage.setItem(storageKey, userId);
      console.log('🆔 生成新用户ID:', userId);
    }
    
    return userId;
  }

  /**
   * 生成浏览器指纹（用于稳定的用户识别）
   */
  private generateBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return this.hashString(fingerprint).substring(0, 8);
  }

  /**
   * 字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 获取当前用户ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * 获取用户数据库名称
   */
  getUserDatabaseName(): string {
    return `wordflashcard_${this.userId}`;
  }

  /**
   * 获取共享数据库名称
   */
  getSharedDatabaseName(): string {
    return 'wordflashcard_shared';
  }

  /**
   * 导出用户数据（用于云端上传）
   */
  async exportUserData(): Promise<UserData> {
    try {
      // 从IndexedDB获取用户数据
      const personalWords = await this.getUserWords();
      const learningProgress = await this.getLearningProgress();
      const customSettings = await this.getUserSettings();

      const userData: UserData = {
        userId: this.userId,
        personalWords,
        learningProgress,
        customSettings,
        createdAt: Date.now(),
        lastSyncAt: Date.now()
      };

      console.log('📤 导出用户数据:', {
        userId: userData.userId,
        wordsCount: userData.personalWords.length,
        progressCount: userData.learningProgress.length
      });

      return userData;
    } catch (error) {
      console.error('❌ 导出用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 导入用户数据（从云端同步）
   */
  async importUserData(userData: UserData): Promise<void> {
    try {
      console.log('📥 导入用户数据:', userData.userId);
      
      // 导入到IndexedDB
      await this.saveUserWords(userData.personalWords);
      await this.saveLearningProgress(userData.learningProgress);
      await this.saveUserSettings(userData.customSettings);
      
      console.log('✅ 用户数据导入成功');
    } catch (error) {
      console.error('❌ 导入用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 检查共享图片池中是否有指定单词的图片
   */
  async getSharedImage(word: string): Promise<string | null> {
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      return new Promise((resolve, reject) => {
        const request = store.get(word.toLowerCase());
        request.onsuccess = () => {
          if (request.result) {
            // 增加使用次数
            this.incrementImageUsage(word);
            resolve(request.result.imageUrl);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 获取共享图片失败:', error);
      return null;
    }
  }

  /**
   * 将AI生成的图片添加到共享池
   */
  async addToSharedImagePool(word: string, imageUrl: string, prompt: string): Promise<void> {
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const imageData = {
        word: word.toLowerCase(),
        imageUrl,
        prompt,
        generatedAt: Date.now(),
        usageCount: 1,
        quality: 'high' as const
      };

      return new Promise((resolve, reject) => {
        const request = store.put(imageData);
        request.onsuccess = () => {
          console.log('✅ 图片已添加到共享池:', word);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 添加到共享图片池失败:', error);
    }
  }

  /**
   * 打开共享数据库
   */
  private async openSharedDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.getSharedDatabaseName(), 5);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建共享图片存储
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'word' });
          imageStore.createIndex('usageCount', 'usageCount', { unique: false });
          imageStore.createIndex('generatedAt', 'generatedAt', { unique: false });
        }
        
        // 创建模板存储
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'word' });
        }
        
        // 创建共享单词存储（完整单词数据）
        if (!db.objectStoreNames.contains('words')) {
          const wordsStore = db.createObjectStore('words', { keyPath: 'word' });
          wordsStore.createIndex('translation', 'translation', { unique: false });
          wordsStore.createIndex('categories', 'categories', { unique: false, multiEntry: true });
          wordsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * 打开用户个人数据库
   */
  private async openUserDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.getUserDatabaseName(), 5);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建用户单词存储
        if (!db.objectStoreNames.contains('words')) {
          const wordsStore = db.createObjectStore('words', { keyPath: 'id' });
          wordsStore.createIndex('word', 'word', { unique: false });
          wordsStore.createIndex('categories', 'categories', { unique: false, multiEntry: true });
          wordsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // 创建学习进度存储
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'wordId' });
        }
        
        // 创建用户设置存储
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 获取所有共享单词
   */
  async getAllSharedWords(): Promise<Word[]> {
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => {
          reject(new Error('无法获取共享单词'));
        };
      });
    } catch (error) {
      console.error('❌ 获取所有共享单词失败:', error);
      return [];
    }
  }

  /**
   * 从共享池获取完整单词数据
   */
  async getSharedWord(word: string): Promise<Word | null> {
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      
      return new Promise((resolve, reject) => {
        const request = store.get(word.toLowerCase());
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 获取共享单词失败:', error);
      return null;
    }
  }

  /**
   * 将完整单词数据添加到共享池
   */
  async addSharedWord(word: Word): Promise<void> {
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      // 确保单词数据完整
      const sharedWord = {
        ...word,
        word: word.word.toLowerCase(), // 统一使用小写作为键
        createdAt: word.createdAt || Date.now(),
        updatedAt: Date.now()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(sharedWord);
        request.onsuccess = () => {
          console.log(`✅ 单词 "${word.word}" 已添加到共享池`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 添加共享单词失败:', error);
      throw error;
    }
  }

  // 增加图片使用次数
  private async incrementImageUsage(word: string): Promise<void> {
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const getRequest = store.get(word.toLowerCase());
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const imageData = getRequest.result;
          imageData.usageCount += 1;
          store.put(imageData);
        }
      };
    } catch (error) {
      console.error('❌ 更新图片使用次数失败:', error);
    }
  }

  // 占位符方法，需要与现有数据库系统集成
  async getUserWords(): Promise<Word[]> {
    try {
      const userDb = await this.openUserDatabase();
      const transaction = userDb.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 获取用户单词失败:', error);
      return [];
    }
  }

  private async getLearningProgress(): Promise<LearningProgress[]> {
    // TODO: 实现学习进度获取
    return [];
  }

  private async getUserSettings(): Promise<UserSettings> {
    // TODO: 实现用户设置获取
    return {
      preferredCategories: [],
      studyGoals: { dailyNewWords: 5, dailyReviews: 20 },
      displayPreferences: { showTranslation: true, showExample: true, cardStyle: 'simple' }
    };
  }

  async addUserWord(word: Word): Promise<void> {
    try {
      const userDb = await this.openUserDatabase();
      const transaction = userDb.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      // 确保单词数据完整
      const userWord = {
        ...word,
        createdAt: word.createdAt || Date.now(),
        updatedAt: Date.now()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(userWord);
        request.onsuccess = () => {
          console.log(`✅ 单词 "${word.word}" 已添加到用户个人数据库`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 添加用户单词失败:', error);
      throw error;
    }
  }

  /**
   * 从用户个人数据库删除单词 - 不影响共享池
   */
  async deleteUserWord(wordId: string): Promise<void> {
    try {
      const userDb = await this.openUserDatabase();
      const transaction = userDb.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(wordId);
        request.onsuccess = () => {
          console.log(`✅ 单词已从用户个人数据库删除: ${wordId}`);
          console.log(`🛡️ 共享池数据已保护，未被删除`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 删除用户单词失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户个人数据库中的单词 - 不影响共享池
   */
  async updateUserWord(word: Word): Promise<void> {
    try {
      const userDb = await this.openUserDatabase();
      const transaction = userDb.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      // 确保单词数据完整
      const userWord = {
        ...word,
        updatedAt: Date.now()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(userWord);
        request.onsuccess = () => {
          console.log(`✅ 单词 "${word.word}" 已在用户个人数据库中更新`);
          console.log(`🛡️ 共享池数据已保护，未被修改`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 更新用户单词失败:', error);
      throw error;
    }
  }

  /**
   * 手动删除共享池中的单词 - 只有这个方法才能删除共享池数据
   * 警告：此操作会永久删除共享池中的数据，影响所有用户
   */
  async deleteSharedWord(word: string): Promise<void> {
    console.warn(`⚠️ 警告：正在删除共享池中的单词 "${word}"，此操作会影响所有用户！`);
    
    try {
      const sharedDB = await this.openSharedDatabase();
      const transaction = sharedDB.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(word.toLowerCase());
        request.onsuccess = () => {
          console.log(`🗑️ 单词 "${word}" 已从共享池中永久删除`);
          console.log(`⚠️ 此操作已影响所有用户，无法撤销`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ 删除共享单词失败:', error);
      throw error;
    }
  }

  /**
   * 批量更新共享池中的翻译数据
   */
  async batchUpdateTranslations(): Promise<{ updatedCount: number; errors: string[] }> {
    console.log('🔄 开始批量更新共享池中的翻译数据...');
    
    const result = { updatedCount: 0, errors: [] as string[] };
    
    try {
      // 获取所有共享单词
      const allSharedWords = await this.getAllSharedWords();
      console.log(`📊 找到 ${allSharedWords.length} 个共享单词`);
      
      // 导入主题词库数据
      const { getAllThemeWordbanks } = await import('@/data/completeWordbook');
      const wordbanks = getAllThemeWordbanks();
      const englishWordbook = wordbanks.find(wb => wb.id === 'english-word-book');
      
      if (!englishWordbook) {
        throw new Error('未找到英语单词大书词库');
      }
      
      // 创建翻译映射
      const translationMap = new Map<string, string>();
      englishWordbook.words.forEach(themeWord => {
        translationMap.set(themeWord.word.toLowerCase(), themeWord.translation);
      });
      
      console.log(`📚 加载了 ${translationMap.size} 个翻译映射`);
      
      // 批量更新
      for (const sharedWord of allSharedWords) {
        try {
          const newTranslation = translationMap.get(sharedWord.word.toLowerCase());
          if (newTranslation && newTranslation !== sharedWord.translation) {
            console.log(`🔄 更新翻译: ${sharedWord.word} - ${sharedWord.translation} → ${newTranslation}`);
            
            // 更新单词的翻译
            const updatedWord = {
              ...sharedWord,
              translation: newTranslation,
              updatedAt: Date.now()
            };
            
            // 保存到共享池
            await this.addSharedWord(updatedWord);
            result.updatedCount++;
          }
        } catch (error) {
          const errorMsg = `更新单词 "${sharedWord.word}" 失败: ${error}`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }
      
      console.log(`✅ 批量更新完成: ${result.updatedCount} 个单词已更新`);
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} 个单词更新失败`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 批量更新翻译失败:', error);
      throw error;
    }
  }

  private async saveUserWords(words: Word[]): Promise<void> {
    // TODO: 与现有的 addWordToDB 集成
  }

  private async saveLearningProgress(progress: LearningProgress[]): Promise<void> {
    // TODO: 实现学习进度保存
  }

  private async saveUserSettings(settings: UserSettings): Promise<void> {
    // TODO: 实现用户设置保存
  }

  /**
   * 批量删除失败的单词（从两个数据库）
   */
  async batchDeleteFailedWords(): Promise<{ deletedCount: number; deletedWords: string[] }> {
    console.log('🔍 开始扫描失败的单词...');
    
    const deletedWords: string[] = [];
    let deletedCount = 0;

    // 检查共享数据库
    try {
      const sharedDB = await this.openSharedDatabase();
      const sharedTransaction = sharedDB.transaction(['words'], 'readwrite');
      const sharedStore = sharedTransaction.objectStore('words');
      const sharedWords = await sharedStore.getAll();
      
      const sharedWordsArray = await new Promise<Word[]>((resolve, reject) => {
        const request = sharedStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('无法获取共享单词'));
      });
      
      console.log(`📊 共享数据库单词总数: ${sharedWordsArray.length}`);
      
      for (const word of sharedWordsArray) {
        if (this.isFailedWord(word)) {
          await new Promise<void>((resolve, reject) => {
            const deleteRequest = sharedStore.delete(word.word);
            deleteRequest.onsuccess = () => {
              deletedWords.push(`共享: ${word.word}`);
              deletedCount++;
              console.log(`🗑️ 删除共享数据库失败单词: ${word.word}`);
              resolve();
            };
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
        }
      }
      
      await new Promise<void>((resolve) => {
        sharedTransaction.oncomplete = () => resolve();
      });
      sharedDB.close();
    } catch (error) {
      console.error('❌ 处理共享数据库时出错:', error);
    }

    // 检查用户数据库
    try {
      const userDB = await this.openUserDatabase();
      const userTransaction = userDB.transaction(['words'], 'readwrite');
      const userStore = userTransaction.objectStore('words');
      const userWords = await userStore.getAll();
      
      const userWordsArray = await new Promise<Word[]>((resolve, reject) => {
        const request = userStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('无法获取用户单词'));
      });
      
      console.log(`📊 用户数据库单词总数: ${userWordsArray.length}`);
      
      for (const word of userWordsArray) {
        if (this.isFailedWord(word)) {
          await new Promise<void>((resolve, reject) => {
            const deleteRequest = userStore.delete(word.word);
            deleteRequest.onsuccess = () => {
              deletedWords.push(`用户: ${word.word}`);
              deletedCount++;
              console.log(`🗑️ 删除用户数据库失败单词: ${word.word}`);
              resolve();
            };
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
        }
      }
      
      await new Promise<void>((resolve) => {
        userTransaction.oncomplete = () => resolve();
      });
      userDB.close();
    } catch (error) {
      console.error('❌ 处理用户数据库时出错:', error);
    }

    console.log(`✅ 批量删除完成，共删除 ${deletedCount} 个失败单词`);
    return { deletedCount, deletedWords };
  }

  /**
   * 判断是否为失败的单词
   */
  private isFailedWord(word: any): boolean {
    if (!word.imageUrl) return false;
    
    const imageUrl = word.imageUrl.toString();
    
    // 检查各种失败状态
    return imageUrl.startsWith('ERROR:') ||
           imageUrl.includes('重试') ||
           imageUrl.includes('生成中') ||
           imageUrl.includes('retry') ||
           imageUrl.includes('failed') ||
           imageUrl.includes('error') ||
           imageUrl.includes('失败') ||
           imageUrl.includes('错误') ||
           imageUrl.includes('AI_PENDING') ||
           imageUrl.length < 100 || // 太短的URL可能是错误的
           imageUrl.startsWith('blob:') || // 临时blob URL
           imageUrl.includes('black') || // 包含black关键词
           imageUrl.includes('screen'); // 包含screen关键词
  }
}

// 导出单例实例
export const cloudStorage = CloudReadyStorageManager.getInstance();
