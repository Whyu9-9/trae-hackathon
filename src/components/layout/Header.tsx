import { LucideHelpCircle, LucideDownload, LucideUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { exportTasks, importTasks } from "@/lib/storage";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function Header() {
    const { tasks, importAllTasks } = useTasks();

    const handleExport = () => {
        exportTasks(tasks);
        toast.success("Tasks exported successfully");
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const importedTasks = await importTasks(file);
            importAllTasks(importedTasks);
            toast.success("Tasks imported successfully");
        } catch {
            toast.error("Failed to import tasks");
        }
    };

    return (
        <header className="border-b bg-card">
            <div className="container px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-16">
                <div className="flex items-center gap-2 min-w-0">
                    <img
                        src="/icons.png"
                        alt="Trae Hackathon"
                        className="w-6 h-6"
                    />
                    <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">
                        Trae Hackathon
                    </h1>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleExport}
                        title="Export Data"
                    >
                        <LucideDownload className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <label className="cursor-pointer" title="Import Data">
                            <input
                                type="file"
                                className="hidden"
                                accept=".json"
                                onChange={handleImport}
                            />
                            <LucideUpload className="w-5 h-5" />
                        </label>
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <LucideHelpCircle className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    About Context Switching
                                </DialogTitle>
                                <DialogDescription>
                                    Context switching is the process of shifting
                                    attention between unrelated tasks. Each
                                    switch carries a cognitive penalty that can
                                    reduce productivity by up to 40%.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    <span className="font-semibold text-foreground">
                                        The Cost:
                                    </span>{" "}
                                    It takes an average of 23 minutes to fully
                                    regain focus after a significant
                                    interruption.
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">
                                        Recovery:
                                    </span>{" "}
                                    This tool helps you track these switches and
                                    quantify the time lost to help you build
                                    better focus habits.
                                </p>
                                <div>
                                    <div className="font-semibold text-foreground">
                                        Tips:
                                    </div>
                                    <ul className="mt-2 list-disc list-inside space-y-1">
                                        <li>Group similar tasks together.</li>
                                        <li>
                                            Use "Deep Work" blocks for project
                                            work.
                                        </li>
                                        <li>
                                            Schedule specific times for
                                            communication.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </header>
    );
}
