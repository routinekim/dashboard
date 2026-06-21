import { useState, useMemo } from 'react'
import AskAI from './AskAI'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ReferenceLine,
} from 'recharts'

const METRICS_DEF = [
  {
    key: '취업률',
    label: '취업률',
    unit: '%',
    icon: '🎓',
    color: '#34d399',
    desc: '2025년 기준 졸업생 취업률',
    analysis: {
      title: '취업률 분석 — 한세대학교의 핵심 강점',
      summary: '71%의 취업률은 경기권 사립대 상위권',
      points: [
        '전국 239개 대학 중 상위 30% 수준의 취업률 달성',
        '경기도 사립 4년제 대학 중 취업률 경쟁력 우위',
        '실무 중심 교육과정과 산학협력 강화 효과 반영',
        '2025 교육부 대학기본역량 진단 "취업" 부문 긍정 평가 예상',
      ],
      recommendation: '현재의 취업률 강점을 유지하기 위해 AI·디지털 직무 연계 교육과정을 확대하고, 졸업생 추적 관리 시스템을 고도화하여 75% 이상 목표를 수립할 것을 권고합니다.',
      policy: 'RISE 지역혁신 대학 선정 시 취업률은 핵심 평가 지표로 작용',
    },
  },
  {
    key: '신입생경쟁률',
    label: '신입생 경쟁률',
    unit: ':1',
    icon: '📈',
    color: '#60a5fa',
    desc: '2025년 신입생 경쟁률',
    analysis: {
      title: '신입생 경쟁률 분석 — 안정적 수요 확보',
      summary: '11.7:1 경쟁률로 중소형 대학 중 우수',
      points: [
        '학령인구 감소 추세에도 불구하고 11.7:1 유지',
        '충원율 99.8%와 결합한 이중 안정성 확보',
        '종교 기반 특성화 교육의 차별적 브랜드 가치 반영',
        '수도권 근접 입지 효과 — 경기도 산업체 연계 유리',
      ],
      recommendation: '경쟁률 유지를 위한 수시 전형 다양화, 지역 고교 연계 프로그램 강화, AI 특기자 전형 신설 등을 검토하여 2030년까지 12:1 이상 유지 전략이 필요합니다.',
      policy: '글로컬 대학 30 지원 시 수요 안정성 지표로 활용 가능',
    },
  },
  {
    key: '교원확보율_정원',
    label: '교원 확보율',
    unit: '%',
    icon: '👨‍🏫',
    color: '#a78bfa',
    desc: '전임교원 확보율 (학생정원 기준)',
    analysis: {
      title: '교원확보율 분석 — 개선이 필요한 영역',
      summary: '62.89%로 법정 기준(100%) 미달',
      points: [
        '전임교원 확보율 62.89% — 법정기준(100%) 대비 37% 부족',
        '재학생 기준 확보율은 64.52%로 유사한 수준',
        '교원 1인당 학생 수 35.59명으로 교육 밀도 개선 필요',
        '대학기본역량 진단 시 교원확보율 하락이 감점 요인',
      ],
      recommendation: '향후 3년간 단계적 전임교원 20명 이상 확충 계획 수립이 필요합니다. 특히 AI·디지털 분야 교원 우선 채용을 통해 교원확보율 개선과 AX 역량 강화를 동시에 달성해야 합니다.',
      policy: '대학기본역량 진단 교원 부문 평가 지표 직결 — 개선 시급',
    },
  },
  {
    key: '학생1인당교육비',
    label: '1인당 교육비',
    unit: '천원',
    icon: '💰',
    color: '#f59e0b',
    desc: '학생 1인당 연간 교육비 (천원)',
    analysis: {
      title: '1인당 교육비 분석 — 교육투자 현황',
      summary: '13,445천원 — 중위권 수준의 교육 투자',
      points: [
        '학생 1인당 연간 교육비 약 1,345만원 (전국 중위권)',
        '평균 등록금 8,859천원 대비 교육비 1.5배 수준',
        '교육비 투자 확대 시 취업률·만족도 향상 기대',
        '국립대 대비 교육비 열위 — 사립대 일반적 특성',
      ],
      recommendation: 'RISE 사업비, 글로컬 대학 지원금 등 외부 재원 확보를 통해 학생 1인당 교육비를 2027년까지 1,500만원 이상으로 확대하는 로드맵이 필요합니다.',
      policy: 'LINC 3.0, ICAN 사업 등 정부 재정지원을 통한 교육비 보강 가능',
    },
  },
  {
    key: '학생1인당장학금',
    label: '1인당 장학금',
    unit: '원',
    icon: '🏅',
    color: '#f472b6',
    desc: '학생 1인당 연간 장학금 (원)',
    analysis: {
      title: '1인당 장학금 분석 — 학생 지원 현황',
      summary: '431만원 장학금으로 학생 부담 완화',
      points: [
        '연간 학생 1인당 장학금 4,313,203원 (약 431만원)',
        '평균 등록금(886만원) 대비 약 49% 수준의 장학 혜택',
        '등록금 실부담액 약 450만원 — 경쟁력 있는 수준',
        '교내·외 장학 프로그램 다양화로 학생 만족도 제고',
      ],
      recommendation: '국가장학금 연계 강화 및 성적 우수 장학금 외 취약계층·특기 장학금 확대를 통해 실부담 등록금을 더욱 낮추는 방향을 권고합니다.',
      policy: '교육부 등록금 동결 정책 하 장학금 확대는 실질적 학비 인하 효과',
    },
  },
  {
    key: '기숙사수용율',
    label: '기숙사 수용율',
    unit: '%',
    icon: '🏠',
    color: '#ef4444',
    desc: '기숙사 수용율 (%)',
    analysis: {
      title: '기숙사 수용율 분석 — 가장 시급한 개선 과제',
      summary: '12.2%로 전국 최하위권 — 긴급 개선 필요',
      points: [
        '기숙사 수용율 12.2% — 전국 평균(25~30%) 대비 절반 이하',
        '수도권 대학 평균 대비 현저히 낮은 수준',
        '학생 유치 경쟁력의 핵심 약점으로 지목',
        '등하교 불편으로 인한 학생 선택 기피 요인 작용',
      ],
      recommendation: '단기: 주변 공공 기숙사·원룸 협약 체결(500명 추가 수용 목표). 중기: 생활관 신축 또는 증축(2028년까지 30% 달성). RISE 사업비 연계 추진을 통해 재원 확보가 필요합니다.',
      policy: 'RISE 지역대학 지원사업 기숙사 인프라 항목 — 직접 연계 가능',
    },
  },
]

