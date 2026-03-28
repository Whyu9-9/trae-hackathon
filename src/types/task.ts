export type TaskType = 
  | 'project-work' 
  | 'meeting' 
  | 'communication' 
  | 'documentation' 
  | 'creative-work' 
  | 'research' 
  | 'planning' 
  | 'break';

export interface TaskEntry {
  id: string;
  type: TaskType;
  description: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

export interface ContextSwitchPenalty {
  fromTask: TaskType;
  toTask: TaskType;
  penaltyMinutes: number;
  timestamp: Date;
}

export interface ProductivityMetrics {
  totalTasks: number;
  totalContextSwitches: number;
  totalPenaltyTime: number;
  averagePenalty: number;
  mostProductiveHour: number;
  taskDistribution: Record<TaskType, number>;
}

export const TASK_TYPES: TaskType[] = [
  'project-work',
  'meeting',
  'communication',
  'documentation',
  'creative-work',
  'research',
  'planning',
  'break'
];

export const TASK_COLORS: Record<TaskType, string> = {
  'project-work': '#3b82f6', // Blue
  'meeting': '#ef4444',      // Red
  'communication': '#10b981', // Emerald
  'documentation': '#f59e0b', // Amber
  'creative-work': '#8b5cf6', // Violet
  'research': '#06b6d4',      // Cyan
  'planning': '#f97316',      // Orange
  'break': '#6b7280'          // Gray
};

export const BASE_PENALTIES: Record<TaskType, number> = {
  'project-work': 600,
  'research': 540,
  'creative-work': 480,
  'documentation': 420,
  'planning': 360,
  'meeting': 240,
  'communication': 120,
  'break': 60
};
