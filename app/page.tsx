'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import { checkWordExists, normalizeWord } from '@/utils/storage';
import { addWord, getAllWords, batchUpdateTranslations } from '@/utils/dataAdapter';
import { generateWordImage } from '@/utils/aiImage';
import { generateWordImageSmart } from '@/utils/sharedImagePool';
import { Category, PRESET_WORDS, Word } from '@/types';
import { getCategories } from '@/utils/categoryStorage';
import { clearAllStorage } from '@/utils/clearStorage';
import { checkSpelling, getBestSuggestion } from '@/utils/spellCheck';
import { getUserInitState, tryMatchPrebuiltWord } from '@/utils/prebuiltManager';
import { getWordExample, getWordTranslation } from '@/utils/exampleGenerator';
import { ThemeWordbankManager } from '@/utils/themeWordbankManager';
import CategoryManager from '@/components/CategoryManager';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  console.log('🏠 HomePage 组件已加载');
  
  const [word, setWord] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['uncategorized']);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [spellSuggestion, setSpellSuggestion] = useState<string | null>(null);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // 主题词库相关状态
  const [showWordbankModal, setShowWordbankModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importingWordbankId, setImportingWordbankId] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, word: '' });
  const [wordbankManager] = useState(() => ThemeWordbankManager.getInstance());

  // 调试信息
  console.log('🎯 当前 showWordbankModal 状态:', showWordbankModal);
  console.log('🎯 wordbankManager 可用词库:', wordbankManager.getAllWordbanks().length);
  

  // 加载可用分类
  useEffect(() => {
    setAvailableCategories(getCategories());
  }, []);

  // 检查用户是否需要初始化
  useEffect(() => {
    const initState = getUserInitState();
    if (!initState.hasInitialized) {
      setShowInitModal(true);
    }
  }, []);

  const loadCategories = () => {
    setAvailableCategories(getCategories());
  };

  const handleInitializationComplete = (selectedCategories: string[]) => {
    console.log('🎯 初始化完成，选择的分类:', selectedCategories);
    setSelectedCategories(selectedCategories);
    setShowInitModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim()) {
      console.log('❌ 单词为空');
      setError('请输入单词');
      return;
    }

    const normalizedWord = normalizeWord(word.trim());
    setIsGenerating(true);
    setError('');
    setShowSpellCheck(false);
    setSpellSuggestion(null);

    try {
      // 首先检查是否已存在（包括预制词库）
      let existingWords: Word[] = [];
      try {
        existingWords = await getAllWords();
      } catch (getAllWordsError) {
        console.error('❌ getAllWords() 调用失败:', getAllWordsError);
        setError('获取单词列表失败，请刷新页面重试');
        setIsGenerating(false);
        return;
      }
      const existingWord = existingWords.find(w => 
        normalizeWord(w.word) === normalizedWord
      );

      if (existingWord) {
        setError(`单词 "${normalizedWord}" 已存在于词库中`);
        setIsGenerating(false);
        return;
      }

      // 拼写检查
      const isCorrect = checkSpelling(normalizedWord);
      if (!isCorrect) {
        const suggestion = getBestSuggestion(normalizedWord);
        if (suggestion && suggestion !== normalizedWord) {
          setSpellSuggestion(suggestion);
          setShowSpellCheck(true);
          setIsGenerating(false);
          return;
        }
      }

      // 使用智能图片生成器（优先共享池，节省AI算力）
      console.log(`🚀 开始为"${normalizedWord}"生成闪卡（智能模式）...`);
      console.log('📋 当前环境:', typeof window !== 'undefined' ? 'Browser' : 'Server');
      console.log('🔧 generateWordImageSmart 函数类型:', typeof generateWordImageSmart);
      
      const imageResult = await generateWordImageSmart(normalizedWord);
      console.log('📊 AI图片生成结果:', imageResult);
      
      let imageUrl: string;
      let imageStatus: string;
      
      if (imageResult.success && imageResult.imageUrl) {
        imageUrl = imageResult.imageUrl;
        imageStatus = 'success';
        
        // 显示图片来源信息和存储状态
        if (imageResult.source === 'shared') {
          console.log(`✅ "${normalizedWord}" 从共享池获取图片，节省AI算力`);
          console.log(`📊 图片存储类型: 共享池 (可被其他用户复用)`);
        } else if (imageResult.source === 'ai') {
          console.log(`✅ "${normalizedWord}" AI图片生成成功并添加到共享池`);
          console.log(`📊 图片存储类型: Base64永久存储 (可被其他用户复用)`);
        } else {
          console.log(`✅ "${normalizedWord}" 图片生成成功`);
        }
        
        // 检查图片存储格式
        if (imageResult.imageUrl) {
          if (imageResult.imageUrl.startsWith('data:image/')) {
            console.log(`💾 存储格式: Base64永久存储 ✅`);
            console.log(`🔄 多用户复用: 支持 ✅`);
          } else if (imageResult.imageUrl.startsWith('blob:')) {
            console.log(`⚠️ 存储格式: Blob临时存储 (会话结束后丢失)`);
          } else {
            console.log(`📝 存储格式: ${imageResult.imageUrl.substring(0, 50)}...`);
          }
        }
      } else {
        // AI生成失败，设置错误占位符用于重试
        imageUrl = `ERROR:${normalizedWord}:${Date.now()}`;
        imageStatus = 'error';
        console.warn(`⚠️ "${normalizedWord}" 图片生成失败，将显示错误图标并支持重试`);
      }

      // 创建Word对象（和主题词库导入完全相同的格式）
      const word: Word = {
        id: `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        word: normalizedWord,
        translation: getWordTranslation(normalizedWord),
        example: getWordExample(normalizedWord) || `This is an example sentence with the word "${normalizedWord}".`,
        imageUrl: imageUrl,
        categories: selectedCategories,
        reviewCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 保存单词到数据库（和主题词库导入使用相同的函数）
      console.log('💾 开始保存单词到数据库...', word);
      try {
        await addWord(word);
        console.log('✅ 单词保存成功:', normalizedWord);
        
        // 显示成功消息
        if (imageStatus === 'success') {
          setSuccessMessage(`✅ 单词 "${normalizedWord}" 添加成功！AI图片生成完成。`);
        } else {
          setSuccessMessage(`⚠️ 单词 "${normalizedWord}" 添加成功！图片生成失败，将自动重试。`);
        }
        
      } catch (saveError) {
        console.error('❌ 单词保存失败:', saveError);
        setError(`保存单词失败: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
        setIsGenerating(false);
        return;
      }
      
      setShowSuccess(true);
      setWord('');
      
      // 3秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('❌ 添加单词失败:', error);
      setError('添加单词失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpellSuggestion = (accepted: boolean) => {
    if (accepted && spellSuggestion) {
      setWord(spellSuggestion);
      setShowSpellCheck(false);
      setSpellSuggestion(null);
    } else {
      setShowSpellCheck(false);
      setSpellSuggestion(null);
    }
  };

  // 词库导入功能
  const handleImportWordbank = async (wordbankId: string) => {
    console.log('🎯 开始导入词库:', wordbankId);
    setIsImporting(true);
    setImportingWordbankId(wordbankId);
    setImportProgress({ current: 0, total: 0, word: '' });
    
    try {
      console.log('🎯 调用词库管理器导入函数 - 逐个处理');
      const result = await wordbankManager.importWordbank(
        wordbankId,
        (current, total, word) => {
          setImportProgress({ current, total, word });
        }
      );
      
      if (result.success) {
        setSuccessMessage(`成功导入 ${result.importedCount} 个单词！`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(`导入失败: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setError(`导入过程中发生错误: ${error}`);
    } finally {
      setIsImporting(false);
      setImportingWordbankId(null);
      setShowWordbankModal(false);
    }
  };

  // 批量更新翻译功能
  const handleBatchUpdateTranslations = async () => {
    console.log('🔄 开始批量更新翻译...');
    setIsImporting(true);
    setError('');
    
    try {
      const result = await batchUpdateTranslations();
      setSuccessMessage(`成功更新 ${result.updatedCount} 个单词的翻译！`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      if (result.errors.length > 0) {
        console.warn('部分单词更新失败:', result.errors);
      }
    } catch (error) {
      setError(`批量更新翻译失败: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container">

        {/* 内容卡片 */}
        <div className="content-card">
          <h1>单词仓库</h1>
          <p>添加新单词，生成专属闪卡</p>
          
          {/* 主题词库选择按钮 */}
          <button
            type="button"
            onClick={() => {
              console.log('🎯 导入主题词库按钮被点击');
              console.log('🎯 showWordbankModal 当前状态:', showWordbankModal);
              setShowWordbankModal(true);
              console.log('🎯 设置 showWordbankModal 为 true');
              // 强制重新渲染
              setTimeout(() => {
                console.log('🎯 1秒后 showWordbankModal 状态:', showWordbankModal);
              }, 1000);
            }}
            className="import-button"
          >
            <img src="https://img.icons8.com/material-outlined/24/FFFFFF/book.png" alt="book icon" className="button-icon" />
            导入主题词库
          </button>

          {/* 输入表单 */}
          <form onSubmit={handleSubmit}>
            <div className="input-section">
              <label htmlFor="word">输入新单词</label>
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  // 清除错误信息
                  if (error) setError('');
                }}
                placeholder="例如: apple, happy, run..."
                className="w-full"
              />
            </div>

            {/* 分类选择 */}
            <div className="category-section">
              <label>选择分类</label>
              <p className="subtitle">(可选择多个)</p>
              <div className="checkbox-group">
                {availableCategories.map((category) => (
                  <label key={category.id} className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                    />
                    <span className="checkmark"></span>
                    {category.name}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="add-category-button"
                >
                  + 新增分类
                </button>
              </div>
              <p className="hint-text">如果不选择任何分类，将默认归类到&ldquo;未归类&rdquo;</p>
            </div>

            {/* 错误显示 */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-standard">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-small font-roboto text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <button
              type="submit"
              disabled={isGenerating || !word.trim()}
              className="save-button"
            >
              {isGenerating ? '生成中...' : '+ 保存并生成闪卡'}
            </button>
          </form>
        </div>
      </div>




        {/* 图片刷新提示 */}
        <div className="card p-4 mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="text-blue-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-small font-roboto font-medium text-blue-800">
                图片显示问题？
              </p>
              <p className="text-tiny font-roboto text-blue-700 mt-1">
                如果图片显示有问题，点击此按钮
              </p>
            </div>
          </div>
        </div>

      {/* 成功提示Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-standard shadow-lg flex items-center max-w-sm">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主题词库选择模态框 */}
      <AnimatePresence>
        {showWordbankModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-standard p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-inter font-bold">选择主题词库</h2>
                <button
                  onClick={() => setShowWordbankModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isImporting}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {wordbankManager.getAllWordbanks().map((wordbank) => (
                  <motion.div
                    key={wordbank.id}
                    className="border border-gray-200 rounded-standard p-4 hover:border-primary-blue transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-inter font-semibold text-text-dark mb-2">
                          {wordbank.name}
                        </h3>
                        <p className="text-small text-text-gray mb-3">
                          {wordbank.description}
                        </p>
                        <div className="flex items-center space-x-4 text-tiny text-text-gray">
                          <span>📚 {wordbank.totalWords} 个单词</span>
                          <span>📁 {wordbank.categories.length} 个分类</span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleImportWordbank(wordbank.id)}
                        disabled={isImporting}
                        className="btn-primary px-4 py-2 text-small ml-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {importingWordbankId === wordbank.id ? '导入中...' : '导入'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 导入进度模态框 */}
      <AnimatePresence>
        {isImporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-standard p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-blue mx-auto" />
                </div>
                <h3 className="text-lg font-inter font-semibold mb-2">正在导入词库</h3>
                <p className="text-small text-text-gray mb-4">
                  正在处理: <span className="font-medium text-primary-blue">{importProgress.word}</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary-blue h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-tiny text-text-gray">
                  {importProgress.current} / {importProgress.total}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 初始化模态框 */}
      {showInitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-standard p-6 max-w-md w-full">
            <h2 className="text-lg font-inter font-bold mb-4">欢迎使用单词闪卡</h2>
            <p className="text-body text-text-dark mb-6">
              请选择您希望如何开始：
            </p>
            <div className="space-y-3">
              <motion.button
                onClick={() => handleInitializationComplete(['uncategorized'])}
                className="btn-primary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🚀 从零开始
              </motion.button>
              <motion.button
                onClick={() => handleInitializationComplete(['animals', 'colors', 'food', 'family'])}
                className="btn-secondary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                📚 使用预制词库
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}