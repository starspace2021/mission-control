'use client';
import { useState } from 'react';
import { pipelineSteps } from '@/data/mockData';

const pipelines = [
  {
    id: 'content',
    name: 'Content Pipeline',
    description: 'Video content creation workflow',
    steps: [
      { id: '1', title: 'Video Idea', icon: '💡', status: 'completed' as const, progress: 100 },
      { id: '2', title: 'Draft Script', icon: '✍️', status: 'completed' as const, progress: 100 },
      { id: '3', title: 'Thumbnail Design', icon: '🎨', status: 'active' as const, progress: 70 },
      { id: '4', title: 'Ready to Film', icon: '🎬', status: 'pending' as const, progress: 0 },
      { id: '5', title: 'Video Live!', icon: '🚀', status: 'pending' as const, progress: 0 },
    ]
  },
  {
    id: 'data',
    name: 'Data Pipeline',
    description: 'Analytics & reporting automation',
    steps: pipelineSteps.map(s => ({ ...s, icon: ['📥', '🔄', '🧪', '📄', '📤'][parseInt(s.id) - 1] }))
  },
  {
    id: 'deploy',
    name: 'Deploy Pipeline',
    description: 'Code review to production',
    steps: [
      { id: '1', title: 'Code Review', icon: '👀', status: 'completed' as const, progress: 100 },
      { id: '2', title: 'Tests', icon: '🧪', status: 'completed' as const, progress: 100 },
      { id: '3', title: 'Build', icon: '🏗️', status: 'completed' as const, progress: 100 },
      { id: '4', title: 'Staging', icon: '🔬', status: 'active' as const, progress: 45 },
      { id: '5', title: 'Production', icon: '✅', status: 'pending' as const, progress: 0 },
    ]
  },
];

export default function Pipeline() {
  const [selectedPipeline, setSelectedPipeline] = useState(pipelines[0]);

  return (
    <div>
      {/* Pipeline selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {pipelines.map(p => (
          <button key={p.id} onClick={() => setSelectedPipeline(p)}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
              background: selectedPipeline.id === p.id ? 'var(--accent-blue)' : 'rgba(0,0,0,0.06)',
              color: selectedPipeline.id === p.id ? 'white' : 'var(--text-secondary)',
              boxShadow: selectedPipeline.id === p.id ? '0 2px 8px rgba(59,130,246,0.3)' : undefined
            }}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedPipeline.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{selectedPipeline.description}</p>
        </div>

        {/* Pipeline visualization */}
        <div style={{ position: 'relative', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            {selectedPipeline.steps.map((step, idx) => {
              const isLast = idx === selectedPipeline.steps.length - 1;
              return (
                <div key={step.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {/* Connector line */}
                  {!isLast && (
                    <div style={{
                      position: 'absolute', top: 24, left: '50%', width: '100%', height: 3,
                      background: step.status === 'completed' ? 'var(--accent-green)' : step.status === 'active' ? 'linear-gradient(to right, var(--accent-blue), rgba(59,130,246,0.2))' : 'rgba(0,0,0,0.08)',
                      zIndex: 0
                    }}></div>
                  )}

                  {/* Node */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, position: 'relative', zIndex: 1, transition: 'all 0.3s',
                    background: step.status === 'completed' ? 'var(--accent-green)' : step.status === 'active' ? 'var(--accent-blue)' : '#f1f5f9',
                    boxShadow: step.status === 'completed' ? '0 0 0 4px rgba(16,185,129,0.15)' : step.status === 'active' ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                    border: step.status === 'pending' ? '2.5px dashed #cbd5e1' : 'none',
                  }}>
                    {step.status === 'completed' ? '✓' : step.icon}
                  </div>

                  {/* Label */}
                  <div style={{ textAlign: 'center', marginTop: 12, padding: '0 8px' }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, marginBottom: 4,
                      color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>{step.title}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: step.status === 'completed' ? 'rgba(16,185,129,0.1)' : step.status === 'active' ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.05)',
                      color: step.status === 'completed' ? '#059669' : step.status === 'active' ? '#2563EB' : 'var(--text-muted)'
                    }}>
                      {step.status === 'completed' ? 'Done' : step.status === 'active' ? `${step.progress}%` : 'Pending'}
                    </span>
                  </div>

                  {/* Progress bar for active */}
                  {step.status === 'active' && (
                    <div style={{ width: '60%', height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${step.progress}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2, transition: 'width 1s ease' }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status summary */}
        <div style={{ display: 'flex', gap: 20, marginTop: 28, padding: '16px 20px', background: 'rgba(248,250,252,0.8)', borderRadius: 12 }}>
          {[
            { label: 'Completed', count: selectedPipeline.steps.filter(s => s.status === 'completed').length, color: '#10B981' },
            { label: 'In Progress', count: selectedPipeline.steps.filter(s => s.status === 'active').length, color: '#3B82F6' },
            { label: 'Pending', count: selectedPipeline.steps.filter(s => s.status === 'pending').length, color: '#94a3b8' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: stat.color }}></div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.count}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Overall: {Math.round(selectedPipeline.steps.reduce((sum, s) => sum + s.progress, 0) / selectedPipeline.steps.length)}%
          </div>
        </div>
      </div>

      {/* Step details cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 20 }}>
        {selectedPipeline.steps.map(step => (
          <div key={step.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{step.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{step.title}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${step.progress}%`, height: '100%', borderRadius: 2,
                background: step.status === 'completed' ? 'var(--accent-green)' : step.status === 'active' ? 'var(--accent-blue)' : 'transparent',
                transition: 'width 1s ease'
              }}></div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{step.progress}% complete</div>
          </div>
        ))}
      </div>
    </div>
  );
}
