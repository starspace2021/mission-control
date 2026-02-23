'use client';
import { useState } from 'react';
import { memories } from '@/data/mockData';
import { Memory } from '@/types';

const typeConfig: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  long_term: { icon: '🧠', label: 'Long Term', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  daily: { icon: '📅', label: 'Daily', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  project: { icon: '📁', label: 'Project', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  system: { icon: '⚙️', label: 'System', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
};

const allTags = Array.from(new Set(memories.flatMap(m => m.tags)));

export default function MemoryArchive() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Memory | null>(null);

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filtered = memories.filter(m => {
    if (activeType && m.type !== activeType) return false;
    if (activeTags.length > 0 && !activeTags.some(t => m.tags.includes(t))) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12,
              border: '1.5px solid rgba(0,0,0,0.08)', fontSize: 14, outline: 'none',
              background: 'rgba(248,250,252,0.8)', color: 'var(--text-primary)',
              transition: 'border 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
          />
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {Object.entries(typeConfig).map(([type, cfg]) => (
            <button key={type} onClick={() => setActiveType(activeType === type ? null : type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.2s',
                background: activeType === type ? cfg.bg : 'rgba(248,250,252,0.8)',
                color: activeType === type ? cfg.color : 'var(--text-secondary)',
                boxShadow: activeType === type ? `0 0 0 1.5px ${cfg.color}40` : undefined
              }}>
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>

        {/* Tag cloud */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              style={{
                padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 500, transition: 'all 0.2s',
                background: activeTags.includes(tag) ? 'var(--accent-blue)' : 'rgba(0,0,0,0.05)',
                color: activeTags.includes(tag) ? 'white' : 'var(--text-secondary)'
              }}>
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Memory cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
            No memories found 🔍
          </div>
        )}
        {filtered.map(memory => {
          const cfg = typeConfig[memory.type];
          return (
            <div key={memory.id} className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => setSelected(memory)}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{memory.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{memory.updatedAt}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {memory.content}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{cfg.label}</span>
                    {memory.tags.map(tag => (
                      <span key={tag} style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: typeConfig[selected.type].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {typeConfig[selected.type].icon}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selected.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.updatedAt}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 16 }}>{selected.content}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.tags.map(tag => (
                <span key={tag} style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
