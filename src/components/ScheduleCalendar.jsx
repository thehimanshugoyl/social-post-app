import React, { useMemo, useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { draftScheduled } from '../store/postsSlice';
import { selectDraftsByScheduledDate, selectAllDrafts } from '../store/selectors';

const PLATFORM_ICONS = {
  twitter: '𝕏',
  instagram: '📷',
  linkedin: 'in',
  facebook: 'f',
};

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildMonthGrid(year, month) {
  // month: 0-indexed (0 = January)
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

// Memoized day cell — Experiment 1.4.2 performance concern addressed here too:
// without React.memo, every drag-over event on ANY cell would re-render ALL
// cells, since the parent re-renders on every state change during a drag.
const DayCell = memo(function DayCell({ date, drafts, isDragOver, onDragOver, onDragLeave, onDrop, onDragStart }) {
  if (!date) return <div className="cal-cell cal-cell-empty" />;

  const dateKey = toDateKey(date);
  const isToday = dateKey === toDateKey(new Date());

  return (
    <div
      className={`cal-cell ${isDragOver ? 'drag-over' : ''} ${isToday ? 'today' : ''}`}
      onDragOver={(e) => onDragOver(e, dateKey)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, dateKey)}
    >
      <div className="cal-date">{date.getDate()}</div>
      <div className="cal-events">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="cal-event"
            draggable
            onDragStart={(e) => onDragStart(e, draft.id)}
            title={draft.text}
          >
            {draft.platformIds.map((pid) => (
              <span key={pid} className="chip-icon small">{PLATFORM_ICONS[pid]}</span>
            ))}
            <span className="cal-event-text">
              {draft.text.trim() ? draft.text.slice(0, 20) : '(empty)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function ScheduleCalendar() {
  const dispatch = useDispatch();
  const draftsByDate = useSelector(selectDraftsByScheduledDate);
  const allDrafts = useSelector(selectAllDrafts);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [dragOverDate, setDragOverDate] = useState(null);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const unscheduledDrafts = useMemo(
    () => allDrafts.filter((d) => !d.scheduledAt),
    [allDrafts]
  );

  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleDragStart = useCallback((e, draftId) => {
    e.dataTransfer.setData('text/draft-id', draftId);
  }, []);

  const handleDragOver = useCallback((e, dateKey) => {
    e.preventDefault();
    setDragOverDate(dateKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback(
    (e, dateKey) => {
      e.preventDefault();
      const draftId = e.dataTransfer.getData('text/draft-id');
      if (draftId) {
        dispatch(draftScheduled({ id: draftId, scheduledAt: dateKey }));
      }
      setDragOverDate(null);
    },
    [dispatch]
  );

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="post-creator calendar-wrap">
      <div className="header">
        <h2>Schedule Posts</h2>
        <p className="subtitle">Drag a draft onto a date to schedule it</p>
      </div>

      <div className="cal-nav">
        <button className="secondary" onClick={goToPrevMonth} type="button">← Prev</button>
        <strong>{monthLabel}</strong>
        <button className="secondary" onClick={goToNextMonth} type="button">Next →</button>
      </div>

      <div className="cal-grid cal-grid-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>

      <div className="cal-grid">
        {grid.map((date, i) => {
          const dateKey = date ? toDateKey(date) : null;
          return (
            <DayCell
              key={i}
              date={date}
              drafts={dateKey ? draftsByDate[dateKey] || [] : []}
              isDragOver={dateKey === dragOverDate}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />
          );
        })}
      </div>

      {unscheduledDrafts.length > 0 && (
        <>
          <div className="section-label drafts-label">Unscheduled Drafts</div>
          <div className="cal-unscheduled">
            {unscheduledDrafts.map((draft) => (
              <div
                key={draft.id}
                className="cal-event cal-event-pool"
                draggable
                onDragStart={(e) => handleDragStart(e, draft.id)}
                title={draft.text}
              >
                {draft.platformIds.map((pid) => (
                  <span key={pid} className="chip-icon small">{PLATFORM_ICONS[pid]}</span>
                ))}
                <span className="cal-event-text">
                  {draft.text.trim() ? draft.text.slice(0, 24) : '(empty draft)'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}