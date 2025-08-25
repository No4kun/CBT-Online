import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BehaviorExperimentPlan, BehaviorExperimentResult } from '../../types';

interface BehaviorExperimentFormProps {
  mode: 'plan' | 'result';
  editingPlan?: BehaviorExperimentPlan | null;
  editingResult?: BehaviorExperimentResult | null;
  onSavePlan: (plan: BehaviorExperimentPlan) => void;
  onSaveResult: (result: BehaviorExperimentResult) => void;
  onCancel: () => void;
}

const BehaviorExperimentForm: React.FC<BehaviorExperimentFormProps> = ({
  mode,
  editingPlan,
  editingResult,
  onSavePlan,
  onSaveResult,
  onCancel
}) => {
  // 実験計画フォームの状態
  const [planForm, setPlanForm] = useState({
    scheduledDateTime: new Date().toISOString().slice(0, 16), // デフォルトを現在時刻に設定
    plannedAction: '',
    expectedTroubles: '',
    expectedJoy: 50,
    expectedAchievement: 50,
    successProbability: 50
  });

  // 実験結果フォームの状態
  const [resultForm, setResultForm] = useState({
    actualDateTime: new Date().toISOString().slice(0, 16), // デフォルトを現在時刻に設定
    actualAction: '',
    result: '',
    learnings: '',
    actualJoy: 50,
    actualAchievement: 50
  });

  useEffect(() => {
    if (mode === 'plan' && editingPlan) {
      setPlanForm({
        scheduledDateTime: editingPlan.scheduledDateTime || new Date().toISOString().slice(0, 16),
        plannedAction: editingPlan.plannedAction,
        expectedTroubles: editingPlan.expectedTroubles,
        expectedJoy: editingPlan.expectedJoy,
        expectedAchievement: editingPlan.expectedAchievement,
        successProbability: editingPlan.successProbability
      });
    } else if (mode === 'result') {
      if (editingResult) {
        setResultForm({
          actualDateTime: editingResult.actualDateTime || new Date().toISOString().slice(0, 16),
          actualAction: editingResult.actualAction,
          result: editingResult.result,
          learnings: editingResult.learnings,
          actualJoy: editingResult.actualJoy,
          actualAchievement: editingResult.actualAchievement
        });
      } else if (editingPlan) {
        // 計画データを結果フォームの初期値として使用
        setResultForm(prev => ({
          ...prev,
          actualDateTime: editingPlan.scheduledDateTime || new Date().toISOString().slice(0, 16),
          actualAction: editingPlan.plannedAction,
          actualJoy: editingPlan.expectedJoy,
          actualAchievement: editingPlan.expectedAchievement
        }));
      }
    }
  }, [mode, editingPlan, editingResult]);

  const formatDateTimeForInput = (dateTime: string): string => {
    if (!dateTime) return '';
    
    try {
      // 既にISO形式（YYYY-MM-DDTHH:mm）の場合はそのまま返す
      if (dateTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return dateTime;
      }
      
      // Dateオブジェクトに変換してからフォーマット
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        // 無効な日付の場合は現在時刻を返す
        return new Date().toISOString().slice(0, 16);
      }
      
      return date.toISOString().slice(0, 16);
    } catch (error) {
      // エラーの場合は現在時刻を返す
      return new Date().toISOString().slice(0, 16);
    }
  };

  const handlePlanSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!planForm.scheduledDateTime || !planForm.plannedAction) {
      alert('予定日時と行うことは必須です。');
      return;
    }

    const plan: BehaviorExperimentPlan = {
      id: editingPlan?.id || `plan_${Date.now()}`,
      scheduledDateTime: planForm.scheduledDateTime,
      plannedAction: planForm.plannedAction,
      expectedTroubles: planForm.expectedTroubles,
      expectedJoy: planForm.expectedJoy,
      expectedAchievement: planForm.expectedAchievement,
      successProbability: planForm.successProbability,
      createdAt: editingPlan?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSavePlan(plan);
  };

  const handleResultSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!resultForm.actualDateTime || !resultForm.actualAction || !resultForm.result) {
      alert('実施日時、行ったこと、結果は必須です。');
      return;
    }

    const result: BehaviorExperimentResult = {
      id: editingResult?.id || `result_${Date.now()}`,
      planId: editingPlan?.id || '',
      actualDateTime: resultForm.actualDateTime,
      actualAction: resultForm.actualAction,
      result: resultForm.result,
      learnings: resultForm.learnings,
      actualJoy: resultForm.actualJoy,
      actualAchievement: resultForm.actualAchievement,
      createdAt: editingResult?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSaveResult(result);
  };

  const SliderInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    suffix?: string;
    color?: string;
  }> = ({ label, value, onChange, min = 0, max = 100, suffix = '', color = 'purple' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}: <span className={`font-semibold text-${color}-600`}>{value}{suffix}</span>
      </label>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-${color}`}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}{suffix}</span>
          <span>{max}{suffix}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {mode === 'plan' 
              ? editingPlan ? '実験計画を編集' : '新しい実験計画'
              : editingResult ? '実験結果を編集' : '実験結果を記録'
            }
          </h2>

          {mode === 'plan' ? (
            <form onSubmit={handlePlanSubmit} className="space-y-6">
              {/* 予定日時 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  予定日時 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(planForm.scheduledDateTime)}
                  onChange={(e) => {
                    console.log('日時変更:', e.target.value); // デバッグ用
                    setPlanForm(prev => ({
                      ...prev,
                      scheduledDateTime: e.target.value
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  日付と時刻を選択してください
                </p>
              </div>

              {/* 行うこと */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  行うこと <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={planForm.plannedAction}
                  onChange={(e) => setPlanForm(prev => ({
                    ...prev,
                    plannedAction: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="具体的に行うことを記入してください"
                  required
                />
              </div>

              {/* 予想される結果やその他備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  予想される結果やその他備考
                </label>
                <textarea
                  value={planForm.expectedTroubles}
                  onChange={(e) => setPlanForm(prev => ({
                    ...prev,
                    expectedTroubles: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                  placeholder="予想される結果や気になることなど、自由に記入してください"
                />
              </div>

              {/* 感情スライダー */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderInput
                  label="期待する喜び"
                  value={planForm.expectedJoy}
                  onChange={(value) => setPlanForm(prev => ({ ...prev, expectedJoy: value }))}
                  suffix="点"
                  color="purple"
                />
                <SliderInput
                  label="期待する達成感"
                  value={planForm.expectedAchievement}
                  onChange={(value) => setPlanForm(prev => ({ ...prev, expectedAchievement: value }))}
                  suffix="点"
                  color="purple"
                />
              </div>

              <SliderInput
                label="成功確率"
                value={planForm.successProbability}
                onChange={(value) => setPlanForm(prev => ({ ...prev, successProbability: value }))}
                suffix="%"
                color="blue"
              />

              {/* ボタン */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingPlan ? '更新' : '保存'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResultSubmit} className="space-y-6">
              {/* 実施日時 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  実施日時 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(resultForm.actualDateTime)}
                  onChange={(e) => {
                    console.log('実施日時変更:', e.target.value); // デバッグ用
                    setResultForm(prev => ({
                      ...prev,
                      actualDateTime: e.target.value
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  実際に行った日付と時刻を選択してください
                </p>
              </div>

              {/* 行ったこと */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  行ったこと <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resultForm.actualAction}
                  onChange={(e) => setResultForm(prev => ({
                    ...prev,
                    actualAction: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="実際に行ったことを記入してください"
                  required
                />
              </div>

              {/* 結果 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  結果 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resultForm.result}
                  onChange={(e) => setResultForm(prev => ({
                    ...prev,
                    result: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="実験の結果を記入してください"
                  required
                />
              </div>

              {/* 実験から学んだことや気づいたこと */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  実験から学んだことや気づいたこと
                </label>
                <textarea
                  value={resultForm.learnings}
                  onChange={(e) => setResultForm(prev => ({
                    ...prev,
                    learnings: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="この実験から学んだことや新しい気づきを記入してください"
                />
              </div>

              {/* 感情スライダー（実際） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SliderInput
                    label="実際の喜び"
                    value={resultForm.actualJoy}
                    onChange={(value) => setResultForm(prev => ({ ...prev, actualJoy: value }))}
                    suffix="点"
                    color="green"
                  />
                  {editingPlan && (
                    <p className="text-xs text-gray-500 mt-1">
                      期待値: {editingPlan.expectedJoy}点
                    </p>
                  )}
                </div>
                <div>
                  <SliderInput
                    label="実際の達成感"
                    value={resultForm.actualAchievement}
                    onChange={(value) => setResultForm(prev => ({ ...prev, actualAchievement: value }))}
                    suffix="点"
                    color="green"
                  />
                  {editingPlan && (
                    <p className="text-xs text-gray-500 mt-1">
                      期待値: {editingPlan.expectedAchievement}点
                    </p>
                  )}
                </div>
              </div>

              {/* ボタン */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingResult ? '更新' : '保存'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BehaviorExperimentForm;
