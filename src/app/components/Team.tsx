'use client';
import { useState } from 'react';
import { agents } from '@/data/mockData';
import { Agent } from '@/types';

const avatarColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const departments = Array.from(new Set(agents.map(a => a.department)));

const statusConfig = {
  online: { label: 'Online', color: '#10B981', dotClass: 'status-online' },
  working: { label: 'Working', color: '#3B82F6', dotClass: 'status-working' },
  offline: { label: 'Offline', color: '#94a3b8', dotClass: 'status-offline' },
};

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const color = avatarColors[parseInt(agent.id) % avatarColors.length];
  const sc = statusConfig[agent.status];

  return (
    <div className="card" style={{ padding: 18, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div className="avatar" style={{ background: color }}>
            {agent.name.charAt(0)}
          </div>
          <span className={`status-dot ${sc.dotClass}`} style={{ position: 'absolute', bottom: 1, right: 1, border: '2px solid white' }}></span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{agent.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{agent.role}</div>
          <span style={{ fontSize: 11, fontWeight: 500, color: sc.color, background: `${sc.color}15`, padding: '2px 8px', borderRadius: 20 }}>
            ● {sc.label}
          </span>
        </div>
      </div>
      {agent.currentTask && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(248,250,252,0.8)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          🔄 {agent.currentTask}
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [filterDept, setFilterDept] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredAgents = agents.filter(a => {
    if (filterDept && a.department !== filterDept) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const online = agents.filter(a => a.status === 'online').length;
  const working = agents.filter(a => a.status === 'working').length;
  const offline = agents.filter(a => a.status === 'offline').length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Online', count: online, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Working', count: working, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Offline', count: offline, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
        ].map(s => (
          <div key={s.label} className="metric-card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Dept:</span>
        {departments.map(dept => (
          <button key={dept} onClick={() => setFilterDept(filterDept === dept ? null : dept)}
            style={{
              padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, transition: 'all 0.2s',
              background: filterDept === dept ? 'var(--accent-blue)' : 'rgba(0,0,0,0.06)',
              color: filterDept === dept ? 'white' : 'var(--text-secondary)'
            }}>{dept}</button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>Status:</span>
        {(['online', 'working', 'offline'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? null : s)}
            style={{
              padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, transition: 'all 0.2s', textTransform: 'capitalize',
              background: filterStatus === s ? statusConfig[s].color : 'rgba(0,0,0,0.06)',
              color: filterStatus === s ? 'white' : 'var(--text-secondary)'
            }}>{s}</button>
        ))}
      </div>

      {/* Department Groups */}
      {departments.filter(dept => !filterDept || dept === filterDept).map(dept => {
        const deptAgents = filteredAgents.filter(a => a.department === dept);
        if (deptAgents.length === 0) return null;
        return (
          <div key={dept} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{dept}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }}></div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{deptAgents.length} agents</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {deptAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} onClick={() => setSelected(agent)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, background: avatarColors[parseInt(selected.id) % avatarColors.length] }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.role}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Department</span>
                <span style={{ fontWeight: 600 }}>{selected.department}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Status</span>
                <span style={{ fontWeight: 600, color: statusConfig[selected.status].color, textTransform: 'capitalize' }}>{selected.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Current Task</span>
                <span style={{ fontWeight: 600 }}>{selected.currentTask || 'Idle'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
