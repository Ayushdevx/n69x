
import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: {
      label: 'Start Workflow',
      config: {},
      status: 'idle'
    },
  },
  {
    id: 'http-1',
    type: 'http',
    position: { x: 300, y: 100 },
    data: {
      label: 'Fetch Data',
      config: {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      },
      status: 'idle'
    },
  },
  {
    id: 'condition-1',
    type: 'condition',
    position: { x: 500, y: 100 },
    data: {
      label: 'Check Response',
      config: {
        condition: 'data.status === 200'
      },
      status: 'idle'
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'trigger-1',
    target: 'http-1',
    animated: true,
  },
  {
    id: 'e2-3',
    source: 'http-1',
    target: 'condition-1',
    animated: true,
  },
];
