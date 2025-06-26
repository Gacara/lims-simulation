import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Beaker, BarChart3, Settings } from 'lucide-react';

export function LIMSInterface() {
  const { toggleLIMS } = useGameStore();

  return (
    <div className="absolute inset-0 bg-latte-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-sand-50 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-sand-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sand-300">
          <div className="flex items-center gap-2">
            <Beaker className="text-latte-700" size={24} />
            <h2 className="text-xl font-semibold text-latte-900">
              Laboratory Information Management System
            </h2>
          </div>
          <button
            onClick={toggleLIMS}
            className="p-2 hover:bg-sand-200 rounded-lg transition-colors text-latte-600 hover:text-latte-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-sand-100 border-r border-sand-300 p-4">
            <nav className="space-y-2">
              <div className="text-sm font-medium text-latte-600 uppercase tracking-wide">
                Modules
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-latte-200 text-latte-800 rounded-lg shadow-sm">
                <Beaker size={16} />
                Sample Management
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-latte-700 hover:bg-sand-200 rounded-lg transition-colors">
                <BarChart3 size={16} />
                Analysis Results
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-latte-700 hover:bg-sand-200 rounded-lg transition-colors">
                <Settings size={16} />
                Equipment Control
              </button>
            </nav>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-latte-900 mb-2">
                Sample Management
              </h3>
              <p className="text-latte-700">
                Manage sample registration, tracking, and analysis workflows.
              </p>
            </div>

            {/* Sample list placeholder */}
            <div className="bg-sand-100 rounded-lg p-8 text-center border border-sand-200">
              <Beaker size={48} className="mx-auto text-latte-500 mb-4" />
              <h4 className="text-lg font-medium text-latte-900 mb-2">
                No Samples Registered
              </h4>
              <p className="text-latte-700 mb-4">
                Start by creating your first sample or scan a QR code to register an existing sample.
              </p>
              <div className="flex gap-2 justify-center">
                <button className="px-4 py-2 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 transition-colors shadow-md">
                  Create Sample
                </button>
                <button className="px-4 py-2 border border-sand-300 text-latte-700 rounded-lg hover:bg-sand-200 transition-colors">
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