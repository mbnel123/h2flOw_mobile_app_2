import React from 'react';

interface MedicalReminderModalProps {
  showMedicalReminder: boolean;
  setShowMedicalReminder: (show: boolean) => void;
  confirmStartFast: () => void;
}

const MedicalReminderModal: React.FC<MedicalReminderModalProps> = ({
  showMedicalReminder,
  setShowMedicalReminder,
  confirmStartFast
}) => {
  if (!showMedicalReminder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Medical Safety Confirmation</h2>
          <p className="text-gray-600">Before starting your fast</p>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4">
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
              • H2Flow and its creators are NOT liable for any health complications, injuries, or damages<br/>
              • This app is for educational purposes only and does NOT provide medical advice<br/>
              • Fasting is undertaken at your own risk
            </p>
          </div>
        </div>
        
        <div className="space-y-3 mt-6">
          <button
            onClick={confirmStartFast}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            ✓ I Agree & Accept Full Responsibility - Start Fast
          </button>
          <button
            onClick={() => setShowMedicalReminder(false)}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalReminderModal;
