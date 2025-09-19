/**
 * 清理生成失败的单词
 * 识别并删除AI图片生成失败的单词
 */

import { cloudStorage } from './cloudReadyStorage';
import { Word } from '@/types';

export interface CleanupResult {
  totalWords: number;
  failedWords: number;
  cleanedWords: string[];
  errors: string[];
}

/**
 * 检查图片是否有效
 */
function isValidImageUrl(imageUrl: string | undefined): boolean {
  if (!imageUrl) return false;
  
  // 检查是否是有效的图片URL
  if (imageUrl.startsWith('data:image/')) {
    // Base64图片，检查是否为空或损坏
    return imageUrl.length > 100; // 简单检查：Base64图片应该有一定长度
  }
  
  if (imageUrl.startsWith('blob:')) {
    // Blob URL，可能是临时URL
    return false;
  }
  
  if (imageUrl.includes('AI_PENDING') || imageUrl.includes('ERROR')) {
    // 错误状态
    return false;
  }
  
  return true;
}

/**
 * 清理生成失败的单词
 */
export async function cleanupFailedWords(): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalWords: 0,
    failedWords: 0,
    cleanedWords: [],
    errors: []
  };

  try {
    console.log('🧹 开始清理生成失败的单词...');
    
    // 使用新的批量删除方法
    const deleteResult = await cloudStorage.batchDeleteFailedWords();
    
    result.failedWords = deleteResult.deletedCount;
    result.cleanedWords = deleteResult.deletedWords;
    
    // 获取剩余单词数量
    const remainingWords = await cloudStorage.getUserWords();
    result.totalWords = remainingWords.length;
    
    console.log(`🎉 清理完成: 删除了 ${result.failedWords} 个失败单词`);
    console.log(`📊 剩余正常单词: ${result.totalWords} 个`);
    
  } catch (error) {
    const errorMsg = `清理过程中发生错误: ${error}`;
    console.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
  }
  
  return result;
}

/**
 * 检查单词状态（不删除，仅检查）
 */
export async function checkWordStatus(): Promise<{
  totalWords: number;
  validWords: number;
  failedWords: number;
  wordStatus: Array<{
    word: string;
    status: 'valid' | 'failed' | 'missing';
    imageUrl?: string;
  }>;
}> {
  const result = {
    totalWords: 0,
    validWords: 0,
    failedWords: 0,
    wordStatus: [] as Array<{
      word: string;
      status: 'valid' | 'failed' | 'missing';
      imageUrl?: string;
    }>
  };

  try {
    console.log('🔍 开始检查单词状态...');
    
    const userWords = await cloudStorage.getUserWords();
    result.totalWords = userWords.length;
    
    for (const userWord of userWords) {
      try {
        const sharedWord = await cloudStorage.getSharedWord(userWord.word);
        
        if (sharedWord) {
          if (isValidImageUrl(sharedWord.imageUrl)) {
            result.validWords++;
            result.wordStatus.push({
              word: userWord.word,
              status: 'valid',
              imageUrl: sharedWord.imageUrl
            });
          } else {
            result.failedWords++;
            result.wordStatus.push({
              word: userWord.word,
              status: 'failed',
              imageUrl: sharedWord.imageUrl
            });
          }
        } else {
          result.failedWords++;
          result.wordStatus.push({
            word: userWord.word,
            status: 'missing'
          });
        }
        
      } catch (error) {
        console.error(`❌ 检查单词 "${userWord.word}" 时出错:`, error);
        result.failedWords++;
        result.wordStatus.push({
          word: userWord.word,
          status: 'failed'
        });
      }
    }
    
    console.log(`📊 检查完成: ${result.validWords} 正常, ${result.failedWords} 失败`);
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
  
  return result;
}