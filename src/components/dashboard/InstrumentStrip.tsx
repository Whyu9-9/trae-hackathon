import { useMemo } from "react";
import type { TaskEntry, ContextSwitchPenalty } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstrumentStripProps {
  tasks: TaskEntry[];
  switches: ContextSwitchPenalty[];
  activeTask: TaskEntry | null;
}

export function InstrumentStrip({ tasks, switches, activeTask }: InstrumentStripProps) {
  const tasksToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => t.startTime.toDateString() === today).length;
  }, [tasks]);

  const totalPenalty = useMemo(() => {
    return switches.reduce((acc, s) => acc + s.penaltyMinutes, 0);
  }, [switches]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{tasksToday}</div>
          <p className="text-xs text-muted-foreground">Tasks Logged Today</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{switches.length}</div>
          <p className="text-xs text-muted-foreground">Context Switches</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{Math.round(totalPenalty)}m</div>
            <p className="text-xs text-muted-foreground">Time Lost (est.)</p>
          </div>
          <Badge variant={activeTask ? "default" : "secondary"}>
            {activeTask ? "Active" : "Idle"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
