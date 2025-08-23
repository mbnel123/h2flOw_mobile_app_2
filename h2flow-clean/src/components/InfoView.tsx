import React from 'react';
import SwipeNavigator from './SwipeNavigator';
import { ArrowLeft } from 'lucide-react';
import BenefitsSection from './info/BenefitsSection';
import TimelineSection from './info/TimelineSection';
import ResearchSection from './info/ResearchSection';
import SafetySection from './info/SafetySection';

interface InfoViewProps {
  setCurrentView: (view: string) => void;
}

const InfoView: React.FC<InfoViewProps> = ({ setCurrentView }) => {
  return (
    <SwipeNavigator
      onSwipeLeft={() => setCurrentView('water')}
      onSwipeRight={() => setCurrentView('settings')}
    >
      <div className="min-h-screen bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => setCurrentView('timer')} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-medium text-gray-800">Fasting Benefits & Science</h1>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Water Fasting Works</h2>
          <p className="text-gray-700 leading-relaxed">
            Extended water fasting triggers powerful biological processes that have been refined by millions of years of evolution. 
            When you fast, your body shifts from external fuel (food) to internal fuel (stored fat and damaged cells), 
            activating ancient survival mechanisms that promote healing and longevity.
          </p>
        </div>

        <BenefitsSection />
        <TimelineSection />
        <ResearchSection />
        <SafetySection />
      </div>
    </div>
    </SwipeNavigator>
  );
};

export default InfoView;
