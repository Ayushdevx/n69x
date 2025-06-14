
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const WebhookNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={Webhook}
      label={data.label}
      status={data.status}
      color="bg-blue-500"
      selected={selected}
      nodeId={id}
      data={data}
      enabled={data.enabled}
      executionTime={data.executionTime}
      lastExecuted={data.lastExecuted}
    >
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      
      <div className="text-xs text-gray-400 mt-1">
        Webhook trigger
      </div>
    </BaseNode>
  );
};
