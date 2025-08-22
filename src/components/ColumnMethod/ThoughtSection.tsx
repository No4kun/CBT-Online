import React from 'react';
import { motion } from 'framer-motion';
import { Brain, List } from 'lucide-react';
import { ThoughtSection as ThoughtData, ColumnEntry } from '../../types';

interface ThoughtSectionProps {
  data: ThoughtData;
  onUpdate: (updates: Partial<ColumnEntry>) => void;
}

const ThoughtSection: React.FC<ThoughtSectionProps> = ({ data, onUpdate }) => {
  const thoughtSuggestions = [
    '私はダメな人間だ',
    'みんなが私を批判している',
    '失敗は許されない',
    '完璧でなければならない',
    '私には価値がない',
    'この状況は最悪だ',
    '私にはできない',
    'いつも同じことが起こる'
  ];

  const evidencePrompts = [
    '実際に何が起こったか？',
    '客観的な事実は何か？',
    '他の人も同じことを言うだろうか？',
    '過去に似たような経験はあるか？',
    'この考えを支持する具体的な証拠は？'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* 自動思考 */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <Brain className="h-5 w-5 text-secondary-500" />
          <span>自動思考</span>
        </label>
        <p className="text-sm text-calm-600 mb-2">
          その状況で頭に浮かんだ考えや思いを記入してください
        </p>
        <motion.textarea
          whileFocus={{ scale: 1.01 }}
          value={data.automaticThought}
          onChange={(e) => onUpdate({ automaticThought: e.target.value })}
          placeholder="例：私は失敗した。みんなが私をバカだと思っている。"
          rows={4}
          className="form-textarea text-lg"
        />
        
        {/* 思考の候補 */}
        <div className="space-y-2">
          <p className="text-sm text-calm-600">よくある自動思考の例：</p>
          <div className="flex flex-wrap gap-2">
            {thoughtSuggestions.map((thought) => (
              <motion.button
                key={thought}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const currentThought = data.automaticThought;
                  const newThought = currentThought 
                    ? `${currentThought}\n${thought}`
                    : thought;
                  onUpdate({ automaticThought: newThought });
                }}
                className="px-3 py-1 text-sm bg-secondary-50 text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                {thought}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 根拠 */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <List className="h-5 w-5 text-secondary-500" />
          <span>根拠</span>
        </label>
        <p className="text-sm text-calm-600 mb-2">
          その自動思考を支持する証拠や理由を記入してください
        </p>
        <motion.textarea
          whileFocus={{ scale: 1.01 }}
          value={data.evidence}
          onChange={(e) => onUpdate({ evidence: e.target.value })}
          placeholder="例：質問に即答できなかった。会議室が静かになった。"
          rows={4}
          className="form-textarea text-lg"
        />

        {/* 根拠を見つけるためのプロンプト */}
        <div className="mt-4 p-4 bg-secondary-50 rounded-xl border border-secondary-200">
          <h4 className="text-sm font-medium text-secondary-700 mb-2">
            根拠を見つけるためのヒント：
          </h4>
          <ul className="space-y-1">
            {evidencePrompts.map((prompt, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-sm text-secondary-600 flex items-start space-x-2"
              >
                <span className="text-secondary-400 mt-0.5">•</span>
                <span>{prompt}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* ヒントカード */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-secondary-50 to-primary-50 p-6 rounded-2xl border border-secondary-200"
      >
        <h3 className="text-lg font-semibold text-secondary-700 mb-3">
          💡 ポイント
        </h3>
        <div className="space-y-2 text-sm text-secondary-600">
          <p>• 自動思考は、瞬間的に頭に浮かぶ考えです</p>
          <p>• 事実と解釈を分けて考えてみましょう</p>
          <p>• 「必ず」「絶対に」「いつも」などの極端な表現に注意</p>
          <p>• 客観的な証拠と主観的な解釈を区別しましょう</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThoughtSection;
