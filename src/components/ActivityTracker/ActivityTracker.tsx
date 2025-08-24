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
  Info,
  EyeOff,
  Eye
} from 'lucide-react';
import type { ActivityEntry, ActivityRecord } from '../../types';
import { 
  generateTimeSlots,
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
    if (initialData) {
      // 編集モードの場合、6:00-26:00の範囲のエントリーのみを保持
      const allTimeSlots = generateTimeSlots();
      
      // 既存のエントリーから6:00-26:00の範囲内のもののみをフィルタリング
      const validExistingEntries = initialData.entries
        .filter(entry => allTimeSlots.includes(entry.timeSlot))
        .map(entry => ({
          ...entry,
          excludeFromStats: entry.excludeFromStats ?? false
        }));
      const existingTimeSlots = validExistingEntries.map(e => e.timeSlot);
      
      // 不足している時間スロットを追加
      const missingSlots = allTimeSlots.filter(slot => !existingTimeSlots.includes(slot));
      const missingEntries: ActivityEntry[] = missingSlots.map((slot, index) => ({
        id: `missing-${index}`,
        timeSlot: slot,
        activity: '',
        pleasure: 5,
        achievement: 5,
        excludeFromStats: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // 既存のエントリーと不足分を合わせて時間順にソート
      const allEntries = [...validExistingEntries, ...missingEntries];
      return allEntries.sort((a, b) => {
        // 時間スロットの開始時刻を取得（例："06:00-07:00" -> "06:00"）
        const timeA = a.timeSlot.split('-')[0];
        const timeB = b.timeSlot.split('-')[0];
        
        // 時間を数値に変換してソート（6:00から始まる）
        const hourA = parseInt(timeA.split(':')[0]);
        const hourB = parseInt(timeB.split(':')[0]);
        
        // 6時未満の時間（00:00-05:59）は翌日として扱う（26時以降相当）
        const normalizedHourA = hourA < 6 ? hourA + 24 : hourA;
        const normalizedHourB = hourB < 6 ? hourB + 24 : hourB;
        
        return normalizedHourA - normalizedHourB;
      });
    }
    // 新規作成の場合、全ての時間スロットを含むデフォルト記録を作成
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
      excludeFromStats: baseEntry.excludeFromStats || false,
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
      excludeFromStats: false, // デフォルトは統計に含む
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

  // エントリー全体を削除（時間スロット自体を削除）
  const removeTimeSlot = (entryId: string) => {
    if (window.confirm('この時間スロットを削除しますか？')) {
      removeEntry(entryId);
    }
  };

  // 保存処理
  const handleSave = () => {
    // 活動が記入されており、統計から除外されていないエントリーのみで統計を計算
    const validEntries = entries.filter(e => e.activity.trim() !== '' && !e.excludeFromStats);
    const stats = calculateActivityStats(validEntries);
    
    const record: ActivityRecord = {
      id: initialData?.id || `record-${Date.now()}`,
      date,
      entries: entries, // すべてのエントリーを保存（未記入・除外設定も含む）
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">色分けガイド（P+A合計点）</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { color: 'red', range: '16〜20点', label: '非常にポジティブ' },
              { color: 'orange', range: '11〜15点', label: 'ポジティブ' },
              { color: 'yellow', range: '6〜10点', label: 'ニュートラル' },
              { color: 'blue', range: '3〜5点', label: 'ややネガティブ' },
              { color: 'purple', range: '0〜2点', label: '非常にネガティブ' }
            ].map(({ color, range, label }) => (
              <div key={color} className={`p-3 rounded-lg border ${getActivityColorClass(color as any)}`}>
                <div className="text-sm font-medium">{range}</div>
                <div className="text-xs mt-1">{label}</div>
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
            // 統計除外時は色分類をしない
            const color = entry.activity && !entry.excludeFromStats ? 
              getActivityColor(entry.pleasure, entry.achievement) : null;
            const isActive = activeEntry === entry.id;
            const isFirstOfPair = entry.isHalfHour && entry.halfPosition === 'first';
            const isSecondOfPair = entry.isHalfHour && entry.halfPosition === 'second';
            
            return (
              <motion.div
                key={entry.id}
                layout
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isActive ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'
                } ${color ? getActivityColorClass(color) : 'bg-gray-50'} ${
                  entry.excludeFromStats ? 'opacity-75' : ''
                } ${
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
                      <>
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
                        {isEditing && entry.activity.trim() === '' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTimeSlot(entry.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="この時間スロットを削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
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
                        {/* 空の時間スロットの場合のみ削除ボタンを表示 */}
                        {entry.activity.trim() === '' && (
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
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 活動内容入力 */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="活動内容を入力してください（未記入でも保存されます）"
                    value={entry.activity}
                    onChange={(e) => updateEntry(entry.id, 'activity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* 統計除外設定 */}
                <div className="mb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateEntry(entry.id, 'excludeFromStats', !entry.excludeFromStats);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                      entry.excludeFromStats 
                        ? 'bg-gray-100 border-gray-300 text-gray-700' 
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}
                    title={entry.excludeFromStats ? '統計に含める' : '統計から除外する（睡眠等の意識的でない行動用）'}
                  >
                    {entry.excludeFromStats ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span className="text-sm">統計に含める</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">統計から除外する</span>
                      </>
                    )}
                  </button>
                  {entry.excludeFromStats && (
                    <p className="text-xs text-gray-500 mt-1">
                      楽しさ・達成感の値は統計計算に含まれません
                    </p>
                  )}
                </div>

                {/* P・A値入力 */}
                <div className={`grid grid-cols-2 gap-4 ${entry.excludeFromStats ? 'opacity-50' : ''}`}>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Smile className="h-4 w-4" />
                      <span>楽しさ (P): {entry.pleasure}/10</span>
                      {entry.excludeFromStats && <span className="text-xs text-gray-400">(除外中)</span>}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={entry.pleasure}
                      onChange={(e) => updateEntry(entry.id, 'pleasure', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                      disabled={entry.excludeFromStats}
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
                      {entry.excludeFromStats && <span className="text-xs text-gray-400">(除外中)</span>}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={entry.achievement}
                      onChange={(e) => updateEntry(entry.id, 'achievement', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                      disabled={entry.excludeFromStats}
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
                      {color ? (
                        <>
                          分類: <span className="font-medium">{getActivityColorMeaning(color)}</span>
                          <span className="ml-2 text-gray-500">
                            (P+A: {entry.pleasure + entry.achievement}点)
                          </span>
                        </>
                      ) : entry.excludeFromStats ? (
                        <span className="text-gray-500 italic">統計から除外されています</span>
                      ) : (
                        <span className="text-gray-500">活動未記入</span>
                      )}
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
