
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shuffle } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const TransformNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={Shuffle}
      label={data.label}
      status={data.status}
      color="bg-teal-500"
      selected={selected}
      nodeId={id}
      data={data}
      enabled={data.enabled}
      executionTime={data.executionTime}
      lastExecuted={data.lastExecuted}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      
      <div className="text-xs text-gray-400 mt-1">
        {data.config?.script ? 'Script configured' : 'No script'}
      </div>
    </BaseNode>
  );
};
