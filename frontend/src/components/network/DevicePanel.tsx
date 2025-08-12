'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useNetworkStore } from '@/store/networkStore';

const deviceTypes = [
  { type: 'router', name: 'Router', icon: 'í´€' },
  { type: 'switch', name: 'Switch', icon: 'í´€' },
  { type: 'pc', name: 'PC', icon: 'í²»' },
  { type: 'server', name: 'Server', icon: 'í¶¥ï¸' },
] as const;

export const DevicePanel: React.FC = () => {
  const { addDevice, devices } = useNetworkStore();

  const handleAddDevice = (type: typeof deviceTypes[0]['type']) => {
    addDevice({
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${devices.length + 1}`,
      position: { x: 100 + devices.length * 50, y: 100 + devices.length * 50 },
      interfaces: [],
      status: 'offline',
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Network Devices</h3>
      
      <div className="space-y-2 mb-6">
        {deviceTypes.map((device) => (
          <Button
            key={device.type}
            onClick={() => handleAddDevice(device.type)}
            variant="secondary"
            size="sm"
            className="w-full justify-start"
          >
            <span className="mr-2">{device.name}</span>
          </Button>
        ))}
      </div>

      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-2">
          Devices ({devices.length})
        </h4>
        <div className="space-y-1">
          {devices.map((device) => (
            <div key={device.id} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium">{device.name}</div>
              <div className="text-gray-500 text-xs">
                Status: {device.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
