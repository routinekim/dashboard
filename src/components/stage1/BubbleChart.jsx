import { useState, useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'

const COLOR_MAP = {
  '국립': '#34d399',
  '사립': '#60a5fa',
  '특별법국립': '#f472b6',
  '특별법사립': '#fb923c',
}

const AXIS_METRICS = [
  { key: '취업률', label: '취업률', unit: '%', fmt: v => v + '%' },
  { key: '신입생경쟁률', label: '신입생 경쟁률', unit: ':1', fmt: v => v + ':1' },
  { key: '신입생충원율', label: '신입생 충원율', unit: '%', fmt: v => v + '%' },
  { key: '교원확보율_정원', label: '교원확보율(정원)', unit: '%', fmt: v => v + '%' },
  { key: '교원확보율_재학', label: '교원확보율(재학)', unit: '%', fmt: v => v + '%' },
  { key: '교원1인당학생수', label: '교원1인당 학생수', unit: '명', fmt: v => v + '명' },
  { key: '학생1인당장학금', label: '1인당 장학금', unit: '만원', fmt: v => Math.round(v / 10000) + '만' },
  { key: '학생1인당교육비', label: '1인당 교육비', unit: '천원', fmt: v => Math.round(v / 1000) + '만' },
  { key: '기숙사수용율', label: '기숙사 수용률', unit: '%', fmt: v => v + '%' },
  { key: '전임교원강의비율', label: '전임교원 강의비율', unit: '%', fmt: v => v + '%' },
]

const SIZE_METRICS = [
  { key: '재학생수', label: '재학생 수' },
  { key: '입학정원', label: '입학정원' },
  { key: '졸업생수', label: '졸업생 수' },
  { key: '도서자료수', label: '도서자료 수' },
]

function getColor(type) {
  return COLOR_MAP[type] || '#a78bfa'
}

function formatTooltipValue(key, value) {
  if (value == null || value === '') return '-'
  const m = AXIS_METRICS.find(m => m.key === key)
  if (m) return m.fmt(+value) + (m.unit !== m.fmt(+value).slice(-m.unit.length) ? ' ' + m.unit : '')
  return Number(value).toLocaleString()
}

const selectStyle = {
  background: 'rgba(15,23,42,0.9)',
  border: '1px solid rgba(124,58,237,0.5)',
  color: '#e2e8f0',
  borderRadius: 8,
  padding: '7px 12px',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function BubbleChart({ data }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [xKey, setXKey] = useState('취업률')
  const [yKey, setYKey] = useState('신입생경쟁률')
  const [sizeKey, setSizeKey] = useState('재학생수')

  const xMetric = AXIS_METRICS.find(m => m.key === xKey) || AXIS_METRICS[0]
  const yMetric = AXIS_METRICS.find(m => m.key === yKey) || AXIS_METRICS[1]
  const sizeMetric = SIZE_METRICS.find(m => m.key === sizeKey) || SIZE_METRICS[0]

  const validData = useMemo(() =>
    data.filter(d =>
      d[xKey] != null && d[yKey] != null && d[sizeKey] != null &&
      +d[xKey] > 0 && +d[yKey] > 0 && +d[sizeKey] > 0
    ), [data, xKey, yKey, sizeKey])

  useEffect(() => {
    const container = svgRef.current?.parentElement
    if (!container || validData.length === 0) return

    const W = container.clientWidth || 900
    const H = 580
    const margin = { top: 40, right: 160, bottom: 60, left: 80 }

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)

    const defs = svg.append('defs')
    const grad = defs.append('linearGradient')
      .attr('id', 'bgGrad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%')
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#0f172a')
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#1e1b4b')
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'url(#bgGrad)').attr('rx', 16)

    const xExt = d3.extent(validData, d => +d[xKey])
    const yExt = d3.extent(validData, d => +d[yKey])
    const rExt = d3.extent(validData, d => +d[sizeKey])

    const xPad = (xExt[1] - xExt[0]) * 0.06 || 1
    const yPad = (yExt[1] - yExt[0]) * 0.06 || 1

    const x = d3.scaleLinear()
      .domain([Math.max(0, xExt[0] - xPad), xExt[1] + xPad])
      .range([margin.left, W - margin.right])

    const y = d3.scaleLinear()
      .domain([Math.max(0, yExt[0] - yPad), yExt[1] + yPad])
      .range([H - margin.bottom, margin.top])

    const r = d3.scaleSqrt().domain(rExt).range([4, 28])

    // 그리드
    svg.selectAll('.gx').data(x.ticks(8)).enter().append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', margin.top).attr('y2', H - margin.bottom)
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '4,4')

    svg.selectAll('.gy').data(y.ticks(8)).enter().append('line')
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('x1', margin.left).attr('x2', W - margin.right)
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '4,4')

    // 축
    svg.append('g').attr('transform', `translate(0,${H - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(xMetric.fmt))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('text').style('fill', '#94a3b8').style('font-size', '11px'))
      .call(g => g.selectAll('line').style('stroke', 'rgba(255,255,255,0.1)'))

    svg.append('g').attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(8).tickFormat(yMetric.fmt))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('text').style('fill', '#94a3b8').style('font-size', '11px'))
      .call(g => g.selectAll('line').style('stroke', 'rgba(255,255,255,0.1)'))

    // 축 레이블
    svg.append('text')
      .attr('x', (W - margin.left - margin.right) / 2 + margin.left)
      .attr('y', H - 10).attr('text-anchor', 'middle')
      .style('fill', '#a78bfa').style('font-size', '13px').style('font-weight', '600')
      .text(`▶ ${xMetric.label}`)

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(H - margin.top - margin.bottom) / 2 - margin.top)
      .attr('y', 20).attr('text-anchor', 'middle')
      .style('fill', '#a78bfa').style('font-size', '13px').style('font-weight', '600')
      .text(`▲ ${yMetric.label}`)

    // 버블
    const nonHansei = validData.filter(d => d.학교명 !== '한세대학교')
    const hanseiData = validData.filter(d => d.학교명 === '한세대학교')

    svg.selectAll('.bubble').data(nonHansei).enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => x(+d[xKey]))
      .attr('cy', d => y(+d[yKey]))
      .attr('r', 0)
      .attr('fill', d => getColor(d.설립유형))
      .attr('opacity', 0.65)
      .attr('stroke', d => getColor(d.설립유형))
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke-width', 2)
        setTooltip({ d, x: event.pageX, y: event.pageY })
      })
      .on('mousemove', function(event) {
        setTooltip(prev => prev ? { ...prev, x: event.pageX, y: event.pageY } : null)
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.65).attr('stroke-width', 0.5)
        setTooltip(null)
      })
      .transition().duration(600).delay((_, i) => i * 1.5)
      .attr('r', d => r(+d[sizeKey]))

    // 한세대 강조
    if (hanseiData.length > 0) {
      const hd = hanseiData[0]
      const hx = x(+hd[xKey])
      const hy = y(+hd[yKey])
      const hr = r(+hd[sizeKey])

      const glowFilter = defs.append('filter').attr('id', 'glow')
      glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur')
      const feMerge = glowFilter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'coloredBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

      svg.append('circle')
        .attr('cx', hx).attr('cy', hy).attr('r', hr + 6)
        .attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2).attr('opacity', 0.8)
        .append('animate')
        .attr('attributeName', 'r').attr('values', `${hr+6};${hr+16};${hr+6}`)
        .attr('dur', '2s').attr('repeatCount', 'indefinite')

      svg.append('circle')
        .attr('cx', hx).attr('cy', hy).attr('r', hr)
        .attr('fill', '#ef4444').attr('opacity', 0.9).attr('filter', 'url(#glow)')
        .style('cursor', 'pointer')
        .on('mouseover', (event) => setTooltip({ d: hd, x: event.pageX, y: event.pageY }))
        .on('mousemove', (event) => setTooltip(prev => prev ? { ...prev, x: event.pageX, y: event.pageY } : null))
        .on('mouseout', () => setTooltip(null))

      svg.append('path')
        .attr('d', `M ${hx} ${hy - hr - 18} l 5 10 l 11 0 l -9 7 l 3 11 l -10 -7 l -10 7 l 3 -11 l -9 -7 l 11 0 z`)
        .attr('fill', '#fbbf24').attr('filter', 'url(#glow)')

      svg.append('text')
        .attr('x', hx).attr('y', hy + hr + 22).attr('text-anchor', 'middle')
        .style('fill', '#fbbf24').style('font-size', '13px').style('font-weight', '700')
        .text('한세대학교')
    }

    // 설립 유형 범례
    const legend = svg.append('g').attr('transform', `translate(${W - margin.right + 12}, ${margin.top})`)
    Object.entries(COLOR_MAP).forEach(([label, color], i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 22})`)
      g.append('circle').attr('r', 7).attr('fill', color).attr('opacity', 0.8)
      g.append('text').attr('x', 14).attr('y', 4)
        .style('fill', '#e2e8f0').style('font-size', '12px').text(label)
    })

    // 버블 크기 범례
    const sizeLeg = svg.append('g').attr('transform', `translate(${W - margin.right + 12}, ${margin.top + 110})`)
    sizeLeg.append('text').attr('x', 0).attr('y', 0)
      .style('fill', '#94a3b8').style('font-size', '11px').text('버블 크기')
    sizeLeg.append('text').attr('x', 0).attr('y', 14)
      .style('fill', '#64748b').style('font-size', '11px').text(sizeMetric.label)

    const sizeSamples = [rExt[0], (rExt[0] + rExt[1]) / 2, rExt[1]]
    sizeSamples.forEach((size, i) => {
      const cr = r(size)
      sizeLeg.append('circle')
        .attr('cx', 12 + i * 38).attr('cy', 40 + cr)
        .attr('r', cr).attr('fill', 'none').attr('stroke', '#64748b').attr('stroke-width', 1)
      sizeLeg.append('text')
        .attr('x', 12 + i * 38).attr('y', 40 + cr * 2 + 13)
        .attr('text-anchor', 'middle').style('fill', '#64748b').style('font-size', '9px')
        .text(size >= 1000 ? Math.round(size / 1000) + 'K' : Math.round(size))
    })

  }, [validData, xKey, yKey, sizeKey])

  const tooltipRows = tooltip ? (() => {
    const d = tooltip.d
    const rows = [
      ['지역', d.지역],
      ['설립', d.설립유형],
      [xMetric.label, xMetric.fmt(+d[xKey]) + ' ' + xMetric.unit],
      [yMetric.label, yMetric.fmt(+d[yKey]) + ' ' + yMetric.unit],
      [sizeMetric.label, Number(d[sizeKey]).toLocaleString()],
    ]
    // 선택 지표가 아닌 경우에만 취업률 추가
    if (xKey !== '취업률' && yKey !== '취업률' && d.취업률 != null) {
      rows.push(['취업률', d.취업률 + '%'])
    }
    return rows
  })() : []

  return (
    <div>
      {/* 축/크기 선택기 */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'center',
      }}>
        {[
          { label: 'X축', value: xKey, onChange: setXKey, options: AXIS_METRICS },
          { label: 'Y축', value: yKey, onChange: setYKey, options: AXIS_METRICS },
          { label: '버블 크기', value: sizeKey, onChange: setSizeKey, options: SIZE_METRICS },
        ].map(({ label, value, onChange, options }) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              color: '#a78bfa', fontSize: 12, fontWeight: 700,
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              {label}
            </span>
            <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
              {options.map(m => (
                <option key={m.key} value={m.key} style={{ background: '#0f172a' }}>{m.label}</option>
              ))}
            </select>
          </label>
        ))}
        <span style={{ color: '#475569', fontSize: 12 }}>
          · {validData.length}개교 표시
        </span>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 16, padding: 8, overflow: 'hidden', position: 'relative',
      }}>
        <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
        {tooltip && (
          <div style={{
            position: 'fixed',
            left: tooltip.x + 16,
            top: tooltip.y - 10,
            background: 'rgba(15,23,42,0.97)',
            border: `1px solid ${getColor(tooltip.d.설립유형)}`,
            borderRadius: 12, padding: '12px 16px',
            pointerEvents: 'none', zIndex: 999, minWidth: 210,
            boxShadow: `0 0 20px ${getColor(tooltip.d.설립유형)}40`,
          }}>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              {tooltip.d.학교명}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 12 }}>
              {tooltipRows.map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: '#64748b' }}>{k}: </span>
                  <span style={{ color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
        {Object.entries(COLOR_MAP).map(([label, color]) => {
          const count = data.filter(d => d.설립유형 === label).length
          return (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${color}40`,
              borderRadius: 8, padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
              <span style={{ color: '#e2e8f0', fontSize: 13 }}>{label}</span>
              <span style={{ color: '#64748b', fontSize: 12 }}>{count}개교</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
