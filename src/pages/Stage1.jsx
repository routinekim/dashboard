import React, { useState, useMemo, useCallback } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import universitiesData from '../../universities_data.json'
import hanseiReportData from '../../hansei_report_data.json'

const AXIS_METRICS = [
  { key: 'employmentRate', label: '취업률', unit: '%' },
  { key: 'competitionRate', label: '신입생 경쟁률', unit: ':1' },
  { key: 'fillRate', label: '신입생 충원율', unit: '%' },
  { key: 'facultyRateByQuota', label: '교원확보율(정원)', unit: '%' },
  { key: 'facultyRateByEnrolled', label: '교원확보율(재학)', unit: '%' },
  { key: 'studentsPerFaculty', label: '교원1인당 학생수', unit: '명' },
  { key: 'scholarshipPerStudent', label: '1인당 장학금', unit: '원', divisor: 10000 },
  { key: 'educationCostPerStudent', label: '1인당 교육비', unit: '만원' },
  { key: 'dormitoryRate', label: '기숙사 수용률', unit: '%' },
  { key: 'fullTimeLectureRatio', label: '전임교원 강의비율', unit: '%' },
]

const SIZE_METRICS = [
  { key: 'enrolled', label: '재학생 수' },
  { key: 'admissionQuota', label: '입학정원' },
  { key: 'graduates', label: '졸업생 수' },
]

const TYPE_COLORS = {
  '사립': '#8b5cf6',
  '국립': '#06b6d4',
  '특별법국립': '#f59e0b',
  '특별법법인': '#10b981',
  '국립대법인': '#3b82f6',
  '공립': '#f97316',
}

const RADAR_METRICS = [
  { key: 'employmentRate', label: '취업률', unit: '%', max: 100 },
  { key: 'facultyRateByQuota', label: '교원확보율', unit: '%', max: 150 },
  { key: 'educationCostPerStudent', label: '1인당교육비', unit: '만원', max: 30000 },
  { key: 'scholarshipPerStudent', label: '장학금', unit: '만원', max: 6000000 },
  { key: 'dormitoryRate', label: '기숙사수용률', unit: '%', max: 100 },
  { key: 'competitionRate', label: '경쟁률', unit: ':1', max: 20 },
]

const RADAR_COLORS = ['#00d4ff', '#8b5cf6', '#ff6b6b', '#ffd93d', '#6bcb77', '#ff8c42']

const STYLES = `
  @keyframes pulseStar {
    0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 12px #ff4444; }
    50% { transform: scale(1.4); opacity: 0.8; box-shadow: 0 0 24px #ff4444, 0 0 48px #ff444488; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`

function getValue(d, metric) {
  const m = AXIS_METRICS.find(a => a.key === metric)
  if (!m) return d[metric] || 0
  const raw = d[metric] || 0
  if (m.divisor) return raw / m.divisor
  return raw
}

function formatValue(val, metricKey) {
  const m = AXIS_METRICS.find(a => a.key === metricKey)
  if (!m) return val
  if (m.divisor) return `${(val / 1).toFixed(0)}만원`
  return `${val}${m.unit}`
}

function CustomBubbleDot(props) {
  const { cx, cy, payload, xMetric, yMetric } = props
  const isHansei = payload.name === '한세대학교'

  if (isHansei) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="rgba(255,68,68,0.15)" style={{ animation: 'pulseStar 2s ease-in-out infinite' }} />
        <circle cx={cx} cy={cy} r={8} fill="#ff4444" stroke="#fff" strokeWidth={2} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="10" fontWeight="bold">★</text>
      </g>
    )
  }

  return null
}

