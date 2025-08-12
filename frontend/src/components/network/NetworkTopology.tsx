'use client';

import React from 'react';

export const NetworkTopology: React.FC = () => {
  return (
    <div className="flex-1 bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Network Topology</h3>
          <p className="text-gray-500">Network visualization will appear here</p>
        </div>
      </div>
    </div>
  );
};
