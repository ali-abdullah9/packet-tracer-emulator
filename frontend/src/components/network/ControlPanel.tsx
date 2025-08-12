'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useNetworkStore } from '@/store/networkStore';

export const ControlPanel: React.FC = () => {
  const { isRunning, startSimulation, stopSimulation, resetSimulation } = useNetworkStore();

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Control</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={isRunning ? stopSimulation : startSimulation}
          variant={isRunning ? 'danger' : 'success'}
          className="w-full"
        >
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </Button>
        
        <Button 
          onClick={resetSimulation}
          variant="secondary"
          className="w-full"
        >
          Reset Network
        </Button>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="secondary" size="sm" className="w-full">
            Send Ping
          </Button>
          <Button variant="secondary" size="sm" className="w-full">
            DNS Lookup
          </Button>
          <Button variant="secondary" size="sm" className="w-full">
            Trace Route
          </Button>
        </div>
      </div>
    </div>
  );
};
