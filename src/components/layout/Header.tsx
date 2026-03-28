import { LucideLayout, LucideHelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function Header() {
    return (
        <header className="border-b bg-card">
            <div className="container flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <LucideLayout className="w-6 h-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">
                        Focus OS
                    </h1>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <LucideHelpCircle className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>About Context Switching</DialogTitle>
                            <DialogDescription>
                                Context switching is the process of shifting
                                attention between unrelated tasks. Each switch
                                carries a cognitive penalty that can reduce
                                productivity by up to 40%.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                <strong>The Cost:</strong> It takes an average
                                of 23 minutes to fully regain focus after a
                                significant interruption.
                            </p>
                            <p>
                                <strong>Recovery:</strong> Focus OS helps you
                                track these switches and quantify the time lost
                                to help you build better focus habits.
                            </p>
                            <p>
                                <strong>Tips:</strong>
                                <ul className="list-disc list-inside">
                                    <li>Group similar tasks together.</li>
                                    <li>
                                        Use "Deep Work" blocks for project work.
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
        </header>
    );
}
