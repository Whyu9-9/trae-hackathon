import type { ContextSwitchPenalty, TaskEntry } from "@/types/task";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

export const exportTasksToExcel = async (
    tasks: TaskEntry[],
    switches: ContextSwitchPenalty[],
    chartImages?: string[],
) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Focus OS";
    workbook.lastModifiedBy = "Focus OS";
    workbook.created = new Date();

    const totalPenalty = switches.reduce((acc, s) => acc + s.penaltyMinutes, 0);

    const summarySheet = workbook.addWorksheet("Summary Report");
    summarySheet.columns = [
        { header: "Metric", key: "metric", width: 34 },
        { header: "Value", key: "value", width: 34 },
    ];
    summarySheet.addRows([
        { metric: "Total Tasks", value: tasks.length },
        { metric: "Total Context Switches", value: switches.length },
        { metric: "Total Penalty Time (mins)", value: Math.round(totalPenalty) },
        {
            metric: "Avg Penalty per Switch (mins)",
            value:
                switches.length > 0
                    ? (totalPenalty / switches.length).toFixed(2)
                    : "0",
        },
        { metric: "Export Date", value: new Date().toLocaleString() },
    ]);

    if (chartImages && chartImages.length > 0) {
        const visualSheet = workbook.addWorksheet("Visual Analytics");
        chartImages.forEach((base64, index) => {
            const imageId = workbook.addImage({
                base64,
                extension: "png",
            });

            visualSheet.addImage(imageId, {
                tl: { col: 0, row: index * 45 + 1 },
                ext: { width: 1400, height: 820 },
            });
        });
    }

    const tasksSheet = workbook.addWorksheet("Tasks History");
    tasksSheet.columns = [
        { header: "ID", key: "id", width: 12 },
        { header: "Type", key: "type", width: 18 },
        { header: "Description", key: "description", width: 44 },
        { header: "Start Time", key: "startTime", width: 26 },
        { header: "End Time", key: "endTime", width: 26 },
        { header: "Duration (mins)", key: "duration", width: 16 },
        { header: "Is Active", key: "isActive", width: 12 },
    ];
    tasks.forEach((task) => {
        tasksSheet.addRow({
            id: task.id,
            type: task.type,
            description: task.description,
            startTime: task.startTime.toISOString(),
            endTime: task.endTime ? task.endTime.toISOString() : "-",
            duration: task.endTime
                ? Math.round(
                      (task.endTime.getTime() - task.startTime.getTime()) /
                          60000,
                  )
                : "-",
            isActive: task.isActive ? "Yes" : "No",
        });
    });

    const switchesSheet = workbook.addWorksheet("Context Switches");
    switchesSheet.columns = [
        { header: "Timestamp", key: "timestamp", width: 26 },
        { header: "From", key: "from", width: 18 },
        { header: "To", key: "to", width: 18 },
        { header: "Penalty (mins)", key: "penalty", width: 16 },
    ];
    switches.forEach((s) => {
        switchesSheet.addRow({
            timestamp: s.timestamp.toISOString(),
            from: s.fromTask,
            to: s.toTask,
            penalty: Math.round(s.penaltyMinutes),
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
        blob,
        `focus-os-full-report-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
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
