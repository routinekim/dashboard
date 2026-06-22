import React, { useState, useMemo, useCallback } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import universitiesData from '@data/universities_data.json'

// ── 지표 정의 ──────────────────────────────────────────────────────────────
const AXIS_METRICS = [
  { key: 'employmentRate',        label: '취업률',            unit: '%' },
  { key: 'competitionRate',       label: '신입생 경쟁률',     unit: ':1' },
  { key: 'fillRate',              label: '신입생 충원율',     unit: '%' },
  { key: 'facultyRateByQuota',    label: '교원확보율(정원)',  unit: '%' },
  { key: 'facultyRateByEnrolled', label: '교원확보율(재학)', unit: '%' },
  { key: 'studentsPerFaculty',    label: '교원1인당 학생수',  unit: '명' },
  { key: 'scholarshipPerStudent', label: '1인당 장학금',      unit: '원' },
  { key: 'educationCostPerStudent',label:'1인당 교육비',      unit: '만원' },
  { key: 'dormitoryRate',         label: '기숙사 수용률',     unit: '%' },
  { key: 'fullTimeLectureRatio',  label: '전임교원 강의비율', unit: '%' },
]

const SIZE_METRICS = [
  { key: 'enrolled',       label: '재학생 수',  unit: '명' },
  { key: 'admissionQuota', label: '입학정원',   unit: '명' },
  { key: 'graduates',      label: '졸업생 수',  unit: '명' },
]

const RADAR_METRICS = [
  { key: 'employmentRate',         label: '취업률',     max: 100 },
  { key: 'facultyRateByQuota',     label: '교원확보율', max: 100 },
  { key: 'educationCostPerStudent',label: '교육비',     max: 25000 },
  { key: 'scholarshipPerStudent',  label: '장학금',     max: 7000000 },
  { key: 'dormitoryRate',          label: '기숙사',     max: 100 },
  { key: 'competitionRate',        label: '경쟁률',     max: 20 },
]

const COMPETITORS = ['안양대학교', '성결대학교', '협성대학교', '평택대학교', '한신대학교']

// 설립유형별 색상
const TYPE_COLORS = {
  '국립':     '#4da6ff',
  '사립':     '#00d4ff',
  '특별법국립': '#bf8fff',
  '특별법':   '#bf8fff',
}

const formatVal = (v, unit) => {
  if (unit === '원') return (v / 10000).toFixed(0) + '만원'
  if (unit === '만원') return v.toFixed(0) + '만원'
  return v + unit
}

