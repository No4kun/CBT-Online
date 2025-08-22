import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Scale, TrendingUp } from 'lucide-react';
import { AdaptationSection as AdaptationData, ColumnEntry } from '../../types';

interface AdaptationSectionProps {
  data: AdaptationData;
  onUpdate: (updates: Partial<ColumnEntry>) => void;
}

const AdaptationSection: React.FC<AdaptationSectionProps> = ({ data, onUpdate }) => {
  const counterEvidencePrompts = [
    'この考えと矛盾する事実はあるか？',
    '別の見方はできないか？',
    '友人が同じ状況にいたら何と言うか？',
    '過去に似た状況で良い結果になったことはあるか？',
    'この考えは現実的で役に立つか？'
  ];

  const adaptiveThoughtExamples = [
    '完璧でなくても価値がある',
    '失敗は学習の機会である',
    '一時的な感情であり、永続的ではない',
    '他の人も同じような経験をしている',
    '少しずつでも成長している',
    'できることに焦点を当てよう'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* 反証 */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <Scale className="h-5 w-5 text-accent-500" />
          <span>反証</span>
        </label>
        <p className="text-sm text-calm-600 mb-2">
          自動思考と矛盾する証拠や別の視点を記入してください
        </p>
        <motion.textarea
          whileFocus={{ scale: 1.01 }}
          value={data.counterEvidence}
          onChange={(e) => onUpdate({ counterEvidence: e.target.value })}
          placeholder="例：過去に同じような質問で成功した経験がある。他の人も時々即答できないことがある。"
          rows={4}
          className="form-textarea text-lg"
        />

        {/* 反証を見つけるためのプロンプト */}
        <div className="mt-4 p-4 bg-accent-50 rounded-xl border border-accent-200">
          <h4 className="text-sm font-medium text-accent-700 mb-2">
            反証を見つけるための質問：
          </h4>
          <ul className="space-y-1">
            {counterEvidencePrompts.map((prompt, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-sm text-accent-600 flex items-start space-x-2"
              >
                <span className="text-accent-400 mt-0.5">•</span>
                <span>{prompt}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* 適応思考 */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <Lightbulb className="h-5 w-5 text-accent-500" />
          <span>適応思考</span>
        </label>
        <p className="text-sm text-calm-600 mb-2">
          よりバランスの取れた、現実的で役に立つ考え方を記入してください
        </p>
        <motion.textarea
          whileFocus={{ scale: 1.01 }}
          value={data.adaptiveThought}
          onChange={(e) => onUpdate({ adaptiveThought: e.target.value })}
          placeholder="例：即答できなくても、しっかりと考えてから答える方が良い場合もある。完璧である必要はない。"
          rows={4}
          className="form-textarea text-lg"
        />
        
        {/* 適応思考の例 */}
        <div className="space-y-2">
          <p className="text-sm text-calm-600">適応思考の例：</p>
          <div className="flex flex-wrap gap-2">
            {adaptiveThoughtExamples.map((thought) => (
              <motion.button
                key={thought}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const currentThought = data.adaptiveThought;
                  const newThought = currentThought 
                    ? `${currentThought}\n${thought}`
                    : thought;
                  onUpdate({ adaptiveThought: newThought });
                }}
                className="px-3 py-1 text-sm bg-accent-50 text-accent-600 rounded-lg hover:bg-accent-100 transition-colors"
              >
                {thought}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 感情の変化 */}
      <div className="space-y-4">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <TrendingUp className="h-5 w-5 text-accent-500" />
          <span>感情の変化</span>
        </label>
        <p className="text-sm text-calm-600">
          適応思考を考えた後の感情の強さを評価してください（0-10）
        </p>
        
        <div className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="range"
            min="0"
            max="10"
            value={data.emotionChange}
            onChange={(e) => onUpdate({ emotionChange: parseInt(e.target.value) })}
            className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-calm-500">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span>10</span>
          </div>
          
          <motion.div
            key={data.emotionChange}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200"
          >
            <div className="text-2xl font-bold text-accent-600">
              {data.emotionChange}
            </div>
            <div className="text-sm text-accent-700">
              {data.emotionChange <= 2 && '大幅に改善'}
              {data.emotionChange > 2 && data.emotionChange <= 4 && '改善'}
              {data.emotionChange > 4 && data.emotionChange <= 6 && 'やや改善'}
              {data.emotionChange > 6 && data.emotionChange <= 8 && '少し改善'}
              {data.emotionChange > 8 && '変化なし'}
            </div>
          </motion.div>
        </div>
      </div>

      {/* まとめカード */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-accent-50 to-secondary-50 p-6 rounded-2xl border border-accent-200"
      >
        <h3 className="text-lg font-semibold text-accent-700 mb-3">
          🌟 まとめ
        </h3>
        <div className="space-y-2 text-sm text-accent-600">
          <p>• 適応思考は、現実的で役に立つ考え方です</p>
          <p>• 完全にポジティブである必要はありません</p>
          <p>• バランスの取れた視点を目指しましょう</p>
          <p>• 感情の変化を観察することが重要です</p>
          <p>• 練習することで自然にできるようになります</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdaptationSection;
