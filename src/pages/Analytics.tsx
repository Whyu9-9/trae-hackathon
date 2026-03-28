import { useMemo } from "react";
import type { TaskEntry, TaskType } from "@/types/task";
import { TASK_COLORS } from "@/types/task";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfHour, getHours } from "date-fns";

interface AnalyticsProps {
  tasks: TaskEntry[];
}

export function Analytics({ tasks }: AnalyticsProps) {
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      counts[task.type] = (counts[task.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: type.replace("-", " "),
      value: count,
      type: type as TaskType
    }));
  }, [tasks]);

  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    // Initialize all 24 hours
    for (let i = 0; i < 24; i++) hours[i] = 0;
    
    tasks.forEach(task => {
      const hour = getHours(task.startTime);
      hours[hour] = (hours[hour] || 0) + 1;
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count
    }));
  }, [tasks]);

  const durationData = useMemo(() => {
    const durations: Record<string, number> = {};
    tasks.forEach(task => {
      const start = task.startTime.getTime();
      const end = (task.endTime || new Date()).getTime();
      const mins = (end - start) / (1000 * 60);
      durations[task.type] = (durations[task.type] || 0) + mins;
    });
    return Object.entries(durations).map(([type, value]) => ({
      name: type.replace("-", " "),
      value: Math.round(value),
      type: type as TaskType
    }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Task Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#888' }} />
                <YAxis fontSize={10} tick={{ fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value">
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.type]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Time Allocation (Minutes)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={durationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {durationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TASK_COLORS[entry.type]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Hourly Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" fontSize={10} tick={{ fill: '#888' }} />
              <YAxis fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
