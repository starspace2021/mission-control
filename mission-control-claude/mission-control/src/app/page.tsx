'use client';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Tasks from '@/components/Tasks';
import CalendarView from '@/components/Calendar';
import Memory from '@/components/Memory';
import Team from '@/components/Team';
import Pipeline from '@/components/Pipeline';

const tabs = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'tasks', label: '📋 Tasks' },
  { id: 'calendar', label: '📅 Calendar' },
  { id: 'memory', label: '🧠 Memory' },
  { id: 'team', label: '👥 Team' },
  { id: 'pipeline', label: '🔄 Pipeline' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate 30s refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <Tasks />;
      case 'calendar': return <CalendarView />;
      case 'memory': return <Memory />;
      case 'team': return <Team />;
      case 'pipeline': return <Pipeline />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      {/* Top nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, padding: '16px 24px',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.8)',
        position: 'sticky', top: 16, zIndex: 40
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white', fontWeight: 700
          }}>M</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Mission Control</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Operations Center</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 14, padding: '4px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <span className="status-dot status-online"></span>
          <span>Live · Refresh {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}
