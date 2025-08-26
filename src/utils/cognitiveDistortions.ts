import { CognitiveDistortion } from '../types';

// 認知の歪みデータベース
export const cognitiveDistortions: CognitiveDistortion[] = [
  // （１）極端な思考
  {
    id: 'blackWhite',
    name: '白黒思考',
    category: 'extreme',
    description: '物事を極端に捉え、中間がない考え方'
  },
  {
    id: 'shouldThinking',
    name: 'べき思考',
    category: 'extreme',
    description: '「〜すべき」「〜しなければならない」という完璧主義的な考え方'
  },
  {
    id: 'catastrophizing',
    name: '破局的思考',
    category: 'extreme',
    description: '最悪の結果を想像し、それが確実に起こると考える'
  },

  // （２）選択的注意
  {
    id: 'overgeneralization',
    name: '過度の一般化',
    category: 'selective',
    description: '一つの出来事から全体的な結論を導き出す'
  },
  {
    id: 'mentalFilter',
    name: '心のフィルター',
    category: 'selective',
    description: '否定的な側面にのみ注意を向け、肯定的な面を無視する'
  },
  {
    id: 'discountingPositive',
    name: 'マイナス化思考',
    category: 'selective',
    description: '肯定的な出来事を否定的に解釈する'
  },
  {
    id: 'magnificationMinimization',
    name: '拡大解釈・過少評価',
    category: 'selective',
    description: '悪い面を拡大し、良い面を過少評価する'
  },

  // （３）直感への依存
  {
    id: 'jumpingToConclusions',
    name: '結論の飛躍',
    category: 'intuitive',
    description: '証拠もないのに否定的な結論を導き出す'
  },
  {
    id: 'emotionalReasoning',
    name: '感情的推論',
    category: 'intuitive',
    description: '感情を事実として扱い、それに基づいて判断する'
  },
  {
    id: 'labeling',
    name: 'レッテル貼り',
    category: 'intuitive',
    description: '自分や他人に否定的なレッテルを貼る'
  },

  // （４）自己𠮟責
  {
    id: 'personalization',
    name: '個人化',
    category: 'selfBlame',
    description: '自分に責任のない出来事でも自分のせいだと考える'
  },
  {
    id: 'selfCriticism',
    name: '自己批判・自己罵倒',
    category: 'selfBlame',
    description: '自分を厳しく批判し、否定的な言葉で責める'
  }
];

// カテゴリー情報
export const distortionCategories = {
  extreme: {
    name: '極端な思考',
    color: 'red',
    description: '物事を極端に捉える思考パターン'
  },
  selective: {
    name: '選択的注意',
    color: 'orange',
    description: '特定の側面にのみ注目する思考パターン'
  },
  intuitive: {
    name: '直感への依存',
    color: 'yellow',
    description: '証拠よりも直感を重視する思考パターン'
  },
  selfBlame: {
    name: '自己𠮟責',
    color: 'purple',
    description: '自分を責める思考パターン'
  }
} as const;

// 認知の歪みを取得する関数
export const getCognitiveDistortionById = (id: string): CognitiveDistortion | undefined => {
  return cognitiveDistortions.find(distortion => distortion.id === id);
};

// カテゴリー別に認知の歪みを取得する関数
export const getCognitiveDistortionsByCategory = (category: string) => {
  return cognitiveDistortions.filter(distortion => distortion.category === category);
};
