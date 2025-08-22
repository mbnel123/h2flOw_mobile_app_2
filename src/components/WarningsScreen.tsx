import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningsScreenProps {
  setHasAcceptedRisks: (accepted: boolean) => void;
  setCurrentView: (view: string) => void;
}

const WarningsScreen: React.FC<WarningsScreenProps> = ({
  setHasAcceptedRisks,
  setCurrentView
}) => {
  const healthWarnings = [
    "ALWAYS consult a doctor before fasting",
    "DO NOT fast if pregnant, breastfeeding, or under 18",
    "Stop if experiencing dizziness or heart issues",
    "Drink 2-3 liters of water daily minimum",
    "Start with shorter fasts first",
    "Listen to your body - stop if unwell",
    "This app does NOT replace medical advice"
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <div className="text-center mb-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-gray-800 mb-2">Important Health Warnings</h1>
          <p className="text-gray-600">Please read this carefully for your safety</p>
        </div>

        <div className="space-y-4 mb-8">
          {healthWarnings.map((warning, index) => (
            <div key={index} className="flex items-start bg-red-50 p-4 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{warning}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-red-900 mb-2">LEGAL DISCLAIMER</h3>
          <p className="text-red-900 text-sm leading-relaxed">
            This app is for educational purposes only. We are not liable for health complications. 
            Fasting is at your own risk. Always consult a physician before starting.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setHasAcceptedRisks(true);
              setCurrentView('timer');
            }}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            ✓ I accept all risks and have consulted my doctor
          </button>
          <button
            onClick={() => setCurrentView('welcome')}
            className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Back to start
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningsScreen;
