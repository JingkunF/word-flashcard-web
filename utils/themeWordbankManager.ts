/**
 * 主题词库管理器
 * 处理主题词库的导入、共享池调用和重复单词处理
 */

import { Word } from '../types';
import { ThemeWordbank, ThemeWord, getAllThemeWordbanks, getThemeWordbankById } from '../data/completeWordbook';
import { beginnerWordbank, beginnerWordbankInfo, BeginnerWord } from '../data/beginnerWordbank';
import { generateWordImageSmart } from './sharedImagePool';
import { addWord } from './dataAdapter';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  importedWords: Word[];
}

export class ThemeWordbankManager {
  private static instance: ThemeWordbankManager;
  
  private constructor() {}
  
  public static getInstance(): ThemeWordbankManager {
    if (!ThemeWordbankManager.instance) {
      ThemeWordbankManager.instance = new ThemeWordbankManager();
    }
    return ThemeWordbankManager.instance;
  }

  /**
   * 获取所有可用的主题词库
   */
  public getAllWordbanks(): ThemeWordbank[] {
    const wordbanks = getAllThemeWordbanks();
    
    // 添加启蒙基础高频词库
    const beginnerWordbankData: ThemeWordbank = {
      id: 'beginner-basic',
      name: beginnerWordbankInfo.name,
      description: beginnerWordbankInfo.description,
      category: beginnerWordbankInfo.category,
      difficulty: beginnerWordbankInfo.difficulty,
      targetAge: beginnerWordbankInfo.targetAge,
      words: beginnerWordbank.map((item: BeginnerWord) => ({
        word: item.word,
        translation: item.translation,
        example: item.example || '',
        category: item.category,
        theme: item.theme
      })),
      categories: Array.from(new Set(beginnerWordbank.map(item => item.category))),
      wordCount: beginnerWordbankInfo.wordCount,
      totalWords: beginnerWordbankInfo.wordCount
    };
    
    return [beginnerWordbankData, ...wordbanks];
  }

  /**
   * 根据ID获取主题词库
   */
  public getWordbankById(id: string): ThemeWordbank | null {
    return getThemeWordbankById(id);
  }

