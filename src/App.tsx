import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/pages/Overview";
import { Analytics } from "@/pages/Analytics";
import { Insights } from "@/pages/Insights";
import { History } from "@/pages/History";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import {
    LucideBot,
    LucideBrain,
    LucideLoader2,
    LucidePlay,
    LucideSquare,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TASK_TYPES, type TaskType } from "@/types/task";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

type AIInsight = {
    summary?: string;
    bottleneck?: string;
    recommendation?: string;
};

function App() {
    const { tasks, activeTask, contextSwitches, startTask, stopTask } =
        useTasks();
    const [newType, setNewType] = useState<TaskType>("project-work");
    const [newDesc, setNewDesc] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAIInsightOpen, setIsAIInsightOpen] = useState(false);
    const [isAIInsightLoading, setIsAIInsightLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

    const workerUrl =
        import.meta.env.VITE_AI_WORKER_URL ??
        "https://context-ai.wahyuivanmahendra.workers.dev/";
    const apiKey = import.meta.env.VITE_AI_API_KEY ?? "";

    const focusScore = useMemo(() => {
        if (tasks.length === 0) return 0;

        const avgDuration =
            tasks.reduce((acc, t) => {
                const end = (t.endTime || new Date()).getTime();
                return acc + (end - t.startTime.getTime());
            }, 0) /
            (tasks.length * 60000);

        const switchFreq = contextSwitches.length / tasks.length;
        const totalFocusTime =
            tasks.reduce((acc, t) => {
                const end = (t.endTime || new Date()).getTime();
                return acc + (end - t.startTime.getTime());
            }, 0) / 60000;

        const completionScore = Math.min(25, tasks.length * 5);
        const durationScore = Math.min(25, (avgDuration / 30) * 25);
        const switchScore = Math.max(0, 25 - (switchFreq * 25) / 0.5);
        const focusTimeScore = Math.min(25, (totalFocusTime / 240) * 25);

        return Math.round(
            completionScore + durationScore + switchScore + focusTimeScore,
        );
    }, [tasks, contextSwitches.length]);

    const fetchAIInsight = async () => {
        if (tasks.length === 0) {
            toast.error("No tasks yet. Start logging tasks first.");
            return;
        }

        if (!apiKey) {
            toast.error("Missing VITE_AI_API_KEY in your environment.");
            return;
        }

        setIsAIInsightLoading(true);
        try {
            const response = await fetch(workerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: apiKey,
                    lang: "id",
                    tasks: tasks.slice(-50),
                    metrics: {
                        focusScore,
                        totalSwitches: contextSwitches.length,
                        totalTasks: tasks.length,
                        totalPenaltyMinutes: Math.round(
                            contextSwitches.reduce(
                                (acc, s) => acc + s.penaltyMinutes,
                                0,
                            ),
                        ),
                    },
                }),
            });

            if (!response.ok) {
                const bodyText = await response.text().catch(() => "");
                throw new Error(
                    bodyText
                        ? `${response.status}: ${bodyText}`
                        : `${response.status}: Request failed`,
                );
            }

            const data = (await response.json()) as AIInsight;
            setAiInsight(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch AI insight";
            toast.error(message);
        } finally {
            setIsAIInsightLoading(false);
        }
    };

    const handleStart = () => {
        startTask(newType, newDesc);
        setIsDialogOpen(false);
        setNewDesc("");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />

            <main className="flex-1 container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
                    <div className="min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Dashboard
                        </h2>
                        <p className="text-muted-foreground">
                            Monitor your context switching costs.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                        {activeTask ? (
                            <Button
                                variant="destructive"
                                onClick={stopTask}
                                className="w-full sm:w-auto"
                            >
                                <LucideSquare className="w-4 h-4 mr-2" />
                                Stop {activeTask.type.replace("-", " ")}
                            </Button>
                        ) : (
                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-full sm:w-auto"
                                    >
                                        <LucidePlay className="w-4 h-4 mr-2" />
                                        Start New Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Start New Task
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label>Task Type</Label>
                                            <div className="size-1"></div>
                                            <Select
                                                value={newType}
                                                onValueChange={(v) =>
                                                    setNewType(v as TaskType)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TASK_TYPES.map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                            className="capitalize"
                                                        >
                                                            {type.replace(
                                                                "-",
                                                                " ",
                                                            )}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Description (Optional)
                                            </Label>
                                            <div className="size-1"></div>
                                            <Input
                                                placeholder="What are you working on?"
                                                value={newDesc}
                                                onChange={(e) =>
                                                    setNewDesc(e.target.value)
                                                }
                                            />
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={handleStart}
                                        >
                                            Start Task
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-card border w-full md:w-auto justify-start overflow-x-auto flex-nowrap max-w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Overview
                            tasks={tasks}
                            switches={contextSwitches}
                            activeTask={activeTask}
                        />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Analytics tasks={tasks} switches={contextSwitches} />
                    </TabsContent>

                    <TabsContent value="insights">
                        <Insights tasks={tasks} switches={contextSwitches} />
                    </TabsContent>

                    <TabsContent value="history">
                        <History tasks={tasks} switches={contextSwitches} />
                    </TabsContent>
                </Tabs>
            </main>

            <div
                id="excel-export-container"
                className="fixed -left-[9999px] top-0 w-[1600px] pointer-events-none"
                aria-hidden="true"
            >
                <Analytics tasks={tasks} switches={contextSwitches} exportMode />
            </div>

            <Footer />
            <Toaster position="bottom-right" theme="dark" />

            <Dialog open={isAIInsightOpen} onOpenChange={setIsAIInsightOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg"
                        size="icon"
                        onClick={() => {
                            setIsAIInsightOpen(true);
                            if (!aiInsight && !isAIInsightLoading) {
                                void fetchAIInsight();
                            }
                        }}
                        title="AI Insight"
                    >
                        {isAIInsightLoading ? (
                            <LucideLoader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <LucideBrain className="w-5 h-5" />
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LucideBot className="w-4 h-4 text-primary" />
                            AI Insight
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                            Focus score:{" "}
                            <span className="text-foreground">
                                {focusScore}/100
                            </span>
                        </div>

                        {aiInsight ? (
                            <div className="space-y-3">
                                <div className="text-sm">
                                    {aiInsight.summary ||
                                        "No summary returned."}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Bottleneck:{" "}
                                    <span className="text-foreground">
                                        {aiInsight.bottleneck || "unknown"}
                                    </span>
                                </div>
                                <div className="rounded-md border bg-card p-3 text-sm">
                                    {aiInsight.recommendation ||
                                        "No recommendation returned."}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                {isAIInsightLoading
                                    ? "Analyzing your latest data..."
                                    : "No AI insight yet."}
                            </div>
                        )}

                        <Button
                            variant="outline"
                            disabled={isAIInsightLoading}
                            onClick={() => void fetchAIInsight()}
                        >
                            Refresh
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default App;
