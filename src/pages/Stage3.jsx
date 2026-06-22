import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { QRCodeSVG } from 'qrcode.react'
import hanseiData from '@data/hansei_report_data.json'

// ── 데이터 ────────────────────────────────────────────────────────────────
const H = hanseiData.hansei
const COMPS = hanseiData.competitors

const COMP_NAMES = ['한세대', ...COMPS.map(c => c.name)]
const ALL = [
  { name: '한세대', ...H },
  ...COMPS.map(c => ({ ...c }))
]

// 지표 정의
const METRICS_STRENGTH = [
  {
    key: 'employmentRate',
    label: '취업률',
    unit: '%',
    value: H.employmentRate,
    desc: '전국 & 비교군 최고 수준',
    rank: 1,
    color: '#00d4ff',
    detail: {
      summary: '취업률 71%로 비교군 6개교 중 최고 수준입니다. 경기 지역 사립대 평균(약 62%)을 크게 초과 달성했으며, 산학협력·맞춤형 취업지원 프로그램의 성과로 분석됩니다.',
      section: 'employment'
    }
  },
  {
    key: 'competitionRate',
    label: '신입생 경쟁률',
    unit: ':1',
    value: H.competitionRate,
    desc: '비교군 공동 1위',
    rank: 1,
    color: '#00d4ff',
    detail: {
      summary: '신입생 경쟁률 11.7:1로 비교군 중 최고 수준(안양대 동률). 높은 브랜드 인지도와 특성화 학과의 경쟁력을 반영합니다.',
      section: 'competition'
    }
  },
  {
    key: 'scholarshipPerStudent',
    label: '1인당 장학금',
    unit: '원',
    value: H.scholarshipPerStudent,
    desc: '비교군 1위',
    rank: 1,
    color: '#00d4ff',
    detail: {
      summary: '학생 1인당 연간 장학금 431만원으로 비교군 1위. 학업 지속을 위한 경제적 지원이 가장 탄탄하며, 재학생 유지율에 긍정적 영향을 미칩니다.',
      section: 'scholarship'
    }
  },
  {
    key: 'fillRate',
    label: '신입생 충원율',
    unit: '%',
    value: H.fillRate,
    desc: '99.8% 사실상 완전 충원',
    rank: 2,
    color: '#00d4ff',
    detail: {
      summary: '충원율 99.8%로 학령인구 감소 위기 속에서도 사실상 완전 충원을 달성했습니다. 2026학년도 수시 등록률이 95%까지 상승하는 등 상승 추세가 지속되고 있습니다.',
      section: 'fill'
    }
  },
]

const METRICS_IMPROVE = [
  {
    key: 'fullTimeLectureRatio',
    label: '전임교원 강의비율',
    unit: '%',
    value: H.fullTimeLectureRatio,
    desc: '비교군 최저 — 개선 필요',
    rank: 6,
    color: '#ff4444',
    detail: {
      summary: '전임교원 강의비율 48.3%는 비교군 6개교 중 최저 수준입니다(비교군 평균 65%). 겸임·시간강사 의존도가 높으며, 교육부 성과 지표에서 감점 요인이 될 수 있습니다.',
      section: 'lecture'
    }
  },
  {
    key: 'facultyRateByQuota',
    label: '교원확보율(정원)',
    unit: '%',
    value: H.facultyRateByQuota,
    desc: '법정 기준 미달',
    rank: 5,
    color: '#ff8800',
    detail: {
      summary: '교원확보율(정원기준) 62.89%로 비교군 평균(66%)에 못 미칩니다. 법정 기준 충족을 위한 중장기 교원 충원 계획 수립이 필요합니다.',
      section: 'faculty'
    }
  },
  {
    key: 'dormitoryRate',
    label: '기숙사 수용률',
    unit: '%',
    value: H.dormitoryRate,
    desc: '수도권 대비 시설 부족',
    rank: 4,
    color: '#ff8800',
    detail: {
      summary: '기숙사 수용률 12.2%로 재학생의 약 1/8만 수용 가능합니다. 평택대(30.1%)·한신대(14.2%)에 비해 낮으며, 학생 주거 안정성 확보를 위한 시설 확충이 필요합니다.',
      section: 'dormitory'
    }
  },
  {
    key: 'studentsPerProf',
    label: '교원1인당 학생수',
    unit: '명',
    value: H.studentsPerProf,
    desc: '교원 부담 개선 필요',
    rank: 5,
    color: '#ff8800',
    detail: {
      summary: '교원 1인당 학생수 35.59명으로 비교군 평균(34.2명)보다 높습니다. 교원 확보율 개선과 연동하여 학생 1인당 교육 밀도를 높이는 전략이 필요합니다.',
      section: 'studentsperprof'
    }
  },
]