export default function Stage1() {
  const [xMetric, setXMetric] = useState('employmentRate')
  const [yMetric, setYMetric] = useState('competitionRate')
  const [sizeMetric, setSizeMetric] = useState('enrolled')
  const [hoveredUniv, setHoveredUniv] = useState(null)
  const [radarSelected, setRadarSelected] = useState(['한세대학교', '안양대학교', '성결대학교', '협성대학교', '평택대학교', '한신대학교'])

  const validData = useMemo(() => {
    return universitiesData.filter(d =>
      d[xMetric] != null && d[yMetric] != null && d[sizeMetric] != null &&
      d[xMetric] > 0 && d[yMetric] > 0
    )
  }, [xMetric, yMetric, sizeMetric])

  const groupedData = useMemo(() => {
    const groups = {}
    validData.forEach(d => {
      const type = d.estabType || '기타'
      if (!groups[type]) groups[type] = []
      const xVal = getValue(d, xMetric)
      const yVal = getValue(d, yMetric)
      const sz = d[sizeMetric] || 100
      groups[type].push({ ...d, xVal, yVal, sz })
    })
    return groups
  }, [validData, xMetric, yMetric, sizeMetric])

  const xLabel = AXIS_METRICS.find(m => m.key === xMetric)?.label || ''
  const yLabel = AXIS_METRICS.find(m => m.key === yMetric)?.label || ''

  const radarAllUnivs = useMemo(() => {
    const competitorNames = hanseiReportData.competitors.map(c => c.name)
    const allNames = ['한세대학교', ...competitorNames]
    return allNames
  }, [])

  const radarData = useMemo(() => {
    const getUniData = (name) => {
      if (name === '한세대학교') return hanseiReportData.hansei
      return hanseiReportData.competitors.find(c => c.name === name) || null
    }

    return RADAR_METRICS.map(metric => {
      const obj = { metric: metric.label }
      radarSelected.forEach(name => {
        const uni = getUniData(name)
        if (!uni) { obj[name] = 0; return }
        const raw = uni[metric.key] || 0
        const val = metric.key === 'scholarshipPerStudent' ? raw / 10000 : raw
        obj[name] = Math.round((val / (metric.key === 'scholarshipPerStudent' ? metric.max / 10000 : metric.max)) * 100)
      })
      return obj
    })
  }, [radarSelected])

  const CustomTooltip = useCallback(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    const xM = AXIS_METRICS.find(m => m.key === xMetric)
    const yM = AXIS_METRICS.find(m => m.key === yMetric)
    const szM = SIZE_METRICS.find(m => m.key === sizeMetric)
    const isHansei = d.name === '한세대학교'

    return (
      <div style={{
        background: isHansei ? 'rgba(255,68,68,0.15)' : 'rgba(10,10,26,0.95)',
        border: `1px solid ${isHansei ? '#ff4444' : 'rgba(139,92,246,0.4)'}`,
        borderRadius: '12px', padding: '14px 18px',
        backdropFilter: 'blur(20px)',
        boxShadow: isHansei ? '0 8px 32px rgba(255,68,68,0.2)' : '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: '200px',
      }}>
        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px', color: isHansei ? '#ff4444' : '#fff' }}>
          {isHansei ? '★ ' : ''}{d.name}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
          {d.region} · {d.estabType}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '12px', color: '#a78bfa' }}>
            {xM?.label}: <span style={{ color: '#fff' }}>{d.xVal?.toFixed(1)}{xM?.unit}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#06b6d4' }}>
            {yM?.label}: <span style={{ color: '#fff' }}>{d.yVal?.toFixed(1)}{yM?.unit}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>
            {szM?.label}: <span style={{ color: '#fff' }}>{d[sizeMetric]?.toLocaleString()}명</span>
          </div>
        </div>
      </div>
    )
  }, [xMetric, yMetric, sizeMetric])

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '8px',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '160px',
  }

  const labelStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '20px', padding: '6px 16px',
          fontSize: '11px', color: '#a78bfa', letterSpacing: '2px',
          marginBottom: '16px',
        }}>전국 대학 포지셔닝 분석</div>
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #06b6d4 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradientShift 4s ease infinite',
          marginBottom: '8px',
        }}>전국 239개 대학 포지셔닝 맵</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          2025년 대학알리미 공시 데이터 기반 · 한세대학교(★) 위치 강조
        </p>
      </div>

      {/* Bubble Chart Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '16px', padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end',
      }}>
        <div>
          <div style={labelStyle}>X축 지표</div>
          <select value={xMetric} onChange={e => setXMetric(e.target.value)} style={selectStyle}>
            {AXIS_METRICS.map(m => (
              <option key={m.key} value={m.key} style={{ background: '#1a1a2e' }}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Y축 지표</div>
          <select value={yMetric} onChange={e => setYMetric(e.target.value)} style={selectStyle}>
            {AXIS_METRICS.map(m => (
              <option key={m.key} value={m.key} style={{ background: '#1a1a2e' }}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>버블 크기</div>
          <select value={sizeMetric} onChange={e => setSizeMetric(e.target.value)} style={selectStyle}>
            {SIZE_METRICS.map(m => (
              <option key={m.key} value={m.key} style={{ background: '#1a1a2e' }}>{m.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{type}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff' }}>★</div>
            <span style={{ fontSize: '11px', color: '#ff4444', fontWeight: '700' }}>한세대학교</span>
          </div>
        </div>
      </div>

      {/* Bubble Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '20px', padding: '24px',
        marginBottom: '48px',
      }}>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="xVal"
              type="number"
              name={xLabel}
              label={{ value: xLabel, position: 'insideBottom', offset: -20, fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              dataKey="yVal"
              type="number"
              name={yLabel}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <ZAxis dataKey="sz" range={[40, 600]} />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(groupedData).map(([type, data]) => (
              <Scatter
                key={type}
                name={type}
                data={data}
                fill={TYPE_COLORS[type] || '#888'}
                fillOpacity={0.7}
                shape={(props) => {
                  const { cx, cy, r, payload } = props
                  const isHansei = payload.name === '한세대학교'
                  if (isHansei) {
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={r * 1.5} fill="rgba(255,68,68,0.1)" style={{ animation: 'pulseStar 2s ease-in-out infinite' }} />
                        <circle cx={cx} cy={cy} r={r} fill="#ff4444" stroke="#fff" strokeWidth={2} fillOpacity={0.9} />
                        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={r * 0.8} fontWeight="bold">★</text>
                        <text x={cx + r + 4} y={cy} textAnchor="start" dominantBaseline="middle" fill="#ff4444" fontSize={11} fontWeight="700">한세대</text>
                      </g>
                    )
                  }
                  return <circle cx={cx} cy={cy} r={r} fill={TYPE_COLORS[type] || '#888'} fillOpacity={0.65} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart Section */}
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 32px)',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #fff, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>실시간 대학 비교 레이더</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>비교 대학을 선택하세요 (경쟁 대학군 기준 정규화)</p>
      </div>

      {/* Radar Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '16px', padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginRight: '8px' }}>비교 대학 선택:</span>
        {radarAllUnivs.map((name, idx) => {
          const isSelected = radarSelected.includes(name)
          const isHansei = name === '한세대학교'
          return (
            <button
              key={name}
              onClick={() => {
                if (isHansei) return
                setRadarSelected(prev =>
                  prev.includes(name)
                    ? prev.filter(n => n !== name)
                    : [...prev, name]
                )
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid ${isSelected ? RADAR_COLORS[idx] : 'rgba(255,255,255,0.1)'}`,
                background: isSelected ? `${RADAR_COLORS[idx]}22` : 'transparent',
                color: isSelected ? RADAR_COLORS[idx] : 'rgba(255,255,255,0.4)',
                fontSize: '12px', cursor: isHansei ? 'default' : 'pointer',
                transition: 'all 0.2s',
                fontWeight: isHansei ? '700' : '400',
              }}
            >
              {isHansei ? '★ ' : ''}{name}
            </button>
          )
        })}
      </div>

      {/* Radar Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '20px', padding: '24px',
      }}>
        <ResponsiveContainer width="100%" height={460}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
              tickCount={5}
            />
            {radarSelected.map((name, idx) => (
              <Radar
                key={name}
                name={name}
                dataKey={name}
                stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                fillOpacity={name === '한세대학교' ? 0.3 : 0.1}
                strokeWidth={name === '한세대학교' ? 3 : 1.5}
              />
            ))}
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => (
                <span style={{
                  color: entry.color,
                  fontSize: '12px',
                  fontWeight: value === '한세대학교' ? '700' : '400',
                }}>
                  {value === '한세대학교' ? '★ ' : ''}{value}
                </span>
              )}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,26,0.95)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${value}점`, name]}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            * 각 지표를 비교군 최댓값 기준으로 100점 정규화 표시 · 점수가 높을수록 우수
          </p>
        </div>
      </div>
    </div>
  )
}
