
import React, { useEffect, useState } from 'react';
import { Edge } from '@xyflow/react';

interface NodeConnectionAnimationProps {
  edges: Edge[];
  isExecuting: boolean;
  executionFlow: string[];
}

export const NodeConnectionAnimation: React.FC<NodeConnectionAnimationProps> = ({
  edges,
  isExecuting,
  executionFlow
}) => {
  const [animatedEdges, setAnimatedEdges] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isExecuting) {
      setAnimatedEdges(new Set());
      return;
    }

    // Animate edges as execution flows through them
    const animateEdge = (edgeId: string) => {
      setAnimatedEdges(prev => new Set([...prev, edgeId]));
      
      // Remove animation after some time
      setTimeout(() => {
        setAnimatedEdges(prev => {
          const newSet = new Set(prev);
          newSet.delete(edgeId);
          return newSet;
        });
      }, 2000);
    };

    // Simulate edge animation based on execution flow
    executionFlow.forEach((nodeId, index) => {
      const relevantEdges = edges.filter(edge => edge.source === nodeId);
      relevantEdges.forEach(edge => {
        setTimeout(() => animateEdge(edge.id), index * 500);
      });
    });
  }, [isExecuting, executionFlow, edges]);

  useEffect(() => {
    // Apply custom styles to animated edges
    edges.forEach(edge => {
      const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
      if (edgeElement) {
        if (animatedEdges.has(edge.id)) {
          edgeElement.classList.add('animated-edge');
        } else {
          edgeElement.classList.remove('animated-edge');
        }
      }
    });
  }, [animatedEdges, edges]);

  return null; // This is a utility component that doesn't render anything
};
