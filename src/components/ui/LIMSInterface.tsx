import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Beaker, BarChart3, Settings } from 'lucide-react';

export function LIMSInterface() {
  const { toggleLIMS } = useGameStore();

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Beaker className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Laboratory Information Management System
            </h2>
          </div>
          <button
            onClick={toggleLIMS}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Modules
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg">
                <Beaker size={16} />
                Sample Management
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                <BarChart3 size={16} />
                Analysis Results
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings size={16} />
                Equipment Control
              </button>
            </nav>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Sample Management
              </h3>
              <p className="text-gray-600">
                Manage sample registration, tracking, and analysis workflows.
              </p>
            </div>

            {/* Sample list placeholder */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Beaker size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                No Samples Registered
              </h4>
              <p className="text-gray-600 mb-4">
                Start by creating your first sample or scan a QR code to register an existing sample.
              </p>
              <div className="flex gap-2 justify-center">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Sample
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Scan QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}