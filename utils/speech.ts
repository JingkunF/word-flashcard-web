/**
 * 语音合成工具
 */

export const speakWord = (word: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查浏览器是否支持语音合成
    if (!window.speechSynthesis) {
      console.warn('浏览器不支持语音合成');
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    // 停止当前正在播放的语音
    window.speechSynthesis.cancel();

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(word);
    
    // 设置语音参数
    utterance.lang = 'en-US'; // 英语
    utterance.rate = 0.8; // 语速（0.1-10）
    utterance.pitch = 1; // 音调（0-2）
    utterance.volume = 0.8; // 音量（0-1）

    // 尝试使用英语语音
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex'))
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // 事件监听
    utterance.onend = () => {
      console.log('✅ 发音完成:', word);
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('❌ 发音失败:', event.error);
      reject(new Error(`发音失败: ${event.error}`));
    };

    // 开始发音
    try {
      window.speechSynthesis.speak(utterance);
      console.log('🔊 开始发音:', word);
    } catch (error) {
      console.error('❌ 发音调用失败:', error);
      reject(error);
    }
  });
};

/**
 * 检查语音合成是否可用
 */
export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * 获取可用的英语语音列表
 */
export const getEnglishVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSupported()) return [];
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith('en'));
};
