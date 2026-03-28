import { useMemo } from "react";
import type { TaskEntry, ContextSwitchPenalty } from "@/types/task";
import { format, differenceInMinutes } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideClock, LucideArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryProps {
  tasks: TaskEntry[];
  switches: ContextSwitchPenalty[];
}

export function History({ tasks, switches }: HistoryProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [tasks]);

  return (
    <div className="space-y-4">
      {sortedTasks.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground italic border rounded-lg">
          No tasks logged yet.
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {sortedTasks.map((task, index) => {
            const duration = task.endTime 
              ? differenceInMinutes(task.endTime, task.startTime)
              : differenceInMinutes(new Date(), task.startTime);
            
            const relevantSwitch = switches.find(s => 
              s.timestamp.getTime() === task.startTime.getTime()
            );

            return (
              <div key={task.id} className="relative flex items-start gap-6 pl-4">
                <div className={cn(
                  "absolute left-0 mt-1.5 h-3 w-3 rounded-full border-2 border-background",
                  task.isActive ? "bg-primary animate-pulse" : "bg-muted-foreground"
                )} />
                
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {task.type.replace("-", " ")}
                        </Badge>
                        {task.isActive && (
                          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 animate-pulse">
                            Live
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <LucideClock className="w-3 h-3" />
                        {format(task.startTime, "HH:mm")}
                        {task.endTime && ` - ${format(task.endTime, "HH:mm")}`}
                        <span className="ml-1">({duration}m)</span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-foreground mb-2">{task.description}</p>
                    )}

                    {relevantSwitch && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-destructive">
                        <LucideArrowRight className="w-3 h-3" />
                        Context switch from {relevantSwitch.fromTask.replace("-", " ")}
                        <span className="font-bold">+{Math.round(relevantSwitch.penaltyMinutes)}m penalty</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
