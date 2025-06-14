
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const ScheduleNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={Clock}
      label={data.label}
      status={data.status}
      color="bg-purple-500"
      selected={selected}
      nodeId={id}
      data={data}
      enabled={data.enabled}
      executionTime={data.executionTime}
      lastExecuted={data.lastExecuted}
    >
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      
      <div className="text-xs text-gray-400 mt-1">
        {data.config?.schedule ? `Every ${data.config.schedule}` : 'Configure schedule'}
      </div>
    </BaseNode>
  );
};
