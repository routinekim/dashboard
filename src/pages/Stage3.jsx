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
    0%, 100% { text-shadow: 0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.2); }
    50% { text-shadow: 0 0 40px rgba(139,92,246,0.8), 0 0 80px rgba(139,92,246,0.4), 0 0 120px rgba(6,182,212,0.2); }
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
    0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
  }
  @keyframes popIn {
    0% { transform: scale(0.85) translateY(20px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
  .metric-card {
    animation: fadeInUp 0.5s ease both;
  }
  .metric-card:hover {
    transform: translateY(-8px) scale(1.03);
    transition: all 0.3s ease;
  }
`

const PARTICLE_COLORS = ['#a78bfa', '#f472b6', '#06b6d4', '#6ee7b7', '#4ade80']

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

function AnimatedBar({ value, max, color, avgValue, avgMax, delay = 0 }) {
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
    <div ref={ref} style={{ position: 'relative', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: '5px',
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 10px ${color}66`,
        width: started ? `${pct}%` : '0%',
        transition: `width 2s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }} />
      {avgPct != null && (
        <div style={{
          position: 'absolute', top: 0, left: `${avgPct}%`,
          width: '2px', height: '100%',
          background: 'rgba(255,255,255,0.6)',
          transform: 'translateX(-1px)',
        }} title="비교군 평균" />
      )}
    </div>
  )
}

function MetricCard({ title, value, unit, displayValue, color, rank, total, avgValue, maxValue, delay, description }) {
  const [hovered, setHovered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [barStarted, setBarStarted] = useState(false)

  const badgeColor = rank === 1 ? '#4ade80' : rank === total ? '#f87171' : '#fb923c'
  const isFirst = rank === 1
  const isLast = rank === total

  return (
    <>
      <div
        className="metric-card"
        style={{
          animationDelay: `${delay}ms`,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? color + '55' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '16px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'border 0.3s, box-shadow 0.3s',
          boxShadow: hovered ? `0 28px 64px ${color}30, 0 0 0 1px ${color}55` : 'none',
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { setModalOpen(true); setTimeout(() => setBarStarted(true), 100) }}
      >
        {/* Shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          animation: hovered ? 'shimmer 1.5s ease infinite' : 'none',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{title}</div>
          <div style={{
            fontSize: '10px', fontWeight: '700', padding: '3px 8px',
            borderRadius: '20px', background: `${badgeColor}22`,
            color: badgeColor,
            animation: isFirst ? 'badgePulse 2s ease infinite' : 'none',
            border: `1px solid ${badgeColor}44`,
          }}>
            {rank}/{total}위
          </div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '900', color, marginBottom: '4px' }}>
          {displayValue || value}
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>{unit}</span>
        </div>
        <div style={{ marginTop: '12px' }}>
          <AnimatedBar value={value} max={maxValue} color={color} avgValue={avgValue} avgMax={maxValue} />
        </div>
        <div style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
          비교군 평균: {avgValue?.toFixed(1)}{unit} | 클릭 시 상세 분석
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => { setModalOpen(false); setBarStarted(false) }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0d0a2e, #1a0a3e)',
              border: `1px solid ${color}44`,
              borderRadius: '24px', padding: '32px',
              maxWidth: '520px', width: '100%',
              animation: 'popIn 0.35s ease',
              boxShadow: `0 40px 80px ${color}22`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color }}>{title}</h3>
              <button onClick={() => { setModalOpen(false); setBarStarted(false) }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: '48px', fontWeight: '900', color, marginBottom: '8px' }}>
              {displayValue || value}<span style={{ fontSize: '18px', marginLeft: '6px', color: 'rgba(255,255,255,0.4)' }}>{unit}</span>
            </div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              background: `${badgeColor}22`, color: badgeColor, fontSize: '12px',
              border: `1px solid ${badgeColor}44`, marginBottom: '20px',
              animation: isFirst ? 'badgePulse 2s ease infinite' : 'none',
            }}>
              비교군 {rank}/{total}위 · {isFirst ? '🏆 최상위' : isLast ? '⚠️ 최하위' : '중위권'}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>비교군 대비 위치</div>
              <AnimatedBar value={value} max={maxValue} color={color} avgValue={avgValue} avgMax={maxValue} delay={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                <span>0</span>
                <span>비교군 평균 {avgValue?.toFixed(1)}{unit}</span>
                <span>{maxValue}{unit}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
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
          contents: [
            {
              role: 'user',
              parts: [{ text: `당신은 대학 데이터 분석 전문가입니다. 다음 한세대학교 데이터를 바탕으로 질문에 답해주세요:\n\n${context}\n\n질문: ${userMsg}` }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 3000,
            temperature: 0.7,
          }
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
    h1: ({ children }) => <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#a78bfa', margin: '16px 0 8px' }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#06b6d4', margin: '14px 0 6px' }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#4ade80', margin: '12px 0 4px' }}>{children}</h3>,
    strong: ({ children }) => <strong style={{ color: '#f472b6', fontWeight: '700' }}>{children}</strong>,
    p: ({ children }) => <p style={{ margin: '8px 0', lineHeight: '1.7', color: 'rgba(255,255,255,0.85)' }}>{children}</p>,
    li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>{children}</li>,
    ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>,
    ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol>,
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>🤖</div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>AI 분석 어시스턴트</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Powered by Gemini 2.5 Flash · 한세대학교 데이터 기반</div>
        </div>
      </div>

      <div style={{ height: '360px', overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '12px 16px',
              fontSize: '14px',
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
                background: '#8b5cf6',
                animation: `fadeInUp 0.6s ease ${i * 0.2}s infinite alternate`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: '10px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="한세대학교 데이터에 대해 질문하세요..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px', padding: '10px 14px',
            color: '#fff', fontSize: '13px', outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            background: loading || !input.trim()
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontSize: '13px', fontWeight: '600',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          전송
        </button>
      </div>
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
    size: `${4 + (i % 4) * 2}px`,
    duration: `${8 + (i % 6) * 2}s`,
    delay: `${(i * 0.7) % 6}s`,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  })), [])

  const orbs = useMemo(() => [
    { w: 400, h: 400, top: '-100px', left: '-100px', color: '#8b5cf6', dur: '15s' },
    { w: 300, h: 300, top: '30%', right: '-80px', color: '#06b6d4', dur: '18s' },
    { w: 350, h: 350, bottom: '10%', left: '20%', color: '#f472b6', dur: '20s' },
    { w: 250, h: 250, top: '60%', right: '30%', color: '#4ade80', dur: '22s' },
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

  const tickerItems = [
    { label: '취업률', value: `${hansei.employmentRate}%`, rank: `비교군 1위` },
    { label: '신입생 경쟁률', value: `${hansei.competitionRate}:1`, rank: `비교군 공동 1위` },
    { label: '신입생 충원율', value: `${hansei.fillRate}%`, rank: `비교군 1위` },
    { label: '1인당 장학금', value: `${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원`, rank: `비교군 1위` },
    { label: '1인당 교육비', value: `${hansei.educationCostPerStudent}만원`, rank: `비교군 2위` },
    { label: '재학생 수', value: `${hansei.enrolled.toLocaleString()}명`, rank: '' },
  ]
  const tickerDouble = [...tickerItems, ...tickerItems]

  const metrics = [
    {
      title: '취업률', value: hansei.employmentRate, unit: '%',
      color: '#4ade80',
      rank: allSorted.employmentRate.rank, total: allSorted.employmentRate.total,
      avgValue: competitorAvg.employmentRate,
      maxValue: allSorted.employmentRate.max,
      delay: 0,
      description: `한세대학교 취업률 ${hansei.employmentRate}%는 비교군(경기 동규모 사립대) 중 1위입니다. 비교군 평균(${competitorAvg.employmentRate.toFixed(1)}%)보다 ${(hansei.employmentRate - competitorAvg.employmentRate).toFixed(1)}%p 높으며, 이는 한세대학교의 핵심 경쟁력입니다.`,
    },
    {
      title: '신입생 경쟁률', value: hansei.competitionRate, unit: ':1',
      color: '#4ade80',
      rank: allSorted.competitionRate.rank, total: allSorted.competitionRate.total,
      avgValue: competitorAvg.competitionRate,
      maxValue: allSorted.competitionRate.max,
      delay: 85,
      description: `경쟁률 ${hansei.competitionRate}:1로 비교군 공동 1위를 기록합니다. 안양대학교(11.7)와 동일한 최고 수치를 보이며 신입생 모집 경쟁력이 우수합니다.`,
    },
    {
      title: '신입생 충원율', value: hansei.fillRate, unit: '%',
      color: '#4ade80',
      rank: allSorted.fillRate.rank, total: allSorted.fillRate.total,
      avgValue: competitorAvg.fillRate,
      maxValue: Math.max(allSorted.fillRate.max, 102),
      delay: 170,
      description: `충원율 ${hansei.fillRate}%로 사실상 100% 충원에 성공했습니다. 학생 선호도와 브랜드 인지도가 높은 것을 의미합니다.`,
    },
    {
      title: '1인당 장학금', value: hansei.scholarshipPerStudent, displayValue: `${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원`, unit: '원',
      color: '#4ade80',
      rank: allSorted.scholarshipPerStudent.rank, total: allSorted.scholarshipPerStudent.total,
      avgValue: competitorAvg.scholarshipPerStudent,
      maxValue: allSorted.scholarshipPerStudent.max,
      delay: 255,
      description: `1인당 장학금 ${(hansei.scholarshipPerStudent / 10000).toFixed(0)}만원으로 비교군 최고 수준입니다. 학생 재정지원 측면에서 강점을 보입니다.`,
    },
    {
      title: '교원확보율(정원)', value: hansei.facultyRateByQuota, unit: '%',
      color: '#f87171',
      rank: allSorted.facultyRateByQuota.rank, total: allSorted.facultyRateByQuota.total,
      avgValue: competitorAvg.facultyRateByQuota,
      maxValue: allSorted.facultyRateByQuota.max,
      delay: 340,
      description: `교원확보율 ${hansei.facultyRateByQuota}%는 비교군 최하위 수준입니다. 교육부 기준(100%)에 크게 미치지 못하며, 전임교원 추가 채용이 시급한 과제입니다. 대학혁신지원사업 평가에서 불이익을 받을 수 있습니다.`,
    },
    {
      title: '전임교원 강의비율', value: hansei.fullTimeLectureRatio, unit: '%',
      color: '#f87171',
      rank: allSorted.fullTimeLectureRatio.rank, total: allSorted.fullTimeLectureRatio.total,
      avgValue: competitorAvg.fullTimeLectureRatio,
      maxValue: allSorted.fullTimeLectureRatio.max,
      delay: 425,
      description: `전임교원 강의비율 ${hansei.fullTimeLectureRatio}%는 비교군 중 최하위입니다. 비교군 평균(${competitorAvg.fullTimeLectureRatio.toFixed(1)}%)보다 ${(competitorAvg.fullTimeLectureRatio - hansei.fullTimeLectureRatio).toFixed(1)}%p 낮으며, 교육 질 개선을 위한 전임교원 강의 확대가 필요합니다.`,
    },
    {
      title: '기숙사 수용률', value: hansei.dormitoryRate, unit: '%',
      color: '#f87171',
      rank: allSorted.dormitoryRate.rank, total: allSorted.dormitoryRate.total,
      avgValue: competitorAvg.dormitoryRate,
      maxValue: Math.max(allSorted.dormitoryRate.max, 35),
      delay: 510,
      description: `기숙사 수용률 ${hansei.dormitoryRate}%는 비교군 최하위입니다. 평택대(30.1%)에 비해 현저히 낮으며, 학생 주거 지원 강화가 필요합니다. 지방 학생 유치에 걸림돌이 될 수 있습니다.`,
    },
  ]

  const enrolledCount = useCountUp(hansei.enrolled, 1600, countStarted)
  const quotaCount = useCountUp(hansei.quota, 1600, countStarted)
  const empCount = useCountUp(hansei.employmentRate * 10, 1600, countStarted)

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Background Orbs */}
      {orbs.map((orb, i) => (
        <div key={i} style={{
          position: 'fixed',
          width: `${orb.w}px`, height: `${orb.h}px`,
          borderRadius: '50%',
          background: orb.color,
          opacity: 0.06,
          filter: 'blur(80px)',
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
          animation: `floatParticle ${p.duration} ${p.delay} linear infinite`,
          pointerEvents: 'none', zIndex: 0, opacity: 0,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Hero Header */}
        <div ref={heroRef} style={{
          position: 'relative', textAlign: 'center',
          padding: '60px 20px 40px', overflow: 'hidden',
        }}>
          {/* Scanline */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)',
            animation: 'scanDown 4s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* QR Button */}
          <button
            onClick={() => setQrOpen(true)}
            style={{
              position: 'absolute', top: '20px', right: '0',
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '12px', padding: '8px 14px',
              color: '#a78bfa', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '16px' }}>📱</span> 공유 QR
          </button>

          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '20px', padding: '6px 20px',
            fontSize: '11px', color: '#a78bfa', letterSpacing: '3px',
            marginBottom: '20px', fontWeight: '600',
          }}>HANSEI UNIVERSITY DASHBOARD</div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 56px)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 40%, #06b6d4 70%, #4ade80 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 4s ease infinite, heroTextGlow 3s ease-in-out infinite',
            marginBottom: '12px',
            lineHeight: 1.2,
          }}>
            한세대학교<br />경쟁력 분석 대시보드
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>
            2025년 대학알리미 공시 기준 · 경기 동규모 사립대 5개교 비교군
          </p>

          {/* Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { label: '재학생', value: enrolledCount.toLocaleString(), unit: '명', color: '#a78bfa' },
              { label: '입학정원', value: quotaCount.toLocaleString(), unit: '명', color: '#06b6d4' },
              { label: '취업률', value: (empCount / 10).toFixed(1), unit: '%', color: '#4ade80' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', color: stat.color }}>
                  {stat.value}<span style={{ fontSize: '16px', marginLeft: '4px', opacity: 0.6 }}>{stat.unit}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Ticker */}
        <div style={{
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '12px', padding: '12px 0',
          marginBottom: '48px', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', gap: '40px',
            animation: 'ticker 20s linear infinite',
            whiteSpace: 'nowrap',
          }}>
            {tickerDouble.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{item.label}</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#a78bfa' }}>{item.value}</span>
                {item.rank && <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.3)' }}>{item.rank}</span>}
                <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '20px' }}>·</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(to bottom, #4ade80, #06b6d4)', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4ade80' }}>핵심 강점 지표</h2>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(74,222,128,0.1)', padding: '3px 10px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.2)' }}>비교군 최상위</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {metrics.slice(0, 4).map((m, i) => <MetricCard key={m.title} {...m} />)}
          </div>
        </div>

        {/* Weaknesses Section */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(to bottom, #f87171, #fb923c)', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f87171' }}>개선 과제 지표</h2>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(248,113,113,0.1)', padding: '3px 10px', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.2)' }}>집중 개선 필요</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {metrics.slice(4).map((m, i) => <MetricCard key={m.title} {...m} />)}
          </div>
        </div>

        {/* Comprehensive Comparison Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '20px', padding: '28px',
          marginBottom: '48px',
          overflowX: 'auto',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#a78bfa' }}>비교군 종합 비교표</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['지표', '한세대', '안양대', '성결대', '협성대', '평택대', '한신대'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: h === '지표' ? 'left' : 'center',
                    color: h === '한세대' ? '#a78bfa' : 'rgba(255,255,255,0.5)',
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
              ].map((row, ri) => {
                const allVals = [hansei, ...competitors].map(u => (u[row.key] || 0) / (row.divisor || 1))
                const maxVal = Math.max(...allVals)
                const minVal = Math.min(...allVals)
                const hanseiVal = (hansei[row.key] || 0) / (row.divisor || 1)

                return (
                  <tr key={row.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{row.label}</td>
                    {[hansei, ...competitors].map((u, ui) => {
                      const val = (u[row.key] || 0) / (row.divisor || 1)
                      const isMax = val === maxVal
                      const isMin = val === minVal
                      const cellColor = isMax && row.higherBetter ? '#4ade80'
                        : isMin && row.higherBetter ? '#f87171'
                        : ui === 0 ? '#a78bfa' : 'rgba(255,255,255,0.7)'
                      return (
                        <td key={u.name || ui} style={{
                          padding: '10px 12px', textAlign: 'center',
                          color: cellColor,
                          fontWeight: isMax || isMin || ui === 0 ? '700' : '400',
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
          <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: '16px' }}>
            <span><span style={{ color: '#4ade80' }}>▲</span> 비교군 최고</span>
            <span><span style={{ color: '#f87171' }}>▼</span> 비교군 최저</span>
            <span><span style={{ color: '#a78bfa' }}>■</span> 한세대학교</span>
          </div>
        </div>

        {/* AI Assistant */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(to bottom, #8b5cf6, #06b6d4)', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#a78bfa' }}>종합 평가 · AI 분석</h2>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: '16px', padding: '20px',
            marginBottom: '20px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontSize: '14px' }}>
              한세대학교는 <strong style={{ color: '#4ade80' }}>취업률(71%), 신입생 경쟁률(11.7:1), 1인당 장학금(431만원)</strong>에서 비교군 1위를 기록하며 학생 선호도와 취업 경쟁력 측면의 강점을 갖추고 있습니다.
              반면 <strong style={{ color: '#f87171' }}>기숙사 수용률(12.2%), 전임교원 강의비율(48.3%), 교원확보율(62.89%)</strong>은 개선이 필요하며, 교육부 2025~2026 대학혁신 정책 대응을 위한 집중 투자가 요구됩니다.
            </p>
          </div>
          <AIAssistant />
        </div>

      </div>

      {/* QR Modal */}
      {qrOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setQrOpen(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0d0a2e, #1a0a3e)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '24px', padding: '40px',
              textAlign: 'center',
              animation: 'popIn 0.35s ease',
              boxShadow: '0 40px 80px rgba(139,92,246,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#a78bfa', marginBottom: '8px' }}>대시보드 공유</h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>QR코드를 스캔하면 대시보드로 이동합니다</p>
            <div style={{
              background: '#fff', padding: '16px', borderRadius: '16px',
              display: 'inline-block', marginBottom: '20px',
            }}>
              <QRCodeSVG value="https://dashboard-two-kappa-86.vercel.app/" size={200} />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
              dashboard-two-kappa-86.vercel.app
            </div>
            <button
              onClick={() => setQrOpen(false)}
              style={{
                padding: '10px 24px',
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '10px', color: '#a78bfa',
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              닫기 (ESC)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
