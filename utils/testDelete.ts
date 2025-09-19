/**
 * 测试删除功能
 */

import { getAllWords, deleteWord } from './dataAdapter';

/**
 * 测试删除功能
 */
export async function testDeleteFunction(): Promise<{
  success: boolean;
  error?: string;
  beforeCount?: number;
  afterCount?: number;
  deletedWord?: string;
}> {
  console.log('🧪 开始测试删除功能...');
  
  try {
    // 1. 获取删除前的单词数量
    const beforeWords = await getAllWords();
    const beforeCount = beforeWords.length;
    console.log(`📊 删除前共有 ${beforeCount} 个单词`);
    
    if (beforeCount === 0) {
      return {
        success: false,
        error: '没有单词可以删除'
      };
    }
    
    // 2. 选择第一个单词进行删除测试
    const testWord = beforeWords[0];
    console.log(`🎯 选择测试单词: "${testWord.word}" (ID: ${testWord.id})`);
    
    // 3. 执行删除
    await deleteWord(testWord.id);
    console.log(`✅ 删除操作完成`);
    
    // 4. 获取删除后的单词数量
    const afterWords = await getAllWords();
    const afterCount = afterWords.length;
    console.log(`📊 删除后共有 ${afterCount} 个单词`);
    
    // 5. 验证删除是否成功
    const success = afterCount === beforeCount - 1;
    
    if (success) {
      console.log(`🎉 删除测试成功！删除了 "${testWord.word}"`);
    } else {
      console.error(`❌ 删除测试失败！预期删除1个单词，但数量从${beforeCount}变为${afterCount}`);
    }
    
    return {
      success,
      beforeCount,
      afterCount,
      deletedWord: testWord.word,
      error: success ? undefined : `删除失败：数量从${beforeCount}变为${afterCount}`
    };
    
  } catch (error) {
    console.error('❌ 删除测试过程中发生错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 测试获取单词功能
 */
export async function testGetWords(): Promise<{
  success: boolean;
  error?: string;
  wordCount?: number;
  sampleWords?: Array<{id: string, word: string}>;
}> {
  console.log('🧪 开始测试获取单词功能...');
  
  try {
    const words = await getAllWords();
    const wordCount = words.length;
    
    console.log(`📊 成功获取 ${wordCount} 个单词`);
    
    // 显示前5个单词的示例
    const sampleWords = words.slice(0, 5).map(w => ({
      id: w.id,
      word: w.word
    }));
    
    if (sampleWords.length > 0) {
      console.log('📋 示例单词:');
      sampleWords.forEach((w, index) => {
        console.log(`  ${index + 1}. "${w.word}" (ID: ${w.id})`);
      });
    }
    
    return {
      success: true,
      wordCount,
      sampleWords
    };
    
  } catch (error) {
    console.error('❌ 获取单词测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
