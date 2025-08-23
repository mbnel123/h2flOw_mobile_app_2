import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SafetySection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({
    safety: false,
    conditions: false,
    warnings: false,
    disclaimer: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Health and safety information</h3>
      
      <div className="space-y-4">
        {/* Safety Requirements */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('safety')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900">General safety guidelines</h4>
            {expandedSections.safety ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.safety && (
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex items-start bg-white p-4 rounded-lg">
                    <span className="text-blue-500 mr-3 mt-0.5">💡</span>
                    <p className="text-sm text-blue-800">Start with shorter fasts (12-24h) before attempting longer ones</p>
                  </div>
                  <div className="flex items-start bg-white p-4 rounded-lg">
                    <span className="text-blue-500 mr-3 mt-0.5">💧</span>
                    <p className="text-sm text-blue-800">Stay well hydrated - drink 2-3 liters of water daily</p>
                  </div>
                  <div className="flex items-start bg-white p-4 rounded-lg">
                    <span className="text-blue-500 mr-3 mt-0.5">👂</span>
                    <p className="text-sm text-blue-800">Listen to your body and stop if you feel unwell</p>
                  </div>
                  <div className="flex items-start bg-white p-4 rounded-lg">
                    <span className="text-blue-500 mr-3 mt-0.5">📱</span>
                    <p className="text-sm text-blue-800">This app is for tracking purposes only - not medical advice</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medical Conditions */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('conditions')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900">When to consult a healthcare provider first</h4>
            {expandedSections.conditions ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.conditions && (
            <div className="px-6 pb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <p className="text-orange-800 mb-4 text-sm">
                  Consider consulting a healthcare provider before fasting if you have:
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm text-orange-700">
                  <div>• Diabetes or blood sugar issues</div>
                  <div>• Heart conditions or blood pressure medications</div>
                  <div>• History of eating disorders</div>
                  <div>• Kidney or liver conditions</div>
                  <div>• Currently taking medications</div>
                  <div>• Underweight (BMI under 18.5)</div>
                  <div>• History of gallstones</div>
                  <div>• Any chronic medical condition</div>
                  <div>• Pregnancy, breastfeeding, or under 18 years old</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warning Signs */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('warnings')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900">When to stop fasting</h4>
            {expandedSections.warnings ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.warnings && (
            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-800 mb-4 text-sm">
                  Stop fasting and consider seeking medical advice if you experience:
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm text-red-700">
                  <div>• Severe dizziness or lightheadedness</div>
                  <div>• Chest discomfort or heart palpitations</div>
                  <div>• Persistent severe headaches</div>
                  <div>• Extreme fatigue or weakness</div>
                  <div>• Difficulty concentrating or confusion</div>
                  <div>• Persistent nausea or vomiting</div>
                  <div>• Feeling faint or unstable</div>
                  <div>• Any symptoms that concern you</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="border border-gray-200 rounded-xl">
          <button
            onClick={() => toggleSection('disclaimer')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900">App disclaimer</h4>
            {expandedSections.disclaimer ? 
              <ChevronUp className="w-5 h-5 text-gray-500" /> : 
              <ChevronDown className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedSections.disclaimer && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <p className="text-gray-900 text-sm leading-relaxed mb-4">
                  H2Flow is designed for educational and tracking purposes only. We do not provide medical advice or recommendations. 
                  Water fasting involves certain risks including:
                </p>
                <div className="text-gray-700 text-sm mb-4 ml-4">
                  • Changes in blood sugar and electrolyte levels<br/>
                  • Potential effects on heart rhythm<br/>
                  • Risk of dehydration<br/>
                  • Possible gallstone formation during extended fasts<br/>
                  • Metabolic changes<br/>
                  • Refeeding considerations after extended fasts
                </div>
                <p className="text-gray-900 text-sm">
                  By using this app, you acknowledge that fasting decisions are your personal responsibility. 
                  H2Flow and its creators are not liable for any health outcomes related to your fasting choices.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetySection;
