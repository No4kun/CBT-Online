import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Calendar as CalendarIcon,
  Shield,
  Brain,
  Smile,
  Trophy
} from 'lucide-react';
import ActivityTracker from '../components/ActivityTracker/ActivityTracker';
import type { ActivityRecord } from '../types';

const ActivityRecordPage: React.FC = () => {
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('activityRecords');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  };

  const saveToLocalStorage = (recordsToSave: ActivityRecord[]) => {
    try {
      localStorage.setItem('activityRecords', JSON.stringify(recordsToSave));
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
    }
  };

  const handleSave = (newRecord: ActivityRecord) => {
    let updatedRecords;
    
    if (editingRecord) {
      // 編集の場合
      updatedRecords = records.map(r => r.id === editingRecord.id ? newRecord : r);
    } else {
      // 新規作成の場合
      updatedRecords = [...records, newRecord];
    }
    
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ページヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">活動記録</h1>
          <p className="text-gray-600">日々の活動とその楽しさ・達成感を記録しましょう</p>
        </motion.div>
        
        {/* コントロールボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <button
              onClick={handleNewRecord}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" />
              新しい記録
            </button>
            
            <div className="flex flex-wrap gap-2">
              <Link
                to="/backup-manager"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                title="データ管理とバックアップ"
              >
                <Shield className="h-4 w-4" />
                データ管理
              </Link>
            </div>
          </div>
        </motion.div>
          
        {/* 統計情報 */}
        {records.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">記録日数</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{records.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">総活動数</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {records.reduce((sum, r) => sum + r.entries.length, 0)}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Smile className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">平均快楽度</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {records.length > 0 
                  ? (records.reduce((sum, r) => sum + r.averagePleasure, 0) / records.length).toFixed(1) 
                  : '0.0'}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">平均達成感</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {records.length > 0 
                  ? (records.reduce((sum, r) => sum + r.averageAchievement, 0) / records.length).toFixed(1) 
                  : '0.0'}
              </p>
            </div>
          </div>
        )}

        {/* 記録一覧 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">まだ記録がありません</h3>
              <p className="text-gray-600 mb-6">最初の活動記録を作成してみましょう</p>
              <button
                onClick={handleNewRecord}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                新しい記録を作成
              </button>
            </div>
          ) : (
            records
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
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
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">{record.date}</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">{record.entries.length}件の活動</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
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

          {/* ページネーション */}
          {records.length > recordsPerPage && (
            <div className="flex justify-center items-center gap-2 py-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                前へ
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.ceil(records.length / recordsPerPage) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(records.length / recordsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(records.length / recordsPerPage)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === Math.ceil(records.length / recordsPerPage)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                次へ
              </button>

              <div className="ml-4 text-sm text-gray-600">
                {records.length}件中 {(currentPage - 1) * recordsPerPage + 1}〜{Math.min(currentPage * recordsPerPage, records.length)}件を表示
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityRecordPage;
