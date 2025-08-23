import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({
    autophagy: false,
    cognitive: false,
    metabolic: false,
    immune: false,
    cardiovascular: false,
    longevity: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Comprehensive health benefits</h3>
      
      <div className="space-y-4">
        {/* Autophagy */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('autophagy')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🔄</span>
              <h4 className="text-lg font-semibold text-gray-900">Autophagy - Cellular renewal</h4>
            </div>
            {expandedSections.autophagy ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.autophagy && (
            <div className="px-6 pb-6">
              <p className="text-gray-700 mb-3">
                Your cells activate their internal "recycling program," breaking down and removing damaged proteins, 
                organelles, and cellular debris. This process:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Removes toxic protein aggregates linked to Alzheimer's</li>
                <li>• Repairs damaged mitochondria (cellular powerhouses)</li>
                <li>• Eliminates pre-cancerous cells</li>
                <li>• Reduces cellular inflammation</li>
                <li>• Increases cellular efficiency and longevity</li>
              </ul>
            </div>
          )}
        </div>

        {/* Cognitive Function */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('cognitive')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🧠</span>
              <h4 className="text-lg font-semibold text-gray-900">Enhanced cognitive function</h4>
            </div>
            {expandedSections.cognitive ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.cognitive && (
            <div className="px-6 pb-6">
              <p className="text-gray-700 mb-3">
                Ketones produced during fasting provide superior brain fuel, leading to:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 25% more efficient energy production for neurons</li>
                <li>• Increased BDNF (brain-derived neurotrophic factor)</li>
                <li>• Enhanced focus and mental clarity</li>
                <li>• Improved memory consolidation</li>
                <li>• Reduced brain fog and increased alertness</li>
                <li>• Neuroprotection against degenerative diseases</li>
              </ul>
            </div>
          )}
        </div>

        {/* Metabolic Optimization */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('metabolic')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">💚</span>
              <h4 className="text-lg font-semibold text-gray-900">Metabolic optimization</h4>
            </div>
            {expandedSections.metabolic ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.metabolic && (
            <div className="px-6 pb-6">
              <p className="text-gray-700 mb-3">
                Fasting fundamentally rewires your metabolism for efficiency:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Insulin sensitivity increases by up to 40%</li>
                <li>• Growth hormone levels increase 5-fold</li>
                <li>• Norepinephrine boosts fat burning by 14%</li>
                <li>• Metabolic rate increases initially (contrary to popular belief)</li>
                <li>• Improved glucose regulation and HbA1c levels</li>
                <li>• Enhanced fat oxidation and ketone production</li>
              </ul>
            </div>
          )}
        </div>

        {/* Immune System */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('immune')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🛡️</span>
              <h4 className="text-lg font-semibold text-gray-900">Immune system reset</h4>
            </div>
            {expandedSections.immune ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.immune && (
            <div className="px-6 pb-6">
              <p className="text-gray-700 mb-3">
                Extended fasting triggers stem cell regeneration and immune renewal:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Eliminates old, damaged immune cells</li>
                <li>• Activates stem cell regeneration (particularly after 72h)</li>
                <li>• Reduces chronic inflammation markers</li>
                <li>• Rebalances immune system response</li>
                <li>• Improves white blood cell efficiency</li>
                <li>• May help with autoimmune conditions</li>
              </ul>
            </div>
          )}
        </div>

        {/* Cardiovascular Health */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('cardiovascular')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">❤️</span>
              <h4 className="text-lg font-semibold text-gray-900">Cardiovascular health</h4>
            </div>
            {expandedSections.cardiovascular ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.cardiovascular && (
            <div className="px-6 pb-6">
              <p className="text-gray-700 mb-3">
                Fasting provides powerful cardioprotective benefits:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Reduces blood pressure by 10-15%</li>
                <li>• Improves cholesterol profile (HDL up, LDL down)</li>
                <li>• Decreases triglycerides by 30-50%</li>
                <li>• Reduces resting heart rate</li>
                <li>• Improves heart rate variability</li>
                <li>• Reduces oxidative stress on blood vessels</li>
              </ul>
            </div>
          )}
        </div>

        {/* Longevity & Anti-Aging */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('longevity')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🌟</span>
              <h4 className="text-lg font-semibold text-gray-900">Longevity and anti-aging</h4>
            </div>
            {expandedSections.longevity ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.longevity && (
            <div className="px-6 pb-6">
              <p className="text-gray-700 mb-3">
                Fasting activates multiple longevity pathways:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Activates SIRT1 longevity genes</li>
                <li>• Increases NAD+ levels (cellular energy)</li>
                <li>• Extends telomeres (chromosomal caps)</li>
                <li>• Reduces senescent cell accumulation</li>
                <li>• Improves DNA repair mechanisms</li>
                <li>• May extend lifespan by 10-20%</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
