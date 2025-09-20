
// 本地存储工具函数
import { Word, PRESET_WORDS } from '../types';
import { generateSimpleSVG } from './simpleSvg';

// 增强版单词SVG图片生成器
const generateWordSVG = (word: string): string => {
  const themes = [
    { main: '#8B5CF6', bg: '#F3F4FF', accent: '#C084FC', name: 'purple' },
    { main: '#EC4899', bg: '#FFEEF5', accent: '#F472B6', name: 'pink' },
    { main: '#F59E0B', bg: '#FEF3C7', accent: '#FBBF24', name: 'orange' },
    { main: '#10B981', bg: '#D1FAE5', accent: '#34D399', name: 'green' },
    { main: '#3B82F6', bg: '#DBEAFE', accent: '#60A5FA', name: 'blue' },
    { main: '#EF4444', bg: '#FEE2E2', accent: '#F87171', name: 'red' }
  ];
  
  // 根据分类选择主题色
  const categoryThemes: Record<string, number> = {
    'food': 1,     // 粉色 - 温暖食物
    'animals': 3,  // 绿色 - 自然动物
    'family': 4,   // 蓝色 - 温馨家庭
    'actions': 0,  // 紫色 - 活力动作
    'school': 2,   // 橙色 - 活跃学习
    'nature': 5,   // 红色 - 自然元素
  };
  
  // 从预置单词中找到对应的分类
  const presetWord = PRESET_WORDS.find(w => w.word.toLowerCase() === word.toLowerCase());
  const category = presetWord?.categories?.[0] || 'nature';
  const themeIndex = categoryThemes[category] || (word.length % themes.length);
  const theme = themes[themeIndex];
  
  // 精心设计的emoji映射
  const categoryEmojis: Record<string, Record<string, string>> = {
    food: {
      'apple': '🍎', 'banana': '🍌', 'cake': '🎂', 'milk': '🥛', 'bread': '🍞',
      'egg': '🥚', 'fish': '🐟', 'rice': '🍚', 'water': '💧', 'juice': '🧃',
      'orange': '🍊', 'grape': '🍇', 'cookie': '🍪', 'candy': '🍭', 'ice cream': '🍦'
    },
    animals: {
      'cat': '🐱', 'dog': '🐶', 'bird': '🐦', 'rabbit': '🐰', 'elephant': '🐘',
      'lion': '🦁', 'bear': '🐻', 'tiger': '🐅', 'monkey': '🐵', 'duck': '🦆',
      'horse': '🐴', 'cow': '🐄', 'pig': '🐷', 'sheep': '🐑', 'chicken': '🐓'
    },
    family: {
      'mom': '👩', 'dad': '👨', 'baby': '👶', 'sister': '👧', 'brother': '👦',
      'grandma': '👵', 'grandpa': '👴', 'head': '👤', 'hand': '✋', 'foot': '🦶',
      'eye': '👁️', 'ear': '👂'
    },
    actions: {
      'run': '🏃', 'jump': '🦘', 'walk': '🚶', 'sit': '🪑', 'stand': '🧍',
      'eat': '🍽️', 'drink': '🥤', 'sleep': '😴', 'play': '🎮', 'read': '👓',
      'sing': '🎵', 'dance': '💃', 'draw': '🎨', 'write': '✏️', 'listen': '👂',
      'happy': '😊', 'sad': '😢', 'angry': '😠', 'tired': '😴', 'good': '👍',
      'bad': '👎', 'nice': '😊', 'new': '🆕', 'old': '📰', 'fast': '💨', 'slow': '🐌'
    },
    school: {
      'school': '🏫', 'teacher': '👩‍🏫', 'book': '📚', 'pen': '🖊️', 'desk': '🪑',
      'chair': '🪑', 'bag': '🎒', 'pencil': '✏️', 'student': '🎓', 'classroom': '🏛️',
      'homework': '📝', 'lesson': '📖', 'friend': '👫', 'toy': '🧸', 'ball': '⚽',
      'doll': '🪆', 'game': '🎲', 'music': '🎶', 'one': '1️⃣', 'two': '2️⃣',
      'three': '3️⃣', 'four': '4️⃣', 'five': '5️⃣'
    },
    nature: {
      'sun': '☀️', 'moon': '🌙', 'star': '⭐', 'tree': '🌳', 'flower': '🌸',
      'grass': '🌱', 'sky': '☁️', 'cloud': '☁️', 'rain': '🌧️', 'snow': '❄️',
      'red': '🔴', 'blue': '🔵', 'green': '🟢', 'yellow': '🟡', 'white': '⚪',
      'black': '⚫', 'big': '📏', 'small': '🔍', 'hot': '🔥', 'cold': '🧊'
    }
  };
  
  const emoji = categoryEmojis[category]?.[word.toLowerCase()] || '✨';
  
  // 创建简洁清晰的SVG设计
  const uniqueId = `${word}-${Date.now()}`;
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <!-- 背景圆形 -->
      <circle cx="32" cy="32" r="30" fill="${theme.bg}" stroke="${theme.main}" stroke-width="2"/>
      
      <!-- emoji图标 -->
      <text x="32" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">${emoji}</text>
    </svg>
  `.trim();
};

const STORAGE_KEY = 'word-flashcard-data';

export interface StorageData {
  words: Word[];
  lastUpdated: string;
}

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 标准化单词格式（首字母大写）
export const normalizeWord = (word: string): string => {
  const trimmed = word.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

// 检查单词是否已存在（忽略大小写）
export const checkWordExists = (word: string): boolean => {
  const data = getStoredData();
  const normalizedWord = normalizeWord(word);
  return data.words.some(existingWord => 
    normalizeWord(existingWord.word) === normalizedWord
  );
};

// 获取存储的数据
export const getStoredData = (): StorageData => {
  if (typeof window === 'undefined') {
    return { words: [], lastUpdated: new Date().toISOString() };
  }

  try {
    // 尝试新的存储格式 (vocabularyData)
    let stored = localStorage.getItem('vocabularyData');
    if (stored) {
      console.log('📊 从 vocabularyData 读取数据');
      const data = JSON.parse(stored);
      if (data && data.words) {
        return data;
      }
    }
    
    // 尝试旧的存储格式 (word-flashcard-data)
    stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log('📊 从 word-flashcard-data 读取数据');
      const data = JSON.parse(stored);
      // 数据迁移：处理旧数据结构
      if (data.words) {
        data.words = data.words.map((word: any) => {
          // 将旧的category字段转换为categories数组
          if (word.category && !word.categories) {
            word.categories = [word.category];
            delete word.category;
          }
          // 确保categories是数组
          if (!word.categories) {
            word.categories = ['uncategorized'];
          }
          
          return {
            ...word,
            createdAt: typeof word.createdAt === 'number' ? word.createdAt : new Date(word.createdAt).getTime()
          };
        });
      }
      return data;
    }
  } catch (error) {
    console.error('Error reading stored data:', error);
  }

  // 如果没有存储数据，返回空数组（不初始化预置单词）
  // 预置单词将通过主题词库功能导入，使用AI生图
  const initialData: StorageData = {
    words: [],
    lastUpdated: new Date().toISOString(),
  };

  return initialData;
};

// 保存数据
export const saveData = (data: StorageData): void => {
  if (typeof window === 'undefined') return;

  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// 添加新单词
export const addWord = (wordData: Omit<Word, 'id' | 'createdAt' | 'reviewCount'>): Word => {
  // 标准化单词格式
  const normalizedWord = normalizeWord(wordData.word);
  
  const newWord: Word = {
    ...wordData,
    word: normalizedWord, // 使用标准化后的单词
    id: generateId(),
    createdAt: Date.now(),
    reviewCount: 0,
  };

  const currentData = getStoredData();
  const updatedData: StorageData = {
    words: [...currentData.words, newWord],
    lastUpdated: new Date().toISOString(),
  };

  saveData(updatedData);
  return newWord;
};

// 删除单词
export const deleteWord = (wordId: string): void => {
  const currentData = getStoredData();
  const updatedData: StorageData = {
    words: currentData.words.filter(word => word.id !== wordId),
    lastUpdated: new Date().toISOString(),
  };

  saveData(updatedData);
};

// 更新单词复习次数
export const updateWordReviewCount = (wordId: string): void => {
  const currentData = getStoredData();
  const updatedData: StorageData = {
    words: currentData.words.map(word => 
      word.id === wordId 
        ? { ...word, reviewCount: word.reviewCount + 1 }
        : word
    ),
    lastUpdated: new Date().toISOString(),
  };

  saveData(updatedData);
};

// 更新单词信息
export const updateWord = (updatedWord: Word): void => {
  const currentData = getStoredData();
  const updatedData: StorageData = {
    words: currentData.words.map(word => 
      word.id === updatedWord.id ? updatedWord : word
    ),
    lastUpdated: new Date().toISOString(),
  };

  saveData(updatedData);
};

// 按分类筛选单词
export const getAllWords = (): Word[] => {
  const data = getStoredData();
  return data.words;
};

export const getWordsByCategory = (category: string): Word[] => {
  const data = getStoredData();
  if (category === 'all') {
    return data.words;
  }
  return data.words.filter(word => (word.categories || []).includes(category));
};

// 搜索单词
export const searchWords = (query: string, category?: string): Word[] => {
  const data = getStoredData();
  let words = category && category !== 'all' 
    ? data.words.filter(word => (word.categories || []).includes(category))
    : data.words;

  if (!query.trim()) {
    return words;
  }

  const searchTerm = query.toLowerCase();
  return words.filter(word => 
    word.word.toLowerCase().includes(searchTerm) ||
    word.translation.toLowerCase().includes(searchTerm)
  );
};