// ── 애니메이션 키프레임 ───────────────────────────────────────────────────
const STYLES = `
  @keyframes floatParticle {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.6; }
    100% { transform: translateY(-20px) scale(1); opacity: 0; }
  }
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(40px,-30px) scale(1.05); }
    66% { transform: translate(-30px,20px) scale(0.95); }
  }
  @keyframes gradientShift {
    0%,100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes heroTextGlow {
    0%,100% { text-shadow: 0 0 20px #00d4ff88, 0 0 40px #00d4ff44; }
    50% { text-shadow: 0 0 40px #00d4ffcc, 0 0 80px #00d4ff66, 0 0 120px #00d4ff33; }
  }
  @keyframes scanDown {
    0% { transform: translateY(-100%); opacity: 0.15; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(36px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-200%); }
    100% { transform: translateX(300%); }
  }
  @keyframes badgePulse {
    0%,100% { box-shadow: 0 0 0px #00d4ff; }
    50% { box-shadow: 0 0 8px #00d4ff, 0 0 16px #00d4ff44; }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.85) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes barGrow {
    from { width: 0 !important; }
  }
  @keyframes livePulse {
    0%,100% { opacity: 1; box-shadow: 0 0 6px #39ff14; }
    50% { opacity: 0.3; box-shadow: none; }
  }
  @keyframes panelGlow {
    0%,100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes countUp { from { opacity: 0; } to { opacity: 1; } }
  .metric-card {
    background: rgba(0,10,30,0.75);
    border-radius: 14px;
    padding: 22px 20px;
    position: relative; overflow: hidden;
    cursor: pointer;
    transition: transform 0.25s, box-shadow 0.25s;
    border: 1px solid rgba(0,212,255,0.12);
  }
  .metric-card:hover {
    transform: translateY(-8px) scale(1.03);
  }
  .metric-card-improve {
    border-color: rgba(255,68,68,0.15);
  }
  .progress-bar-inner {
    animation: barGrow 2s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .modal-overlay {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(0,5,15,0.88); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal-box {
    background: rgba(6,14,31,0.98);
    border: 1px solid rgba(0,212,255,0.25);
    border-radius: 16px;
    padding: 32px;
    max-width: 640px; width: 100%;
    max-height: 85vh; overflow-y: auto;
    animation: popIn 0.35s ease;
    box-shadow: 0 8px 48px rgba(0,212,255,0.15);
  }
  .chat-input {
    width: 100%; background: rgba(0,20,50,0.8);
    border: 1px solid rgba(0,212,255,0.3); border-radius: 8px;
    color: #e0f0ff; padding: 12px 16px; font-size: 14px;
    font-family: 'Noto Sans KR', sans-serif;
    outline: none; resize: none;
    transition: border-color 0.2s;
  }
  .chat-input:focus { border-color: rgba(0,212,255,0.7); }
  .chat-send-btn {
    background: linear-gradient(135deg, #00d4ff, #0088cc);
    color: #060E1F; border: none; border-radius: 8px;
    padding: 10px 22px; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: opacity 0.2s, transform 0.2s;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .chat-send-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .md-response h1,h2,h3 { color: #00d4ff; margin: 8px 0 4px; }
  .md-response h1 { font-size: 18px; }
  .md-response h2 { font-size: 16px; }
  .md-response h3 { font-size: 14px; }
  .md-response strong { color: #ffe066; }
  .md-response p { margin: 4px 0; line-height: 1.7; }
  .md-response ul,ol { padding-left: 20px; }
  .md-response li { margin: 2px 0; }
  .md-response table { border-collapse: collapse; width: 100%; font-size: 12px; }
  .md-response th { background: rgba(0,212,255,0.1); padding: 6px 10px; border: 1px solid rgba(0,212,255,0.2); color: #00d4ff; }
  .md-response td { padding: 5px 10px; border: 1px solid rgba(0,212,255,0.1); color: #c0d8f0; }
`

