
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const TriggerNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={Play}
      label={data.label}
      status={data.status}
      color="bg-green-500"
      selected={selected}
      nodeId={id}
      data={data}
      enabled={data.enabled}
      executionTime={data.executionTime}
      lastExecuted={data.lastExecuted}
    >
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </BaseNode>
  );
};
