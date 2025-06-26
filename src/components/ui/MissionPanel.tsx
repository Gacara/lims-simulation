import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Target, Clock, DollarSign } from 'lucide-react';

export function MissionPanel() {
  const { toggleMissions, activeMissions } = useGameStore();

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Target className="text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Active Missions
            </h2>
          </div>
          <button
            onClick={toggleMissions}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeMissions.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Active Missions
              </h3>
              <p className="text-gray-600 mb-4">
                Check back later for new analytical challenges and opportunities.
              </p>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Browse Available Missions
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        {mission.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Client: {mission.client}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign size={14} />
                        {mission.rewards.money.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock size={14} />
                        {Math.ceil((mission.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    {mission.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mission.requiredEquipment.map((equipment) => (
                      <span
                        key={equipment}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {equipment}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Difficulty: 
                      <span className={`ml-1 font-medium ${
                        mission.difficulty === 'easy' ? 'text-green-600' :
                        mission.difficulty === 'medium' ? 'text-yellow-600' :
                        mission.difficulty === 'hard' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
                      </span>
                    </div>
                    
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}