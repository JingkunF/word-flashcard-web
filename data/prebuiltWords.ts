/**
 * 预制词库数据
 * 这些单词已经预先生成了AI图片和完整信息，可以被所有用户共享使用
 */

import { Word } from '@/types';

export interface PrebuiltWord extends Omit<Word, 'id' | 'categories' | 'reviewCount' | 'lastReviewTime' | 'createdAt'> {
  // 预制单词的唯一标识符
  prebuiltId: string;
  // 难度等级 (1-5)
  difficulty: number;
  // 适合年龄段
  ageRange: string;
  // 主题分类
  themes: string[];
  // 创建时间
  createdAt: number;
  // 最后更新时间
  updatedAt: number;
}

/**
 * 预制词库分类
 */
export interface PrebuiltCategory {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  ageRange: string;
  wordCount: number;
  color: string;
}

/**
 * 预制词库集合
 */
export const PREBUILT_CATEGORIES: PrebuiltCategory[] = [
  {
    id: 'basic-animals',
    name: '基础动物',
    description: '常见的动物单词',
    difficulty: 1,
    ageRange: '4-6岁',
    wordCount: 20,
    color: 'bg-green-100'
  },
  {
    id: 'basic-food',
    name: '基础食物',
    description: '日常食物单词',
    difficulty: 1,
    ageRange: '4-6岁',
    wordCount: 25,
    color: 'bg-yellow-100'
  },
  {
    id: 'family',
    name: '家庭成员',
    description: '家庭关系单词',
    difficulty: 1,
    ageRange: '4-7岁',
    wordCount: 15,
    color: 'bg-pink-100'
  },
  {
    id: 'colors',
    name: '颜色',
    description: '基础颜色单词',
    difficulty: 1,
    ageRange: '4-6岁',
    wordCount: 12,
    color: 'bg-purple-100'
  },
  {
    id: 'numbers',
    name: '数字',
    description: '1-20的数字',
    difficulty: 1,
    ageRange: '4-7岁',
    wordCount: 20,
    color: 'bg-blue-100'
  },
  {
    id: 'school',
    name: '学校用品',
    description: '学习用具单词',
    difficulty: 2,
    ageRange: '5-8岁',
    wordCount: 18,
    color: 'bg-orange-100'
  },
  {
    id: 'actions',
    name: '基础动作',
    description: '常用动词',
    difficulty: 2,
    ageRange: '5-8岁',
    wordCount: 22,
    color: 'bg-red-100'
  },
  {
    id: 'emotions',
    name: '情感表达',
    description: '情绪和感受',
    difficulty: 2,
    ageRange: '6-9岁',
    wordCount: 16,
    color: 'bg-indigo-100'
  }
];

/**
 * 预制单词数据
 */
export const PREBUILT_WORDS: PrebuiltWord[] = [
  // 基础动物
  {
    prebuiltId: 'animal-cat',
    word: 'Cat',
    translation: '猫',
    example: 'The cat is sleeping on the sofa.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20fluffy%20orange%20tabby%20cat%20with%20big%20round%20eyes%20sitting%20peacefully,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=1001&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['basic-animals'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    prebuiltId: 'animal-dog',
    word: 'Dog',
    translation: '狗',
    example: 'The dog is playing in the garden.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20happy%20golden%20retriever%20dog%20with%20tongue%20out%20and%20wagging%20tail,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=1002&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['basic-animals'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    prebuiltId: 'animal-bird',
    word: 'Bird',
    translation: '鸟',
    example: 'The bird is singing in the tree.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20colorful%20small%20bird%20with%20bright%20feathers%20perched%20on%20a%20branch,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=1003&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['basic-animals'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  // 基础食物
  {
    prebuiltId: 'food-apple',
    word: 'Apple',
    translation: '苹果',
    example: 'I eat an apple every day.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20bright%20red%20apple%20with%20a%20green%20leaf%20and%20a%20small%20shine%20spot,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=2001&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['basic-food'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    prebuiltId: 'food-banana',
    word: 'Banana',
    translation: '香蕉',
    example: 'The banana is yellow and sweet.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20bright%20yellow%20banana%20with%20a%20gentle%20curve%20and%20small%20brown%20spots,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=2002&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['basic-food'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  // 家庭成员
  {
    prebuiltId: 'family-mom',
    word: 'Mom',
    translation: '妈妈',
    example: 'My mom cooks delicious food.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20warm%20smiling%20mother%20with%20kind%20eyes%20and%20gentle%20expression,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=3001&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-7岁',
    themes: ['family'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    prebuiltId: 'family-dad',
    word: 'Dad',
    translation: '爸爸',
    example: 'Dad reads me a story every night.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20friendly%20smiling%20father%20with%20warm%20eyes%20and%20caring%20expression,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=3002&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-7岁',
    themes: ['family'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  // 颜色
  {
    prebuiltId: 'color-red',
    word: 'Red',
    translation: '红色',
    example: 'The rose is red.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20bright%20red%20circle%20or%20red%20objects%20like%20strawberry%20or%20apple,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=4001&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['colors'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    prebuiltId: 'color-blue',
    word: 'Blue',
    translation: '蓝色',
    example: 'The sky is blue.',
    imageUrl: 'https://image.pollinations.ai/prompt/A%20super%20cute%20child-friendly%20illustration%20for%20kids%20aged%204-9,%20showing%20a%20bright%20blue%20circle%20or%20blue%20objects%20like%20ocean%20or%20blueberries,%20soft%20bright%20pastel%20colors,%20simple%20cartoon%20style%20with%20round%20edges,%20clean%20white%20background,%20warm%20and%20friendly%20feeling,%20perfect%20for%20English%20vocabulary%20learning,%20no%20text%20or%20words%20in%20image?width=128&height=128&model=flux&seed=4002&nologo=true&enhance=true',
    difficulty: 1,
    ageRange: '4-6岁',
    themes: ['colors'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

/**
 * 根据主题获取预制单词
 */
export const getPrebuiltWordsByTheme = (theme: string): PrebuiltWord[] => {
  return PREBUILT_WORDS.filter(word => word.themes.includes(theme));
};

/**
 * 根据单词查找预制词库中的匹配项
 */
export const findPrebuiltWord = (word: string): PrebuiltWord | null => {
  const normalizedInput = word.toLowerCase().trim();
  return PREBUILT_WORDS.find(prebuilt => 
    prebuilt.word.toLowerCase() === normalizedInput
  ) || null;
};

/**
 * 获取所有预制单词的单词列表（用于快速查找）
 */
export const getAllPrebuiltWordsList = (): string[] => {
  return PREBUILT_WORDS.map(word => word.word.toLowerCase());
};
