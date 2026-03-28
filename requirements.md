# Requirements — Focus OS: Context Switch Tracker

**Product:** Focus OS
**Date:** 2026-03-28

---

## 1. Overview

Focus OS is a client-side web application that helps knowledge workers track task switching throughout their workday and quantify the cognitive cost (productivity penalty) of context switching. The app provides analytics, insights, and recommendations to reduce unproductive interruptions.

---

## 2. Functional Requirements

### 2.1 Task Logging

- **FR-01** The user can start a new task by selecting a task type and entering an optional description.
- **FR-02** The user can stop the currently active task.
- **FR-03** Only one task can be active at a time.
- **FR-04** The following task types must be supported:
    - Project Work
    - Meeting
    - Communication
    - Documentation
    - Creative Work
    - Research
    - Planning
    - Break
- **FR-05** Each task type must have a distinct color for visual identification.
- **FR-06** Task entries must record: `id`, `type`, `description`, `startTime`, `endTime`, `isActive`.

### 2.2 Context Switch Detection & Penalty Calculation

- **FR-07** A context switch is recorded each time the user starts a task while a previous task has ended.
- **FR-08** Each task type has a configurable base penalty (in seconds):

    | Task Type     | Base Penalty |
    | ------------- | ------------ |
    | Project Work  | 600s         |
    | Research      | 540s         |
    | Creative Work | 480s         |
    | Documentation | 420s         |
    | Planning      | 360s         |
    | Meeting       | 240s         |
    | Communication | 120s         |
    | Break         | 60s          |

- **FR-09** Penalties between similar task type transitions must be reduced via a similarity matrix (e.g., Project Work → Documentation: 30% reduction, Meeting → Planning: 20% reduction).
- **FR-10** The app must calculate and display:
    - Total context switches
    - Total penalty time (minutes lost)
    - Cognitive load score (0–100)
    - Most costly switch transition (from → to)
- **FR-11** Cognitive load score must be derived from: switch frequency ratio (40 pts), average penalty per switch (30 pts), and total switch count (30 pts).

### 2.3 Dashboard

- **FR-12** The main page must present four tabs: **Overview**, **Analytics**, **Insights**, **History**.
- **FR-13** A live instrument strip at the top must show in real-time:
    - Number of tasks logged today
    - Number of context switches
    - Active/Idle status indicator
- **FR-14** The layout must be responsive: single column on mobile, three-column grid on desktop.

### 2.4 Analytics

- **FR-15** The Analytics tab must display:
    - Hourly context switch frequency (line chart)
    - Task type distribution (bar chart)
    - Time allocation by task type (pie chart)
- **FR-16** All charts must use consistent task-type color coding.

### 2.5 Productivity Insights

- **FR-17** The app must compute a **Focus Score** (0–100) based on:
    - Task completion count
    - Average task duration
    - Context switching frequency
    - Total focus time
- **FR-18** The app must generate rule-based recommendations (minimum 8 rules) derived from user behavior patterns.
- **FR-19** Recommendations must be dismissible per session.
- **FR-20** The app must detect and display the user's peak productivity hour.

### 2.6 Task History

- **FR-21** The History tab must show a scrollable, chronological timeline of all tasks.
- **FR-22** The active task must be visually distinguished with a "Live" indicator.
- **FR-23** Each history entry must show: task type, description, start time, end time, and duration.
- **FR-24** Context switch penalty indicators must appear between task entries in the timeline.
- **FR-25** The user can clear all history with a confirmation action.

### 2.7 Data Management

- **FR-26** All task data must be persisted to browser `localStorage` under the key `contextSwitchTasks`.
- **FR-27** The user can export all task data as a JSON file.
- **FR-28** The user can import task data from a JSON file, replacing current data.
- **FR-29** Data must survive page refresh without loss.

### 2.8 Educational Content

- **FR-30** A help modal must be accessible from the header explaining context switching, its negative effects, recovery times, and tips to reduce it.

---

## 3. Non-Functional Requirements

### 3.1 Performance

- **NFR-01** The application must load and be interactive in under 3 seconds on a standard broadband connection.
- **NFR-02** All calculations (penalty, focus score, charts) must update synchronously on each task state change with no perceptible lag.

### 3.2 Compatibility

- **NFR-03** The application must function in all modern browsers (Chrome, Firefox, Safari, Edge — latest two major versions).
- **NFR-04** The application must be fully usable on mobile devices (≥ 375px viewport width).

### 3.3 Privacy & Data

- **NFR-05** No user data must leave the browser. There is no backend, no API calls, and no analytics tracking.
- **NFR-06** All data storage is local-first via `localStorage`; data is lost when the user clears browser storage.

### 3.4 Accessibility

- **NFR-07** Interactive elements must be keyboard-navigable.
- **NFR-08** All UI components must use semantic HTML and ARIA attributes (provided by Radix UI primitives).
- **NFR-09** Color is not the sole differentiator for task types — text labels must always accompany color.

### 3.5 Theme

- **NFR-10** The application must support dark and light modes, togglable by the user.
- **NFR-11** The default theme is an industrial dark palette with amber accent (HSL 38 90% 52%).

---

## 4. Tech Stack Constraints

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Language      | TypeScript 5.x               |
| Framework     | React 18.x                   |
| Build Tool    | Vite 7.x                     |
| Styling       | Tailwind CSS 3.x + shadcn/ui |
| Components    | Radix UI                     |
| Charts        | Recharts 2.x                 |
| Routing       | React Router DOM 6.x         |
| Forms         | React Hook Form + Zod        |
| Notifications | Sonner                       |
| Icons         | Lucide React                 |
| Date Handling | date-fns 3.x                 |

---

## 5. Data Models

### TaskType

```
'project-work' | 'meeting' | 'communication' | 'documentation' |
'creative-work' | 'research' | 'planning' | 'break'
```

### TaskEntry

```
id:          string     // unique identifier (timestamp-based)
type:        TaskType
description: string
startTime:   Date
endTime?:    Date
isActive:    boolean
```

### ContextSwitchPenalty

```
fromTask:       TaskType
toTask:         TaskType
penaltyMinutes: number
timestamp:      Date
```

### ProductivityMetrics

```
totalTasks:           number
totalContextSwitches: number
totalPenaltyTime:     number
averagePenalty:       number
mostProductiveHour:   number
taskDistribution:     Record<TaskType, number>
```

---

## 6. Out of Scope

- User authentication or accounts
- Cloud sync or remote storage
- Team/multi-user features
- Native mobile app (iOS/Android)
- Backend API or database
- Notifications or background tracking
- Calendar or external tool integrations
- Billing or subscription management
