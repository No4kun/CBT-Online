import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CognitiveDistortionTag } from '../../types';
import { 
  cognitiveDistortions, 
  distortionCategories, 
  getCognitiveDistortionsByCategory 
} from '../../utils/cognitiveDistortions';

interface CognitiveDistortionSelectorProps {
  selectedDistortions: CognitiveDistortionTag[];
  onDistortionsChange: (distortions: CognitiveDistortionTag[]) => void;
}

const CognitiveDistortionSelector: React.FC<CognitiveDistortionSelectorProps> = ({
  selectedDistortions,
  onDistortionsChange
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDistortionToggle = (distortionId: string) => {
    const existing = selectedDistortions.find(d => d.distortionId === distortionId);
    
    if (existing) {
      // 既に選択されている場合は削除
      onDistortionsChange(selectedDistortions.filter(d => d.distortionId !== distortionId));
    } else {
      // 新規選択の場合は追加（デフォルト強度3）
      onDistortionsChange([
        ...selectedDistortions,
        { distortionId, intensity: 3 }
      ]);
    }
  };

  const handleIntensityChange = (distortionId: string, intensity: number) => {
    onDistortionsChange(
      selectedDistortions.map(d =>
        d.distortionId === distortionId ? { ...d, intensity } : d
      )
    );
  };

  const getSelectedIntensity = (distortionId: string): number => {
    return selectedDistortions.find(d => d.distortionId === distortionId)?.intensity || 3;
  };

  const isSelected = (distortionId: string): boolean => {
    return selectedDistortions.some(d => d.distortionId === distortionId);
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      red: 'bg-red-50 border-red-200 text-red-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return colorMap[distortionCategories[category as keyof typeof distortionCategories]?.color as keyof typeof colorMap] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getCategoryButtonColor = (category: string) => {
    const colorMap = {
      red: 'hover:bg-red-100',
      orange: 'hover:bg-orange-100',
      yellow: 'hover:bg-yellow-100',
      purple: 'hover:bg-purple-100'
    };
    return colorMap[distortionCategories[category as keyof typeof distortionCategories]?.color as keyof typeof colorMap] || 'hover:bg-gray-100';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700">認知の歪み（該当するものを選択）</h4>
        <div className="relative">
          <Info 
            className="h-4 w-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip('info')}
            onMouseLeave={() => setShowTooltip(null)}
          />
          {showTooltip === 'info' && (
            <div className="absolute bottom-6 left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              認知の歪みを特定することで、思考パターンへの気づきを深められます
            </div>
          )}
        </div>
      </div>

      {Object.entries(distortionCategories).map(([categoryKey, categoryInfo]) => {
        const categoryDistortions = getCognitiveDistortionsByCategory(categoryKey);
        const isExpanded = expandedCategories.has(categoryKey);
        const selectedInCategory = categoryDistortions.filter(d => isSelected(d.id)).length;

        return (
          <motion.div
            key={categoryKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg ${getCategoryColor(categoryKey)}`}
          >
            <button
              type="button"
              onClick={() => toggleCategory(categoryKey)}
              className={`w-full p-3 flex items-center justify-between transition-colors ${getCategoryButtonColor(categoryKey)}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{categoryInfo.name}</span>
                {selectedInCategory > 0 && (
                  <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full">
                    {selectedInCategory}個選択中
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 space-y-3">
                    <p className="text-xs text-gray-600 mb-3">{categoryInfo.description}</p>
                    
                    {categoryDistortions.map((distortion) => (
                      <div key={distortion.id} className="bg-white bg-opacity-50 p-3 rounded-lg">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={distortion.id}
                            checked={isSelected(distortion.id)}
                            onChange={() => handleDistortionToggle(distortion.id)}
                            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={distortion.id}
                              className="block text-sm font-medium text-gray-800 cursor-pointer mb-1"
                            >
                              {distortion.name}
                            </label>
                            <p className="text-xs text-gray-600 mb-2">{distortion.description}</p>
                            
                            {isSelected(distortion.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2"
                              >
                                <label className="block text-xs text-gray-700 mb-1">
                                  強度: {getSelectedIntensity(distortion.id)}/5
                                </label>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={getSelectedIntensity(distortion.id)}
                                  onChange={(e) => handleIntensityChange(distortion.id, parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>弱い</span>
                                  <span>強い</span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {selectedDistortions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3"
        >
          <h5 className="text-sm font-medium text-blue-800 mb-2">選択された認知の歪み</h5>
          <div className="space-y-1">
            {selectedDistortions.map((tag) => {
              const distortion = cognitiveDistortions.find(d => d.id === tag.distortionId);
              return (
                <div key={tag.distortionId} className="flex justify-between items-center text-sm">
                  <span className="text-blue-700">{distortion?.name}</span>
                  <span className="text-blue-600">強度: {tag.intensity}/5</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CognitiveDistortionSelector;
