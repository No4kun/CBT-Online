// CBT データの統合管理ユーティリティ
// 複数のポート間でのデータ同期機能

class CBTDataManager {
  private static readonly PORTS = [3000, 3001, 3002, 5173, 5174];
  private static readonly STORAGE_KEYS = [
    'column-method-records',
    'activityRecords', 
    'behaviorExperiments'
  ];

  // 他のポートからデータを検索・インポート
  static async syncDataFromOtherPorts(): Promise<boolean> {
    let foundData = false;
    
    for (const port of this.PORTS) {
      if (port === parseInt(window.location.port)) continue;
      
      try {
        // 他のポートのlocalStorageをチェック（セキュリティ制限により直接アクセス不可）
        // 代替案：IndexedDBまたはファイルベースのストレージを使用
        console.log(`Port ${port} のデータをチェック中...`);
      } catch (error) {
        console.log(`Port ${port} からのデータ取得に失敗`);
      }
    }
    
    return foundData;
  }

  // データのバックアップを複数の場所に保存
  static backupToMultipleLocations(key: string, data: any): void {
    try {
      // 通常のlocalStorage
      localStorage.setItem(key, JSON.stringify(data));
      
      // タイムスタンプ付きバックアップ
      const timestamp = new Date().toISOString();
      localStorage.setItem(`${key}-backup-${timestamp.split('T')[0]}`, JSON.stringify(data));
      
      // ポート番号付きバックアップ
      const port = window.location.port || '3000';
      localStorage.setItem(`${key}-port-${port}`, JSON.stringify(data));
      
    } catch (error) {
      console.error('マルチロケーションバックアップ失敗:', error);
    }
  }

  // 複数の場所からデータを復旧
  static recoverData(key: string): any {
    try {
      // 通常のlocalStorageから試行
      let data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      // ポート別バックアップから検索
      for (const port of this.PORTS) {
        data = localStorage.getItem(`${key}-port-${port}`);
        if (data) {
          console.log(`Port ${port} のバックアップからデータを復旧`);
          return JSON.parse(data);
        }
      }

      // 日付別バックアップから最新のものを検索
      const keys = Object.keys(localStorage).filter(k => k.startsWith(`${key}-backup-`));
      if (keys.length > 0) {
        const latestKey = keys.sort().pop();
        data = localStorage.getItem(latestKey!);
        if (data) {
          console.log(`バックアップ ${latestKey} からデータを復旧`);
          return JSON.parse(data);
        }
      }

      return null;
    } catch (error) {
      console.error('データ復旧失敗:', error);
      return null;
    }
  }
}

export default CBTDataManager;
