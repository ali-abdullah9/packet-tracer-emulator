'use client';

import React from 'react';
import { useNetworkStore } from '@/store/networkStore';

export const PacketFlow: React.FC = () => {
  const { packets } = useNetworkStore();

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Packet Flow Monitor</h3>
      
      <div className="bg-gray-50 rounded-lg p-3 h-32 overflow-y-auto">
        {packets.length === 0 ? (
          <p className="text-gray-500 text-sm">No packets to display</p>
        ) : (
          <div className="space-y-1">
            {packets.map((packet) => (
              <div key={packet.id} className="text-xs bg-white p-2 rounded border">
                <span className="font-mono">
                  {packet.protocol}: {packet.source} → {packet.destination}
                </span>
                <span className={`ml-2 px-1 rounded text-xs ${
                  packet.status === 'received' ? 'bg-green-100 text-green-800' :
                  packet.status === 'dropped' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {packet.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
