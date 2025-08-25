import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Shield, 
  RefreshCw, 
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Activity,
  FlaskConical,
  HardDrive,
  CloudUpload,
  Trash2
} from 'lucide-react';

interface BackupData {
  columnEntries: any[];
  activityRecords: any[];
  behaviorExperiments: any[];
  backups: Record<string, any>;
  exportDate: string;
  origin: string;
  userAgent: string;
}

interface DataStatus {
  type: 'column' | 'activity' | 'experiment';
  name: string;
  icon: React.FC<any>;
  color: string;
  storageKey: string;
  exists: boolean;
  count: number;
  lastUpdate?: string;
  size: number;
}

const BackupManager: React.FC = () => {
  const [backupHistory, setBackupHistory] = useState<Array<{key: string, timestamp: number, size: number}>>([]);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [dataStatuses, setDataStatuses] = useState<DataStatus[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);

  useEffect(() => {
    analyzeDataHealth();
    loadBackupHistory();
    checkAutoBackup();
  }, []);

  // データの健全性分析
  const analyzeDataHealth = () => {
    const statuses: DataStatus[] = [
      {
        type: 'column',
        name: 'コラム法記録',
        icon: FileText,
        color: 'purple',
        storageKey: 'column-method-records',
        exists: false,
        count: 0,
        size: 0
      },
      {
        type: 'activity',
        name: '活動記録',
        icon: Activity,
        color: 'orange',
        storageKey: 'activityRecords',
        exists: false,
        count: 0,
        size: 0
      },
      {
        type: 'experiment',
        name: '行動実験記録',
        icon: FlaskConical,
        color: 'green',
        storageKey: 'behaviorExperiments',
        exists: false,
        count: 0,
        size: 0
      }
    ];

    let issues = 0;
    statuses.forEach(status => {
      const data = localStorage.getItem(status.storageKey);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          status.exists = true;
          status.count = Array.isArray(parsed) ? parsed.length : 0;
          status.size = new Blob([data]).size;
          
          // 最終更新日時を取得（可能な場合）
          if (Array.isArray(parsed) && parsed.length > 0) {
            const lastItem = parsed[parsed.length - 1];
            if (lastItem.updatedAt) {
              status.lastUpdate = new Date(lastItem.updatedAt).toLocaleDateString('ja-JP');
            }
          }
        } catch (error) {
          status.exists = false;
          issues++;
        }
      } else {
        issues++;
      }
    });

    setDataStatuses(statuses);
    
    if (issues === 0) {
      setHealthStatus('healthy');
    } else if (issues < statuses.length) {
      setHealthStatus('warning');
    } else {
      setHealthStatus('critical');
    }
  };

  // バックアップ履歴の読み込み
  const loadBackupHistory = () => {
    const history: Array<{key: string, timestamp: number, size: number}> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('backup') || key.includes('Backup'))) {
        const data = localStorage.getItem(key);
        if (data) {
          const size = new Blob([data]).size;
          const timestampMatch = key.match(/(\d+)$/);
          const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : Date.now();
          history.push({ key, timestamp, size });
        }
      }
    }
    
    history.sort((a, b) => b.timestamp - a.timestamp);
    setBackupHistory(history);
  };

  // 自動バックアップの確認
  const checkAutoBackup = () => {
    const autoBackupKey = 'last_auto_backup_timestamp';
    const lastBackup = localStorage.getItem(autoBackupKey);
    if (lastBackup) {
      setLastAutoBackup(new Date(parseInt(lastBackup)).toLocaleString('ja-JP'));
    }
  };

  // 完全バックアップの作成
  const createFullBackup = async () => {
    setIsExporting(true);
    try {
      const backupData: BackupData = {
        columnEntries: [],
        activityRecords: [],
        behaviorExperiments: [],
        backups: {},
        exportDate: new Date().toISOString(),
        origin: window.location.origin,
        userAgent: navigator.userAgent
      };

      // メインデータを収集
      dataStatuses.forEach(status => {
        const data = localStorage.getItem(status.storageKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            switch (status.type) {
              case 'column':
                backupData.columnEntries = parsed;
                break;
              case 'activity':
                backupData.activityRecords = parsed;
                break;
              case 'experiment':
                backupData.behaviorExperiments = parsed;
                break;
            }
          } catch (error) {
            console.error(`Error parsing ${status.storageKey}:`, error);
          }
        }
      });

      // バックアップデータも収集
      backupHistory.forEach(backup => {
        const data = localStorage.getItem(backup.key);
        if (data) {
          backupData.backups[backup.key] = data;
        }
      });

      // ファイルとしてダウンロード
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // 日時を含むファイル名を生成 (YYYY-MM-DD_HH-MM-SS形式)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      
      a.href = url;
      a.download = `cbt-complete-backup-${dateStr}_${timeStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // 自動バックアップのタイムスタンプを更新
      localStorage.setItem('last_auto_backup_timestamp', Date.now().toString());
      checkAutoBackup();

      alert('✅ 完全バックアップが作成されました！');
    } catch (error) {
      console.error('Backup creation failed:', error);
      alert('❌ バックアップの作成に失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  // バックアップからの復元
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
          
          let restoredCount = 0;
          const restoredTypes: string[] = [];

          // コラム法データの復元
          if (backupData.columnEntries && Array.isArray(backupData.columnEntries)) {
            localStorage.setItem('column-method-records', JSON.stringify(backupData.columnEntries));
            restoredCount += backupData.columnEntries.length;
            restoredTypes.push(`コラム法(${backupData.columnEntries.length}件)`);
          }

          // 活動記録データの復元
          if (backupData.activityRecords && Array.isArray(backupData.activityRecords)) {
            localStorage.setItem('activityRecords', JSON.stringify(backupData.activityRecords));
            restoredCount += backupData.activityRecords.length;
            restoredTypes.push(`活動記録(${backupData.activityRecords.length}件)`);
          }

          // 行動実験データの復元
          if (backupData.behaviorExperiments && Array.isArray(backupData.behaviorExperiments)) {
            localStorage.setItem('behaviorExperiments', JSON.stringify(backupData.behaviorExperiments));
            restoredCount += backupData.behaviorExperiments.length;
            restoredTypes.push(`行動実験(${backupData.behaviorExperiments.length}件)`);
          }

          // バックアップデータの復元
          if (backupData.backups && typeof backupData.backups === 'object') {
            Object.entries(backupData.backups).forEach(([key, value]) => {
              if (typeof value === 'string') {
                localStorage.setItem(key, value);
              }
            });
          }

          if (restoredCount > 0) {
            alert(`✅ 復元完了！\n\n復元されたデータ:\n${restoredTypes.join('\n')}\n\nページを再読み込みして変更を反映します。`);
            setTimeout(() => window.location.reload(), 1000);
          } else {
            alert('⚠️ 復元可能なデータが見つかりませんでした。');
          }
        } catch (error) {
          console.error('Restore error:', error);
          alert('❌ バックアップファイルの復元に失敗しました。ファイル形式を確認してください。');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  // 特定のバックアップを削除
  const deleteBackup = (backupKey: string) => {
    if (confirm(`バックアップ "${backupKey}" を削除しますか？`)) {
      localStorage.removeItem(backupKey);
      loadBackupHistory();
      alert('✅ バックアップを削除しました。');
    }
  };

  // すべてのデータをクリア
  const clearAllData = () => {
    if (confirm('⚠️ すべてのデータ（記録とバックアップ）を削除しますか？\n\nこの操作は元に戻せません！')) {
      if (confirm('🚨 最終確認：本当にすべてのデータを削除しますか？')) {
        // メインデータを削除
        dataStatuses.forEach(status => {
          localStorage.removeItem(status.storageKey);
        });
        
        // バックアップも削除
        backupHistory.forEach(backup => {
          localStorage.removeItem(backup.key);
        });
        
        // その他のバックアップ関連キーも削除
        localStorage.removeItem('last_auto_backup_timestamp');
        
        alert('✅ すべてのデータを削除しました。');
        window.location.reload();
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getHealthMessage = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'すべてのデータが正常です';
      case 'warning':
        return '一部のデータに問題があります';
      case 'critical':
        return '重要なデータが見つかりません';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">データバックアップ管理</h1>
          <p className="text-gray-600">大切なCBTデータを安全に保護・管理しましょう</p>
        </motion.div>

        {/* 健全性ステータス */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">データの健全性</h2>
            <div className="flex items-center gap-2">
              {getHealthIcon()}
              <span className={`font-medium ${
                healthStatus === 'healthy' ? 'text-green-600' :
                healthStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getHealthMessage()}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {dataStatuses.map((status) => {
              const Icon = status.icon;
              return (
                <div
                  key={status.type}
                  className={`p-4 rounded-lg border-2 ${
                    status.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 text-${status.color}-600`} />
                    <h3 className="font-medium text-gray-800">{status.name}</h3>
                  </div>
                  
                  {status.exists ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-green-700 font-medium">{status.count}件のデータ</p>
                      <p className="text-gray-600">サイズ: {formatBytes(status.size)}</p>
                      {status.lastUpdate && (
                        <p className="text-gray-600">最終更新: {status.lastUpdate}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-700 text-sm font-medium">データなし</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* バックアップ操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">バックアップ操作</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={createFullBackup}
              disabled={isExporting}
              className="flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span className="font-medium">
                {isExporting ? 'バックアップ作成中...' : '完全バックアップを作成'}
              </span>
            </button>

            <button
              onClick={restoreFromBackup}
              className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">バックアップから復元</span>
            </button>
          </div>

          {lastAutoBackup && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Clock className="w-4 h-4" />
              <span>最後の自動バックアップ: {lastAutoBackup}</span>
            </div>
          )}

          <div className="border-t pt-4">
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              すべてのデータを削除
            </button>
          </div>
        </motion.div>

        {/* バックアップ履歴 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">バックアップ履歴</h2>
          
          {backupHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">バックアップ履歴がありません</p>
          ) : (
            <div className="space-y-2">
              {backupHistory.map((backup) => (
                <div
                  key={backup.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">{backup.key}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(backup.timestamp).toLocaleString('ja-JP')} • {formatBytes(backup.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBackup(backup.key)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BackupManager;