  /**
   * 导入主题词库到用户词汇表
   * @param wordbankId 词库ID
   * @param onProgress 进度回调
   * @param specificWords 指定要导入的单词列表（用于分批导入）
   */
  public async importWordbank(
    wordbankId: string, 
    onProgress?: (current: number, total: number, word: string) => void,
    specificWords?: ThemeWord[]
  ): Promise<ImportResult> {
    // 特殊处理启蒙词库
    if (wordbankId === 'beginner-basic') {
      console.log('🎯 检测到启蒙词库，使用专门的导入方法');
      return await this.importBeginnerWordbank(onProgress);
    }
    
    const wordbank = this.getWordbankById(wordbankId);
    if (!wordbank) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: [`词库 ${wordbankId} 不存在`],
        importedWords: []
      };
    }

    const result: ImportResult = {
      success: true,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      importedWords: []
    };

    // 使用指定的单词列表或整个词库
    const wordsToImport = specificWords || wordbank.words;
    console.log(`🎯 开始导入词库: ${wordbank.name} (${wordsToImport.length} 个单词)`);

    for (let i = 0; i < wordsToImport.length; i++) {
      const themeWord = wordsToImport[i];
      
      try {
        // 调用进度回调
        if (onProgress) {
          onProgress(i + 1, wordbank.words.length, themeWord.word);
        }

        // 检查单词是否已存在
        const existingWord = await this.checkWordExists(themeWord.word);
        let word: Word;
        
        console.log(`🔍 检查单词: ${themeWord.word}, 翻译: ${themeWord.translation}`);
        
        if (existingWord) {
          console.log(`🔄 单词"${themeWord.word}"已存在，更新翻译: ${existingWord.translation} → ${themeWord.translation}`);
          // 更新现有单词的翻译和图片
          word = {
            ...existingWord,
            translation: themeWord.translation,
            example: themeWord.example,
            categories: [themeWord.category],
            updatedAt: Date.now()
          };
          
          // 生成新图片（使用智能图片生成器，优先从共享池获取）
          try {
            const imageResult = await generateWordImageSmart(themeWord.word);
            if (imageResult.success && imageResult.imageUrl) {
              word.imageUrl = imageResult.imageUrl;
              console.log(`✅ AI生图成功: ${themeWord.word}`);
            } else {
              throw new Error(`AI生图失败: ${imageResult.error || '未知错误'}`);
            }
          } catch (error) {
            console.warn(`⚠️ AI生图失败，使用SVG备选: ${themeWord.word}`, error);
            // 使用SVG作为备选方案
            const { generateSimpleSVG } = await import('@/utils/simpleSvg');
            word.imageUrl = generateSimpleSVG(themeWord.word);
            console.log(`✅ 使用SVG备选: ${themeWord.word}`);
          }
          
          // 更新数据库中的单词
          // 更新共享池和用户数据库
          const { cloudStorage } = await import('@/utils/cloudReadyStorage');
          await cloudStorage.addSharedWord(word); // 更新共享池
          const { updateWord } = await import('@/utils/dataAdapter');
          await updateWord(word); // 更新用户数据库
          result.importedCount++;
        } else {
          // 生成图片（使用智能图片生成器，优先从共享池获取）
          let imageUrl;
          try {
            const imageResult = await generateWordImageSmart(themeWord.word);
            if (imageResult.success && imageResult.imageUrl) {
              imageUrl = imageResult.imageUrl;
              console.log(`✅ AI生图成功: ${themeWord.word}`);
            } else {
              throw new Error(`AI生图失败: ${imageResult.error || '未知错误'}`);
            }
          } catch (error) {
            console.warn(`⚠️ AI生图失败，使用SVG备选: ${themeWord.word}`, error);
            // 使用SVG作为备选方案
            const { generateSimpleSVG } = await import('@/utils/simpleSvg');
            imageUrl = generateSimpleSVG(themeWord.word);
            console.log(`✅ 使用SVG备选: ${themeWord.word}`);
          }
          
          // 创建新Word对象
          word = {
            id: this.generateWordId(themeWord.word),
            word: themeWord.word,
            translation: themeWord.translation,
            example: themeWord.example,
            imageUrl: imageUrl,
            categories: [themeWord.category],
            reviewCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          // 保存到数据库
          await addWord(word);
          result.importedCount++;
        }
        
        result.importedWords.push(word);
        
        console.log(`✅ 导入成功: ${themeWord.word} (${i + 1}/${wordbank.words.length})`);
        
        // 添加延迟，避免API限制 - 逐个处理时增加延迟
        if (i < wordbank.words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 增加到2秒延迟
        }
        
      } catch (error) {
        const errorMsg = `导入单词 "${themeWord.word}" 失败: ${error}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
        result.errorCount++;
      }
    }

    console.log(`🎉 词库导入完成: ${result.importedCount} 成功, ${result.errorCount} 失败`);
    
    return result;
  }

  /**
   * 批量导入主题词库（分批处理，避免阻塞UI）
   * @param wordbankId 词库ID
   * @param batchSize 批处理大小
   * @param onProgress 进度回调
   */
  public async importWordbankBatch(
    wordbankId: string,
    batchSize: number = 10,
    onProgress?: (current: number, total: number, word: string) => void
  ): Promise<ImportResult> {
    const wordbank = this.getWordbankById(wordbankId);
    if (!wordbank) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: [`词库 ${wordbankId} 不存在`],
        importedWords: []
      };
    }

    const result: ImportResult = {
      success: true,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      importedWords: []
    };

    const totalWords = wordbank.words.length;
    const totalBatches = Math.ceil(totalWords / batchSize);

    console.log(`🎯 开始批量导入词库: ${wordbank.name} (${totalWords} 个单词, ${totalBatches} 批)`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, totalWords);
      const batchWords = wordbank.words.slice(startIndex, endIndex);

      console.log(`📦 处理第 ${batchIndex + 1}/${totalBatches} 批 (${batchWords.length} 个单词)`);

      // 并行处理当前批次的单词
      const batchPromises = batchWords.map(async (themeWord, index) => {
        const globalIndex = startIndex + index;
        
        try {
          // 调用进度回调
          if (onProgress) {
            onProgress(globalIndex + 1, totalWords, themeWord.word);
          }

          // 检查单词是否已存在
          const existingWord = await this.checkWordExists(themeWord.word);
          let word: Word;
          
          console.log(`🔍 批量检查单词: ${themeWord.word}, 翻译: ${themeWord.translation}`);
          
          if (existingWord) {
            console.log(`🔄 单词"${themeWord.word}"已存在，更新翻译: ${existingWord.translation} → ${themeWord.translation}`);
            // 更新现有单词的翻译和图片
            word = {
              ...existingWord,
              translation: themeWord.translation,
              example: themeWord.example,
              categories: [themeWord.category],
              updatedAt: Date.now()
            };
          } else {
            console.log(`➕ 单词"${themeWord.word}"不存在，创建新单词`);
            // 创建新Word对象
            word = {
              id: this.generateWordId(themeWord.word),
              word: themeWord.word,
              translation: themeWord.translation,
              example: themeWord.example,
              categories: [themeWord.category],
              reviewCount: 0,
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
          }

          // 优先使用共享池中的图片，避免重复AI生成
          let imageUrl;
          try {
            // 1. 首先检查共享池中是否已有图片
            const { cloudStorage } = await import('@/utils/cloudReadyStorage');
            const sharedImage = await cloudStorage.getSharedImage(themeWord.word);
            
            if (sharedImage) {
              imageUrl = sharedImage;
              console.log(`✅ 从共享池获取图片: ${themeWord.word}`);
            } else {
              // 2. 共享池没有，使用AI生成
              console.log(`🤖 共享池中没有"${themeWord.word}"，使用AI生成...`);
              const imageResult = await generateWordImageSmart(themeWord.word);
              if (imageResult.success && imageResult.imageUrl) {
                imageUrl = imageResult.imageUrl;
                console.log(`✅ AI生图成功: ${themeWord.word}`);
              } else {
                throw new Error(`AI生图失败: ${imageResult.error || '未知错误'}`);
              }
            }
          } catch (error) {
            console.warn(`⚠️ 图片获取失败，使用SVG备选: ${themeWord.word}`, error);
            // 使用SVG作为备选方案
            const { generateSimpleSVG } = await import('@/utils/simpleSvg');
            imageUrl = generateSimpleSVG(themeWord.word);
            console.log(`✅ 使用SVG备选: ${themeWord.word}`);
          }
          
          // 设置图片URL
          word.imageUrl = imageUrl;

          // 保存到数据库
          console.log(`💾 正在保存单词到数据库: ${themeWord.word}`);
          if (existingWord) {
            // 更新现有单词 - 同时更新共享池和用户数据库
            const { cloudStorage } = await import('@/utils/cloudReadyStorage');
            await cloudStorage.addSharedWord(word); // 更新共享池
            const { updateWord } = await import('@/utils/dataAdapter');
            await updateWord(word); // 更新用户数据库
            console.log(`✅ 数据库更新成功: ${themeWord.word}`);
          } else {
            // 添加新单词
            await addWord(word);
            console.log(`✅ 数据库保存成功: ${themeWord.word}`);
          }
          
          console.log(`✅ 导入成功: ${themeWord.word} (${globalIndex + 1}/${totalWords})`);
          
          return { success: true, word, error: null };
          
        } catch (error) {
          const errorMsg = `导入单词 "${themeWord.word}" 失败: ${error}`;
          console.error(`❌ ${errorMsg}`);
          return { success: false, word: null, error: errorMsg };
        }
      });

      // 等待当前批次完成
      const batchResults = await Promise.all(batchPromises);
      
      // 统计结果
      batchResults.forEach(batchResult => {
        if (batchResult.success && batchResult.word) {
          result.importedWords.push(batchResult.word);
          result.importedCount++;
        } else if (batchResult.error) {
          result.errors.push(batchResult.error);
          result.errorCount++;
        }
      });

      // 批次间延迟 - 增加延迟避免API限制
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 增加到3秒
      }
    }

    console.log(`🎉 批量导入完成: ${result.importedCount} 成功, ${result.errorCount} 失败`);
    
    return result;
  }

  /**
   * 生成单词ID
   */
  private generateWordId(word: string): string {
    return `theme_${word.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  /**
   * 检查单词是否已存在
   */
  public async checkWordExists(word: string): Promise<Word | null> {
    try {
      const { getAllWords } = await import('@/utils/dataAdapter');
      const allWords = await getAllWords();
      
      // 检查是否存在相同的单词（忽略大小写）
      const normalizedWord = word.toLowerCase().trim();
      const existingWord = allWords.find(existingWord => 
        existingWord.word.toLowerCase().trim() === normalizedWord
      );
      
      if (existingWord) {
        console.log(`🔍 发现已存在的单词: ${word}`);
      }
      
      return existingWord || null;
    } catch (error) {
      console.error(`❌ 检查单词是否存在时出错: ${word}`, error);
      return null; // 出错时认为不存在，继续导入
    }
  }

  /**
   * 获取词库统计信息
   */
  public getWordbankStats(wordbankId: string): { totalWords: number; categories: string[] } | null {
    const wordbank = this.getWordbankById(wordbankId);
    if (!wordbank) return null;

    return {
      totalWords: wordbank.words.length,
      categories: wordbank.categories
    };
  }

  /**
   * 导入启蒙基础高频词库
   * 重复单词会更新图片（使用新的提示词），但保持现有数据
   */
  public async importBeginnerWordbank(
    onProgress?: (current: number, total: number, word: string) => void,
    quickMode: boolean = false
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      importedWords: []
    };

    console.log(`🎯 开始导入启蒙基础高频词库 (${beginnerWordbank.length} 个单词)`);
    console.log(`🎯 启蒙词库数据:`, beginnerWordbank.slice(0, 3)); // 显示前3个单词

    for (let i = 0; i < beginnerWordbank.length; i++) {
      const beginnerWord = beginnerWordbank[i];
      
      try {
        // 调用进度回调
        if (onProgress) {
          onProgress(i + 1, beginnerWordbank.length, beginnerWord.word);
        }

        // 检查单词是否已存在
        const existingWord = await this.checkWordExists(beginnerWord.word);
        let word: Word;
        
        console.log(`🔍 检查启蒙单词: ${beginnerWord.word}, 翻译: ${beginnerWord.translation}`);
        
        if (existingWord) {
          console.log(`🔄 单词"${beginnerWord.word}"已存在，使用新提示词重新生图`);
          // 更新现有单词，但使用新的提示词重新生图
          word = {
            ...existingWord,
            translation: beginnerWord.translation, // 更新翻译
            categories: [...(existingWord.categories || []), beginnerWord.category], // 添加新分类
            updatedAt: Date.now()
          };
        } else {
          console.log(`➕ 单词"${beginnerWord.word}"不存在，创建新单词`);
          // 创建新Word对象
          word = {
            id: this.generateWordId(beginnerWord.word),
            word: beginnerWord.word,
            translation: beginnerWord.translation,
            categories: [beginnerWord.category],
            reviewCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
        }
        
        // 使用启蒙词库的专门提示词重新生图
        let imageUrl;
        try {
          // 使用专门的AI生图函数，传入启蒙词库的提示词
          const imageResult = await this.generateBeginnerImage(beginnerWord.word, beginnerWord.imagePrompt);
          if (imageResult.success && imageResult.imageUrl) {
            imageUrl = imageResult.imageUrl;
            console.log(`✅ 启蒙生图成功: ${beginnerWord.word}`);
          } else {
            throw new Error(`启蒙生图失败: ${imageResult.error || '未知错误'}`);
          }
        } catch (error) {
          console.warn(`⚠️ 启蒙生图失败，使用SVG备选: ${beginnerWord.word}`, error);
          // 使用SVG作为备选方案
          const { generateSimpleSVG } = await import('@/utils/simpleSvg');
          imageUrl = generateSimpleSVG(beginnerWord.word);
          console.log(`✅ 使用SVG备选: ${beginnerWord.word}`);
        }
        
        // 设置图片URL
        word.imageUrl = imageUrl;

        // 保存到数据库
        if (existingWord) {
          // 更新现有单词 - 同时更新共享池和用户数据库
          const { cloudStorage } = await import('@/utils/cloudReadyStorage');
          await cloudStorage.addSharedWord(word); // 更新共享池
          const { updateWord } = await import('@/utils/dataAdapter');
          await updateWord(word); // 更新用户数据库
          result.importedCount++;
        } else {
          // 添加新单词
          await addWord(word);
          result.importedCount++;
        }
        
        result.importedWords.push(word);
        
        console.log(`✅ 启蒙导入成功: ${beginnerWord.word} (${i + 1}/${beginnerWordbank.length})`);
        
        // 添加延迟，避免API限制
        if (i < beginnerWordbank.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒延迟
        }
        
      } catch (error) {
        const errorMsg = `导入启蒙单词 "${beginnerWord.word}" 失败: ${error}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
        result.errorCount++;
      }
    }

    console.log(`🎉 启蒙词库导入完成: ${result.importedCount} 成功, ${result.errorCount} 失败`);
    console.log(`🎯 导入结果详情:`, result);
    
    return result;
  }

  /**
   * 使用启蒙词库的专门提示词生成图片
   */
  private async generateBeginnerImage(word: string, prompt: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      // 使用专门的AI生图函数，传入自定义提示词
      const { generateWordImage } = await import('@/utils/aiImage');
      
      // 临时修改提示词
      const originalGenerateWordImage = generateWordImage;
      
      // 创建一个自定义的生图函数
      const customGenerateWordImage = async (word: string) => {
        const { buildOptimizedImageUrl } = await import('@/utils/imageConfig');
        const imageUrl = buildOptimizedImageUrl(prompt, word.length); // 使用启蒙词库的提示词
        
        console.log(`🎨 使用启蒙提示词生图: ${word} - ${prompt}`);
        
        try {
          // 等待API生成
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          if (blob.size === 0) {
            throw new Error('API返回空文件');
          }
          
          // 转换为base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(blob);
          const base64Data = await base64Promise;
          
          return {
            success: true,
            imageUrl: base64Data,
            prompt: prompt
          };
        } catch (error) {
          console.warn(`⚠️ 启蒙生图API失败，使用SVG备选: ${word}`, error);
          const { generateSimpleSVG } = await import('@/utils/simpleSvg');
          const svgContent = generateSimpleSVG(word);
          const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
          return {
            success: true,
            imageUrl: svgDataUrl,
            prompt: prompt
          };
        }
      };
      
      return await customGenerateWordImage(word);
    } catch (error) {
      return {
        success: false,
        error: `启蒙生图失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
