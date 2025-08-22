// src/components/history/FastingPatternsSection.tsx
import React from 'react';
import { Calendar, BarChart3 } from 'lucide-react';

interface FastingPatternsSectionProps {
  stats: {
    fastsPerYear: number;
    hoursPerYear: number;
    fastsPerMonth: number;
    hoursPerMonth: number;
    averageDuration: number;
    completionRate: number;
    totalFasts: number;
    accountAgeDays: number;
  };
}

const FastingPatternsSection: React.FC<FastingPatternsSectionProps> = ({ stats }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">📈 Your Fasting Patterns</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* This Year */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">This Year</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.fastsPerYear}</div>
              <div className="text-xs text-green-600">Total fasts</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-800">{Math.round(stats.hoursPerYear)}h</div>
              <div className="text-xs text-green-600">Total hours</div>
            </div>
            <div className="text-xs text-green-600">
              Average: {stats.fastsPerYear > 0 ? Math.round(stats.hoursPerYear / stats.fastsPerYear) : 0}h per fast
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">This Month</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.fastsPerMonth}</div>
              <div className="text-xs text-blue-600">Total fasts</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-800">{Math.round(stats.hoursPerMonth)}h</div>
              <div className="text-xs text-blue-600">Total hours</div>
            </div>
            <div className="text-xs text-blue-600">
              Projected yearly: {Math.round(stats.fastsPerMonth * 12)} fasts
            </div>
          </div>
        </div>

        {/* All Time Averages */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-800">All Time Averages</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-purple-900">{Math.round(stats.averageDuration)}h</div>
              <div className="text-xs text-purple-600">Average duration</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-800">{stats.completionRate}%</div>
              <div className="text-xs text-purple-600">Success rate</div>
            </div>
            <div className="text-xs text-purple-600">
              {stats.accountAgeDays > 0 ? Math.round((stats.totalFasts / stats.accountAgeDays) * 30) : 0} fasts/month avg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastingPatternsSection;
