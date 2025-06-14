
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Save, RefreshCw, Clock, Shield, Zap } from 'lucide-react';

interface WorkflowSettingsProps {
  onSettingsChange: (settings: any) => void;
  settings: {
    name: string;
    description: string;
    timeout: number;
    retryAttempts: number;
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableValidation: boolean;
    autoSave: boolean;
    executionMode: 'parallel' | 'sequential';
    errorHandling: 'stop' | 'continue' | 'retry';
  };
}

export const WorkflowSettings = ({ onSettingsChange, settings }: WorkflowSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const saveSettings = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
  };

  const resetSettings = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="p-4 bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Workflow Settings
        </h3>
        {hasChanges && (
          <Badge variant="secondary" className="bg-orange-600">
            Unsaved Changes
          </Badge>
        )}
      </div>

      <ScrollArea className="h-96">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700/80">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="execution" className="text-xs">Execution</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="workflow-name" className="text-white">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={localSettings.name}
                onChange={(e) => updateSetting('name', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white mt-1"
                placeholder="Enter workflow name"
              />
            </div>

            <div>
              <Label htmlFor="workflow-description" className="text-white">Description</Label>
              <Textarea
                id="workflow-description"
                value={localSettings.description}
                onChange={(e) => updateSetting('description', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white mt-1"
                placeholder="Describe your workflow..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto Save</Label>
                <p className="text-xs text-gray-400">Automatically save changes</p>
              </div>
              <Switch
                checked={localSettings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Enable Validation</Label>
                <p className="text-xs text-gray-400">Validate workflow before execution</p>
              </div>
              <Switch
                checked={localSettings.enableValidation}
                onCheckedChange={(checked) => updateSetting('enableValidation', checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="execution" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="timeout" className="text-white flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Timeout (seconds)
              </Label>
              <Input
                id="timeout"
                type="number"
                value={localSettings.timeout}
                onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 0)}
                className="bg-gray-700 border-gray-600 text-white mt-1"
                min="0"
                max="3600"
              />
            </div>

            <div>
              <Label htmlFor="retry-attempts" className="text-white flex items-center">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry Attempts
              </Label>
              <Input
                id="retry-attempts"
                type="number"
                value={localSettings.retryAttempts}
                onChange={(e) => updateSetting('retryAttempts', parseInt(e.target.value) || 0)}
                className="bg-gray-700 border-gray-600 text-white mt-1"
                min="0"
                max="10"
              />
            </div>

            <div>
              <Label className="text-white flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Execution Mode
              </Label>
              <Select
                value={localSettings.executionMode}
                onValueChange={(value) => updateSetting('executionMode', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Error Handling
              </Label>
              <Select
                value={localSettings.errorHandling}
                onValueChange={(value) => updateSetting('errorHandling', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stop">Stop on Error</SelectItem>
                  <SelectItem value="continue">Continue on Error</SelectItem>
                  <SelectItem value="retry">Retry on Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Enable Logging</Label>
                <p className="text-xs text-gray-400">Log execution details</p>
              </div>
              <Switch
                checked={localSettings.enableLogging}
                onCheckedChange={(checked) => updateSetting('enableLogging', checked)}
              />
            </div>

            {localSettings.enableLogging && (
              <div>
                <Label className="text-white">Log Level</Label>
                <Select
                  value={localSettings.logLevel}
                  onValueChange={(value) => updateSetting('logLevel', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>

      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-700">
        <Button
          onClick={saveSettings}
          disabled={!hasChanges}
          className="flex-1"
          variant={hasChanges ? "default" : "secondary"}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
        <Button
          onClick={resetSettings}
          disabled={!hasChanges}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};
