import { useMemo } from "react";
import type { TaskEntry, ContextSwitchPenalty } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LucideLightbulb,
    LucideTrendingUp,
    LucideAlertCircle,
    LucideZap,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface InsightsProps {
    tasks: TaskEntry[];
    switches: ContextSwitchPenalty[];
}

export function Insights({ tasks, switches }: InsightsProps) {
    const metrics = useMemo(() => {
        if (tasks.length === 0) {
            return {
                focusScore: 0,
                cognitiveLoad: 0,
                overheadRatio: 0,
                fragmentationIndex: 0,
                dwsi: 0,
                recoveryEfficiency: 0,
                peakHour: null,
            };
        }

        const durations = tasks.map((t) => {
            const end = (t.endTime || new Date()).getTime();
            return (end - t.startTime.getTime()) / 60000; // mins
        });

        const totalActiveTime = durations.reduce((acc, d) => acc + d, 0);
        const totalPenaltyTime = switches.reduce(
            (acc, s) => acc + s.penaltyMinutes,
            0,
        );

        // 1. Focus Score
        const avgDuration = totalActiveTime / tasks.length;
        const switchFreq = switches.length / tasks.length;

        const completionScore = Math.min(25, tasks.length * 5);
        const durationScore = Math.min(25, (avgDuration / 30) * 25);
        const switchScore = Math.max(0, 25 - (switchFreq * 25) / 0.5);
        const focusTimeScore = Math.min(25, (totalActiveTime / 240) * 25);
        const focusScore = Math.round(
            completionScore + durationScore + switchScore + focusTimeScore,
        );

        // 2. Cognitive Load Score (FR-11: frequency 40%, avg penalty 30%, total switches 30%)
        const avgPenalty =
            switches.length > 0 ? totalPenaltyTime / switches.length : 0;
        const freqLoad = Math.min(40, (switchFreq / 0.8) * 40);
        const penaltyLoad = Math.min(30, (avgPenalty / 10) * 30);
        const countLoad = Math.min(30, (switches.length / 15) * 30);
        const cognitiveLoad = Math.round(freqLoad + penaltyLoad + countLoad);

        // 3. Context Switching Overhead Ratio (CSOR)
        const overheadRatio =
            totalActiveTime > 0 ? (totalPenaltyTime / totalActiveTime) * 100 : 0;

        // 4. Focus Fragmentation Index (FFI)
        const longTasks = durations.filter((d) => d > 25).length;
        const fragmentationIndex = Math.round(
            (1 - longTasks / tasks.length) * 100,
        );

        // 5. Deep Work Stability Index (DWSI)
        const mean = avgDuration;
        const variance =
            durations.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) /
            tasks.length;
        const stdDev = Math.sqrt(variance);
        const dwsi = stdDev === 0 ? 0 : parseFloat((mean / stdDev).toFixed(2));

        // 6. Recovery Efficiency Score
        let recoveryEfficiency = 0;
        if (switches.length > 0) {
            let totalEfficiency = 0;
            let count = 0;
            for (let i = 1; i < tasks.length; i++) {
                const curr = tasks[i];
                if (curr.type === "break") {
                    const penalty = switches.find(
                        (s) => s.timestamp === curr.startTime,
                    )?.penaltyMinutes;
                    if (penalty && penalty > 5) {
                        const breakDuration =
                            ((curr.endTime || new Date()).getTime() -
                                curr.startTime.getTime()) /
                            60000;
                        totalEfficiency += Math.min(100, (breakDuration / penalty) * 100);
                        count++;
                    }
                }
            }
            recoveryEfficiency = count > 0 ? Math.round(totalEfficiency / count) : 0;
        }

        // 7. Peak Productivity Hour
        const hourlyFocus: Record<number, number> = {};
        tasks.forEach((task) => {
            const hour = task.startTime.getHours();
            const end = (task.endTime || new Date()).getTime();
            const duration = (end - task.startTime.getTime()) / 60000;
            hourlyFocus[hour] = (hourlyFocus[hour] || 0) + duration;
        });

        let maxHour = -1;
        let maxDuration = -1;
        Object.entries(hourlyFocus).forEach(([hour, duration]) => {
            if (duration > maxDuration) {
                maxDuration = duration;
                maxHour = parseInt(hour);
            }
        });
        const peakHour = maxHour === -1 ? null : maxHour;

        return {
            focusScore,
            cognitiveLoad,
            overheadRatio,
            fragmentationIndex,
            dwsi,
            recoveryEfficiency,
            peakHour,
        };
    }, [tasks, switches]);

    const {
        focusScore,
        cognitiveLoad,
        overheadRatio,
        fragmentationIndex,
        dwsi,
        recoveryEfficiency,
        peakHour,
    } = metrics;

    const recommendations = useMemo(() => {
        const recs: string[] = [];

        if (peakHour !== null) {
            recs.push(
                `Your peak productivity hour is around ${peakHour}:00. Protect this time for your most complex Project Work.`,
            );
        }

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

        if (recoveryEfficiency < 50 && switches.length > 5) {
            recs.push(
                "Recovery efficiency is low. Take longer breaks after high-penalty context switches.",
            );
        }

        if (dwsi < 1 && tasks.length > 3) {
            recs.push(
                "Your work sessions are inconsistent. Try to standardize your task durations.",
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

        if (recs.length === 0) {
            recs.push("Great job staying focused! Keep up the good work.");
        }

        return recs;
    }, [tasks, switches, peakHour, recoveryEfficiency, dwsi]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-medium">
                                Focus Score
                            </CardTitle>
                            <InfoTooltip content="A summary of your overall productivity based on completion rate, duration, and context switching." />
                        </div>
                        <LucideTrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {focusScore}/100
                        </div>
                        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${focusScore}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Overall focus health based on duration and
                            switching.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-medium">
                                Cognitive Load
                            </CardTitle>
                            <InfoTooltip content="Measures the mental strain caused by the intensity and frequency of context switches today." />
                        </div>
                        <LucideZap className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {cognitiveLoad}/100
                        </div>
                        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-destructive transition-all duration-500"
                                style={{ width: `${cognitiveLoad}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Mental strain from context switching intensity.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                                Switching Overhead
                            </CardTitle>
                            <InfoTooltip content="Percentage of total time lost to context switching compared to productive work time." />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {overheadRatio.toFixed(1)}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Time lost vs productive time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                                Fragmentation
                            </CardTitle>
                            <InfoTooltip content="The extent to which your focus is broken by short tasks. Higher means more frequent interruptions." />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {fragmentationIndex}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Broken focus bursts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                                Stability (DWSI)
                            </CardTitle>
                            <InfoTooltip content="Deep Work Stability Index. Measures how consistent your focus sessions are. Higher values mean more stable focus." />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dwsi}</div>
                        <p className="text-[10px] text-muted-foreground">
                            Session consistency ratio
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                                Recovery Efficiency
                            </CardTitle>
                            <InfoTooltip content="How well you recover focus through breaks. Measures break duration relative to previous switching penalties." />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {recoveryEfficiency}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Break effectiveness
                        </p>
                    </CardContent>
                </Card>
            </div>

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
