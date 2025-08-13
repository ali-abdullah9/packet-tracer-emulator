'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { useNetworkStore } from '@/store/networkStore';
import { FiTarget, FiGlobe, FiMapPin, FiPlay, FiSquare } from 'react-icons/fi';

export const ControlPanel: React.FC = () => {
  const { 
    isRunning, 
    startSimulation, 
    stopSimulation, 
    resetSimulation,
    devices,
    addPacket,
    updatePacket
  } = useNetworkStore();

  const [selectedSource, setSelectedSource] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [showQuickActionForm, setShowQuickActionForm] = useState<string | null>(null);

  const availableDevices = devices.filter(device => 
    device.status === 'online' && device.interfaces.some(iface => iface.status === 'up')
  );

  const simulatePacketJourney = (packetId: string, destinationType: 'success' | 'failure' | 'timeout') => {
    const delays = {
      success: 4000, // 4 seconds for successful delivery
      failure: 2000, // 2 seconds before dropping
      timeout: 6000, // 6 seconds for timeout
    };

    setTimeout(() => {
      if (destinationType === 'success') {
        updatePacket(packetId, { status: 'received' });
      } else if (destinationType === 'failure') {
        updatePacket(packetId, { status: 'dropped' });
      } else {
        updatePacket(packetId, { status: 'dropped' });
      }
    }, delays[destinationType]);
  };

  const handleSendPing = () => {
    if (!selectedSource || !selectedTarget) {
      alert('Please select both source and target devices');
      return;
    }

    if (selectedSource === selectedTarget) {
      alert('Source and target must be different devices');
      return;
    }

    const packetId = `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    addPacket({
      id: packetId,
      source: selectedSource,
      destination: selectedTarget,
      protocol: 'ICMP',
      status: 'transmitted',
      path: [selectedSource, selectedTarget],
      timestamp: Date.now(),
    });

    // Simulate packet completion (90% success rate)
    const success = Math.random() > 0.1;
    simulatePacketJourney(packetId, success ? 'success' : 'failure');

    setShowQuickActionForm(null);
  };

  const handleDNSLookup = () => {
    if (!selectedSource) {
      alert('Please select a source device');
      return;
    }

    // Find a server that could act as DNS server
    const dnsServer = devices.find(device => 
      device.type === 'server' && 
      device.status === 'online' &&
      device.config?.services?.some((service: any) => service.name === 'DNS')
    );

    if (!dnsServer) {
      alert('No DNS server found in the network. Add a server and configure DNS service.');
      return;
    }

    const packetId = `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    addPacket({
      id: packetId,
      source: selectedSource,
      destination: dnsServer.id,
      protocol: 'DNS',
      status: 'transmitted',
      path: [selectedSource, dnsServer.id],
      timestamp: Date.now(),
    });

    // DNS typically succeeds
    simulatePacketJourney(packetId, 'success');

    setShowQuickActionForm(null);
  };

  const handleTraceRoute = () => {
    if (!selectedSource || !selectedTarget) {
      alert('Please select both source and target devices');
      return;
    }

    if (selectedSource === selectedTarget) {
      alert('Source and target must be different devices');
      return;
    }

    // Find path through routers
    const routers = devices.filter(d => d.type === 'router' && d.status === 'online');
    const path = [selectedSource];
    
    if (routers.length > 0 && routers[0].id !== selectedSource && routers[0].id !== selectedTarget) {
      path.push(routers[0].id);
    }
    
    path.push(selectedTarget);

    const packetId = `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    addPacket({
      id: packetId,
      source: selectedSource,
      destination: selectedTarget,
      protocol: 'ICMP',
      status: 'transmitted',
      path: path,
      timestamp: Date.now(),
    });

    // Traceroute has higher chance of completing
    simulatePacketJourney(packetId, 'success');

    setShowQuickActionForm(null);
  };

  const renderQuickActionForm = () => {
    if (!showQuickActionForm) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <h5 className="font-medium text-gray-900 mb-3">
          {showQuickActionForm === 'ping' && 'Send Ping'}
          {showQuickActionForm === 'dns' && 'DNS Lookup'}
          {showQuickActionForm === 'traceroute' && 'Trace Route'}
        </h5>

        <div className="space-y-3">
          <FormSelect
            label="Source Device"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            options={[
              { value: '', label: 'Select source device...' },
              ...availableDevices.map(device => ({
                value: device.id,
                label: `${device.name} (${device.type})`
              }))
            ]}
            required
          />

          {(showQuickActionForm === 'ping' || showQuickActionForm === 'traceroute') && (
            <FormSelect
              label="Target Device"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              options={[
                { value: '', label: 'Select target device...' },
                ...availableDevices
                  .filter(device => device.id !== selectedSource)
                  .map(device => ({
                    value: device.id,
                    label: `${device.name} (${device.type})`
                  }))
              ]}
              required
            />
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                if (showQuickActionForm === 'ping') handleSendPing();
                else if (showQuickActionForm === 'dns') handleDNSLookup();
                else if (showQuickActionForm === 'traceroute') handleTraceRoute();
              }}
              variant="primary"
              size="sm"
              disabled={!isRunning || availableDevices.length === 0}
            >
              Execute
            </Button>
            <Button
              onClick={() => setShowQuickActionForm(null)}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Control</h3>
      
      <div className="space-y-3 mb-6">
        <Button 
          onClick={isRunning ? stopSimulation : startSimulation}
          variant={isRunning ? 'danger' : 'success'}
          className="w-full"
        >
          {isRunning ? (
            <>
              <FiSquare className="w-4 h-4 mr-2" />
              Stop Simulation
            </>
          ) : (
            <>
              <FiPlay className="w-4 h-4 mr-2" />
              Start Simulation
            </>
          )}
        </Button>
        
        <Button 
          onClick={resetSimulation}
          variant="secondary"
          className="w-full"
        >
          Reset Network
        </Button>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">Quick Actions</h4>
        
        {!isRunning && (
          <div className="text-sm text-gray-500 mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            Start simulation to enable quick actions
          </div>
        )}

        {availableDevices.length === 0 && isRunning && (
          <div className="text-sm text-gray-500 mb-3 p-2 bg-orange-50 rounded border border-orange-200">
            No online devices with active interfaces found
          </div>
        )}

        <div className="space-y-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => setShowQuickActionForm('ping')}
            disabled={!isRunning || availableDevices.length < 2}
          >
            <FiTarget className="w-4 h-4 mr-2" />
            Send Ping
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => setShowQuickActionForm('dns')}
            disabled={!isRunning || availableDevices.length === 0}
          >
            <FiGlobe className="w-4 h-4 mr-2" />
            DNS Lookup
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => setShowQuickActionForm('traceroute')}
            disabled={!isRunning || availableDevices.length < 2}
          >
            <FiMapPin className="w-4 h-4 mr-2" />
            Trace Route
          </Button>
        </div>

        {renderQuickActionForm()}
      </div>

      {/* Network Statistics */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-2">Network Status</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Devices:</span>
            <span className="font-medium">{devices.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Online Devices:</span>
            <span className="font-medium text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active Interfaces:</span>
            <span className="font-medium text-blue-600">
              {devices.reduce((sum, device) => 
                sum + device.interfaces.filter(iface => iface.status === 'up').length, 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
