import { useState, useEffect } from 'react'
import PositioningDashboard from './components/stage1/PositioningDashboard'
import ReportPage from './components/stage2/ReportPage'
import HanseiDashboard from './components/stage3/HanseiDashboard'

const NAV = [
  { id: 'stage1', label: '① 전국 포지셔닝 맵' },
  { id: 'stage2', label: '② 한세대 분석 보고서' },
  { id: 'stage3', label: '③ 한세대 전용 대시보드' },
]

export default function App() {
  const [page, setPage] = useState('stage1')
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/universities.json')
      .then(r => r.json())
      .then(setData)
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{
        background: 'rgba(10,14,39,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.3)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          color: '#a78bfa',
          fontWeight: 700,
          fontSize: 16,
          marginRight: 24,
          whiteSpace: 'nowrap',
          padding: '16px 0',
        }}>
          대학 AX 경쟁력 분석
        </div>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            style={{
              background: page === n.id
                ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                : 'transparent',
              border: page === n.id
                ? 'none'
                : '1px solid rgba(124,58,237,0.3)',
              color: page === n.id ? '#fff' : '#a78bfa',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: page === n.id ? 600 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <main>
        {data.length === 0 ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh', color:'#7c3aed', fontSize:18 }}>
            데이터 로딩 중...
          </div>
        ) : (
          <>
            {page === 'stage1' && <PositioningDashboard data={data} />}
            {page === 'stage2' && <ReportPage data={data} />}
            {page === 'stage3' && <HanseiDashboard data={data} />}
          </>
        )}
      </main>
    </div>
  )
}
