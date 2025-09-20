'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BookOpen, Sparkles, Users, Clock } from 'lucide-react';
import { PrebuiltCategory } from '../data/prebuiltWords';
import { importPrebuiltCategories, getPrebuiltStats } from '../utils/prebuiltManager';

interface InitializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedCategories: string[]) => void;
}

export default function InitializationModal({ isOpen, onClose, onComplete }: InitializationModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const stats = getPrebuiltStats();
  const allCategories = stats.categories;

  // 调试信息
  console.log('🔧 InitializationModal render:', { 
    isOpen, 
    step, 
    selectedCategories: selectedCategories.length,
    isImporting 
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    const allIds = allCategories.map(cat => cat.id);
    setSelectedCategories(allIds);
  };

  const handleStartFresh = async () => {
    console.log('🆕 开始从零开始初始化...');
    setIsImporting(true);
    
    try {
      // 清除所有现有数据
      if (typeof window !== 'undefined') {
        // 先查看当前数据
        const currentData = localStorage.getItem('vocabularyData');
        console.log('🔍 当前词库数据:', currentData ? JSON.parse(currentData) : '无数据');
        
        // 清除所有相关数据
        localStorage.removeItem('vocabularyData');
        localStorage.removeItem('categories');
        localStorage.removeItem('userInitState');
        localStorage.removeItem('imageGenerationStats');
        console.log('🧹 已清除所有现有词库数据');
        
        // 立即重新初始化为空状态
        const emptyData = { words: [] };
        const defaultCategories = [
          { id: 'uncategorized', name: '未归类', color: '#E5E7EB', isDefault: true }
        ];
        const initState = {
          hasInitialized: true,
          selectedPrebuiltCategories: [],
          initDate: Date.now()
        };
        
        localStorage.setItem('vocabularyData', JSON.stringify(emptyData));
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
        localStorage.setItem('userInitState', JSON.stringify(initState));
        
        console.log('✅ 已设置空状态:', {
          words: emptyData.words.length,
          categories: defaultCategories.length,
          initialized: true
        });
        
        // 验证数据是否正确设置
        const verifyData = JSON.parse(localStorage.getItem('vocabularyData') || '{"words":[]}');
        console.log('🔍 验证新数据:', verifyData);
      }
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📞 调用 onComplete([])');
      // 完成初始化，不导入任何预制词库
      onComplete([]);
      
    } catch (error) {
      console.error('❌ 清除数据失败:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedCategories.length === 0) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await importPrebuiltCategories(selectedCategories);
      setImportResult(result);
      setStep(3);
    } catch (error) {
      console.error('导入失败:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFinish = () => {
    onComplete(selectedCategories);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* 步骤1: 欢迎和选择模式 */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-r from-primary-pink to-accent-yellow rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl font-inter font-bold text-text-dark mb-4">
                  欢迎使用单词闪卡管理工具！
                </h1>
                <p className="text-body font-roboto text-text-dark/70">
                  为了给您更好的体验，我们提供了两种开始方式
                </p>
              </div>

              <div className="space-y-4">
                {/* 选项1: 加载预制词库 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    console.log('📚 点击加载预制词库，跳转到步骤2');
                    setStep(2);
                  }}
                  className="w-full p-6 bg-gradient-to-r from-primary-blue to-accent-yellow rounded-2xl text-left shadow-card hover:shadow-lg transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-inter font-bold text-white mb-1">
                        加载预制词库 (推荐)
                      </h3>
                      <p className="text-white/80 text-sm font-roboto">
                        选择适合的分类，快速开始学习 • 包含 {stats.totalWords} 个精选单词
                      </p>
                    </div>
                    <div className="text-white/60">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>

                {/* 选项2: 从零开始 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartFresh}
                  disabled={isImporting}
                  className="w-full p-6 bg-white border-2 border-gray-200 rounded-2xl text-left hover:border-primary-blue transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-inter font-bold text-text-dark mb-1">
                        从零开始
                      </h3>
                      <p className="text-text-dark/70 text-sm font-roboto">
                        不加载预制词库，完全自定义您的学习内容
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-text-dark/50 font-roboto">
                  💡 提示：即使选择从零开始，当您输入预制词库中的单词时，系统会自动匹配，无需重新生成
                </p>
              </div>
            </div>
          )}

          {/* 步骤2: 选择预制分类 */}
          {step === 2 && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* 头部 */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-inter font-bold text-text-dark">
                      选择预制词库
                    </h2>
                    <p className="text-sm text-text-dark/70 font-roboto mt-1">
                      选择您需要的分类开始学习 ({selectedCategories.length} 个已选择)
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* 分类列表 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-inter font-semibold text-text-dark">
                    选择词库分类
                  </h3>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary-blue hover:text-primary-blue/80 font-roboto"
                  >
                    全选
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'border-primary-blue bg-primary-blue/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-inter font-semibold text-text-dark mb-1">
                            {category.name}
                          </h4>
                          <p className="text-xs text-text-dark/70 font-roboto mb-2">
                            {category.description}
                          </p>
                          <div className="text-xs text-text-dark/60">
                            <span>{category.wordCount} 个单词</span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedCategories.includes(category.id)
                            ? 'border-primary-blue bg-primary-blue'
                            : 'border-gray-300'
                        }`}>
                          {selectedCategories.includes(category.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 底部操作 */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-2xl font-roboto font-medium hover:bg-gray-200 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleImportSelected}
                    disabled={selectedCategories.length === 0 || isImporting}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-blue to-accent-yellow text-white rounded-2xl font-roboto font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    {isImporting ? '导入中...' : `导入选中的分类`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤3: 导入结果 */}
          {step === 3 && importResult && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  importResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <Check className={`w-10 h-10 ${
                  importResult.success ? 'text-green-600' : 'text-red-600'
                }`} />
              </motion.div>

              <h2 className="text-2xl font-inter font-bold text-text-dark mb-4">
                {importResult.success ? '导入完成！' : '导入遇到问题'}
              </h2>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                <div className="space-y-2 text-sm font-roboto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">成功导入:</span>
                    <span className="font-semibold text-green-600">{importResult.importedCount} 个单词</span>
                  </div>
                  {importResult.skippedCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">已存在跳过:</span>
                      <span className="font-semibold text-yellow-600">{importResult.skippedCount} 个单词</span>
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">导入失败:</span>
                      <span className="font-semibold text-red-600">{importResult.errors.length} 个错误</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-blue to-accent-yellow text-white rounded-2xl font-roboto font-medium hover:shadow-lg transition-all"
              >
                开始使用
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
