import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ResearchSection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({
    research: false,
    autophagy: false,
    metabolic: false,
    immune: false,
    longevity: false,
    database: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="border border-gray-200 rounded-xl">
      <button
        onClick={() => toggleSection('research')}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-xl font-semibold text-gray-900">Scientific research and studies</h3>
        {expandedSections.research ? 
          <ChevronUp className="w-5 h-5 text-gray-500" /> : 
          <ChevronDown className="w-5 h-5 text-gray-500" />
        }
      </button>
      
      {expandedSections.research && (
        <div className="px-6 pb-6 space-y-6">
          <p className="text-gray-700">
            The benefits of water fasting are supported by extensive peer-reviewed research. Here are key studies 
            that demonstrate the physiological effects and health benefits:
          </p>
          
          <div className="space-y-4">
            {/* Autophagy Research */}
            <div className="border border-gray-200 rounded-xl">
              <button
                onClick={() => toggleSection('autophagy')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="text-2xl mr-3">🔬</span>
                  Autophagy and cellular renewal
                </h4>
                {expandedSections.autophagy ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              
              {expandedSections.autophagy && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Autophagy: cellular and molecular mechanisms"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> The Journal of Clinical Investigation (2015)<br/>
                      <strong>Finding:</strong> Comprehensive review of autophagy mechanisms and their role in cellular health and longevity.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/25654554/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Fasting activates macroautophagy in neurons of Alzheimer's disease mouse model"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Autophagy (2019)<br/>
                      <strong>Finding:</strong> Demonstrates how fasting enhances autophagy specifically in brain cells, potentially protecting against neurodegenerative diseases.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/30667316/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Metabolic Research */}
            <div className="border border-gray-200 rounded-xl">
              <button
                onClick={() => toggleSection('metabolic')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="text-2xl mr-3">⚡</span>
                  Metabolic and weight loss effects
                </h4>
                {expandedSections.metabolic ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              
              {expandedSections.metabolic && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Fasting: molecular mechanisms and clinical applications"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Cell Metabolism (2014)<br/>
                      <strong>Finding:</strong> Detailed analysis of fasting's effects on metabolism, showing improved insulin sensitivity and fat oxidation.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/24411938/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Intermittent fasting vs daily calorie restriction for type 2 diabetes prevention"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Journal of Clinical Medicine (2020)<br/>
                      <strong>Finding:</strong> Shows intermittent fasting is more effective than calorie restriction for improving insulin sensitivity.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/32121457/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Immune System Research */}
            <div className="border border-gray-200 rounded-xl">
              <button
                onClick={() => toggleSection('immune')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="text-2xl mr-3">🛡️</span>
                  Immune system and inflammation
                </h4>
                {expandedSections.immune ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              
              {expandedSections.immune && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Fasting-mimicking diet and markers/risk factors for aging, diabetes, cancer, and cardiovascular disease"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Science Translational Medicine (2017)<br/>
                      <strong>Finding:</strong> Demonstrates how fasting reduces inflammation markers and regenerates immune cells.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/28202779/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Prolonged fasting reduces IGF-1/PKA to promote hematopoietic-stem-cell-based regeneration"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Cell Stem Cell (2014)<br/>
                      <strong>Finding:</strong> Shows how extended fasting (72h+) triggers regeneration of new immune cells from stem cells.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/24905167/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Longevity Research */}
            <div className="border border-gray-200 rounded-xl">
              <button
                onClick={() => toggleSection('longevity')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="text-2xl mr-3">🌟</span>
                  Longevity and anti-aging
                </h4>
                {expandedSections.longevity ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              
              {expandedSections.longevity && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Caloric restriction and intermittent fasting: Two potential diets for successful brain aging"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Ageing Research Reviews (2006)<br/>
                      <strong>Finding:</strong> Review showing how fasting may protect against age-related cognitive decline and extend lifespan.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/16904611/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      "Fasting enhances growth hormone secretion and amplifies the complex rhythms of growth hormone secretion"
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Journal:</strong> Journal of Clinical Investigation (1988)<br/>
                      <strong>Finding:</strong> Classic study showing fasting increases growth hormone levels by up to 5-fold.
                    </p>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/3350967/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View on PubMed →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Research Database Links */}
            <div className="border border-gray-200 rounded-xl">
              <button
                onClick={() => toggleSection('database')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                  <span className="text-2xl mr-3">🔍</span>
                  Further research databases
                </h4>
                {expandedSections.database ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              
              {expandedSections.database && (
                <div className="px-4 pb-4">
                  <p className="text-blue-700 mb-4">
                    Explore more scientific studies on fasting through these research databases:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/?term=water+fasting" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <div className="font-semibold text-blue-800 mb-1">PubMed - Water fasting studies</div>
                      <div className="text-sm text-blue-600">Search peer-reviewed research on water fasting</div>
                    </a>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/?term=intermittent+fasting" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <div className="font-semibold text-blue-800 mb-1">PubMed - Intermittent fasting</div>
                      <div className="text-sm text-blue-600">Explore intermittent fasting research</div>
                    </a>
                    <a 
                      href="https://pubmed.ncbi.nlm.nih.gov/?term=autophagy+fasting" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <div className="font-semibold text-blue-800 mb-1">PubMed - Autophagy research</div>
                      <div className="text-sm text-blue-600">Studies on fasting-induced cellular cleanup</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchSection;
