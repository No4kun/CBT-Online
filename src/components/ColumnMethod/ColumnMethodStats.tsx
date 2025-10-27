import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ColumnEntry } from '../../types';
import { cognitiveDistortions, distortionCategories } from '../../utils/cognitiveDistortions';
import { getEmotionType } from '../../utils/emotionClassification';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ColumnMethodStatsProps {
  records: ColumnEntry[];
}

const ColumnMethodStats: React.FC<ColumnMethodStatsProps> = ({ records }) => {
  // 感情の統計データ（マイナス感情のみ）
  const emotionsData = useMemo(() => {
    const emotionCounts: Record<string, number> = {};
    
    records.forEach(record => {
      record.emotions?.forEach(emotion => {
        // マイナス感情のみをカウント
        const emotionType = getEmotionType(emotion);
        if (emotionType === 'negative') {
          emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
        }
      });
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // 上位10個

    // 赤のグラデーション
    const redGradient = [
      '#7F1D1D', // 900
      '#991B1B', // 800
      '#B91C1C', // 700
      '#DC2626', // 600
      '#EF4444', // 500
      '#F87171', // 400
      '#FCA5A5', // 300
      '#FECACA', // 200
      '#FEE2E2', // 100
      '#FEF2F2', // 50
    ];

    return {
      labels: sortedEmotions.map(([name]) => name),
      datasets: [{
        data: sortedEmotions.map(([, count]) => count),
        backgroundColor: redGradient.slice(0, sortedEmotions.length),
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [records]);

  // 認知の歪みの統計データ
  const distortionsData = useMemo(() => {
    const distortionCounts: Record<string, { count: number; category: string; categoryName: string }> = {};
    
    records.forEach(record => {
      record.cognitiveDistortions?.forEach(tag => {
        const distortion = cognitiveDistortions.find(d => d.id === tag.distortionId);
        if (distortion) {
          if (!distortionCounts[distortion.name]) {
            distortionCounts[distortion.name] = {
              count: 0,
              category: distortion.category,
              categoryName: distortionCategories[distortion.category].name
            };
          }
          distortionCounts[distortion.name].count++;
        }
      });
    });

    const sortedDistortions = Object.entries(distortionCounts)
      .sort(([, a], [, b]) => b.count - a.count);

    // 紫のグラデーション（濃い -> 薄い）を頻度に応じて適用
    const purpleGradient = [
      '#581C87', // 900 - 最も濃い
      '#6B21A8', // 800
      '#7C3AED', // 700
      '#8B5CF6', // 600
      '#A855F7', // 500
      '#C084FC', // 400
      '#D8B4FE', // 300
      '#E9D5FF', // 200
      '#F3E8FF', // 100
      '#FAF5FF', // 50 - 最も薄い
    ];

    // 頻度順にグラデーションを割り当て（多い方が濃い、単調減少）
    const colors = sortedDistortions.map((_, index) => {
      if (sortedDistortions.length === 1) {
        return purpleGradient[0];
      }
      // indexを使って線形に色を配分
      const colorIndex = Math.min(
        Math.floor((index / (sortedDistortions.length - 1)) * (purpleGradient.length - 1)),
        purpleGradient.length - 1
      );
      return purpleGradient[colorIndex];
    });

    return {
      labels: sortedDistortions.map(([name, data]) => `${name} (${data.categoryName})`),
      datasets: [{
        data: sortedDistortions.map(([, data]) => data.count),
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [records]);

  // 再構成された感情の統計データ（プラス感情のみ）
  const newEmotionsData = useMemo(() => {
    const emotionCounts: Record<string, number> = {};
    
    records.forEach(record => {
      record.newEmotions?.forEach(emotion => {
        // プラス感情のみをカウント
        const emotionType = getEmotionType(emotion);
        if (emotionType === 'positive') {
          emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
        }
      });
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // 上位10個

    // 緑のグラデーション
    const greenGradient = [
      '#14532D', // 900
      '#166534', // 800
      '#15803D', // 700
      '#16A34A', // 600
      '#22C55E', // 500
      '#4ADE80', // 400
      '#86EFAC', // 300
      '#BBF7D0', // 200
      '#DCFCE7', // 100
      '#F0FDF4', // 50
    ];

    return {
      labels: sortedEmotions.map(([name]) => name),
      datasets: [{
        data: sortedEmotions.map(([, count]) => count),
        backgroundColor: greenGradient.slice(0, sortedEmotions.length),
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [records]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const backgroundColor = data.datasets[0].backgroundColor[i];
                return {
                  text: label,
                  fillStyle: backgroundColor,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}回 (${percentage}%)`;
          }
        }
      }
    },
  };

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 text-lg">記録がありません</p>
          <p className="text-gray-400 text-sm mt-2">記録を作成すると統計が表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* 円グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 感情の円グラフ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            記録された感情（マイナス感情）
          </h2>
          {emotionsData.labels.length > 0 ? (
            <div className="h-80">
              <Pie data={emotionsData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              データがありません
            </div>
          )}
          <p className="text-sm text-gray-500 mt-4 text-center">
            マイナス感情の種類と出現回数（上位10件）
          </p>
        </motion.div>

        {/* 再構成された感情の円グラフ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            再構成された感情（プラス感情）
          </h2>
          {newEmotionsData.labels.length > 0 ? (
            <div className="h-80">
              <Pie data={newEmotionsData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              データがありません
            </div>
          )}
          <p className="text-sm text-gray-500 mt-4 text-center">
            プラス感情の種類と出現回数（上位10件）
          </p>
        </motion.div>

        {/* 認知の歪みの円グラフ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg border lg:col-span-2"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            特定された認知の歪み
          </h2>
          {distortionsData.labels.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 円グラフ */}
              <div className="lg:col-span-2 h-96">
                <Pie 
                  data={distortionsData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false // 標準の凡例を非表示
                      }
                    }
                  }} 
                />
              </div>
              
              {/* カスタム凡例 */}
              <div className="space-y-4 overflow-y-auto max-h-96">
                {(() => {
                  // カテゴリ別にグループ化
                  const categoryGroups: Record<string, Array<{ name: string; count: number; color: string }>> = {};
                  
                  records.forEach(record => {
                    record.cognitiveDistortions?.forEach(tag => {
                      const distortion = cognitiveDistortions.find(d => d.id === tag.distortionId);
                      if (distortion) {
                        if (!categoryGroups[distortion.category]) {
                          categoryGroups[distortion.category] = [];
                        }
                        const existing = categoryGroups[distortion.category].find(item => item.name === distortion.name);
                        if (existing) {
                          existing.count++;
                        } else {
                          categoryGroups[distortion.category].push({
                            name: distortion.name,
                            count: 1,
                            color: '' // 後で設定
                          });
                        }
                      }
                    });
                  });
                  
                  // 各カテゴリ内でソートして色を割り当て
                  Object.keys(categoryGroups).forEach(category => {
                    categoryGroups[category].sort((a, b) => b.count - a.count);
                  });
                  
                  // 全体でソートしたリストから色を取得
                  const allDistortions: Array<{ name: string; count: number; category: string }> = [];
                  Object.entries(categoryGroups).forEach(([category, items]) => {
                    items.forEach(item => {
                      allDistortions.push({ ...item, category });
                    });
                  });
                  allDistortions.sort((a, b) => b.count - a.count);
                  
                  const colorMap: Record<string, string> = {};
                  allDistortions.forEach((item) => {
                    colorMap[item.name] = distortionsData.datasets[0].backgroundColor[
                      distortionsData.labels.findIndex((label: string) => label.includes(item.name))
                    ];
                  });
                  
                  // 色を設定
                  Object.values(categoryGroups).forEach(items => {
                    items.forEach(item => {
                      item.color = colorMap[item.name] || '#8B5CF6';
                    });
                  });
                  
                  // カテゴリの順番を定義（フォームと同じ順番）
                  const categoryOrder: Array<keyof typeof distortionCategories> = ['extreme', 'selective', 'intuitive', 'selfBlame'];
                  
                  return categoryOrder
                    .filter(category => categoryGroups[category] && categoryGroups[category].length > 0)
                    .map((category) => (
                      <div key={category} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                        <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                          {distortionCategories[category].name}
                        </h3>
                        <div className="space-y-1">
                          {categoryGroups[category].map((item, idx) => (
                            <div key={idx} className="flex items-center text-xs">
                              <span 
                                className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                              ></span>
                              <span className="text-gray-700 truncate">{item.name}</span>
                              <span className="ml-auto text-gray-500 pl-2">({item.count})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              データがありません
            </div>
          )}
          <p className="text-sm text-gray-500 mt-4 text-center">
            記録から特定された認知の歪みの種類と出現回数（濃い色ほど頻度が高い）
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ColumnMethodStats;
