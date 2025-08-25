import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '../components/ui/Icons';
import { Shield } from 'lucide-react';
import { BehaviorExperiment, BehaviorExperimentPlan, BehaviorExperimentResult } from '../types';
import BehaviorExperimentForm from '../components/BehaviorExperiment/BehaviorExperimentForm';

const BehaviorExperimentPage: React.FC = () => {
  const [experiments, setExperiments] = useState<BehaviorExperiment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BehaviorExperimentPlan | null>(null);
  const [editingResult, setEditingResult] = useState<BehaviorExperimentResult | null>(null);
  const [formMode, setFormMode] = useState<'plan' | 'result'>('plan');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // LocalStorageからデータを読み込み
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = (): void => {
    try {
      const saved = localStorage.getItem('behaviorExperiments');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 日付文字列をDateオブジェクトに変換
        const converted = parsed.map((exp: any) => ({
          ...exp,
          plan: {
            ...exp.plan,
            createdAt: new Date(exp.plan.createdAt),
            updatedAt: new Date(exp.plan.updatedAt)
          },
          result: exp.result ? {
            ...exp.result,
            createdAt: new Date(exp.result.createdAt),
            updatedAt: new Date(exp.result.updatedAt)
          } : undefined
        }));
        setExperiments(converted);
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
      alert('データの読み込みに失敗しました。バックアップファイルから復元することをお勧めします。');
    }
  };

  const saveToStorage = (data: BehaviorExperiment[]): void => {
    try {
      // 自動バックアップを作成
      const existing = localStorage.getItem('behaviorExperiments');
      if (existing) {
        const backupKey = `behaviorExperiments_backup_${Date.now()}`;
        localStorage.setItem(backupKey, existing);
        
        // 古いバックアップを削除（最新5個まで保持）
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys
          .filter(key => key.startsWith('behaviorExperiments_backup_'))
          .sort()
          .reverse();
        
        backupKeys.slice(5).forEach(key => {
          localStorage.removeItem(key);
        });
      }

      localStorage.setItem('behaviorExperiments', JSON.stringify(data));
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
      alert('データの保存に失敗しました。ストレージの容量を確認してください。');
    }
  };

  const handleSavePlan = (plan: BehaviorExperimentPlan): void => {
    const updatedExperiments = [...experiments];
    
    if (editingPlan) {
      // 既存の計画を更新
      const index = updatedExperiments.findIndex(exp => exp.plan.id === editingPlan.id);
      if (index !== -1) {
        updatedExperiments[index] = {
          ...updatedExperiments[index],
          plan: { ...plan, updatedAt: new Date() }
        };
      }
    } else {
      // 新しい計画を追加
      const newExperiment: BehaviorExperiment = {
        plan: { ...plan, createdAt: new Date(), updatedAt: new Date() }
      };
      updatedExperiments.unshift(newExperiment);
    }
    
    setExperiments(updatedExperiments);
    saveToStorage(updatedExperiments);
    setIsFormOpen(false);
    setEditingPlan(null);
  };

  const handleSaveResult = (result: BehaviorExperimentResult): void => {
    const updatedExperiments = [...experiments];
    const index = updatedExperiments.findIndex(exp => exp.plan.id === result.planId);
    
    if (index !== -1) {
      if (editingResult) {
        // 既存の結果を更新
        updatedExperiments[index] = {
          ...updatedExperiments[index],
          result: { ...result, updatedAt: new Date() }
        };
      } else {
        // 新しい結果を追加
        updatedExperiments[index] = {
          ...updatedExperiments[index],
          result: { ...result, createdAt: new Date(), updatedAt: new Date() }
        };
      }
      
      setExperiments(updatedExperiments);
      saveToStorage(updatedExperiments);
    }
    
    setIsFormOpen(false);
    setEditingResult(null);
  };

  const handleDeleteExperiment = (planId: string): void => {
    if (confirm('この行動実験記録を削除しますか？')) {
      const updatedExperiments = experiments.filter(exp => exp.plan.id !== planId);
      setExperiments(updatedExperiments);
      saveToStorage(updatedExperiments);
    }
  };

  const handleDeleteResult = (planId: string): void => {
    if (confirm('この実験結果を削除しますか？')) {
      const updatedExperiments = experiments.map(exp => 
        exp.plan.id === planId ? { plan: exp.plan } : exp
      );
      setExperiments(updatedExperiments);
      saveToStorage(updatedExperiments);
    }
  };

  const toggleExpanded = (id: string): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const openPlanForm = (plan?: BehaviorExperimentPlan): void => {
    setFormMode('plan');
    setEditingPlan(plan || null);
    setEditingResult(null);
    setIsFormOpen(true);
  };

  const openResultForm = (planId: string, result?: BehaviorExperimentResult): void => {
    setFormMode('result');
    setEditingPlan(experiments.find(exp => exp.plan.id === planId)?.plan || null);
    setEditingResult(result || null);
    setIsFormOpen(true);
  };

  // データ管理機能は BackupManager に統合

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleString('ja-JP');
  };

  const calculateComparison = (expected: number, actual: number): { difference: number; text: string; color: string } => {
    const difference = actual - expected;
    if (difference > 0) {
      return {
        difference,
        text: `+${difference}点`,
        color: 'text-green-600'
      };
    } else if (difference < 0) {
      return {
        difference,
        text: `${difference}点`,
        color: 'text-red-600'
      };
    } else {
      return {
        difference: 0,
        text: '±0点',
        color: 'text-gray-600'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">行動実験記録</h1>
          <p className="text-gray-600">計画的な行動実験とその結果を記録しましょう</p>
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
              onClick={() => openPlanForm()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
            >
              + 新しい実験計画
            </button>
            
            <div className="flex flex-wrap gap-2">
              <Link
                to="/backup-manager"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Shield className="w-4 h-4" />
                データ管理
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 統計情報 */}
        {experiments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">総実験数</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{experiments.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <ChevronUpIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">完了した実験</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {experiments.filter(exp => exp.result).length}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <ChevronDownIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">計画中の実験</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {experiments.filter(exp => !exp.result).length}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">完了率</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {experiments.length > 0 
                  ? `${Math.round((experiments.filter(exp => exp.result).length / experiments.length) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </motion.div>
        )}

        {/* 実験記録一覧 */}
        <div className="space-y-4">
          {experiments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12 text-gray-500"
            >
              <p className="text-lg mb-2">まだ行動実験記録がありません</p>
              <p>「新しい実験計画」ボタンから始めましょう</p>
            </motion.div>
          ) : (
            experiments.map((experiment, index) => (
              <motion.div
                key={experiment.plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* ヘッダー */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(experiment.plan.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {experiment.plan.plannedAction}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          experiment.result 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {experiment.result ? '完了' : '計画中'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        予定: {formatDateTime(experiment.plan.scheduledDateTime)}
                      </p>
                      {experiment.result && (
                        <p className="text-gray-600 text-sm">
                          実施: {formatDateTime(experiment.result.actualDateTime)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {expandedItems.has(experiment.plan.id) ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 詳細表示 */}
                {expandedItems.has(experiment.plan.id) && (
                  <div className="border-t bg-gray-50">
                    {/* 実験計画 */}
                    <div className="p-6 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-purple-800">実験計画</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPlanForm(experiment.plan);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExperiment(experiment.plan.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">予定日時</label>
                          <p className="text-gray-900">{formatDateTime(experiment.plan.scheduledDateTime)}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">行うこと</label>
                          <p className="text-gray-900">{experiment.plan.plannedAction}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">予想される結果やその他備考</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{experiment.plan.expectedTroubles}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">期待する喜び</label>
                            <p className="text-lg font-semibold text-purple-600">{experiment.plan.expectedJoy}点</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">期待する達成感</label>
                            <p className="text-lg font-semibold text-purple-600">{experiment.plan.expectedAchievement}点</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">成功確率</label>
                            <p className="text-lg font-semibold text-purple-600">{experiment.plan.successProbability}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 実験結果 */}
                    {experiment.result ? (
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-green-800">実験結果</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openResultForm(experiment.plan.id, experiment.result);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              編集
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResult(experiment.plan.id);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">実施日時</label>
                            <p className="text-gray-900">{formatDateTime(experiment.result.actualDateTime)}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">行ったこと</label>
                            <p className="text-gray-900">{experiment.result.actualAction}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">結果</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{experiment.result.result}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">実験から学んだことや気づいたこと</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{experiment.result.learnings}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">実際の喜び</label>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-green-600">{experiment.result.actualJoy}点</span>
                                <span className={`text-sm font-medium ${calculateComparison(experiment.plan.expectedJoy, experiment.result.actualJoy).color}`}>
                                  ({calculateComparison(experiment.plan.expectedJoy, experiment.result.actualJoy).text})
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">実際の達成感</label>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-green-600">{experiment.result.actualAchievement}点</span>
                                <span className={`text-sm font-medium ${calculateComparison(experiment.plan.expectedAchievement, experiment.result.actualAchievement).color}`}>
                                  ({calculateComparison(experiment.plan.expectedAchievement, experiment.result.actualAchievement).text})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500 mb-4">まだ実験結果が記録されていません</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openResultForm(experiment.plan.id);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          実験結果を記録
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* フォームモーダル */}
      {isFormOpen && (
        <BehaviorExperimentForm
          mode={formMode}
          editingPlan={editingPlan}
          editingResult={editingResult}
          onSavePlan={handleSavePlan}
          onSaveResult={handleSaveResult}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPlan(null);
            setEditingResult(null);
          }}
        />
      )}
    </div>
  );
};

export default BehaviorExperimentPage;
