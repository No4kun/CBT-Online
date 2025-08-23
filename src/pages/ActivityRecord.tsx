import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Calendar as CalendarIcon } from 'lucide-react';
import ActivityTracker from '../components/ActivityTracker/ActivityTracker';
import type { ActivityRecord } from '../types';

const ActivityRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);

  // ローカルストレージからデータ読み込み
  useEffect(() => {
    const savedRecords = localStorage.getItem('activityRecords');
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords).map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          entries: record.entries.map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt)
          }))
        }));
        setRecords(parsedRecords);
      } catch (error) {
        console.error('活動記録データの読み込みに失敗しました:', error);
      }
    }
  }, []);

  // ローカルストレージにデータ保存
  const saveToLocalStorage = (updatedRecords: ActivityRecord[]) => {
    localStorage.setItem('activityRecords', JSON.stringify(updatedRecords));
  };

  // 記録の保存
  const handleSave = (record: ActivityRecord) => {
    const updatedRecords = editingRecord
      ? records.map(r => r.id === record.id ? record : r)
      : [...records, record];
    
    setRecords(updatedRecords);
    saveToLocalStorage(updatedRecords);
    setShowForm(false);
    setEditingRecord(null);
  };

  // 新規記録作成
  const handleNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  // 記録編集
  const handleEditRecord = (record: ActivityRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  // 記録削除
  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('この記録を削除しますか？')) {
      const updatedRecords = records.filter(r => r.id !== recordId);
      setRecords(updatedRecords);
      saveToLocalStorage(updatedRecords);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingRecord(null);
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>記録一覧に戻る</span>
          </button>
          
          <ActivityTracker
            onSave={handleSave}
            initialData={editingRecord || undefined}
            isEditing={!!editingRecord}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">活動記録</h1>
                <p className="text-gray-600">日々の活動とその楽しさ・達成感を記録しましょう</p>
              </div>
            </div>
            
            <button
              onClick={handleNewRecord}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>新しい記録</span>
            </button>
          </div>
        </div>

        {/* 記録一覧 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">まだ記録がありません</h3>
              <p className="text-gray-600 mb-6">最初の活動記録を作成してみましょう</p>
              <button
                onClick={handleNewRecord}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                新しい記録を作成
              </button>
            </div>
          ) : (
            records
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditRecord(record)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-lg">
                        {new Date(record.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        記録数: {record.entries.length}件
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(record.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">平均楽しさ</div>
                      <div className="text-lg font-bold text-blue-700">
                        {record.averagePleasure}/10
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-green-600 font-medium">平均達成感</div>
                      <div className="text-lg font-bold text-green-700">
                        {record.averageAchievement}/10
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium">総楽しさ</div>
                      <div className="text-lg font-bold text-purple-700">
                        {record.totalPleasure}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium">総達成感</div>
                      <div className="text-lg font-bold text-orange-700">
                        {record.totalAchievement}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    最終更新: {new Date(record.updatedAt).toLocaleString('ja-JP')}
                  </div>
                </motion.div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityRecordPage;
