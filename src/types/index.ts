// 感情とその強度の型定義
export interface EmotionEntry {
  emotion: string;
  intensity: number;
  manualType?: 'negative' | 'positive'; // 手動で設定された分類（ドラッグアンドドロップによる）
}

// コラム法のデータ型定義
export interface ColumnEntry {
  id: string;
  dateTime: string;
  situation: string;
  emotions: EmotionEntry[];
  automaticThought: string;
  evidence: string;
  counterEvidence: string;
  adaptiveThought: string;
  emotionChange: number;
  newEmotions: EmotionEntry[]; // 適応思考後の感情
  createdAt: Date;
  updatedAt: Date;
}

// 活動記録の型定義
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

export type ActivityColorType = 'orange' | 'yellow' | 'red' | 'blue' | 'green' | 'purple' | 'black';

// セクション型定義
export type SectionType = 'situation' | 'thought' | 'adaptation';

// セクション1：日時/状況、感情
export interface SituationSection {
  dateTime: string;
  situation: string;
  emotions: EmotionEntry[];
}

// セクション2：自動思考、根拠
export interface ThoughtSection {
  automaticThought: string;
  evidence: string;
}

// セクション3：反証、適応思考、感情変化
export interface AdaptationSection {
  counterEvidence: string;
  adaptiveThought: string;
  emotionChange: number;
  newEmotions: EmotionEntry[]; // 適応思考後の感情
}
