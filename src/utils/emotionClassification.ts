// 感情の分類とユーティリティ関数

export type EmotionType = 'negative' | 'positive' | 'neutral';

export interface EmotionClassification {
  emotion: string;
  type: EmotionType;
  category: string;
}

// 感情分類データベース
export const emotionDatabase: EmotionClassification[] = [
  // ネガティブ感情
  { emotion: '不安', type: 'negative', category: '恐怖系' },
  { emotion: '恐怖', type: 'negative', category: '恐怖系' },
  { emotion: '心配', type: 'negative', category: '恐怖系' },
  { emotion: '焦り', type: 'negative', category: '恐怖系' },
  { emotion: 'パニック', type: 'negative', category: '恐怖系' },
  
  { emotion: '怒り', type: 'negative', category: '怒り系' },
  { emotion: 'イライラ', type: 'negative', category: '怒り系' },
  { emotion: '憤り', type: 'negative', category: '怒り系' },
  { emotion: '苛立ち', type: 'negative', category: '怒り系' },
  
  { emotion: '悲しみ', type: 'negative', category: '悲しみ系' },
  { emotion: '落胆', type: 'negative', category: '悲しみ系' },
  { emotion: '絶望', type: 'negative', category: '悲しみ系' },
  { emotion: '憂鬱', type: 'negative', category: '悲しみ系' },
  { emotion: '孤独', type: 'negative', category: '悲しみ系' },
  
  { emotion: '恥', type: 'negative', category: '自己否定系' },
  { emotion: '罪悪感', type: 'negative', category: '自己否定系' },
  { emotion: '劣等感', type: 'negative', category: '自己否定系' },
  { emotion: '嫌悪', type: 'negative', category: '自己否定系' },
  { emotion: '自己嫌悪', type: 'negative', category: '自己否定系' },
  
  { emotion: '混乱', type: 'negative', category: 'その他' },
  { emotion: '驚き', type: 'negative', category: 'その他' },
  { emotion: 'ショック', type: 'negative', category: 'その他' },
  
  // ポジティブ感情
  { emotion: '喜び', type: 'positive', category: '喜び系' },
  { emotion: '幸せ', type: 'positive', category: '喜び系' },
  { emotion: '楽しさ', type: 'positive', category: '喜び系' },
  { emotion: '嬉しさ', type: 'positive', category: '喜び系' },
  { emotion: '満足', type: 'positive', category: '喜び系' },
  
  { emotion: '安心', type: 'positive', category: '平静系' },
  { emotion: '平静', type: 'positive', category: '平静系' },
  { emotion: '落ち着き', type: 'positive', category: '平静系' },
  { emotion: 'リラックス', type: 'positive', category: '平静系' },
  { emotion: '解放感', type: 'positive', category: '平静系' },
  
  { emotion: '希望', type: 'positive', category: '希望系' },
  { emotion: '期待', type: 'positive', category: '希望系' },
  { emotion: '楽観', type: 'positive', category: '希望系' },
  { emotion: '前向き', type: 'positive', category: '希望系' },
  
  { emotion: '自信', type: 'positive', category: '自己肯定系' },
  { emotion: '誇り', type: 'positive', category: '自己肯定系' },
  { emotion: '達成感', type: 'positive', category: '自己肯定系' },
  { emotion: '自己受容', type: 'positive', category: '自己肯定系' },
  
  { emotion: '感謝', type: 'positive', category: 'その他' },
  { emotion: '愛情', type: 'positive', category: 'その他' },
  { emotion: '理解', type: 'positive', category: 'その他' },
  { emotion: '決意', type: 'positive', category: 'その他' },
  { emotion: '反省', type: 'positive', category: 'その他' },
  
  // 軽減されたネガティブ感情（改善を示す）
  { emotion: '軽い不安', type: 'negative', category: '恐怖系' },
  { emotion: '軽い悲しみ', type: 'negative', category: '悲しみ系' },
  { emotion: '軽い怒り', type: 'negative', category: '怒り系' },
  { emotion: '軽い恐怖', type: 'negative', category: '恐怖系' },
  { emotion: '軽い焦り', type: 'negative', category: '恐怖系' },
  { emotion: '軽い落胆', type: 'negative', category: '悲しみ系' },
  { emotion: '軽い罪悪感', type: 'negative', category: '自己否定系' },
];

