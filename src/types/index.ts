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
