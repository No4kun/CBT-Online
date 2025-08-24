import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Heart, Brain, TrendingUp, Activity, FlaskConical, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'コラム法',
      description: '認知の歪みを見つけて、バランスの取れた考え方を身につけましょう',
      color: 'from-primary-500 to-primary-600',
      href: '/column-method'
    },
    {
      icon: Activity,
      title: '活動記録',
      description: '時間ごとの活動とその楽しさ・達成感を記録して分析しましょう',
      color: 'from-orange-500 to-orange-600',
      href: '/activity-record'
    },
    {
      icon: FlaskConical,
      title: '行動実験',
      description: '計画的な実験を通して、新しい行動や考え方を試してみましょう',
      color: 'from-purple-500 to-purple-600',
      href: '/behavior-experiment'
    },
    {
      icon: Shield,
      title: 'バックアップ管理',
      description: '大切なデータを安全に保護・管理して、いつでも復元できます',
      color: 'from-blue-500 to-blue-600',
      href: '/backup-manager'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: '感情の管理',
      description: 'ネガティブな感情をコントロールする方法を学びます'
    },
    {
      icon: Brain,
      title: '思考の整理',
      description: '混乱した思考を整理し、明確にします'
    },
    {
      icon: TrendingUp,
      title: '継続的な改善',
      description: '記録を続けることで確実な成長を実感できます'
    }
  ];

  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
        >
          CBT Online
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-calm-600 max-w-3xl mx-auto leading-relaxed"
        >
          認知行動療法（CBT）のコラム法と行動記録を使って、<br />
          心の健康とウェルビーイングを向上させましょう
        </motion.p>
      </motion.section>

      {/* 機能カード */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Link to={feature.href}>
                <div className="card p-6 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-200">
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      <Icon className="w-full h-full text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-calm-800">
                      {feature.title}
                    </h3>
                    <p className="text-calm-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <motion.div
                      className="pt-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                        始める →
                      </span>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.section>

      {/* メリットセクション */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-calm-200/50"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-3xl font-bold text-center text-calm-800 mb-12"
        >
          CBTで得られるメリット
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                className="text-center space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-accent-400 to-accent-500 p-4 shadow-lg"
                >
                  <Icon className="w-full h-full text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-calm-800">
                  {benefit.title}
                </h3>
                <p className="text-calm-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* CTA セクション */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center space-y-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-8 md:p-12 text-white"
      >
        <h2 className="text-3xl font-bold">今すぐ始めてみましょう</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          小さな一歩が大きな変化の始まりです
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/column-method"
              className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              コラム法を始める
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/activity-record"
              className="inline-block bg-white text-orange-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              活動記録を始める
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/behavior-experiment"
              className="inline-block bg-white text-purple-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              行動実験を始める
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
