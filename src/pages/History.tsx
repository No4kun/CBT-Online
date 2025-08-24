import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Trash2, Search, Filter, ArrowUpDown, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { ColumnEntry } from '../types';
import { 
  calculateImprovement, 
  getEmotionColor,
  categorizeEmotions,
  getEmotionType
} from '../utils/emotionClassification';

const History: React.FC = () => {
  const [entries, setEntries] = useState<ColumnEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'emotion'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntry, setSelectedEntry] = useState<ColumnEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // サンプルデータの生成（後でlocalStorageまたはAPIから取得）
  useEffect(() => {
    const sampleEntries: ColumnEntry[] = [
      {
        id: '1',
        dateTime: '2025-01-20T14:30',
        situation: '会議で発表をしているとき、上司から厳しい質問をされて困ってしまった',
        emotions: [
          { emotion: '不安', intensity: 8 },
          { emotion: '恥', intensity: 6 }
        ],
        automaticThought: '私は無能だと思われている',
        evidence: '質問に答えられなかった、みんなが見ている',
        counterEvidence: '準備不足だっただけで、普段はしっかり仕事をしている',
        adaptiveThought: '今回は準備不足だったが、次回はもっと準備して臨める',
        emotionChange: 6,
        newEmotions: [
          { emotion: '軽い不安', intensity: 4 },
          { emotion: '希望', intensity: 7 }
        ],
        createdAt: new Date('2025-01-20T14:30'),
        updatedAt: new Date('2025-01-20T14:30')
      },
      {
        id: '2',
        dateTime: '2025-01-19T09:15',
        situation: '電車で席を譲ろうとしたが断られてしまった',
        emotions: [
          { emotion: '落胆', intensity: 5 },
          { emotion: '混乱', intensity: 4 }
        ],
        automaticThought: '親切にしたのに断られて嫌な思いをした',
        evidence: '相手が断った、周りの人が見ていた',
        counterEvidence: '相手にも事情があったかもしれない、親切な気持ちは間違いではない',
        adaptiveThought: '相手の気持ちを尊重することも大切、親切な気持ちを持てた自分を評価しよう',
        emotionChange: 3,
        newEmotions: [
          { emotion: '理解', intensity: 6 },
          { emotion: '自己受容', intensity: 5 }
        ],
        createdAt: new Date('2025-01-19T09:15'),
        updatedAt: new Date('2025-01-19T09:15')
      },
      {
        id: '3',
        dateTime: '2025-01-18T16:45',
        situation: '友人との約束をうっかり忘れてしまい、連絡が遅れた',
        emotions: [
          { emotion: '罪悪感', intensity: 9 },
          { emotion: '焦り', intensity: 7 }
        ],
        automaticThought: '私は信頼できない人間だ',
        evidence: '約束を忘れた、友人を待たせてしまった',
        counterEvidence: '普段は約束を守っている、今回は特別忙しかった',
        adaptiveThought: 'たまには失敗もある、謝罪して今後気をつければ大丈夫',
        emotionChange: 4,
        newEmotions: [
          { emotion: '軽い罪悪感', intensity: 4 },
          { emotion: '反省', intensity: 6 },
          { emotion: '決意', intensity: 7 }
        ],
        createdAt: new Date('2025-01-18T16:45'),
        updatedAt: new Date('2025-01-18T16:45')
      }
    ];

    // 実際のアプリではlocalStorageから取得
    const savedEntries = localStorage.getItem('cbt-entries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }));
        setEntries(parsed);
      } catch (error) {
        console.error('Error parsing saved entries:', error);
        setEntries(sampleEntries);
      }
    } else {
      setEntries(sampleEntries);
      // サンプルデータをlocalStorageに保存
      localStorage.setItem('cbt-entries', JSON.stringify(sampleEntries));
    }
  }, []);

  // フィルタリングと検索
  const filteredEntries = entries
    .filter(entry => {
      if (!searchTerm) return true;
      return (
        entry.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.automaticThought.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.emotions.some(emotion => 
          emotion.emotion.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      } else if (sortBy === 'emotion') {
        const avgIntensityA = a.emotions.reduce((sum, e) => sum + e.intensity, 0) / a.emotions.length;
        const avgIntensityB = b.emotions.reduce((sum, e) => sum + e.intensity, 0) / b.emotions.length;
        comparison = avgIntensityA - avgIntensityB;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // エントリ削除
  const deleteEntry = (id: string) => {
    if (confirm('この記録を削除しますか？')) {
      const newEntries = entries.filter(entry => entry.id !== id);
      setEntries(newEntries);
      localStorage.setItem('cbt-entries', JSON.stringify(newEntries));
    }
  };

  // 詳細表示
  const viewDetails = (entry: ColumnEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  };

  // ソート切り替え
  const toggleSort = (field: 'date' | 'emotion') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          コラム法の履歴
        </h1>
        <p className="text-lg text-calm-600">
          過去の記録を確認して、認知パターンの変化を振り返りましょう
        </p>
      </motion.div>

      {/* 統計サマリー */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
            <div className="text-sm text-blue-700">総記録数</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(entries.reduce((sum, entry) => sum + entry.emotionChange, 0) / entries.length * 10) / 10}
            </div>
            <div className="text-sm text-green-700">平均改善度</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {entries.reduce((sum, entry) => sum + entry.emotions.length, 0)}
            </div>
            <div className="text-sm text-purple-700">記録した感情数</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {entries.length > 0 ? Math.ceil((Date.now() - entries[entries.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-orange-700">継続日数</div>
          </div>
        </motion.div>
      )}

      {/* 検索・フィルター */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* 検索バー */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="状況、思考、感情で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* ソートボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort('date')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                sortBy === 'date'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4" />
              日付順
              {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => toggleSort('emotion')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                sortBy === 'emotion'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              感情強度順
              {sortBy === 'emotion' && <ArrowUpDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredEntries.length} 件の記録が見つかりました
        </div>
      </motion.div>

      {/* エントリリスト */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-lg"
          >
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">記録がありません</h3>
            <p className="text-gray-500">コラム法を実践して記録を蓄積しましょう</p>
          </motion.div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(entry.dateTime).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(entry.dateTime).toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {entry.situation.length > 80 
                      ? `${entry.situation.substring(0, 80)}...` 
                      : entry.situation
                    }
                  </h3>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => viewDetails(entry)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="詳細を見る"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
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
                    {entry.automaticThought.length > 80 
                      ? `${entry.automaticThought.substring(0, 80)}...` 
                      : entry.automaticThought
                    }
                  </p>
                </div>

                {/* 適応思考 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    適応思考
                  </h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    {entry.adaptiveThought.length > 80 
                      ? `${entry.adaptiveThought.substring(0, 80)}...` 
                      : entry.adaptiveThought
                    }
                  </p>
                </div>

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
                          {entry.emotions.slice(0, 3).map((emotion, idx) => {
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
                          {entry.emotions.length > 3 && (
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
                          {entry.newEmotions && entry.newEmotions.length > 0 ? (
                            <>
                              {entry.newEmotions.slice(0, 3).map((emotion, idx) => {
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
                              {(entry.newEmotions?.length || 0) > 3 && (
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
                    {new Date(entry.dateTime).toLocaleDateString('ja-JP')} {new Date(entry.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.newEmotions && entry.emotions && (
                      <span className="flex items-center">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        改善度計算済み
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 詳細モーダル */}
      {isDetailModalOpen && selectedEntry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsDetailModalOpen(false)}
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
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 日時・状況 */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">日付</h3>
                      <p className="text-gray-900">{new Date(selectedEntry.dateTime).toLocaleDateString('ja-JP')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">時刻</h3>
                      <p className="text-gray-900">{new Date(selectedEntry.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">状況・出来事</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedEntry.situation}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">感情</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedEntry.emotions.map((emotion, idx) => (
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
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedEntry.automaticThought}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">根拠</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedEntry.evidence}</p>
                  </div>
                </div>

                {/* 反証と適応思考 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">反証</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedEntry.counterEvidence}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">適応思考</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedEntry.adaptiveThought}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">感情の変化分析</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedEntry.newEmotions && selectedEntry.newEmotions.length > 0 ? (
                        <div className="space-y-4">
                          {(() => {
                            const improvement = calculateImprovement(selectedEntry.emotions, selectedEntry.newEmotions);
                            const originalCategorized = categorizeEmotions(selectedEntry.emotions);
                            const newCategorized = categorizeEmotions(selectedEntry.newEmotions);
                            
                            return (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-xs font-medium text-gray-600 mb-2">適応思考前</h4>
                                    <div className="space-y-2">
                                      {selectedEntry.emotions.map((emotion, idx) => (
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
                                      {selectedEntry.newEmotions.map((emotion, idx) => (
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
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700">全体的な感情の強度</span>
                          <span className="text-lg font-bold text-green-600">{selectedEntry.emotionChange}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default History;
