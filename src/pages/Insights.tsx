import { useMemo } from "react";
import type { TaskEntry, ContextSwitchPenalty } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LucideLightbulb,
    LucideTrendingUp,
    LucideAlertCircle,
} from "lucide-react";

interface InsightsProps {
    tasks: TaskEntry[];
    switches: ContextSwitchPenalty[];
}

export function Insights({ tasks, switches }: InsightsProps) {
    const focusScore = useMemo(() => {
        if (tasks.length === 0) return 0;

        // Focus Score (0-100) based on:
        // Task completion (25), Average duration (25), Switch frequency (25), Focus time (25)

        const avgDuration =
            tasks.reduce((acc, t) => {
                const end = (t.endTime || new Date()).getTime();
                return acc + (end - t.startTime.getTime());
            }, 0) /
            (tasks.length * 60000); // mins

        const switchFreq = switches.length / tasks.length;
        const totalFocusTime =
            tasks.reduce((acc, t) => {
                const end = (t.endTime || new Date()).getTime();
                return acc + (end - t.startTime.getTime());
            }, 0) / 60000; // mins

        const completionScore = Math.min(25, tasks.length * 5);
        const durationScore = Math.min(25, (avgDuration / 30) * 25);
        const switchScore = Math.max(0, 25 - (switchFreq * 25) / 0.5);
        const focusTimeScore = Math.min(25, (totalFocusTime / 240) * 25);

        return Math.round(
            completionScore + durationScore + switchScore + focusTimeScore,
        );
    }, [tasks, switches]);

    const recommendations = useMemo(() => {
        const recs: string[] = [];
        const switchFreq = switches.length / (tasks.length || 1);

        if (switchFreq > 0.4) {
            recs.push(
                "High switch frequency detected. Try batching similar tasks together.",
            );
        }

        const communicationTasks = tasks.filter(
            (t) => t.type === "communication",
        );
        if (communicationTasks.length > 5) {
            recs.push(
                "Consider scheduling specific windows for communication to reduce context switching.",
            );
        }

        const breaks = tasks.filter((t) => t.type === "break");
        if (tasks.length > 5 && breaks.length === 0) {
            recs.push(
                "Take a break! Short breaks can improve overall focus and cognitive performance.",
            );
        }

        const meetingCount = tasks.filter((t) => t.type === "meeting").length;
        if (meetingCount > 3) {
            recs.push(
                "Back-to-back meetings increase cognitive load. Schedule 5-10 min buffers.",
            );
        }

        const projectWork = tasks.filter((t) => t.type === "project-work");
        const avgProjectDuration =
            projectWork.reduce((acc, t) => {
                const end = (t.endTime || new Date()).getTime();
                return acc + (end - t.startTime.getTime());
            }, 0) /
            (projectWork.length || 1) /
            60000;

        if (projectWork.length > 0 && avgProjectDuration < 30) {
            recs.push(
                "Project work sessions are short. Aim for at least 90 minutes of 'Deep Work'.",
            );
        }

        if (switches.length > 10) {
            recs.push(
                "You've had many context switches today. Focus on one task at a time for the next hour.",
            );
        }

        if (focusScore < 50 && tasks.length > 0) {
            recs.push(
                "Your focus score is low. Try the Pomodoro technique to build concentration.",
            );
        }

        if (recs.length === 0) {
            recs.push("Great job staying focused! Keep up the good work.");
        }

        return recs;
    }, [tasks, switches, focusScore]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Focus Score
                    </CardTitle>
                    <LucideTrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{focusScore}/100</div>
                    <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${focusScore}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Based on completion, duration, and context switching
                        frequency.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <LucideLightbulb className="w-5 h-5 text-amber-400" />
                    Smart Recommendations
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {recommendations.map((rec, i) => (
                        <Card key={i} className="border-l-4 border-l-primary">
                            <CardContent className="p-4 flex items-start gap-3">
                                <LucideAlertCircle className="w-4 h-4 text-primary mt-0.5" />
                                <p className="text-sm">{rec}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
