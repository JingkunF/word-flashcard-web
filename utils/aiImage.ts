// AI图片生成工具函数 - 使用Pollinations.ai API
import { generateSimpleSVG } from './simpleSvg';
import { 
  IMAGE_GENERATION_CONFIG, 
  validateImageUrl, 
  buildOptimizedImageUrl,
  ImageGenerationStats 
} from './imageConfig';
// 移除旧的persistentImageStorage导入，使用新的cloudReadyStorage
import { cloudStorage } from './cloudReadyStorage';

export interface AIImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  prompt?: string;
}

/**
 * 为单词生成一致的种子值，确保同一个单词总是生成相同的图片
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 统一的图片风格配置
 */
const IMAGE_STYLE_CONFIG = {
  // 完整的提示词模板 - 确保API能正常工作
  promptTemplate: "[WORD_DESCRIPTION], cute cartoon style, bright colors, simple illustration, child-friendly, educational",
  
  // 单词描述映射，确保更准确的图片生成
  wordDescriptions: {
    // 动物类
    'cat': 'orange cat',
    'dog': 'golden dog',
    'rabbit': 'white rabbit',
    'bird': 'blue bird',
    'elephant': 'gray elephant',
    'lion': 'friendly lion',
    'bear': 'teddy bear',
    'tiger': 'a orange tiger',
    'monkey': 'a brown monkey',
    'duck': 'a yellow duck',
    'horse': 'a brown horse',
    'cow': 'a black and white cow',
    'pig': 'a pink pig',
    'sheep': 'a white sheep',
    'chicken': 'a white chicken',
    
    // 食物类
    'apple': 'a red apple',
    'banana': 'a yellow banana',
    'orange': 'an orange fruit',
    'grape': 'purple grapes',
    'cake': 'a birthday cake',
    'bread': 'a slice of bread',
    'milk': 'a glass of milk',
    'egg': 'a white egg',
    'fish': 'a colorful fish',
    'rice': 'a bowl of rice',
    'juice': 'a glass of orange juice',
    'cookie': 'a chocolate chip cookie',
    'candy': 'a colorful candy',
    'ice cream': 'an ice cream cone',
    
    // 家庭类
    'mom': 'a kind mother',
    'dad': 'a friendly father',
    'sister': 'a young girl',
    'brother': 'a young boy',
    'grandma': 'a kind grandmother',
    'grandpa': 'a friendly grandfather',
    
    // 学校类
    'teacher': 'a friendly teacher',
    'pen': 'a blue pen',
    'pencil': 'a yellow pencil',
    'bag': 'a school backpack',
    'desk': 'a wooden desk',
    'chair': 'a small chair',
    'student': 'a happy student',
    
    // 自然类
    'sun': 'a bright yellow sun',
    'moon': 'a crescent moon',
    'star': 'a golden star',
    'grass': 'green grass',
    'sky': 'a blue sky with clouds',
    'cloud': 'a white fluffy cloud',
    'rain': 'gentle raindrops',
    'snow': 'white snowflakes',
    
    // 颜色类
    'red': 'a red heart',
    'blue': 'a blue circle',
    'green': 'a green leaf',
    'yellow': 'a yellow star',
    'white': 'a white cloud',
    'black': 'a black circle',
    
    // 动作类（抽象概念用相关物品表示）
    'read': 'a child reading a book',
    'draw': 'a child drawing with crayons',
    'write': 'a child writing',
    
    // 情感类 - 扩展版
    'happy': 'a cheerful child with a big smile and sparkling eyes',
    'sad': 'a gentle child with a slightly sad expression and a small tear',
    'angry': 'a child with puffed cheeks and crossed arms, mildly upset',
    'mad': 'a child with puffed cheeks and crossed arms, mildly upset',
    'tired': 'a sleepy child yawning with droopy eyes',
    'excited': 'a child jumping with joy and raised arms',
    'scared': 'a child hiding behind a teddy bear',
    'shy': 'a child peeking from behind a tree',
    'proud': 'a child standing tall with a medal',
    'surprised': 'a child with wide eyes and open mouth',
    'confused': 'a child scratching their head with a question mark',
    'worried': 'a child with a concerned expression',
    'jealous': 'a child looking longingly at a toy',
    'grateful': 'a child holding hands to heart',
    'lonely': 'a child sitting alone under a tree',
    'friendly': 'two children holding hands and smiling',
    
    // 形容词类 - 大幅扩展
    'big': 'a giant friendly elephant next to a tiny mouse',
    'small': 'a tiny cute mouse next to a huge elephant',
    'large': 'a large colorful balloon',
    'little': 'a little bird on a branch',
    'huge': 'a huge friendly whale',
    'tiny': 'a tiny ladybug on a leaf',
    'new': 'a shiny new red bicycle with a bow',
    'old': 'a well-loved vintage teddy bear',
    'young': 'a young sapling tree with new leaves',
    'fresh': 'fresh colorful flowers in bloom',
    'dirty': 'a muddy but happy puppy',
    'neat': 'a perfectly organized toy box',
    'messy': 'a playful child with paint on hands',
    'fast': 'a speedy red race car with motion lines',
    'slow': 'a slow friendly turtle walking peacefully',
    'quick': 'a quick rabbit hopping energetically',
    'loud': 'a child shouting with hands cupped around mouth',
    'quiet': 'a child reading peacefully in a library',
    'soft': 'a fluffy white bunny',
    'solid': 'a solid rock',
    'smooth': 'a smooth river stone',
    'hot': 'a bright warm sun with rays',
    'cold': 'a cheerful snowman with scarf',
    'warm': 'a cozy fireplace with gentle flames',
    'cool': 'a refreshing ice cream cone',
    'wet': 'a happy child playing in rain',
    'bright': 'a bright yellow balloon floating up',
    'dark': 'a peaceful night sky with stars',
    'brilliant': 'a brilliant shining star',
    'dim': 'a gentle candle flame',
    'high': 'a tall giraffe reaching tree leaves',
    'low': 'a short mushroom on the ground',
    'long': 'a long colorful train',
    'short': 'a short cute penguin',
    'wide': 'a wide river with a bridge',
    'narrow': 'a narrow path through flowers',
    'thick': 'a thick tree trunk',
    'thin': 'a thin pencil',
    'heavy': 'a child carrying a heavy backpack',
    'light': 'a feather floating in the air',
    'strong': 'a child flexing muscles proudly',
    'weak': 'a wilted flower getting water',
    'healthy': 'a child eating colorful fruits',
    'sick': 'a child resting in bed with teddy bear',
    'full': 'a full glass of colorful juice',
    'empty': 'an empty bowl waiting to be filled',
    'open': 'an open book with colorful pictures',
    'closed': 'a closed treasure chest',
    'safe': 'a child wearing a helmet on bicycle',
    'dangerous': 'a warning sign with friendly cartoon',
    'easy': 'a child solving a simple puzzle happily',
    'hard': 'a child thinking about difficult math',
    'simple': 'a simple drawing of a house',
    'difficult': 'a complex jigsaw puzzle',
    'wrong': 'a child with an X mark, learning from mistake',
    'correct': 'a green checkmark with smiling face',
    'true': 'a child telling truth with honest expression',
    'false': 'a child shaking head saying no',
    'real': 'a real butterfly on a flower',
    'fake': 'a toy plastic flower',
    'good': 'a child giving thumbs up with smile',
    'bad': 'a child giving thumbs down gently',
    'better': 'a child improving at drawing',
    'best': 'a child holding a gold star trophy',
    'worse': 'a sad wilted plant',
    'worst': 'a broken toy being fixed',
    'nice': 'a kind child sharing toys with friend',
    'mean': 'a child learning to be kinder',
    'kind': 'a child helping another child',
    'cruel': 'a child learning about kindness',
    'gentle': 'a child petting a soft kitten',
    'polite': 'a child saying please and thank you',
    'rude': 'a child learning good manners',
    'patient': 'a child waiting calmly in line',
    'impatient': 'a child learning to wait',
    'careful': 'a child handling a delicate butterfly',
    'careless': 'a child learning to be more careful',
    'helpful': 'a child helping carry groceries',
    'lazy': 'a child learning to be more active',
    'busy': 'a child doing many fun activities',
    'free': 'a child playing freely in a park',
    'rich': 'a treasure chest full of colorful gems',
    'poor': 'a simple but happy home',
    'expensive': 'a shiny diamond ring',
    'cheap': 'a simple but lovely flower',
    'beautiful': 'a gorgeous rainbow over flowers',
    'ugly': 'a friendly monster learning self-love',
    'pretty': 'a beautiful butterfly with colorful wings',
    'handsome': 'a well-dressed young boy',
    'cute': 'an adorable kitten with big eyes',
    'funny': 'a child laughing at a joke',
    'serious': 'a child concentrating on homework',
    'silly': 'a child making funny faces',
    'smart': 'a child reading with lightbulb above head',
    'stupid': 'a child learning from mistakes',
    'clever': 'a child solving a puzzle cleverly',
    'wise': 'an owl wearing graduation cap',
    'foolish': 'a child learning from silly mistake',
    
    // 数字类
    'one': 'the number 1 with one apple',
    'two': 'the number 2 with two cats',
    'three': 'the number 3 with three birds',
    'four': 'the number 4 with four flowers',
    'five': 'the number 5 with five stars',
    
    // 玩具类
    'ball': 'a colorful bouncing ball',
    'doll': 'a cute doll',
    
    // 学习和概念类
    'maze': 'a simple colorful maze puzzle',
    'history': 'an old book with historical pictures',
    'hello': 'a child waving hello cheerfully',
    'chocolate': 'a delicious chocolate bar',
    'goose': 'a white goose',
    'phone': 'a colorful toy phone',
    'tank': 'a green toy tank',
    'piano': 'a black and white piano',
    
    // 时间概念类
    'morning': 'a bright sunrise with a rooster',
    'afternoon': 'a sunny sky with children playing',
    'evening': 'a beautiful sunset with warm colors',
    'night': 'a peaceful night sky with moon and stars',
    'today': 'a calendar with today highlighted',
    'yesterday': 'a calendar showing yesterday',
    'tomorrow': 'a calendar showing tomorrow with excitement',
    'early': 'a child waking up with the sunrise',
    'late': 'a child rushing with a clock',
    'now': 'a child pointing to current time',
    'then': 'a child looking at old photos',
    'always': 'a child hugging a teddy bear lovingly',
    'never': 'a child shaking head with X mark',
    'sometimes': 'a child playing on sunny and rainy days',
    'often': 'a child repeatedly doing favorite activity',
    'soon': 'a child waiting excitedly for something',
    
    // 地点和方向类
    'here': 'a child pointing to current location',
    'there': 'a child pointing to distant location',
    'everywhere': 'children playing all around a playground',
    'nowhere': 'an empty space with question mark',
    'somewhere': 'a child exploring with a map',
    'inside': 'a child playing inside a cozy house',
    'outside': 'a child playing in a sunny garden',
    'up': 'a child pointing upward to the sky',
    'down': 'a child pointing downward to the ground',
    'left': 'a child pointing to the left with arrow',
    'front': 'a child standing in front of a mirror',
    'back': 'a child looking backward over shoulder',
    'near': 'a child standing close to a tree',
    'far': 'a child looking at distant mountains',
    'close': 'two children standing close together',
    'away': 'a child waving goodbye from distance',
    'above': 'a bird flying above a child',
    'below': 'a fish swimming below a bridge',
    'beside': 'a child sitting beside a friendly dog',
    'between': 'a child standing between two trees',
    'around': 'children playing in a circle',
    'through': 'a child walking through a tunnel',
    'across': 'a child crossing a small bridge',
    'over': 'a child jumping over a small stream',
    'under': 'a child sitting under a shady tree',
    
    // 抽象概念类
    'love': 'a child hugging a heart-shaped pillow',
    'hate': 'a child learning about kindness',
    'like': 'a child smiling at favorite ice cream',
    'dislike': 'a child politely saying no thank you',
    'want': 'a child reaching for a desired toy',
    'need': 'a child drinking water when thirsty',
    'hope': 'a child looking at a shooting star',
    'wish': 'a child blowing out birthday candles',
    'dream': 'a child sleeping with dream bubbles',
    'think': 'a child with a lightbulb thought bubble',
    'know': 'a child raising hand with confidence',
    'understand': 'a child with aha moment expression',
    'remember': 'a child looking at photo memories',
    'forget': 'a child with confused expression',
    'learn': 'a child studying with books and smile',
    'teach': 'a child showing something to friend',
    'help': 'children helping each other',
    'share': 'children sharing toys happily',
    'give': 'a child giving a gift to friend',
    'take': 'a child receiving a gift gratefully',
    'keep': 'a child hugging a treasure box',
    'find': 'a child discovering a hidden treasure',
    'win': 'a child celebrating with trophy',
    'try': 'a child attempting to ride bicycle',
    'succeed': 'a child achieving goal with joy',
    'fail': 'a child learning from mistakes',
    'begin': 'a child starting to read first page',
    'start': 'a child beginning a new drawing',
    'finish': 'a child completing a puzzle',
    'end': 'a child closing a finished book',
    'continue': 'a child persistently building blocks',
    'stop': 'a child pausing at stop sign',
    'wait': 'a child patiently waiting in line',
    'hurry': 'a child running with excitement',
    'go': 'a child walking forward on path',
    'come': 'a child approaching with open arms',
    'arrive': 'a child reaching destination happily',
    'leave': 'a child waving goodbye',
    'return': 'a child coming back home',
    'visit': 'a child visiting grandparents',
    'travel': 'a child with suitcase and map',
    'move': 'a child dancing or relocating',
    
    // 感官和身体类
    'see': 'a child looking through telescope',
    'look': 'a child observing a butterfly',
    'watch': 'a child watching a movie',
    'hear': 'a child listening to music',
    'smell': 'a child sniffing a flower',
    'taste': 'a child tasting delicious food',
    'touch': 'a child gently touching soft fur',
    'feel': 'a child expressing emotions',
    'hurt': 'a child with bandage getting better',
    'heal': 'a child recovering with care',
    'grow': 'a child measuring height on wall',
    'change': 'a caterpillar becoming butterfly',
    'become': 'a seed growing into flower',
    'turn': 'a child spinning in circle',
    'break': 'a child accidentally breaking toy',
    'fix': 'a child repairing broken toy',
    'build': 'a child constructing with blocks',
    'make': 'a child creating art project',
    'create': 'a child inventing new game',
    'destroy': 'a child learning about consequences',
    'wash': 'a child washing hands',
    'cook': 'a child helping in kitchen',
    'wake': 'a child stretching after good sleep',
    'rest': 'a child relaxing under tree',
    'work': 'a child doing homework diligently',
    'laugh': 'a child giggling with joy',
    'cry': 'a child with tears getting comfort',
    'smile': 'a child with bright happy smile',
    'frown': 'a child with sad expression',
    'talk': 'children having conversation',
    'speak': 'a child speaking into microphone',
    'say': 'a child with speech bubble',
    'tell': 'a child sharing a story',
    'ask': 'a child raising hand with question',
    'call': 'a child calling friend on phone',
    'shout': 'a child calling across playground',
    'whisper': 'a child whispering secret',
    'stand': 'a child standing tall and proud',
    'fall': 'a child safely falling into pile of leaves',
    'rise': 'a child getting up from bed',
    'climb': 'a child climbing playground equipment',
    'swim': 'a child swimming with floaties',
    'fly': 'a child pretending to be airplane',
    'drive': 'a child pretending to drive toy car',
    'ride': 'a child riding bicycle safely',
    'carry': 'a child carrying school books',
    'hold': 'a child holding favorite stuffed animal',
    'catch': 'a child catching colorful ball',
    'throw': 'a child throwing ball to friend',
    'push': 'a child pushing toy wagon',
    'pull': 'a child pulling red wagon',
    'lift': 'a child lifting lightweight object',
    'drop': 'a child accidentally dropping toy',
    'pick': 'a child picking flowers in garden',
    'put': 'a child putting toys in box',
    'place': 'a child carefully placing puzzle piece',
    'hide': 'a child playing hide and seek',
    'show': 'a child showing drawing proudly',
    'point': 'a child pointing to interesting object',
    'wave': 'a child waving hello cheerfully',
    'clap': 'a child clapping hands happily',
    'hug': 'a child giving warm hug',
    'kiss': 'a child giving gentle kiss',
    'shake': 'a child shaking hands politely',
    'nod': 'a child nodding head in agreement',
    
    // 其他常用词
    'house': 'a cozy colorful house with garden',
    'home': 'a warm welcoming house with family',
    'car': 'a bright red toy car',
    'rocket': 'a colorful rocket ship in space',
    'cheese': 'a piece of yellow cheese with holes',
    'money': 'colorful play money and piggy bank',
    'time': 'a friendly clock showing different times',
    'space': 'a child astronaut floating in colorful space',
    'world': 'a child holding colorful globe',
    'life': 'a child surrounded by nature and animals',
    'death': 'a peaceful sleeping flower',
    'birth': 'a baby bird hatching from egg',
    'family': 'a happy family holding hands',
    'friend': 'two children playing together',
    'enemy': 'children learning to resolve conflicts',
    'stranger': 'a child learning about meeting new people',
    'person': 'a friendly child waving hello',
    'people': 'diverse children playing together',
    'child': 'a happy child playing',
    'adult': 'a kind grown-up helping child',
    'boy': 'a cheerful young boy',
    'girl': 'a happy young girl',
    'man': 'a friendly father figure',
    'woman': 'a kind mother figure',
    'food': 'colorful healthy foods on plate',
    'air': 'a child blowing bubbles in fresh air',
    'fire': 'a safe campfire with marshmallows',
    'earth': 'a beautiful planet Earth',
    'nature': 'a child exploring forest',
    'animal': 'various cute animals together',
    'plant': 'a child watering growing plant',
    'weather': 'different weather symbols with child',
    'season': 'child experiencing four seasons',
    'color': 'a rainbow with all colors',
    'sound': 'a child listening to musical sounds',
    'music': 'a child playing simple instruments',
    'art': 'a child creating colorful artwork',
    'story': 'a child telling story with pictures',
    'gift': 'a beautifully wrapped present',
    'surprise': 'a child opening surprise box',
    'party': 'children celebrating with balloons',
    'birthday': 'a child blowing birthday candles',
    'holiday': 'children celebrating festive day',
    'class': 'children learning in classroom',
    'lesson': 'a child learning with teacher',
    'homework': 'a child doing homework happily',
    'grade': 'a child receiving good grade',
    'prize': 'a child holding winning trophy',
    'reward': 'a child receiving gold star',
    'punishment': 'a child learning from consequences',
    'rule': 'children following playground rules',
    'law': 'a child learning about safety rules',
    'order': 'children organizing toys neatly',
    'chaos': 'children learning to organize',
    'peace': 'children playing harmoniously',
    'war': 'children resolving conflicts peacefully',
    'fight': 'children learning to share',
    'argue': 'children discussing different opinions',
    'agree': 'children nodding in agreement',
    'disagree': 'children respectfully disagreeing',
    'opinion': 'a child expressing thoughts',
    'idea': 'a child with lightbulb moment',
    'plan': 'a child drawing plan on paper',
    'goal': 'a child aiming at target',
    'purpose': 'a child with determined expression',
    'reason': 'a child explaining with gestures',
    'cause': 'a child understanding cause and effect',
    'effect': 'a child seeing result of action',
    'problem': 'a child facing puzzle challenge',
    'solution': 'a child solving problem happily',
    'question': 'a child raising hand curiously',
    'mystery': 'a child with magnifying glass',
    'secret': 'a child whispering secret',
    'truth': 'a child speaking honestly',
    'fact': 'a child reading factual book',
    'fiction': 'a child reading fantasy story',
    'reality': 'a child experiencing real world',
    'imagination': 'a child dreaming colorful dreams',
    'magic': 'a child with magic wand and stars',
    'miracle': 'a child amazed by butterfly',
    'luck': 'a child finding four-leaf clover',
    'chance': 'a child spinning colorful wheel',
    'choice': 'a child choosing between options',
    'decision': 'a child making thoughtful choice',
    'mistake': 'a child learning from error',
    'accident': 'a child with minor mishap',
    'danger': 'a child learning safety',
    'safety': 'a child wearing protective gear',
    'risk': 'a child learning about careful choices',
    'adventure': 'a child exploring with backpack',
    'journey': 'a child walking on winding path',
    'trip': 'a child with suitcase ready to travel',
    'vacation': 'a child relaxing on beach',
    'fun': 'children laughing and playing',
    'boring': 'a child finding new interest',
    'interesting': 'a child fascinated by discovery',
    'exciting': 'a child jumping with thrill',
    'scary': 'a child being brave with teddy bear',
    'crazy': 'a child being playfully silly',
    'normal': 'a child in everyday routine',
    'special': 'a child feeling unique and valued',
    'different': 'children celebrating diversity',
    'same': 'children finding similarities',
    'similar': 'children with similar interests',
    'equal': 'children sharing equally',
    'just': 'a child standing up for what is right',
    'unjust': 'a child learning about justice',
    'dishonest': 'a child learning about honesty',
    'loyal': 'a child being faithful friend',
    'coward': 'a child learning to be brave',
    'hero': 'a child helping others',
    'villain': 'a character learning to be good',
    'leader': 'a child leading group activity',
    'follower': 'a child learning from others',
    'winner': 'a child celebrating achievement',
    'loser': 'a child learning from loss',
    'champion': 'a child holding trophy high',
    'expert': 'a child mastering skill',
    'beginner': 'a child starting to learn',
    'professional': 'a child dressed as doctor',
    'amateur': 'a child practicing new skill'
  }
};

