'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  ReactFlowInstance,
  OnSelectionChangeParams,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useNetworkStore } from '@/store/networkStore';
import { DeviceNode } from './DeviceNode';
import { ConnectionEdge } from './ConnectionEdge';

const nodeTypes = {
  device: DeviceNode,
};

const edgeTypes = {
  connection: ConnectionEdge,
};

interface NetworkTopologyProps {
  onOpenDeviceConfig?: (deviceId: string) => void;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({ 
  onOpenDeviceConfig 
}) => {
  const { 
    devices, 
    connections, 
    addDevice, 
    addConnection, 
    updateDevice,
    isRunning 
  } = useNetworkStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = React.useState<string[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const flowNodes = useMemo(() => {
    return devices.map((device) => ({
      id: device.id,
      type: 'device',
      position: device.position,
      data: {
        device,
        isRunning,
        isSelected: selectedNodes.includes(device.id),
        onOpenConfig: onOpenDeviceConfig,
      },
      draggable: true,
    }));
  }, [devices, isRunning, selectedNodes, onOpenDeviceConfig]);

  const flowEdges = useMemo(() => {
    return connections.map((connection) => ({
      id: connection.id,
      type: 'connection',
      source: connection.source,
      target: connection.target,
      data: {
        connection,
        isRunning,
      },
      animated: isRunning && connection.status === 'connected',
      style: {
        stroke: connection.status === 'connected' ? '#10b981' : '#ef4444',
        strokeWidth: isRunning ? 3 : 2,
      },
    }));
  }, [connections, isRunning]);

  React.useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  React.useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const sourceDevice = devices.find(d => d.id === params.source);
        const targetDevice = devices.find(d => d.id === params.target);

        if (sourceDevice && targetDevice) {
          const sourceInterface = findAvailableInterface(sourceDevice);
          const targetInterface = findAvailableInterface(targetDevice);

          if (sourceInterface && targetInterface) {
            addConnection({
              source: params.source,
              target: params.target,
              sourceInterface: sourceInterface.name,
              targetInterface: targetInterface.name,
              status: 'connected',
            });

            updateDevice(sourceDevice.id, {
              interfaces: sourceDevice.interfaces.map(iface =>
                iface.id === sourceInterface.id ? { ...iface, status: 'up' } : iface
              )
            });

            updateDevice(targetDevice.id, {
              interfaces: targetDevice.interfaces.map(iface =>
                iface.id === targetInterface.id ? { ...iface, status: 'up' } : iface
              )
            });
          }
        }
      }
    },
    [devices, addConnection, updateDevice]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      updateDevice(node.id, { position: node.position });
    },
    [updateDevice]
  );

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNodes(params.nodes.map(node => node.id));
    },
    []
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const deviceType = event.dataTransfer.getData('application/reactflow');
      if (!deviceType) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addDevice({
        type: deviceType as any,
        name: `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}-${devices.length + 1}`,
        position,
        interfaces: generateDefaultInterfaces(deviceType),
        status: 'offline',
      });
    },
    [reactFlowInstance, devices.length, addDevice]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle keyboard shortcuts
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' && selectedNodes.length > 0) {
      // Delete selected devices
      selectedNodes.forEach(nodeId => {
        const device = devices.find(d => d.id === nodeId);
        if (device) {
          // Remove device and its connections
          // This will be handled by the store
        }
      });
    }
  }, [selectedNodes, devices]);

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div className="flex-1 bg-gray-100" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        className="bg-white"
        multiSelectionKeyCode="Ctrl"
        deleteKeyCode="Delete"
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
        
        <Controls 
          position="bottom-left"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        
        <MiniMap 
          position="bottom-right"
          nodeColor={(node) => {
            const device = node.data?.device;
            switch (device?.type) {
              case 'router': return '#3b82f6';
              case 'switch': return '#10b981'; 
              case 'pc': return '#8b5cf6';
              case 'server': return '#f59e0b';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-md">
          <div className="text-sm">
            <div className="font-medium text-gray-900">Network Status</div>
            <div className="text-gray-600">
              Devices: {devices.length} | Connections: {connections.length}
            </div>
            <div className={`text-xs ${isRunning ? 'text-green-600' : 'text-gray-500'}`}>
              {isRunning ? 'Simulation Running' : 'Simulation Stopped'}
            </div>
            {selectedNodes.length > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                Selected: {selectedNodes.length} device(s)
              </div>
            )}
          </div>
        </Panel>

        <Panel position="top-center" className="pointer-events-none">
          <div className="text-gray-400 text-sm text-center">
            <div>Drag devices from the left panel</div>
            <div>Connect devices by dragging between connection points</div>
            <div>Double-click devices to toggle status • Right-click settings to configure</div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

function findAvailableInterface(device: any) {
  return device.interfaces.find((iface: any) => iface.status === 'down');
}

function generateDefaultInterfaces(deviceType: string) {
  switch (deviceType) {
    case 'router':
      return [
        { id: 'eth0', name: 'GigabitEthernet0/0', status: 'down' as const },
        { id: 'eth1', name: 'GigabitEthernet0/1', status: 'down' as const },
        { id: 'serial0', name: 'Serial0/0/0', status: 'down' as const },
      ];
    case 'switch':
      return Array.from({ length: 8 }, (_, i) => ({
        id: `fa${i}`,
        name: `FastEthernet0/${i + 1}`,
        status: 'down' as const,
      }));
    case 'pc':
    case 'server':
      return [
        { id: 'eth0', name: 'Ethernet0', status: 'down' as const },
      ];
    default:
      return [];
  }
}
