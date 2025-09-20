'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { generateAIImage } from '../utils/aiImage';

interface ImageWithRetryProps {
  word: string;
  translation: string;
  initialImageUrl?: string;
  className?: string;
  onImageUpdate?: (newImageUrl: string) => void;
}

export default function ImageWithRetry({
  word,
  translation,
  initialImageUrl,
  className = "",
  onImageUpdate
}: ImageWithRetryProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 检查是否为AI图片或Blob URL
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('pollinations.ai') || url.startsWith('blob:') || url.startsWith('data:image/');
  };

  // 检查是否为待生成的AI图片标记
  const isPendingAIImage = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('AI_PENDING:');
  };

  // 生成AI图片
  const generateImage = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      console.log(`🎨 为"${word}"生成AI图片 (尝试 ${retryCount + 1})`);
      const imageResult = await generateAIImage(word);
      
      if (imageResult.success && imageResult.imageUrl) {
        console.log(`🔄 "${word}" 设置新的图片URL:`, imageResult.imageUrl.substring(0, 50) + '...');
        setImageUrl(imageResult.imageUrl);
        setHasError(false);
        setRetryCount(0);
        setIsLoading(false);
        
        // 通知父组件图片已更新
        if (onImageUpdate) {
          onImageUpdate(imageResult.imageUrl);
        }
        
        console.log(`✅ "${word}" AI图片生成成功，UI状态已更新`);
      } else {
        throw new Error(imageResult.error || 'AI图片生成失败');
      }
      
    } catch (error) {
      console.error(`❌ "${word}" AI图片生成失败:`, error);
      setHasError(true);
      
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // 自动重试机制（最多重试5次）
      if (newRetryCount < 5) {
        const delay = Math.min(1000 * Math.pow(2, newRetryCount), 10000); // 指数退避，最大10秒
        console.log(`⏳ "${word}" 将在 ${delay}ms 后自动重试... (${newRetryCount}/5)`);
        
        setTimeout(() => {
          generateImage();
        }, delay);
      } else {
        console.error(`💥 "${word}" 已达到最大重试次数 (${newRetryCount}/5)，停止重试`);
        setIsLoading(false);
      }
    }
  };

  // 手动重试
  const handleManualRetry = () => {
    setRetryCount(0);
    generateImage();
  };

  // 初始化时检查图片状态
  useEffect(() => {
    console.log(`🔍 "${word}" ImageWithRetry初始化检查:`, {
      imageUrl,
      isValidImageUrl: isValidImageUrl(imageUrl),
      urlLength: imageUrl?.length || 0,
      urlType: imageUrl && typeof imageUrl === 'string' ? (
        imageUrl.startsWith('data:image/svg+xml') ? 'SVG' :
        imageUrl.includes('pollinations.ai') ? 'AI' :
        imageUrl.startsWith('blob:') ? 'Blob' :
        imageUrl.startsWith('http') ? 'HTTP' : 'Other'
      ) : 'None'
    });
    
    // 使用 setTimeout 避免在渲染过程中直接调用 setState
    const timer = setTimeout(() => {
      if (!imageUrl) {
        console.log(`🎨 "${word}" 没有图片，开始生成...`);
        generateImage();
      } else if (isPendingAIImage(imageUrl)) {
        console.log(`🎨 "${word}" 检测到AI_PENDING标记，开始生成AI图片...`);
        generateImage();
      } else if (typeof imageUrl === 'string' && imageUrl.startsWith('ERROR:')) {
        console.log(`🔄 "${word}" 错误占位符，重新生成...`);
        generateImage();
      } else if (isValidImageUrl(imageUrl)) {
        console.log(`✅ "${word}" URL有效，测试加载...`);
        const testImage = new Image();
        testImage.onload = () => {
          console.log(`✅ "${word}" 现有图片加载成功`);
          setHasError(false);
        };
      testImage.onerror = () => {
        console.warn(`⚠️ "${word}" 现有图片加载失败，将重新生成`);
        generateImage();
      };
      testImage.src = imageUrl;
      } else {
        console.warn(`⚠️ "${word}" 图片URL无效，将重新生成:`, typeof imageUrl === 'string' ? imageUrl.substring(0, 100) : imageUrl);
        generateImage();
      }
    }, 0); // 使用 0ms 延迟，确保在下一个事件循环中执行
    
    // 清理函数
    return () => {
      clearTimeout(timer);
    };
  }, [word, imageUrl]); // 添加 imageUrl 到依赖数组

  // 渲染内容
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-blue-50 rounded-lg">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <span className="text-sm text-blue-600">生成中...</span>
          {retryCount > 0 && (
            <span className="text-xs text-blue-500 mt-1">重试 {retryCount}/5</span>
          )}
        </div>
      );
    }

    if (hasError || !imageUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50 rounded-lg border-2 border-red-200">
          <X className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-sm text-red-600 mb-2">生成失败</span>
          <button
            onClick={handleManualRetry}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            重试
          </button>
          {retryCount >= 5 && (
            <span className="text-xs text-red-400 mt-1">已达最大重试次数</span>
          )}
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={`${word} - ${translation}`}
        className="w-full h-full object-cover rounded-lg"
        onError={(e) => {
          console.warn(`⚠️ 图片加载失败: ${word}`, {
            src: imageUrl,
            errorEvent: e
          });
          
          // 如果是Blob URL，可能是暂时的加载问题，稍后重试
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
            console.log(`🔄 Blob URL加载失败，3秒后重试...`);
            setTimeout(() => {
              // 强制重新渲染
              setImageUrl(imageUrl + '?retry=' + Date.now());
            }, 3000);
          } else {
            setHasError(true);
          }
        }}
        onLoad={() => {
          console.log(`✅ "${word}" 图片加载成功:`, imageUrl?.substring(0, 50) + '...');
          setHasError(false);
        }}
      />
    );
  };

  return (
    <div className={`relative ${className}`}>
      {renderContent()}
      
      {/* 调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {isValidImageUrl(imageUrl) ? 'AI' : hasError ? 'ERR' : 'LOAD'}
        </div>
      )}
    </div>
  );
}