/**
 * 将Blob转换为base64格式（持久化存储）
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 验证图片内容是否有效
 * 检查是否为黑屏、纯色或损坏的图片
 */
async function validateImageContent(base64Data: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // 创建canvas来分析图片内容
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.warn('⚠️ 无法创建canvas上下文');
          resolve(false);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 分析像素数据
        let totalPixels = 0;
        let blackPixels = 0;
        let whitePixels = 0;
        let colorPixels = 0;
        
        // 采样分析（每10个像素采样一次，提高性能）
        for (let i = 0; i < data.length; i += 40) { // 每10个像素采样一次
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a > 0) { // 忽略透明像素
            totalPixels++;
            
            // 检查是否为黑色（RGB都接近0）
            if (r < 30 && g < 30 && b < 30) {
              blackPixels++;
            }
            // 检查是否为白色（RGB都接近255）
            else if (r > 225 && g > 225 && b > 225) {
              whitePixels++;
            }
            // 其他颜色
            else {
              colorPixels++;
            }
          }
        }
        
        if (totalPixels === 0) {
          console.warn('⚠️ 图片没有有效像素');
          resolve(false);
          return;
        }
        
        const blackRatio = blackPixels / totalPixels;
        const whiteRatio = whitePixels / totalPixels;
        const colorRatio = colorPixels / totalPixels;
        
        console.log(`🔍 图片内容分析: 黑色${(blackRatio * 100).toFixed(1)}%, 白色${(whiteRatio * 100).toFixed(1)}%, 彩色${(colorRatio * 100).toFixed(1)}%`);
        
        // 如果图片主要是黑色或白色，认为无效
        if (blackRatio > 0.8) {
          console.warn('⚠️ 图片主要是黑色，可能无效');
          resolve(false);
          return;
        }
        
        if (whiteRatio > 0.9) {
          console.warn('⚠️ 图片主要是白色，可能无效');
          resolve(false);
          return;
        }
        
        // 删除彩色像素比例检查，因为可能过于严格
        
        console.log('✅ 图片内容验证通过');
        resolve(true);
        
      } catch (error) {
        console.warn('⚠️ 图片内容验证出错:', error);
        resolve(false);
      }
    };
    
    img.onerror = () => {
      console.warn('⚠️ 图片加载失败');
      resolve(false);
    };
    
    img.src = base64Data;
  });
}

