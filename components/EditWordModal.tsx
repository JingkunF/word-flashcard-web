'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Word, Category } from '@/types';
import { getCategories } from '@/utils/categoryStorage';

interface EditWordModalProps {
  word: Word;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWord: Word) => void;
}

export default function EditWordModal({ word, isOpen, onClose, onSave }: EditWordModalProps) {
  const [editedWord, setEditedWord] = useState<Word>(word);
  const [customCategory, setCustomCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    setAvailableCategories(getCategories());
  }, [isOpen]);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = editedWord.categories.includes(categoryId)
      ? editedWord.categories.filter(c => c !== categoryId)
      : [...editedWord.categories, categoryId];
    
    setEditedWord({ ...editedWord, categories: newCategories });
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !editedWord.categories.includes(customCategory.trim())) {
      setEditedWord({ 
        ...editedWord, 
        categories: [...editedWord.categories, customCategory.trim()] 
      });
      setCustomCategory('');
    }
  };

  const handleSave = () => {
    // 确保至少有一个分类
    const finalCategories = editedWord.categories.length > 0 
      ? editedWord.categories 
      : ['uncategorized'];
    
    onSave({ ...editedWord, categories: finalCategories });
    onClose();
  };

  const getCategoryName = (categoryId: string) => {
    const categoryMap = {
      'uncategorized': '未归类',
      'food': '食物',
      'animals': '动物',
      'family': '家人',
      'actions': '动作',
      'school': '学校',
      'nature': '自然'
    };
    return categoryMap[categoryId as keyof typeof categoryMap] || categoryId;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑单词</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 单词信息 */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800">{word.word}</h3>
                <p className="text-gray-600">{word.translation}</p>
                {word.example && (
                  <p className="text-sm text-gray-500 italic mt-2">&ldquo;{word.example}&rdquo;</p>
                )}
              </div>
            </div>

            {/* 分类编辑 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                选择分类 <span className="text-xs text-gray-500">(可选择多个)</span>
              </h3>
              
              {/* 预设分类 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {availableCategories.filter(cat => cat.id !== 'all').map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={editedWord.categories.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>

              {/* 自定义分类 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">添加自定义分类</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="输入分类名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    disabled={!customCategory.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 自定义分类列表 */}
              {editedWord.categories.some(cat => !availableCategories.find(dc => dc.id === cat)) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">自定义分类</h4>
                  <div className="flex flex-wrap gap-2">
                    {editedWord.categories
                      .filter(cat => !availableCategories.find(dc => dc.id === cat))
                      .map(categoryId => (
                        <div key={categoryId} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          <span>{categoryId}</span>
                          <button
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-2 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 当前选中的分类 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">当前分类</h4>
              <div className="flex flex-wrap gap-2">
                {editedWord.categories.map(categoryId => (
                  <span key={categoryId} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {getCategoryName(categoryId)}
                  </span>
                ))}
                {editedWord.categories.length === 0 && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    将自动归入&ldquo;未归类&rdquo;
                  </span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
