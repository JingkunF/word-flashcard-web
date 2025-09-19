/**
 * 数据适配器 - 统一数据访问接口
 * 优先使用 IndexedDB，如果没有数据则回退到 localStorage
 */

import { Word, Category } from '@/types';
import { getStoredData, addWord as addWordToStorage, deleteWord as deleteWordFromStorage, updateWord as updateWordInStorage } from './storage';
// 移除旧的localDatabase导入，完全使用新的cloudReadyStorage架构
import { cloudStorage } from './cloudReadyStorage';

/**
 * 获取所有单词 - 从用户个人数据库获取引用，从共享池获取完整数据
 */
export const getAllWords = async (): Promise<Word[]> => {
  try {
    // 1. 从用户个人数据库获取单词引用
    const userWordRefs = await cloudStorage.getUserWords();
    
    if (userWordRefs.length === 0) {
      console.log('📊 用户个人数据库为空');
      return [];
    }
    
    console.log(`📊 从用户数据库获取 ${userWordRefs.length} 个单词引用`);
    
    // 2. 从共享池获取完整的单词数据（包括图片）
    const completeWords: Word[] = [];
    
    for (const wordRef of userWordRefs) {
      try {
        // 从共享池获取完整单词数据
        const sharedWord = await cloudStorage.getSharedWord(wordRef.word);
        if (sharedWord) {
          // 合并用户个人数据（如学习进度）和共享数据
          // 重要：保持用户数据库中的原始ID，用于删除操作
          completeWords.push({
            ...sharedWord,
            id: wordRef.id, // 保持用户数据库中的ID
            reviewCount: wordRef.reviewCount || 0,
            // 保留用户个人设置
          });
        } else {
          console.warn(`⚠️ 共享池中未找到单词: ${wordRef.word}`);
          // 如果共享池中没有，使用用户数据库中的数据
          completeWords.push(wordRef);
        }
      } catch (error) {
        console.error(`❌ 获取共享单词失败: ${wordRef.word}`, error);
        // 回退到用户数据库中的数据
        completeWords.push(wordRef);
      }
    }
    
    console.log(`✅ 成功获取 ${completeWords.length} 个完整单词数据`);
    return completeWords;
    
  } catch (error) {
    console.error('❌ 获取单词数据失败:', error);
    return [];
  }
};

/**
 * 添加单词 - 先存储到共享池，再添加到用户个人数据库
 */
