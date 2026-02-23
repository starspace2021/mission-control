'use client';
import { useState } from 'react';
import { calendarEvents } from '@/data/mockData';
import { CalendarEvent } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  green: { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  orange: { bg: 'rgba(245,158,11,0.12)', text: '#D97706' },
  red: { bg: 'rgba(239,68,68,0.12)', text: '#DC2626' },
  purple: { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 3, 1)); // April 2024
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          {MONTHS[month]} {year}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>‹</button>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', padding: '8px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} style={{ minHeight: 80, background: 'rgba(248,250,252,0.5)', padding: 8 }}></div>;
          const events = getEventsForDay(day);
          const isSelected = selectedDate === day;
          return (
            <div
              key={day}
              className="calendar-cell"
              style={{ background: isSelected ? 'rgba(59,130,246,0.08)' : isToday(day) ? 'rgba(59,130,246,0.04)' : undefined }}
              onClick={() => setSelectedDate(isSelected ? null : day)}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: isToday(day) ? 700 : 500,
                background: isToday(day) ? 'var(--accent-blue)' : undefined,
                color: isToday(day) ? 'white' : 'var(--text-primary)',
                marginBottom: 4
              }}>
                {day}
              </div>
              {events.slice(0, 2).map(event => {
                const c = colorMap[event.color] || colorMap.blue;
                return (
                  <div key={event.id} style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                    background: c.bg, color: c.text, marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>{event.title}</div>
                );
              })}
              {events.length > 2 && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{events.length - 2}</div>}
            </div>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <div style={{ marginTop: 20, padding: 16, background: 'rgba(59,130,246,0.04)', borderRadius: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            {MONTHS[month]} {selectedDate} — {selectedEvents.length === 0 ? 'No events' : `${selectedEvents.length} event(s)`}
          </div>
          {selectedEvents.map(event => {
            const c = colorMap[event.color] || colorMap.blue;
            return (
              <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.text, flexShrink: 0 }}></div>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{event.title}</span>
                <span className={`tag`} style={{ background: c.bg, color: c.text, fontSize: 10 }}>{event.department}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
