import { useState, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { universities, hansei, competitors, AXIS_METRICS, SIZE_METRICS, RADAR_METRICS } from '../data/universities';

const COLORS = {
  '국립': '#00d4ff',
  '사립': '#9b59b6',
  '특별법국립': '#2ecc71',
};

function BubbleChart() {
  const [xMetric, setXMetric] = useState(AXIS_METRICS[0]);
  const [yMetric, setYMetric] = useState(AXIS_METRICS[7]);
  const [sizeMetric, setSizeMetric] = useState(SIZE_METRICS[0]);
  const [hovered, setHovered] = useState(null);

  const chartData = universities
    .filter(u => {
      const x = u[xMetric.key];
      const y = u[yMetric.key];
      const z = u[sizeMetric.key];
      return x != null && y != null && z != null && x > 0 && y > 0 && z > 0;
    })
    .map(u => ({
      ...u,
      x: parseFloat(u[xMetric.key]) || 0,
      y: parseFloat(u[yMetric.key]) || 0,
      z: parseFloat(u[sizeMetric.key]) || 0,
    }));

  const estabGroups = {};
  chartData.forEach(d => {
    const t = d.estabType?.includes('국립') ? '국립' : d.estabType === '사립' ? '사립' : '특별법국립';
    if (!estabGroups[t]) estabGroups[t] = [];
    estabGroups[t].push(d);
  });

  const hanseiDot = chartData.find(u => u.name === '한세대학교');

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(10,10,30,0.95)', border: '1px solid #7c3aed',
        borderRadius: 12, padding: '12px 16px', color: '#e2e8f0', maxWidth: 260,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: d.name === '한세대학교' ? '#ff4d6d' : '#a78bfa', marginBottom: 8 }}>
          {d.name}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <span style={{ color: '#94a3b8' }}>{xMetric.label}:</span> <strong>{d.x}{xMetric.unit}</strong><br />
          <span style={{ color: '#94a3b8' }}>{yMetric.label}:</span> <strong>{d.y}{yMetric.unit}</strong><br />
          <span style={{ color: '#94a3b8' }}>{sizeMetric.label}:</span> <strong>{d.z.toLocaleString()}명</strong><br />
          <span style={{ color: '#94a3b8' }}>지역:</span> <strong>{d.region}</strong><br />
          <span style={{ color: '#94a3b8' }}>설립:</span> <strong>{d.estabType}</strong>
        </div>
      </div>
    );
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.name === '한세대학교') {
      return (
        <g>
          <circle cx={cx} cy={cy} r={16} fill="rgba(255,77,109,0.2)" className="pulse-ring" />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={18} fill="#ff4d6d">★</text>
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize={10} fill="#ff4d6d" fontWeight="bold">한세대</text>
        </g>
      );
    }
    return null;
  };

  const selectStyle = {
    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.5)',
    color: '#e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: 13,
    outline: 'none', cursor: 'pointer'
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>X축</label>
          <select style={selectStyle} value={xMetric.key} onChange={e => setXMetric(AXIS_METRICS.find(m => m.key === e.target.value))}>
            {AXIS_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>Y축</label>
          <select style={selectStyle} value={yMetric.key} onChange={e => setYMetric(AXIS_METRICS.find(m => m.key === e.target.value))}>
            {AXIS_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>버블 크기</label>
          <select style={selectStyle} value={sizeMetric.key} onChange={e => setSizeMetric(SIZE_METRICS.find(m => m.key === e.target.value))}>
            {SIZE_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', alignItems: 'center' }}>
          {Object.entries(COLORS).map(([type, color]) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {type}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ff4d6d' }}>
            ★ 한세대학교
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number" dataKey="x"
            name={xMetric.label}
            label={{ value: `${xMetric.label} (${xMetric.unit})`, position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            type="number" dataKey="y"
            name={yMetric.label}
            label={{ value: `${yMetric.label} (${yMetric.unit})`, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="z" range={[30, 1000]} name={sizeMetric.label} />
          <Tooltip content={<CustomTooltip />} />
          {Object.entries(estabGroups).map(([type, data]) => (
            <Scatter
              key={type}
              name={type}
              data={data.filter(d => d.name !== '한세대학교')}
              fill={COLORS[type] || '#9b59b6'}
              fillOpacity={0.6}
              shape="circle"
            />
          ))}
          {hanseiDot && (
            <Scatter
              name="한세대학교"
              data={[hanseiDot]}
              fill="#ff4d6d"
              shape={<CustomDot />}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function RadarCompare() {
  const [selectedCompetitor, setSelectedCompetitor] = useState(competitors[0]);

  const radarData = RADAR_METRICS.map(m => {
    const entry = { metric: m.label };
    const normalize = (val, max) => Math.min(100, Math.round((parseFloat(val) || 0) / max * 100));
    entry['한세대학교'] = normalize(hansei?.[m.key], m.max);
    entry[selectedCompetitor?.name] = normalize(selectedCompetitor?.[m.key], m.max);
    return entry;
  });

  const selectStyle = {
    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.5)',
    color: '#e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: 14,
    outline: 'none', cursor: 'pointer'
  };

  const statsStyle = (isHansei) => ({
    background: isHansei ? 'rgba(255,77,109,0.1)' : 'rgba(124,58,237,0.1)',
    border: `1px solid ${isHansei ? 'rgba(255,77,109,0.3)' : 'rgba(124,58,237,0.3)'}`,
    borderRadius: 12, padding: '16px', flex: 1,
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <span style={{ color: '#94a3b8' }}>비교 대학 선택:</span>
        <select style={selectStyle} value={selectedCompetitor?.name} onChange={e => setSelectedCompetitor(competitors.find(c => c.name === e.target.value))}>
          {competitors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name="한세대학교" dataKey="한세대학교" stroke="#ff4d6d" fill="#ff4d6d" fillOpacity={0.3} strokeWidth={2} />
              <Radar name={selectedCompetitor?.name} dataKey={selectedCompetitor?.name} stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: 13 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ uni: hansei, isHansei: true }, { uni: selectedCompetitor, isHansei: false }].map(({ uni, isHansei }) => (
            <div key={uni?.name} style={statsStyle(isHansei)}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: isHansei ? '#ff4d6d' : '#a78bfa' }}>
                {isHansei ? '★ ' : ''}{uni?.name}
              </div>
              {RADAR_METRICS.map(m => (
                <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: '#e2e8f0' }}>
                  <span style={{ color: '#94a3b8' }}>{m.label}</span>
                  <strong>
                    {m.key === 'scholarshipPerStudent'
                      ? `${Math.round((parseFloat(uni?.[m.key]) || 0) / 10000)}만원`
                      : `${parseFloat(uni?.[m.key]) || 0}${m.unit}`}
                  </strong>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Stage1() {
  const [activeTab, setActiveTab] = useState('bubble');

  const tabStyle = (active) => ({
    padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
    border: 'none', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg, #7c3aed, #9b59b6)' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#94a3b8',
    boxShadow: active ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
  });

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 32, background: 'linear-gradient(180deg, #7c3aed, #ff4d6d)', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>
            전국 대학 포지셔닝 대시보드
          </h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, marginLeft: 16, fontSize: 14 }}>
          대학알리미 2025 기준 · 전국 {universities.length}개 대학 데이터 기반
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button style={tabStyle(activeTab === 'bubble')} onClick={() => setActiveTab('bubble')}>
          📊 포지셔닝 맵 (버블차트)
        </button>
        <button style={tabStyle(activeTab === 'radar')} onClick={() => setActiveTab('radar')}>
          🕸️ 대학 비교 (레이더차트)
        </button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '24px'
      }}>
        {activeTab === 'bubble' ? <BubbleChart /> : <RadarCompare />}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        .pulse-ring { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}