/**
 * 智能识别抽象词汇的类型
 */
function detectAbstractWordType(word: string): string | null {
  const lowerWord = word.toLowerCase();
  
  // 情感词汇特征
  const emotionPatterns = [
    /ness$/, /ity$/, /tion$/, /sion$/, /ment$/, /ful$/, /less$/,
    /^feel/, /^emot/, /^mood/, /^spirit/
  ];
  
  // 学科/概念词汇特征
  const conceptPatterns = [
    /ology$/, /phy$/, /ics$/, /ism$/, /ist$/, /acy$/, /ure$/,
    /^theo/, /^philo/, /^psycho/, /^socio/
  ];
  
  // 动作/过程词汇特征
  const actionPatterns = [
    /ing$/, /ance$/, /ence$/, /ship$/, /hood$/, /dom$/,
    /^inter/, /^trans/, /^pre/, /^post/
  ];
  
  // 检查是否匹配情感类
  if (emotionPatterns.some(pattern => pattern.test(lowerWord))) {
    return 'emotion';
  }
  
  // 检查是否匹配概念类
  if (conceptPatterns.some(pattern => pattern.test(lowerWord))) {
    return 'concept';
  }
  
  // 检查是否匹配动作类
  if (actionPatterns.some(pattern => pattern.test(lowerWord))) {
    return 'action';
  }
  
  return null;
}

