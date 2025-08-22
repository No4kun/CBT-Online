import React from 'react';
import { motion } from 'framer-motion';
import { SectionType } from '../../types';
import { Calendar, Brain, Lightbulb } from 'lucide-react';

interface ProgressIndicatorProps {
  sections: { type: SectionType; title: string; description: string }[];
  currentSection: SectionType;
  onSectionClick: (section: SectionType) => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  sections,
  currentSection,
  onSectionClick,
}) => {
  const getIcon = (type: SectionType) => {
    switch (type) {
      case 'situation':
        return Calendar;
      case 'thought':
        return Brain;
      case 'adaptation':
        return Lightbulb;
      default:
        return Calendar;
    }
  };

  const getColors = (type: SectionType) => {
    switch (type) {
      case 'situation':
        return {
          active: 'from-primary-500 to-primary-600',
          inactive: 'from-primary-200 to-primary-300',
          text: 'text-primary-600',
          bg: 'bg-primary-50'
        };
      case 'thought':
        return {
          active: 'from-secondary-500 to-secondary-600',
          inactive: 'from-secondary-200 to-secondary-300',
          text: 'text-secondary-600',
          bg: 'bg-secondary-50'
        };
      case 'adaptation':
        return {
          active: 'from-accent-500 to-accent-600',
          inactive: 'from-accent-200 to-accent-300',
          text: 'text-accent-600',
          bg: 'bg-accent-50'
        };
      default:
        return {
          active: 'from-primary-500 to-primary-600',
          inactive: 'from-primary-200 to-primary-300',
          text: 'text-primary-600',
          bg: 'bg-primary-50'
        };
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        {sections.map((section, index) => {
          const Icon = getIcon(section.type);
          const colors = getColors(section.type);
          const isActive = currentSection === section.type;
          const isCompleted = sections.findIndex(s => s.type === currentSection) > index;

          return (
            <React.Fragment key={section.type}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSectionClick(section.type)}
                className={`
                  relative flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all duration-300
                  ${isActive ? colors.bg : 'hover:bg-calm-50'}
                `}
              >
                {/* アイコン */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`
                    w-12 h-12 rounded-xl bg-gradient-to-r shadow-lg flex items-center justify-center
                    ${isActive || isCompleted ? colors.active : colors.inactive}
                  `}
                >
                  <Icon className="h-6 w-6 text-white" />
                </motion.div>

                {/* タイトル */}
                <span
                  className={`
                    text-sm font-medium transition-colors duration-300
                    ${isActive ? colors.text : 'text-calm-600'}
                  `}
                >
                  {section.title}
                </span>

                {/* アクティブインジケーター */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute -bottom-1 w-8 h-1 rounded-full bg-gradient-to-r ${colors.active}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* コネクター */}
              {index < sections.length - 1 && (
                <div className="flex-1 mx-4">
                  <motion.div
                    className="h-0.5 bg-calm-200 relative overflow-hidden rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {isCompleted && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${colors.active}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
