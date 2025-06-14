import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Play, Pause, Trash2 } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  type: 'interval' | 'cron' | 'daily' | 'weekly';
  expression: string;
  enabled: boolean;
  nextRun: Date;
  lastRun?: Date;
}

interface WorkflowSchedulerProps {
  onScheduleWorkflow: (schedule: Omit<Schedule, 'id' | 'nextRun' | 'lastRun'>) => void;
}

export const WorkflowScheduler = ({ onScheduleWorkflow }: WorkflowSchedulerProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Daily Report Generation',
      type: 'daily',
      expression: '0 9 * * *',
      enabled: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Data Sync Every Hour',
      type: 'interval',
      expression: '0 * * * *',
      enabled: false,
      nextRun: new Date(Date.now() + 60 * 60 * 1000)
    }
  ]);

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    type: 'daily' as const,
    expression: '',
    enabled: true
  });

  const handleCreateSchedule = () => {
    if (newSchedule.name && newSchedule.expression) {
      onScheduleWorkflow(newSchedule);
      setNewSchedule({ name: '', type: 'daily', expression: '', enabled: true });
    }
  };

  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  const getScheduleDisplay = (type: string, expression: string) => {
    switch (type) {
      case 'daily':
        return 'Daily at 9:00 AM';
      case 'weekly':
        return 'Weekly on Monday';
      case 'interval':
        return 'Every hour';
      case 'cron':
        return `Cron: ${expression}`;
      default:
        return expression;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Workflow Scheduler
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Schedule */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Create New Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleName">Schedule Name</Label>
                <Input
                  id="scheduleName"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Daily data sync"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              <div>
                <Label htmlFor="scheduleType">Schedule Type</Label>
                <Select
                  value={newSchedule.type}
                  onValueChange={(value: any) => setNewSchedule(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="interval">Interval</SelectItem>
                    <SelectItem value="cron">Custom (Cron)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expression">Expression</Label>
                <Input
                  id="expression"
                  value={newSchedule.expression}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, expression: e.target.value }))}
                  placeholder="0 9 * * *"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateSchedule} className="bg-blue-600 hover:bg-blue-700">
                  Create Schedule
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Schedules */}
          <div>
            <h3 className="text-lg font-medium mb-4">Active Schedules</h3>
            <div className="space-y-3">
              {schedules.map(schedule => (
                <div key={schedule.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-white">{schedule.name}</h4>
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getScheduleDisplay(schedule.type, schedule.expression)}
                        </div>
                        <div>Next run: {schedule.nextRun.toLocaleString()}</div>
                        {schedule.lastRun && (
                          <div>Last run: {schedule.lastRun.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSchedule(schedule.id)}
                        className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                      >
                        {schedule.enabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSchedule(schedule.id)}
                        className="bg-red-600 border-red-500 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
