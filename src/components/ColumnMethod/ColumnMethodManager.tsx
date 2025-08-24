import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Brain, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  X,
  Download,
  Upload,
  Shield,
  RefreshCw
} from 'lucide-react';
import type { ColumnEntry } from '../../types';
import ColumnMethodForm from './ColumnMethodForm';
import { 
  calculateImprovement, 
  getEmotionColor,
  categorizeEmotions,
  getEmotionType
} from '../../utils/emotionClassification';

interface ColumnMethodManagerProps {
  onBack?: () => void;
}

const ColumnMethodManager: React.FC<ColumnMethodManagerProps> = ({ onBack }) => {
  const [records, setRecords] = useState<ColumnEntry[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ColumnEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // localStorage からデータを読み込み（復旧機能付き）
  useEffect(() => {
    try {
      let savedRecords = localStorage.getItem('column-method-records');
      
      // メインデータが破損している場合、バックアップから復旧を試行
      if (!savedRecords) {
        const backupData = localStorage.getItem('column-method-records-backup');
        const backupTimestamp = localStorage.getItem('column-method-records-backup-timestamp');
        
        if (backupData && backupTimestamp) {
          const backupDate = new Date(backupTimestamp).toLocaleDateString('ja-JP');
          if (confirm(`メインデータが見つかりません。${backupDate}のバックアップから復旧しますか？`)) {
            savedRecords = backupData;
            localStorage.setItem('column-method-records', backupData);
          }
        }
      }
      
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        
        // データ形式の検証
        if (!Array.isArray(parsed)) {
          throw new Error('データ形式が正しくありません');
        }
        
        // 日付文字列を Date オブジェクトに変換
        const processedRecords = parsed.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt)
        }));
        
        setRecords(processedRecords);
      }
    } catch (error) {
      console.error('コラム法記録の読み込みに失敗しました:', error);
      
      // エラー時の復旧試行
      try {
        const backupData = localStorage.getItem('column-method-records-backup');
        if (backupData && confirm('データの読み込みに失敗しました。バックアップから復旧を試行しますか？')) {
          const parsed = JSON.parse(backupData);
          const processedRecords = parsed.map((record: any) => ({
            ...record,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }));
          setRecords(processedRecords);
          localStorage.setItem('column-method-records', backupData);
          alert('✅ バックアップからの復旧が完了しました。');
        }
      } catch (backupError) {
        console.error('バックアップからの復旧も失敗しました:', backupError);
        alert('❌ データの復旧に失敗しました。手動でバックアップファイルから復元してください。');
      }
    }
  }, []);

  // データを localStorage に保存（エラーハンドリング強化）
  const saveToStorage = (newRecords: ColumnEntry[]) => {
    try {
      const dataToSave = JSON.stringify(newRecords);
      localStorage.setItem('column-method-records', dataToSave);
      
      // 自動バックアップ（10件以上で実行）
      if (newRecords.length >= 10 && newRecords.length % 5 === 0) {
        localStorage.setItem('column-method-records-backup', dataToSave);
        localStorage.setItem('column-method-records-backup-timestamp', new Date().toISOString());
      }
    } catch (error) {
      console.error('コラム法記録の保存に失敗しました:', error);
      // 容量不足の場合の対処
      if (error instanceof DOMException && error.code === 22) {
        alert('⚠️ ストレージ容量が不足しています。古いデータのバックアップを作成して削除することを検討してください。');
      } else {
        alert('❌ データの保存に失敗しました。ブラウザを再起動してお試しください。');
      }
    }
  };

  // 新規記録作成
  const handleCreateNew = () => {
    setSelectedRecord(null);
    setIsEditing(false);
    setShowForm(true);
  };

  // 記録編集
  const handleEdit = (record: ColumnEntry) => {
    setSelectedRecord(record);
    setIsEditing(true);
    setShowForm(true);
  };

  // 詳細表示
  const handleViewDetails = (record: ColumnEntry) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // 記録削除
  const handleDelete = (recordId: string) => {
    if (window.confirm('この記録を削除しますか？')) {
      const newRecords = records.filter(r => r.id !== recordId);
      setRecords(newRecords);
      saveToStorage(newRecords);
    }
  };

  // 記録保存
  const handleSave = (record: ColumnEntry) => {
    let newRecords: ColumnEntry[];
    
    if (isEditing && selectedRecord) {
      // 既存記録の更新
      newRecords = records.map(r => 
        r.id === selectedRecord.id ? { ...record, updatedAt: new Date() } : r
      );
    } else {
      // 新規記録の追加
      newRecords = [...records, { ...record, createdAt: new Date(), updatedAt: new Date() }];
    }
    
    setRecords(newRecords);
    saveToStorage(newRecords);
    setShowForm(false);
    setSelectedRecord(null);
  };

  // フォームキャンセル
  const handleCancel = () => {
    setShowForm(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  // 感情の変化を計算（正の値は改善、負の値は悪化）
  const getEmotionChange = (record: ColumnEntry) => {
    if (record.newEmotions && record.newEmotions.length > 0 && record.emotions.length > 0) {
      const initialAvg = record.emotions.reduce((sum, e) => sum + e.intensity, 0) / record.emotions.length;
      const finalAvg = record.newEmotions.reduce((sum, e) => sum + e.intensity, 0) / record.newEmotions.length;
      return initialAvg - finalAvg; // 変化前 - 変化後（強度が下がれば正の値）
    }
    return record.emotionChange || 0;
  };

  // データの自動バックアップ機能
  const createBackup = () => {
    try {
      const data = {
        records: records,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      const backupData = JSON.stringify(data, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cbt-column-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ バックアップファイルをダウンロードしました。');
    } catch (error) {
      console.error('Backup error:', error);
      alert('❌ バックアップの作成に失敗しました。');
    }
  };

  // バックアップからの復元機能
  const restoreFromBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          if (!backupData.records || !Array.isArray(backupData.records)) {
            throw new Error('Invalid backup format');
          }
          
          // 確認ダイアログ
          const confirmMessage = `バックアップファイルから${backupData.records.length}件の記録を復元します。\n\n現在のデータは上書きされます。続行しますか？`;
          if (!confirm(confirmMessage)) return;
          
          // データを復元
          const restoredRecords = backupData.records.map((record: any) => ({
            ...record,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }));
          
          setRecords(restoredRecords);
          saveToStorage(restoredRecords);
          
          alert(`✅ ${restoredRecords.length}件の記録を復元しました。`);
        } catch (error) {
          console.error('Restore error:', error);
          alert('❌ バックアップファイルの復元に失敗しました。ファイル形式を確認してください。');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  // データの整合性チェック
  const validateData = () => {
    try {
      const issues: string[] = [];
      
      records.forEach((record, index) => {
        if (!record.id) issues.push(`記録${index + 1}: IDがありません`);
        if (!record.situation) issues.push(`記録${index + 1}: 状況が空です`);
        if (!record.emotions || record.emotions.length === 0) {
          issues.push(`記録${index + 1}: 感情が記録されていません`);
        }
        if (!record.automaticThought) issues.push(`記録${index + 1}: 自動思考が空です`);
        if (!record.createdAt) issues.push(`記録${index + 1}: 作成日時がありません`);
      });
      
      if (issues.length === 0) {
        alert('✅ データの整合性に問題はありません。');
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
      saveToStorage(uniqueRecords);
      alert(`✅ ${originalCount - uniqueRecords.length}件の重複データを削除しました。`);
    }
  };

  // デバッグ用: localStorage の内容を確認
  const debugStorage = () => {
    const columnData = localStorage.getItem('column-method-records');
    
    console.log('=== localStorage デバッグ情報 ===');
    console.log('コラム法データ:', columnData);
    console.log('現在の records state:', records);
    console.log('レコード詳細:', records.map(r => ({ id: r.id, situation: r.situation.substring(0, 30) + '...', createdAt: r.createdAt })));
    
    const storageSize = new Blob([columnData || '']).size;
    alert(`デバッグ情報をコンソールに出力しました。\n\nコラム法記録: ${records.length}件\nストレージサイズ: ${Math.round(storageSize / 1024 * 100) / 100}KB\n\n詳細はコンソールを確認してください。`);
  };

  // 日付フォーマット
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showForm) {
    return (
      <ColumnMethodForm
        initialData={selectedRecord}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">コラム法記録</h1>
              <p className="text-gray-600">思考の記録と分析を管理します</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* データ管理機能 */}
            <div className="flex gap-1 border-r border-gray-300 pr-2 mr-1">
              <button
                onClick={createBackup}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                title="データをバックアップ"
              >
                <Download className="h-4 w-4" />
                <span>バックアップ</span>
              </button>
              
              <button
                onClick={restoreFromBackup}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                title="バックアップから復元"
              >
                <Upload className="h-4 w-4" />
                <span>復元</span>
              </button>
              
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
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>新規記録</span>
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        {records.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">総記録数</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">{records.length}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">今月の記録</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {records.filter(r => {
                  const recordDate = new Date(r.createdAt);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">平均感情変化</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {records.length > 0 
                  ? `${(records.reduce((sum, r) => sum + getEmotionChange(r), 0) / records.length).toFixed(1)}`
                  : '0.0'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 記録一覧 */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">記録一覧</h2>
          <p className="text-sm text-gray-600">過去のコラム法記録を確認・編集できます</p>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">記録がありません</h3>
            <p className="text-gray-600 mb-6">
              最初のコラム法記録を作成してみましょう
            </p>
            <button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>新規記録を作成</span>
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {records
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((record, index) => {
                  const emotionChange = getEmotionChange(record);
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(record.createdAt)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(record.createdAt).toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              emotionChange > 0 
                                ? 'bg-green-100 text-green-800'
                                : emotionChange < 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              感情変化: {emotionChange > 0 ? '+' : ''}{emotionChange.toFixed(1)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            {record.situation && record.situation.length > 80 
                              ? `${record.situation.substring(0, 80)}...` 
                              : record.situation || '状況未記入'
                            }
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="詳細を見る"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {/* 自動思考 */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            自動思考
                          </h4>
                          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                            {record.automaticThought && record.automaticThought.length > 80 
                              ? `${record.automaticThought.substring(0, 80)}...` 
                              : record.automaticThought || '未記入'
                            }
                          </p>
                        </div>

                        {/* 適応思考 */}
                        {record.adaptiveThought && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              適応思考
                            </h4>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                              {record.adaptiveThought.length > 80 
                                ? `${record.adaptiveThought.substring(0, 80)}...` 
                                : record.adaptiveThought
                              }
                            </p>
                          </div>
                        )}

                        {/* 感情の変化 */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            感情の変化
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between gap-3">
                              {/* 変化前の感情 */}
                              <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-1">変化前</div>
                                <div className="space-y-1">
                                  {record.emotions && record.emotions.length > 0 ? (
                                    record.emotions.slice(0, 3).map((emotion, idx) => {
                                      const type = getEmotionType(emotion);
                                      const isNegative = type === 'negative';
                                      return (
                                        <div
                                          key={idx}
                                          className={`rounded px-2 py-1 text-xs ${
                                            isNegative 
                                              ? 'bg-red-100 text-red-800 border border-red-200' 
                                              : 'bg-green-100 text-green-800 border border-green-200'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="truncate font-medium">{emotion.emotion}</span>
                                            <span className="ml-1 text-xs">{emotion.intensity}/10</span>
                                          </div>
                                          <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                                            <div
                                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                                isNegative ? 'bg-red-500' : 'bg-green-500'
                                              }`}
                                              style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-xs text-gray-400 italic py-2">未記録</div>
                                  )}
                                  {record.emotions && record.emotions.length > 3 && (
                                    <div className="text-center text-xs text-gray-500 py-1">
                                      ...
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 矢印 */}
                              <div className="flex items-center justify-center pt-6">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              </div>

                              {/* 変化後の感情 */}
                              <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-1">変化後</div>
                                <div className="space-y-1">
                                  {record.newEmotions && record.newEmotions.length > 0 ? (
                                    <>
                                      {record.newEmotions.slice(0, 3).map((emotion, idx) => {
                                        const type = getEmotionType(emotion);
                                        const isNegative = type === 'negative';
                                        return (
                                          <div
                                            key={idx}
                                            className={`rounded px-2 py-1 text-xs ${
                                              isNegative 
                                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                                : 'bg-green-100 text-green-800 border border-green-200'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="truncate font-medium">{emotion.emotion}</span>
                                              <span className="ml-1 text-xs">{emotion.intensity}/10</span>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                                              <div
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                  isNegative ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {(record.newEmotions?.length || 0) > 3 && (
                                        <div className="text-center text-xs text-gray-500 py-1">
                                          ...
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-xs text-gray-400 italic py-2">
                                      未記録
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            {formatDate(record.createdAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            {record.newEmotions && record.emotions && (
                              <span className="flex items-center">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                改善度計算済み
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {showDetailModal && selectedRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">記録の詳細</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 日時・状況 */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">日付</h3>
                      <p className="text-gray-900">{new Date(selectedRecord.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">時刻</h3>
                      <p className="text-gray-900">{new Date(selectedRecord.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">状況・出来事</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedRecord.situation || '未記入'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">感情</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRecord.emotions.map((emotion, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{emotion.emotion}</span>
                            <span className="text-sm font-medium text-blue-600">{emotion.intensity}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${emotion.intensity * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 思考と根拠 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">自動思考</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedRecord.automaticThought || '未記入'}</p>
                  </div>

                  {selectedRecord.evidence && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">根拠</h3>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedRecord.evidence}</p>
                    </div>
                  )}
                </div>

                {/* 反証と適応思考 */}
                <div className="space-y-4">
                  {selectedRecord.counterEvidence && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">反証</h3>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedRecord.counterEvidence}</p>
                    </div>
                  )}

                  {selectedRecord.adaptiveThought && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">適応思考</h3>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedRecord.adaptiveThought}</p>
                    </div>
                  )}
                </div>

                {/* 感情（変化後） */}
                {selectedRecord.newEmotions && selectedRecord.newEmotions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">変化後の感情</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRecord.newEmotions.map((emotion, idx) => (
                        <div
                          key={idx}
                          className="bg-green-50 border border-green-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">{emotion.emotion}</span>
                            <span className="text-sm text-green-600">{emotion.intensity}/10</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 感情変化の詳細分析 */}
                {selectedRecord.newEmotions && selectedRecord.newEmotions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">感情の変化分析</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {(() => {
                        const improvement = calculateImprovement(selectedRecord.emotions, selectedRecord.newEmotions);
                        const originalCategorized = categorizeEmotions(selectedRecord.emotions);
                        const newCategorized = categorizeEmotions(selectedRecord.newEmotions);
                        
                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-medium text-gray-600 mb-2">適応思考前</h4>
                                <div className="space-y-2">
                                  {selectedRecord.emotions.map((emotion, idx) => (
                                    <div key={idx} className={`flex justify-between items-center p-2 rounded border text-sm ${getEmotionColor(emotion)}`}>
                                      <span>{emotion.emotion}</span>
                                      <span className="font-medium">{emotion.intensity}/10</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-xs font-medium text-gray-600 mb-2">適応思考後</h4>
                                <div className="space-y-2">
                                  {selectedRecord.newEmotions.map((emotion, idx) => (
                                    <div key={idx} className={`flex justify-between items-center p-2 rounded border text-sm ${getEmotionColor(emotion)}`}>
                                      <span>{emotion.emotion}</span>
                                      <span className="font-medium">{emotion.intensity}/10</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* 感情分類別の分析 */}
                            <div className="bg-white p-3 rounded border">
                              <h5 className="text-xs font-medium text-gray-600 mb-2">感情分類別の変化</h5>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <div className="flex items-center mb-1">
                                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                    <span className="font-medium text-red-700">ネガティブ感情</span>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>前: {originalCategorized.negative.length > 0 
                                      ? Math.round(originalCategorized.negative.reduce((sum, e) => sum + e.intensity, 0) / originalCategorized.negative.length * 10) / 10 
                                      : 0} 点</div>
                                    <div>後: {newCategorized.negative.length > 0 
                                      ? Math.round(newCategorized.negative.reduce((sum, e) => sum + e.intensity, 0) / newCategorized.negative.length * 10) / 10 
                                      : 0} 点</div>
                                    <div className={`font-medium ${improvement.negativeImprovement > 0 ? 'text-green-600' : improvement.negativeImprovement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                      {improvement.negativeImprovement > 0 ? '↓' : improvement.negativeImprovement < 0 ? '↑' : '→'} 
                                      {Math.abs(improvement.negativeImprovement)} 点変化
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center mb-1">
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                    <span className="font-medium text-green-700">ポジティブ感情</span>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>前: {originalCategorized.positive.length > 0 
                                      ? Math.round(originalCategorized.positive.reduce((sum, e) => sum + e.intensity, 0) / originalCategorized.positive.length * 10) / 10 
                                      : 0} 点</div>
                                    <div>後: {newCategorized.positive.length > 0 
                                      ? Math.round(newCategorized.positive.reduce((sum, e) => sum + e.intensity, 0) / newCategorized.positive.length * 10) / 10 
                                      : 0} 点</div>
                                    <div className={`font-medium ${improvement.positiveIncrease > 0 ? 'text-green-600' : improvement.positiveIncrease < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                      {improvement.positiveIncrease > 0 ? '↑' : improvement.positiveIncrease < 0 ? '↓' : '→'} 
                                      {Math.abs(improvement.positiveIncrease)} 点変化
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* 総合改善度 */}
                            <div className="bg-white p-3 rounded border border-l-4 border-l-blue-500">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="text-xs font-medium text-gray-700">総合改善度</h6>
                                  <p className="text-xs text-gray-600">ネガティブ軽減 + ポジティブ増加</p>
                                </div>
                                <div className="text-right">
                                  <div className={`text-lg font-bold ${
                                    improvement.overallImprovement >= 1.5 ? 'text-green-600' : 
                                    improvement.overallImprovement >= 0.5 ? 'text-blue-600' : 
                                    improvement.overallImprovement >= -0.5 ? 'text-gray-600' : 'text-red-600'
                                  }`}>
                                    {improvement.overallImprovement > 0 ? '+' : ''}{improvement.overallImprovement}
                                  </div>
                                  <div className={`text-xs font-medium ${
                                    improvement.overallImprovement >= 1.5 ? 'text-green-600' : 
                                    improvement.overallImprovement >= 0.5 ? 'text-blue-600' : 
                                    improvement.overallImprovement >= -0.5 ? 'text-gray-600' : 'text-red-600'
                                  }`}>
                                    {improvement.improvementDescription}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ColumnMethodManager;
