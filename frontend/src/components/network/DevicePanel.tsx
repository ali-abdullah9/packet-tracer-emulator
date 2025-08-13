'use client';

import React, { useState } from 'react';
import { DragEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  FiWifi, 
  FiMonitor, 
  FiServer, 
  FiHardDrive,
  FiCircle,
  FiTrash2,
  FiEdit3,
  FiCopy
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useNetworkStore } from '@/store/networkStore';
import { NetworkDevice } from '@/types';

const deviceTypes = [
  { 
    type: 'router', 
    name: 'Router', 
    icon: FiWifi,
    color: 'bg-blue-500',
    description: 'Layer 3 routing device'
  },
  { 
    type: 'switch', 
    name: 'Switch', 
    icon: FiHardDrive,
    color: 'bg-green-500',
    description: 'Layer 2 switching device'
  },
  { 
    type: 'pc', 
    name: 'PC', 
    icon: FiMonitor,
    color: 'bg-purple-500',
    description: 'End-user workstation'
  },
  { 
    type: 'server', 
    name: 'Server', 
    icon: FiServer,
    color: 'bg-orange-500',
    description: 'Network server device'
  },
] as const;

interface DevicePanelProps {
  onOpenDeviceConfig?: (deviceId: string) => void;
}

const DraggableDeviceItem: React.FC<{ deviceType: typeof deviceTypes[0] }> = ({ 
  deviceType 
}) => {
  const handleDragStart = (event: DragEvent) => {
    event.dataTransfer.setData('application/reactflow', deviceType.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const IconComponent = deviceType.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${deviceType.color}`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{deviceType.name}</div>
          <div className="text-xs text-gray-500">{deviceType.description}</div>
        </div>
      </div>
    </motion.div>
  );
};

const DeviceListItem: React.FC<{ 
  device: NetworkDevice; 
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ device, onEdit, onDelete, onDuplicate }) => {
  const deviceType = deviceTypes.find(d => d.type === device.type);
  const IconComponent = deviceType?.icon || FiCircle;

  const statusColors = {
    online: 'text-green-500',
    offline: 'text-gray-400',
    error: 'text-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 bg-gray-50 rounded-lg border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-1.5 rounded ${deviceType?.color || 'bg-gray-500'}`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{device.name}</div>
            <div className="text-xs text-gray-500 capitalize">{device.type}</div>
            <div className="flex items-center space-x-1 mt-1">
              <FiCircle className={`w-2 h-2 ${statusColors[device.status]}`} />
              <span className="text-xs text-gray-600 capitalize">{device.status}</span>
            </div>
            {device.config?.hostname && (
              <div className="text-xs text-blue-600 mt-1">
                {device.config.hostname}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Duplicate device"
          >
            <FiCopy className="w-3 h-3" />
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Configure device"
          >
            <FiEdit3 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete device"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {device.interfaces.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Interfaces: {device.interfaces.filter(i => i.status === 'up').length}/{device.interfaces.length} active
        </div>
      )}
    </motion.div>
  );
};

export const DevicePanel: React.FC<DevicePanelProps> = ({ onOpenDeviceConfig }) => {
  const { devices, addDevice, removeDevice, updateDevice } = useNetworkStore();

  const handleQuickAdd = (type: typeof deviceTypes[0]['type']) => {
    addDevice({
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${devices.length + 1}`,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      interfaces: generateDefaultInterfaces(type),
      status: 'offline',
    });
  };

  const handleDuplicateDevice = (device: NetworkDevice) => {
    addDevice({
      ...device,
      name: `${device.name}-Copy`,
      position: { 
        x: device.position.x + 50, 
        y: device.position.y + 50 
      },
    });
  };

  const handleEditDevice = (deviceId: string) => {
    if (onOpenDeviceConfig) {
      onOpenDeviceConfig(deviceId);
    }
  };

  const handleDeleteDevice = (deviceId: string) => {
    removeDevice(deviceId);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Network Devices</h3>
        
        {/* Device Library */}
        <div className="space-y-2 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Device Library</h4>
          <div className="text-xs text-gray-500 mb-3">
            Drag devices to the canvas to add them
          </div>
          {deviceTypes.map((deviceType) => (
            <DraggableDeviceItem 
              key={deviceType.type} 
              deviceType={deviceType}
            />
          ))}
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Quick Add</h4>
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.map((device) => (
              <Button
                key={device.type}
                onClick={() => handleQuickAdd(device.type)}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                + {device.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Active Devices ({devices.length})
          </h4>
          {devices.length > 0 && (
            <Button
              onClick={() => devices.forEach(d => removeDevice(d.id))}
              variant="danger"
              size="sm"
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No devices in network</div>
            <div className="text-xs text-gray-500">
              Drag devices from above or use quick add buttons
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <DeviceListItem
                key={device.id}
                device={device}
                onEdit={() => handleEditDevice(device.id)}
                onDelete={() => handleDeleteDevice(device.id)}
                onDuplicate={() => handleDuplicateDevice(device)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function generateDefaultInterfaces(deviceType: string) {
  switch (deviceType) {
    case 'router':
      return [
        { id: 'eth0', name: 'GigabitEthernet0/0', status: 'down' as const },
        { id: 'eth1', name: 'GigabitEthernet0/1', status: 'down' as const },
        { id: 'serial0', name: 'Serial0/0/0', status: 'down' as const },
      ];
    case 'switch':
      return Array.from({ length: 8 }, (_, i) => ({
        id: `fa${i}`,
        name: `FastEthernet0/${i + 1}`,
        status: 'down' as const,
      }));
    case 'pc':
    case 'server':
      return [
        { id: 'eth0', name: 'Ethernet0', status: 'down' as const },
      ];
    default:
      return [];
  }
}
