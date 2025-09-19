// 拼写检查工具
// 基于编辑距离算法和常用英语单词词典

/**
 * 常用英语单词词典 - 适合儿童学习
 */
const COMMON_WORDS = [
  // 动物类
  'cat', 'dog', 'bird', 'fish', 'rabbit', 'elephant', 'lion', 'tiger', 'bear', 'monkey',
  'duck', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'mouse', 'frog', 'snake', 'turtle',
  
  // 食物类
  'apple', 'banana', 'orange', 'grape', 'cake', 'bread', 'milk', 'egg', 'rice', 'water',
  'juice', 'cookie', 'candy', 'cheese', 'pizza', 'hamburger', 'sandwich', 'soup', 'tea', 'coffee',
  
  // 家庭类
  'mom', 'dad', 'baby', 'sister', 'brother', 'grandma', 'grandpa', 'family', 'home', 'house',
  'mother', 'father', 'parent', 'child', 'children', 'aunt', 'uncle', 'cousin',
  
  // 身体部位
  'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'arm', 'leg', 'hair',
  'face', 'neck', 'back', 'chest', 'finger', 'toe', 'knee', 'elbow', 'shoulder',
  
  // 学校类
  'school', 'teacher', 'student', 'book', 'pen', 'pencil', 'paper', 'desk', 'chair', 'bag',
  'classroom', 'homework', 'lesson', 'test', 'grade', 'friend', 'playground', 'library',
  
  // 颜色类
  'red', 'blue', 'green', 'yellow', 'white', 'black', 'brown', 'pink', 'purple', 'orange',
  'gray', 'grey', 'silver', 'gold', 'dark', 'light',
  
  // 数字类
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  
  // 动作类
  'run', 'walk', 'jump', 'sit', 'stand', 'eat', 'drink', 'sleep', 'play', 'read',
  'write', 'draw', 'sing', 'dance', 'listen', 'look', 'see', 'hear', 'touch', 'feel',
  'think', 'know', 'learn', 'teach', 'help', 'work', 'stop', 'start', 'go', 'come',
  
  // 形容词类
  'big', 'small', 'tall', 'short', 'long', 'wide', 'narrow', 'thick', 'thin', 'heavy',
  'light', 'fast', 'slow', 'hot', 'cold', 'warm', 'cool', 'new', 'old', 'young',
  'good', 'bad', 'nice', 'beautiful', 'ugly', 'happy', 'sad', 'angry', 'tired', 'excited',
  
  // 自然类
  'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind', 'tree', 'flower',
  'grass', 'leaf', 'mountain', 'river', 'lake', 'ocean', 'beach', 'forest', 'park',
  
  // 玩具和游戏
  'toy', 'ball', 'doll', 'game', 'puzzle', 'blocks', 'car', 'truck', 'train', 'plane',
  'bike', 'swing', 'slide', 'seesaw',
  
  // 衣物类
  'shirt', 'pants', 'dress', 'skirt', 'shoes', 'socks', 'hat', 'coat', 'jacket', 'gloves',
  
  // 时间类
  'day', 'night', 'morning', 'afternoon', 'evening', 'today', 'tomorrow', 'yesterday',
  'week', 'month', 'year', 'time', 'hour', 'minute',
  
  // 常用词汇
  'yes', 'no', 'please', 'thank', 'sorry', 'hello', 'goodbye', 'welcome', 'excuse',
  'love', 'like', 'want', 'need', 'have', 'get', 'give', 'take', 'put', 'make'
];

/**
 * 计算两个字符串之间的编辑距离（Levenshtein距离）
 */
function calculateEditDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // 创建二维数组
  const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }
  
  // 填充dp表
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }
  
  return dp[len1][len2];
}

/**
 * 计算相似度分数（0-1之间，1表示完全相同）
 */
function calculateSimilarity(word1: string, word2: string): number {
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 1;
  
  const editDistance = calculateEditDistance(word1.toLowerCase(), word2.toLowerCase());
  return 1 - (editDistance / maxLen);
}

/**
 * 检查单词拼写并提供建议
 */
export interface SpellCheckResult {
  isCorrect: boolean;
  suggestions: string[];
  confidence: number; // 最佳建议的置信度
}

export function checkSpelling(word: string): SpellCheckResult {
  const normalizedWord = word.toLowerCase().trim();
  
  // 检查是否在词典中
  if (COMMON_WORDS.includes(normalizedWord)) {
    return {
      isCorrect: true,
      suggestions: [],
      confidence: 1.0
    };
  }
  
  // 如果不在词典中，找最相似的单词
  const similarities = COMMON_WORDS.map(dictWord => ({
    word: dictWord,
    similarity: calculateSimilarity(normalizedWord, dictWord)
  }));
  
  // 按相似度排序
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // 获取前3个最相似的单词（相似度大于0.5）
  const suggestions = similarities
    .filter(item => item.similarity > 0.5)
    .slice(0, 3)
    .map(item => item.word);
  
  const confidence = similarities[0]?.similarity || 0;
  
  return {
    isCorrect: false,
    suggestions,
    confidence
  };
}

/**
 * 获取最佳拼写建议
 */
export function getBestSuggestion(word: string): string | null {
  const result = checkSpelling(word);
  if (result.isCorrect || result.suggestions.length === 0) {
    return null;
  }
  
  // 只有当置信度足够高时才返回建议
  if (result.confidence > 0.6) {
    return result.suggestions[0];
  }
  
  return null;
}

/**
 * 检查是否可能是常见的拼写错误
 */
export function isLikelyTypo(word: string): boolean {
  const result = checkSpelling(word);
  return !result.isCorrect && result.confidence > 0.7;
}