// ── 파티클 배경 ───────────────────────────────────────────────────────────
const Particles = React.memo(() => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: (i * 5.2 + 2) % 100,
      delay: (i * 0.47) % 8,
      dur: 6 + (i * 0.8) % 6,
      size: 2 + (i * 0.7) % 3,
      color: i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#4da6ff' : '#0066ff',
    })), [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, bottom: '-10px',
          width: p.size, height: p.size,
          borderRadius: '50%', background: p.color,
          animation: `floatParticle ${p.dur}s ${p.delay}s infinite linear`
        }} />
      ))}
    </div>
  )
})

// ── 배경 오브 ─────────────────────────────────────────────────────────────
const Orbs = React.memo(() => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { top: '10%', left: '5%', size: 400, color: '#0044cc', dur: '14s' },
      { top: '60%', right: '8%', size: 500, color: '#0088ff', dur: '18s' },
      { top: '30%', left: '60%', size: 350, color: '#003388', dur: '12s' },
      { top: '75%', left: '20%', size: 300, color: '#00aaff', dur: '20s' },
    ].map((o, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: o.top, left: o.left, right: o.right,
        width: o.size, height: o.size,
        borderRadius: '50%',
        background: o.color,
        filter: 'blur(100px)',
        opacity: 0.07,
        animation: `orbFloat ${o.dur} ease-in-out infinite`,
        animationDelay: `${i * -3}s`
      }} />
    ))}
  </div>
))

