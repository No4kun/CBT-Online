import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Heart, Plus, X } from 'lucide-react';
import { SituationSection as SituationData, ColumnEntry, EmotionEntry } from '../../types';

interface SituationSectionProps {
  data: SituationData;
  onUpdate: (updates: Partial<ColumnEntry>) => void;
}

const SituationSection: React.FC<SituationSectionProps> = ({ data, onUpdate }) => {
  const [newEmotionInput, setNewEmotionInput] = useState('');

  const emotionSuggestions = [
    '不安', '悲しみ', '怒り', '恐怖', '焦り', '落ち込み',
    '孤独感', '罪悪感', '恥ずかしさ', '無力感', '絶望感', '混乱'
  ];

  const addEmotion = (emotionText: string) => {
    if (!emotionText.trim()) return;
    
    const existingEmotion = data.emotions.find(e => e.emotion === emotionText.trim());
    if (existingEmotion) return;
    
    const newEmotion: EmotionEntry = {
      emotion: emotionText.trim(),
      intensity: 5
    };
    
    const updatedEmotions = [...data.emotions, newEmotion];
    onUpdate({ emotions: updatedEmotions });
    setNewEmotionInput('');
  };

  const removeEmotion = (emotionToRemove: string) => {
    const updatedEmotions = data.emotions.filter(e => e.emotion !== emotionToRemove);
    onUpdate({ emotions: updatedEmotions });
  };

  const updateEmotionIntensity = (emotion: string, intensity: number) => {
    const updatedEmotions = data.emotions.map(e => 
      e.emotion === emotion ? { ...e, intensity } : e
    );
    onUpdate({ emotions: updatedEmotions });
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 2) return '非常に弱い';
    if (intensity <= 4) return 'やや弱い';
    if (intensity <= 6) return '普通';
    if (intensity <= 8) return 'やや強い';
    return '非常に強い';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'from-green-400 to-green-500';
    if (intensity <= 5) return 'from-yellow-400 to-yellow-500';
    if (intensity <= 7) return 'from-orange-400 to-orange-500';
    return 'from-orange-400 to-orange-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* 日時 */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <Calendar className="h-5 w-5 text-primary-500" />
          <span>日時</span>
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="datetime-local"
          value={data.dateTime}
          onChange={(e) => onUpdate({ dateTime: e.target.value })}
          className="form-input text-lg"
        />
      </div>

      {/* 状況 */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <MapPin className="h-5 w-5 text-primary-500" />
          <span>状況</span>
        </label>
        <p className="text-sm text-calm-600 mb-2">
          いつ、どこで、何が起こったかを具体的に記入してください
        </p>
        <motion.textarea
          whileFocus={{ scale: 1.01 }}
          value={data.situation}
          onChange={(e) => onUpdate({ situation: e.target.value })}
          placeholder="例：会議で発表をしているとき、上司から厳しい質問をされた"
          rows={4}
          className="form-textarea text-lg"
        />
      </div>

      {/* 感情 */}
      <div className="space-y-4">
        <label className="flex items-center space-x-2 text-lg font-medium text-calm-800">
          <Heart className="h-5 w-5 text-orange-500" />
          <span>感情とその強さ</span>
        </label>
        <p className="text-sm text-calm-600">
          その時に感じた感情を追加し、それぞれの強さを設定してください
        </p>

        {/* 既存の感情リスト */}
        <AnimatePresence>
          {data.emotions.map((emotionEntry, index) => (
            <motion.div
              key={emotionEntry.emotion}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card p-4 space-y-4 border-l-4 border-orange-300"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-calm-800 flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  <span>{emotionEntry.emotion}</span>
                </h4>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeEmotion(emotionEntry.emotion)}
                  className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-calm-600">
                  <span>強さ: 0（全く感じない）- 10（非常に強い）</span>
                  <motion.span
                    key={emotionEntry.intensity}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`px-3 py-1 rounded-full text-white font-medium bg-gradient-to-r ${getIntensityColor(emotionEntry.intensity)}`}
                  >
                    {emotionEntry.intensity} - {getIntensityLabel(emotionEntry.intensity)}
                  </motion.span>
                </div>
                
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="range"
                  min="0"
                  max="10"
                  value={emotionEntry.intensity}
                  onChange={(e) => updateEmotionIntensity(emotionEntry.emotion, parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-orange-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #bbf7d0 0%, 
                      #fef3c7 30%,
                      #fed7aa 50%, 
                      #fecaca 70%,
                      #f87171 100%)`
                  }}
                />
                
                <div className="flex justify-between text-xs text-calm-500">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 新しい感情を追加 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={newEmotionInput}
              onChange={(e) => setNewEmotionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEmotion(newEmotionInput)}
              placeholder="新しい感情を入力..."
              className="form-input flex-1"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addEmotion(newEmotionInput)}
              className="btn-primary flex items-center space-x-2 px-4"
            >
              <Plus className="h-4 w-4" />
              <span>追加</span>
            </motion.button>
          </div>

          {/* 感情の候補 */}
          <div className="space-y-2">
            <p className="text-sm text-calm-600">候補から選択:</p>
            <div className="flex flex-wrap gap-2">
              {emotionSuggestions.map((emotion) => {
                const isAlreadyAdded = data.emotions.some(e => e.emotion === emotion);
                return (
                  <motion.button
                    key={emotion}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addEmotion(emotion)}
                    disabled={isAlreadyAdded}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      isAlreadyAdded
                        ? 'bg-calm-100 text-calm-400 cursor-not-allowed'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    {emotion}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 感情が未入力の場合のメッセージ */}
        {data.emotions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-calm-50 rounded-xl border border-calm-200"
          >
            <Heart className="h-8 w-8 text-calm-400 mx-auto mb-2" />
            <p className="text-calm-600">まだ感情が追加されていません</p>
            <p className="text-sm text-calm-500 mt-1">上記の候補から選択するか、直接入力してください</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SituationSection;
