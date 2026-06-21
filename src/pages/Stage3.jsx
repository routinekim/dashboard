import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { QRCodeSVG } from 'qrcode.react'
import hanseiData from '../../hansei_report_data.json'

const { hansei, competitors, all } = hanseiData

const STYLES = `
  @keyframes floatParticle {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.6; }
    100% { transform: translateY(-100px) scale(1); opacity: 0; }
  }
  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.95); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes heroTextGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(0,212,255,0.2); }
    50% { text-shadow: 0 0 40px rgba(0,212,255,0.9), 0 0 80px rgba(0,212,255,0.5), 0 0 120px rgba(0,100,255,0.3); }
  }
  @keyframes scanDown {
    0% { top: 0%; }
    100% { top: 100%; }
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
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(0,212,255,0); }
  }
  @keyframes popIn {
    0% { transform: scale(0.85) translateY(20px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px #39ff14, 0 0 16px #39ff1466; }
    50% { opacity: 0.2; box-shadow: 0 0 0 #39ff14; }
  }
  @keyframes panelGlow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .metric-card {
    animation: fadeInUp 0.5s ease both;
  }
  .metric-card:hover {
    transform: translateY(-8px) scale(1.03);
    transition: all 0.3s ease;
  }
`

const PARTICLE_COLORS = ['#00d4ff', '#0066ff', '#00aaff', '#6ee7b7', '#00d4ff']

function useCountUp(target, duration = 1600, started = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])
  return count
}

function AnimatedBar({ value, max, color, avgValue, delay = 0 }) {
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const pct = Math.min((value / max) * 100, 100)
  const avgPct = avgValue != null ? Math.min((avgValue / max) * 100, 100) : null

  return (
    <div ref={ref} style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: '4px',
        background: `linear-gradient(90deg, ${color}99, ${color})`,
        boxShadow: `0 0 12px ${color}88, 0 0 4px ${color}`,
        width: started ? `${pct}%` : '0%',
        transition: `width 2s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }} />
      {avgPct != null && (
        <div style={{
          position: 'absolute', top: 0, left: `${avgPct}%`,
          width: '2px', height: '100%',
          background: 'rgba(255,255,255,0.5)',
          transform: 'translateX(-1px)',
          boxShadow: '0 0 4px rgba(255,255,255,0.5)',
        }} title="비교군 평균" />
      )}
    </div>
  )
}

// Mini sparkline for strength indicators
function MiniLineChart({ compValues, uid, color = '#00d4ff' }) {
  const sorted = [...compValues].sort((a, b) => a.value - b.value)
  const min = Math.min(...sorted.map(v => v.value))
  const max = Math.max(...sorted.map(v => v.value))
  const W = 200, H = 44, PAD = 6
  const range = max - min || 1

  const pts = sorted.map((v, i) => ({
    x: PAD + (i / Math.max(sorted.length - 1, 1)) * (W - PAD * 2),
    y: PAD + (H - PAD * 2) - ((v.value - min) / range) * (H - PAD * 2),
    ...v,
  }))
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <filter id={`lg-${uid}`}>
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polyline points={poly} fill="none" stroke={color} strokeWidth="4" opacity="0.18" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={poly} fill="none" stroke={color} strokeWidth="1.5" filter={`url(#lg-${uid})`} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <g key={i}>
          {p.isMain && <circle cx={p.x} cy={p.y} r={8} fill={color} opacity="0.15"/>}
          <circle cx={p.x} cy={p.y} r={p.isMain ? 4 : 2.5}
            fill={p.isMain ? color : 'rgba(255,255,255,0.25)'}
            filter={p.isMain ? `url(#lg-${uid})` : undefined}
          />
        </g>
      ))}
    </svg>
  )
}

