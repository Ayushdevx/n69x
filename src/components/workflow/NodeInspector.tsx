
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Trash2, Copy, Play, Pause, Eye, EyeOff } from 'lucide-react';
import { Node } from '@xyflow/react';

interface NodeConfig {
  method?: string;
  url?: string;
  headers?: string;
  timeout?: number;
  retries?: number;
  to?: string;
  subject?: string;
  body?: string;
  template?: string;
  operation?: string;
  table?: string;
  query?: string;
  connectionString?: string;
  condition?: string;
  operator?: string;
  value?: string | number;
  delay?: number;
  unit?: string;
  script?: string;
  language?: string;
  webhookUrl?: string;
  secret?: string;
  customConfig?: string;
  [key: string]: any;
}

interface NodeInspectorProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
}

export const NodeInspector = ({ selectedNode, onUpdateNode, onDeleteNode, onDuplicateNode }: NodeInspectorProps) => {
  const [localConfig, setLocalConfig] = useState<NodeConfig>({});
  const [showSecrets, setShowSecrets] = useState(false);

  if (!selectedNode) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-400 py-8">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a node to configure</p>
          <p className="text-xs text-gray-500 mt-2">Click on any node to view and edit its properties</p>
        </div>
      </div>
    );
  }

  const updateConfig = (key: string, value: string | number | boolean) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    const currentConfig = (selectedNode.data?.config as NodeConfig) || {};
    onUpdateNode(selectedNode.id, { 
      config: { ...currentConfig, ...newConfig }
    });
  };

  const updateNodeProperty = (key: string, value: string | boolean) => {
    onUpdateNode(selectedNode.id, { [key]: value });
  };

  const renderNodeSpecificConfig = () => {
    const nodeType = selectedNode.type;
    const config: NodeConfig = (selectedNode.data?.config as NodeConfig) || {};

    switch (nodeType) {
      case 'http':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">HTTP Method</Label>
              <Select value={config.method || 'GET'} onValueChange={(value) => updateConfig('method', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">URL</Label>
              <Input
                className="mt-1"
                value={config.url || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Headers (JSON)</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                value={config.headers || '{}'}
                onChange={(e) => updateConfig('headers', e.target.value)}
                placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Timeout (ms)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={config.timeout || 5000}
                  onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Retries</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={config.retries || 3}
                  onChange={(e) => updateConfig('retries', parseInt(e.target.value))}
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">To</Label>
              <Input
                className="mt-1"
                value={config.to || ''}
                onChange={(e) => updateConfig('to', e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Subject</Label>
              <Input
                className="mt-1"
                value={config.subject || ''}
                onChange={(e) => updateConfig('subject', e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Body</Label>
              <Textarea
                className="mt-1"
                value={config.body || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
                placeholder="Email content..."
                rows={4}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Template</Label>
              <Select value={config.template || 'plain'} onValueChange={(value) => updateConfig('template', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">Plain Text</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Operation</Label>
              <Select value={config.operation || 'SELECT'} onValueChange={(value) => updateConfig('operation', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELECT">SELECT</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Table</Label>
              <Input
                className="mt-1"
                value={config.table || ''}
                onChange={(e) => updateConfig('table', e.target.value)}
                placeholder="table_name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Query</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                value={config.query || ''}
                onChange={(e) => updateConfig('query', e.target.value)}
                placeholder="SELECT * FROM users WHERE..."
                rows={3}
              />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                Connection String
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </Label>
              <Input
                className="mt-1"
                value={config.connectionString || ''}
                onChange={(e) => updateConfig('connectionString', e.target.value)}
                placeholder="postgresql://user:pass@localhost:5432/db"
                type={showSecrets ? "text" : "password"}
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Condition Script</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                value={config.condition || ''}
                onChange={(e) => updateConfig('condition', e.target.value)}
                placeholder="data.value > 100 || data.status === 'active'"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Operator</Label>
              <Select value={config.operator || 'equals'} onValueChange={(value) => updateConfig('operator', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="starts_with">Starts With</SelectItem>
                  <SelectItem value="regex">Regular Expression</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Value</Label>
              <Input
                className="mt-1"
                value={String(config.value || '')}
                onChange={(e) => updateConfig('value', e.target.value)}
                placeholder="Comparison value"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Delay Amount</Label>
              <Input
                className="mt-1"
                type="number"
                value={config.delay || 1000}
                onChange={(e) => updateConfig('delay', parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Unit</Label>
              <Select value={config.unit || 'ms'} onValueChange={(value) => updateConfig('unit', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ms">Milliseconds</SelectItem>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border">
              <p className="text-xs text-blue-700">
                Current delay: {config.delay || 1000} {config.unit || 'ms'}
              </p>
            </div>
          </div>
        );

      case 'transform':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Transform Script</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                value={config.script || ''}
                onChange={(e) => updateConfig('script', e.target.value)}
                placeholder="return { ...data, processed: true, timestamp: new Date().toISOString() };"
                rows={6}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Language</Label>
              <Select value={config.language || 'javascript'} onValueChange={(value) => updateConfig('language', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="jq">JQ</SelectItem>
                  <SelectItem value="jsonata">JSONata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Webhook URL</Label>
              <Input
                className="mt-1"
                value={config.webhookUrl || ''}
                onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                placeholder="https://your-app.com/webhook"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">This URL will be generated automatically when the workflow is deployed</p>
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center justify-between">
                Secret Key
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </Label>
              <Input
                className="mt-1"
                value={config.secret || ''}
                onChange={(e) => updateConfig('secret', e.target.value)}
                placeholder="webhook-secret-key"
                type={showSecrets ? "text" : "password"}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Custom Configuration</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                value={config.customConfig || ''}
                onChange={(e) => updateConfig('customConfig', e.target.value)}
                placeholder='{"key": "value", "enabled": true}'
                rows={6}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{String(selectedNode.data?.label || 'Unnamed Node')}</CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                {selectedNode.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Node Label</Label>
              <Input
                className="mt-1"
                value={String(selectedNode.data?.label || '')}
                onChange={(e) => updateNodeProperty('label', e.target.value)}
                placeholder="Enter node name"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedNode.data?.enabled !== false}
                  onCheckedChange={(checked) => updateNodeProperty('enabled', checked)}
                />
                <Label className="text-sm font-medium">Node Enabled</Label>
              </div>
              <Badge variant={selectedNode.data?.enabled !== false ? "default" : "secondary"}>
                {selectedNode.data?.enabled !== false ? "Active" : "Disabled"}
              </Badge>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-semibold text-gray-700">Node Configuration</Label>
              <div className="mt-3">
                {renderNodeSpecificConfig()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Node Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicateNode(selectedNode.id)}
              className="w-full justify-start hover:bg-blue-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Node
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateNodeProperty('enabled', !selectedNode.data.enabled)}
              className="w-full justify-start hover:bg-yellow-50"
            >
              {selectedNode.data.enabled !== false ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {selectedNode.data.enabled !== false ? 'Disable Node' : 'Enable Node'}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="w-full justify-start hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Node Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Node ID:</span>
                <span className="font-mono text-gray-800">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline" className="text-xs">{selectedNode.type}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Position:</span>
                <span className="font-mono text-gray-800">
                  ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Status:</span>
                <Badge variant={
                  selectedNode.data.status === 'success' ? 'default' :
                  selectedNode.data.status === 'error' ? 'destructive' :
                  selectedNode.data.status === 'running' ? 'secondary' : 'outline'
                }>
                  {String(selectedNode.data.status || 'idle')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
