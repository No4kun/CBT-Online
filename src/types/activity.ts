// 活動記録関連の型定義

export interface ActivityEntry {
  id: string;
  timeSlot: string; // "06:00-07:00" 形式
  activity: string;
  pleasure: number; // 0-10
  achievement: number; // 0-10
  isHalfHour?: boolean; // 30分単位の記録かどうか
  halfPosition?: 'first' | 'second'; // 前半/後半
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityRecord {
  id: string;
  date: string; // YYYY-MM-DD 形式
  entries: ActivityEntry[];
  totalPleasure: number;
  totalAchievement: number;
  averagePleasure: number;
  averageAchievement: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityFormData {
  date: string;
  entries: Omit<ActivityEntry, 'id' | 'createdAt' | 'updatedAt'>[];
}

export type ActivityColorType = 'orange' | 'yellow' | 'red' | 'blue' | 'green' | 'purple' | 'black';

export interface ActivityAnalysis {
  colorDistribution: Record<ActivityColorType, number>;
  peakPleasureTime: string;
  peakAchievementTime: string;
  lowEnergyPeriods: string[];
  recommendations: string[];
}
