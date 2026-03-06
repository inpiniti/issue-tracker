import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useCalendarApp,
  DayFlowCalendar,
  createMonthView,
  createWeekView,
  createDayView,
  createYearView,
  dateToPlainDate,
  ViewType,
} from '@dayflow/react';
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

// UUID는 8-4-4-4-12 형식, 즉 5개 세그먼트
// event.id 형식: "{prefix}-{issueUUID}" 또는 "task-{issueUUID}-{taskUUID}"
function parseEventId(id: string): {
  prefix: string;
  issueId: string;
  taskId?: string;
} {
  const parts = id.split('-');
  const prefix = parts[0]; // 'completion' | 'task' | 'period'
  const UUID_SEGS = 5; // UUID 세그먼트 수
  const issueId = parts.slice(1, 1 + UUID_SEGS).join('-');
  if (prefix === 'task') {
    const taskId = parts.slice(1 + UUID_SEGS).join('-');
    return { prefix, issueId, taskId };
  }
  return { prefix, issueId };
}

export function CalendarView() {
  const issues = useStore((s) => s.issues);
  const selectIssue = useStore((s) => s.selectIssue);
  const [viewMode, setViewMode] = useState<ViewMode>('completion');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevEventIdsRef = useRef<string[]>([]);
  // 컨테이너 실제 높이를 측정 → style 및 CSS 변수로 DayFlow에 전달
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = Math.max(entry.contentRect.height, 650);
      el.style.setProperty('--df-calendar-height', `${h}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const calendar = useCalendarApp({
    views: [
      createMonthView(),
      createWeekView(),
      createDayView(),
      createYearView(),
    ],
    events: [],
    initialDate: new Date(),
    defaultView: ViewType.MONTH,
    locale: 'ko',
  });

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

  // 이벤트 동기화
  useEffect(() => {
    const toDelete = prevEventIdsRef.current;
    prevEventIdsRef.current = events.map((e) => e.id as string);
    calendar.applyEventsChanges({ delete: toDelete, add: events });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  // 이벤트 클릭 시 이슈 내용 + 작업 내역 패널
  const eventDetailContent = useCallback(
    ({ event, onClose }: { event: CalEvent; onClose: () => void }) => {
      const { prefix, issueId, taskId } = parseEventId(event.id as string);
      const issue = issues.find((i) => i.id === issueId);

      if (!issue) {
        return (
          <div className="p-3 text-sm text-gray-500">
            이슈를 찾을 수 없습니다. (id: {issueId})
          </div>
        );
      }

      const task = taskId ? issue.tasks.find((t) => t.id === taskId) : null;

      return (
        <div className="p-3 min-w-[260px] max-w-[340px] text-sm">
          {/* 이슈 제목 */}
          <div className="font-semibold text-base mb-0.5 text-gray-900 dark:text-gray-100 leading-snug">
            {issue.title || issue.requestNumber}
          </div>
          {issue.title && issue.requestNumber && (
            <div className="text-xs text-gray-400 mb-2">
              {issue.requestNumber}
            </div>
          )}

          {task ? (
            /* 작업 내역 기준: 해당 작업 상세 */
            <div>
              <div className="text-xs text-gray-400 mb-1">
                {task.date}
                {task.duration && ` · ${task.duration}h`}
              </div>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {task.content}
              </div>
            </div>
          ) : (
            /* 완료일/기간 기준: 이슈 내용 + 전체 작업 내역 */
            <>
              {issue.content && (
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-2">
                  {issue.content}
                </div>
              )}
              {issue.tasks.length > 0 && (
                <div className="mt-1 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <div className="text-xs font-medium text-gray-400 mb-1.5">
                    작업 내역
                  </div>
                  <div className="space-y-1.5">
                    {issue.tasks.map((t) => (
                      <div key={t.id} className="text-xs">
                        <span className="text-gray-400">{t.date}</span>
                        {t.duration && (
                          <span className="text-gray-400">
                            {' '}
                            · {t.duration}h
                          </span>
                        )}
                        <div className="text-gray-600 dark:text-gray-400 mt-0.5 whitespace-pre-wrap">
                          {t.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={() => {
              selectIssue(issueId);
              onClose();
            }}
            className="mt-3 text-xs text-blue-500 hover:underline block"
          >
            목록에서 보기 →
          </button>
        </div>
      );

      // prefix 사용 (linter warning 방지)
      void prefix;
    },
    [issues, selectIssue],
  );

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
      <div ref={wrapperRef} className="flex-1 min-h-[650px]">
        <DayFlowCalendar
          calendar={calendar}
          eventDetailContent={eventDetailContent}
        />
      </div>
    </div>
  );
}
