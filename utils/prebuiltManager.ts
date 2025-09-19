/**
 * 预制词库管理器
 */

import { Word } from '@/types';
import { PrebuiltWord, PrebuiltCategory, findPrebuiltWord, getPrebuiltWordsByTheme, PREBUILT_CATEGORIES } from '@/data/prebuiltWords';
import { addWord, getAllWords } from './storage';
// 生成唯一ID的简单实现
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * 用户初始化状态
 */
export interface UserInitState {
  hasInitialized: boolean;
  selectedPrebuiltCategories: string[];
  initDate: number;
}

/**
 * 获取用户初始化状态
 */
export const getUserInitState = (): UserInitState => {
  if (typeof window === 'undefined') {
    return { hasInitialized: false, selectedPrebuiltCategories: [], initDate: 0 };
  }

  const stored = localStorage.getItem('userInitState');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('解析用户初始化状态失败:', error);
    }
  }

  return { hasInitialized: false, selectedPrebuiltCategories: [], initDate: 0 };
};

/**
 * 保存用户初始化状态
 */
export const saveUserInitState = (state: UserInitState): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('userInitState', JSON.stringify(state));
};

/**
 * 将预制单词转换为用户单词
 */
export const convertPrebuiltToUserWord = (prebuiltWord: PrebuiltWord, categories: string[] = ['未归类']): Word => {
  return {
    id: generateUniqueId(),
    word: prebuiltWord.word,
    translation: prebuiltWord.translation,
    example: prebuiltWord.example,
    imageUrl: prebuiltWord.imageUrl,
    categories: categories,
    createdAt: Date.now(),
    reviewCount: 0,
    lastReviewTime: Date.now()
  };
};

/**
 * 批量导入预制词库
 */
export const importPrebuiltCategories = async (categoryIds: string[]): Promise<{
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}> => {
  const result = {
    success: true,
    importedCount: 0,
    skippedCount: 0,
    errors: [] as string[]
  };

  try {
    // 获取现有单词，用于去重
    const existingWords = getAllWords();
    const existingWordsList = existingWords.map(w => w.word.toLowerCase());

    for (const categoryId of categoryIds) {
      const prebuiltWords = getPrebuiltWordsByTheme(categoryId);
      const categoryName = PREBUILT_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;

      for (const prebuiltWord of prebuiltWords) {
        // 检查是否已存在
        if (existingWordsList.includes(prebuiltWord.word.toLowerCase())) {
          result.skippedCount++;
          continue;
        }

        try {
          // 转换为用户单词并添加
          const userWord = convertPrebuiltToUserWord(prebuiltWord, [categoryName]);
          await addWord(userWord);
          result.importedCount++;
          
          // 更新已存在列表
          existingWordsList.push(prebuiltWord.word.toLowerCase());
        } catch (error) {
          result.errors.push(`导入单词 ${prebuiltWord.word} 失败: ${error}`);
          result.success = false;
        }
      }
    }

    // 更新用户初始化状态
    const initState = getUserInitState();
    initState.hasInitialized = true;
    initState.selectedPrebuiltCategories = categoryIds;
    initState.initDate = Date.now();
    saveUserInitState(initState);

  } catch (error) {
    result.success = false;
    result.errors.push(`批量导入失败: ${error}`);
  }

  return result;
};

/**
 * 获取预制词库中的单词（转换为用户单词格式）
 */
export const getPrebuiltWords = (categoryIds: string[]): Word[] => {
  const words: Word[] = [];
  
  for (const categoryId of categoryIds) {
    const prebuiltWords = getPrebuiltWordsByTheme(categoryId);
    const categoryName = PREBUILT_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
    
    for (const prebuiltWord of prebuiltWords) {
      const userWord = convertPrebuiltToUserWord(prebuiltWord, [categoryName]);
      words.push(userWord);
    }
  }
  
  console.log(`📚 从预制词库获取 ${words.length} 个单词，分类: ${categoryIds.join(', ')}`);
  return words;
};

/**
 * 尝试匹配预制单词（用于用户输入新单词时）
 */
export const tryMatchPrebuiltWord = async (inputWord: string): Promise<{
  matched: boolean;
  word?: Word;
  source: 'prebuilt' | 'ai';
}> => {
  // 查找预制词库中的匹配项
  const prebuiltMatch = findPrebuiltWord(inputWord);
  
  if (prebuiltMatch) {
    console.log('🎯 找到预制单词匹配:', prebuiltMatch.word);
    
    // 转换为用户单词
    const userWord = convertPrebuiltToUserWord(prebuiltMatch);
    
    return {
      matched: true,
      word: userWord,
      source: 'prebuilt'
    };
  }

  return {
    matched: false,
    source: 'ai'
  };
};

/**
 * 获取预制词库统计信息
 */
export const getPrebuiltStats = () => {
  const totalWords = PREBUILT_CATEGORIES.reduce((sum, cat) => sum + cat.wordCount, 0);
  const totalCategories = PREBUILT_CATEGORIES.length;
  
  return {
    totalWords,
    totalCategories,
    categories: PREBUILT_CATEGORIES
  };
};

/**
 * 检查单词是否在预制词库中
 */
export const isWordInPrebuilt = (word: string): boolean => {
  return findPrebuiltWord(word) !== null;
};

/**
 * 获取所有预制分类（简化版本）
 */
export const getAllCategories = (): PrebuiltCategory[] => {
  return PREBUILT_CATEGORIES;
};
