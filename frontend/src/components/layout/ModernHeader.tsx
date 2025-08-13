'use client';

import React from 'react';
import { useNetworkStore } from '@/store/networkStore';
import { 
  FiActivity, 
  FiWifi, 
  FiServer, 
  FiMonitor,
  FiSettings,
  FiZap
} from 'react-icons/fi';

export const ModernHeader: React.FC = () => {
  const { devices, connections, packets, isRunning } = useNetworkStore();

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeConnections = connections.filter(c => c.status === 'connected').length;
  const recentPackets = packets.filter(p => Date.now() - p.timestamp < 10000).length;

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl border-b border-blue-800/50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-600/20 rounded-xl backdrop-blur-sm border border-blue-500/30">
              <FiActivity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Network Packet Tracer
              </h1>
              <p className="text-blue-200 text-sm">
                Professional Network Simulation Platform
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-6">
            {/* Simulation Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse-dot' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isRunning ? 'Simulation Active' : 'Simulation Stopped'}
              </span>
            </div>

            {/* Network Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <FiServer className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{devices.length}</span>
                <span className="text-blue-200">Devices</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <FiWifi className="w-4 h-4 text-green-400" />
                <span className="font-medium">{onlineDevices}</span>
                <span className="text-blue-200">Online</span>
              </div>

              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <FiZap className="w-4 h-4 text-purple-400" />
                <span className="font-medium">{recentPackets}</span>
                <span className="text-blue-200">Active</span>
              </div>
            </div>

            {/* Settings Icon */}
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FiSettings className="w-5 h-5 text-blue-300 hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
