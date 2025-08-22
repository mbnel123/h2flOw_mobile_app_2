import React from 'react';

interface WelcomeScreenProps {
  setCurrentView: (view: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setCurrentView }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="text-8xl mb-8">💧</div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          H2flOw
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your water fasting companion with science-backed insights
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => setCurrentView('auth')}
            className="w-full bg-blue-600 text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
          
          <button
            onClick={() => setCurrentView('info')}
            className="w-full bg-gray-200 text-gray-700 py-4 px-8 rounded-xl text-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Learn About Fasting
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          Track your journey • Stay safe • See the science
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
