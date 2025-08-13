'use client';

import React, { useState } from 'react';
import { NetworkTopology } from '@/components/network/NetworkTopology';
import { ControlPanel } from '@/components/network/ControlPanel';
import { DevicePanel } from '@/components/network/DevicePanel';
import { PacketFlow } from '@/components/network/PacketFlow';
import { PacketAnimation } from '@/components/network/PacketAnimation';
import { DeviceConfigModal } from '@/components/network/DeviceConfigModal';
import { ModernHeader } from '@/components/layout/ModernHeader';

export default function SimulatorPage() {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const handleOpenDeviceConfig = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setConfigModalOpen(true);
  };

  const handleCloseDeviceConfig = () => {
    setConfigModalOpen(false);
    setSelectedDeviceId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <ModernHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Device Panel */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-lg">
          <DevicePanel onOpenDeviceConfig={handleOpenDeviceConfig} />
        </div>

        {/* Center - Network Topology with Packet Animations */}
        <div className="flex-1 flex flex-col relative bg-white/30 backdrop-blur-sm">
          <NetworkTopology onOpenDeviceConfig={handleOpenDeviceConfig} />
          <PacketAnimation />
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-gray-200/50 flex flex-col shadow-lg">
          <ControlPanel />
        </div>
      </div>

      {/* Bottom Panel - Packet Flow */}
      <div className="h-48 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <PacketFlow />
      </div>

      {/* Device Configuration Modal */}
      <DeviceConfigModal
        isOpen={configModalOpen}
        onClose={handleCloseDeviceConfig}
        deviceId={selectedDeviceId}
      />
    </div>
  );
}
