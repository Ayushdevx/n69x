
import React, { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

interface WorkflowValidationProps {
  nodes: Node[];
  edges: Edge[];
}

export const WorkflowValidation = ({ nodes, edges }: WorkflowValidationProps) => {
  const issues = useMemo(() => {
    const validationIssues: ValidationIssue[] = [];

    // Check for trigger nodes
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      validationIssues.push({
        id: 'no-trigger',
        type: 'error',
        message: 'Workflow has no trigger nodes. Add at least one trigger to start execution.'
      });
    }

    // Check for isolated nodes
    const connectedNodeIds = new Set([
      ...edges.map(edge => edge.source),
      ...edges.map(edge => edge.target)
    ]);

    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && node.type !== 'trigger') {
        validationIssues.push({
          id: `isolated-${node.id}`,
          type: 'warning',
          message: `Node "${node.data?.label || node.id}" is not connected to the workflow.`,
          nodeId: node.id
        });
      }
    });

    // Check for condition nodes without proper connections
    nodes.filter(node => node.type === 'condition').forEach(node => {
      const outgoingEdges = edges.filter(edge => edge.source === node.id);
      if (outgoingEdges.length === 0) {
        validationIssues.push({
          id: `condition-no-output-${node.id}`,
          type: 'warning',
          message: `Condition node "${node.data?.label || node.id}" has no outgoing connections.`,
          nodeId: node.id
        });
      }
    });

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) {
        validationIssues.push({
          id: `cycle-${node.id}`,
          type: 'error',
          message: 'Circular dependency detected in workflow. This will cause infinite loops.',
          nodeId: node.id
        });
        break; // Only report one cycle
      }
    }

    // Check for disabled critical nodes
    const disabledCriticalNodes = nodes.filter(node => 
      node.data?.enabled === false && ['trigger', 'condition'].includes(node.type || '')
    );

    disabledCriticalNodes.forEach(node => {
      validationIssues.push({
        id: `disabled-critical-${node.id}`,
        type: 'info',
        message: `Critical node "${node.data?.label || node.id}" is disabled.`,
        nodeId: node.id
      });
    });

    return validationIssues;
  }, [nodes, edges]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-900/20 border-red-800 text-red-300';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-800 text-yellow-300';
      case 'info':
        return 'bg-blue-900/20 border-blue-800 text-blue-300';
      default:
        return 'bg-green-900/20 border-green-800 text-green-300';
    }
  };

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;
  const infoCount = issues.filter(issue => issue.type === 'info').length;

  return (
    <div className="p-4 bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Workflow Validation</h3>
        <div className="flex space-x-2">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} Errors
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-yellow-600">
              {warningCount} Warnings
            </Badge>
          )}
          {infoCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {infoCount} Info
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="h-48">
        {issues.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm text-green-400">Workflow is valid!</p>
            <p className="text-xs mt-1">No issues found in the current configuration.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3 rounded-lg border ${getIssueColor(issue.type)}`}
              >
                <div className="flex items-start space-x-2">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <p className="text-sm">{issue.message}</p>
                    {issue.nodeId && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Node: {issue.nodeId}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
