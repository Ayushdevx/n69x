
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  Clock, 
  User, 
  Tag, 
  Download, 
  Upload,
  RotateCcw,
  Save,
  Plus,
  Eye,
  GitCompare
} from 'lucide-react';

interface WorkflowVersion {
  id: string;
  version: string;
  description: string;
  author: string;
  timestamp: Date;
  workflowData: any;
  tags: string[];
  isActive: boolean;
  changes: string[];
}

export const WorkflowVersioning = ({ workflowData, onRestoreVersion }: {
  workflowData: any;
  onRestoreVersion: (versionData: any) => void;
}) => {
  const [versions, setVersions] = useState<WorkflowVersion[]>([
    {
      id: 'v1.0.0',
      version: '1.0.0',
      description: 'Initial workflow version',
      author: 'System',
      timestamp: new Date('2024-01-01'),
      workflowData: workflowData,
      tags: ['initial', 'stable'],
      isActive: true,
      changes: ['Created initial workflow', 'Added HTTP node', 'Added condition logic']
    }
  ]);

  const [newVersion, setNewVersion] = useState({
    version: '',
    description: '',
    tags: ''
  });

  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const createNewVersion = () => {
    if (!newVersion.version || !newVersion.description) {
      alert('Please fill in version and description');
      return;
    }

    const version: WorkflowVersion = {
      id: `v${newVersion.version}`,
      version: newVersion.version,
      description: newVersion.description,
      author: 'System',
      timestamp: new Date(),
      workflowData: workflowData,
      tags: newVersion.tags.split(',').map(t => t.trim()).filter(t => t),
      isActive: false,
      changes: ['Workflow updated', 'Configuration changes applied']
    };

    // Set current version as inactive
    const updatedVersions = versions.map(v => ({ ...v, isActive: false }));
    
    setVersions([version, ...updatedVersions]);
    setNewVersion({ version: '', description: '', tags: '' });
    setShowCreateDialog(false);
  };

  const restoreVersion = (version: WorkflowVersion) => {
    onRestoreVersion(version.workflowData);
    
    // Update active status
    const updatedVersions = versions.map(v => ({
      ...v,
      isActive: v.id === version.id
    }));
    setVersions(updatedVersions);
  };

  const exportVersion = (version: WorkflowVersion) => {
    const exportData = {
      version: version.version,
      description: version.description,
      timestamp: version.timestamp,
      author: version.author,
      workflowData: version.workflowData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `workflow_${version.version}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => 
      prev.includes(versionId) 
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId].slice(0, 2) // Max 2 for comparison
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Versions</h3>
          <p className="text-sm text-gray-600">Track and manage workflow changes</p>
        </div>
        
        <div className="flex space-x-2">
          {selectedVersions.length === 2 && (
            <Button size="sm" variant="outline">
              <GitCompare className="w-4 h-4 mr-1" />
              Compare
            </Button>
          )}
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Version Number</Label>
                  <Input
                    value={newVersion.version}
                    onChange={(e) => setNewVersion({...newVersion, version: e.target.value})}
                    placeholder="1.1.0"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newVersion.description}
                    onChange={(e) => setNewVersion({...newVersion, description: e.target.value})}
                    placeholder="What changed in this version?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={newVersion.tags}
                    onChange={(e) => setNewVersion({...newVersion, tags: e.target.value})}
                    placeholder="stable, feature, bugfix"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewVersion}>
                    <Save className="w-4 h-4 mr-1" />
                    Create Version
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {versions.map((version) => (
            <Card 
              key={version.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedVersions.includes(version.id) ? 'ring-2 ring-blue-500' : ''
              } ${version.isActive ? 'border-green-500 bg-green-50' : ''}`}
              onClick={() => handleVersionSelect(version.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">v{version.version}</span>
                    {version.isActive && (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={(e) => {
                      e.stopPropagation();
                      exportVersion(version);
                    }}>
                      <Download className="w-3 h-3" />
                    </Button>
                    
                    <Button size="sm" variant="ghost">
                      <Eye className="w-3 h-3" />
                    </Button>
                    
                    {!version.isActive && (
                      <Button size="sm" variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        restoreVersion(version);
                      }}>
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">{version.description}</p>

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{version.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{version.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>

                {version.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {version.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  {version.changes.map((change, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                      {change}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="text-xs text-gray-500 text-center border-t pt-3">
        <p>Version control system for SureFlow workflows</p>
      </div>
    </div>
  );
};
