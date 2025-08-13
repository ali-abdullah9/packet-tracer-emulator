'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { 
  FiWifi, 
  FiMonitor, 
  FiServer, 
  FiHardDrive,
  FiCircle,
  FiSettings 
} from 'react-icons/fi';
import { NetworkDevice } from '@/types';
import { useNetworkStore } from '@/store/networkStore';

interface DeviceNodeData {
  device: NetworkDevice;
  isRunning: boolean;
  isSelected?: boolean;
  onOpenConfig?: (deviceId: string) => void;
}

const deviceIcons = {
  router: FiWifi,
  switch: FiHardDrive,
  pc: FiMonitor,
  server: FiServer,
};

const deviceColors = {
  router: 'bg-blue-500',
  switch: 'bg-green-500', 
  pc: 'bg-purple-500',
  server: 'bg-orange-500',
};

const statusColors = {
  online: 'text-green-500',
  offline: 'text-gray-400',
  error: 'text-red-500',
};

export const DeviceNode: React.FC<NodeProps<DeviceNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  const { updateDevice } = useNetworkStore();
  const { device, isRunning, onOpenConfig } = data;
  const IconComponent = deviceIcons[device.type];

  const handleDoubleClick = () => {
    // Toggle device status on double click
    const newStatus = device.status === 'online' ? 'offline' : 'online';
    updateDevice(device.id, { status: newStatus });
  };

  const handleConfigClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenConfig) {
      onOpenConfig(device.id);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-lg border-2 bg-white shadow-lg min-w-[120px] group ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Connection handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />

      {/* Device content */}
      <div className="text-center">
        {/* Device icon */}
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${deviceColors[device.type]}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>

        {/* Device name */}
        <div className="text-sm font-medium text-gray-900 mb-1">
          {device.name}
        </div>

        {/* Device status */}
        <div className="flex items-center justify-center space-x-1">
          <FiCircle className={`w-3 h-3 ${statusColors[device.status]}`} />
          <span className="text-xs text-gray-600 capitalize">
            {device.status}
          </span>
        </div>

        {/* Interface count */}
        <div className="text-xs text-gray-500 mt-1">
          {device.interfaces.length} interfaces
        </div>

        {/* Configuration info */}
        {device.config?.hostname && (
          <div className="text-xs text-blue-600 mt-1">
            {device.config.hostname}
          </div>
        )}
      </div>

      {/* Running indicator */}
      {isRunning && device.status === 'online' && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Settings button */}
      <button
        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-sm"
        onClick={handleConfigClick}
        title="Configure device"
      >
        <FiSettings className="w-3 h-3" />
      </button>

      {/* Quick status indicators */}
      <div className="absolute bottom-1 left-1 flex space-x-1">
        {device.config?.ipAddress && (
          <div className="w-2 h-2 bg-blue-400 rounded-full" title="IP configured" />
        )}
        {device.interfaces.some(i => i.status === 'up') && (
          <div className="w-2 h-2 bg-green-400 rounded-full" title="Interface active" />
        )}
      </div>
    </motion.div>
  );
};