export const addWord = async (word: Word): Promise<void> => {
  try {
    // 确保单词包含完整信息
    const completeWord = {
      ...word,
      createdAt: word.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    
    console.log(`🚀 开始添加单词: ${completeWord.word}`);
    
    // 1. 首先确保单词在共享池中（包括AI图片）
    console.log(`💾 步骤1: 确保单词在共享池中...`);
    await cloudStorage.addSharedWord(completeWord);
    console.log(`✅ 单词 "${completeWord.word}" 已存储到共享池`);
    
    // 2. 然后添加到用户个人数据库（作为引用）
    console.log(`💾 步骤2: 添加到用户个人数据库...`);
    await cloudStorage.addUserWord(completeWord);
    console.log(`✅ 单词 "${completeWord.word}" 已添加到用户个人数据库`);
    
    // 验证存储是否成功
    try {
      const sharedWord = await cloudStorage.getSharedWord(completeWord.word);
      const userWords = await cloudStorage.getUserWords();
      const userWord = userWords.find(w => w.word === completeWord.word);
      
      if (sharedWord && userWord) {
        console.log(`✅ 验证成功: 单词 "${completeWord.word}" 同时存在于共享池和用户数据库中`);
      } else {
        console.error(`❌ 验证失败: 共享池=${!!sharedWord}, 用户数据库=${!!userWord}`);
      }
    } catch (verifyError) {
      console.error(`❌ 验证存储时出错:`, verifyError);
    }
    
    console.log(`📊 数据存储完成: 共享池 + 用户个人数据库 (云端上传兼容)`);
    
  } catch (error) {
    console.error('❌ 添加单词失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`无法添加单词 "${word.word}": ${errorMessage}`);
  }
};

/**
 * 更新单词 - 只更新用户个人数据库，保护共享池数据
 */
export const updateWord = async (word: Word): Promise<void> => {
  console.log(`🔄 开始更新单词: ${word.word}`);
  console.log(`🛡️ 保护模式: 只更新用户个人数据库，共享池数据保持不变`);
  
  try {
    // 只更新用户个人数据库，不影响共享池
    await cloudStorage.updateUserWord(word);
    console.log(`✅ 单词 "${word.word}" 已在用户个人数据库中更新`);
    console.log(`🛡️ 共享池中的单词数据已保护，未被修改`);
    
  } catch (error) {
    console.error('❌ 更新单词过程中发生错误:', error);
    throw error;
  }
};

/**
 * 删除单词 - 只从用户个人数据库删除，保护共享池数据
 */
export const deleteWord = async (wordId: string): Promise<void> => {
  console.log(`🗑️ 开始删除单词: ${wordId}`);
  console.log(`🛡️ 保护模式: 只删除用户个人数据库中的引用，共享池数据保持不变`);
  
  try {
    // 只从用户个人数据库删除，不影响共享池
    await cloudStorage.deleteUserWord(wordId);
    console.log(`✅ 单词已从用户个人数据库删除: ${wordId}`);
    console.log(`🛡️ 共享池中的单词数据已保护，未被删除`);
    
  } catch (error) {
    console.error('❌ 删除单词过程中发生错误:', error);
    throw error;
  }
};

/**
 * 搜索单词
 */
export const searchWords = async (query: string, category: string = 'all'): Promise<Word[]> => {
  const allWords = await getAllWords();
  
  let filtered = allWords;
  
  // 按分类筛选
  if (category !== 'all') {
    filtered = filtered.filter(word => 
      word.categories && word.categories.includes(category)
    );
  }
  
  // 按关键词搜索
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(word =>
      word.word.toLowerCase().includes(lowerQuery) ||
      word.translation.toLowerCase().includes(lowerQuery) ||
      (word.example && word.example.toLowerCase().includes(lowerQuery))
    );
  }
  
  return filtered;
};

/**
 * 获取数据源信息
 */
export const getDataSourceInfo = async () => {
  try {
    // 使用新的云端架构获取数据信息
    const userWords = await cloudStorage.getUserWords();
    const localData = getStoredData();
    
    // 获取实际可用的单词数量
    const actualWords = await getAllWords();
    
    let primarySource = 'none';
    if (userWords.length > 0) {
      primarySource = 'cloudReadyStorage';
    } else if (localData.words.length > 0) {
      primarySource = 'localStorage';
    }
    
    return {
      cloudReadyStorage: {
        available: true,
        userWordCount: userWords.length,
        sharedWordCount: actualWords.length
      },
      localStorage: {
        available: true,
        wordCount: localData.words.length,
        size: JSON.stringify(localData).length
      },
      actualTotal: actualWords.length,
      primarySource
    };
  } catch (error) {
    const localData = getStoredData();
    const actualWords = await getAllWords();
    
    return {
      cloudReadyStorage: {
        available: false,
        userWordCount: 0,
        sharedWordCount: 0
      },
      localStorage: {
        available: true,
        wordCount: localData.words.length,
        size: JSON.stringify(localData).length
      },
      actualTotal: actualWords.length,
      primarySource: localData.words.length > 0 ? 'localStorage' : 'none'
    };
  }
};

/**
 * 检查是否需要迁移
 */
export const checkMigrationNeeded = async (): Promise<boolean> => {
  try {
    const info = await getDataSourceInfo();
    return info.localStorage.wordCount > 0 && info.cloudReadyStorage.userWordCount === 0;
  } catch (error) {
    return false;
  }
};

/**
 * 批量更新共享池中的翻译数据
 */
export const batchUpdateTranslations = async (): Promise<{ updatedCount: number; errors: string[] }> => {
  console.log('🔄 开始批量更新共享池中的翻译数据...');
  
  const result = { updatedCount: 0, errors: [] as string[] };
  
  try {
    // 获取所有共享单词
    const allSharedWords = await cloudStorage.getAllSharedWords();
    console.log(`📊 找到 ${allSharedWords.length} 个共享单词`);
    
    // 直接定义翻译映射
    const translations: Record<string, string> = {
      'above': '在...上面',
      'actor': '演员',
      'adult': '成年人',
      'adventure': '冒险',
      'afternoon': '下午',
      'ago': '以前',
      'angle': '角度',
      'apple': '苹果',
      'arm': '手臂',
      'art': '艺术',
      'baby': '婴儿',
      'back': '后面',
      'bag': '包',
      'ball': '球',
      'bank': '银行',
      'bathroom': '浴室',
      'bed': '床',
      'bedroom': '卧室',
      'bird': '鸟',
      'black': '黑色',
      'blue': '蓝色',
      'book': '书',
      'box': '盒子',
      'boy': '男孩',
      'bread': '面包',
      'breakfast': '早餐',
      'brother': '兄弟',
      'brown': '棕色',
      'bus': '公交车',
      'cake': '蛋糕',
      'car': '汽车',
      'cat': '猫',
      'chair': '椅子',
      'chicken': '鸡',
      'child': '孩子',
      'children': '孩子们',
      'classroom': '教室',
      'clock': '时钟',
      'clothes': '衣服',
      'cloud': '云',
      'coat': '外套',
      'coffee': '咖啡',
      'cold': '冷的',
      'computer': '电脑',
      'cook': '烹饪',
      'cookie': '饼干',
      'cooking': '烹饪',
      'cool': '凉爽的',
      'cow': '牛',
      'cup': '杯子',
      'dance': '跳舞',
      'day': '天',
      'dinner': '晚餐',
      'dog': '狗',
      'door': '门',
      'down': '向下',
      'draw': '画',
      'drink': '喝',
      'drive': '驾驶',
      'ear': '耳朵',
      'eat': '吃',
      'egg': '鸡蛋',
      'eight': '八',
      'elephant': '大象',
      'eye': '眼睛',
      'face': '脸',
      'family': '家庭',
      'father': '父亲',
      'feet': '脚',
      'fire': '火',
      'fish': '鱼',
      'five': '五',
      'floor': '地板',
      'flower': '花',
      'food': '食物',
      'foot': '脚',
      'four': '四',
      'friend': '朋友',
      'game': '游戏',
      'garden': '花园',
      'girl': '女孩',
      'glass': '玻璃',
      'go': '去',
      'good': '好的',
      'green': '绿色',
      'hair': '头发',
      'hand': '手',
      'happy': '快乐的',
      'hat': '帽子',
      'head': '头',
      'help': '帮助',
      'home': '家',
      'horse': '马',
      'hot': '热的',
      'house': '房子',
      'hungry': '饥饿的',
      'ice': '冰',
      'jump': '跳',
      'key': '钥匙',
      'kitchen': '厨房',
      'kite': '风筝',
      'know': '知道',
      'lamp': '灯',
      'large': '大的',
      'leg': '腿',
      'light': '光',
      'like': '喜欢',
      'listen': '听',
      'little': '小的',
      'live': '生活',
      'look': '看',
      'love': '爱',
      'lunch': '午餐',
      'make': '制作',
      'man': '男人',
      'many': '许多',
      'milk': '牛奶',
      'money': '钱',
      'mother': '母亲',
      'mouse': '老鼠',
      'mouth': '嘴',
      'move': '移动',
      'name': '名字',
      'new': '新的',
      'nice': '好的',
      'night': '夜晚',
      'nine': '九',
      'nose': '鼻子',
      'not': '不',
      'now': '现在',
      'number': '数字',
      'old': '老的',
      'one': '一',
      'orange': '橙色',
      'paper': '纸',
      'park': '公园',
      'pen': '笔',
      'pencil': '铅笔',
      'people': '人们',
      'phone': '电话',
      'picture': '图片',
      'pig': '猪',
      'play': '玩',
      'please': '请',
      'pretty': '漂亮的',
      'purple': '紫色',
      'rabbit': '兔子',
      'read': '读',
      'red': '红色',
      'ride': '骑',
      'right': '右边',
      'room': '房间',
      'run': '跑',
      'sad': '悲伤的',
      'school': '学校',
      'see': '看见',
      'seven': '七',
      'she': '她',
      'shirt': '衬衫',
      'shoe': '鞋子',
      'shop': '商店',
      'short': '短的',
      'sing': '唱歌',
      'sister': '姐妹',
      'sit': '坐',
      'six': '六',
      'sleep': '睡觉',
      'small': '小的',
      'smile': '微笑',
      'snake': '蛇',
      'snow': '雪',
      'sock': '袜子',
      'song': '歌曲',
      'stand': '站',
      'stop': '停止',
      'story': '故事',
      'sun': '太阳',
      'swim': '游泳',
      'table': '桌子',
      'talk': '说话',
      'tall': '高的',
      'tea': '茶',
      'teacher': '老师',
      'ten': '十',
      'thank': '谢谢',
      'that': '那个',
      'the': '这个',
      'their': '他们的',
      'there': '那里',
      'they': '他们',
      'think': '想',
      'this': '这个',
      'three': '三',
      'time': '时间',
      'to': '到',
      'today': '今天',
      'toy': '玩具',
      'tree': '树',
      'two': '二',
      'up': '向上',
      'us': '我们',
      'very': '非常',
      'walk': '走',
      'wall': '墙',
      'want': '想要',
      'water': '水',
      'we': '我们',
      'white': '白色',
      'window': '窗户',
      'woman': '女人',
      'work': '工作',
      'write': '写',
      'yellow': '黄色',
      'yes': '是的',
      'you': '你',
      'young': '年轻的',
      'your': '你的'
    };
    
    console.log(`📚 加载了 ${Object.keys(translations).length} 个翻译映射`);
    
    // 批量更新
    for (const sharedWord of allSharedWords) {
      try {
        const newTranslation = translations[sharedWord.word.toLowerCase()];
        if (newTranslation && newTranslation !== sharedWord.translation) {
          console.log(`🔄 更新翻译: ${sharedWord.word} - ${sharedWord.translation} → ${newTranslation}`);
          
          // 更新单词的翻译
          const updatedWord = {
            ...sharedWord,
            translation: newTranslation,
            updatedAt: Date.now()
          };
          
          // 保存到共享池
          await cloudStorage.addSharedWord(updatedWord);
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
};

// 翻译更新功能已集成到 batchUpdateTranslations 函数中
// 需要时可以手动调用该函数来更新翻译