// ── 미니 라인 차트 ────────────────────────────────────────────────────────
function MiniLineChart({ metricKey, color }) {
  const vals = ALL.map(u => u[metricKey] ?? 0)
  const hanseiIdx = 0
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const W = 120, H2 = 40, pad = 4

  if (max === min) return null

  const toY = v => H2 - pad - ((v - min) / (max - min)) * (H2 - pad * 2)
  const pts = vals.map((v, i) => `${pad + i * ((W - pad * 2) / (vals.length - 1))},${toY(v)}`).join(' ')

  return (
    <svg width={W} height={H2} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id={`glow-${metricKey}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
        filter={`url(#glow-${metricKey})`} opacity={0.7} />
      {vals.map((v, i) => {
        const x = pad + i * ((W - pad * 2) / (vals.length - 1))
        const y = toY(v)
        return (
          <circle key={i} cx={x} cy={y} r={i === hanseiIdx ? 4 : 2}
            fill={i === hanseiIdx ? color : 'rgba(0,212,255,0.3)'}
            stroke={i === hanseiIdx ? '#fff' : 'none'} strokeWidth={1.5}
            filter={i === hanseiIdx ? `url(#glow-${metricKey})` : undefined}
          />
        )
      })}
    </svg>
  )
}

// ── 미니 바 차트 ──────────────────────────────────────────────────────────
function MiniBarChart({ metricKey, color }) {
  const sorted = [...ALL].sort((a, b) => (b[metricKey] ?? 0) - (a[metricKey] ?? 0))
  const max = sorted[0][metricKey] ?? 1
  const W = 120, barH = 7, gap = 3
  const H2 = sorted.length * (barH + gap)

  return (
    <svg width={W} height={H2} style={{ display: 'block' }}>
      {sorted.map((u, i) => {
        const w = ((u[metricKey] ?? 0) / max) * (W - 30)
        const isHansei = u.name === '한세대' || u.name === '한세대학교'
        const barColor = isHansei ? color : 'rgba(0,212,255,0.2)'
        return (
          <g key={u.name} transform={`translate(0,${i * (barH + gap)})`}>
            <rect x={0} y={0} width={w} height={barH} rx={2}
              fill={barColor}
              filter={isHansei ? 'drop-shadow(0 0 3px ' + color + ')' : undefined}
            />
            <text x={w + 3} y={barH - 1} fontSize={7} fill="rgba(160,196,232,0.5)">
              {u.name.replace('대학교', '')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── 카운트업 숫자 ─────────────────────────────────────────────────────────
function CountUp({ value, unit, duration = 1600, color }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const start = performance.now()
    const target = parseFloat(value) || 0

    const frame = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * target)
      if (progress < 1) ref.current = requestAnimationFrame(frame)
    }
    ref.current = requestAnimationFrame(frame)
    return () => ref.current && cancelAnimationFrame(ref.current)
  }, [value, duration])

  let formatted
  if (unit === '원') {
    formatted = (display / 10000).toFixed(0) + '만원'
  } else if (unit === '명') {
    formatted = Math.round(display) + '명'
  } else {
    formatted = display.toFixed(1) + unit
  }

  return (
    <span style={{
      color, fontSize: 28, fontWeight: 900,
      textShadow: `0 0 16px ${color}88, 0 0 32px ${color}44`,
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      {formatted}
    </span>
  )
}

// ── 진행 바 ───────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color, avg }) {
  const [triggered, setTriggered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setTriggered(true), 100)
    return () => clearTimeout(t)
  }, [])

  const pct = Math.min((value / max) * 100, 100)
  const avgPct = avg ? Math.min((avg / max) * 100, 100) : null

  return (
    <div style={{ position: 'relative', height: 8, background: 'rgba(0,100,200,0.15)', borderRadius: 4 }}>
      <div className="progress-bar-inner" style={{
        height: '100%', borderRadius: 4,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        width: triggered ? `${pct}%` : '0%',
        transition: 'width 2s cubic-bezier(0.16,1,0.3,1)'
      }} />
      {avgPct !== null && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${avgPct}%`, width: 2,
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 1,
          title: '비교군 평균'
        }} />
      )}
    </div>
  )
}

// ── 지표 카드 ─────────────────────────────────────────────────────────────
function MetricCard({ metric, idx, onOpen, isStrength }) {
  const compVals = COMPS.map(c => c[metric.key] ?? 0)
  const avg = compVals.reduce((a, b) => a + b, 0) / compVals.length
  const maxVal = Math.max(metric.value, ...compVals) * 1.1 || 100
  const rankLabel = metric.rank === 1 ? '1위' : metric.rank === 6 ? '최하위' : `${metric.rank}위`
  const badgeColor = metric.rank === 1 ? '#00d4ff' : metric.rank >= 5 ? '#f87171' : '#fb923c'

  return (
    <div
      className={`metric-card${isStrength ? '' : ' metric-card-improve'}`}
      style={{
        animation: `fadeInUp 0.5s ${idx * 0.085}s both`,
        borderTop: `1px solid ${metric.color}33`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 0 ${metric.color}22`
      }}
      onClick={() => onOpen(metric)}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 12px 36px ${metric.color}22, 0 0 0 1px ${metric.color}44`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 0 ${metric.color}22`
      }}
    >
      {/* 쉬머 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
        borderRadius: 14
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '40%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          animation: 'shimmer 3s infinite'
        }} />
      </div>

      {/* 패널 상단 라인 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)`,
        animation: 'panelGlow 3s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ color: 'rgba(160,196,232,0.7)', fontSize: 12, fontWeight: 500 }}>
            {metric.label}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, color: badgeColor,
            background: `${badgeColor}22`, border: `1px solid ${badgeColor}44`,
            animation: metric.rank === 1 ? 'badgePulse 2s ease infinite' : undefined
          }}>
            {rankLabel}
          </span>
        </div>

        <div style={{ marginBottom: 10 }}>
          <CountUp value={metric.value} unit={metric.unit} color={metric.color} />
        </div>

        <p style={{ color: 'rgba(160,196,232,0.55)', fontSize: 11, marginBottom: 12 }}>
          {metric.desc}
        </p>

        <ProgressBar value={metric.value} max={maxVal} color={metric.color} avg={avg} />

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {isStrength
            ? <MiniLineChart metricKey={metric.key} color={metric.color} />
            : <MiniBarChart metricKey={metric.key} color={metric.color} />
          }
          <span style={{ fontSize: 11, color: 'rgba(160,196,232,0.4)', textAlign: 'right' }}>
            클릭하여<br />상세 분석 →
          </span>
        </div>
      </div>
    </div>
  )
}

// ── 지표 상세 모달 ────────────────────────────────────────────────────────
function MetricModal({ metric, onClose }) {
  const compVals = COMPS.map(c => ({ name: c.name, val: c[metric.key] ?? 0 }))
  const allVals = [{ name: '한세대', val: metric.value, isHansei: true }, ...compVals]
    .sort((a, b) => b.val - a.val)
  const maxVal = allVals[0].val || 1
  const [barsReady, setBarsReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const fmt = (v) => {
    if (metric.unit === '원') return (v / 10000).toFixed(0) + '만원'
    return v.toFixed(1) + metric.unit
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{
          height: 1, marginBottom: 24,
          background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)`
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: metric.color, fontSize: 20, fontWeight: 800 }}>
            {metric.label} 상세 분석
          </h2>
          <button onClick={onClose} style={{
            color: 'rgba(160,196,232,0.5)', fontSize: 20, lineHeight: 1,
            background: 'none', border: 'none', cursor: 'pointer', padding: 4
          }}>✕</button>
        </div>

        <div style={{
          background: `${metric.color}11`, borderRadius: 10,
          border: `1px solid ${metric.color}22`, padding: '16px 20px', marginBottom: 20
        }}>
          <div style={{ color: 'rgba(160,196,232,0.7)', fontSize: 12, marginBottom: 4 }}>한세대학교</div>
          <div style={{ color: metric.color, fontSize: 32, fontWeight: 900 }}>
            {fmt(metric.value)}
          </div>
        </div>

        <p style={{ color: '#c0d8f0', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          {metric.detail.summary}
        </p>

        <h3 style={{ color: 'rgba(160,196,232,0.7)', fontSize: 12, letterSpacing: 1, marginBottom: 14 }}>
          비교군 순위
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allVals.map((u, i) => (
            <div key={u.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{
                  fontSize: 13, fontWeight: u.isHansei ? 700 : 400,
                  color: u.isHansei ? metric.color : '#a0c4e8'
                }}>
                  {u.isHansei ? '⭐ ' : ''}{u.name}
                </span>
                <span style={{ fontSize: 13, color: u.isHansei ? metric.color : '#a0c4e8' }}>
                  {fmt(u.val)}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(0,100,200,0.15)', borderRadius: 3 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: u.isHansei
                    ? `linear-gradient(90deg, ${metric.color}88, ${metric.color})`
                    : 'rgba(0,212,255,0.25)',
                  boxShadow: u.isHansei ? `0 0 6px ${metric.color}66` : undefined,
                  width: barsReady ? `${(u.val / maxVal) * 100}%` : '0%',
                  transition: `width 1.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => window.open('/hansei_report.html', '_blank')}
            style={{
              background: 'none', border: `1px solid ${metric.color}44`,
              color: metric.color, borderRadius: 8, padding: '8px 20px',
              fontSize: 13, cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${metric.color}11`}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            📄 전체 보고서에서 자세히 보기
          </button>
        </div>
      </div>
    </div>
  )
}

// ── QR 모달 ───────────────────────────────────────────────────────────────
function QRModal({ onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 320, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#00d4ff', marginBottom: 20 }}>대시보드 공유</h3>
        <div style={{
          display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12
        }}>
          <QRCodeSVG value="https://dashboard-two-kappa-86.vercel.app/" size={180} />
        </div>
        <p style={{ color: 'rgba(160,196,232,0.6)', fontSize: 12, marginTop: 16 }}>
          QR 코드로 스캔하거나<br />
          <a href="https://dashboard-two-kappa-86.vercel.app/" target="_blank" rel="noreferrer"
            style={{ color: '#00d4ff' }}>dashboard-two-kappa-86.vercel.app</a>
        </p>
        <button onClick={onClose} style={{
          marginTop: 16, color: 'rgba(160,196,232,0.5)', background: 'none',
          border: 'none', cursor: 'pointer', fontSize: 13
        }}>닫기 (ESC)</button>
      </div>
    </div>
  )
}

// ── AI 챗봇 ───────────────────────────────────────────────────────────────
const CONTEXT = `
당신은 한세대학교 데이터 분석 전문가입니다.
아래 데이터를 기반으로 질문에 답해주세요. 한국어로 답변하세요.

[한세대학교 주요 지표]
- 취업률: ${H.employmentRate}%
- 경쟁률: ${H.competitionRate}:1
- 충원율: ${H.fillRate}%
- 1인당 장학금: ${(H.scholarshipPerStudent/10000).toFixed(0)}만원
- 1인당 교육비: ${H.educationCostPerStudent}만원
- 교원확보율(정원): ${H.facultyRateByQuota}%
- 전임교원 강의비율: ${H.fullTimeLectureRatio}%
- 기숙사 수용률: ${H.dormitoryRate}%
- 교원1인당 학생수: ${H.studentsPerProf}명
- 재학생 수: ${H.enrolled}명

[비교군 대학 (경기지역 동규모 사립대)]
${COMPS.map(c => `${c.name}: 취업률 ${c.employmentRate}%, 경쟁률 ${c.competitionRate}, 충원율 ${c.fillRate}%, 장학금 ${(c.scholarshipPerStudent/10000).toFixed(0)}만원, 교육비 ${c.educationCostPerStudent}만원, 교원확보율 ${c.facultyRateByQuota}%, 강의비율 ${c.fullTimeLectureRatio}%, 기숙사 ${c.dormitoryRate}%`).join('\n')}

[교육부 2025~2026 정책 핵심]
- 대학혁신지원사업: 취업률·충원율 성과 지표 중심 재정지원
- RISE: 지역혁신중심 대학지원체계, 경기 지역 참여 가능
- 대학기본역량진단 폐지 → 재정진단·기관인증 방식으로 전환
- 한세대 REACH 혁신전략 추진 중 (학사유연성·학생성공지원 등)
`

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '안녕하세요! 한세대학교 데이터에 대해 무엇이든 질문해 주세요.\n\n예시: "취업률이 높은 이유는?", "교원확보율 개선 방안은?", "2025 교육부 정책과 한세대의 연관성은?"' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) throw new Error('API 키가 설정되지 않았습니다.')

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { maxOutputTokens: 3000 }
      })

      const prompt = `${CONTEXT}\n\n사용자 질문: ${q}\n\n상세하고 분석적으로 답변해주세요.`
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      setMessages(prev => [...prev, { role: 'assistant', text }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `오류가 발생했습니다: ${err.message}\n\nAPI 키를 확인해주세요.`
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }, [send])

  return (
    <div style={{
      background: 'rgba(0,10,30,0.7)', borderRadius: 16,
      border: '1px solid rgba(0,212,255,0.15)',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(0,212,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#39ff14',
          animation: 'livePulse 1.5s ease-in-out infinite'
        }} />
        <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
          AI 분석 어시스턴트
        </span>
        <span style={{ color: 'rgba(160,196,232,0.4)', fontSize: 12 }}>
          Powered by Gemini 2.5 Flash
        </span>
      </div>

      {/* 메시지 영역 */}
      <div ref={chatRef} style={{
        height: 400, overflowY: 'auto', padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user'
                ? 'rgba(0,212,255,0.15)'
                : 'rgba(0,20,50,0.8)',
              border: m.role === 'user'
                ? '1px solid rgba(0,212,255,0.3)'
                : '1px solid rgba(0,212,255,0.1)',
              fontSize: 14, lineHeight: 1.7, color: '#d0e8ff'
            }}>
              {m.role === 'assistant'
                ? (
                  <div className="md-response">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )
                : m.text
              }
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#00d4ff',
                animation: `livePulse 1.2s ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        display: 'flex', gap: 10
      }}>
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="한세대학교 데이터에 대해 질문하세요... (Enter 전송)"
          rows={2}
        />
        <button
          className="chat-send-btn"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          전송
        </button>
      </div>
    </div>
  )
}

// ── 스크롤 티커 ───────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '취업률 71% — 비교군 1위',
  '경쟁률 11.7:1 — 공동 1위',
  '장학금 431만원 — 최고 수준',
  '충원율 99.8% — 사실상 완전 충원',
  '재학생 2,509명',
  '전임교원 100명',
  '전임교원 강의비율 48.3% — 개선 과제',
  '교원확보율 62.89% — 중장기 충원 필요',
  '기숙사 12.2% — 확충 필요',
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div style={{
      overflow: 'hidden', borderTop: '1px solid rgba(0,212,255,0.1)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      background: 'rgba(0,212,255,0.03)', padding: '8px 0',
      marginBottom: 40
    }}>
      <div style={{
        display: 'flex', gap: 40,
        animation: 'ticker 30s linear infinite',
        whiteSpace: 'nowrap'
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontSize: 12, color: 'rgba(0,212,255,0.7)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 0.5
          }}>
            ◈ {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── 종합 평가 ─────────────────────────────────────────────────────────────
function OverallScore() {
  const scores = {
    '취업경쟁력': 95,
    '학생지원': 88,
    '교육투자': 82,
    '시설인프라': 52,
    '교원인프라': 58,
  }

  return (
    <div style={{
      background: 'rgba(0,10,30,0.7)', borderRadius: 14,
      border: '1px solid rgba(0,212,255,0.12)', padding: '24px 28px',
      marginBottom: 40
    }}>
      <div style={{
        height: 1, marginBottom: 20,
        background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
        animation: 'panelGlow 3s ease-in-out infinite'
      }} />
      <h3 style={{ color: '#00d4ff', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
        종합 경쟁력 평가
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(scores).map(([label, score], i) => {
          const color = score >= 80 ? '#00d4ff' : score >= 60 ? '#fb923c' : '#f87171'
          return (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#a0c4e8', fontSize: 13 }}>{label}</span>
                <span style={{ color, fontSize: 13, fontWeight: 700 }}>{score}점</span>
              </div>
              <ProgressBar value={score} max={100} color={color} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 메인 Stage3 ───────────────────────────────────────────────────────────
export default function Stage3() {
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [showQR, setShowQR] = useState(false)

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#060E1F', position: 'relative' }}>
      <style>{STYLES}</style>

      {/* 배경 레이어 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,100,200,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,100,200,0.045) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px'
      }} />
      <Particles />
      <Orbs />

      {/* 콘텐츠 */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1300, margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* 히어로 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
          {/* 스캔라인 */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #00d4ff44, transparent)',
            animation: 'scanDown 4s linear infinite'
          }} />

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#39ff14',
              animation: 'livePulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 6px #39ff14'
            }} />
            <span style={{
              color: '#39ff14', fontSize: 11, fontWeight: 700,
              letterSpacing: 4, fontFamily: "'JetBrains Mono', monospace"
            }}>LIVE</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900,
            background: 'linear-gradient(135deg, #00d4ff 0%, #4da6ff 40%, #00d4ff 80%, #7fd4ff 100%)',
            backgroundSize: '300%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 5s ease infinite, heroTextGlow 3s ease-in-out infinite',
            letterSpacing: 3, marginBottom: 10
          }}>
            한세대학교 경쟁력 대시보드
          </h1>

          <p style={{ color: 'rgba(160,196,232,0.65)', fontSize: 14 }}>
            2025 대학알리미 공시 기준 · 경기 지역 동규모 사립대 비교 분석
          </p>

          {/* QR 버튼 */}
          <button
            onClick={() => setShowQR(true)}
            style={{
              position: 'absolute', right: 0, top: 0,
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
              color: '#00d4ff', borderRadius: 8, padding: '6px 14px',
              fontSize: 12, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
          >
            📱 QR 공유
          </button>
        </div>

        {/* 티커 */}
        <Ticker />

        {/* 강점 지표 */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            height: 1, marginBottom: 24,
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            animation: 'panelGlow 3s ease-in-out infinite'
          }} />
          <h2 style={{
            fontSize: 18, fontWeight: 800, color: '#00d4ff',
            letterSpacing: 2, marginBottom: 8,
            textShadow: '0 0 12px #00d4ff44'
          }}>
            ◈ 강점 지표
          </h2>
          <p style={{ color: 'rgba(160,196,232,0.5)', fontSize: 12, marginBottom: 20 }}>
            카드를 클릭하면 상세 분석을 확인할 수 있습니다
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}>
            {METRICS_STRENGTH.map((m, i) => (
              <MetricCard key={m.key} metric={m} idx={i} onOpen={setSelectedMetric} isStrength />
            ))}
          </div>
        </div>

        {/* 개선 과제 */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            height: 1, marginBottom: 24,
            background: 'linear-gradient(90deg, transparent, #ff4444, transparent)'
          }} />
          <h2 style={{
            fontSize: 18, fontWeight: 800, color: '#ff6666',
            letterSpacing: 2, marginBottom: 8,
            textShadow: '0 0 12px #ff444444'
          }}>
            ◈ 개선 과제
          </h2>
          <p style={{ color: 'rgba(160,196,232,0.5)', fontSize: 12, marginBottom: 20 }}>
            비교군 대비 취약 지표 — 중장기 전략 수립 필요
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}>
            {METRICS_IMPROVE.map((m, i) => (
              <MetricCard key={m.key} metric={m} idx={i + 4} onOpen={setSelectedMetric} isStrength={false} />
            ))}
          </div>
        </div>

        {/* 종합 평가 */}
        <OverallScore />

        {/* AI 챗봇 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            height: 1, marginBottom: 24,
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            animation: 'panelGlow 3s ease-in-out infinite'
          }} />
          <h2 style={{
            fontSize: 18, fontWeight: 800, color: '#00d4ff',
            letterSpacing: 2, marginBottom: 8,
            textShadow: '0 0 12px #00d4ff44'
          }}>
            ◈ AI 분석 어시스턴트
          </h2>
          <p style={{ color: 'rgba(160,196,232,0.5)', fontSize: 12, marginBottom: 20 }}>
            한세대학교 데이터와 교육부 정책에 대해 자유롭게 질문하세요
          </p>
          <AIChat />
        </div>
      </div>

      {/* 모달 */}
      {selectedMetric && (
        <MetricModal metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      )}
      {showQR && <QRModal onClose={() => setShowQR(false)} />}
    </div>
  )
}
