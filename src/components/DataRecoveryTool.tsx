import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DataRecoveryTool: React.FC = () => {
  const [recoveryData, setRecoveryData] = useState('');
  const [recoveryResult, setRecoveryResult] = useState('');

  // 全データをエクスポート
  const exportAllData = () => {
    const allData = {
      columnEntries: localStorage.getItem('column-method-records') || '[]',
      activityRecords: localStorage.getItem('activityRecords') || '[]',
      behaviorExperiments: localStorage.getItem('behaviorExperiments') || '[]',
      // バックアップも含める
      backups: {} as Record<string, string>
    };

    // バックアップデータも収集
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('_backup_') || key.includes('Backup'))) {
        const value = localStorage.getItem(key);
        if (value) {
          allData.backups[key] = value;
        }
      }
    }

    const exportData = {
      ...allData,
      exportDate: new Date().toISOString(),
      origin: window.location.origin,
      userAgent: navigator.userAgent
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbt-data-recovery-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // データをインポート
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        let recoveredItems = [];
        
        // コラム法データ
        if (data.columnEntries && data.columnEntries !== '[]') {
          localStorage.setItem('column-method-records', data.columnEntries);
          recoveredItems.push('コラム法記録');
        }
        
        // 活動記録データ
        if (data.activityRecords && data.activityRecords !== '[]') {
          localStorage.setItem('activityRecords', data.activityRecords);
          recoveredItems.push('活動記録');
        }
        
        // 行動実験データ
        if (data.behaviorExperiments && data.behaviorExperiments !== '[]') {
          localStorage.setItem('behaviorExperiments', data.behaviorExperiments);
          recoveredItems.push('行動実験記録');
        }
        
        // バックアップデータも復元
        if (data.backups) {
          Object.entries(data.backups).forEach(([key, value]) => {
            if (typeof value === 'string') {
              localStorage.setItem(key, value);
            }
          });
          recoveredItems.push('バックアップデータ');
        }
        
        setRecoveryResult(`✅ 復元完了: ${recoveredItems.join(', ')}`);
        
        // ページをリロードして変更を反映
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        setRecoveryResult(`❌ 復元失敗: ${error}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 手動データ入力での復元
  const manualRestore = () => {
    try {
      const data = JSON.parse(recoveryData);
      
      // コラム法データの処理（複数形式対応）
      if (data.columnEntries || data.records || data.data) {
        let columnData = [];
        if (data.columnEntries) {
          columnData = typeof data.columnEntries === 'string' ? JSON.parse(data.columnEntries) : data.columnEntries;
        } else if (data.records && Array.isArray(data.records)) {
          columnData = data.records;  // バックアップ形式 {records: [...]}
        } else if (data.data && Array.isArray(data.data)) {
          columnData = data.data;
        }
        
        if (columnData.length > 0) {
          localStorage.setItem('column-method-records', JSON.stringify(columnData));
        }
      }
      
      if (data.activityRecords) {
        localStorage.setItem('activityRecords', typeof data.activityRecords === 'string' ? data.activityRecords : JSON.stringify(data.activityRecords));
      }
      if (data.behaviorExperiments) {
        localStorage.setItem('behaviorExperiments', typeof data.behaviorExperiments === 'string' ? data.behaviorExperiments : JSON.stringify(data.behaviorExperiments));
      }
      
      setRecoveryResult('✅ 手動復元完了');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setRecoveryResult(`❌ 手動復元失敗: JSON形式が正しくありません\n\nヒント: バックアップファイル形式 {records: [...]} もサポートしています`);
    }
  };

  // 現在のデータ状況を確認
  const checkCurrentData = () => {
    const status = {
      columnEntries: {
        exists: !!localStorage.getItem('column-method-records'),
        count: localStorage.getItem('column-method-records') ? JSON.parse(localStorage.getItem('column-method-records') || '[]').length : 0
      },
      activityRecords: {
        exists: !!localStorage.getItem('activityRecords'),
        count: localStorage.getItem('activityRecords') ? JSON.parse(localStorage.getItem('activityRecords') || '[]').length : 0
      },
      behaviorExperiments: {
        exists: !!localStorage.getItem('behaviorExperiments'),
        count: localStorage.getItem('behaviorExperiments') ? JSON.parse(localStorage.getItem('behaviorExperiments') || '[]').length : 0
      },
      backups: [] as string[]
    };

    // バックアップファイルを探す
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('_backup_') || key.includes('Backup'))) {
        status.backups.push(key);
      }
    }

    return status;
  };

  const currentStatus = checkCurrentData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <h2 className="text-2xl font-bold text-red-600 mb-4">🚨 データ復旧ツール</h2>
      
      {/* 現在の状況 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">現在のデータ状況:</h3>
        <ul className="space-y-1 text-sm">
          <li className={currentStatus.columnEntries.exists ? 'text-green-600' : 'text-red-600'}>
            コラム法: {currentStatus.columnEntries.exists ? `${currentStatus.columnEntries.count}件` : '❌ データなし'}
          </li>
          <li className={currentStatus.activityRecords.exists ? 'text-green-600' : 'text-red-600'}>
            活動記録: {currentStatus.activityRecords.exists ? `${currentStatus.activityRecords.count}件` : '❌ データなし'}
          </li>
          <li className={currentStatus.behaviorExperiments.exists ? 'text-green-600' : 'text-red-600'}>
            行動実験: {currentStatus.behaviorExperiments.exists ? `${currentStatus.behaviorExperiments.count}件` : '❌ データなし'}
          </li>
          <li>
            バックアップ: {currentStatus.backups.length}件 
            {currentStatus.backups.length > 0 && (
              <span className="text-blue-600"> (復旧可能性あり)</span>
            )}
          </li>
        </ul>
      </div>

      {/* 復旧オプション */}
      <div className="space-y-4">
        {/* 1. 全データエクスポート */}
        <div className="p-4 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">1. 現在のデータをバックアップ</h4>
          <p className="text-sm text-gray-600 mb-3">現在残っているデータとバックアップをすべてエクスポートします</p>
          <button
            onClick={exportAllData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            全データをエクスポート
          </button>
        </div>

        {/* 2. ファイルからインポート */}
        <div className="p-4 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">2. バックアップファイルから復元</h4>
          <p className="text-sm text-gray-600 mb-3">過去にエクスポートしたバックアップファイルから復元します</p>
          <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
            ファイルを選択して復元
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>

        {/* 3. 手動データ入力 */}
        <div className="p-4 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">3. 手動でデータを復元</h4>
          <p className="text-sm text-gray-600 mb-3">JSONデータを直接入力して復元します</p>
          <textarea
            value={recoveryData}
            onChange={(e) => setRecoveryData(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
            rows={6}
            placeholder='{"columnEntries": [...], "activityRecords": [...], "behaviorExperiments": [...]}'
          />
          <button
            onClick={manualRestore}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            手動復元実行
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      {recoveryResult && (
        <div className={`mt-4 p-4 rounded-lg ${recoveryResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {recoveryResult}
        </div>
      )}

      {/* 緊急連絡先 */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2">📞 復旧できない場合</h4>
        <p className="text-sm text-red-700">
          1. ブラウザの履歴から以前のポート（localhost:3000）にアクセスしてみてください<br/>
          2. 他のブラウザを使用していた場合は、そちらも確認してください<br/>
          3. 開発者ツール（F12）→ Application → Local Storage でデータの有無を確認してください
        </p>
      </div>
    </motion.div>
  );
};

export default DataRecoveryTool;
