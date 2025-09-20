// 分类管理存储函数
import { Category, INITIAL_CATEGORIES } from '../types';

const CATEGORIES_STORAGE_KEY = 'word-flashcard-categories';

export interface CategoryStorage {
  categories: Category[];
  lastUpdated: string;
}

// 生成唯一ID
const generateCategoryId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 获取所有分类
export const getCategories = (): Category[] => {
  if (typeof window === 'undefined') {
    return INITIAL_CATEGORIES;
  }

  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      const data: CategoryStorage = JSON.parse(stored);
      return data.categories.map(cat => ({
        ...cat,
        createdAt: typeof cat.createdAt === 'number' ? cat.createdAt : (cat.createdAt ? new Date(cat.createdAt).getTime() : Date.now())
      }));
    }
  } catch (error) {
    console.error('Error reading categories:', error);
  }

  // 如果没有存储数据，返回初始分类
  return INITIAL_CATEGORIES;
};

// 保存分类数据
const saveCategories = (categories: Category[]): void => {
  if (typeof window === 'undefined') return;

  try {
    const dataToSave: CategoryStorage = {
      categories,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

// 添加新分类
export const addCategory = (name: string, color: string = 'blue'): Category => {
  const categories = getCategories();
  
  // 检查是否已存在同名分类
  const existingCategory = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  if (existingCategory) {
    return existingCategory;
  }

  const newCategory: Category = {
    id: generateCategoryId(),
    name: name.trim(),
    color,
    isDefault: false,
    createdAt: Date.now(),
  };

  const updatedCategories = [...categories, newCategory];
  saveCategories(updatedCategories);
  
  return newCategory;
};

// 更新分类名称
export const updateCategoryName = (categoryId: string, newName: string): boolean => {
  const categories = getCategories();
  const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) return false;
  
  // 不允许修改系统默认分类
  if (categories[categoryIndex].isDefault) return false;
  
  // 检查新名称是否与其他分类重复
  const existingCategory = categories.find(cat => 
    cat.id !== categoryId && cat.name.toLowerCase() === newName.toLowerCase()
  );
  if (existingCategory) return false;

  categories[categoryIndex].name = newName.trim();
  saveCategories(categories);
  
  return true;
};

// 删除分类
export const deleteCategory = (categoryId: string): boolean => {
  const categories = getCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  // 不允许删除系统默认分类
  if (!category || category.isDefault) return false;
  
  const updatedCategories = categories.filter(cat => cat.id !== categoryId);
  saveCategories(updatedCategories);
  
  return true;
};

// 获取可用的颜色选项
export const getCategoryColors = (): string[] => {
  return [
    'blue', 'green', 'red', 'yellow', 'purple', 'pink', 
    'indigo', 'orange', 'teal', 'cyan', 'emerald', 'rose'
  ];
};

// 获取随机颜色
export const getRandomColor = (): string => {
  const colors = getCategoryColors();
  return colors[Math.floor(Math.random() * colors.length)];
};
