
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const ConditionNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={GitBranch}
      label={data.label}
      status={data.status}
      color="bg-yellow-500"
      selected={selected}
      nodeId={id}
      data={data}
      enabled={data.enabled}
      executionTime={data.executionTime}
      lastExecuted={data.lastExecuted}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" id="true" style={{ top: '30%' }} />
      <Handle type="source" position={Position.Right} className="w-3 h-3" id="false" style={{ top: '70%' }} />
      
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <div className="text-xs text-green-400" style={{ transform: 'translateY(-8px)' }}>T</div>
        <div className="text-xs text-red-400" style={{ transform: 'translateY(8px)' }}>F</div>
      </div>
    </BaseNode>
  );
};
