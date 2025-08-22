import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, Activity } from 'lucide-react';

const BehaviorRecord: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary-600 to-accent-600 bg-clip-text text-transparent">
          行動記録
        </h1>
        <p className="text-lg text-calm-600 max-w-2xl mx-auto">
          日々の行動パターンを記録して、改善点を見つけましょう
        </p>
      </motion.div>

      {/* 準備中メッセージ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card p-8 text-center space-y-6"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3 
          }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-secondary-500 to-accent-500 p-5 shadow-lg"
        >
          <BarChart3 className="w-full h-full text-white" />
        </motion.div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-calm-800">
            行動記録機能は準備中です
          </h2>
          <p className="text-calm-600 max-w-md mx-auto">
            現在、行動記録機能を開発中です。完成までしばらくお待ちください。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
            <Calendar className="h-8 w-8 text-secondary-500 mx-auto mb-2" />
            <h3 className="font-medium text-secondary-700">日時記録</h3>
            <p className="text-sm text-secondary-600 mt-1">
              活動の時間を記録
            </p>
          </div>
          
          <div className="p-4 bg-accent-50 rounded-xl border border-accent-200">
            <Activity className="h-8 w-8 text-accent-500 mx-auto mb-2" />
            <h3 className="font-medium text-accent-700">活動内容</h3>
            <p className="text-sm text-accent-600 mt-1">
              具体的な行動を記録
            </p>
          </div>
          
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
            <BarChart3 className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-medium text-primary-700">分析</h3>
            <p className="text-sm text-primary-600 mt-1">
              パターンを可視化
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BehaviorRecord;
