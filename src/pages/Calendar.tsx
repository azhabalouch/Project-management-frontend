import { useState, useEffect, useMemo } from 'react';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import { useTaskContext } from '../context/TaskContext';
import { useNoteContext } from '../context/NoteContext';
import { useGet } from '../hooks/useGet';
import { usePost } from '../hooks/usePost';
import { useDelete } from '../hooks/useDelete';
import { CALENDAR_URLS, NOTE_URLS } from '../apis';
import type { CalendarEvent, DateNote } from '../components/type/typesInterface';
import { CloseIcon, Trash2 } from '../components/Icons';


const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const NOTE_COLORS = [
  { label: 'Amber', value: '#D27D2D' },
  { label: 'Red', value: '#E53E3E' },
  { label: 'Green', value: '#38A169' },
  { label: 'Blue', value: '#3182CE' },
  { label: 'Purple', value: '#805AD5' },
  { label: 'Pink', value: '#D53F8C' },
  { label: 'Teal', value: '#319795' },
  { label: 'Gray', value: '#718096' },
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
  const { notes, loading: notesLoading, removeNote } = useNoteContext();
  const { execute: fetchCalendarEvents, loading: eventsLoading } = useGet<CalendarEvent[]>(CALENDAR_URLS.get);
  const { execute: createNote, loading: creatingNote } = usePost(NOTE_URLS.create);
  const { remove: deleteNote } = useDelete(NOTE_URLS.delete);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<{ eventId: string; dayKey: string } | null>(null);

  // Date detail panel state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('#D27D2D');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCalendarEvents();
        if (Array.isArray(data)) {
          setCalendarEvents(data);
        }
      } catch {
        // Calendar events endpoint may not exist yet — gracefully degrade
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

  // Map notes by date for color markers
  const notesMap = useMemo(() => {
    const map = new Map<string, DateNote[]>();
    for (const note of notes) {
      if (!map.has(note.date)) map.set(note.date, []);
      map.get(note.date)!.push(note);
    }
    return map;
  }, [notes]);

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

  const handleDayClick = (dayKey: string) => {
    setSelectedDate(dayKey);
    setNewNoteText('');
    setNewNoteColor('#D27D2D');
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedDate) return;
    const result = await createNote({
      date: selectedDate,
      color: newNoteColor,
      text: newNoteText.trim(),
    });
    if (result) {
      setNewNoteText('');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const result = await deleteNote({ noteId });
    if (result) {
      removeNote(noteId);
    }
  };

  // Selected date details
  const selectedDayEvents = selectedDate ? (eventsMap.get(selectedDate) ?? []) : [];
  const selectedDayNotes = selectedDate ? (notesMap.get(selectedDate) ?? []) : [];

  const loading = tasksLoading || eventsLoading || notesLoading;

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
            <div className='calendar-layout'>
              <div className='calendar-grid'>
                {DAYS.map((day) => (
                  <div key={day} className='calendar-day-header'>{day}</div>
                ))}
                {calendarDays.map((day, index) => {
                  const key = formatDateKey(day.date);
                  const dayEvents = eventsMap.get(key) ?? [];
                  const dayNotes = notesMap.get(key) ?? [];
                  const hasContent = dayEvents.length > 0 || dayNotes.length > 0;
                  const isSelected = selectedDate === key;
                  return (
                    <div
                      key={index}
                      className={`calendar-day${!day.isCurrentMonth ? ' other-month' : ''}${day.isToday ? ' today' : ''}${hasContent ? ' has-content' : ''}${isSelected ? ' selected' : ''}`}
                      onClick={() => handleDayClick(key)}
                    >
                      <div className='calendar-day-number-row'>
                        <span className='calendar-day-number'>{day.date.getDate()}</span>
                        {dayNotes.length > 0 && (
                          <div className='calendar-day-markers'>
                            {dayNotes.slice(0, 3).map((note) => (
                              <span
                                key={note.id}
                                className='calendar-day-marker'
                                style={{ backgroundColor: note.color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={getEventStyle(event)}
                          onMouseEnter={() => setHoveredEvent({ eventId: event.id, dayKey: key })}
                          onMouseLeave={() => setHoveredEvent(null)}
                          onClick={(e) => e.stopPropagation()}
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

              {/* Date Detail Panel */}
              {selectedDate && (
                <div className='calendar-detail-panel'>
                  <div className='calendar-detail-header'>
                    <h3 className='calendar-detail-title'>{selectedDate}</h3>
                    <button className='modal-close-btn' onClick={() => setSelectedDate(null)}>
                      <CloseIcon size={18} />
                    </button>
                  </div>

                  {/* Tasks/Events section */}
                  {selectedDayEvents.length > 0 && (
                    <div className='calendar-detail-section'>
                      <h4 className='calendar-detail-section-title'>Tasks & Events</h4>
                      <ul className='calendar-detail-list'>
                        {selectedDayEvents.map((evt) => (
                          <li key={evt.id} className={`calendar-detail-item type-${evt.type}`}>
                            <span className='calendar-detail-item-title'>{evt.title}</span>
                            <span className='calendar-detail-item-meta'>
                              {evt.type}{evt.status ? ` · ${evt.status}` : ''}{evt.priority ? ` · ${evt.priority}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes section */}
                  <div className='calendar-detail-section'>
                    <h4 className='calendar-detail-section-title'>Notes</h4>
                    {selectedDayNotes.length > 0 ? (
                      <ul className='calendar-detail-list'>
                        {selectedDayNotes.map((note) => (
                          <li key={note.id} className='calendar-detail-note-item'>
                            <span className='calendar-detail-note-dot' style={{ backgroundColor: note.color }} />
                            <span className='calendar-detail-note-text'>{note.text}</span>
                            <button
                              className='note-action-btn note-action-btn--danger'
                              onClick={() => handleDeleteNote(note.id)}
                              title='Delete note'
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='calendar-detail-empty'>No notes for this date</p>
                    )}

                    {/* Add note inline form */}
                    <div className='calendar-detail-add-note'>
                      <div className='note-color-picker note-color-picker--compact'>
                        {NOTE_COLORS.map((opt) => (
                          <button
                            key={opt.value}
                            type='button'
                            className={`note-color-swatch${newNoteColor === opt.value ? ' selected' : ''}`}
                            style={{ backgroundColor: opt.value }}
                            onClick={() => setNewNoteColor(opt.value)}
                            title={opt.label}
                          />
                        ))}
                      </div>
                      <div className='calendar-detail-add-note-row'>
                        <input
                          type='text'
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder='Add a note...'
                          className='todo-input'
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              await handleAddNote();
                            }
                          }}
                          disabled={creatingNote}
                        />
                        <button
                          className='btn-primary'
                          onClick={handleAddNote}
                          disabled={creatingNote || !newNoteText.trim()}
                        >
                          {creatingNote ? '...' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
