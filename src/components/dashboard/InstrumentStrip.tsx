import { useMemo } from "react";
import type { TaskEntry, ContextSwitchPenalty } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

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
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{tasksToday}</div>
            <InfoTooltip content="Total number of tasks you have started and tracked today." />
          </div>
          <p className="text-xs text-muted-foreground">Tasks Logged Today</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{switches.length}</div>
            <InfoTooltip content="The number of times you have switched between different task types today." />
          </div>
          <p className="text-xs text-muted-foreground">Context Switches</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{Math.round(totalPenalty)}m</div>
              <InfoTooltip content="Estimated total time lost to context switching overhead, based on scientific recovery estimates." />
            </div>
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
