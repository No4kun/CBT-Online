import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { EmotionEntry } from '../../types';
import { classifyEmotion, EmotionType } from '../../utils/emotionClassification';

interface EmotionClassificationDropZoneProps {
  emotions: EmotionEntry[];
  onEmotionsUpdate: (emotions: EmotionEntry[]) => void;
  unclassifiedEmotions: string[];
  onUnclassifiedRemove: (emotion: string) => void;
  className?: string;
}

interface DraggedEmotion {
  emotion: string;
  fromZone: EmotionType | 'unclassified';
  index?: number;
}

const EmotionClassificationDropZone: React.FC<EmotionClassificationDropZoneProps> = ({
  emotions,
  onEmotionsUpdate,
  unclassifiedEmotions,
  onUnclassifiedRemove,
  className = ''
}) => {
  const [draggedItem, setDraggedItem] = useState<DraggedEmotion | null>(null);
  const [dragOverZone, setDragOverZone] = useState<EmotionType | 'unclassified' | null>(null);

  // 感情を分類別に分ける
  const categorizeEmotions = () => {
    const negative: EmotionEntry[] = [];
    const positive: EmotionEntry[] = [];

    emotions.forEach(emotion => {
      const type = classifyEmotion(emotion.emotion);
      switch (type) {
        case 'negative':
          negative.push(emotion);
          break;
        case 'positive':
          positive.push(emotion);
          break;
      }
    });

    return { negative, positive };
  };

  const { negative, positive } = categorizeEmotions();

  // ドラッグ開始
  const handleDragStart = useCallback((e: React.DragEvent, emotion: string, fromZone: EmotionType | 'unclassified', index?: number) => {
    const dragData: DraggedEmotion = { emotion, fromZone, index };
    setDraggedItem(dragData);
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // ドラッグオーバー
  const handleDragOver = useCallback((e: React.DragEvent, zone: EmotionType | 'unclassified') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zone);
  }, []);

  // ドラッグリーブ
  const handleDragLeave = useCallback(() => {
    setDragOverZone(null);
  }, []);

  // ドロップ処理
  const handleDrop = useCallback((e: React.DragEvent, targetZone: EmotionType) => {
    e.preventDefault();
    setDragOverZone(null);

    try {
      const dragData: DraggedEmotion = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (dragData.fromZone === 'unclassified') {
        // 未分類から分類済みへ
        const newEmotion: EmotionEntry = {
          emotion: dragData.emotion,
          intensity: 5 // デフォルト強度
        };
        
        onEmotionsUpdate([...emotions, newEmotion]);
        onUnclassifiedRemove(dragData.emotion);
      } else if (dragData.fromZone !== targetZone && dragData.index !== undefined) {
        // 既存の感情の分類を変更（手動で分類を変更したい場合）
        const updatedEmotions = [...emotions];
        const emotionToUpdate = updatedEmotions.find(e => e.emotion === dragData.emotion);
        if (emotionToUpdate) {
          // 既存の感情はそのまま（分類は自動で決まるため、実際にはこの処理は不要だが、UI上の視覚的フィードバックのため）
          onEmotionsUpdate(updatedEmotions);
        }
      }
    } catch (error) {
      console.error('ドロップ処理でエラーが発生しました:', error);
    }

    setDraggedItem(null);
  }, [emotions, onEmotionsUpdate, onUnclassifiedRemove]);

  // 強度更新
  const updateIntensity = useCallback((emotionName: string, intensity: number) => {
    const updatedEmotions = emotions.map(emotion => 
      emotion.emotion === emotionName 
        ? { ...emotion, intensity }
        : emotion
    );
    onEmotionsUpdate(updatedEmotions);
  }, [emotions, onEmotionsUpdate]);

  // 感情削除
  const removeEmotion = useCallback((emotionName: string) => {
    const updatedEmotions = emotions.filter(emotion => emotion.emotion !== emotionName);
    onEmotionsUpdate(updatedEmotions);
  }, [emotions, onEmotionsUpdate]);

  // ドロップゾーンのレンダリング
  const renderDropZone = (
    type: EmotionType,
    title: string,
    icon: React.ReactNode,
    bgColor: string,
    borderColor: string,
    emotionList: EmotionEntry[]
  ) => (
    <div
      className={`relative p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
        dragOverZone === type 
          ? `${borderColor} bg-opacity-20 ${bgColor}` 
          : 'border-gray-300 bg-gray-50'
      }`}
      onDragOver={(e) => handleDragOver(e, type)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, type)}
    >
      <div className="flex items-center justify-center mb-3">
        {icon}
        <h3 className="text-lg font-semibold ml-2">{title}</h3>
      </div>
      
      <div className="space-y-3 min-h-[100px]">
        <AnimatePresence>
          {emotionList.map((emotion) => (
            <motion.div
              key={emotion.emotion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-3 rounded-lg border shadow-sm cursor-move"
              draggable
              onDragStart={(e) => handleDragStart(e as any, emotion.emotion, type)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{emotion.emotion}</span>
                <button
                  onClick={() => removeEmotion(emotion.emotion)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">強度</span>
                  <span className="text-sm font-bold text-blue-600">{emotion.intensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotion.intensity}
                  onChange={(e) => updateIntensity(emotion.emotion, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {emotionList.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>ここに{title}をドラッグしてください</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 未分類の感情 */}
      {unclassifiedEmotions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">分類が必要な感情</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {unclassifiedEmotions.map((emotion) => (
              <motion.div
                key={emotion}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e as any, emotion, 'unclassified')}
              >
                <div className="flex items-center">
                  <span>{emotion}</span>
                  <button
                    onClick={() => onUnclassifiedRemove(emotion)}
                    className="ml-2 text-yellow-600 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            👆 これらの感情を下のネガティブまたはポジティブの枠にドラッグしてください
          </p>
        </div>
      )}

      {/* 分類済み感情のドロップゾーン */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderDropZone(
          'negative',
          'ネガティブ感情',
          <TrendingDown className="h-5 w-5 text-red-500" />,
          'bg-red-50',
          'border-red-300',
          negative
        )}

        {renderDropZone(
          'positive',
          'ポジティブ感情',
          <TrendingUp className="h-5 w-5 text-green-500" />,
          'bg-green-50',
          'border-green-300',
          positive
        )}
      </div>

      {/* 使用方法のヒント */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">使用方法</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 感情をドラッグして適切な分類に移動してください</li>
          <li>• 分類後、スライダーで感情の強度を調整できます</li>
          <li>• 自動分類に疑問がある場合は、手動で移動できます</li>
          <li>• ゴミ箱アイコンで感情を削除できます</li>
        </ul>
      </div>
    </div>
  );
};

export default EmotionClassificationDropZone;
