import { useMemo } from "react";
import type { TaskEntry, ContextSwitchPenalty } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstrumentStrip } from "@/components/dashboard/InstrumentStrip";
import { LucideZap, LucideClock, LucideAlertTriangle } from "lucide-react";

interface OverviewProps {
  tasks: TaskEntry[];
  switches: ContextSwitchPenalty[];
  activeTask: TaskEntry | null;
}

export function Overview({ tasks, switches, activeTask }: OverviewProps) {
  const cognitiveLoadScore = useMemo(() => {
    if (tasks.length === 0) return 0;
    
    // Derived from: switch frequency ratio (40 pts), average penalty (30 pts), total count (30 pts)
    const switchFrequency = switches.length / tasks.length;
    const avgPenalty = switches.reduce((acc, s) => acc + s.penaltyMinutes, 0) / (switches.length || 1);
    
    const freqScore = Math.min(40, (switchFrequency * 40) / 0.5);
    const penaltyScore = Math.min(30, (avgPenalty * 30) / 10);
    const countScore = Math.min(30, (switches.length * 30) / 10);
    
    return Math.round(freqScore + penaltyScore + countScore);
  }, [tasks, switches]);

  const mostCostlySwitch = useMemo(() => {
    if (switches.length === 0) return null;
    return switches.reduce((max, s) => s.penaltyMinutes > max.penaltyMinutes ? s : max, switches[0]);
  }, [switches]);

  return (
    <div className="space-y-6">
      <InstrumentStrip tasks={tasks} switches={switches} activeTask={activeTask} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cognitive Load Score</CardTitle>
            <LucideZap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{cognitiveLoadScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on switch frequency and penalty time.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Costly Transition</CardTitle>
            <LucideAlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {mostCostlySwitch ? (
              <>
                <div className="text-xl font-bold capitalize">
                  {mostCostlySwitch.fromTask} → {mostCostlySwitch.toTask}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated {Math.round(mostCostlySwitch.penaltyMinutes)} minutes penalty per switch.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground italic">No context switches recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
