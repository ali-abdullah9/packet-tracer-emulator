'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useNetworkStore } from '@/store/networkStore';
import { NetworkDevice } from '@/types';
import { RouterConfig } from './config/RouterConfig';
import { SwitchConfig } from './config/SwitchConfig';
import { PCConfig } from './config/PCConfig';
import { ServerConfig } from './config/ServerConfig';

interface DeviceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
}

export const DeviceConfigModal: React.FC<DeviceConfigModalProps> = ({
  isOpen,
  onClose,
  deviceId,
}) => {
  const { devices, updateDevice } = useNetworkStore();
  const [activeTab, setActiveTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);

  const device = deviceId ? devices.find(d => d.id === deviceId) : null;

  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic');
      setHasChanges(false);
    }
  }, [isOpen]);

  if (!device) return null;

  const handleSave = () => {
    // Configuration will be saved automatically through the config components
    setHasChanges(false);
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Settings' },
    { id: 'interfaces', label: 'Interfaces' },
    { id: 'routing', label: 'Routing' },
    { id: 'advanced', label: 'Advanced' },
  ];

  // Filter tabs based on device type
  const availableTabs = tabs.filter(tab => {
    if (device.type === 'pc' || device.type === 'server') {
      return ['basic', 'interfaces'].includes(tab.id);
    }
    return true;
  });

  const renderConfigComponent = () => {
    switch (device.type) {
      case 'router':
        return (
          <RouterConfig
            device={device}
            activeTab={activeTab}
            onUpdate={updateDevice}
            onHasChanges={setHasChanges}
          />
        );
      case 'switch':
        return (
          <SwitchConfig
            device={device}
            activeTab={activeTab}
            onUpdate={updateDevice}
            onHasChanges={setHasChanges}
          />
        );
      case 'pc':
        return (
          <PCConfig
            device={device}
            activeTab={activeTab}
            onUpdate={updateDevice}
            onHasChanges={setHasChanges}
          />
        );
      case 'server':
        return (
          <ServerConfig
            device={device}
            activeTab={activeTab}
            onUpdate={updateDevice}
            onHasChanges={setHasChanges}
          />
        );
      default:
        return <div>Unsupported device type</div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Configure ${device.name}`}
      size="lg"
    >
      <div className="flex h-[600px]">
        {/* Sidebar with tabs */}
        <div className="w-48 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              {device.type.toUpperCase()} Configuration
            </div>
            <div className="text-xs text-gray-500 mb-4">
              {device.name}
            </div>
            <nav className="space-y-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {renderConfigComponent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>Unsaved changes</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
