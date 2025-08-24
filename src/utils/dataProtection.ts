// データ保護ユーティリティ
export class DataProtection {
  private static readonly STORAGE_PREFIX = 'cbt_app_';
  private static readonly BACKUP_PREFIX = 'cbt_backup_';
  private static readonly MAX_BACKUPS = 10;

  // 安全なキー生成
  static getStorageKey(dataType: string): string {
    return `${this.STORAGE_PREFIX}${dataType}`;
  }

  // 自動バックアップ付きでデータを保存
  static saveData(dataType: string, data: any): boolean {
    try {
      const key = this.getStorageKey(dataType);
      const jsonData = JSON.stringify(data);
      
      // 既存データをバックアップ
      this.createBackup(dataType);
      
      // 新しいデータを保存
      localStorage.setItem(key, jsonData);
      
      // 保存成功の確認
      const saved = localStorage.getItem(key);
      if (saved !== jsonData) {
        throw new Error('保存されたデータが一致しません');
      }
      
      console.log(`✅ ${dataType} データ保存成功`);
      return true;
    } catch (error) {
      console.error(`❌ ${dataType} データ保存失敗:`, error);
      
      // 失敗時は最新のバックアップから復元を試行
      this.restoreFromLatestBackup(dataType);
      return false;
    }
  }

  // データを安全に読み込み
  static loadData(dataType: string): any[] {
    try {
      const key = this.getStorageKey(dataType);
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log(`ℹ️ ${dataType} データが見つかりません`);
        return [];
      }
      
      const parsed = JSON.parse(data);
      
      // データの整合性チェック
      if (!Array.isArray(parsed)) {
        throw new Error('データ形式が正しくありません');
      }
      
      console.log(`✅ ${dataType} データ読み込み成功: ${parsed.length}件`);
      return parsed;
    } catch (error) {
      console.error(`❌ ${dataType} データ読み込み失敗:`, error);
      
      // 失敗時はバックアップから復元を試行
      return this.restoreFromLatestBackup(dataType) || [];
    }
  }

  // バックアップを作成
  static createBackup(dataType: string): void {
    try {
      const key = this.getStorageKey(dataType);
      const currentData = localStorage.getItem(key);
      
      if (!currentData) return;
      
      const backupKey = `${this.BACKUP_PREFIX}${dataType}_${Date.now()}`;
      localStorage.setItem(backupKey, currentData);
      
      // 古いバックアップを削除
      this.cleanupOldBackups(dataType);
      
      console.log(`✅ ${dataType} バックアップ作成: ${backupKey}`);
    } catch (error) {
      console.error(`❌ ${dataType} バックアップ作成失敗:`, error);
    }
  }

  // 最新のバックアップから復元
  static restoreFromLatestBackup(dataType: string): any[] | null {
    try {
      const backups = this.getBackups(dataType);
      
      if (backups.length === 0) {
        console.log(`ℹ️ ${dataType} のバックアップが見つかりません`);
        return null;
      }
      
      // 最新のバックアップを使用
      const latestBackup = backups[0];
      const backupData = localStorage.getItem(latestBackup.key);
      
      if (!backupData) {
        throw new Error('バックアップデータが破損しています');
      }
      
      const parsed = JSON.parse(backupData);
      
      // メインデータとして復元
      const mainKey = this.getStorageKey(dataType);
      localStorage.setItem(mainKey, backupData);
      
      console.log(`✅ ${dataType} バックアップから復元成功: ${latestBackup.key}`);
      return parsed;
    } catch (error) {
      console.error(`❌ ${dataType} バックアップ復元失敗:`, error);
      return null;
    }
  }

  // バックアップリストを取得
  static getBackups(dataType: string): Array<{key: string, timestamp: number}> {
    const backups: Array<{key: string, timestamp: number}> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${this.BACKUP_PREFIX}${dataType}_`)) {
        const timestampStr = key.split('_').pop();
        const timestamp = timestampStr ? parseInt(timestampStr) : 0;
        backups.push({ key, timestamp });
      }
    }
    
    // 新しい順にソート
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  // 古いバックアップを削除
  static cleanupOldBackups(dataType: string): void {
    const backups = this.getBackups(dataType);
    
    // MAX_BACKUPS を超える古いバックアップを削除
    if (backups.length > this.MAX_BACKUPS) {
      const toDelete = backups.slice(this.MAX_BACKUPS);
      toDelete.forEach(backup => {
        localStorage.removeItem(backup.key);
        console.log(`🗑️ 古いバックアップを削除: ${backup.key}`);
      });
    }
  }

  // 全データの健全性チェック
  static healthCheck(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const dataTypes = ['columnEntries', 'activityRecords', 'behaviorExperiments'];
    
    dataTypes.forEach(dataType => {
      const mainData = localStorage.getItem(this.getStorageKey(dataType));
      const backups = this.getBackups(dataType);
      
      if (!mainData) {
        issues.push(`${dataType} のメインデータが見つかりません`);
        
        if (backups.length > 0) {
          recommendations.push(`${dataType} をバックアップから復元してください`);
        } else {
          recommendations.push(`${dataType} のデータが完全に失われています`);
        }
      } else {
        try {
          JSON.parse(mainData);
        } catch {
          issues.push(`${dataType} のデータが破損しています`);
          recommendations.push(`${dataType} をバックアップから復元してください`);
        }
      }
      
      if (backups.length === 0) {
        issues.push(`${dataType} のバックアップがありません`);
        recommendations.push(`${dataType} のバックアップを作成してください`);
      }
    });
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (issues.length > 0) {
      status = issues.some(issue => issue.includes('完全に失われています') || issue.includes('破損しています')) 
        ? 'critical' 
        : 'warning';
    }
    
    return { status, issues, recommendations };
  }

  // 緊急データエクスポート
  static emergencyExport(): string {
    const exportData: any = {
      timestamp: new Date().toISOString(),
      origin: window.location.origin,
      data: {},
      backups: {}
    };
    
    // すべてのCBTデータをエクスポート
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(this.STORAGE_PREFIX) || key.startsWith(this.BACKUP_PREFIX))) {
        const value = localStorage.getItem(key);
        if (value) {
          if (key.startsWith(this.STORAGE_PREFIX)) {
            exportData.data[key] = value;
          } else {
            exportData.backups[key] = value;
          }
        }
      }
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  // 緊急データインポート
  static emergencyImport(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // データを復元
      if (data.data) {
        Object.entries(data.data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        });
      }
      
      // バックアップを復元
      if (data.backups) {
        Object.entries(data.backups).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        });
      }
      
      console.log('✅ 緊急インポート完了');
      return true;
    } catch (error) {
      console.error('❌ 緊急インポート失敗:', error);
      return false;
    }
  }
}

// 使用例のための型定義
export type DataType = 'columnEntries' | 'activityRecords' | 'behaviorExperiments';
