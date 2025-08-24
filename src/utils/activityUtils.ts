// 活動記録のユーティリティ関数

import type { ActivityEntry, ActivityColorType, ActivityRecord } from '../types';

export interface ActivityAnalysis {
  colorDistribution: Record<ActivityColorType, number>;
  peakPleasureTime: string;
  peakAchievementTime: string;
  lowEnergyPeriods: string[];
  recommendations: string[];
}

// 時間スロットの生成（6:00-26:00）
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 6; hour <= 25; hour++) {
    const startHour = hour;
    const endHour = hour + 1;
    const startTime = startHour < 24 ? 
      `${startHour.toString().padStart(2, '0')}:00` : 
      `${(startHour - 24).toString().padStart(2, '0')}:00`;
    const endTime = endHour < 24 ? 
      `${endHour.toString().padStart(2, '0')}:00` : 
      `${(endHour - 24).toString().padStart(2, '0')}:00`;
    
    if (endHour === 26) {
      slots.push(`${startTime}-02:00`);
    } else {
      slots.push(`${startTime}-${endTime}`);
    }
  }
  return slots;
};

// P+A合計値に基づく色分類（5段階システム）
export const getActivityColor = (pleasure: number, achievement: number): ActivityColorType => {
  const total = pleasure + achievement;
  
  if (total >= 16) return 'red';      // 16〜20点: 非常にポジティブ
  if (total >= 11) return 'orange';   // 11〜15点: ポジティブ  
  if (total >= 6) return 'yellow';    // 6〜10点: ニュートラル
  if (total >= 3) return 'blue';      // 3〜5点: ややネガティブ
  return 'purple';                    // 0〜2点: 非常にネガティブ
};

// 色に対応するCSSクラス
export const getActivityColorClass = (color: ActivityColorType): string => {
  const colorMap: Record<ActivityColorType, string> = {
    red: 'bg-red-100 text-red-800 border-red-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  return colorMap[color];
};

// 色の意味説明
export const getActivityColorMeaning = (color: ActivityColorType): string => {
  const meaningMap: Record<ActivityColorType, string> = {
    red: '非常にポジティブ (P+A: 16〜20点)',
    orange: 'ポジティブ (P+A: 11〜15点)',
    yellow: 'ニュートラル (P+A: 6〜10点)',
    blue: 'ややネガティブ (P+A: 3〜5点)',
    purple: '非常にネガティブ (P+A: 0〜2点)'
  };
  return meaningMap[color];
};

// 活動記録の分析（excludeFromStatsがtrueのエントリーは除外）
export const analyzeActivityRecord = (record: ActivityRecord): ActivityAnalysis => {
  const colorDistribution: Record<ActivityColorType, number> = {
    red: 0, orange: 0, yellow: 0, blue: 0, purple: 0
  };

  let maxPleasure = 0;
  let maxAchievement = 0;
  let peakPleasureTime = '';
  let peakAchievementTime = '';
  const lowEnergyPeriods: string[] = [];

  // 統計から除外されていないエントリーのみを分析
  const validEntries = record.entries.filter(entry => !entry.excludeFromStats);

  validEntries.forEach(entry => {
    const color = getActivityColor(entry.pleasure, entry.achievement);
    colorDistribution[color]++;

    if (entry.pleasure > maxPleasure) {
      maxPleasure = entry.pleasure;
      peakPleasureTime = entry.timeSlot;
    }

    if (entry.achievement > maxAchievement) {
      maxAchievement = entry.achievement;
      peakAchievementTime = entry.timeSlot;
    }

    if (entry.pleasure <= 2 && entry.achievement <= 2) {
      lowEnergyPeriods.push(entry.timeSlot);
    }
  });

  // レコメンデーションの生成
  const recommendations: string[] = [];
  
  if (colorDistribution.red > 0) {
    recommendations.push('赤色の活動（高い楽しさ＋達成感）を増やしてみましょう');
  }
  
  if (colorDistribution.purple > 2) {
    recommendations.push('紫色の時間帯には、より楽しい活動を取り入れてみましょう');
  }
  
  if (lowEnergyPeriods.length > 3) {
    recommendations.push('エネルギーの低い時間帯が多いです。休息や軽い運動を取り入れてみましょう');
  }

  return {
    colorDistribution,
    peakPleasureTime,
    peakAchievementTime,
    lowEnergyPeriods,
    recommendations
  };
};

// 統計計算（excludeFromStatsがtrueのエントリーは除外）
export const calculateActivityStats = (entries: ActivityEntry[]) => {
  // 統計から除外されていないエントリーのみをフィルタリング
  const validEntries = entries.filter(entry => !entry.excludeFromStats);
  
  if (validEntries.length === 0) {
    return {
      totalPleasure: 0,
      totalAchievement: 0,
      averagePleasure: 0,
      averageAchievement: 0
    };
  }

  const totalPleasure = validEntries.reduce((sum, entry) => sum + entry.pleasure, 0);
  const totalAchievement = validEntries.reduce((sum, entry) => sum + entry.achievement, 0);

  return {
    totalPleasure,
    totalAchievement,
    averagePleasure: Math.round((totalPleasure / validEntries.length) * 10) / 10,
    averageAchievement: Math.round((totalAchievement / validEntries.length) * 10) / 10
  };
};

// デフォルトの活動記録作成
export const createDefaultActivityRecord = (date: string): ActivityRecord => {
  const timeSlots = generateTimeSlots();
  const entries: ActivityEntry[] = timeSlots.map((slot, index) => ({
    id: `entry-${index}`,
    timeSlot: slot,
    activity: '',
    pleasure: 5,
    achievement: 5,
    excludeFromStats: false, // デフォルトは統計に含む
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const stats = calculateActivityStats(entries);

  return {
    id: `record-${Date.now()}`,
    date,
    entries,
    ...stats,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
