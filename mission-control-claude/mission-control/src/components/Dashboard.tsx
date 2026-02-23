'use client';
import { taskTrend, departmentLoad, tasks, agents } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const metrics = [
  { label: 'Online Agents', value: '6', sub: '2 offline', color: '#3B82F6', icon: '🤖', bg: 'rgba(59,130,246,0.08)' },
  { label: 'Task Completion', value: '78%', sub: '+12% today', color: '#10B981', icon: '✅', bg: 'rgba(16,185,129,0.08)' },
  { label: 'System Health', value: '99.2%', sub: 'All systems go', color: '#8B5CF6', icon: '💚', bg: 'rgba(139,92,246,0.08)' },
  { label: 'Pending Alerts', value: '3', sub: '1 critical', color: '#F59E0B', icon: '⚠️', bg: 'rgba(245,158,11,0.08)' },
];

const recentActivity = [
  { text: 'Henry completed data analysis report', time: '2m ago', icon: '✅', color: '#10B981' },
  { text: 'Dev Agent deployed to staging environment', time: '15m ago', icon: '🚀', color: '#3B82F6' },
  { text: 'Writer Agent started blog post draft', time: '32m ago', icon: '✍️', color: '#8B5CF6' },
  { text: 'System alert: API rate limit at 85%', time: '1h ago', icon: '⚠️', color: '#F59E0B' },
  { text: 'Maya completed market research notes', time: '2h ago', icon: '📊', color: '#10B981' },
];

export default function Dashboard() {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {metrics.map((m) => (
          <div key={m.label} className="metric-card">
            <div className="flex items-start justify-between mb-3">
              <div style={{ background: m.bg, borderRadius: '10px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {m.icon}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>LIVE</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Line Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header">
            <span className="card-title">Task Trend (7 days)</span>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 3, background: '#3B82F6', borderRadius: 2, marginRight: 4 }}></span>Completed</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 3, background: '#10B981', borderRadius: 2, marginRight: 4 }}></span>Created</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={taskTrend}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="created" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header">
            <span className="card-title">Dept. Load</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={departmentLoad} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {departmentLoad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} formatter={(value) => [`${value}%`, '']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
          <div style={{ fontSize: 12, color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 500 }}>View all →</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentActivity.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(248,250,252,0.8)', transition: 'background 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,250,252,0.8)')}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{a.text}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
