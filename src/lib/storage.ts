import type { TaskEntry } from "@/types/task";

const STORAGE_KEY = "contextSwitchTasks";

export const saveTasks = (tasks: TaskEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const loadTasks = (): TaskEntry[] => {
    const tasks = localStorage.getItem(STORAGE_KEY);
    if (!tasks) return [];

    try {
    const parsedTasks = JSON.parse(tasks);
    return parsedTasks.map((task: TaskEntry) => ({
      ...task,
      startTime: new Date(task.startTime),
      endTime: task.endTime ? new Date(task.endTime) : undefined,
    }));
    } catch (error) {
        console.error("Failed to parse tasks from localStorage:", error);
        return [];
    }
};

export const clearTasks = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const exportTasks = (tasks: TaskEntry[]) => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `focus-os-tasks-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

export const importTasks = async (file: File): Promise<TaskEntry[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const tasks = JSON.parse(event.target?.result as string);
                resolve(
                    tasks.map((task: TaskEntry) => ({
                        ...task,
                        startTime: new Date(task.startTime),
                        endTime: task.endTime
                            ? new Date(task.endTime)
                            : undefined,
                    })),
                );
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
