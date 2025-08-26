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
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Important Health Warnings</h1>
          <p className="text-gray-600">Please read this carefully for your safety</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm mb-3 font-medium">
              Please confirm that you:
            </p>
            <ul className="text-orange-700 text-sm space-y-2">
              {healthWarnings.map((warning, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-800 mb-2 text-sm">⚖️ LEGAL DISCLAIMER</h3>
          <p className="text-red-700 text-xs leading-relaxed">
            <strong>By continuing you acknowledge that:</strong><br/>
            • You are solely responsible for any health consequences that may result from this fast<br/>
            • H2Flow and its creators are NOT liable for any health complications, injuries, or damages<br/>
            • This app is for educational purposes only and does NOT provide medical advice<br/>
            • Fasting is undertaken at your own risk
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setHasAcceptedRisks(true);
              setCurrentView('timer');
            }}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            ✓ I Agree & Accept Full Responsibility - Continue
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
