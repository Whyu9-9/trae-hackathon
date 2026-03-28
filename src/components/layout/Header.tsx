import {
    LucideLayout,
    LucideHelpCircle,
    LucideDownload,
    LucideUpload,
} from "lucide-react";
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
        } catch (error) {
            toast.error("Failed to import tasks");
        }
    };

    return (
        <header className="border-b bg-card">
            <div className="container flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <LucideLayout className="w-6 h-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">
                        Trae Hackathon
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleExport}
                        title="Export Data"
                    >
                        <LucideDownload className="w-5 h-5" />
                    </Button>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                        <div className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                            <LucideUpload className="w-5 h-5" />
                        </div>
                    </label>

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
                                    <strong>The Cost:</strong> It takes an
                                    average of 23 minutes to fully regain focus
                                    after a significant interruption.
                                </p>
                                <p>
                                    <strong>Recovery:</strong> This tool helps
                                    you track these switches and quantify the
                                    time lost to help you build better focus
                                    habits.
                                </p>
                                <p>
                                    <strong>Tips:</strong>
                                    <ul className="list-disc list-inside">
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
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </header>
    );
}
