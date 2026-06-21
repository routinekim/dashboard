import React, { useState } from 'react'
import Stage1 from './pages/Stage1.jsx'
import Stage3 from './pages/Stage3.jsx'

const NAV_STYLES = `
  @keyframes navGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
    50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
  }
  @keyframes bgShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`

export default function App() {
  const [activeStage, setActiveStage] = useState(1)

  const navItems = [
    { id: 1, label: '1단계', sub: '전국 대학 포지셔닝', icon: '🗺️' },
    { id: 2, label: '2단계', sub: '분석 보고서', icon: '📋' },
    { id: 3, label: '3단계', sub: '한세대 대시보드', icon: '🏫' },
  ]

  const handleStage2 = () => {
    window.open('/report.html', '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0a2e 50%, #0a0a1a 100%)' }}>
      <style>{NAV_STYLES}</style>

      {/* Top Navigation */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(10,10,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.2)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '700', color: '#fff',
            }}>H</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>한세대학교</div>
              <div style={{ fontSize: '10px', color: 'rgba(139,92,246,0.8)', letterSpacing: '1px' }}>경쟁력 분석 플랫폼</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.id === 2 ? handleStage2() : setActiveStage(item.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: activeStage === item.id && item.id !== 2
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))'
                    : 'transparent',
                  borderLeft: activeStage === item.id && item.id !== 2
                    ? '2px solid #8b5cf6'
                    : '2px solid transparent',
                  color: activeStage === item.id && item.id !== 2 ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: '700' }}>{item.label}</span>
                <span style={{ fontSize: '9px', opacity: 0.7 }}>{item.sub}</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
            2025년 대학알리미 기준
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {activeStage === 1 && <Stage1 />}
        {activeStage === 3 && <Stage3 />}
      </main>
    </div>
  )
}
