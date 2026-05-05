import { useState, useEffect, useMemo } from 'react';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import { useTaskContext } from '../context/TaskContext';
import { useGet } from '../hooks/useGet';
import { CALENDAR_URLS } from '../apis';
import type { CalendarEvent } from '../components/type/typesInterface';
import './style/Home.css';
import './style/Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const getEventStyle = (event: CalendarEvent) => {
  const classes = [`calendar-event`, `type-${event.type}`];
  if (event.priority) classes.push(`priority-${event.priority}`);
  if (event.status === 'completed') classes.push('status-completed');
  return classes.join(' ');
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function Calendar() {
  const { tasks, loading: tasksLoading } = useTaskContext();
  const { execute: fetchCalendarEvents, loading: eventsLoading } = useGet<CalendarEvent[]>(CALENDAR_URLS.get);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<{ eventId: string; dayKey: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCalendarEvents();
        if (Array.isArray(data)) {
          setCalendarEvents(data);
        }
      } catch {
        // Calendar events endpoint may not exist yet — gracefully degrade
        // Tasks from TaskContext are still shown
      }
    };
    load();
  }, [fetchCalendarEvents]);

  const allEvents = useMemo(() => {
    const taskEvents: CalendarEvent[] = tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: formatDateKey(t.dueDate!),
        type: 'task' as const,
        status: t.isCompleted ? 'completed' : t.status,
        priority: t.priority,
      }));

    return [...taskEvents, ...calendarEvents];
  }, [tasks, calendarEvents]);

  const eventsMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of allEvents) {
      const key = event.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [allEvents]);

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    const todayKey = formatDateKey(today);
    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: formatDateKey(date) === todayKey,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: formatDateKey(date) === todayKey,
      });
    }

    // Next month days to fill the grid
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: formatDateKey(date) === todayKey,
      });
    }

    return days;
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const loading = tasksLoading || eventsLoading;

  return (
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
          <div className='home-header'>
            <div className='home-header-title-container'>
              <h1 className='home-header-title'>Calendar</h1>
            </div>
            <div className='calendar-nav'>
              <button className='calendar-nav-btn' onClick={prevMonth} aria-label='Previous month'>&#8249;</button>
              <span className='calendar-nav-title'>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button className='calendar-nav-btn' onClick={nextMonth} aria-label='Next month'>&#8250;</button>
              <button className='calendar-today-btn' onClick={goToday}>Today</button>
            </div>
          </div>

          {loading ? (
            <div className='home-loading-state'>
              <div className='loading-spinner'></div>
              <p>Loading calendar...</p>
            </div>
          ) : (
            <div className='calendar-grid'>
              {DAYS.map((day) => (
                <div key={day} className='calendar-day-header'>{day}</div>
              ))}
              {calendarDays.map((day, index) => {
                const key = formatDateKey(day.date);
                const dayEvents = eventsMap.get(key) ?? [];
                return (
                  <div
                    key={index}
                    className={`calendar-day${!day.isCurrentMonth ? ' other-month' : ''}${day.isToday ? ' today' : ''}`}
                  >
                    <div className='calendar-day-number'>{day.date.getDate()}</div>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={getEventStyle(event)}
                        onMouseEnter={() => setHoveredEvent({ eventId: event.id, dayKey: key })}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', padding: '0 4px' }}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                    {hoveredEvent && hoveredEvent.dayKey === key && (() => {
                      const evt = dayEvents.find((e) => e.id === hoveredEvent.eventId);
                      if (!evt) return null;
                      return (
                        <div className='calendar-event-detail'>
                          <div className='calendar-event-detail-title'>{evt.title}</div>
                          <div className='calendar-event-detail-meta'>
                            {evt.type} {evt.status ? `· ${evt.status}` : ''} {evt.priority ? `· ${evt.priority}` : ''}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
