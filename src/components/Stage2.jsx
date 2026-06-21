export default function Stage2() {
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 32, background: 'linear-gradient(180deg, #7c3aed, #ff4d6d)', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>
            한세대학교 분석 보고서
          </h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, marginLeft: 16, fontSize: 14 }}>
          동권역 사립대학 비교분석 및 발전전략 제언 · A4 20페이지 분량
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <a
          href="/report.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #1a237e, #7c3aed)',
            color: 'white', padding: '12px 24px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}
        >
          📄 보고서 새 탭에서 열기
        </a>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, overflow: 'hidden', height: 'calc(100vh - 280px)', minHeight: 600,
      }}>
        <iframe
          src="/report.html"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="한세대학교 분석 보고서"
        />
      </div>
    </div>
  );
}
