'use client';

import React, { useState, useEffect } from 'react';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { NetworkDevice } from '@/types';
import { FiToggleLeft, FiToggleRight, FiPlus, FiTrash2 } from 'react-icons/fi';

interface ServerConfigProps {
  device: NetworkDevice;
  activeTab: string;
  onUpdate: (deviceId: string, updates: Partial<NetworkDevice>) => void;
  onHasChanges: (hasChanges: boolean) => void;
}

export const ServerConfig: React.FC<ServerConfigProps> = ({
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Server Configuration</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Server Name"
            value={config.serverName || ''}
            onChange={(e) => handleConfigChange('serverName', e.target.value)}
            placeholder="WebServer-1"
            hint="The server's hostname"
          />
          
          <FormSelect
            label="Server Type"
            value={config.serverType || 'web'}
            onChange={(e) => handleConfigChange('serverType', e.target.value)}
            options={[
              { value: 'web', label: 'Web Server' },
              { value: 'dns', label: 'DNS Server' },
              { value: 'dhcp', label: 'DHCP Server' },
              { value: 'ftp', label: 'FTP Server' },
              { value: 'email', label: 'Email Server' },
              { value: 'database', label: 'Database Server' },
              { value: 'file', label: 'File Server' },
            ]}
          />

          <FormInput
            label="IP Address"
            value={config.ipAddress || ''}
            onChange={(e) => handleConfigChange('ipAddress', e.target.value)}
            placeholder="192.168.1.10"
            hint="Static IP address for the server"
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
            hint="Default gateway IP address"
          />

          <FormSelect
            label="Operating System"
            value={config.operatingSystem || 'linux'}
            onChange={(e) => handleConfigChange('operatingSystem', e.target.value)}
            options={[
              { value: 'linux', label: 'Linux' },
              { value: 'windows-server', label: 'Windows Server' },
              { value: 'unix', label: 'Unix' },
              { value: 'freebsd', label: 'FreeBSD' },
            ]}
          />
        </div>
      </div>

      {/* Services Configuration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Services</h4>
          <Button
            size="sm"
            onClick={() => {
              const services = config.services || [];
              const newService = {
                name: 'HTTP',
                port: 80,
                enabled: true,
                protocol: 'TCP',
              };
              handleConfigChange('services', [...services, newService]);
            }}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        <div className="space-y-3">
          {(config.services || []).map((service: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <button
                    onClick={() => {
                      const newServices = [...(config.services || [])];
                      newServices[index] = { ...service, enabled: !service.enabled };
                      handleConfigChange('services', newServices);
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                      service.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {service.enabled ? (
                      <FiToggleRight className="w-4 h-4" />
                    ) : (
                      <FiToggleLeft className="w-4 h-4" />
                    )}
                    <span>{service.enabled ? 'Running' : 'Stopped'}</span>
                  </button>
                </div>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newServices = (config.services || []).filter((_: any, i: number) => i !== index);
                    handleConfigChange('services', newServices);
                  }}
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormInput
                  label="Service Name"
                  value={service.name}
                  onChange={(e) => {
                    const newServices = [...(config.services || [])];
                    newServices[index] = { ...service, name: e.target.value };
                    handleConfigChange('services', newServices);
                  }}
                  placeholder="HTTP"
                />
                
                <FormInput
                  label="Port"
                  type="number"
                  value={service.port}
                  onChange={(e) => {
                    const newServices = [...(config.services || [])];
                    newServices[index] = { ...service, port: parseInt(e.target.value) };
                    handleConfigChange('services', newServices);
                  }}
                  placeholder="80"
                  min="1"
                  max="65535"
                />
                
                <FormSelect
                  label="Protocol"
                  value={service.protocol}
                  onChange={(e) => {
                    const newServices = [...(config.services || [])];
                    newServices[index] = { ...service, protocol: e.target.value };
                    handleConfigChange('services', newServices);
                  }}
                  options={[
                    { value: 'TCP', label: 'TCP' },
                    { value: 'UDP', label: 'UDP' },
                  ]}
                />
              </div>
            </div>
          ))}
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
              <span>{interface_.status === 'up' ? 'Up' : 'Down'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            />

            <FormSelect
              label="Speed"
              value={interface_.speed || '1000'}
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
                { value: '100', label: '100 Mbps' },
                { value: '1000', label: '1 Gbps' },
                { value: '10000', label: '10 Gbps' },
              ]}
            />
          </div>

          <div className="mt-4 bg-gray-50 p-3 rounded">
            <h5 className="font-medium text-gray-900 mb-2">Performance Metrics</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">CPU Usage:</span>
                <span className="ml-2 font-mono">{Math.floor(Math.random() * 100)}%</span>
              </div>
              <div>
                <span className="text-gray-600">Memory Usage:</span>
                <span className="ml-2 font-mono">{Math.floor(Math.random() * 100)}%</span>
              </div>
              <div>
                <span className="text-gray-600">Network I/O:</span>
                <span className="ml-2 font-mono">{Math.floor(Math.random() * 1000)} KB/s</span>
              </div>
              <div>
                <span className="text-gray-600">Uptime:</span>
                <span className="ml-2 font-mono">{Math.floor(Math.random() * 365)} days</span>
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
