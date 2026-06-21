import { useState, useCallback } from 'react'
import BubbleChart from './BubbleChart'
import RadarComparison from './RadarComparison'

export default function PositioningDashboard({ data }) {
  const [activeTab, setActiveTab] = useState('bubble')

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          전국 대학 AX 경쟁력 포지셔닝 맵
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          239개 대학 데이터 기반 · 2025년 대학알리미 공시
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {[
          { id: 'bubble', label: '🗺 포지셔닝 맵' },
          { id: 'radar', label: '📡 대학 비교 도구' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id
                ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: activeTab === t.id ? '#fff' : '#a78bfa',
              padding: '10px 24px',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'bubble' && <BubbleChart data={data} />}
      {activeTab === 'radar' && <RadarComparison data={data} />}
    </div>
  )
}