function MetricCard({ metric, value, rank, total, onClick, isActive }) {
  const getGrade = () => {
    if (rank <= total * 0.1) return { label: 'S', color: '#fbbf24' }
    if (rank <= total * 0.25) return { label: 'A', color: '#34d399' }
    if (rank <= total * 0.5) return { label: 'B', color: '#60a5fa' }
    if (rank <= total * 0.75) return { label: 'C', color: '#f59e0b' }
    return { label: 'D', color: '#ef4444' }
  }
  const grade = getGrade()

  return (
    <div
      onClick={onClick}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${metric.color}30, ${metric.color}15)`
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${isActive ? metric.color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, padding: '20px 18px',
        cursor: 'pointer', transition: 'all 0.25s',
        transform: isActive ? 'translateY(-4px)' : 'none',
        boxShadow: isActive ? `0 12px 40px ${metric.color}30` : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {isActive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${metric.color}, transparent)`,
        }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{metric.icon}</span>
        <div style={{
          background: grade.color + '30', color: grade.color,
          padding: '2px 8px', borderRadius: 6, fontSize: 13, fontWeight: 800,
        }}>{grade.label}등급</div>
      </div>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{metric.label}</div>
      <div style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        {metric.key === '학생1인당장학금'
          ? Math.round(value / 10000) + '만원'
          : value + metric.unit}
      </div>
      <div style={{ color: metric.color, fontSize: 11 }}>
        전국 {rank}위 / {total}개교
      </div>
      <div style={{
        width: '100%', height: 4, background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, marginTop: 12, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)`,
          width: `${Math.max(5, 100 - (rank / total * 100))}%`,
          transition: 'width 0.8s ease',
        }} />
      </div>
      <div style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
        클릭하여 상세 분석 보기 ▾
      </div>
    </div>
  )
}

function AnalysisPanel({ metric, hansei, data, onClose }) {
  const peers = useMemo(() => {
    return data.filter(d =>
      d.지역 === '경기' && d.학교유형 === '대학교' && d.설립유형 === '사립'
    ).sort((a, b) => (b[metric.key] || 0) - (a[metric.key] || 0)).slice(0, 8)
  }, [data, metric])

  const barData = useMemo(() => {
    return peers.map(u => ({
      name: u.학교명.length > 6 ? u.학교명.slice(0, 5) + '…' : u.학교명,
      fullName: u.학교명,
      value: parseFloat(u[metric.key]) || 0,
      isHansei: u.학교명 === '한세대학교',
    }))
  }, [peers, metric])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          border: `1px solid ${metric.color}40`,
          borderRadius: 20, padding: '32px',
          width: '100%', maxWidth: 800, maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: `0 0 60px ${metric.color}30`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{metric.icon}</div>
            <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              {metric.analysis.title}
            </h2>
            <p style={{ color: metric.color, fontSize: 14 }}>{metric.analysis.summary}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: '#94a3b8', width: 36, height: 36, borderRadius: '50%',
            cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* 바 차트 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>경기 사립대 비교</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${metric.color}40`, borderRadius: 8 }}
                  formatter={(value, name, props) => [
                    value + metric.unit,
                    props.payload.fullName,
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}
                  fill={metric.color}
                  opacity={0.7}
                  label={false}
                />
                <ReferenceLine
                  y={parseFloat(hansei[metric.key])}
                  stroke={metric.color}
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  label={{ value: '한세대', fill: metric.color, fontSize: 11, position: 'insideTopRight' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 분석 포인트 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>주요 분석 포인트</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {metric.analysis.points.map(p => (
              <li key={p} style={{ display: 'flex', gap: 10, color: '#e2e8f0', fontSize: 13, lineHeight: 1.6 }}>
                <span style={{ color: metric.color, flexShrink: 0 }}>▸</span> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* 정책 연계 */}
        <div style={{
          background: `${metric.color}10`, border: `1px solid ${metric.color}25`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
        }}>
          <div style={{ color: metric.color, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>📋 정책 연계</div>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{metric.analysis.policy}</p>
        </div>

        {/* 권고사항 */}
        <div style={{
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>💡 전략 권고</div>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{metric.analysis.recommendation}</p>
        </div>
      </div>
    </div>
  )
}

export default function HanseiDashboard({ data }) {
  const [activeMetric, setActiveMetric] = useState(null)

  const hansei = useMemo(() => data.find(d => d.학교명 === '한세대학교'), [data])

  const ranks = useMemo(() => {
    const calc = (key, desc = true) => {
      const sorted = [...data]
        .filter(d => d[key] != null && !isNaN(d[key]))
        .sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
      const rank = sorted.findIndex(d => d.학교명 === '한세대학교') + 1
      return { rank: rank || 999, total: sorted.length }
    }
    return {
      취업률: calc('취업률'),
      신입생경쟁률: calc('신입생경쟁률'),
      교원확보율_정원: calc('교원확보율_정원'),
      학생1인당교육비: calc('학생1인당교육비'),
      학생1인당장학금: calc('학생1인당장학금'),
      기숙사수용율: calc('기숙사수용율'),
    }
  }, [data])

  const radarData = useMemo(() => {
    const MAX = { 취업률: 100, 신입생경쟁률: 30, 교원확보율_정원: 150, 학생1인당교육비: 40000, 학생1인당장학금: 8000000, 기숙사수용율: 100 }
    return METRICS_DEF.map(m => ({
      metric: m.label,
      한세대학교: Math.min(100, ((parseFloat(hansei?.[m.key]) || 0) / MAX[m.key]) * 100),
      전국평균: Math.min(100, ((data.reduce((acc, d) => acc + (parseFloat(d[m.key]) || 0), 0) / data.length) / MAX[m.key]) * 100),
    }))
  }, [hansei, data])

  const trendData = useMemo(() => {
    return METRICS_DEF.map(m => {
      const { rank, total } = ranks[m.key]
      return {
        name: m.label,
        순위백분율: Math.round((1 - rank / total) * 100),
        rank, total,
      }
    })
  }, [ranks])

  if (!hansei) {
    return <div style={{ padding: 40, color: '#ef4444' }}>한세대학교 데이터를 찾을 수 없습니다.</div>
  }

  const selectedMetricDef = activeMetric ? METRICS_DEF.find(m => m.key === activeMetric) : null

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(124,58,237,0.2))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 20, padding: '36px 40px', marginBottom: 32,
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ color: '#fca5a5', fontSize: 13, letterSpacing: 3, marginBottom: 8 }}>
            한세대학교 전용 대시보드
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, lineHeight: 1.2,
            background: 'linear-gradient(135deg, #fca5a5, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 12,
          }}>
            Hansei University<br />AX 경쟁력 현황
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            각 지표 카드를 클릭하면 상세 분석 자료를 확인할 수 있습니다
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '재학생', value: Number(hansei.재학생수).toLocaleString() + '명', color: '#60a5fa' },
            { label: '취업률', value: hansei.취업률 + '%', color: '#34d399' },
            { label: '경쟁률', value: hansei.신입생경쟁률 + ':1', color: '#f59e0b' },
            { label: '충원율', value: hansei.신입생충원율 + '%', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{
              background: `${s.color}15`, border: `1px solid ${s.color}40`,
              borderRadius: 12, padding: '12px 20px', textAlign: 'center', minWidth: 90,
            }}>
              <div style={{ color: '#64748b', fontSize: 11 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 지표 카드 그리드 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16, marginBottom: 32,
      }}>
        {METRICS_DEF.map(m => (
          <MetricCard
            key={m.key}
            metric={m}
            value={hansei[m.key]}
            rank={ranks[m.key].rank}
            total={ranks[m.key].total}
            isActive={activeMetric === m.key}
            onClick={() => setActiveMetric(activeMetric === m.key ? null : m.key)}
          />
        ))}
      </div>

      {/* 레이더 + 순위 차트 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 16, padding: '24px',
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>
            종합 역량 레이더 차트
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} tickCount={4} />
                <Radar name="한세대학교" dataKey="한세대학교" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
                <Radar name="전국평균" dataKey="전국평균" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="5 3" />
                <Legend wrapperStyle={{ fontSize: 12 }}
                  formatter={(val) => <span style={{ color: val === '한세대학교' ? '#ef4444' : '#94a3b8' }}>{val}</span>}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 8 }}
                  formatter={(val, name) => [val.toFixed(1) + '점(상대)', name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 16, padding: '24px',
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 16 }}>
            전국 순위 백분율 (높을수록 우수)
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => v + '%'} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Bar dataKey="순위백분율" radius={[0, 6, 6, 0]}
                  label={{ position: 'insideRight', fill: '#e2e8f0', fontSize: 11, formatter: v => v + '%' }}>
                  {trendData.map((entry, i) => {
                    const c = entry.순위백분율 >= 70 ? '#34d399' : entry.순위백분율 >= 50 ? '#60a5fa' : entry.순위백분율 >= 30 ? '#f59e0b' : '#ef4444'
                    return <rect key={i} fill={c} />
                  })}
                </Bar>
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 8 }}
                  formatter={(val, _, props) => [`상위 ${100 - val}% (${props.payload.rank}위/${props.payload.total}개교)`, props.payload.name]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 종합 평가 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 16, padding: '24px 32px',
      }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 18, marginBottom: 16 }}>종합 평가 요약</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { icon: '✅', label: '핵심 강점', color: '#34d399', items: ['취업률 71% (경기권 상위)', '경쟁률 11.7:1 안정', '충원율 99.8% 완전 충원', '장학금 431만원/인'] },
            { icon: '⚠️', label: '개선 과제', color: '#ef4444', items: ['기숙사 수용율 12.2% (최하위권)', '교원확보율 62.89%', '글로벌 학생 비율 0.9%'] },
            { icon: '🚀', label: '성장 기회', color: '#60a5fa', items: ['RISE 지역혁신 대학 지원', 'AI·디지털 전환 수요 급증', '경기 첨단산업 클러스터 연계'] },
            { icon: '🎯', label: '핵심 전략', color: '#a78bfa', items: ['기숙사 인프라 확충 긴급 추진', 'AI교육과정 전면 개편', '특성화 브랜드 강화'] },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}10`, border: `1px solid ${item.color}25`,
              borderRadius: 12, padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: 14 }}>{item.label}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {item.items.map(i => (
                  <li key={i} style={{ color: '#94a3b8', fontSize: 12, display: 'flex', gap: 6 }}>
                    <span style={{ color: item.color }}>·</span>{i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 모달 */}
      {activeMetric && selectedMetricDef && (
        <AnalysisPanel
          metric={selectedMetricDef}
          hansei={hansei}
          data={data}
          onClose={() => setActiveMetric(null)}
        />
      )}

      {/* AI 분석 어시스턴트 (인라인) */}
      <AskAI hansei={hansei} />
    </div>
  )
}
