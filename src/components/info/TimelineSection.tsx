import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TimelineSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fastingPhases = [
    { hours: 0, title: "Fast begins", description: "Using glucose from last meal", processes: ["Glucose burning", "Insulin declining"] },
    { hours: 6, title: "Glycogen use", description: "Using stored energy", processes: ["Glycogen breakdown", "Blood sugar stabilizing"] },
    { hours: 12, title: "Ketosis start", description: "Fat burning begins", processes: ["First ketones", "Fat burning increases"] },
    { hours: 18, title: "Deep ketosis", description: "Mental clarity improves", processes: ["Higher ketones", "Focus improves", "Hunger decreases"] },
    { hours: 24, title: "Autophagy", description: "Cellular repair starts", processes: ["Autophagy starts", "Cellular cleansing", "Growth hormone rises"] },
    { hours: 48, title: "Deep autophagy", description: "Maximum cleansing", processes: ["Intense autophagy", "Stem cells activate"] },
    { hours: 72, title: "Immune reset", description: "Complete renewal", processes: ["New immune cells", "System reset"] }
  ];

  return (
    <div className="border border-gray-200 rounded-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-xl font-semibold text-gray-900">What happens during your fast</h3>
        {isExpanded ? 
          <ChevronUp className="w-5 h-5 text-gray-500" /> : 
          <ChevronDown className="w-5 h-5 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {fastingPhases.map((phase, index) => (
            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
              <div className="w-16 text-center mr-4">
                <div className="text-sm font-semibold text-blue-600">{phase.hours}h</div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{phase.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{phase.description}</p>
                <div className="space-y-1">
                  {phase.processes.map((process, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600">{process}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineSection;
