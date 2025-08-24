import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Calendar as CalendarIcon,
  Shield,
  RefreshCw,
  Brain,
  Smile,
  Trophy
} from 'lucide-react';
import ActivityTracker from '../components/ActivityTracker/ActivityTracker';
import type { ActivityRecord } from '../types';

const ActivityRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);

  // ローカルストレージからデータ読み込み（復旧機能付き）
  useEffect(() => {
    try {
      let savedRecords = localStorage.getItem('activityRecords');
      
      // メインデータが破損している場合、バックアップから復旧を試行
      if (!savedRecords) {
        const backupData = localStorage.getItem('activityRecords-backup');
        const backupTimestamp = localStorage.getItem('activityRecords-backup-timestamp');
        
        if (backupData && backupTimestamp) {
          const backupDate = new Date(backupTimestamp).toLocaleDateString('ja-JP');
          if (confirm(`活動記録のメインデータが見つかりません。${backupDate}のバックアップから復旧しますか？`)) {
            savedRecords = backupData;
            localStorage.setItem('activityRecords', backupData);
          }
        }
      }
      
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        
        // データ形式の検証
        if (!Array.isArray(parsedRecords)) {
          throw new Error('データ形式が正しくありません');
        }
        
        const processedRecords = parsedRecords.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          entries: record.entries.map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt)
          }))
        }));
        
        setRecords(processedRecords);
      }
    } catch (error) {
      console.error('活動記録データの読み込みに失敗しました:', error);
      
      // エラー時の復旧試行
      try {
        const backupData = localStorage.getItem('activityRecords-backup');
        if (backupData && confirm('活動記録データの読み込みに失敗しました。バックアップから復旧を試行しますか？')) {
          const parsedRecords = JSON.parse(backupData);
          const processedRecords = parsedRecords.map((record: any) => ({
            ...record,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt),
            entries: record.entries.map((entry: any) => ({
              ...entry,
              createdAt: new Date(entry.createdAt),
              updatedAt: new Date(entry.updatedAt)
            }))
          }));
          setRecords(processedRecords);
          localStorage.setItem('activityRecords', backupData);
          alert('✅ 活動記録のバックアップからの復旧が完了しました。');
        }
      } catch (backupError) {
        console.error('バックアップからの復旧も失敗しました:', backupError);
        alert('❌ 活動記録データの復旧に失敗しました。手動でバックアップファイルから復元してください。');
      }
    }
  }, []);

  // ローカルストレージにデータ保存（エラーハンドリング強化）
  const saveToLocalStorage = (updatedRecords: ActivityRecord[]) => {
    try {
      const dataToSave = JSON.stringify(updatedRecords);
      localStorage.setItem('activityRecords', dataToSave);
      
      // 自動バックアップ（5件以上で実行）
      if (updatedRecords.length >= 5 && updatedRecords.length % 3 === 0) {
        localStorage.setItem('activityRecords-backup', dataToSave);
        localStorage.setItem('activityRecords-backup-timestamp', new Date().toISOString());
      }
    } catch (error) {
      console.error('活動記録の保存に失敗しました:', error);
      // 容量不足の場合の対処
      if (error instanceof DOMException && error.code === 22) {
        alert('⚠️ ストレージ容量が不足しています。古いデータのバックアップを作成して削除することを検討してください。');
      } else {
        alert('❌ データの保存に失敗しました。ブラウザを再起動してお試しください。');
      }
    }
  };

  // データの整合性チェック
  const validateData = () => {
    try {
      const issues: string[] = [];
      
      records.forEach((record, index) => {
        if (!record.id) issues.push(`記録${index + 1}: IDがありません`);
        if (!record.date) issues.push(`記録${index + 1}: 日付が空です`);
        if (!record.entries || record.entries.length === 0) {
          issues.push(`記録${index + 1}: 活動エントリがありません`);
        }
        if (!record.createdAt) issues.push(`記録${index + 1}: 作成日時がありません`);
        
        // エントリの検証
        record.entries?.forEach((entry, entryIndex) => {
          if (!entry.timeSlot) issues.push(`記録${index + 1}, エントリ${entryIndex + 1}: 時間スロットがありません`);
          if (!entry.activity) issues.push(`記録${index + 1}, エントリ${entryIndex + 1}: 活動が空です`);
          if (entry.pleasure < 0 || entry.pleasure > 10) {
            issues.push(`記録${index + 1}, エントリ${entryIndex + 1}: 快楽度が範囲外です`);
          }
          if (entry.achievement < 0 || entry.achievement > 10) {
            issues.push(`記録${index + 1}, エントリ${entryIndex + 1}: 達成感が範囲外です`);
          }
        });
      });
      
      if (issues.length === 0) {
        alert('✅ 活動記録データの整合性に問題はありません。');
      } else {
        const message = `⚠️ 以下の問題が見つかりました:\n\n${issues.slice(0, 10).join('\n')}${issues.length > 10 ? '\n...他' + (issues.length - 10) + '件' : ''}`;
        alert(message);
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert('❌ データの検証中にエラーが発生しました。');
    }
  };

  // 重複データの削除
  const removeDuplicates = () => {
    const originalCount = records.length;
    const uniqueRecords = records.filter((record, index, self) => 
      index === self.findIndex(r => r.id === record.id)
    );
    
    if (originalCount === uniqueRecords.length) {
      alert('重複データはありませんでした。');
      return;
    }
    
    if (confirm(`${originalCount - uniqueRecords.length}件の重複データが見つかりました。削除しますか？`)) {
      setRecords(uniqueRecords);
      saveToLocalStorage(uniqueRecords);
      alert(`✅ ${originalCount - uniqueRecords.length}件の重複データを削除しました。`);
    }
  };

  // デバッグ用: localStorage の内容を確認
  const debugStorage = () => {
    const activityData = localStorage.getItem('activityRecords');
    
    console.log('=== 活動記録 localStorage デバッグ情報 ===');
    console.log('活動記録データ:', activityData);
    console.log('現在の records state:', records);
    console.log('レコード詳細:', records.map(r => ({ 
      id: r.id, 
      date: r.date, 
      entriesCount: r.entries.length, 
      createdAt: r.createdAt 
    })));
    
    const storageSize = new Blob([activityData || '']).size;
    const totalEntries = records.reduce((sum, r) => sum + r.entries.length, 0);
    
    alert(`デバッグ情報をコンソールに出力しました。\n\n活動記録: ${records.length}日分\n総活動エントリ: ${totalEntries}件\nストレージサイズ: ${Math.round(storageSize / 1024 * 100) / 100}KB\n\n詳細はコンソールを確認してください。`);
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
            
            <div className="flex gap-2">
              {/* データ管理機能 */}
              <div className="flex gap-1 border-r border-gray-300 pr-2 mr-1">
                <Link
                  to="/backup-manager"
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  title="データ管理とバックアップ"
                >
                  <Shield className="h-4 w-4" />
                  <span>データ管理</span>
                </Link>
                
                <button
                  onClick={validateData}
                  className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  title="データの整合性をチェック"
                >
                  <Shield className="h-4 w-4" />
                  <span>検証</span>
                </button>
                
                <button
                  onClick={removeDuplicates}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  title="重複データを削除"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>重複削除</span>
                </button>
              </div>
              
              {/* デバッグ機能 */}
              <button
                onClick={debugStorage}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                title="データの状態を確認"
              >
                <Brain className="h-4 w-4" />
                <span>デバッグ</span>
              </button>
              
              {/* 新規記録作成 */}
              <button
                onClick={handleNewRecord}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>新しい記録</span>
              </button>
            </div>
          </div>
          
          {/* 統計情報 */}
          {records.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    : '0.0'
                  }
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
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          )}
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
                        記録数: {record.entries.filter(e => e.activity.trim() !== '').length}件
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
