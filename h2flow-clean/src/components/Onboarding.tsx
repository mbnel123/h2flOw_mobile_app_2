import React from 'react';

interface OnboardingProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  setShowOnboarding: (show: boolean) => void;
  setCurrentView: (view: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({
  onboardingStep,
  setOnboardingStep,
  setShowOnboarding,
  setCurrentView
}) => {
  const onboardingSteps = [
    {
      title: "TESTING TESTING Welcome to H2flOw! 💧",
      description: "Your comprehensive water fasting companion. Track your fasting journey with science-backed insights.",
      icon: "🌊"
    },
    {
      title: "Stay informed and safe ⚠️", 
      description: "Fasting involves certain risks. Listen to your body, stay hydrated, and be aware of warning signs. Detailed safety information is available in the app. Your wellbeing comes first.",
      icon: "🏥"
    },
    {
      title: "Track your progress 📈",
      description: "Monitor your fasting phases, water intake, and build a history of your fasting journey.",
      icon: "📊"
    },
    {
      title: "Science-based insights 🔬",
      description: "Learn about autophagy, ketosis, and the biological benefits of fasting with peer-reviewed research.",
      icon: "🧬"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl mb-6">{onboardingSteps[onboardingStep].icon}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {onboardingSteps[onboardingStep].title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {onboardingSteps[onboardingStep].description}
          </p>
          
          <div className="flex justify-center space-x-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === onboardingStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex justify-between">
        <button
          onClick={() => {
            if (onboardingStep > 0) {
              setOnboardingStep(onboardingStep - 1);
            }
          }}
          disabled={onboardingStep === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            onboardingStep === 0
              ? 'bg-gray-200 text-gray-400'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        
        {onboardingStep < onboardingSteps.length - 1 ? (
          <button
            onClick={() => setOnboardingStep(onboardingStep + 1)}
            className="px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'}}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => {
              setShowOnboarding(false);
              setCurrentView('welcome');
            }}
            className="px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
