'use client';

import React, { useState } from 'react';
import { 
  FiTrash2, 
  FiFilter,
  FiClock,
  FiTarget,
  FiZap,
  FiX,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useNetworkStore } from '@/store/networkStore';
import { PacketFlow as PacketFlowType } from '@/types';

const protocolColors = {
  ICMP: 'bg-blue-100 text-blue-800 border-blue-200',
  TCP: 'bg-green-100 text-green-800 border-green-200',
  UDP: 'bg-purple-100 text-purple-800 border-purple-200',
  ARP: 'bg-orange-100 text-orange-800 border-orange-200',
  DNS: 'bg-red-100 text-red-800 border-red-200',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  transmitted: 'bg-blue-100 text-blue-800 border-blue-200',
  received: 'bg-green-100 text-green-800 border-green-200',
  dropped: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  pending: FiClock,
  transmitted: FiZap,
  received: FiTarget,
  dropped: FiX,
};

export const PacketFlow: React.FC = () => {
  const { 
    packets, 
    devices, 
    clearPackets, 
    addPacket, 
    isRunning 
  } = useNetworkStore();
  
  const [filter, setFilter] = useState<string>('all');
  const [selectedPacket, setSelectedPacket] = useState<string | null>(null);

  const filteredPackets = packets.filter(packet => {
    if (filter === 'all') return true;
    return packet.protocol === filter || packet.status === filter;
  });

  const sortedPackets = [...filteredPackets].sort((a, b) => b.timestamp - a.timestamp);

  const handleSendTestPacket = (protocol: PacketFlowType['protocol']) => {
    if (devices.length < 2) {
      alert('Need at least 2 devices to send packets');
      return;
    }

    if (!isRunning) {
      alert('Please start simulation first');
      return;
    }

    const onlineDevices = devices.filter(device => 
      device.status === 'online' && 
      device.interfaces.some(iface => iface.status === 'up')
    );

    if (onlineDevices.length < 2) {
      alert('Need at least 2 online devices with active interfaces');
      return;
    }

    const sourceDevice = onlineDevices[0];
    const targetDevice = onlineDevices[1];

    addPacket({
      source: sourceDevice.id,
      destination: targetDevice.id,
      protocol,
      status: 'transmitted',
      path: [sourceDevice.id, targetDevice.id],
      timestamp: Date.now(),
    });
  };

  const getDeviceInfo = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return {
      name: device?.name || `Device-${deviceId.slice(-4)}`,
      type: device?.type || 'Unknown',
      ip: device?.config?.ipAddress || device?.interfaces?.[0]?.ipAddress || 'No IP',
      status: device?.status || 'Unknown'
    };
  };

  return (
    <div className="w-full h-full bg-white border-t border-gray-200">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">
            Packet Flow Monitor ({packets.length} total packets)
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={clearPackets}
              variant="danger"
              size="sm"
              disabled={packets.length === 0}
            >
              <FiTrash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">Send test packet:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {(['ICMP', 'TCP', 'UDP', 'ARP', 'DNS'] as const).map((protocol) => (
              <Button
                key={protocol}
                onClick={() => handleSendTestPacket(protocol)}
                variant="secondary"
                size="sm"
                disabled={!isRunning || devices.length < 2}
                className="text-xs px-3 py-1"
              >
                {protocol}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
          >
            <option value="all">All Packets</option>
            <option value="ICMP">ICMP Only</option>
            <option value="TCP">TCP Only</option>
            <option value="UDP">UDP Only</option>
            <option value="ARP">ARP Only</option>
            <option value="DNS">DNS Only</option>
            <option value="received">Received</option>
            <option value="transmitted">In Transit</option>
            <option value="dropped">Dropped</option>
          </select>
          <span className="text-xs text-gray-500">
            Showing {sortedPackets.length} of {packets.length} packets
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white" style={{ height: 'calc(100% - 280px)', minHeight: '200px' }}>
        <div className="h-full overflow-y-auto p-4">
          {packets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2 text-lg">No packets to display</div>
                <div className="text-sm text-gray-500">
                  Start simulation and send test packets to see activity
                </div>
              </div>
            </div>
          ) : sortedPackets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2 text-lg">No packets match filter</div>
                <div className="text-sm text-gray-500">
                  Try changing filter to "All Packets"
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPackets.map((packet, index) => {
                const sourceInfo = getDeviceInfo(packet.source);
                const destInfo = getDeviceInfo(packet.destination);
                const StatusIcon = statusIcons[packet.status];
                const isSelected = selectedPacket === packet.id;

                return (
                  <div
                    key={packet.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all shadow-sm ${
                      isSelected 
                        ? 'border-blue-400 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPacket(isSelected ? null : packet.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${protocolColors[packet.protocol]}`}>
                          {packet.protocol}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[packet.status]}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {packet.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 font-mono">
                        {new Date(packet.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-mono text-base">
                        <span className="font-bold text-blue-600">{sourceInfo.name}</span>
                        <span className="mx-3 text-gray-400 text-lg"></span>
                        <span className="font-bold text-green-600">{destInfo.name}</span>
                      </div>
                      <div className="text-gray-500">
                        {isSelected ? (
                          <FiChevronDown className="w-5 h-5" />
                        ) : (
                          <FiChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Path:</strong> {packet.path.map(id => getDeviceInfo(id).name).join(' -> ')}
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h6 className="font-bold text-gray-900 mb-3 text-base">Packet Details</h6>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">ID:</span>
                                <span className="font-mono text-gray-900">{packet.id.slice(-12)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Protocol:</span>
                                <span className="font-bold">{packet.protocol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Status:</span>
                                <span className={`font-bold ${
                                  packet.status === 'received' ? 'text-green-600' :
                                  packet.status === 'dropped' ? 'text-red-600' :
                                  packet.status === 'transmitted' ? 'text-blue-600' :
                                  'text-yellow-600'
                                }`}>
                                  {packet.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Time:</span>
                                <span className="font-mono text-sm">{new Date(packet.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h6 className="font-bold text-gray-900 mb-3 text-base">Network Info</h6>
                            <div className="space-y-3 text-sm">
                              <div className="bg-white p-3 rounded border">
                                <div className="font-bold text-blue-600 mb-1">Source: {sourceInfo.name}</div>
                                <div className="text-gray-600">Type: {sourceInfo.type}</div>
                                <div className="text-gray-600">IP: {sourceInfo.ip}</div>
                                <div className="text-gray-600">Status: {sourceInfo.status}</div>
                              </div>
                              <div className="bg-white p-3 rounded border">
                                <div className="font-bold text-green-600 mb-1">Destination: {destInfo.name}</div>
                                <div className="text-gray-600">Type: {destInfo.type}</div>
                                <div className="text-gray-600">IP: {destInfo.ip}</div>
                                <div className="text-gray-600">Status: {destInfo.status}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-bold text-green-600 text-2xl">
              {packets.filter(p => p.status === 'received').length}
            </div>
            <div className="text-gray-700 font-medium">Received</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600 text-2xl">
              {packets.filter(p => p.status === 'transmitted').length}
            </div>
            <div className="text-gray-700 font-medium">In Transit</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600 text-2xl">
              {packets.filter(p => p.status === 'dropped').length}
            </div>
            <div className="text-gray-700 font-medium">Dropped</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-yellow-600 text-2xl">
              {packets.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-gray-700 font-medium">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};
