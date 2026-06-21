import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  LineChart, Line,
} from 'recharts'

const COLORS = ['#ef4444', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#f472b6']

function fmt(v, unit = '') {
  if (v == null || isNaN(v)) return '-'
  if (unit === '원') return Number(v).toLocaleString() + '원'
  if (unit === '천원') return Number(v).toLocaleString() + '천원'
  return v + unit
}

function Section({ num, title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: 16, padding: '28px 32px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0,
        }}>{num}</div>
        <h2 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function StatCard({ label, value, rank, total, color = '#7c3aed', note }) {
  return (
    <div style={{
      background: `${color}15`,
      border: `1px solid ${color}40`,
      borderRadius: 12, padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div>
      <div style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800 }}>{value}</div>
      {rank && (
        <div style={{ color: color, fontSize: 12, fontWeight: 600 }}>
          전체 {total}개교 중 {rank}위
        </div>
      )}
      {note && <div style={{ color: '#64748b', fontSize: 11 }}>{note}</div>}
    </div>
  )
}

export default function ReportPage({ data }) {
  const [printMode, setPrintMode] = useState(false)

  const hansei = useMemo(() => data.find(d => d.학교명 === '한세대학교'), [data])

  // 동일 지역(경기) + 동일 유형(대학교) + 사립 필터
  const peers = useMemo(() => {
    if (!hansei) return []
    return data.filter(d =>
      d.지역 === '경기' &&
      d.학교유형 === '대학교' &&
      d.설립유형 === '사립' &&
      d.학교명 !== '한세대학교' &&
      d.취업률 != null && d.재학생수 != null
    ).sort((a, b) => (b.취업률 || 0) - (a.취업률 || 0)).slice(0, 5)
  }, [data, hansei])

  const compareGroup = useMemo(() => [hansei, ...peers].filter(Boolean), [hansei, peers])

  // 전체 순위 계산
  const ranks = useMemo(() => {
    const calc = (key, desc = true) => {
      const sorted = [...data]
        .filter(d => d[key] != null && !isNaN(d[key]))
        .sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
      const rank = sorted.findIndex(d => d.학교명 === '한세대학교') + 1
      return { rank, total: sorted.length }
    }
    return {
      취업률: calc('취업률'),
      경쟁률: calc('신입생경쟁률'),
      교육비: calc('학생1인당교육비'),
      장학금: calc('학생1인당장학금'),
      기숙사: calc('기숙사수용율'),
      교원확보율: calc('교원확보율_정원'),
    }
  }, [data])

  const radarData = useMemo(() => {
    const METRICS = [
      { key: '취업률', label: '취업률', max: 100 },
      { key: '교원확보율_정원', label: '교원확보율', max: 150 },
      { key: '학생1인당교육비', label: '1인당교육비', max: 40000 },
      { key: '학생1인당장학금', label: '1인당장학금', max: 8000000 },
      { key: '기숙사수용율', label: '기숙사수용률', max: 100 },
      { key: '신입생경쟁률', label: '경쟁률', max: 30 },
    ]
    return METRICS.map(m => {
      const entry = { metric: m.label }
      compareGroup.forEach(u => {
        entry[u.학교명] = Math.min(100, ((parseFloat(u[m.key]) || 0) / m.max) * 100)
      })
      return entry
    })
  }, [compareGroup])

  const barData = useMemo(() => {
    return [
      { name: '취업률(%)', ...Object.fromEntries(compareGroup.map(u => [u.학교명, u.취업률])) },
      { name: '교원확보율(%)', ...Object.fromEntries(compareGroup.map(u => [u.학교명, u.교원확보율_정원])) },
      { name: '기숙사수용율(%)', ...Object.fromEntries(compareGroup.map(u => [u.학교명, u.기숙사수용율])) },
      { name: '신입생충원율(%)', ...Object.fromEntries(compareGroup.map(u => [u.학교명, u.신입생충원율])) },
    ]
  }, [compareGroup])

  if (!hansei) {
    return <div style={{ padding: 40, color: '#ef4444' }}>한세대학교 데이터를 찾을 수 없습니다.</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 표지 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))',
        border: '1px solid rgba(124,58,237,0.4)',
        borderRadius: 20, padding: '48px 40px', marginBottom: 32, textAlign: 'center',
      }}>
        <div style={{ color: '#a78bfa', fontSize: 13, letterSpacing: 4, marginBottom: 16 }}>
          2025 대학알리미 공시 데이터 기반
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 900,
          background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 16, lineHeight: 1.3,
        }}>
          한세대학교 AX 경쟁력<br />종합 분석 보고서
        </h1>
        <div style={{ color: '#64748b', fontSize: 15 }}>
          동일 지역·유형·규모 대학 비교 분석 | 교육부 2025년 대학혁신 정책 연계
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          {[
            ['분석 대상', '239개 대학'],
            ['비교 대상', '경기 사립대 5개교'],
            ['데이터 기준', '2025년 공시'],
            ['작성일', '2026년 6월'],
          ].map(([k, v]) => (
            <div key={k} style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 10,
              padding: '12px 20px', textAlign: 'center',
            }}>
              <div style={{ color: '#64748b', fontSize: 11 }}>{k}</div>
              <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 섹션 1: 한세대 기본 현황 */}
      <Section num="1" title="한세대학교 기본 현황 (2025년)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          <StatCard label="재학생 수" value={Number(hansei.재학생수).toLocaleString() + '명'} color="#7c3aed" />
          <StatCard label="입학정원" value={Number(hansei.입학정원).toLocaleString() + '명'} color="#4f46e5" />
          <StatCard label="전임교원 수" value={Number(hansei.전임교원수).toLocaleString() + '명'} color="#0891b2" />
          <StatCard label="설립·지역" value="사립 · 경기" color="#059669" />
          <StatCard label="학교유형" value={hansei.학교유형} color="#d97706" />
          <StatCard label="외국인 학생" value={Number(hansei.외국인학생수).toLocaleString() + '명'} color="#db2777" />
        </div>
        <div style={{
          marginTop: 20, padding: '16px 20px',
          background: 'rgba(124,58,237,0.1)', borderRadius: 12,
          border: '1px solid rgba(124,58,237,0.2)',
          color: '#94a3b8', fontSize: 14, lineHeight: 1.8,
        }}>
          한세대학교는 경기도 소재 사립 4년제 종합대학으로, 재학생 약 2,509명 규모의 중소형 대학입니다.
          신입생 충원율 99.8%로 사실상 완전 충원을 달성하고 있으며, 신입생 경쟁률 11.7:1은 경기권 사립대 중
          상위권에 해당합니다. 2025년 기준 전임교원 100명이 재직 중입니다.
        </div>
      </Section>

      {/* 섹션 2: 핵심 지표 전국 순위 */}
      <Section num="2" title="핵심 지표 전국 순위">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
          <StatCard
            label="취업률" value={hansei.취업률 + '%'}
            rank={ranks.취업률.rank} total={ranks.취업률.total}
            color="#34d399"
          />
          <StatCard
            label="신입생 경쟁률" value={hansei.신입생경쟁률 + ':1'}
            rank={ranks.경쟁률.rank} total={ranks.경쟁률.total}
            color="#60a5fa"
          />
          <StatCard
            label="학생1인당 교육비" value={Number(hansei.학생1인당교육비).toLocaleString() + '천원'}
            rank={ranks.교육비.rank} total={ranks.교육비.total}
            color="#f59e0b"
          />
          <StatCard
            label="1인당 장학금" value={Math.round(hansei.학생1인당장학금 / 10000) + '만원'}
            rank={ranks.장학금.rank} total={ranks.장학금.total}
            color="#a78bfa"
          />
          <StatCard
            label="기숙사 수용율" value={hansei.기숙사수용율 + '%'}
            rank={ranks.기숙사.rank} total={ranks.기숙사.total}
            color="#f472b6" note="개선 필요 영역"
          />
          <StatCard
            label="교원 확보율" value={hansei.교원확보율_정원 + '%'}
            rank={ranks.교원확보율.rank} total={ranks.교원확보율.total}
            color="#06b6d4"
          />
        </div>
        <div style={{
          padding: '14px 20px',
          background: 'rgba(52,211,153,0.1)', borderRadius: 10,
          border: '1px solid rgba(52,211,153,0.2)',
          color: '#94a3b8', fontSize: 14, lineHeight: 1.8,
        }}>
          <strong style={{ color: '#34d399' }}>강점:</strong> 취업률 71%는 전국 {ranks.취업률.total}개교 중 {ranks.취업률.rank}위로,
          경기 사립대 평균 대비 높은 수준입니다. 신입생 경쟁률 11.7:1 역시 상위권에 해당하여 학령인구 감소에도
          안정적인 수요를 확보하고 있습니다.
          <br />
          <strong style={{ color: '#f59e0b' }}>과제:</strong> 기숙사 수용율 12.2%는 전국 평균(20~30%) 대비 낮아,
          학생 생활환경 개선이 필요한 영역으로 파악됩니다.
        </div>
      </Section>

      {/* 섹션 3: 경기 사립대 비교 */}
      <Section num="3" title={`경기 사립 4년제 대학 비교 (한세대 + 상위 5개교)`}>
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(124,58,237,0.3)' }}>
                {['대학명', '취업률', '경쟁률', '교원확보율', '1인당교육비', '장학금(만원)', '기숙사수용율', '충원율'].map(h => (
                  <th key={h} style={{ color: '#94a3b8', padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareGroup.map((u, i) => (
                <tr key={u.학교명} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: u.학교명 === '한세대학교' ? 'rgba(239,68,68,0.1)' : 'transparent',
                }}>
                  <td style={{
                    padding: '10px 12px', fontWeight: u.학교명 === '한세대학교' ? 700 : 400,
                    color: u.학교명 === '한세대학교' ? '#fca5a5' : '#e2e8f0',
                  }}>{u.학교명}</td>
                  {[
                    u.취업률 + '%',
                    u.신입생경쟁률 + ':1',
                    u.교원확보율_정원 + '%',
                    Number(u.학생1인당교육비).toLocaleString() + '천원',
                    Math.round(u.학생1인당장학금 / 10000) + '만원',
                    u.기숙사수용율 + '%',
                    u.신입생충원율 + '%',
                  ].map((v, vi) => (
                    <td key={vi} style={{ padding: '10px 12px', textAlign: 'center', color: '#cbd5e1' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 레이더 차트 비교 */}
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} tickCount={4} />
              {compareGroup.map((u, i) => (
                <Radar
                  key={u.학교명}
                  name={u.학교명}
                  dataKey={u.학교명}
                  stroke={i === 0 ? '#ef4444' : COLORS[i]}
                  fill={i === 0 ? '#ef4444' : COLORS[i]}
                  fillOpacity={i === 0 ? 0.35 : 0.15}
                  strokeWidth={i === 0 ? 3 : 1.5}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }}
                formatter={(val) => <span style={{ color: val === '한세대학교' ? '#ef4444' : '#e2e8f0' }}>{val}</span>}
              />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 8 }}
                labelStyle={{ color: '#a78bfa' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* 섹션 4: 지표별 바 차트 */}
      <Section num="4" title="주요 지표 비교 시각화">
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} />
              {compareGroup.map((u, i) => (
                <Bar
                  key={u.학교명}
                  dataKey={u.학교명}
                  fill={i === 0 ? '#ef4444' : COLORS[i]}
                  opacity={i === 0 ? 1 : 0.7}
                  radius={[0, 4, 4, 0]}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }}
                formatter={(val) => <span style={{ color: val === '한세대학교' ? '#ef4444' : '#e2e8f0' }}>{val}</span>}
              />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 8 }}
                labelStyle={{ color: '#a78bfa' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* 섹션 5: 교육부 2025 대학혁신 정책 연계 */}
      <Section num="5" title="교육부 2025년 대학혁신 정책 연계 분석">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {[
            {
              policy: '① 지역혁신 중심 대학지원체계(RISE)',
              color: '#7c3aed',
              status: '기회',
              content: '경기도 소재 대학으로 RISE 정책의 핵심 수혜 대상. 지역 산업체와의 연계 강화 및 취업률 71% 유지를 통한 경쟁력 입증이 선정 가능성을 높임.',
            },
            {
              policy: '② 글로컬 대학 30',
              color: '#0891b2',
              status: '도전 과제',
              content: '글로컬 대학 선정을 위해서는 글로벌 역량 지표 강화 필요. 외국인 학생 22명(0.9%) 수준은 확대 여지가 있음. 국제협력 프로그램 확충 시급.',
            },
            {
              policy: '③ 대학 기본역량 진단',
              color: '#059669',
              status: '안정',
              content: '신입생 충원율 99.8%, 교원확보율 62.89%는 기본역량 진단 기준 충족 수준. 취업률 강점을 유지하되, 기숙사 수용율 개선이 필요.',
            },
            {
              policy: '④ 디지털·AI 혁신 지원',
              color: '#d97706',
              status: '성장 기회',
              content: '교육부 AX(Academic Transformation) 정책 기조 하에 AI 교육 커리큘럼 도입 및 디지털 전환 선도 사례 구축이 대학 브랜드 가치 제고에 핵심.',
            },
          ].map(item => (
            <div key={item.policy} style={{
              background: `${item.color}10`,
              border: `1px solid ${item.color}30`,
              borderRadius: 12, padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ color: item.color, fontSize: 13, fontWeight: 700 }}>{item.policy}</div>
                <span style={{
                  background: `${item.color}20`, color: item.color,
                  padding: '2px 8px', borderRadius: 20, fontSize: 11,
                }}>{item.status}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{item.content}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 섹션 6: SWOT 분석 */}
      <Section num="6" title="한세대학교 SWOT 분석">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              type: 'S', label: '강점 (Strengths)', color: '#34d399',
              items: [
                '취업률 71% — 경기권 사립대 상위권',
                '신입생 경쟁률 11.7:1 — 안정적 수요 확보',
                '충원율 99.8% — 사실상 완전 충원',
                '1인당 장학금 431만원 — 학생 지원 우수',
                '종교 기반 특색 있는 교육 정체성',
              ],
            },
            {
              type: 'W', label: '약점 (Weaknesses)', color: '#f87171',
              items: [
                '기숙사 수용율 12.2% — 전국 최하위권',
                '교원확보율 62.89% — 개선 필요',
                '외국인 학생 비율 0.9% — 글로벌화 미흡',
                '중소형 규모로 인한 학과 다양성 제한',
                '1인당 교육비 1,344만원 — 중위권 수준',
              ],
            },
            {
              type: 'O', label: '기회 (Opportunities)', color: '#60a5fa',
              items: [
                'RISE 정책으로 지역대학 지원 확대',
                'AI·디지털 전환 수요 급증',
                '경기도 첨단산업 클러스터 인접',
                '소규모 대학 특색화 정책 기조',
                '글로컬 대학 30 선정 기회',
              ],
            },
            {
              type: 'T', label: '위협 (Threats)', color: '#fbbf24',
              items: [
                '학령인구 감소 가속화 (2030년까지 20% 감소)',
                '수도권 대형대학과의 경쟁 심화',
                '전문대학 및 온라인 대학 대체 위협',
                '정부 대학 구조조정 압박 지속',
                '취업 시장 AI 자동화로 인한 변화',
              ],
            },
          ].map(q => (
            <div key={q.type} style={{
              background: `${q.color}10`,
              border: `1px solid ${q.color}30`,
              borderRadius: 12, padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: q.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 16, color: '#0f172a',
                }}>{q.type}</div>
                <span style={{ color: q.color, fontWeight: 700, fontSize: 14 }}>{q.label}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.items.map(item => (
                  <li key={item} style={{ color: '#94a3b8', fontSize: 13, display: 'flex', gap: 8 }}>
                    <span style={{ color: q.color }}>▸</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* 섹션 7: 전략 제언 */}
      <Section num="7" title="AX 경쟁력 강화 전략 제언">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              priority: '긴급', color: '#ef4444',
              title: '기숙사 수용 확충',
              content: '기숙사 수용율 12.2%는 학생 유치 경쟁력의 핵심 약점입니다. 단기적으로 주변 공공 기숙사 협약, 중기적으로 생활관 신증축(목표: 30% 이상)이 필요합니다. RISE 사업비 연계 추진을 권고합니다.',
            },
            {
              priority: '단기(1~2년)', color: '#f59e0b',
              title: 'AI·디지털 교육과정 전면 개편',
              content: '교육부 AX 정책 기조에 맞춰 전 학과 AI 기초 과목 의무화, 마이크로디그리 도입, 산학협력 프로젝트 확대를 통해 취업률을 75% 이상으로 견인할 수 있습니다.',
            },
            {
              priority: '중기(2~3년)', color: '#34d399',
              title: '글로벌 역량 지표 개선',
              content: '외국인 학생 비율을 2027년까지 3%로 확대하고, 영어 강의 비율 30% 확보, 해외 자매대학 10개교 이상 MOU 체결을 통해 글로컬 대학 지원 자격을 갖추어야 합니다.',
            },
            {
              priority: '지속', color: '#60a5fa',
              title: '특성화 브랜드 강화',
              content: '종교·문화·음악 분야의 특성화 강점을 콘텐츠화하고, 취업률 강점과 결합한 "한세형 AX 모델"을 구축하여 대학 브랜드 차별화를 도모합니다.',
            },
          ].map(s => (
            <div key={s.title} style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
              background: `${s.color}08`, border: `1px solid ${s.color}25`,
              borderRadius: 12, padding: '16px 20px',
            }}>
              <span style={{
                background: s.color, color: '#0f172a',
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                flexShrink: 0, height: 'fit-content', marginTop: 2,
              }}>{s.priority}</span>
              <div>
                <div style={{ color: s.color, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8 }}>{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 섹션 8: 결론 */}
      <Section num="8" title="종합 결론">
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))',
          borderRadius: 12, padding: '24px 28px',
          color: '#94a3b8', fontSize: 14, lineHeight: 2,
        }}>
          <p>
            한세대학교는 2025년 기준 <strong style={{ color: '#34d399' }}>취업률 71%, 신입생 경쟁률 11.7:1, 충원율 99.8%</strong>라는
            핵심 지표에서 경기권 사립대 중 강점을 보유한 대학입니다. 학령인구 감소라는 구조적 위협 속에서도
            안정적인 수요 기반을 유지하고 있다는 점은 주목할 만합니다.
          </p>
          <br />
          <p>
            그러나 <strong style={{ color: '#f87171' }}>기숙사 수용율(12.2%)과 교원확보율(62.89%)</strong>은 전국 기준
            개선이 필요한 취약 영역입니다. 교육부의 RISE 정책, 글로컬 대학 30, AX 혁신 지원 사업을 전략적으로
            활용하여 약점을 보완하고 강점을 극대화하는 <strong style={{ color: '#a78bfa' }}>"한세형 AX 모델"</strong>을
            구축하는 것이 중장기 경쟁력 확보의 핵심 과제입니다.
          </p>
          <br />
          <p>
            특히 AI·디지털 전환 역량과 종교·문화 특성화를 결합한 차별화 전략은 대형 국립대와의 정면 경쟁을 피하면서
            틈새 시장에서 지속 가능한 성장을 가능하게 할 것입니다.
          </p>
        </div>
      </Section>

      <div style={{ textAlign: 'center', color: '#475569', fontSize: 12, paddingBottom: 32 }}>
        본 보고서는 2025년 대학알리미 공시 데이터를 기반으로 작성되었습니다. · 한세대학교 AX 경쟁력 분석 대시보드
      </div>
    </div>
  )
}
