import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarApp,
  CalendarRenderer,
  createMonthView,
  createWeekView,
  createDayView,
  dateToPlainDate,
  ViewType,
} from '@dayflow/core';
import type { Event as CalEvent } from '@dayflow/core';
import { useStore } from '../store/useStore';

type ViewMode = 'completion' | 'task' | 'period';

// YYYY.MM.DD → Date
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

export function CalendarView() {
  const issues = useStore((s) => s.issues);
  const selectIssue = useStore((s) => s.selectIssue);
  const [viewMode, setViewMode] = useState<ViewMode>('completion');
  const viewModeRef = useRef(viewMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<CalendarApp | null>(null);

  // Keep viewModeRef in sync
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // Init CalendarApp and CalendarRenderer once
  useEffect(() => {
    const app = new CalendarApp({
      views: [createMonthView(), createWeekView(), createDayView()],
      events: [],
      initialDate: new Date(),
      defaultView: ViewType.MONTH,
      locale: 'ko',
      callbacks: {
        onEventClick(event) {
          const parts = (event.id as string).split('-');
          // id 형식: "completion-<issueId>" | "task-<issueId>-<taskId>" | "period-<issueId>"
          const issueId =
            viewModeRef.current === 'task'
              ? parts.slice(1, -1).join('-')
              : parts.slice(1).join('-');
          selectIssue(issueId);
        },
      },
    });
    appRef.current = app;

    const renderer = new CalendarRenderer(app);
    if (containerRef.current) {
      renderer.mount(containerRef.current);
    }

    return () => {
      renderer.unmount();
      appRef.current = null;
    };
  }, [selectIssue]);

  const events = useMemo<CalEvent[]>(() => {
    const result: CalEvent[] = [];

    if (viewMode === 'completion') {
      for (const issue of issues) {
        const date = parseDate(issue.completionDate);
        if (!date) continue;
        const pd = dateToPlainDate(date);
        result.push({
          id: `completion-${issue.id}`,
          title: `✓ ${issue.title || issue.requestNumber}`,
          start: pd,
          end: pd,
          allDay: true,
        });
      }
    } else if (viewMode === 'task') {
      for (const issue of issues) {
        for (const task of issue.tasks) {
          const date = parseDate(task.date);
          if (!date) continue;
          const pd = dateToPlainDate(date);
          const duration = task.duration ? ` (${task.duration}h)` : '';
          result.push({
            id: `task-${issue.id}-${task.id}`,
            title: `${issue.title || issue.requestNumber}${duration}`,
            start: pd,
            end: pd,
            allDay: true,
          });
        }
      }
    } else {
      for (const issue of issues) {
        const start = parseDate(issue.startDate);
        const end = parseDate(issue.endDate);
        if (!start) continue;
        const endDate = end ?? start;
        result.push({
          id: `period-${issue.id}`,
          title: issue.title || issue.requestNumber,
          start: dateToPlainDate(start),
          end: dateToPlainDate(endDate),
          allDay: true,
        });
      }
    }

    return result;
  }, [issues, viewMode]);

  // Sync events into CalendarApp when they change
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const toDelete = app.getAllEvents().map((e) => e.id as string);
    app.applyEventsChanges({ delete: toDelete, add: events });
  }, [events]);

  const modeButtons: { key: ViewMode; label: string }[] = [
    { key: 'completion', label: '완료일 기준' },
    { key: 'task', label: '작업 내역 기준' },
    { key: 'period', label: '기간 기준' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 기준 선택 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
        <span className="text-sm text-muted-foreground mr-2">표시 기준:</span>
        {modeButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === key
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {events.length}개 항목
        </span>
      </div>

      {/* 달력 */}
      <div ref={containerRef} className="calendar-host flex-1 overflow-hidden" />
    </div>
  );
}
