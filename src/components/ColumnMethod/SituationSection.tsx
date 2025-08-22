import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Trash2, Heart, Plus } from 'lucide-react';
import { EmotionEntry } from '../../types';

interface SituationSectionProps {
  data: {
    date: string;
    time: string;
    situation: string;
    emotions: EmotionEntry[];
  };
  onChange: (data: {
    date: string;
    time: string;
    situation: string;
    emotions: EmotionEntry[];
  }) => void;
}

const SituationSection: React.FC<SituationSectionProps> = ({ data, onChange }) => {
  const [newEmotion, setNewEmotion] = useState('');

  const emotionSuggestions = [
    '不安', '怒り', '悲しみ', '恐怖', '混乱', 
    '落胆', 'イライラ', '焦り', '孤独', '嫉妬'
  ];

  const addEmotion = (emotion: string) => {
    if (emotion.trim() && !data.emotions.some(e => e.emotion === emotion)) {
      const newEmotionEntry: EmotionEntry = {
        emotion: emotion.trim(),
        intensity: 5 // デフォルト値は5
      };
      onChange({
        ...data,
        emotions: [...data.emotions, newEmotionEntry]
      });
      setNewEmotion('');
    }
  };

  const removeEmotion = (index: number) => {
    const newEmotions = data.emotions.filter((_, i) => i !== index);
    onChange({
      ...data,
      emotions: newEmotions
    });
  };

  const updateEmotionIntensity = (index: number, intensity: number) => {
    const newEmotions = [...data.emotions];
    newEmotions[index] = { ...newEmotions[index], intensity };
    onChange({
      ...data,
      emotions: newEmotions
    });
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return 'from-green-400 to-green-500';
    if (intensity <= 4) return 'from-yellow-400 to-yellow-500';
    if (intensity <= 6) return 'from-orange-400 to-orange-500';
    if (intensity <= 8) return 'from-red-400 to-red-500';
    return 'from-red-600 to-red-700';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 2) return '軽い';
    if (intensity <= 4) return 'やや軽い';
    if (intensity <= 6) return '中程度';
    if (intensity <= 8) return 'やや強い';
    return '非常に強い';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-calm-100"
    >
      <h2 className="text-2xl font-bold text-calm-800 mb-6 flex items-center">
        <Calendar className="h-6 w-6 mr-2" />
        状況の記録
      </h2>

      <div className="space-y-6">
        {/* 日時入力 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-calm-700 mb-2">
              日付
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => onChange({ ...data, date: e.target.value })}
              className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-calm-700 mb-2">
              時刻
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
              <input
                type="time"
                value={data.time}
                onChange={(e) => onChange({ ...data, time: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-calm-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* 状況入力 */}
        <div>
          <label className="block text-sm font-medium text-calm-700 mb-2">
            状況・出来事
          </label>
          <textarea
            value={data.situation}
            onChange={(e) => onChange({ ...data, situation: e.target.value })}
            placeholder="何が起こりましたか？具体的に記録してください..."
            rows={4}
            className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* 感情入力 */}
        <div>
          <label className="block text-sm font-medium text-calm-700 mb-4">
            感情
          </label>
          
          {/* 既に追加された感情一覧 */}
          <AnimatePresence>
            {data.emotions.map((emotionEntry, index) => (
              <motion.div
                key={`${emotionEntry.emotion}-${index}`}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-800">{emotionEntry.emotion}</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeEmotion(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">強さ:</span>
                    <span className={`px-2 py-1 rounded-lg text-white bg-gradient-to-r ${getIntensityColor(emotionEntry.intensity)}`}>
                      {emotionEntry.intensity}/10 ({getIntensityLabel(emotionEntry.intensity)})
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={emotionEntry.intensity}
                      onChange={(e) => updateEmotionIntensity(index, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (軽い)</span>
                      <span>5 (中程度)</span>
                      <span>10 (非常に強い)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 新しい感情の入力 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmotion}
                onChange={(e) => setNewEmotion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addEmotion(newEmotion);
                  }
                }}
                placeholder="感情を入力..."
                className="flex-1 px-4 py-3 border border-calm-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addEmotion(newEmotion)}
                disabled={!newEmotion.trim()}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                <Plus className="h-4 w-4" />
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
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {emotion}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

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
      </div>
    </motion.div>
  );
};

export default SituationSection;
