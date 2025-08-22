import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';
import SituationSection from '../components/ColumnMethod/SituationSection';
import ThoughtSection from '../components/ColumnMethod/ThoughtSection';
import AdaptationSection from '../components/ColumnMethod/AdaptationSection';
import ProgressIndicator from '../components/ColumnMethod/ProgressIndicator';
import { ColumnEntry, SectionType } from '../types';

const ColumnMethod: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<SectionType>('situation');
  const [entry, setEntry] = useState<Partial<ColumnEntry>>({
    dateTime: new Date().toISOString().slice(0, 16),
    situation: '',
    emotions: [],
    automaticThought: '',
    evidence: '',
    counterEvidence: '',
    adaptiveThought: '',
    emotionChange: 5,
    newEmotions: [], // 追加
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
      id: Date.now().toString(),
      dateTime: entry.dateTime || new Date().toISOString().slice(0, 16),
      situation: entry.situation || '',
      emotions: entry.emotions || [],
      automaticThought: entry.automaticThought || '',
      evidence: entry.evidence || '',
      counterEvidence: entry.counterEvidence || '',
      adaptiveThought: entry.adaptiveThought || '',
      emotionChange: entry.emotionChange || 5,
      newEmotions: entry.newEmotions || [], // 追加
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // localStorageから既存のエントリを取得
    const existingEntries = localStorage.getItem('cbt-entries');
    let entries: ColumnEntry[] = [];
    
    if (existingEntries) {
      try {
        entries = JSON.parse(existingEntries);
      } catch (error) {
        console.error('Error parsing existing entries:', error);
        entries = [];
      }
    }

    // 新しいエントリを追加
    entries.unshift(completeEntry); // 最新のエントリを先頭に追加

    // localStorageに保存
    localStorage.setItem('cbt-entries', JSON.stringify(entries));

    console.log('Entry saved:', completeEntry);
    alert('記録が保存されました！履歴ページで確認できます。');

    // フォームをリセット
    setEntry({
      dateTime: new Date().toISOString().slice(0, 16),
      situation: '',
      emotions: [],
      automaticThought: '',
      evidence: '',
      counterEvidence: '',
      adaptiveThought: '',
      emotionChange: 5,
      newEmotions: [], // 追加
    });
    setCurrentSection('situation');
  };

  const handleReset = () => {
    if (confirm('入力内容をリセットしますか？')) {
      setEntry({
        dateTime: new Date().toISOString().slice(0, 16),
        situation: '',
        emotions: [],
        automaticThought: '',
        evidence: '',
        counterEvidence: '',
        adaptiveThought: '',
        emotionChange: 5,
        newEmotions: [], // 追加
      });
      setCurrentSection('situation');
    }
  };

  const updateEntry = (updates: Partial<ColumnEntry>) => {
    console.log('ColumnMethod updateEntry called with:', updates);
    setEntry(prev => {
      const newEntry = { ...prev, ...updates };
      console.log('ColumnMethod entry updated to:', newEntry);
      return newEntry;
    });
  };

  // SituationSection用のデータ変換とコールバック
  const handleSituationUpdate = (situationData: {
    date: string;
    time: string;
    situation: string;
    emotions: any[];
  }) => {
    console.log('Situation update received:', situationData);
    // date と time を dateTime に結合
    const dateTime = situationData.date && situationData.time 
      ? `${situationData.date}T${situationData.time}`
      : entry.dateTime || new Date().toISOString().slice(0, 16);
    
    updateEntry({
      dateTime,
      situation: situationData.situation,
      emotions: situationData.emotions,
    });
  };

  // dateTime を date と time に分割する関数
  const splitDateTime = (dateTime: string) => {
    if (!dateTime) {
      const now = new Date();
      return {
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
      };
    }
    const [date, time] = dateTime.split('T');
    return {
      date: date || new Date().toISOString().slice(0, 10),
      time: time || new Date().toTimeString().slice(0, 5),
    };
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'situation':
        const { date, time } = splitDateTime(entry.dateTime || '');
        return (
          <SituationSection
            data={{
              date,
              time,
              situation: entry.situation || '',
              emotions: entry.emotions || [],
            }}
            onChange={handleSituationUpdate}
          />
        );
      case 'thought':
        return (
          <ThoughtSection
            data={{
              automaticThought: entry.automaticThought || '',
              evidence: entry.evidence || '',
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
              newEmotions: entry.newEmotions || [],
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          コラム法
        </h1>
        <p className="text-lg text-calm-600 max-w-2xl mx-auto">
          認知の歪みを見つけて、よりバランスの取れた考え方を身につけましょう
        </p>
      </motion.div>

      {/* プログレスインジケーター */}
      <ProgressIndicator
        sections={sections}
        currentSection={currentSection}
        onSectionClick={setCurrentSection}
      />

      {/* メインコンテンツ */}
      <motion.div
        layout
        className="card p-6 md:p-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* セクション情報 */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-calm-800">
                {sections[currentSectionIndex].title}
              </h2>
              <p className="text-calm-600">
                {sections[currentSectionIndex].description}
              </p>
            </div>

            {/* セクションコンテンツ */}
            {renderCurrentSection()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ナビゲーションボタン */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex justify-between items-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>前へ</span>
        </motion.button>

        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>リセット</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>保存</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentSectionIndex === sections.length - 1}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>次へ</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ColumnMethod;
