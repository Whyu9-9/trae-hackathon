import { useState, useEffect, useCallback, useMemo } from "react";
import type { TaskEntry, TaskType, ContextSwitchPenalty } from "@/types/task";
import { saveTasks, loadTasks } from "@/lib/storage";
import { BASE_PENALTIES } from "@/types/task";

const SIMILARITY_MATRIX: Partial<
    Record<TaskType, Partial<Record<TaskType, number>>>
> = {
    "project-work": { documentation: 0.3 },
    meeting: { planning: 0.2 },
};

export const useTasks = () => {
    const [tasks, setTasks] = useState<TaskEntry[]>([]);

    const activeTask = useMemo(
        () => tasks.find((t) => t.isActive) || null,
        [tasks],
    );

    useEffect(() => {
        const loadedTasks = loadTasks();
        setTasks(loadedTasks);
    }, []);

    const calculatePenalty = (from: TaskType, to: TaskType): number => {
        const base = BASE_PENALTIES[to];
        const reduction = SIMILARITY_MATRIX[from]?.[to] || 0;
        return base * (1 - reduction);
    };

    const contextSwitches = useMemo((): ContextSwitchPenalty[] => {
        const switches: ContextSwitchPenalty[] = [];
        for (let i = 1; i < tasks.length; i++) {
            const prev = tasks[i - 1];
            const curr = tasks[i];

            if (prev.type !== curr.type) {
                switches.push({
                    fromTask: prev.type,
                    toTask: curr.type,
                    penaltyMinutes: calculatePenalty(prev.type, curr.type) / 60,
                    timestamp: curr.startTime,
                });
            }
        }
        return switches;
    }, [tasks]);

    const startTask = useCallback(
        (type: TaskType, description: string = "") => {
            const now = new Date();

            setTasks((prev) => {
                const updated = prev.map((t) =>
                    t.isActive ? { ...t, isActive: false, endTime: now } : t,
                );

                const newTask: TaskEntry = {
                    id: now.getTime().toString(),
                    type,
                    description,
                    startTime: now,
                    isActive: true,
                };

                const final = [...updated, newTask];
                saveTasks(final);
                return final;
            });
        },
        [],
    );

    const stopTask = useCallback(() => {
        const now = new Date();
        setTasks((prev) => {
            const final = prev.map((t) =>
                t.isActive ? { ...t, isActive: false, endTime: now } : t,
            );
            saveTasks(final);
            return final;
        });
    }, []);

    const clearAllTasks = useCallback(() => {
        setTasks([]);
        saveTasks([]);
    }, []);

    const importAllTasks = useCallback((importedTasks: TaskEntry[]) => {
        setTasks(importedTasks);
        saveTasks(importedTasks);
    }, []);

    return {
        tasks,
        activeTask,
        contextSwitches,
        startTask,
        stopTask,
        clearAllTasks,
        importAllTasks,
    };
};
