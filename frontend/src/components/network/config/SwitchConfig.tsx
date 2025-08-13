'use client';

import React, { useState, useEffect } from 'react';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { NetworkDevice } from '@/types';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

interface SwitchConfigProps {
  device: NetworkDevice;
  activeTab: string;
  onUpdate: (deviceId: string, updates: Partial<NetworkDevice>) => void;
  onHasChanges: (hasChanges: boolean) => void;
}

export const SwitchConfig: React.FC<SwitchConfigProps> = ({
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Switch Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Hostname"
            value={config.hostname || ''}
            onChange={(e) => handleConfigChange('hostname', e.target.value)}
            placeholder="Switch-1"
            hint="The switch's hostname for identification"
          />
          
          <FormInput
            label="Management IP Address"
            value={config.managementIP || ''}
            onChange={(e) => handleConfigChange('managementIP', e.target.value)}
            placeholder="192.168.1.10"
            hint="IP address for switch management"
          />

          <FormInput
            label="Management Subnet Mask"
            value={config.managementMask || ''}
            onChange={(e) => handleConfigChange('managementMask', e.target.value)}
            placeholder="255.255.255.0"
            hint="Subnet mask for management network"
          />

          <FormInput
            label="Default Gateway"
            value={config.defaultGateway || ''}
            onChange={(e) => handleConfigChange('defaultGateway', e.target.value)}
            placeholder="192.168.1.1"
            hint="Default gateway for management traffic"
          />

          <FormSelect
            label="Switch Type"
            value={config.switchType || 'access'}
            onChange={(e) => handleConfigChange('switchType', e.target.value)}
            options={[
              { value: 'access', label: 'Access Switch' },
              { value: 'distribution', label: 'Distribution Switch' },
              { value: 'core', label: 'Core Switch' },
            ]}
          />
        </div>
      </div>
    </div>
  );

  const renderInterfaces = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Port Configuration</h3>
        <div className="text-sm text-gray-500">
          {device.interfaces.filter(i => i.status === 'up').length} of {device.interfaces.length} ports active
        </div>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormSelect
                label="Port Mode"
                value={interface_.mode || 'access'}
                onChange={(e) => {
                  const newInterfaces = device.interfaces.map(iface =>
                    iface.id === interface_.id
                      ? { ...iface, mode: e.target.value }
                      : iface
                  );
                  onUpdate(device.id, { interfaces: newInterfaces });
                  onHasChanges(true);
                }}
                options={[
                  { value: 'access', label: 'Access' },
                  { value: 'trunk', label: 'Trunk' },
                ]}
              />
              
              <FormInput
                label="Access VLAN"
                value={interface_.accessVlan || '1'}
                onChange={(e) => {
                  const newInterfaces = device.interfaces.map(iface =>
                    iface.id === interface_.id
                      ? { ...iface, accessVlan: e.target.value }
                      : iface
                  );
                  onUpdate(device.id, { interfaces: newInterfaces });
                  onHasChanges(true);
                }}
                placeholder="1"
                disabled={interface_.mode === 'trunk'}
              />
              
              <FormSelect
                label="Speed/Duplex"
                value={interface_.speedDuplex || 'auto'}
                onChange={(e) => {
                  const newInterfaces = device.interfaces.map(iface =>
                    iface.id === interface_.id
                      ? { ...iface, speedDuplex: e.target.value }
                      : iface
                  );
                  onUpdate(device.id, { interfaces: newInterfaces });
                  onHasChanges(true);
                }}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: '10-half', label: '10 Mbps Half' },
                  { value: '10-full', label: '10 Mbps Full' },
                  { value: '100-half', label: '100 Mbps Half' },
                  { value: '100-full', label: '100 Mbps Full' },
                  { value: '1000-full', label: '1 Gbps Full' },
                ]}
              />
            </div>

            {interface_.mode === 'trunk' && (
              <div className="mt-4">
                <FormInput
                  label="Allowed VLANs"
                  value={interface_.allowedVlans || '1-4094'}
                  onChange={(e) => {
                    const newInterfaces = device.interfaces.map(iface =>
                      iface.id === interface_.id
                        ? { ...iface, allowedVlans: e.target.value }
                        : iface
                    );
                    onUpdate(device.id, { interfaces: newInterfaces });
                    onHasChanges(true);
                  }}
                  placeholder="1-4094"
                  hint="Comma-separated VLAN list (e.g., 1,10,20-30)"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">VLAN Configuration</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">VLANs</h4>
          <Button
            size="sm"
            onClick={() => {
              const vlans = config.vlans || [];
              const newVlan = {
                id: vlans.length + 1,
                name: `VLAN${vlans.length + 1}`,
                description: '',
              };
              handleConfigChange('vlans', [...vlans, newVlan]);
            }}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add VLAN
          </Button>
        </div>

        {(config.vlans || []).map((vlan: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-900">VLAN {vlan.id}</h5>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const newVlans = (config.vlans || []).filter((_: any, i: number) => i !== index);
                  handleConfigChange('vlans', newVlans);
                }}
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="VLAN ID"
                type="number"
                value={vlan.id}
                onChange={(e) => {
                  const newVlans = [...(config.vlans || [])];
                  newVlans[index] = { ...vlan, id: parseInt(e.target.value) };
                  handleConfigChange('vlans', newVlans);
                }}
                min="1"
                max="4094"
              />
              
              <FormInput
                label="VLAN Name"
                value={vlan.name}
                onChange={(e) => {
                  const newVlans = [...(config.vlans || [])];
                  newVlans[index] = { ...vlan, name: e.target.value };
                  handleConfigChange('vlans', newVlans);
                }}
                placeholder="Sales"
              />
            </div>

            <div className="mt-4">
              <FormInput
                label="Description"
                value={vlan.description}
                onChange={(e) => {
                  const newVlans = [...(config.vlans || [])];
                  newVlans[index] = { ...vlan, description: e.target.value };
                  handleConfigChange('vlans', newVlans);
                }}
                placeholder="Sales department network"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (activeTab) {
    case 'basic':
      return renderBasicSettings();
    case 'interfaces':
      return renderInterfaces();
    case 'advanced':
      return renderAdvanced();
    default:
      return null;
  }
};