// 感情の分類を取得する関数
export const classifyEmotion = (emotionName: string): EmotionType => {
  const found = emotionDatabase.find(item => item.emotion === emotionName);
  if (found) {
    return found.type;
  }
  
  // データベースにない場合の推測
  const lowerEmotion = emotionName.toLowerCase();
  
  // ネガティブ感情のキーワード
  const negativeKeywords = [
    '不安', '心配', '恐怖', '怖', '焦', 'パニック',
    '怒', 'イライラ', '腹立', '憤',
    '悲し', '落胆', '絶望', '憂鬱', '孤独', '寂し',
    '恥', '罪悪', '劣等', '嫌悪', '自己嫌悪',
    '混乱', 'ショック', 'ストレス', '疲れ', '辛い', '苦し'
  ];
  
  // ポジティブ感情のキーワード
  const positiveKeywords = [
    '喜', '幸せ', '楽し', '嬉し', '満足',
    '安心', '平静', '落ち着', 'リラックス', '解放',
    '希望', '期待', '楽観', '前向き',
    '自信', '誇り', '達成', '自己受容',
    '感謝', '愛', '理解', '決意', '反省'
  ];
  
  // キーワードマッチング
  for (const keyword of negativeKeywords) {
    if (lowerEmotion.includes(keyword)) {
      return 'negative';
    }
  }
  
  for (const keyword of positiveKeywords) {
    if (lowerEmotion.includes(keyword)) {
      return 'positive';
    }
  }
  
  // 判定できない場合はニュートラル
  return 'neutral';
};

// カテゴリごとの感情を取得
export const getEmotionsByCategory = (type: EmotionType): string[] => {
  return emotionDatabase
    .filter(item => item.type === type)
    .map(item => item.emotion);
};

// ネガティブ感情とポジティブ感情の分類
export const categorizeEmotions = (emotions: Array<{emotion: string, intensity: number}>) => {
  const negative: Array<{emotion: string, intensity: number}> = [];
  const positive: Array<{emotion: string, intensity: number}> = [];
  const neutral: Array<{emotion: string, intensity: number}> = [];
  
  emotions.forEach(emotion => {
    const type = classifyEmotion(emotion.emotion);
    switch (type) {
      case 'negative':
        negative.push(emotion);
        break;
      case 'positive':
        positive.push(emotion);
        break;
      case 'neutral':
        neutral.push(emotion);
        break;
    }
  });
  
  return { negative, positive, neutral };
};

// 改善度の計算
export const calculateImprovement = (
  originalEmotions: Array<{emotion: string, intensity: number}>,
  newEmotions: Array<{emotion: string, intensity: number}>
): {
  negativeImprovement: number;
  positiveIncrease: number;
  overallImprovement: number;
  improvementDescription: string;
} => {
  const originalCategorized = categorizeEmotions(originalEmotions);
  const newCategorized = categorizeEmotions(newEmotions);
  
  // ネガティブ感情の平均強度計算
  const originalNegativeAvg = originalCategorized.negative.length > 0
    ? originalCategorized.negative.reduce((sum, e) => sum + e.intensity, 0) / originalCategorized.negative.length
    : 0;
    
  const newNegativeAvg = newCategorized.negative.length > 0
    ? newCategorized.negative.reduce((sum, e) => sum + e.intensity, 0) / newCategorized.negative.length
    : 0;
  
  // ポジティブ感情の平均強度計算
  const originalPositiveAvg = originalCategorized.positive.length > 0
    ? originalCategorized.positive.reduce((sum, e) => sum + e.intensity, 0) / originalCategorized.positive.length
    : 0;
    
  const newPositiveAvg = newCategorized.positive.length > 0
    ? newCategorized.positive.reduce((sum, e) => sum + e.intensity, 0) / newCategorized.positive.length
    : 0;
  
  // ネガティブ感情の改善度（減少が良い）
  const negativeImprovement = originalNegativeAvg - newNegativeAvg;
  
  // ポジティブ感情の増加度（増加が良い）
  const positiveIncrease = newPositiveAvg - originalPositiveAvg;
  
  // 総合改善度（重み付き）
  const overallImprovement = (negativeImprovement * 0.6) + (positiveIncrease * 0.4);
  
  // 改善度の説明
  let improvementDescription = '';
  if (overallImprovement >= 3) {
    improvementDescription = '大幅な改善';
  } else if (overallImprovement >= 1.5) {
    improvementDescription = '明確な改善';
  } else if (overallImprovement >= 0.5) {
    improvementDescription = '軽度の改善';
  } else if (overallImprovement >= -0.5) {
    improvementDescription = '変化なし';
  } else {
    improvementDescription = '悪化';
  }
  
  return {
    negativeImprovement: Math.round(negativeImprovement * 10) / 10,
    positiveIncrease: Math.round(positiveIncrease * 10) / 10,
    overallImprovement: Math.round(overallImprovement * 10) / 10,
    improvementDescription
  };
};

// 感情タイプに応じた色の取得
export const getEmotionColor = (emotionName: string): string => {
  const type = classifyEmotion(emotionName);
  switch (type) {
    case 'negative':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'positive':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'neutral':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
