import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Scale, TrendingUp, Plus, X } from 'lucide-react';
import { AdaptationSection as AdaptationData, ColumnEntry, EmotionEntry } from '../../types';

interface AdaptationSectionProps {
  data: AdaptationData;
  onUpdate: (updates: Partial<ColumnEntry>) => void;
  originalEmotions?: EmotionEntry[]; // 元の感情を参照用に受け取る
}

const AdaptationSection: React.FC<AdaptationSectionProps> = ({ data, onUpdate, originalEmotions = [] }) => {
  const [newEmotionInput, setNewEmotionInput] = useState('');

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

  const predefinedEmotions = [
    '安心', '希望', '満足', '平静', '自信', '解放感',
    '軽い不安', '軽い悲しみ', '軽い怒り', '軽い恐怖', '軽い焦り', '軽い落胆'
  ];

  // 新しい感情追加処理
  const addNewEmotion = (emotionName: string) => {
    const trimmedName = emotionName.trim();
    if (!trimmedName) return;
    
    // 重複チェック
    const exists = data.newEmotions?.some(e => e.emotion === trimmedName);
    if (exists) return;

    const newEmotion: EmotionEntry = {
      emotion: trimmedName,
      intensity: 5
    };

    const updatedNewEmotions = [...(data.newEmotions || []), newEmotion];
    onUpdate({ newEmotions: updatedNewEmotions });
    setNewEmotionInput('');
  };

  // 感情削除処理
  const removeNewEmotion = (index: number) => {
    const updatedNewEmotions = data.newEmotions?.filter((_, i) => i !== index) || [];
    onUpdate({ newEmotions: updatedNewEmotions });
  };

  // 感情強度更新処理
  const updateNewEmotionIntensity = (index: number, intensity: number) => {
    const updatedNewEmotions = [...(data.newEmotions || [])];
    updatedNewEmotions[index] = { ...updatedNewEmotions[index], intensity };
    onUpdate({ newEmotions: updatedNewEmotions });
  };

  // 元の感情を新しい感情にコピー
  const copyOriginalEmotion = (originalEmotion: EmotionEntry) => {
    const exists = data.newEmotions?.some(e => e.emotion === originalEmotion.emotion);
    if (exists) return;

    const newEmotion: EmotionEntry = {
      emotion: originalEmotion.emotion,
      intensity: Math.max(1, originalEmotion.intensity - 2) // 強度を2下げる（最低1）
    };

    const updatedNewEmotions = [...(data.newEmotions || []), newEmotion];
    onUpdate({ newEmotions: updatedNewEmotions });
  };

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
      <div className="space-y-6">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <TrendingUp className="h-5 w-5 text-accent-500" />
          <span>感情の変化</span>
        </label>
        <p className="text-sm text-calm-600">
          適応思考を考えた後の感情を記録してください。元の感情をコピーして調整するか、新しい感情を追加できます。
        </p>

        {/* 元の感情をコピーするセクション */}
        {originalEmotions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">元の感情から選択（強度を調整）</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {originalEmotions.map((emotion) => {
                const isAlreadyAdded = data.newEmotions?.some(e => e.emotion === emotion.emotion);
                return (
                  <button
                    key={emotion.emotion}
                    onClick={() => copyOriginalEmotion(emotion)}
                    disabled={isAlreadyAdded}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isAlreadyAdded
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                    }`}
                  >
                    {emotion.emotion} {isAlreadyAdded && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 新しい感情の選択 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">新しい感情を選択・追加</h4>
          
          {/* 定義済み感情ボタン */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {predefinedEmotions.map((emotion) => {
              const isAlreadyAdded = data.newEmotions?.some(e => e.emotion === emotion);
              return (
                <button
                  key={emotion}
                  onClick={() => addNewEmotion(emotion)}
                  disabled={isAlreadyAdded}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isAlreadyAdded
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-100 hover:bg-green-200 text-green-800'
                  }`}
                >
                  {emotion} {isAlreadyAdded && '✓'}
                </button>
              );
            })}
          </div>

          {/* カスタム感情入力 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmotionInput}
              onChange={(e) => setNewEmotionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewEmotion(newEmotionInput);
                }
              }}
              placeholder="その他の感情を入力..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => addNewEmotion(newEmotionInput)}
              disabled={!newEmotionInput.trim()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              追加
            </button>
          </div>
        </div>

        {/* 追加された新しい感情と強度設定 */}
        <div className="space-y-4">
          {data.newEmotions && data.newEmotions.length > 0 && (
            <h4 className="text-sm font-medium text-gray-700">
              適応思考後の感情 ({data.newEmotions.length}個)
            </h4>
          )}
          
          {data.newEmotions?.map((emotion, index) => (
            <div
              key={`${emotion.emotion}-${index}`}
              className="bg-green-50 p-4 rounded-lg border border-green-200"
            >
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium text-gray-800">{emotion.emotion}</h5>
                <button
                  onClick={() => removeNewEmotion(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">強度 (1-10)</span>
                  <span className="text-sm font-medium text-green-600">{emotion.intensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotion.intensity}
                  onChange={(e) => updateNewEmotionIntensity(index, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (軽い)</span>
                  <span>5 (中程度)</span>
                  <span>10 (非常に強い)</span>
                </div>
              </div>
            </div>
          ))}

          {/* 感情未追加時のメッセージ */}
          {(!data.newEmotions || data.newEmotions.length === 0) && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">適応思考後の感情を記録しましょう</p>
              <p className="text-sm text-gray-500 mt-1">元の感情をコピーするか、新しい感情を追加してください</p>
            </div>
          )}
        </div>

        {/* 感情変化の比較表示 */}
        {data.newEmotions && data.newEmotions.length > 0 && originalEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200"
          >
            <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
              📊 感情の変化を比較
            </h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-3">適応思考前</h5>
                <div className="space-y-2">
                  {originalEmotions.map((emotion, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-red-100 rounded">
                      <span className="text-red-800">{emotion.emotion}</span>
                      <span className="text-red-600 font-medium">{emotion.intensity}/10</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  平均強度: {Math.round(originalEmotions.reduce((sum, e) => sum + e.intensity, 0) / originalEmotions.length * 10) / 10}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-3">適応思考後</h5>
                <div className="space-y-2">
                  {data.newEmotions.map((emotion, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-green-100 rounded">
                      <span className="text-green-800">{emotion.emotion}</span>
                      <span className="text-green-600 font-medium">{emotion.intensity}/10</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  平均強度: {Math.round(data.newEmotions.reduce((sum, e) => sum + e.intensity, 0) / data.newEmotions.length * 10) / 10}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="text-center">
                <span className="text-lg font-bold text-blue-600">
                  改善度: {Math.round((originalEmotions.reduce((sum, e) => sum + e.intensity, 0) / originalEmotions.length - 
                           data.newEmotions.reduce((sum, e) => sum + e.intensity, 0) / data.newEmotions.length) * 10) / 10} ポイント
                </span>
              </div>
            </div>
          </motion.div>
        )}
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
