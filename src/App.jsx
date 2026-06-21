import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Stage1 from './components/Stage1';
import Stage2 from './components/Stage2';
import Stage3 from './components/Stage3';

const QR_URL = 'https://dashboard-two-kappa-86.vercel.app/';

function QRModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #0f0c29, #1a1a3e)',
          border: '1px solid rgba(124,58,237,0.5)',
          borderRadius: 24, padding: '40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          boxShadow: '0 0 80px rgba(124,58,237,0.4)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>
          📱 QR 코드로 공유하기
        </h3>
        <div style={{
          background: 'white', padding: 16, borderRadius: 16,
          boxShadow: '0 0 30px rgba(124,58,237,0.3)',
        }}>
          <QRCodeSVG value={QR_URL} size={200} level="H" includeMargin={false} />
        </div>
        <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', maxWidth: 220 }}>
          {QR_URL}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#94a3b8', borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontSize: 13,
          }}
        >
          닫기 (ESC)
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState(1);
  const [showQR, setShowQR] = useState(false);

  const navStyle = (active) => ({
    padding: '10px 18px', borderRadius: 8, cursor: 'pointer',
    border: 'none', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg, #7c3aed, #9b59b6)' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#64748b',
    boxShadow: active ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #0a0a1e 0%, #0f0c29 40%, #1a0533 100%)',
      color: '#e2e8f0',
    }}>
      <header style={{
        width: '100%',
        background: 'rgba(10,10,30,0.85)',
        borderBottom: '1px solid rgba(124,58,237,0.2)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64, gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #ff4d6d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🎓</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#e2e8f0' }}>한세대학교 경쟁력 분석</div>
              <div style={{ fontSize: 10, color: '#475569' }}>대학알리미 2025 · 전국 239개 대학</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <nav style={{ display: 'flex', gap: 8 }}>
              <button style={navStyle(stage === 1)} onClick={() => setStage(1)}>1단계: 전국 포지셔닝</button>
              <button style={navStyle(stage === 2)} onClick={() => setStage(2)}>2단계: 분석 보고서</button>
              <button style={navStyle(stage === 3)} onClick={() => setStage(3)}>3단계: 한세대 대시보드</button>
            </nav>
            <button
              onClick={() => setShowQR(true)}
              style={{
                background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                color: '#a78bfa', borderRadius: 8, padding: '8px 14px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >📱 QR</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 48px' }}>
        {stage === 1 && <Stage1 />}
        {stage === 2 && <Stage2 />}
        {stage === 3 && <Stage3 />}
      </main>

      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 3px; }
        select option { background: #1a1a3e; color: #e2e8f0; }
      `}</style>
    </div>
  );
}
