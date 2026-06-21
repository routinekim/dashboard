import { useState, useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts'

const METRICS = [
  { key: '취업률', label: '취업률', unit: '%', max: 100 },
  { key: '교원확보율_정원', label: '교원확보율', unit: '%', max: 150 },
  { key: '학생1인당교육비', label: '1인당교육비', unit: '천원', max: 40000 },
  { key: '학생1인당장학금', label: '1인당장학금', unit: '원', max: 8000000 },
  { key: '기숙사수용율', label: '기숙사수용률', unit: '%', max: 100 },
  { key: '신입생경쟁률', label: '신입생경쟁률', unit: ':1', max: 30 },
]

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981']

const PRESET_UNIS = ['안양대학교', '성결대학교', '협성대학교', '평택대학교', '한신대학교']

function normalize(value, max) {
  if (value == null || isNaN(value)) return 0
  return Math.min(100, (parseFloat(value) / max) * 100)
}

export default function RadarComparison({ data }) {
  const universities = useMemo(() =>
    [...data].sort((a, b) => a.학교명.localeCompare(b.학교명, 'ko')),
    [data]
  )

  const [selected, setSelected] = useState(['한세대학교'])

  const radarData = useMemo(() => {
    return METRICS.map(m => {
      const entry = { metric: m.label }
      selected.forEach(name => {
        const uni = data.find(d => d.학교명 === name)
        if (uni) {
          entry[name] = normalize(uni[m.key], m.max)
          entry[`${name}_raw`] = uni[m.key]
        }
      })
      return entry
    })
  }, [selected, data])

  function toggle(name) {
    setSelected(prev => {
      if (prev.includes(name)) {
        if (prev.length === 1) return prev
        return prev.filter(n => n !== name)
      }
      if (prev.length >= 4) return prev
      return [...prev, name]
    })
  }

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const metricDef = METRICS.find(m => m.label === label)
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(124,58,237,0.4)',
        borderRadius: 10, padding: '10px 14px',
      }}>
        <div style={{ color: '#a78bfa', fontWeight: 700, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: 13 }}>
            {p.dataKey}: {p.payload[`${p.dataKey}_raw`]}{metricDef?.unit}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 16,
        padding: 24,
      }}>
        <h3 style={{ color: '#a78bfa', fontSize: 18, marginBottom: 4 }}>실시간 대학 비교 도구</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
          최대 4개 대학 선택 · 6개 지표 동시 비교
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* 선택 패널 */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
              선택된 대학 ({selected.length}/4)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {selected.map((name, i) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: `${COLORS[i]}20`,
                  border: `1px solid ${COLORS[i]}60`,
                  borderRadius: 8, padding: '6px 10px',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                  <span style={{ color: '#e2e8f0', fontSize: 13, flex: 1 }}>{name}</span>
                  {selected.length > 1 && (
                    <button onClick={() => toggle(name)} style={{
                      background: 'none', border: 'none', color: '#64748b',
                      cursor: 'pointer', fontSize: 14, padding: '0 2px',
                    }}>×</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>추천 비교 대학</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
              {PRESET_UNIS.map(name => {
                const idx = selected.indexOf(name)
                const isSelected = idx >= 0
                const isFull = selected.length >= 4 && !isSelected
                return (
                  <button
                    key={name}
                    onClick={() => !isFull && toggle(name)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: isSelected ? `1px solid ${COLORS[idx]}80` : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? `${COLORS[idx]}20` : 'rgba(255,255,255,0.03)',
                      color: isSelected ? COLORS[idx] : isFull ? '#374151' : '#94a3b8',
                      fontSize: 13,
                      cursor: isFull ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSelected && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[idx], flexShrink: 0 }} />
                    )}
                    {name}
                  </button>
                )
              })}
            </div>

            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>전체 대학 검색</div>
            <UniSearch universities={universities} selected={selected} onToggle={toggle} colors={COLORS} />
          </div>

          {/* 레이더 차트 */}
          <div style={{ flex: 1, minWidth: 300, height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <defs>
                  {selected.map((name, i) => (
                    <radialGradient key={name} id={`grad${i}`}>
                      <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0.1} />
                    </radialGradient>
                  ))}
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90} domain={[0, 100]}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickCount={5}
                />
                {selected.map((name, i) => (
                  <Radar
                    key={name}
                    name={name}
                    dataKey={name}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.25}
                    strokeWidth={2}
                    dot={{ fill: COLORS[i], r: 4 }}
                  />
                ))}
                <Legend
                  wrapperStyle={{ color: '#e2e8f0', fontSize: 13 }}
                  formatter={(val) => <span style={{ color: '#e2e8f0' }}>{val}</span>}
                />
                <Tooltip content={customTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 수치 비교 테이블 */}
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ color: '#64748b', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>지표</th>
                {selected.map((name, i) => (
                  <th key={name} style={{ color: COLORS[i], textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map(m => {
                const vals = selected.map(name => {
                  const uni = data.find(d => d.학교명 === name)
                  return uni ? parseFloat(uni[m.key]) || 0 : 0
                })
                const maxVal = Math.max(...vals)
                return (
                  <tr key={m.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ color: '#94a3b8', padding: '8px 12px' }}>{m.label}</td>
                    {selected.map((name, i) => {
                      const uni = data.find(d => d.학교명 === name)
                      const val = uni ? uni[m.key] : '-'
                      const isMax = vals[i] === maxVal && vals.filter(v => v === maxVal).length === 1
                      return (
                        <td key={name} style={{
                          textAlign: 'center', padding: '8px 12px',
                          color: isMax ? '#fbbf24' : '#e2e8f0',
                          fontWeight: isMax ? 700 : 400,
                        }}>
                          {val != null ? (m.key === '학생1인당장학금'
                            ? Number(val).toLocaleString() + '원'
                            : val + m.unit) : '-'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function UniSearch({ universities, selected, onToggle, colors }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() =>
    query.length >= 1
      ? universities.filter(u => u.학교명.includes(query))
      : universities.slice(0, 20),
    [universities, query]
  )

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="대학명 검색..."
        style={{
          width: '100%', padding: '8px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 8, color: '#e2e8f0', fontSize: 13,
          fontFamily: 'inherit', outline: 'none',
          marginBottom: 8,
        }}
      />
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {filtered.map(u => {
          const idx = selected.indexOf(u.학교명)
          const isSelected = idx >= 0
          return (
            <div
              key={u.학교명}
              onClick={() => onToggle(u.학교명)}
              style={{
                padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                background: isSelected ? `${colors[idx]}20` : 'transparent',
                color: isSelected ? colors[idx] : '#94a3b8',
                fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
            >
              {isSelected && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[idx], flexShrink: 0 }} />
              )}
              {u.학교명}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ color: '#475569', fontSize: 13, padding: '8px 10px' }}>검색 결과 없음</div>
        )}
      </div>
    </div>
  )
}
