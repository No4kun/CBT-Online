import React, { useState } from 'react';
import { Calendar, Heart, Plus, X } from 'lucide-react';
import TimePicker from '../ui/TimePicker';

interface EmotionEntry {
  id: string;
  name: string;
  intensity: number;
}

interface SituationData {
  situation: string;
  date: string;
  time: string;
  emotions: EmotionEntry[];
}

interface SituationSectionProps {
  data: SituationData;
  onUpdate: (data: SituationData) => void;
}

const SituationSection: React.FC<SituationSectionProps> = ({ data, onUpdate }) => {
  const [newEmotion, setNewEmotion] = useState('');

  const predefinedEmotions = [
    '喜び', '悲しみ', '怒り', '不安', '恐怖', '驚き', 
    '嫌悪', '恥', '罪悪感', '落胆', 'イライラ', '焦り'
  ];

  // 状況の変更処理（シンプルな実装）
  const updateSituation = (value: string) => {
    onUpdate({
      ...data,
      situation: value
    });
  };

  // 日付の変更処理
  const updateDate = (value: string) => {
    onUpdate({
      ...data,
      date: value
    });
  };

  // 時刻の変更処理
  const updateTime = (value: string) => {
    onUpdate({
      ...data,
      time: value
    });
  };

  // 感情追加処理（シンプルで確実な実装）
  const addEmotion = (emotionName: string) => {
    const trimmedName = emotionName.trim();
    if (!trimmedName) return;
    
    // 重複チェック
    const exists = data.emotions.some(e => e.name === trimmedName);
    if (exists) return;

    const newEmotionEntry: EmotionEntry = {
      id: `emotion_${Date.now()}_${Math.random()}`,
      name: trimmedName,
      intensity: 50
    };

    onUpdate({
      ...data,
      emotions: [...data.emotions, newEmotionEntry]
    });
    
    setNewEmotion('');
  };

  // 感情削除処理
  const removeEmotion = (id: string) => {
    onUpdate({
      ...data,
      emotions: data.emotions.filter(e => e.id !== id)
    });
  };

  // 感情強度更新処理
  const updateEmotionIntensity = (id: string, intensity: number) => {
    onUpdate({
      ...data,
      emotions: data.emotions.map(e => 
        e.id === id ? { ...e, intensity } : e
      )
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        状況と感情
      </h2>

      {/* 日付と時刻 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            日付
          </label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => updateDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            時刻
          </label>
          <TimePicker
            value={data.time}
            onChange={updateTime}
            className="w-full"
          />
        </div>
      </div>

      {/* 状況・出来事 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          状況・出来事
        </label>
        <textarea
          value={data.situation}
          onChange={(e) => updateSituation(e.target.value)}
          placeholder="どのような状況でしたか？何が起こりましたか？"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* 感情選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          感情
        </label>
        
        {/* 定義済み感情ボタン */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {predefinedEmotions.map((emotion) => (
            <button
              key={emotion}
              onClick={() => addEmotion(emotion)}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {emotion}
            </button>
          ))}
        </div>

        {/* カスタム感情入力 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newEmotion}
            onChange={(e) => setNewEmotion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEmotion(newEmotion);
              }
            }}
            placeholder="その他の感情を入力..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => addEmotion(newEmotion)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            追加
          </button>
        </div>
      </div>

      {/* 追加された感情と強度設定 */}
      <div className="space-y-4">
        {data.emotions.map((emotion) => (
          <div
            key={emotion.id}
            className="bg-gray-50 p-4 rounded-lg border"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">{emotion.name}</h4>
              <button
                onClick={() => removeEmotion(emotion.id)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">強度</span>
                <span className="text-sm font-medium text-blue-600">{emotion.intensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emotion.intensity}
                onChange={(e) => updateEmotionIntensity(emotion.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>弱い</span>
                <span>強い</span>
              </div>
            </div>
          </div>
        ))}

        {/* 感情未追加時のメッセージ */}
        {data.emotions.length === 0 && (
          <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">まだ感情が追加されていません</p>
            <p className="text-sm text-gray-500 mt-1">上記の候補から選択するか、直接入力してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SituationSection;
