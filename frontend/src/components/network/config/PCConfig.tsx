'use client';

import React, { useState, useEffect } from 'react';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { NetworkDevice } from '@/types';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

interface PCConfigProps {
  device: NetworkDevice;
  activeTab: string;
  onUpdate: (deviceId: string, updates: Partial<NetworkDevice>) => void;
  onHasChanges: (hasChanges: boolean) => void;
}

export const PCConfig: React.FC<PCConfigProps> = ({
  device,
  activeTab,
  onUpdate,
  onHasChanges,
}) => {
  const [config, setConfig] = useState(device.config || {});

  useEffect(() => {
    setConfig(device.config || {});
  }, [device.config]);

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onUpdate(device.id, { config: newConfig });
    onHasChanges(true);
  };

  const renderBasicSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">PC Network Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Computer Name"
            value={config.computerName || ''}
            onChange={(e) => handleConfigChange('computerName', e.target.value)}
            placeholder="PC-1"
            hint="The computer's name on the network"
          />
          
          <FormSelect
            label="IP Configuration"
            value={config.ipConfig || 'dhcp'}
            onChange={(e) => handleConfigChange('ipConfig', e.target.value)}
            options={[
              { value: 'dhcp', label: 'Obtain IP automatically (DHCP)' },
              { value: 'static', label: 'Use static IP address' },
            ]}
          />

          {config.ipConfig === 'static' && (
            <>
              <FormInput
                label="IP Address"
                value={config.ipAddress || ''}
                onChange={(e) => handleConfigChange('ipAddress', e.target.value)}
                placeholder="192.168.1.100"
                hint="Static IP address for this PC"
              />
              
              <FormInput
                label="Subnet Mask"
                value={config.subnetMask || ''}
                onChange={(e) => handleConfigChange('subnetMask', e.target.value)}
                placeholder="255.255.255.0"
                hint="Subnet mask for the network"
              />
              
              <FormInput
                label="Default Gateway"
                value={config.defaultGateway || ''}
                onChange={(e) => handleConfigChange('defaultGateway', e.target.value)}
                placeholder="192.168.1.1"
                hint="Default gateway (router) IP address"
              />
            </>
          )}

          <FormInput
            label="Primary DNS Server"
            value={config.primaryDNS || ''}
            onChange={(e) => handleConfigChange('primaryDNS', e.target.value)}
            placeholder="8.8.8.8"
            hint="Primary DNS server IP address"
          />
          
          <FormInput
            label="Secondary DNS Server"
            value={config.secondaryDNS || ''}
            onChange={(e) => handleConfigChange('secondaryDNS', e.target.value)}
            placeholder="8.8.4.4"
            hint="Secondary DNS server IP address (optional)"
          />

          <FormSelect
            label="Operating System"
            value={config.operatingSystem || 'windows'}
            onChange={(e) => handleConfigChange('operatingSystem', e.target.value)}
            options={[
              { value: 'windows', label: 'Windows' },
              { value: 'macos', label: 'macOS' },
              { value: 'linux', label: 'Linux' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>
      </div>
    </div>
  );

  const renderInterfaces = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Network Interface</h3>
      
      {device.interfaces.map((interface_) => (
        <div key={interface_.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">{interface_.name}</h4>
            <button
              onClick={() => {
                const newInterfaces = device.interfaces.map(iface =>
                  iface.id === interface_.id
                    ? { ...iface, status: iface.status === 'up' ? 'down' : 'up' }
                    : iface
                );
                onUpdate(device.id, { interfaces: newInterfaces });
                onHasChanges(true);
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                interface_.status === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {interface_.status === 'up' ? (
                <FiToggleRight className="w-4 h-4" />
              ) : (
                <FiToggleLeft className="w-4 h-4" />
              )}
              <span>{interface_.status === 'up' ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="MAC Address"
              value={interface_.macAddress || generateMACAddress()}
              onChange={(e) => {
                const newInterfaces = device.interfaces.map(iface =>
                  iface.id === interface_.id
                    ? { ...iface, macAddress: e.target.value }
                    : iface
                );
                onUpdate(device.id, { interfaces: newInterfaces });
                onHasChanges(true);
              }}
              placeholder="00:1A:2B:3C:4D:5E"
              hint="Physical MAC address of the network interface"
            />

            <FormSelect
              label="Speed"
              value={interface_.speed || 'auto'}
              onChange={(e) => {
                const newInterfaces = device.interfaces.map(iface =>
                  iface.id === interface_.id
                    ? { ...iface, speed: e.target.value }
                    : iface
                );
                onUpdate(device.id, { interfaces: newInterfaces });
                onHasChanges(true);
              }}
              options={[
                { value: 'auto', label: 'Auto Negotiate' },
                { value: '10', label: '10 Mbps' },
                { value: '100', label: '100 Mbps' },
                { value: '1000', label: '1 Gbps' },
              ]}
            />

            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-medium text-gray-900 mb-2">Interface Statistics</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Packets Sent:</span>
                  <span className="ml-2 font-mono">{interface_.packetsSent || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Packets Received:</span>
                  <span className="ml-2 font-mono">{interface_.packetsReceived || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bytes Sent:</span>
                  <span className="ml-2 font-mono">{interface_.bytesSent || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bytes Received:</span>
                  <span className="ml-2 font-mono">{interface_.bytesReceived || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  switch (activeTab) {
    case 'basic':
      return renderBasicSettings();
    case 'interfaces':
      return renderInterfaces();
    default:
      return null;
  }
};

function generateMACAddress(): string {
  const chars = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 2 === 0) mac += ':';
    mac += chars[Math.floor(Math.random() * chars.length)];
  }
  return mac;
}
