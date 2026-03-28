import { useMemo } from "react";
import type { TaskEntry, TaskType, ContextSwitchPenalty } from "@/types/task";
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
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHours } from "date-fns";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface AnalyticsProps {
    tasks: TaskEntry[];
    switches: ContextSwitchPenalty[];
    exportMode?: boolean;
}

export function Analytics({ tasks, switches, exportMode }: AnalyticsProps) {
    const chartHeightClass = exportMode ? "h-[520px]" : "h-[300px]";
    const axisFontSize = exportMode ? 12 : 10;
    const pieOuterRadius = exportMode ? 170 : 80;
    const topGridClass = exportMode
        ? "grid grid-cols-1 gap-6"
        : "grid grid-cols-1 md:grid-cols-2 gap-6";
    const distributionData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach((task) => {
            counts[task.type] = (counts[task.type] || 0) + 1;
        });
        return Object.entries(counts).map(([type, count]) => ({
            name: type.replace("-", " "),
            value: count,
            type: type as TaskType,
        }));
    }, [tasks]);

    const transitionData = useMemo(() => {
        const transitions = {} as Record<TaskType, Record<TaskType, number>>;
        const types: TaskType[] = [
            "project-work",
            "meeting",
            "communication",
            "documentation",
            "creative-work",
            "research",
            "planning",
            "break",
        ];

        // Initialize matrix
        types.forEach((from) => {
            transitions[from] = {} as Record<TaskType, number>;
            types.forEach((to) => {
                transitions[from][to] = 0;
            });
        });

        // Count transitions
        switches.forEach((sw) => {
            if (
                transitions[sw.fromTask] &&
                transitions[sw.fromTask][sw.toTask] !== undefined
            ) {
                transitions[sw.fromTask][sw.toTask]++;
            }
        });

        // Convert to probability matrix
        return types.map((from) => {
            const row = { name: from.replace("-", " ") } as {
                name: string;
            } & Record<TaskType, number>;
            const totalFrom = Object.values(transitions[from]).reduce(
                (a, b) => a + b,
                0,
            );

            types.forEach((to) => {
                const count = transitions[from][to];
                row[to] =
                    totalFrom > 0
                        ? parseFloat(((count / totalFrom) * 100).toFixed(1))
                        : 0;
            });
            return row;
        });
    }, [switches]);

    const hourlyData = useMemo(() => {
        const hours: Record<number, number> = {};
        // Initialize all 24 hours
        for (let i = 0; i < 24; i++) hours[i] = 0;

        tasks.forEach((task) => {
            const hour = getHours(task.startTime);
            hours[hour] = (hours[hour] || 0) + 1;
        });

        return Object.entries(hours).map(([hour, count]) => ({
            hour: `${hour}:00`,
            count,
        }));
    }, [tasks]);

    const durationData = useMemo(() => {
        const durations: Record<string, number> = {};
        tasks.forEach((task) => {
            const start = task.startTime.getTime();
            const end = (task.endTime || new Date()).getTime();
            const mins = (end - start) / (1000 * 60);
            durations[task.type] = (durations[task.type] || 0) + mins;
        });
        return Object.entries(durations).map(([type, value]) => ({
            name: type.replace("-", " "),
            value: Math.round(value),
            type: type as TaskType,
        }));
    }, [tasks]);

    return (
        <div className="space-y-6">
            <div className={topGridClass}>
                <Card className="chart-to-export">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-medium">
                                Task Type Distribution
                            </CardTitle>
                            <InfoTooltip content="Shows the count of each task type logged today." />
                        </div>
                    </CardHeader>
                    <CardContent className={chartHeightClass}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#333"
                                />
                                <XAxis
                                    dataKey="name"
                                    fontSize={axisFontSize}
                                    tick={{ fill: "#888" }}
                                />
                                <YAxis
                                    fontSize={axisFontSize}
                                    tick={{ fill: "#888" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        border: "1px solid #3f3f46",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="value">
                                    {distributionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={TASK_COLORS[entry.type]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="chart-to-export">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-medium">
                                Time Allocation (Minutes)
                            </CardTitle>
                            <InfoTooltip content="Total minutes spent on each task type today." />
                        </div>
                    </CardHeader>
                    <CardContent className={chartHeightClass}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={durationData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={pieOuterRadius}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name }) => name}
                                >
                                    {durationData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={TASK_COLORS[entry.type]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        border: "1px solid #3f3f46",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="chart-to-export">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                            Hourly Activity
                        </CardTitle>
                        <InfoTooltip content="Frequency of task starts throughout the day." />
                    </div>
                </CardHeader>
                <CardContent className={chartHeightClass}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlyData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#333"
                            />
                            <XAxis
                                dataKey="hour"
                                fontSize={axisFontSize}
                                tick={{ fill: "#888" }}
                            />
                            <YAxis
                                fontSize={axisFontSize}
                                tick={{ fill: "#888" }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #3f3f46",
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                            Task Transition Probability (%)
                        </CardTitle>
                        <InfoTooltip content="Probability of switching to another task type based on your history. Helps identify focus-breaking patterns." />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border border-border bg-muted/50">
                                        From \ To
                                    </th>
                                    {[
                                        "proj",
                                        "meet",
                                        "comm",
                                        "doc",
                                        "crea",
                                        "rese",
                                        "plan",
                                        "brea",
                                    ].map((t) => (
                                        <th
                                            key={t}
                                            className="p-2 border border-border bg-muted/50 capitalize"
                                        >
                                            {t}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transitionData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="p-2 border border-border font-medium bg-muted/30 capitalize whitespace-nowrap min-w-[140px]">
                                            {row.name}
                                        </td>
                                        {[
                                            "project-work",
                                            "meeting",
                                            "communication",
                                            "documentation",
                                            "creative-work",
                                            "research",
                                            "planning",
                                            "break",
                                        ].map((type) => (
                                            <td
                                                key={type}
                                                className="p-2 border border-border text-center"
                                                style={{
                                                    backgroundColor:
                                                        row[type as TaskType] >
                                                        0
                                                            ? `rgba(61, 240, 141, ${Math.min(0.8, row[type as TaskType] / 100 + 0.1)})`
                                                            : "transparent",
                                                    color:
                                                        row[type as TaskType] >
                                                        40
                                                            ? "#000"
                                                            : "#fff",
                                                }}
                                            >
                                                {row[type as TaskType] > 0
                                                    ? `${row[type as TaskType]}%`
                                                    : "-"}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4">
                        Probability of switching to a task type (columns) given
                        the current task type (rows).
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
