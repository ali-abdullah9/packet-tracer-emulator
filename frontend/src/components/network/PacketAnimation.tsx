'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/store/networkStore';
import { PacketFlow } from '@/types';

interface AnimatedPacket extends PacketFlow {
  currentPosition: { x: number; y: number };
  progress: number;
  pathCoordinates: { x: number; y: number }[];
}

const packetColors = {
  ICMP: '#3b82f6',
  TCP: '#10b981',
  UDP: '#8b5cf6',
  ARP: '#f59e0b',
  DNS: '#ef4444',
};

export const PacketAnimation: React.FC = () => {
  const { packets, devices, connections, isRunning, updatePacket } = useNetworkStore();
  const [animatedPackets, setAnimatedPackets] = useState<AnimatedPacket[]>([]);

  useEffect(() => {
    if (!isRunning) {
      setAnimatedPackets([]);
      return;
    }

    const newAnimatedPackets = packets
      .filter(packet => packet.status === 'transmitted')
      .map(packet => {
        const pathCoordinates = calculatePacketPath(packet, devices, connections);
        return {
          ...packet,
          currentPosition: pathCoordinates[0] || { x: 0, y: 0 },
          progress: 0,
          pathCoordinates,
        };
      });

    setAnimatedPackets(newAnimatedPackets);
  }, [packets, devices, connections, isRunning]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {animatedPackets.map((packet) => (
          <PacketElement 
            key={packet.id} 
            packet={packet} 
            onComplete={() => {
              // Update packet status to received when animation completes
              updatePacket(packet.id, { status: 'received' });
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const PacketElement: React.FC<{ 
  packet: AnimatedPacket; 
  onComplete: () => void;
}> = ({ packet, onComplete }) => {
  const animationDuration = 2; // seconds per hop
  const totalDuration = Math.max(packet.pathCoordinates.length * animationDuration, 2);

  return (
    <motion.div
      className="absolute"
      initial={{
        x: packet.pathCoordinates[0]?.x || 0,
        y: packet.pathCoordinates[0]?.y || 0,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: packet.pathCoordinates.map(coord => coord.x),
        y: packet.pathCoordinates.map(coord => coord.y),
        scale: [0, 1.2, 1, 1, 0.8, 1],
        opacity: [0, 1, 1, 1, 1, 1],
      }}
      transition={{
        duration: totalDuration,
        times: packet.pathCoordinates.length > 1 
          ? packet.pathCoordinates.map((_, i) => i / (packet.pathCoordinates.length - 1))
          : [0, 1],
        ease: "easeInOut",
      }}
      exit={{
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      onAnimationComplete={() => {
        // Call onComplete when animation finishes
        setTimeout(onComplete, 500); // Small delay before marking as received
      }}
      style={{
        backgroundColor: packetColors[packet.protocol],
        zIndex: 1000,
      }}
      className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs"
    >
      <span className="text-white font-bold text-xs">
        {packet.protocol.substring(0, 2)}
      </span>
      
      {/* Packet trail effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: packetColors[packet.protocol],
        }}
        animate={{
          scale: [1, 2, 3],
          opacity: [0.8, 0.4, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
};

function calculatePacketPath(
  packet: PacketFlow,
  devices: any[],
  connections: any[]
): { x: number; y: number }[] {
  const sourceDevice = devices.find(d => d.id === packet.source);
  const destinationDevice = devices.find(d => d.id === packet.destination);

  if (!sourceDevice || !destinationDevice) {
    return [];
  }

  const path = findShortestPath(packet.source, packet.destination, devices, connections);
  
  return path.map(deviceId => {
    const device = devices.find(d => d.id === deviceId);
    return device ? { 
      x: device.position.x + 60,
      y: device.position.y + 60 
    } : { x: 0, y: 0 };
  });
}

function findShortestPath(
  sourceId: string,
  destinationId: string,
  devices: any[],
  connections: any[]
): string[] {
  if (sourceId === destinationId) return [sourceId];

  const graph: Record<string, string[]> = {};
  devices.forEach(device => {
    graph[device.id] = [];
  });

  connections.forEach(conn => {
    if (conn.status === 'connected') {
      graph[conn.source].push(conn.target);
      graph[conn.target].push(conn.source);
    }
  });

  const queue = [[sourceId]];
  const visited = new Set([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === destinationId) {
      return path;
    }

    for (const neighbor of graph[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [sourceId, destinationId];
}
