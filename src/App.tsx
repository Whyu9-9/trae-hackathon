import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/pages/Overview";
import { Analytics } from "@/pages/Analytics";
import { Insights } from "@/pages/Insights";
import { History } from "@/pages/History";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { LucidePlay, LucideSquare } from "lucide-react";
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

function App() {
    const { tasks, activeTask, contextSwitches, startTask, stopTask } =
        useTasks();
    const [newType, setNewType] = useState<TaskType>("project-work");
    const [newDesc, setNewDesc] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleStart = () => {
        startTask(newType, newDesc);
        setIsDialogOpen(false);
        setNewDesc("");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Header />

            <main className="flex-1 container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h2>
                        <p className="text-muted-foreground">
                            Monitor your context switching costs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTask ? (
                            <Button variant="destructive" onClick={stopTask}>
                                <LucideSquare className="w-4 h-4 mr-2" />
                                Stop {activeTask.type.replace("-", " ")}
                            </Button>
                        ) : (
                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="default">
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
                    <TabsList className="bg-card border w-full justify-start md:w-auto">
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
                        <Analytics
                            tasks={tasks}
                            switches={contextSwitches}
                        />
                    </TabsContent>

                    <TabsContent value="insights">
                        <Insights tasks={tasks} switches={contextSwitches} />
                    </TabsContent>

                    <TabsContent value="history">
                        <History tasks={tasks} switches={contextSwitches} />
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
            <Toaster position="bottom-right" theme="dark" />
        </div>
    );
}

export default App;
