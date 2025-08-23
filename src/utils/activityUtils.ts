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

// PA値に基づく色分類
export const getActivityColor = (pleasure: number, achievement: number): ActivityColorType => {
  if (pleasure >= 8 && achievement <= 7) return 'orange';
  if (pleasure <= 7 && achievement >= 8) return 'yellow';
  if (pleasure >= 8 && achievement >= 8) return 'red';
  if (pleasure <= 2 && achievement >= 2) return 'blue';
  if (pleasure >= 3 && achievement <= 1) return 'green';
  if (pleasure <= 2 && achievement <= 1) return 'purple';
  return 'black';
};

// 色に対応するCSSクラス
export const getActivityColorClass = (color: ActivityColorType): string => {
  const colorMap: Record<ActivityColorType, string> = {
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    black: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colorMap[color];
};

// 色の意味説明
export const getActivityColorMeaning = (color: ActivityColorType): string => {
  const meaningMap: Record<ActivityColorType, string> = {
    orange: '楽しいが達成感は低い',
    yellow: '達成感は高いが楽しさは普通',
    red: '楽しくて達成感も高い',
    blue: '楽しくないが多少の達成感',
    green: '多少楽しいが達成感なし',
    purple: '楽しくなく達成感もない',
    black: 'バランス型'
  };
  return meaningMap[color];
};

// 活動記録の分析
export const analyzeActivityRecord = (record: ActivityRecord): ActivityAnalysis => {
  const colorDistribution: Record<ActivityColorType, number> = {
    orange: 0, yellow: 0, red: 0, blue: 0, green: 0, purple: 0, black: 0
  };

  let maxPleasure = 0;
  let maxAchievement = 0;
  let peakPleasureTime = '';
  let peakAchievementTime = '';
  const lowEnergyPeriods: string[] = [];

  record.entries.forEach(entry => {
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

// 統計計算
export const calculateActivityStats = (entries: ActivityEntry[]) => {
  if (entries.length === 0) {
    return {
      totalPleasure: 0,
      totalAchievement: 0,
      averagePleasure: 0,
      averageAchievement: 0
    };
  }

  const totalPleasure = entries.reduce((sum, entry) => sum + entry.pleasure, 0);
  const totalAchievement = entries.reduce((sum, entry) => sum + entry.achievement, 0);

  return {
    totalPleasure,
    totalAchievement,
    averagePleasure: Math.round((totalPleasure / entries.length) * 10) / 10,
    averageAchievement: Math.round((totalAchievement / entries.length) * 10) / 10
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
