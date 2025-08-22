import React, { useState } from 'react';
import { Calendar, Clock, Heart, Plus, X } from 'lucide-react';
import { EmotionEntry } from '../../types';
import { getEmotionColor } from '../../utils/emotionClassification';

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
  const [newEmotionInput, setNewEmotionInput] = useState('');

  const predefinedEmotions = [
    '喜び', '悲しみ', '怒り', '不安', '恐怖', '驚き', 
    '嫌悪', '恥', '罪悪感', '落胆', 'イライラ', '焦り'
  ];

  console.log('SituationSection rendered with data:', data);

  // 状況の変更処理
  const handleSituationChange = (value: string) => {
    console.log('Updating situation:', value);
    const newData = {
      ...data,
      situation: value
    };
    onChange(newData);
  };

  // 日付の変更処理
  const handleDateChange = (value: string) => {
    console.log('Updating date:', value);
    const newData = {
      ...data,
      date: value
    };
    onChange(newData);
  };

  // 時刻の変更処理
  const handleTimeChange = (value: string) => {
    console.log('Updating time:', value);
    const newData = {
      ...data,
      time: value
    };
    onChange(newData);
  };

  // 感情追加処理
  const addEmotion = (emotionName: string) => {
    console.log('Adding emotion:', emotionName);
    
    const trimmedName = emotionName.trim();
    if (!trimmedName) {
      console.log('Empty emotion name, not adding');
      return;
    }
    
    // 重複チェック
    const exists = data.emotions.some(e => e.emotion === trimmedName);
    if (exists) {
      console.log('Emotion already exists:', trimmedName);
      return;
    }

    const newEmotion: EmotionEntry = {
      emotion: trimmedName,
      intensity: 5
    };

    const newData = {
      ...data,
      emotions: [...data.emotions, newEmotion]
    };
    
    console.log('Updated emotions:', newData.emotions);
    onChange(newData);
    setNewEmotionInput('');
  };

  // 感情削除処理
  const removeEmotion = (index: number) => {
    console.log('Removing emotion at index:', index);
    const newEmotions = data.emotions.filter((_, i) => i !== index);
    const newData = {
      ...data,
      emotions: newEmotions
    };
    onChange(newData);
  };

  // 感情強度更新処理
  const updateEmotionIntensity = (index: number, intensity: number) => {
    console.log('Updating emotion intensity:', index, intensity);
    const newEmotions = [...data.emotions];
    newEmotions[index] = { ...newEmotions[index], intensity };
    const newData = {
      ...data,
      emotions: newEmotions
    };
    onChange(newData);
  };

  // キーダウンハンドラー
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Enter pressed with input:', newEmotionInput);
      addEmotion(newEmotionInput);
    }
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
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            時刻
          </label>
          <input
            type="time"
            value={data.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          onChange={(e) => handleSituationChange(e.target.value)}
          placeholder="どのような状況でしたか？何が起こりましたか？"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <div className="text-xs text-gray-500 mt-1">
          現在の文字数: {data.situation.length}
        </div>
      </div>

      {/* 感情選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          感情
        </label>
        
        {/* 定義済み感情ボタン */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {predefinedEmotions.map((emotion) => {
            const isAlreadyAdded = data.emotions.some(e => e.emotion === emotion);
            return (
              <button
                key={emotion}
                onClick={() => {
                  console.log('Predefined emotion clicked:', emotion);
                  addEmotion(emotion);
                }}
                disabled={isAlreadyAdded}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isAlreadyAdded
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
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
            onChange={(e) => {
              console.log('Emotion input change:', e.target.value);
              setNewEmotionInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="その他の感情を入力..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => {
              console.log('Add button clicked with input:', newEmotionInput);
              addEmotion(newEmotionInput);
            }}
            disabled={!newEmotionInput.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            追加
          </button>
        </div>
      </div>

      {/* 追加された感情と強度設定 */}
      <div className="space-y-4">
        {data.emotions.length > 0 && (
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            追加された感情 ({data.emotions.length}個)
          </h3>
        )}
        
        {data.emotions.map((emotion, index) => (
          <div
            key={`${emotion.emotion}-${index}`}
            className={`p-4 rounded-lg border ${getEmotionColor(emotion.emotion)}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">{emotion.emotion}</h4>
              <button
                onClick={() => removeEmotion(index)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">強度 (1-10)</span>
                <span className="text-sm font-medium text-blue-600">{emotion.intensity}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={emotion.intensity}
                onChange={(e) => updateEmotionIntensity(index, parseInt(e.target.value))}
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
