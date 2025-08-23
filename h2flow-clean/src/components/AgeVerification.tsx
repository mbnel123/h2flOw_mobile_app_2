import React from 'react';

interface AgeVerificationProps {
  setAgeVerified: (verified: boolean) => void;
  setCurrentView: (view: string) => void;
  showOnboarding: boolean;
  setShowPrivacyPolicy: (show: boolean) => void;
  setShowTermsOfService: (show: boolean) => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({
  setAgeVerified,
  setCurrentView,
  showOnboarding,
  setShowPrivacyPolicy,
  setShowTermsOfService
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-red-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Age Verification Required</h1>
          <p className="text-gray-600">H2Flow is designed for adults only</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">
            <strong>Important:</strong> Extended water fasting can be dangerous and is not recommended for anyone under 18 years of age.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setAgeVerified(true);
              setCurrentView(showOnboarding ? 'onboarding' : 'welcome');
            }}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            ✓ I am 18 years or older
          </button>
          <button
            onClick={() => {
              alert('H2Flow is only available for adults 18 years and older. Please consult with a healthcare professional about safe nutrition practices for your age.');
            }}
            className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            I am under 18
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-x-4">
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setShowTermsOfService(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
