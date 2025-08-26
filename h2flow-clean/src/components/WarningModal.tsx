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
  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Safety Confirmation</h1>
          <p className="text-gray-600">Before starting your fast</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm mb-3 font-medium">
              Please confirm that you:
            </p>
            <ul className="text-orange-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                <span>Have consulted with a healthcare professional if you have any medical conditions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                <span>Are not pregnant, breastfeeding, or under 18 years of age</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                <span>Have read and understand the risks of water fasting</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                <span>Will stop immediately if you experience any concerning symptoms</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                <span>Have adequate water and electrolytes available</span>
              </li>
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2 text-sm">⚖️ LEGAL DISCLAIMER</h3>
            <p className="text-red-700 text-xs leading-relaxed">
              <strong>By clicking "I Agree" you acknowledge that:</strong><br/>
              • You are solely responsible for any health consequences that may result from this fast<br/>
              • H2flOw and its creators are NOT liable for any health complications, injuries, or damages<br/>
              • This app is for educational purposes only and does NOT provide medical advice<br/>
              • Fasting is undertaken at your own risk
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setHasAcceptedRisks(true);
              setCurrentView('timer');
            }}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            ✓ I Agree & Accept Full Responsibility - Start Fast
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
