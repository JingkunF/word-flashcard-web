'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Category } from '../types';
import { addCategory, updateCategoryName, deleteCategory, getRandomColor } from '../utils/categoryStorage';

interface CategoryManagerProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onCategoriesUpdate: () => void;
}

export default function CategoryManager({ 
  categories, 
  selectedCategories, 
  onCategoryToggle, 
  onCategoriesUpdate 
}: CategoryManagerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), getRandomColor());
      setNewCategoryName('');
      setIsAddingNew(false);
      onCategoriesUpdate();
    }
  };

  const handleStartEdit = (category: Category) => {
    if (category.isDefault) return;
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      const success = updateCategoryName(editingId, editingName.trim());
      if (success) {
        setEditingId(null);
        setEditingName('');
        onCategoriesUpdate();
      } else {
        alert('分类名称已存在或无法修改');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('确定要删除这个分类吗？')) {
      const success = deleteCategory(categoryId);
      if (success) {
        onCategoriesUpdate();
      } else {
        alert('无法删除默认分类');
      }
    }
  };

  // 过滤掉 'all' 分类
  const displayCategories = (categories || []).filter(cat => cat.id !== 'all');

  return (
    <div className="space-y-4">
      {/* 分类选择 */}
      <div>
        <p className="text-tiny font-roboto text-text-dark/70 mb-3">
          选择分类 <span className="text-text-dark/50">(可选择多个)</span>
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {displayCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {editingId === category.id ? (
                // 编辑模式
                <div className="flex items-center p-3 border-2 border-accent-yellow rounded-standard bg-primary-pink">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 text-small border border-border-gray rounded-small focus:outline-none focus:border-primary-blue"
                    maxLength={10}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                  <div className="flex ml-2 space-x-1">
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-600 hover:bg-green-100 rounded-small transition-colors duration-300"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-small transition-colors duration-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                // 显示模式
                <label className="flex items-center p-3 border border-border-gray rounded-standard hover:bg-gray-50 cursor-pointer transition-all duration-300 group bg-white">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => onCategoryToggle(category.id)}
                    className="mr-3"
                  />
                  <span className="flex-1 text-small font-roboto font-medium text-text-dark">
                    {category.name}
                  </span>
                  
                  {/* 编辑/删除按钮 */}
                  {!category.isDefault && (
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleStartEdit(category);
                        }}
                        className="p-1 text-primary-blue hover:bg-primary-blue hover:text-text-white rounded-small transition-all duration-300"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteCategory(category.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-500 hover:text-text-white rounded-small transition-all duration-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </label>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 添加新分类 */}
      <div>
        <AnimatePresence>
          {isAddingNew ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入分类名称"
                  className="flex-1"
                  maxLength={10}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="btn-primary"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewCategoryName('');
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-primary-blue text-primary-blue rounded-standard hover:bg-gray-50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-roboto font-medium">新增分类</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="text-tiny font-roboto text-text-dark/50 mt-2">
        如果不选择任何分类，将默认归类到&ldquo;未归类&rdquo;
      </p>
    </div>
  );
}