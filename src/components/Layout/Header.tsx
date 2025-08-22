import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Home, FileText, Clock, BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: 'コラム法', href: '/column-method', icon: FileText },
    { name: '行動記録', href: '/behavior-record', icon: BarChart3 },
    { name: '履歴', href: '/history', icon: Clock },
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-md border-b border-calm-200/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              CBT Online
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                        : 'text-calm-600 hover:bg-primary-50 hover:text-primary-600'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
