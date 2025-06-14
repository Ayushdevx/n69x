
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const ActionNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={Zap}
      label={data.label}
      status={data.status}
      color="bg-orange-500"
      selected={selected}
      nodeId={id}
      data={data}
      enabled={data.enabled}
      executionTime={data.executionTime}
      lastExecuted={data.lastExecuted}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </BaseNode>
  );
};
