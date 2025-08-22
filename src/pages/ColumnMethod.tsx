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
    // TODO: データベースに保存
    console.log('Saving entry:', entry);
    alert('記録が保存されました！');
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
      });
      setCurrentSection('situation');
    }
  };

  const updateEntry = (updates: Partial<ColumnEntry>) => {
    setEntry(prev => ({ ...prev, ...updates }));
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'situation':
        return (
          <SituationSection
            data={{
              dateTime: entry.dateTime || '',
              situation: entry.situation || '',
              emotions: entry.emotions || [],
            }}
            onUpdate={updateEntry}
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
            }}
            onUpdate={updateEntry}
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
