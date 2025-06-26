import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Package, Beaker, Wrench } from 'lucide-react';

export function InventoryPanel() {
  const { toggleInventory, inventory } = useGameStore();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'sample':
        return <Beaker size={16} />;
      case 'tool':
        return <Wrench size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Package className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Laboratory Inventory
            </h2>
          </div>
          <button
            onClick={toggleInventory}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Empty Inventory
              </h3>
              <p className="text-gray-600">
                Your laboratory inventory is empty. Start by purchasing equipment or collecting samples.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">
                        {item.name}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        Type: {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">
                          Qty: {item.quantity}
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Use
                        </button>
                      </div>
                    </div>
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