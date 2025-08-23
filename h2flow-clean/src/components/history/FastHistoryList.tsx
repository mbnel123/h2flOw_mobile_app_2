// src/components/history/FastHistoryList.tsx
import React from 'react';
import { Fast } from '../../firebase/databaseService';

interface FastHistoryListProps {
  fastHistory: Fast[];
}

const FastHistoryList: React.FC<FastHistoryListProps> = ({ fastHistory }) => {
  if (fastHistory.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Recent Fasts</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>No fasting history yet. Start your first fast to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Recent Fasts</h3>
      <div className="space-y-3">
        {fastHistory.slice(0, 10).map(fast => (
          <div key={fast.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">
                {Number(fast.plannedDuration).toFixed(2)}h Fast
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                fast.status === 'completed'
                  ? 'bg-green-100 text-green-800' 
                  : fast.status === 'stopped_early'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {fast.status === 'completed' ? '✓ Completed' : 
                 fast.status === 'stopped_early' ? '⏱️ Stopped Early' : '🔄 Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Date:</span> {new Date(fast.startTime).toLocaleDateString('nl-NL')}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {Number(fast.actualDuration || fast.plannedDuration).toFixed(2)} hours
              </div>
            </div>
            
            {/* Enhanced phase information */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Biological benefits achieved:</div>
              <div className="flex flex-wrap gap-1">
                {Number(fast.actualDuration || fast.plannedDuration) >= 12 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Ketosis ({Number(Math.max(0, Number(fast.actualDuration || fast.plannedDuration) - 12)).toFixed(2)}h)
                  </span>
                )}
                {Number(fast.actualDuration || fast.plannedDuration) >= 24 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Autophagy ({Number(Math.max(0, Number(fast.actualDuration || fast.plannedDuration) - 24)).toFixed(2)}h)
                  </span>
                )}
                {Number(fast.actualDuration || fast.plannedDuration) >= 48 && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    Deep Autophagy
                  </span>
                )}
                {Number(fast.actualDuration || fast.plannedDuration) >= 72 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    Immune Reset
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FastHistoryList;