/**
 * 为不同类型的抽象词汇生成可视化描述
 */
function generateAbstractVisualization(word: string, type: string): string {
  const lowerWord = word.toLowerCase();
  
  switch (type) {
    case 'emotion':
      return `a gentle scene representing ${lowerWord}, with soft colors and peaceful atmosphere`;
    
    case 'concept':
      return `symbolic representation of ${lowerWord}, with books, symbols, and educational elements`;
    
    case 'action':
      return `a scene showing ${lowerWord} in action, with people or objects demonstrating the concept`;
    
    default:
      return `a visual metaphor for ${lowerWord}`;
  }
}

/**
 * 获取单词的描述 - 智能处理抽象词汇
 */
function getWordDescription(word: string): string {
  const lowerWord = word.toLowerCase();
  
  // 预定义的具体映射（高优先级）
  const specificMappings: { [key: string]: string } = {
    // 学科类
    'history': 'an old book with ancient symbols',
    'math': 'a calculator with numbers',
    'science': 'a microscope with test tubes',
    'art': 'a paintbrush with colorful palette',
    'music': 'a piano with musical notes',
    'english': 'an open dictionary book',
    'geography': 'a world map with compass',
    'biology': 'a plant with DNA helix',
    'chemistry': 'laboratory beakers with colorful liquids',
    'physics': 'an atom model with electrons',
    
    // 情感类
    'love': 'a red heart with gentle glow',
    'happiness': 'a smiling sun with warm rays',
    'sadness': 'a gentle rain cloud',
    'anger': 'a storm cloud with lightning',
    'fear': 'a small child with teddy bear',
    'hope': 'a sunrise over mountains',
    'peace': 'a white dove with olive branch',
    'friendship': 'two hands shaking',
    'trust': 'a solid bridge over water',
    
    // 抽象概念类
    'time': 'an elegant clock face',
    'space': 'stars and planets in galaxy',
    'freedom': 'a bird flying in open sky',
    'justice': 'balanced scales',
    'wisdom': 'an owl with graduation cap',
    'knowledge': 'a glowing lightbulb with books',
    'creativity': 'a magical wand with sparkling stars',
    'imagination': 'a child with thought bubble of rainbow',
    'memory': 'a photo album with golden frames',
    'dream': 'a sleeping child with floating dream bubbles',
    
    // 动作/概念类
    'learning': 'a child reading under a tree',
    'teaching': 'a teacher with blackboard',
    'thinking': 'a child with lightbulb above head',
    'understanding': 'puzzle pieces fitting together',
    'communication': 'two speech bubbles connecting',
    'cooperation': 'children building blocks together',
    'competition': 'a friendly race finish line',
    'celebration': 'colorful balloons and confetti',
    
    // 特殊问题单词
    'cobweb': 'a delicate spider web with morning dew',
    'blind': 'a person with a white cane and guide dog',
    'door': 'a wooden door with a brass handle',
    'envelope': 'a white envelope with a red heart stamp'
  };
  
  // 1. 首先检查预定义映射
  if (specificMappings[lowerWord]) {
    return specificMappings[lowerWord];
  }
  
  // 2. 智能检测抽象词汇类型
  const abstractType = detectAbstractWordType(lowerWord);
  if (abstractType) {
    return generateAbstractVisualization(lowerWord, abstractType);
  }
  
  // 3. 对于具体词汇，使用简单格式，处理语法问题
  const article = /^[aeiou]/.test(lowerWord) ? 'an' : 'a';
  return `${article} ${lowerWord}`;
}

