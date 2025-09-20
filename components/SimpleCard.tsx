'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Word, Category } from '../types';
import { updateWord } from '../utils/dataAdapter';
import ImageWithRetry from './ImageWithRetry';

interface SimpleCardProps {
  word: Word & { isMissing?: boolean };
  categories?: Category[];
  showDeleteButton?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onImageUpdate?: (word: Word, newImageUrl: string) => void;
  className?: string;
}

export default function SimpleCard({ 
  word, 
  categories = [],
  showDeleteButton = false, 
  onDelete,
  onEdit,
  onImageUpdate,
  className = ''
}: SimpleCardProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      const confirmed = window.confirm(`确定要删除【${word.word}】吗？`);
      if (confirmed) {
        onDelete();
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <motion.div 
      className={`card p-6 relative group cursor-pointer h-80 flex flex-col ${className} ${
        word.isMissing ? 'border-2 border-dashed border-orange-300 bg-orange-50' : ''
      }`}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 缺失单词标识 */}
      {word.isMissing && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full z-30">
          📚 未导入
        </div>
      )}
      {/* 操作按钮 */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        {onEdit && (
          <motion.button
            onClick={handleEditClick}
            className="w-8 h-8 bg-primary-blue text-text-white rounded-standard flex items-center justify-center shadow-card hover:shadow-card-hover transition-all duration-300"
            title="编辑单词"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
        )}
        
        {showDeleteButton && (
          <motion.button
            onClick={handleDeleteClick}
            className="w-8 h-8 bg-red-500 text-text-white rounded-standard flex items-center justify-center shadow-card hover:shadow-card-hover transition-all duration-300"
            title="删除单词"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
      
      {/* 图片区域 - 使用智能重试组件 */}
      <div className="flex justify-center mb-4 flex-shrink-0">
        <motion.div 
          className="w-24 h-24 rounded-standard overflow-hidden shadow-card"
          whileHover={{ scale: 1.05 }}
        >
          <ImageWithRetry
            word={word.word}
            translation={word.translation}
            initialImageUrl={word.imageUrl}
            className="w-full h-full"
            onImageUpdate={async (newImageUrl) => {
              console.log(`📸 "${word.word}" 图片已更新:`, newImageUrl);
              
              // 立即更新UI，即使数据库保存失败
              const updatedWord = { ...word, imageUrl: newImageUrl, updatedAt: Date.now() };
              if (onImageUpdate) {
                onImageUpdate(updatedWord, newImageUrl);
              }
              
              try {
                // 异步保存到数据库（不阻塞UI更新）
                await updateWord(updatedWord);
                console.log(`✅ "${word.word}" 图片URL已保存到数据库`);
              } catch (error) {
                console.warn(`⚠️ 保存"${word.word}"图片URL失败（UI已更新）:`, error);
                // 不阻塞UI，继续显示图片
              }
            }}
          />
        </motion.div>
      </div>
      
      {/* 内容区域 - 弹性布局 */}
      <div className="text-center flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <h3 className="text-small-title font-inter text-text-dark font-bold">
            {word.word}
          </h3>
          
          <p className="text-body font-roboto text-text-dark font-medium">
            {word.translation}
          </p>
        </div>

        {/* 例句区域 - 暂时隐藏 */}
        <div className="px-2 flex-1 flex items-center justify-center min-h-[60px]">
          {false && word.example && (
            <p className="text-small font-roboto text-text-dark/70 italic leading-tight line-clamp-3 text-center">
              &ldquo;{word.example}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* 分类标签 - 固定在底部 */}
      <div className="flex flex-wrap gap-2 justify-center mt-auto flex-shrink-0">
        {(word.categories || ['uncategorized']).map((categoryId, index) => {
          const category = categories.find(c => c.id === categoryId);
          const categoryName = category?.name || {
            'uncategorized': '未归类', 
            'food': '食物', 
            'animals': '动物', 
            'family': '家人', 
            'actions': '动作', 
            'school': '学校', 
            'nature': '自然'
          }[categoryId] || categoryId;
          
          return (
            <motion.span
              key={categoryId}
              className="category-tag"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1
              }}
            >
              {categoryName}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}