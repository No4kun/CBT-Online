import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Scale, TrendingUp, Plus, BarChart3, TrendingDown } from 'lucide-react';
import { AdaptationSection as AdaptationData, ColumnEntry, EmotionEntry } from '../../types';
import { 
  calculateImprovement, 
  getEmotionColor,
  categorizeEmotions
} from '../../utils/emotionClassification';
import EmotionClassificationDropZone from '../ui/EmotionClassificationDropZone';

interface AdaptationSectionProps {
  data: AdaptationData;
  onUpdate: (updates: Partial<ColumnEntry>) => void;
  originalEmotions?: EmotionEntry[]; // 元の感情を参照用に受け取る
}

const AdaptationSection: React.FC<AdaptationSectionProps> = ({ data, onUpdate, originalEmotions = [] }) => {
  const [newEmotionInput, setNewEmotionInput] = useState('');
  const [unclassifiedEmotions, setUnclassifiedEmotions] = useState<string[]>([]);

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
    // 喜び系
    '喜び', '幸せ', '楽しさ', '満足',
    // 平静系
    '安心', '平静', 'リラックス', '解放感',
    // 希望系
    '希望', '期待', '楽観', '前向き',
    // 自己肯定系
    '自信', '誇り', '達成感', '自己受容',
    // 成長系
    '成長感', '学び', '気づき', '克服感',
    // 活動系
    'やる気', '集中', '興味', '創造性'
  ];

  // 新しい感情追加処理（未分類リストに追加）
  const addNewEmotion = (emotionName: string) => {
    const trimmedName = emotionName.trim();
    if (!trimmedName) return;
    
    // 重複チェック（既存の感情と未分類リストの両方）
    const existsInEmotions = data.newEmotions?.some(e => e.emotion === trimmedName);
    const existsInUnclassified = unclassifiedEmotions.includes(trimmedName);
    
    if (existsInEmotions || existsInUnclassified) return;

    // 未分類リストに追加
    setUnclassifiedEmotions(prev => [...prev, trimmedName]);
    setNewEmotionInput('');
  };

  // 未分類感情の削除
  const removeUnclassifiedEmotion = (emotion: string) => {
    setUnclassifiedEmotions(prev => prev.filter(e => e !== emotion));
  };

  // 感情の更新（ドロップゾーンから）
  const handleNewEmotionsUpdate = (updatedEmotions: EmotionEntry[]) => {
    onUpdate({ newEmotions: updatedEmotions });
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
            <p className="text-xs text-gray-600">💡 元の感情をそのまま引き継いで、強度を調整できます</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {originalEmotions.map((emotion) => {
                const isAlreadyAdded = data.newEmotions?.some(e => e.emotion === emotion.emotion) || unclassifiedEmotions.includes(emotion.emotion);
                
                return (
                  <button
                    key={emotion.emotion}
                    onClick={() => {
                      if (!isAlreadyAdded) {
                        setUnclassifiedEmotions(prev => [...prev, emotion.emotion]);
                      }
                    }}
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
              const isAlreadyAdded = data.newEmotions?.some(e => e.emotion === emotion) || unclassifiedEmotions.includes(emotion);
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

        {/* 感情の分類とドラッグ&ドロップ */}
        <EmotionClassificationDropZone
          emotions={data.newEmotions || []}
          onEmotionsUpdate={handleNewEmotionsUpdate}
          unclassifiedEmotions={unclassifiedEmotions}
          onUnclassifiedRemove={removeUnclassifiedEmotion}
          className="mt-6"
        />

        {/* 感情変化の比較表示 */}
        {data.newEmotions && data.newEmotions.length > 0 && originalEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200"
          >
            <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              感情の変化分析
            </h4>
            
            {(() => {
              const originalCategorized = categorizeEmotions(originalEmotions);
              const newCategorized = categorizeEmotions(data.newEmotions);
              const improvement = calculateImprovement(originalEmotions, data.newEmotions);
              
              return (
                <div className="space-y-6">
                  {/* 感情の比較 */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">適応思考前</h5>
                      <div className="space-y-2">
                        {originalEmotions.map((emotion, idx) => (
                          <div key={idx} className={`flex justify-between items-center p-2 rounded border ${getEmotionColor(emotion.emotion)}`}>
                            <span>{emotion.emotion}</span>
                            <span className="font-medium">{emotion.intensity}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">適応思考後</h5>
                      <div className="space-y-2">
                        {data.newEmotions.map((emotion, idx) => (
                          <div key={idx} className={`flex justify-between items-center p-2 rounded border ${getEmotionColor(emotion.emotion)}`}>
                            <span>{emotion.emotion}</span>
                            <span className="font-medium">{emotion.intensity}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 感情分類別の分析 */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h6 className="font-medium text-gray-700 mb-3">感情分類別の変化</h6>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm font-medium text-red-700">ネガティブ感情</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>前: {originalCategorized.negative.length > 0 
                            ? Math.round(originalCategorized.negative.reduce((sum, e) => sum + e.intensity, 0) / originalCategorized.negative.length * 10) / 10 
                            : 0} 点</div>
                          <div>後: {newCategorized.negative.length > 0 
                            ? Math.round(newCategorized.negative.reduce((sum, e) => sum + e.intensity, 0) / newCategorized.negative.length * 10) / 10 
                            : 0} 点</div>
                          <div className={`font-medium ${improvement.negativeImprovement > 0 ? 'text-green-600' : improvement.negativeImprovement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {improvement.negativeImprovement > 0 ? '↓' : improvement.negativeImprovement < 0 ? '↑' : '→'} 
                            {Math.abs(improvement.negativeImprovement)} 点変化
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-700">ポジティブ感情</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>前: {originalCategorized.positive.length > 0 
                            ? Math.round(originalCategorized.positive.reduce((sum, e) => sum + e.intensity, 0) / originalCategorized.positive.length * 10) / 10 
                            : 0} 点</div>
                          <div>後: {newCategorized.positive.length > 0 
                            ? Math.round(newCategorized.positive.reduce((sum, e) => sum + e.intensity, 0) / newCategorized.positive.length * 10) / 10 
                            : 0} 点</div>
                          <div className={`font-medium ${improvement.positiveIncrease > 0 ? 'text-green-600' : improvement.positiveIncrease < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {improvement.positiveIncrease > 0 ? '↑' : improvement.positiveIncrease < 0 ? '↓' : '→'} 
                            {Math.abs(improvement.positiveIncrease)} 点変化
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 総合改善度 */}
                  <div className="bg-white p-4 rounded-lg border border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="font-medium text-gray-700">総合改善度</h6>
                        <p className="text-sm text-gray-600">ネガティブ軽減 + ポジティブ増加</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          improvement.overallImprovement >= 1.5 ? 'text-green-600' : 
                          improvement.overallImprovement >= 0.5 ? 'text-blue-600' : 
                          improvement.overallImprovement >= -0.5 ? 'text-gray-600' : 'text-red-600'
                        }`}>
                          {improvement.overallImprovement > 0 ? '+' : ''}{improvement.overallImprovement}
                        </div>
                        <div className={`text-sm font-medium ${
                          improvement.overallImprovement >= 1.5 ? 'text-green-600' : 
                          improvement.overallImprovement >= 0.5 ? 'text-blue-600' : 
                          improvement.overallImprovement >= -0.5 ? 'text-gray-600' : 'text-red-600'
                        }`}>
                          {improvement.improvementDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
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