// Mini bar chart for weakness indicators
function MiniBarChart({ compValues, uid, color = '#ff3c3c' }) {
  const sorted = [...compValues].sort((a, b) => b.value - a.value)
  const max = Math.max(...sorted.map(v => v.value)) * 1.08 || 1
  const W = 200, H = 44, PAD = 4
  const n = sorted.length
  const barW = Math.floor((W - PAD * 2 - (n - 1) * 3) / n)

  return (
    <svg width={W} height={H}>
      <defs>
        <filter id={`bg-${uid}`}>
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {sorted.map((v, i) => {
        const bh = ((v.value / max) * (H - PAD * 2))
        const x = PAD + i * (barW + 3)
        const y = H - PAD - bh
        const c = v.isMain ? color : `${color}33`
        return (
          <rect key={i} x={x} y={y} width={barW} height={Math.max(bh, 1)} rx="2"
            fill={c} filter={v.isMain ? `url(#bg-${uid})` : undefined}
          />
        )
      })}
    </svg>
  )
}

function MetricCard({ title, value, unit, displayValue, color, rank, total, avgValue, maxValue, delay, description, chartType, compValues, uid }) {
  const [hovered, setHovered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [barStarted, setBarStarted] = useState(false)

  const badgeColor = rank === 1 ? '#00d4ff' : rank === total ? '#f87171' : '#fb923c'
  const isFirst = rank === 1
  const isLast = rank === total
  const topLineColor = chartType === 'line' ? '#00d4ff' : color

  return (
    <>
      <div
        className="metric-card"
        style={{
          animationDelay: `${delay}ms`,
          background: 'rgba(0, 10, 28, 0.88)',
          border: `1px solid ${hovered ? topLineColor + '44' : 'rgba(0,212,255,0.1)'}`,
          borderRadius: '14px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'border 0.3s, box-shadow 0.3s',
          boxShadow: hovered
            ? `0 24px 56px ${topLineColor}22, 0 0 0 1px ${topLineColor}44, inset 0 1px 0 ${topLineColor}55`
            : `inset 0 1px 0 ${topLineColor}22`,
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { setModalOpen(true); setTimeout(() => setBarStarted(true), 100) }}
      >
        {/* Top line glow */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${topLineColor}, transparent)`,
          boxShadow: `0 0 8px ${topLineColor}`,
          animation: 'panelGlow 3s ease-in-out infinite',
        }} />

        {/* Shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.03), transparent)',
          animation: hovered ? 'shimmer 1.5s ease infinite' : 'none',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '500', letterSpacing: '0.5px' }}>{title}</div>
          <div style={{
            fontSize: '10px', fontWeight: '700', padding: '2px 8px',
            borderRadius: '20px', background: `${badgeColor}18`,
            color: badgeColor,
            animation: isFirst ? 'badgePulse 2s ease infinite' : 'none',
            border: `1px solid ${badgeColor}33`,
          }}>
            {rank}/{total}위
          </div>
        </div>

        <div style={{
          fontSize: '26px', fontWeight: '900', color,
          textShadow: `0 0 16px ${color}88, 0 0 32px ${color}44`,
          marginBottom: '12px', lineHeight: 1,
        }}>
          {displayValue || value}
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginLeft: '4px', fontWeight: '400' }}>{unit}</span>
        </div>

        {/* Mini chart */}
        <div style={{ marginBottom: '8px' }}>
          {chartType === 'line' && compValues
            ? <MiniLineChart compValues={compValues} uid={uid} color={color} />
            : chartType === 'bar' && compValues
            ? <MiniBarChart compValues={compValues} uid={uid} color={color} />
            : <AnimatedBar value={value} max={maxValue} color={color} avgValue={avgValue} />
          }
        </div>

        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
          비교군 평균 {avgValue?.toFixed(1)}{unit} &nbsp;·&nbsp; 클릭 시 상세
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => { setModalOpen(false); setBarStarted(false) }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #020c1e, #041428)',
              border: `1px solid ${topLineColor}44`,
              borderRadius: '20px', padding: '32px',
              maxWidth: '520px', width: '100%',
              animation: 'popIn 0.35s ease',
              boxShadow: `0 40px 80px ${topLineColor}18, inset 0 1px 0 ${topLineColor}55`,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${topLineColor}, transparent)`, boxShadow: `0 0 10px ${topLineColor}` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color, textShadow: `0 0 12px ${color}66` }}>{title}</h3>
              <button onClick={() => { setModalOpen(false); setBarStarted(false) }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: '44px', fontWeight: '900', color, textShadow: `0 0 20px ${color}88`, marginBottom: '6px' }}>
              {displayValue || value}<span style={{ fontSize: '16px', marginLeft: '6px', color: 'rgba(255,255,255,0.35)' }}>{unit}</span>
            </div>
            <div style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: '20px',
              background: `${badgeColor}18`, color: badgeColor, fontSize: '11px',
              border: `1px solid ${badgeColor}33`, marginBottom: '20px',
            }}>
              비교군 {rank}/{total}위 &nbsp;·&nbsp; {isFirst ? '🏆 최상위' : isLast ? '⚠️ 최하위' : '중위권'}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>비교군 대비 위치</div>
              <AnimatedBar value={value} max={maxValue} color={color} avgValue={avgValue} delay={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
                <span>0</span>
                <span>평균 {avgValue?.toFixed(1)}{unit}</span>
                <span>{maxValue}{unit}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', padding: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
              {description}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 저는 한세대학교 데이터 분석 AI 어시스턴트입니다. 대학 경쟁력, 지표 분석, 개선 방향 등 궁금한 점을 질문해 주세요.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    const context = `
한세대학교 데이터 (2025년 대학알리미 기준):
- 취업률: ${hansei.employmentRate}%
- 신입생 경쟁률: ${hansei.competitionRate}:1
- 신입생 충원율: ${hansei.fillRate}%
- 교원확보율(정원): ${hansei.facultyRateByQuota}%
- 교원확보율(재학): ${hansei.facultyRateByEnrolled}%
- 전임교원 강의비율: ${hansei.fullTimeLectureRatio}%
- 1인당 장학금: ${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원
- 1인당 교육비: ${hansei.educationCostPerStudent}만원
- 기숙사 수용률: ${hansei.dormitoryRate}%
- 재학생 수: ${hansei.enrolled}명
- 입학정원: ${hansei.quota}명

비교군 (경기 지역 동규모 사립대): 안양대, 성결대, 협성대, 평택대, 한신대
- 비교군 평균 취업률: ${(competitors.reduce((a,c) => a + c.employmentRate, 0) / competitors.length).toFixed(1)}%
- 비교군 평균 경쟁률: ${(competitors.reduce((a,c) => a + c.competitionRate, 0) / competitors.length).toFixed(1)}:1
- 비교군 평균 충원율: ${(competitors.reduce((a,c) => a + c.fillRate, 0) / competitors.length).toFixed(1)}%

강점: 취업률(비교군 1위), 경쟁률(비교군 공동 1위), 1인당 장학금(비교군 1위)
약점: 기숙사 수용률(비교군 최하위 12.2%), 전임교원 강의비율(비교군 최하위 48.3%), 교원확보율(비교군 최하위 62.89%)
`

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `당신은 대학 데이터 분석 전문가입니다. 다음 한세대학교 데이터를 바탕으로 질문에 답해주세요:\n\n${context}\n\n질문: ${userMsg}` }] }],
          generationConfig: { maxOutputTokens: 3000, temperature: 0.7 }
        })
      })
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '답변을 생성하지 못했습니다.'
      setMessages(prev => [...prev, { role: 'assistant', content: text }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const markdownComponents = {
    h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#00d4ff', margin: '16px 0 8px', textShadow: '0 0 12px #00d4ff66' }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#00aaff', margin: '14px 0 6px' }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6ee7b7', margin: '12px 0 4px' }}>{children}</h3>,
    strong: ({ children }) => <strong style={{ color: '#00d4ff', fontWeight: '700' }}>{children}</strong>,
    p: ({ children }) => <p style={{ margin: '8px 0', lineHeight: '1.7', color: 'rgba(255,255,255,0.82)' }}>{children}</p>,
    li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.6', color: 'rgba(255,255,255,0.75)' }}>{children}</li>,
    ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>,
    ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol>,
  }

  return (
    <div style={{
      background: 'rgba(0, 10, 28, 0.9)',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px', background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)', boxShadow: '0 0 10px #00d4ff' }} />
      <div style={{
        background: 'rgba(0,212,255,0.06)',
        padding: '18px 24px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 0 16px #00d4ff44',
        }}>🤖</div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#00d4ff' }}>AI 분석 어시스턴트</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Powered by Gemini 2.5 Flash · 한세대학교 데이터 기반</div>
        </div>
      </div>
      <div style={{ height: '360px', overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(0,100,255,0.25), rgba(0,212,255,0.15))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '12px 16px', fontSize: '14px',
            }}>
              {msg.role === 'assistant'
                ? <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                : <span style={{ color: '#fff' }}>{msg.content}</span>
              }
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '6px', padding: '12px 16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#00d4ff', boxShadow: '0 0 8px #00d4ff',
                animation: `fadeInUp 0.6s ease ${i * 0.2}s infinite alternate`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(0,212,255,0.08)', display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="한세대학교 데이터에 대해 질문하세요..."
          style={{
            flex: 1, background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.18)',
            borderRadius: '8px', padding: '10px 14px',
            color: '#fff', fontSize: '13px', outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            background: loading || !input.trim()
              ? 'rgba(0,212,255,0.05)'
              : 'linear-gradient(135deg, #0066ff, #00d4ff)',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontSize: '13px', fontWeight: '600',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            boxShadow: loading || !input.trim() ? 'none' : '0 0 16px #00d4ff44',
            transition: 'all 0.2s',
          }}
        >전송</button>
      </div>
    </div>
  )
}

