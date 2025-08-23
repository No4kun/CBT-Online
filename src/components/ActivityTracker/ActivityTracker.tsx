import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Save, 
  BarChart3,
  Calendar,
  Smile,
  Target,
  Trash2,
  Info
} from 'lucide-react';
import type { ActivityEntry, ActivityRecord } from '../../types';
import { 
  getActivityColor, 
  getActivityColorClass,
  getActivityColorMeaning,
  calculateActivityStats,
  createDefaultActivityRecord
} from '../../utils/activityUtils';

interface ActivityTrackerProps {
  onSave: (record: ActivityRecord) => void;
  initialData?: ActivityRecord;
  isEditing?: boolean;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ 
  onSave, 
  initialData, 
  isEditing = false 
}) => {
  const [date, setDate] = useState(() => {
    if (initialData) return initialData.date;
    return new Date().toISOString().split('T')[0];
  });

  const [entries, setEntries] = useState<ActivityEntry[]>(() => {
    if (initialData) return initialData.entries;
    return createDefaultActivityRecord(date).entries;
  });

  const [showColorGuide, setShowColorGuide] = useState(false);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);

  // エントリーの更新
  const updateEntry = (entryId: string, field: keyof ActivityEntry, value: any) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, [field]: value, updatedAt: new Date() }
        : entry
    ));
  };

  // 30分単位のエントリー追加（改良版）
  const splitToHalfHour = (baseEntryId: string) => {
    const baseEntry = entries.find(e => e.id === baseEntryId);
    if (!baseEntry) return;

    const firstHalfEntry: ActivityEntry = {
      id: `${baseEntryId}-first`,
      timeSlot: baseEntry.timeSlot,
      activity: baseEntry.activity, // 元の活動をコピー
      pleasure: baseEntry.pleasure,
      achievement: baseEntry.achievement,
      isHalfHour: true,
      halfPosition: 'first',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const secondHalfEntry: ActivityEntry = {
      id: `${baseEntryId}-second`,
      timeSlot: baseEntry.timeSlot,
      activity: '', // 後半は空で開始
      pleasure: 5,
      achievement: 5,
      isHalfHour: true,
      halfPosition: 'second',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEntries(prev => {
      const index = prev.findIndex(e => e.id === baseEntryId);
      const newEntries = [...prev];
      // 元のエントリーを削除して、2つの半時間エントリーに置き換え
      newEntries.splice(index, 1, firstHalfEntry, secondHalfEntry);
      return newEntries;
    });
  };

  // 30分エントリーを統合して元に戻す
  const mergeHalfHourEntries = (baseId: string) => {
    const firstHalf = entries.find(e => e.id === `${baseId}-first`);
    const secondHalf = entries.find(e => e.id === `${baseId}-second`);
    if (!firstHalf || !secondHalf) return;

    const mergedEntry: ActivityEntry = {
      id: baseId,
      timeSlot: firstHalf.timeSlot,
      activity: firstHalf.activity || secondHalf.activity || '', // どちらかの活動を保持
      pleasure: Math.max(firstHalf.pleasure, secondHalf.pleasure), // より高い値を採用
      achievement: Math.max(firstHalf.achievement, secondHalf.achievement),
      createdAt: firstHalf.createdAt,
      updatedAt: new Date()
    };

    setEntries(prev => {
      const firstIndex = prev.findIndex(e => e.id === `${baseId}-first`);
      const secondIndex = prev.findIndex(e => e.id === `${baseId}-second`);
      if (firstIndex === -1 || secondIndex === -1) return prev;

      const newEntries = [...prev];
      // 2つの半時間エントリーを削除
      newEntries.splice(Math.max(firstIndex, secondIndex), 1);
      newEntries.splice(Math.min(firstIndex, secondIndex), 1, mergedEntry);
      return newEntries;
    });
  };

  // エントリーの削除
  const removeEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // 保存処理
  const handleSave = () => {
    const stats = calculateActivityStats(entries.filter(e => e.activity.trim() !== ''));
    const record: ActivityRecord = {
      id: initialData?.id || `record-${Date.now()}`,
      date,
      entries: entries.filter(e => e.activity.trim() !== ''),
      ...stats,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date()
    };
    onSave(record);
  };

  // 時間表示のフォーマット
  const formatTimeSlot = (timeSlot: string, isHalfHour?: boolean, halfPosition?: 'first' | 'second') => {
    if (!isHalfHour) return timeSlot;
    
    const [start] = timeSlot.split('-');
    const [startHour] = start.split(':');
    
    if (halfPosition === 'first') {
      return `${start}-${startHour}:30`;
    } else {
      return `${startHour}:30-${timeSlot.split('-')[1]}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? '活動記録を編集' : '活動記録をつける'}
              </h1>
              <p className="text-gray-600">日々の活動とその楽しさ・達成感を記録しましょう</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowColorGuide(!showColorGuide)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="h-4 w-4" />
            <span>色分けガイド</span>
          </button>
        </div>

        {/* 日付選択 */}
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 色分けガイド */}
      {showColorGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">色分けガイド</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { color: 'red', condition: 'P≥8 & A≥8' },
              { color: 'orange', condition: 'P≥8 & A≤7' },
              { color: 'yellow', condition: 'P≤7 & A≥8' },
              { color: 'blue', condition: 'P≤2 & A≥2' },
              { color: 'green', condition: 'P≥3 & A≤1' },
              { color: 'purple', condition: 'P≤2 & A≤1' },
              { color: 'black', condition: 'その他' }
            ].map(({ color, condition }) => (
              <div key={color} className={`p-3 rounded-lg border ${getActivityColorClass(color as any)}`}>
                <div className="text-sm font-medium">{condition}</div>
                <div className="text-xs mt-1">{getActivityColorMeaning(color as any)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 活動記録フォーム */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">活動記録</h2>
          <p className="text-sm text-gray-600">各時間帯の活動と、楽しさ（P）・達成感（A）を10点満点で記録してください</p>
        </div>

        <div className="p-6 space-y-4">
          {entries.map((entry) => {
            const color = entry.activity ? getActivityColor(entry.pleasure, entry.achievement) : 'black';
            const isActive = activeEntry === entry.id;
            const isFirstOfPair = entry.isHalfHour && entry.halfPosition === 'first';
            const isSecondOfPair = entry.isHalfHour && entry.halfPosition === 'second';
            
            return (
              <motion.div
                key={entry.id}
                layout
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isActive ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'
                } ${entry.activity ? getActivityColorClass(color) : ''} ${
                  isFirstOfPair ? 'border-b-0 rounded-b-none' : ''
                } ${
                  isSecondOfPair ? 'border-t-0 rounded-t-none' : ''
                } ${
                  entry.isHalfHour ? 'ml-4 border-l-4 border-l-blue-300' : ''
                }`}
                onClick={() => setActiveEntry(isActive ? null : entry.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">
                      {formatTimeSlot(entry.timeSlot, entry.isHalfHour, entry.halfPosition)}
                    </span>
                    {entry.isHalfHour && (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        entry.halfPosition === 'first' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {entry.halfPosition === 'first' ? '前半30分' : '後半30分'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!entry.isHalfHour && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          splitToHalfHour(entry.id);
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors"
                        title="30分単位に分割"
                      >
                        30分分割
                      </button>
                    )}
                    
                    {entry.isHalfHour && (
                      <div className="flex items-center space-x-2">
                        {entry.halfPosition === 'first' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const baseId = entry.id.replace(/-first|-second$/, '');
                              mergeHalfHourEntries(baseId);
                            }}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                            title="統合して元に戻す"
                          >
                            統合
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntry(entry.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="この30分を削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 活動内容入力 */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="活動内容を入力してください"
                    value={entry.activity}
                    onChange={(e) => updateEntry(entry.id, 'activity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* P・A値入力 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Smile className="h-4 w-4" />
                      <span>楽しさ (P): {entry.pleasure}/10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={entry.pleasure}
                      onChange={(e) => updateEntry(entry.id, 'pleasure', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Target className="h-4 w-4" />
                      <span>達成感 (A): {entry.achievement}/10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={entry.achievement}
                      onChange={(e) => updateEntry(entry.id, 'achievement', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {entry.activity && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      分類: <span className="font-medium">{getActivityColorMeaning(color)}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Save className="h-5 w-5" />
          <span>{isEditing ? '更新' : '保存'}</span>
        </button>
      </div>
    </div>
  );
};

export default ActivityTracker;
