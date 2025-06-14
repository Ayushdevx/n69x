
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileSpreadsheet } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const SheetsNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  return (
    <BaseNode
      icon={FileSpreadsheet}
      label={data.label}
      status={data.status}
      color="bg-green-700"
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
        {data.config?.sheetName || 'Configure sheet'}
      </div>
    </BaseNode>
  );
};