/**
 * 生成统一风格的提示词
 */
function generateConsistentPrompt(word: string): string {
  const wordDescription = getWordDescription(word);
  return IMAGE_STYLE_CONFIG.promptTemplate.replace('[WORD_DESCRIPTION]', wordDescription);
}

/**
 * 使用Pollinations.ai生成统一风格的儿童友好图片（持久化存储版）
 */
export async function generateAIImage(word: string): Promise<AIImageResponse> {
  const config = IMAGE_GENERATION_CONFIG;
  
  // 首先检查共享池中是否已有图片
  const existingImage = await cloudStorage.getSharedImage(word);
  if (existingImage) {
    console.log(`🎨 找到共享池中的图片: ${word}`);
    return {
      success: true,
      imageUrl: existingImage
    };
  }
  
  let retryCount = 0;
  
  // 记录尝试
  ImageGenerationStats.recordAttempt();
  
  while (retryCount < config.api.maxRetries) {
    try {
      // 使用统一的提示词模板
      const prompt = generateConsistentPrompt(word);
      
      // 详细日志记录
      if (retryCount === 0) {
        console.log('🎨 生成高质量AI图片:');
        console.log('  📝 单词:', word);
        console.log('  📋 描述:', getWordDescription(word));
        console.log('  💬 完整提示词:', prompt);
        console.log('  📏 提示词长度:', prompt.length, '字符');
        console.log('  ⚙️ 配置: 高质量模式, 增强开启, 无水印');
      } else {
        console.log(`🔄 第${retryCount}次重试生成"${word}"的图片...`);
        ImageGenerationStats.recordRetry();
      }
      
      // 构建优化的URL
      const seed = hashCode(word);
      const imageUrl = buildOptimizedImageUrl(prompt, seed);
      
      console.log('  🔗 完整URL:', imageUrl);
      
      // 等待API生成图片（第一次尝试时等待更长时间）
      if (retryCount === 0) {
        console.log('⏳ 等待API生成图片...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒让API生成
      }
      
      // 验证URL有效性并获取图片数据
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
        console.log(`✅ "${word}" AI图片验证成功，获取图片数据...`);
        
        // 获取图片数据
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('📏 图片文件大小:', blob.size, '字节');
        
        // 检查文件大小
        if (blob.size === 0) {
          throw new Error('图片文件为空（0字节）');
        }
        
        if (blob.size < config.validation.minSize) {
          throw new Error(`图片文件过小: ${blob.size} < ${config.validation.minSize} 字节`);
        }
        
        // 将图片添加到共享池
        await cloudStorage.addToSharedImagePool(word, imageUrl, `AI generated image for ${word}`);
        
        console.log(`✅ "${word}" AI图片生成并添加到共享池成功`);
        ImageGenerationStats.recordSuccess('ai');
        
        return {
          success: true,
          imageUrl: imageUrl
        };
      } else {
        throw new Error('图片验证失败');
      }
      
    } catch (error) {
      // 减少重试错误日志
      if (retryCount === 0 && error instanceof Error && !error.message.includes('图片文件为空')) {
        console.warn(`⚠️ 第${retryCount + 1}次AI图片生成尝试失败:`, error);
      }
      
      if (retryCount < config.api.maxRetries - 1) {
        retryCount++;
        // 递增延迟重试
        const delay = config.api.retryDelay * retryCount;
        console.log(`⏳ ${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        console.error(`❌ AI图片生成完全失败，所有重试都已用尽:`, error);
        ImageGenerationStats.recordFailure();
        
        return {
          success: false,
          error: `AI图片生成失败: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  }
  
  // 理论上不会到达这里，但为了类型安全
  return {
    success: false,
    error: `AI图片生成失败: 所有重试都已用尽`
  };
}

// 生成或获取单词图片 - 使用测试页面成功的简化逻辑
export async function generateWordImage(word: string): Promise<AIImageResponse> {
  try {
    console.log(`🚀 开始为"${word}"生成AI图片...`);
    
    // 使用优化的统一风格提示词
    const wordDescription = getWordDescription(word);
    const prompt = `${wordDescription}, cute cartoon style, bright colors, simple illustration, child-friendly, educational`;
    
    console.log(`📝 提示词: ${prompt}`);
    
    // 生成图片URL
    const imageUrl = buildOptimizedImageUrl(prompt, hashCode(word));
    
    if (!imageUrl) {
      throw new Error('图片URL生成失败');
    }
    
    console.log(`🖼️ 图片URL: ${imageUrl.substring(0, 50)}...`);
    
    // 获取图片数据
    console.log(`🌐 请求图片URL: ${imageUrl}`);
    
    // 添加延迟，让API有时间生成图片
    console.log('⏳ 等待API生成图片...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await fetch(imageUrl);
    console.log(`📡 响应状态: ${response.status} ${response.statusText}`);
    console.log(`📋 响应头:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`📊 图片文件大小: ${blob.size} 字节`);
    console.log(`📋 图片类型: ${blob.type}`);
    
    if (blob.size === 0) {
      console.warn(`⚠️ API返回空文件，使用SVG备选方案: ${word}`);
      // 使用SVG备选方案
      const { generateSimpleSVG } = await import('./simpleSvg');
      const svgContent = generateSimpleSVG(word);
      // 将SVG转换为data URL
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
      return {
        success: true,
        imageUrl: svgDataUrl,
        prompt: prompt
      };
    }
    
    console.log(`📊 图片大小: ${blob.size} 字节`);
    
    // 转换为base64
    const base64Data = await blobToBase64(blob);
    
    // 简化验证：只检查是否为空
    if (!base64Data || base64Data.length < 50) {
      throw new Error('图片数据无效');
    }
    
    console.log(`✅ "${word}" AI图片生成成功`);
    
    return {
      success: true,
      imageUrl: base64Data,
      prompt: prompt
    };
    
  } catch (error) {
    console.error(`❌ "${word}" AI图片生成失败:`, error);
    return {
      success: false,
      error: `AI图片生成失败: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// 导出生成函数供其他模块使用
export { generateSimpleSVG as generateOrGetCachedImage };