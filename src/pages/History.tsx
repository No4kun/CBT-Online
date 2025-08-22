import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, TrendingUp, Calendar } from 'lucide-react';

const History: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
          履歴
        </h1>
        <p className="text-lg text-calm-600 max-w-2xl mx-auto">
          これまでの記録を振り返り、進歩を確認しましょう
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
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2 
          }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 p-5 shadow-lg"
        >
          <Clock className="w-full h-full text-white" />
        </motion.div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-calm-800">
            履歴機能は準備中です
          </h2>
          <p className="text-calm-600 max-w-md mx-auto">
            現在、履歴表示機能を開発中です。完成までしばらくお待ちください。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-accent-50 rounded-xl border border-accent-200">
            <FileText className="h-8 w-8 text-accent-500 mx-auto mb-2" />
            <h3 className="font-medium text-accent-700">記録一覧</h3>
            <p className="text-sm text-accent-600 mt-1">
              過去のコラム法記録
            </p>
          </div>
          
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
            <TrendingUp className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-medium text-primary-700">進歩の可視化</h3>
            <p className="text-sm text-primary-600 mt-1">
              感情変化のグラフ
            </p>
          </div>
          
          <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
            <Calendar className="h-8 w-8 text-secondary-500 mx-auto mb-2" />
            <h3 className="font-medium text-secondary-700">カレンダー</h3>
            <p className="text-sm text-secondary-600 mt-1">
              日別の記録表示
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default History;