// ── 커스텀 버블 Shape ─────────────────────────────────────────────────────
function BubbleShape({ cx, cy, payload, szExtent }) {
  if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null
  const [minSz, maxSz] = szExtent
  const t = maxSz > minSz ? (payload.sz - minSz) / (maxSz - minSz) : 0.5
  const r = 5 + Math.sqrt(t) * 16

  if (payload.isHansei) {
    const pts = Array.from({ length: 5 }, (_, i) => {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const ri = i % 2 === 0 ? r * 1.4 : r * 0.6
      return `${cx + ri * Math.cos(angle)},${cy + ri * Math.sin(angle)}`
    }).join(' ')
    return (
      <g>
        <circle cx={cx} cy={cy} r={r * 2.2} fill="rgba(255,50,50,0)" stroke="#ff3333" strokeWidth={1.5} opacity={0.5}>
          <animate attributeName="r" values={`${r * 1.8};${r * 3};${r * 1.8}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <polygon points={pts} fill="#ff3333" stroke="#ff6666" strokeWidth={1} />
      </g>
    )
  }

  const color = TYPE_COLORS[payload.estabType] || '#00d4ff'
  return (
    <circle
      cx={cx} cy={cy} r={r}
      fill={color} fillOpacity={0.55}
      stroke={color} strokeWidth={1} strokeOpacity={0.8}
    />
  )
}

// ── 커스텀 툴팁 ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, xKey, yKey, szKey }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const xMeta = AXIS_METRICS.find(m => m.key === xKey)
  const yMeta = AXIS_METRICS.find(m => m.key === yKey)
  const szMeta = SIZE_METRICS.find(m => m.key === szKey)
  return (
    <div style={{
      background: 'rgba(6,14,31,0.95)', border: '1px solid #00d4ff44',
      borderRadius: 8, padding: '10px 14px', minWidth: 180,
      boxShadow: '0 4px 20px rgba(0,212,255,0.2)', fontSize: 12
    }}>
      <div style={{ color: d.isHansei ? '#ff3333' : '#00d4ff', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>
        {d.isHansei ? '⭐ ' : ''}{d.name}
      </div>
      <div style={{ color: '#a0c4e8', lineHeight: 1.8 }}>
        <div>{xMeta?.label}: <span style={{ color: '#fff' }}>{formatVal(d.x, xMeta?.unit)}</span></div>
        <div>{yMeta?.label}: <span style={{ color: '#fff' }}>{formatVal(d.y, yMeta?.unit)}</span></div>
        <div>{szMeta?.label}: <span style={{ color: '#fff' }}>{d.sz?.toLocaleString()}명</span></div>
        <div>지역: <span style={{ color: '#fff' }}>{d.region}</span></div>
        <div>설립: <span style={{ color: TYPE_COLORS[d.estabType] || '#ccc' }}>{d.estabType}</span></div>
      </div>
    </div>
  )
}

// ── 레이더 커스텀 툴팁 ────────────────────────────────────────────────────
function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(6,14,31,0.95)', border: '1px solid #00d4ff44',
      borderRadius: 8, padding: '8px 12px', fontSize: 12
    }}>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value.toFixed(1)}점</strong>
        </div>
      ))}
    </div>
  )
}

// ── 메인 Stage1 ───────────────────────────────────────────────────────────
export default function Stage1() {
  const [xKey, setXKey] = useState('employmentRate')
  const [yKey, setYKey] = useState('competitionRate')
  const [szKey, setSzKey] = useState('enrolled')
  const [competitor, setCompetitor] = useState('안양대학교')

  // 버블 데이터 준비
  const { points, szExtent } = useMemo(() => {
    const raw = universitiesData
      .filter(u => u.campus === '본교')
      .filter(u => u[xKey] > 0 && u[yKey] > 0 && u[szKey] > 0)
      .map(u => ({
        x: u[xKey],
        y: u[yKey],
        sz: u[szKey],
        name: u.name,
        region: u.region,
        estabType: u.estabType,
        isHansei: u.name === '한세대학교',
      }))

    const szVals = raw.map(d => d.sz)
    return {
      points: raw,
      szExtent: [Math.min(...szVals), Math.max(...szVals)]
    }
  }, [xKey, yKey, szKey])

  // 레이더 데이터 준비 (정규화 0~100)
  const radarData = useMemo(() => {
    const hansei = universitiesData.find(u => u.name === '한세대학교' && u.campus === '본교')
    const comp = universitiesData.find(u => u.name === competitor && u.campus === '본교')
    if (!hansei || !comp) return []

    return RADAR_METRICS.map(m => ({
      metric: m.label,
      한세대: parseFloat(((hansei[m.key] / m.max) * 100).toFixed(1)),
      [competitor]: parseFloat(((comp[m.key] / m.max) * 100).toFixed(1)),
    }))
  }, [competitor])

  const xMeta = AXIS_METRICS.find(m => m.key === xKey)
  const yMeta = AXIS_METRICS.find(m => m.key === yKey)

  const selShape = useCallback(
    (props) => <BubbleShape {...props} szExtent={szExtent} />,
    [szExtent]
  )

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#060E1F', position: 'relative' }}>
      {/* 배경 격자 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,100,200,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,100,200,0.045) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px'
      }} />

      <style>{`
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .select-styled {
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.3);
          color: #e0f0ff; border-radius: 6px;
          padding: 6px 12px; font-size: 13px;
          outline: none; cursor: pointer;
        }
        .select-styled:hover { border-color: rgba(0,212,255,0.6); }
        .select-styled option { background: #0a1628; color: #e0f0ff; }
        .legend-dot {
          width: 10px; height: 10px; border-radius: 50%;
          display: inline-block; margin-right: 5px;
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, padding: '32px 24px 48px', maxWidth: 1400, margin: '0 auto' }}>

        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900,
            background: 'linear-gradient(135deg, #00d4ff, #4da6ff, #00d4ff)',
            backgroundSize: '200%', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 4s ease infinite',
            letterSpacing: 2, marginBottom: 8
          }}>
            전국 대학 포지셔닝 맵
          </h1>
          <p style={{ color: 'rgba(160,196,232,0.7)', fontSize: 14 }}>
            전국 {points.length}개 대학 데이터 기반 · 한세대학교 ⭐ 위치 강조
          </p>
        </div>

        {/* 컨트롤 패널 */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
          background: 'rgba(0,212,255,0.05)', borderRadius: 10,
          border: '1px solid rgba(0,212,255,0.15)', padding: '14px 20px',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#a0c4e8', fontSize: 12, whiteSpace: 'nowrap' }}>X축</span>
            <select className="select-styled" value={xKey} onChange={e => setXKey(e.target.value)}>
              {AXIS_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#a0c4e8', fontSize: 12, whiteSpace: 'nowrap' }}>Y축</span>
            <select className="select-styled" value={yKey} onChange={e => setYKey(e.target.value)}>
              {AXIS_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#a0c4e8', fontSize: 12, whiteSpace: 'nowrap' }}>버블 크기</span>
            <select className="select-styled" value={szKey} onChange={e => setSzKey(e.target.value)}>
              {SIZE_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          {/* 범례 */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12 }}>
            {Object.entries(TYPE_COLORS).filter(([k]) => !k.startsWith('특별법국')).map(([k, c]) => (
              <span key={k} style={{ color: '#a0c4e8', display: 'flex', alignItems: 'center' }}>
                <span className="legend-dot" style={{ background: c }} />
                {k}
              </span>
            ))}
            <span style={{ color: '#ff3333', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 4 }}>⭐</span> 한세대학교
            </span>
          </div>
        </div>

        {/* 버블 차트 */}
        <div style={{
          background: 'rgba(0,10,30,0.6)', borderRadius: 12,
          border: '1px solid rgba(0,212,255,0.1)',
          padding: '16px 8px 8px 0',
          marginBottom: 48,
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)'
        }}>
          <ResponsiveContainer width="100%" height={520}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,0.12)" />
              <XAxis
                dataKey="x" type="number" name={xMeta?.label}
                label={{ value: xMeta?.label, position: 'insideBottom', offset: -20, fill: '#a0c4e8', fontSize: 12 }}
                tick={{ fill: '#607899', fontSize: 11 }}
                tickFormatter={v => xMeta?.unit === '원' ? (v / 10000).toFixed(0) + '만' : v}
                domain={['auto', 'auto']}
              />
              <YAxis
                dataKey="y" type="number" name={yMeta?.label}
                label={{ value: yMeta?.label, angle: -90, position: 'insideLeft', offset: 10, fill: '#a0c4e8', fontSize: 12 }}
                tick={{ fill: '#607899', fontSize: 11 }}
                tickFormatter={v => yMeta?.unit === '원' ? (v / 10000).toFixed(0) + '만' : v}
                domain={['auto', 'auto']}
              />
              <ZAxis dataKey="sz" range={[40, 1600]} />
              <Tooltip
                content={<CustomTooltip xKey={xKey} yKey={yKey} szKey={szKey} />}
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(0,212,255,0.3)' }}
              />
              <Scatter
                data={points.filter(p => !p.isHansei)}
                shape={selShape}
              />
              <Scatter
                data={points.filter(p => p.isHansei)}
                shape={selShape}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 레이더 차트 섹션 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, marginBottom: 20
          }}>
            <div>
              <h2 style={{
                fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700,
                color: '#00d4ff', letterSpacing: 1, marginBottom: 4
              }}>
                실시간 대학 비교 분석
              </h2>
              <p style={{ color: 'rgba(160,196,232,0.7)', fontSize: 13 }}>
                6개 핵심 지표 레이더 차트
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#a0c4e8', fontSize: 13 }}>비교 대학:</span>
              <select className="select-styled" value={competitor} onChange={e => setCompetitor(e.target.value)}>
                {COMPETITORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{
            background: 'rgba(0,10,30,0.6)', borderRadius: 12,
            border: '1px solid rgba(0,212,255,0.1)',
            padding: '24px 8px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.4)'
          }}>
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={radarData} margin={{ top: 10, right: 60, bottom: 10, left: 60 }}>
                <PolarGrid stroke="rgba(0,100,200,0.25)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#a0c4e8', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90} domain={[0, 100]}
                  tick={{ fill: '#607899', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="한세대학교"
                  dataKey="한세대"
                  stroke="#ff3333" fill="#ff3333" fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name={competitor}
                  dataKey={competitor}
                  stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Legend
                  wrapperStyle={{ color: '#a0c4e8', fontSize: 13, paddingTop: 8 }}
                />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 간단 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12, marginTop: 24
        }}>
          {[
            { label: '비교 대학 수', value: points.length + '개', color: '#00d4ff' },
            { label: '한세대 취업률', value: '71%', color: '#ff3333' },
            { label: '한세대 경쟁률', value: '11.7:1', color: '#ff3333' },
            { label: '한세대 장학금', value: '431만원', color: '#ff3333' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(0,10,30,0.7)',
              border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: '14px 16px',
              textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(160,196,232,0.6)', fontSize: 11, marginBottom: 4 }}>{s.label}</div>
              <div style={{
                color: s.color, fontSize: 22, fontWeight: 700,
                textShadow: `0 0 12px ${s.color}88`
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