// Panel wrapper with top glow line
function Panel({ children, color = '#00d4ff', style = {} }) {
  return (
    <div style={{
      background: 'rgba(0, 10, 28, 0.85)',
      border: `1px solid ${color}18`,
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 10px ${color}`,
      }} />
      {children}
    </div>
  )
}

export default function Stage3() {
  const [qrOpen, setQrOpen] = useState(false)
  const [countStarted, setCountStarted] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCountStarted(true) }, { threshold: 0.3 })
    if (heroRef.current) obs.observe(heroRef.current)
    return () => obs.disconnect()
  }, [])

  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 5) % 95}%`,
    size: `${3 + (i % 4) * 2}px`,
    duration: `${8 + (i % 6) * 2}s`,
    delay: `${(i * 0.7) % 6}s`,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  })), [])

  const orbs = useMemo(() => [
    { w: 500, h: 500, top: '-150px', left: '-150px', color: '#0044cc', dur: '16s' },
    { w: 350, h: 350, top: '25%', right: '-80px', color: '#0088ff', dur: '20s' },
    { w: 400, h: 400, bottom: '5%', left: '15%', color: '#003388', dur: '22s' },
    { w: 280, h: 280, top: '55%', right: '25%', color: '#00aaff', dur: '18s' },
  ], [])

  const competitorAvg = useMemo(() => {
    const avg = (key) => competitors.reduce((a, c) => a + (c[key] || 0), 0) / competitors.length
    return {
      employmentRate: avg('employmentRate'),
      competitionRate: avg('competitionRate'),
      fillRate: avg('fillRate'),
      facultyRateByQuota: avg('facultyRateByQuota'),
      fullTimeLectureRatio: avg('fullTimeLectureRatio'),
      scholarshipPerStudent: avg('scholarshipPerStudent'),
      dormitoryRate: avg('dormitoryRate'),
    }
  }, [])

  const allSorted = useMemo(() => {
    const sortByKey = (key) => {
      const sorted = [...all].sort((a, b) => (b[key] || 0) - (a[key] || 0))
      const rank = sorted.findIndex(u => u.name === '한세대학교') + 1
      return { rank, total: all.length, max: sorted[0]?.[key] || 100 }
    }
    return {
      employmentRate: sortByKey('employmentRate'),
      competitionRate: sortByKey('competitionRate'),
      fillRate: sortByKey('fillRate'),
      facultyRateByQuota: sortByKey('facultyRateByQuota'),
      fullTimeLectureRatio: sortByKey('fullTimeLectureRatio'),
      scholarshipPerStudent: sortByKey('scholarshipPerStudent'),
      dormitoryRate: sortByKey('dormitoryRate'),
    }
  }, [])

  // Comparison values for mini charts
  const getCompValues = useCallback((key, divisor = 1) => [
    { name: '한세대', value: (hansei[key] || 0) / divisor, isMain: true },
    ...competitors.map(c => ({ name: c.name.replace('대학교', ''), value: (c[key] || 0) / divisor, isMain: false }))
  ], [])

  const tickerItems = [
    { label: '취업률', value: `${hansei.employmentRate}%`, rank: '비교군 1위' },
    { label: '신입생 경쟁률', value: `${hansei.competitionRate}:1`, rank: '비교군 공동 1위' },
    { label: '신입생 충원율', value: `${hansei.fillRate}%`, rank: '비교군 1위' },
    { label: '1인당 장학금', value: `${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원`, rank: '비교군 1위' },
    { label: '1인당 교육비', value: `${hansei.educationCostPerStudent}만원`, rank: '비교군 2위' },
    { label: '재학생 수', value: `${hansei.enrolled.toLocaleString()}명`, rank: '' },
  ]
  const tickerDouble = [...tickerItems, ...tickerItems]

  const metrics = [
    {
      title: '취업률', value: hansei.employmentRate, unit: '%',
      color: '#00d4ff', chartType: 'line',
      rank: allSorted.employmentRate.rank, total: allSorted.employmentRate.total,
      avgValue: competitorAvg.employmentRate, maxValue: allSorted.employmentRate.max,
      delay: 0, uid: 'emp',
      compValues: getCompValues('employmentRate'),
      description: `한세대학교 취업률 ${hansei.employmentRate}%는 비교군(경기 동규모 사립대) 중 1위입니다. 비교군 평균(${competitorAvg.employmentRate.toFixed(1)}%)보다 ${(hansei.employmentRate - competitorAvg.employmentRate).toFixed(1)}%p 높으며, 이는 한세대학교의 핵심 경쟁력입니다.`,
    },
    {
      title: '신입생 경쟁률', value: hansei.competitionRate, unit: ':1',
      color: '#00d4ff', chartType: 'line',
      rank: allSorted.competitionRate.rank, total: allSorted.competitionRate.total,
      avgValue: competitorAvg.competitionRate, maxValue: allSorted.competitionRate.max,
      delay: 85, uid: 'comp',
      compValues: getCompValues('competitionRate'),
      description: `경쟁률 ${hansei.competitionRate}:1로 비교군 공동 1위를 기록합니다. 안양대학교(11.7)와 동일한 최고 수치를 보이며 신입생 모집 경쟁력이 우수합니다.`,
    },
    {
      title: '신입생 충원율', value: hansei.fillRate, unit: '%',
      color: '#00d4ff', chartType: 'line',
      rank: allSorted.fillRate.rank, total: allSorted.fillRate.total,
      avgValue: competitorAvg.fillRate, maxValue: Math.max(allSorted.fillRate.max, 102),
      delay: 170, uid: 'fill',
      compValues: getCompValues('fillRate'),
      description: `충원율 ${hansei.fillRate}%로 사실상 100% 충원에 성공했습니다. 학생 선호도와 브랜드 인지도가 높은 것을 의미합니다.`,
    },
    {
      title: '1인당 장학금', value: hansei.scholarshipPerStudent,
      displayValue: `${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원`, unit: '원',
      color: '#00d4ff', chartType: 'line',
      rank: allSorted.scholarshipPerStudent.rank, total: allSorted.scholarshipPerStudent.total,
      avgValue: competitorAvg.scholarshipPerStudent, maxValue: allSorted.scholarshipPerStudent.max,
      delay: 255, uid: 'sch',
      compValues: getCompValues('scholarshipPerStudent', 10000),
      description: `1인당 장학금 ${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원으로 비교군 최고 수준입니다. 학생 재정지원 측면에서 강점을 보입니다.`,
    },
    {
      title: '교원확보율(정원)', value: hansei.facultyRateByQuota, unit: '%',
      color: '#ff4444', chartType: 'bar',
      rank: allSorted.facultyRateByQuota.rank, total: allSorted.facultyRateByQuota.total,
      avgValue: competitorAvg.facultyRateByQuota, maxValue: allSorted.facultyRateByQuota.max,
      delay: 340, uid: 'fac',
      compValues: getCompValues('facultyRateByQuota'),
      description: `교원확보율 ${hansei.facultyRateByQuota}%는 비교군 최하위 수준입니다. 교육부 기준(100%)에 크게 미치지 못하며, 전임교원 추가 채용이 시급한 과제입니다.`,
    },
    {
      title: '전임교원 강의비율', value: hansei.fullTimeLectureRatio, unit: '%',
      color: '#ff8800', chartType: 'bar',
      rank: allSorted.fullTimeLectureRatio.rank, total: allSorted.fullTimeLectureRatio.total,
      avgValue: competitorAvg.fullTimeLectureRatio, maxValue: allSorted.fullTimeLectureRatio.max,
      delay: 425, uid: 'lec',
      compValues: getCompValues('fullTimeLectureRatio'),
      description: `전임교원 강의비율 ${hansei.fullTimeLectureRatio}%는 비교군 중 최하위입니다. 비교군 평균(${competitorAvg.fullTimeLectureRatio.toFixed(1)}%)보다 ${(competitorAvg.fullTimeLectureRatio - hansei.fullTimeLectureRatio).toFixed(1)}%p 낮으며, 교육 질 개선을 위한 전임교원 강의 확대가 필요합니다.`,
    },
    {
      title: '기숙사 수용률', value: hansei.dormitoryRate, unit: '%',
      color: '#ff4444', chartType: 'bar',
      rank: allSorted.dormitoryRate.rank, total: allSorted.dormitoryRate.total,
      avgValue: competitorAvg.dormitoryRate, maxValue: Math.max(allSorted.dormitoryRate.max, 35),
      delay: 510, uid: 'dorm',
      compValues: getCompValues('dormitoryRate'),
      description: `기숙사 수용률 ${hansei.dormitoryRate}%는 비교군 최하위입니다. 평택대(30.1%)에 비해 현저히 낮으며, 학생 주거 지원 강화가 필요합니다.`,
    },
  ]

  const enrolledCount = useCountUp(hansei.enrolled, 1600, countStarted)
  const quotaCount = useCountUp(hansei.quota, 1600, countStarted)
  const empCount = useCountUp(hansei.employmentRate * 10, 1600, countStarted)

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#060E1F' }}>
      <style>{STYLES}</style>

      {/* Blue grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,100,200,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,100,200,0.045) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
      }} />

      {/* Orbs */}
      {orbs.map((orb, i) => (
        <div key={i} style={{
          position: 'fixed',
          width: `${orb.w}px`, height: `${orb.h}px`,
          borderRadius: '50%',
          background: orb.color,
          opacity: 0.07,
          filter: 'blur(90px)',
          top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
          animation: `orbFloat ${orb.dur} ease-in-out infinite`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          left: p.left, bottom: '-20px',
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 6px ${p.color}`,
          animation: `floatParticle ${p.duration} ${p.delay} linear infinite`,
          pointerEvents: 'none', zIndex: 0, opacity: 0,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Hero Header */}
        <div ref={heroRef} style={{
          position: 'relative', textAlign: 'center',
          padding: '56px 20px 36px', overflow: 'hidden',
        }}>
          {/* Scanline */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
            animation: 'scanDown 4s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* QR Button */}
          <button
            onClick={() => setQrOpen(true)}
            style={{
              position: 'absolute', top: '20px', right: '0',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: '10px', padding: '7px 14px',
              color: '#00d4ff', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '15px' }}>📱</span> 공유 QR
          </button>

          {/* Badge + LIVE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: '20px', padding: '5px 18px',
              fontSize: '10px', color: '#00d4ff', letterSpacing: '3px', fontWeight: '600',
            }}>HANSEI UNIVERSITY DASHBOARD</div>
            {/* LIVE indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#39ff14',
                animation: 'livePulse 1.2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '10px', color: '#39ff14', letterSpacing: '2px', fontWeight: '700' }}>LIVE</span>
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 52px)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #fff 0%, #00d4ff 40%, #0088ff 70%, #6ee7b7 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 4s ease infinite, heroTextGlow 3s ease-in-out infinite',
            marginBottom: '10px', lineHeight: 1.2,
          }}>
            한세대학교<br />경쟁력 분석 대시보드
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '36px', letterSpacing: '0.5px' }}>
            2025년 대학알리미 공시 기준 · 경기 동규모 사립대 5개교 비교군
          </p>

          {/* Quick Stats with glow */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              { label: '재학생', value: enrolledCount.toLocaleString(), unit: '명', color: '#00d4ff' },
              { label: '입학정원', value: quotaCount.toLocaleString(), unit: '명', color: '#0088ff' },
              { label: '취업률', value: (empCount / 10).toFixed(1), unit: '%', color: '#39ff14' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: '900', color: stat.color,
                  textShadow: `0 0 20px ${stat.color}88, 0 0 40px ${stat.color}44`,
                }}>
                  {stat.value}<span style={{ fontSize: '15px', marginLeft: '4px', opacity: 0.5 }}>{stat.unit}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginTop: '4px', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Ticker */}
        <div style={{
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: '10px', padding: '11px 0',
          marginBottom: '44px', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', gap: '40px',
            animation: 'ticker 20s linear infinite',
            whiteSpace: 'nowrap',
          }}>
            {tickerDouble.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: 'rgba(0,212,255,0.5)', letterSpacing: '1px' }}>{item.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#00d4ff', textShadow: '0 0 10px #00d4ff66' }}>{item.value}</span>
                {item.rank && <span style={{ fontSize: '9px', background: 'rgba(0,212,255,0.12)', color: '#00d4ff', padding: '2px 7px', borderRadius: '8px', border: '1px solid rgba(0,212,255,0.25)' }}>{item.rank}</span>}
                <span style={{ color: 'rgba(0,212,255,0.15)', fontSize: '18px' }}>·</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths Section */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ width: '3px', height: '22px', background: 'linear-gradient(to bottom, #00d4ff, #0066ff)', borderRadius: '2px', boxShadow: '0 0 8px #00d4ff' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#00d4ff', textShadow: '0 0 12px #00d4ff66' }}>핵심 강점 지표</h2>
            <div style={{ fontSize: '11px', color: '#00d4ff', background: 'rgba(0,212,255,0.08)', padding: '2px 10px', borderRadius: '8px', border: '1px solid rgba(0,212,255,0.2)' }}>비교군 최상위</div>
            <div style={{ fontSize: '10px', color: 'rgba(0,212,255,0.5)', letterSpacing: '1px' }}>CYAN LINE CHART</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {metrics.slice(0, 4).map((m) => <MetricCard key={m.title} {...m} />)}
          </div>
        </div>

        {/* Weaknesses Section */}
        <div style={{ marginBottom: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ width: '3px', height: '22px', background: 'linear-gradient(to bottom, #ff4444, #ff8800)', borderRadius: '2px', boxShadow: '0 0 8px #ff444466' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ff4444', textShadow: '0 0 12px #ff444466' }}>개선 과제 지표</h2>
            <div style={{ fontSize: '11px', color: '#ff8800', background: 'rgba(255,68,0,0.08)', padding: '2px 10px', borderRadius: '8px', border: '1px solid rgba(255,68,0,0.2)' }}>집중 개선 필요</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,68,0,0.5)', letterSpacing: '1px' }}>RED/ORANGE BAR CHART</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {metrics.slice(4).map((m) => <MetricCard key={m.title} {...m} />)}
          </div>
        </div>

        {/* Comprehensive Comparison Table */}
        <Panel color="#00d4ff" style={{ padding: '28px', marginBottom: '44px', overflowX: 'auto' }}>
          <div style={{ padding: '0 0 20px 0' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#00d4ff', textShadow: '0 0 10px #00d4ff55' }}>비교군 종합 비교표</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                {['지표', '한세대', '안양대', '성결대', '협성대', '평택대', '한신대'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: h === '지표' ? 'left' : 'center',
                    color: h === '한세대' ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    fontWeight: h === '한세대' ? '700' : '500',
                    fontSize: '11px', letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: '취업률(%)', key: 'employmentRate', higherBetter: true },
                { label: '경쟁률(:1)', key: 'competitionRate', higherBetter: true },
                { label: '충원율(%)', key: 'fillRate', higherBetter: true },
                { label: '장학금(만원)', key: 'scholarshipPerStudent', higherBetter: true, divisor: 10000 },
                { label: '교원확보율(%)', key: 'facultyRateByQuota', higherBetter: true },
                { label: '강의비율(%)', key: 'fullTimeLectureRatio', higherBetter: true },
                { label: '기숙사(%)', key: 'dormitoryRate', higherBetter: true },
                { label: '교육비(만원)', key: 'educationCostPerStudent', higherBetter: true },
              ].map((row) => {
                const allVals = [hansei, ...competitors].map(u => (u[row.key] || 0) / (row.divisor || 1))
                const maxVal = Math.max(...allVals)
                const minVal = Math.min(...allVals)

                return (
                  <tr key={row.key} style={{ borderBottom: '1px solid rgba(0,212,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{row.label}</td>
                    {[hansei, ...competitors].map((u, ui) => {
                      const val = (u[row.key] || 0) / (row.divisor || 1)
                      const isMax = val === maxVal
                      const isMin = val === minVal
                      const cellColor = isMax && row.higherBetter ? '#00d4ff'
                        : isMin && row.higherBetter ? '#ff4444'
                        : ui === 0 ? '#88ddff' : 'rgba(255,255,255,0.65)'
                      return (
                        <td key={u.name || ui} style={{
                          padding: '10px 12px', textAlign: 'center',
                          color: cellColor,
                          fontWeight: isMax || isMin || ui === 0 ? '700' : '400',
                          textShadow: isMax ? '0 0 8px #00d4ff88' : isMin ? '0 0 8px #ff444488' : 'none',
                        }}>
                          {val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}
                          {isMax && <span style={{ fontSize: '8px', marginLeft: '2px' }}>▲</span>}
                          {isMin && <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span>}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', display: 'flex', gap: '16px' }}>
            <span><span style={{ color: '#00d4ff' }}>▲</span> 비교군 최고</span>
            <span><span style={{ color: '#ff4444' }}>▼</span> 비교군 최저</span>
            <span><span style={{ color: '#88ddff' }}>■</span> 한세대학교</span>
          </div>
        </Panel>

        {/* AI Assistant */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ width: '3px', height: '22px', background: 'linear-gradient(to bottom, #00d4ff, #0044ff)', borderRadius: '2px', boxShadow: '0 0 8px #00d4ff' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#00d4ff', textShadow: '0 0 12px #00d4ff66' }}>종합 평가 · AI 분석</h2>
          </div>
          <Panel color="#00d4ff" style={{ padding: '20px', marginBottom: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontSize: '14px' }}>
              한세대학교는 <strong style={{ color: '#00d4ff', textShadow: '0 0 8px #00d4ff66' }}>취업률(71%), 신입생 경쟁률(11.7:1), 1인당 장학금(431만원)</strong>에서 비교군 1위를 기록하며 학생 선호도와 취업 경쟁력 측면의 강점을 갖추고 있습니다.
              반면 <strong style={{ color: '#ff4444', textShadow: '0 0 8px #ff444466' }}>기숙사 수용률(12.2%), 전임교원 강의비율(48.3%), 교원확보율(62.89%)</strong>은 개선이 필요하며, 교육부 2025~2026 대학혁신 정책 대응을 위한 집중 투자가 요구됩니다.
            </p>
          </Panel>
          <AIAssistant />
        </div>

      </div>

      {/* QR Modal */}
      {qrOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setQrOpen(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #020c1e, #041428)',
              border: '1px solid rgba(0,212,255,0.35)',
              borderRadius: '20px', padding: '40px',
              textAlign: 'center',
              animation: 'popIn 0.35s ease',
              boxShadow: '0 40px 80px rgba(0,212,255,0.15), inset 0 1px 0 rgba(0,212,255,0.4)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)', boxShadow: '0 0 12px #00d4ff' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#00d4ff', marginBottom: '6px', textShadow: '0 0 12px #00d4ff66' }}>대시보드 공유</h3>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>QR코드를 스캔하면 대시보드로 이동합니다</p>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
              <QRCodeSVG value="https://dashboard-two-kappa-86.vercel.app/" size={200} />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
              dashboard-two-kappa-86.vercel.app
            </div>
            <button
              onClick={() => setQrOpen(false)}
              style={{
                padding: '10px 24px',
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: '8px', color: '#00d4ff',
                fontSize: '13px', cursor: 'pointer',
              }}
            >닫기 (ESC)</button>
          </div>
        </div>
      )}
    </div>
  )
}
