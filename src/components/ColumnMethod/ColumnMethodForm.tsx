import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, RotateCcw, X } from 'lucide-react';
import SituationSection from './SituationSection';
import ThoughtSection from './ThoughtSection';
import AdaptationSection from './AdaptationSection';
import ProgressIndicator from './ProgressIndicator';
import { ColumnEntry, SectionType } from '../../types';

interface ColumnMethodFormProps {
  initialData?: ColumnEntry | null;
  isEditing?: boolean;
  onSave: (record: ColumnEntry) => void;
  onCancel: () => void;
}

const ColumnMethodForm: React.FC<ColumnMethodFormProps> = ({
  initialData,
  isEditing = false,
  onSave,
  onCancel
}) => {
  const [currentSection, setCurrentSection] = useState<SectionType>('situation');
  const [entry, setEntry] = useState<Partial<ColumnEntry>>(() => {
    if (initialData) {
      // 編集モードの場合、既存データを使用
      const dateTimeStr = typeof initialData.dateTime === 'string' 
        ? initialData.dateTime 
        : new Date(initialData.dateTime).toISOString().slice(0, 16);
      
      return {
        ...initialData,
        dateTime: dateTimeStr
      };
    }
    
    // 新規作成の場合、デフォルト値を設定
    return {
      dateTime: new Date().toISOString().slice(0, 16),
      situation: '',
      emotions: [],
      automaticThought: '',
      evidence: '',
      counterEvidence: '',
      adaptiveThought: '',
      emotionChange: 5,
      newEmotions: [],
    };
  });

  const sections: { type: SectionType; title: string; description: string }[] = [
    {
      type: 'situation',
      title: '状況と感情',
      description: 'いつ、どこで、何が起こったかと、その時の感情を記録します'
    },
    {
      type: 'thought',
      title: '思考と根拠',
      description: 'その時頭に浮かんだ考えと、それを支持する根拠を記録します'
    },
    {
      type: 'adaptation',
      title: '反証と適応思考',
      description: '別の視点からの証拠と、よりバランスの取れた考え方を見つけます'
    }
  ];

  const currentSectionIndex = sections.findIndex(s => s.type === currentSection);

  // エントリーの更新関数
  const updateEntry = (updates: Partial<ColumnEntry>) => {
    setEntry(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSection(sections[currentSectionIndex + 1].type);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSection(sections[currentSectionIndex - 1].type);
    }
  };

  const handleSave = () => {
    // 必須フィールドのバリデーション
    if (!entry.situation || !entry.emotions || entry.emotions.length === 0) {
      alert('状況と感情は必須項目です。');
      return;
    }

    if (!entry.automaticThought) {
      alert('自動思考は必須項目です。');
      return;
    }

    // エントリを完全な形式に変換
    const completeEntry: ColumnEntry = {
      id: initialData?.id || Date.now().toString(),
      dateTime: entry.dateTime || new Date().toISOString().slice(0, 16),
      situation: entry.situation || '',
      emotions: entry.emotions || [],
      automaticThought: entry.automaticThought || '',
      evidence: entry.evidence || '',
      counterEvidence: entry.counterEvidence || '',
      adaptiveThought: entry.adaptiveThought || '',
      emotionChange: entry.emotionChange || 5,
      newEmotions: entry.newEmotions || [],
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(completeEntry);
  };

  const handleReset = () => {
    if (window.confirm('入力内容をリセットしますか？')) {
      setEntry({
        dateTime: new Date().toISOString().slice(0, 16),
        situation: '',
        emotions: [],
        automaticThought: '',
        evidence: '',
        counterEvidence: '',
        adaptiveThought: '',
        emotionChange: 5,
        newEmotions: [],
      });
      setCurrentSection('situation');
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'situation':
        // dateTimeから日付と時刻を分離
        const dateTime = entry.dateTime || new Date().toISOString().slice(0, 16);
        const [date, time] = dateTime.includes('T') 
          ? dateTime.split('T') 
          : [dateTime.split(' ')[0] || new Date().toISOString().split('T')[0], 
             dateTime.split(' ')[1]?.slice(0, 5) || new Date().toISOString().split('T')[1].slice(0, 5)];
        
        return (
          <SituationSection 
            data={{
              date: date,
              time: time.slice(0, 5), // HH:MM形式に調整
              situation: entry.situation || '',
              emotions: entry.emotions || []
            }}
            onChange={(data) => {
              updateEntry({
                dateTime: `${data.date}T${data.time}`,
                situation: data.situation,
                emotions: data.emotions
              });
            }}
          />
        );
      case 'thought':
        return (
          <ThoughtSection 
            data={{
              automaticThought: entry.automaticThought || '',
              evidence: entry.evidence || ''
            }}
            onUpdate={updateEntry} 
          />
        );
      case 'adaptation':
        return (
          <AdaptationSection 
            data={{
              counterEvidence: entry.counterEvidence || '',
              adaptiveThought: entry.adaptiveThought || '',
              emotionChange: entry.emotionChange || 5,
              newEmotions: entry.newEmotions || []
            }}
            onUpdate={updateEntry}
            originalEmotions={entry.emotions || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'コラム法記録を編集' : '新しいコラム法記録'}
            </h1>
            <p className="text-gray-600">
              {sections[currentSectionIndex].description}
            </p>
          </div>
          
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="キャンセル"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <ProgressIndicator 
          sections={sections} 
          currentSection={currentSection} 
          onSectionClick={setCurrentSection}
        />
      </div>

      {/* セクションコンテンツ */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {sections[currentSectionIndex].title}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {renderCurrentSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>前へ</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentSectionIndex === sections.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>次へ</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>リセット</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>{isEditing ? '更新' : '保存'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMethodForm;
