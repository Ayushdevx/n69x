
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Save, 
  Upload, 
  Download, 
  Settings,
  Menu,
  X,
  Zap,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowHeaderProps {
  onExecute: () => void;
  onClear: () => void;
  isExecuting: boolean;
  nodeCount: number;
  connectionCount: number;
  onApplyTemplate: (template: any) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  onExecute,
  onClear,
  isExecuting,
  nodeCount,
  connectionCount,
  onApplyTemplate,
  onToggleSidebar,
  sidebarCollapsed,
}) => {
  const { toast } = useToast();
  const [showStats, setShowStats] = useState(false);

  const handleSave = () => {
    toast({
      title: "💾 Workflow Saved",
      description: "Your workflow has been saved successfully",
    });
  };

  const handleExport = () => {
    const workflowData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      nodeCount,
      connectionCount,
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    
    toast({
      title: "📦 Workflow Exported",
      description: "Downloaded workflow configuration file",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            onApplyTemplate(data);
            toast({
              title: "📥 Workflow Imported",
              description: "Successfully loaded workflow configuration",
            });
          } catch (error) {
            toast({
              title: "❌ Import Failed",
              description: "Invalid workflow file format",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const workflowStatus = nodeCount > 0 ? 'Ready' : 'Empty';
  const complexity = nodeCount > 15 ? 'Complex' : nodeCount > 8 ? 'Medium' : 'Simple';

  return (
    <header className="bg-gradient-to-r from-gray-800/90 to-slate-800/90 backdrop-blur-sm border-b border-gray-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Left Section - Navigation & Title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hover:bg-gray-700 transition-all duration-200 hover:scale-105"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Workflow Builder
              </h1>
              <p className="text-xs text-gray-400">Advanced automation platform</p>
            </div>
          </div>
        </div>

        {/* Center Section - Quick Stats */}
        <div className="hidden md:flex items-center space-x-4">
          <div 
            className="flex items-center space-x-3 bg-gray-700/50 rounded-lg px-4 py-2 backdrop-blur-sm cursor-pointer hover:bg-gray-700/70 transition-all duration-200"
            onClick={() => setShowStats(!showStats)}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{nodeCount} Nodes</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">{connectionCount} Connections</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <Badge variant="outline" className="border-gray-500 bg-gray-800/50">
              {complexity}
            </Badge>
          </div>

          {showStats && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-gray-700 animate-fade-in z-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Status: {workflowStatus}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Last Modified: Now</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Complexity: {complexity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Version: 1.0</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-700/30 rounded-lg p-1">
            <Button
              onClick={handleSave}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-600 transition-all duration-200 hover:scale-105"
              title="Save Workflow"
            >
              <Save className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleImport}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-600 transition-all duration-200 hover:scale-105"
              title="Import Workflow"
            >
              <Upload className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleExport}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-600 transition-all duration-200 hover:scale-105"
              title="Export Workflow"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-gray-600"></div>
          
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="border-blue-500 bg-blue-600/10 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400 hover:text-blue-300 transition-all duration-200"
            disabled={isExecuting}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Clear
          </Button>
          
          <Button
            onClick={onExecute}
            disabled={isExecuting || nodeCount === 0}
            className={`
              transition-all duration-300 transform hover:scale-105 shadow-lg
              ${isExecuting 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 animate-pulse' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }
            `}
          >
            {isExecuting ? (
              <>
                <Square className="w-4 h-4 mr-2 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Execution Progress Bar */}
      {isExecuting && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse rounded-full"></div>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Executing workflow with {nodeCount} nodes...
          </p>
        </div>
      )}
    </header>
  );
};
