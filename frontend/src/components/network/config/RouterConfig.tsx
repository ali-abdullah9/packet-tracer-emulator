'use client';

import React, { useState, useEffect } from 'react';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { NetworkDevice, InterfaceConfig, RouteEntry } from '@/types';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

interface RouterConfigProps {
  device: NetworkDevice;
  activeTab: string;
  onUpdate: (deviceId: string, updates: Partial<NetworkDevice>) => void;
  onHasChanges: (hasChanges: boolean) => void;
}

export const RouterConfig: React.FC<RouterConfigProps> = ({
  device,
  activeTab,
  onUpdate,
  onHasChanges,
}) => {
  const [config, setConfig] = useState(device.config || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(device.config || {});
  }, [device.config]);

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onUpdate(device.id, { config: newConfig });
    onHasChanges(true);
    
    // Clear related errors
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const renderBasicSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Router Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Hostname"
            value={config.hostname || ''}
            onChange={(e) => handleConfigChange('hostname', e.target.value)}
            placeholder="Router-1"
            hint="The router's hostname for identification"
          />
          
          <FormInput
            label="Enable Password"
            type="password"
            value={config.enablePassword || ''}
            onChange={(e) => handleConfigChange('enablePassword', e.target.value)}
            placeholder="Enter enable password"
            hint="Password for privileged EXEC mode"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Router Type"
              value={config.routerType || 'generic'}
              onChange={(e) => handleConfigChange('routerType', e.target.value)}
              options={[
                { value: 'generic', label: 'Generic Router' },
                { value: 'edge', label: 'Edge Router' },
                { value: 'core', label: 'Core Router' },
                { value: 'border', label: 'Border Router' },
              ]}
            />

            <FormSelect
              label="Routing Protocol"
              value={config.routingProtocol || 'static'}
              onChange={(e) => handleConfigChange('routingProtocol', e.target.value)}
              options={[
                { value: 'static', label: 'Static Routing' },
                { value: 'rip', label: 'RIP' },
                { value: 'ospf', label: 'OSPF' },
                { value: 'eigrp', label: 'EIGRP' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderInterfaces = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Interface Configuration</h3>
        <Button
          size="sm"
          onClick={() => {
            const newInterface = {
              id: `eth${device.interfaces.length}`,
              name: `GigabitEthernet0/${device.interfaces.length}`,
              status: 'down' as const,
            };
            onUpdate(device.id, {
              interfaces: [...device.interfaces, newInterface]
            });
            onHasChanges(true);
          }}
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Interface
        </Button>
      </div>

      <div className="space-y-4">
        {device.interfaces.map((interface_, index) => (
          <div key={interface_.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
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
                  <span>{interface_.status}</span>
                </button>
              </div>
              
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const newInterfaces = device.interfaces.filter(iface => iface.id !== interface_.id);
                  onUpdate(device.id, { interfaces: newInterfaces });
                  onHasChanges(true);
                }}
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="IP Address"
                value={interface_.ipAddress || ''}
                onChange={(e) => {
                  const newInterfaces = device.interfaces.map(iface =>
                    iface.id === interface_.id
                      ? { ...iface, ipAddress: e.target.value }
                      : iface
                  );
                  onUpdate(device.id, { interfaces: newInterfaces });
                  onHasChanges(true);
                }}
                placeholder="192.168.1.1"
                error={errors[`${interface_.id}-ip`]}
              />
              
              <FormInput
                label="Subnet Mask"
                value={interface_.subnetMask || ''}
                onChange={(e) => {
                  const newInterfaces = device.interfaces.map(iface =>
                    iface.id === interface_.id
                      ? { ...iface, subnetMask: e.target.value }
                      : iface
                  );
                  onUpdate(device.id, { interfaces: newInterfaces });
                  onHasChanges(true);
                }}
                placeholder="255.255.255.0"
                error={errors[`${interface_.id}-mask`]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRouting = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Routing Table</h3>
        <Button
          size="sm"
          onClick={() => {
            const newRoute: RouteEntry = {
              destination: '',
              netmask: '',
              gateway: '',
              interface: device.interfaces[0]?.name || '',
            };
            const currentRoutes = config.routingTable || [];
            handleConfigChange('routingTable', [...currentRoutes, newRoute]);
          }}
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="space-y-4">
        {(config.routingTable || []).map((route: RouteEntry, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Route {index + 1}</h4>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const newRoutes = (config.routingTable || []).filter((_: any, i: number) => i !== index);
                  handleConfigChange('routingTable', newRoutes);
                }}
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Destination Network"
                value={route.destination}
                onChange={(e) => {
                  const newRoutes = [...(config.routingTable || [])];
                  newRoutes[index] = { ...route, destination: e.target.value };
                  handleConfigChange('routingTable', newRoutes);
                }}
                placeholder="192.168.1.0"
              />
              
              <FormInput
                label="Netmask"
                value={route.netmask}
                onChange={(e) => {
                  const newRoutes = [...(config.routingTable || [])];
                  newRoutes[index] = { ...route, netmask: e.target.value };
                  handleConfigChange('routingTable', newRoutes);
                }}
                placeholder="255.255.255.0"
              />
              
              <FormInput
                label="Gateway"
                value={route.gateway}
                onChange={(e) => {
                  const newRoutes = [...(config.routingTable || [])];
                  newRoutes[index] = { ...route, gateway: e.target.value };
                  handleConfigChange('routingTable', newRoutes);
                }}
                placeholder="192.168.1.1"
              />
              
              <FormSelect
                label="Interface"
                value={route.interface}
                onChange={(e) => {
                  const newRoutes = [...(config.routingTable || [])];
                  newRoutes[index] = { ...route, interface: e.target.value };
                  handleConfigChange('routingTable', newRoutes);
                }}
                options={device.interfaces.map(iface => ({
                  value: iface.name,
                  label: iface.name,
                }))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="SNMP Community String"
          value={config.snmpCommunity || ''}
          onChange={(e) => handleConfigChange('snmpCommunity', e.target.value)}
          placeholder="public"
          hint="SNMP read community string"
        />
        
        <FormInput
          label="NTP Server"
          value={config.ntpServer || ''}
          onChange={(e) => handleConfigChange('ntpServer', e.target.value)}
          placeholder="pool.ntp.org"
          hint="Network Time Protocol server"
        />

        <FormSelect
          label="Log Level"
          value={config.logLevel || 'informational'}
          onChange={(e) => handleConfigChange('logLevel', e.target.value)}
          options={[
            { value: 'emergencies', label: 'Emergencies' },
            { value: 'alerts', label: 'Alerts' },
            { value: 'critical', label: 'Critical' },
            { value: 'errors', label: 'Errors' },
            { value: 'warnings', label: 'Warnings' },
            { value: 'notifications', label: 'Notifications' },
            { value: 'informational', label: 'Informational' },
            { value: 'debugging', label: 'Debugging' },
          ]}
        />
      </div>
    </div>
  );

  switch (activeTab) {
    case 'basic':
      return renderBasicSettings();
    case 'interfaces':
      return renderInterfaces();
    case 'routing':
      return renderRouting();
    case 'advanced':
      return renderAdvanced();
    default:
      return null;
  }
};
