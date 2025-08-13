'use client';

import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { NetworkConnection } from '@/types';

interface ConnectionEdgeData {
  connection: NetworkConnection;
  isRunning: boolean;
}

export const ConnectionEdge: React.FC<EdgeProps<ConnectionEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const { connection, isRunning } = data || {};
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = connection?.status === 'connected' ? '#10b981' : '#ef4444';
  const strokeWidth = isRunning ? 3 : 2;

  return (
    <>
      <path
        id={id}
        style={{
          stroke: strokeColor,
          strokeWidth,
          fill: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Connection label */}
      {connection && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          className="text-xs fill-gray-600"
          textAnchor="middle"
          dy={-5}
        >
          {connection.sourceInterface} ↔ {connection.targetInterface}
        </text>
      )}
    </>
  );
};
