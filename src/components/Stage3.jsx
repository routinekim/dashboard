import { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hansei, competitors } from '../data/universities';

const INDICATORS = [
  { key: 'employmentRate', label: '취업률', unit: '%', rank: '비교군 1위', rankColor: '#4ade80', icon: '💼', avg: 60.7, max: 100, numVal: 71.0, detail: 'employment', desc: '경기·인천권 3위, 전국 최상위권' },
  { key: 'competitionRate', label: '신입생 경쟁률', unit: ':1', rank: '비교군 공동 1위', rankColor: '#4ade80', icon: '🎯', avg: 9.0, max: 15, numVal: 11.7, detail: 'competition', desc: '수험생 선호도 최상위' },
  { key: 'fillRate', label: '신입생 충원율', unit: '%', rank: '비교군 6위', rankColor: '#fb923c', icon: '📋', avg: 100.1, max: 105, numVal: 99.8, detail: 'fill', desc: '100% 달성 목표 관리 필요' },
  { key: 'facultyRateByQuota', label: '교원확보율', unit: '%', rank: '비교군 5위', rankColor: '#fb923c', icon: '👩‍🏫', avg: 66.1, max: 100, numVal: 62.89, detail: 'faculty', desc: '전임교원 확충 필요' },
  { key: 'scholarshipPerStudent', label: '1인당 장학금', unit: '원', rank: '비교군 1위', rankColor: '#4ade80', icon: '🎓', avg: 389, max: 450, numVal: 431, detail: 'scholarship', desc: '학생 경제적 지원 최강' },
  { key: 'educationCostPerStudent', label: '1인당 교육비', unit: '천원', rank: '비교군 1위', rankColor: '#4ade80', icon: '📚', avg: 12639, max: 14000, numVal: 13445, detail: 'education', desc: '교육 투자 집중도 최상위' },
  { key: 'dormitoryRate', label: '기숙사 수용률', unit: '%', rank: '비교군 4위', rankColor: '#fb923c', icon: '🏠', avg: 14.9, max: 35, numVal: 12.2, detail: 'dormitory', desc: '확충 통한 지방학생 유치 필요' },
  { key: 'fullTimeLectureRatio', label: '전임교원 강의비율', unit: '%', rank: '비교군 6위', rankColor: '#f87171', icon: '🎤', avg: 65.1, max: 75, numVal: 48.3, detail: 'lecture', desc: '시급한 개선 과제' },
  { key: 'enrolled', label: '재학생 수', unit: '명', rank: '소규모 특화', rankColor: '#a78bfa', icon: '👥', avg: 4009, max: 6000, numVal: 2509, detail: 'students', desc: '집중 투자 가능한 소규모' },
];

const DETAIL_DATA = {
  employment: {
    title: '취업률 상세 분석', unit: '%',
    summary: '한세대학교는 2025년 취업률 71.0%로 비교군 6개 대학 중 압도적 1위를 기록했습니다. 경기·인천권 4년제 대학 중 상위권에 해당하며, 전국 기준으로도 최상위 15% 이내입니다.',
    points: ['경기·인천권 4년제 취업률 3위 이내', 'REACH 교육혁신 모델 — 18대 혁신과제 추진으로 실무 역량 강화', 'D3D커리어맵(Do Dream→Design→Development) 학년별 맞춤 운영', '대학일자리플러스센터 집중 프로그램 운영', '비교군 2위 안양대(64.1%) 대비 +6.9%p 격차 유지'],
    compareData: [{ name: '한세대', val: 71.0, isHansei: true }, { name: '안양대', val: 64.1 }, { name: '성결대', val: 64.0 }, { name: '한신대', val: 59.0 }, { name: '평택대', val: 58.4 }, { name: '협성대', val: 58.1 }],
  },
  competition: {
    title: '신입생 경쟁률 상세 분석', unit: ':1',
    summary: '신입생 경쟁률 11.7:1은 비교군 공동 1위(안양대와 동일)이며, 비교군 평균 9.0:1 대비 2.7 높은 수준입니다.',
    points: ['취업률 1위 → 수험생 선호도 상승의 선순환 구조', '비교군 평균(9.0:1) 대비 +2.7 우위', '안양대와 공동 1위 — 수도권 접근성 강점 공유', '소규모 정원(566명)으로 경쟁률 유지에 유리한 구조'],
    compareData: [{ name: '한세대', val: 11.7, isHansei: true }, { name: '안양대', val: 11.7 }, { name: '평택대', val: 8.8 }, { name: '성결대', val: 8.5 }, { name: '협성대', val: 8.3 }, { name: '한신대', val: 6.9 }],
  },
  fill: {
    title: '신입생 충원율 상세 분석', unit: '%',
    summary: '신입생 충원율 99.8%는 비교군 중 유일하게 100%를 미달한 수치입니다. 학령인구 감소 추세에서 100% 달성이 핵심 관리 목표입니다.',
    points: ['비교군 6위 — 유일한 100% 미달 대학', '0.2%p 미달은 현재 미미하나 추세 관리 필요', '교육부 2025~2027 평가에서 충원율 가중치 1.5배 확대', '취업률 홍보 강화 및 장학금 우위 활용으로 개선 가능'],
    compareData: [{ name: '안양대', val: 100.4 }, { name: '성결대', val: 100.0 }, { name: '협성대', val: 100.0 }, { name: '평택대', val: 100.0 }, { name: '한신대', val: 100.0 }, { name: '한세대', val: 99.8, isHansei: true }],
  },
  faculty: {
    title: '교원확보율 상세 분석', unit: '%',
    summary: '교원확보율(정원 기준) 62.89%는 비교군 5위로 하위권입니다. 전임교원 강의비율(48.3%)도 함께 개선이 필요합니다.',
    points: ['정원 기준 확보율 62.89% — 비교군 5위', '한신대(74.79%) 대비 약 12%p 격차', '전임교원 강의담당비율 48.3% — 비교군 최하위 (6위)', '교원확보율 개선 없이는 대학재정지원 평가 불이익 위험', '3개년 전임교원 채용 로드맵 수립 권장'],
    compareData: [{ name: '한신대', val: 74.79 }, { name: '평택대', val: 66.67 }, { name: '성결대', val: 66.27 }, { name: '협성대', val: 63.68 }, { name: '한세대', val: 62.89, isHansei: true }, { name: '안양대', val: 61.21 }],
  },
  scholarship: {
    title: '1인당 장학금 상세 분석', unit: '만원',
    summary: '학생 1인당 연간 장학금 431만원은 비교군 1위입니다. 장학금 1위로 실질 부담을 완화하여 학생 유인 효과를 유지하고 있습니다.',
    points: ['1인당 장학금 431만원 — 비교군 1위', '비교군 최하위(한신대 366만원) 대비 +65만원 우위', '소규모 재학생(2,509명)으로 집중 배분 가능한 구조적 강점', '등록금 최고(8,860천원) + 장학금 최고 = 실질 납부액 관리', '"장학금 1위 대학" 홍보를 통한 신입생 유치 전략 활용 권장'],
    compareData: [{ name: '한세대', val: 431, isHansei: true }, { name: '평택대', val: 422 }, { name: '안양대', val: 402 }, { name: '협성대', val: 368 }, { name: '성결대', val: 366 }, { name: '한신대', val: 366 }],
  },
  education: {
    title: '1인당 교육비 상세 분석', unit: '천원',
    summary: '학생 1인당 교육비 13,445천원은 비교군 1위입니다. 소규모 운영 전략의 질적 성과입니다.',
    points: ['1인당 교육비 13,445천원 — 비교군 1위', '성결대(12,008천원) 대비 +1,437천원 높은 투자 수준', '소규모 대학의 집중 투자 효과', '대학혁신지원사업 재정 지원으로 교육비 확보', '교육 품질 지표로 활용 가능한 홍보 자산'],
    compareData: [{ name: '한세대', val: 13445, isHansei: true }, { name: '평택대', val: 13339 }, { name: '협성대', val: 13158 }, { name: '안양대', val: 13092 }, { name: '한신대', val: 12241 }, { name: '성결대', val: 12008 }],
  },
  dormitory: {
    title: '기숙사 수용률 상세 분석', unit: '%',
    summary: '기숙사 수용률 12.2%는 재학생 2,509명 중 약 306명만 기숙사 이용 가능한 수준입니다.',
    points: ['기숙사 수용률 12.2% — 비교군 4위', '평택대(30.1%)가 압도적 1위로 지방 학생 유치에 유리', '군포 소재 특성상 수도권 통학 비율 높아 상대적 필요성 낮음', '지방 출신 우수 학생 유치 확대 위해 20% 이상 목표 권장', '기숙사 신축보다 협력 주거 서비스 도입 검토 권장'],
    compareData: [{ name: '평택대', val: 30.1 }, { name: '한신대', val: 14.2 }, { name: '협성대', val: 12.5 }, { name: '한세대', val: 12.2, isHansei: true }, { name: '성결대', val: 11.1 }, { name: '안양대', val: 6.8 }],
  },
  lecture: {
    title: '전임교원 강의비율 상세 분석', unit: '%',
    summary: '전임교원 강의담당비율 48.3%는 비교군 최하위(6위)이며, 교육부 권고 기준(60% 이상)에도 미달합니다.',
    points: ['전임교원 강의비율 48.3% — 비교군 최하위 (6위)', '비교군 평균(65.1%) 대비 무려 -16.8%p 격차', '교육부 권고 기준(60%) 미달로 재정지원사업 평가 불이익 위험', '비전임 강사 의존도 높아 교육 일관성 저하 가능성', '2025~2027 전임교원 신규 채용 계획 수립 및 단계적 개선 필요'],
    compareData: [{ name: '평택대', val: 67.3 }, { name: '한신대', val: 66.9 }, { name: '안양대', val: 66.9 }, { name: '협성대', val: 64.3 }, { name: '성결대', val: 59.2 }, { name: '한세대', val: 48.3, isHansei: true }],
  },
  students: {
    title: '재학생 규모 분석', unit: '명',
    summary: '재학생 2,509명은 비교군 중 최소 규모입니다. 소규모 집중 투자 전략의 기반으로 1인당 장학금·교육비 1위라는 질적 우위로 이어집니다.',
    points: ['재학생 2,509명 — 비교군 최소 규모', '비교군 평균(4,009명) 대비 약 63% 수준', '소규모 운영 → 1인당 자원 집중 가능 → 장학금·교육비 1위', '취업 맞춤 소그룹 교육, 교수-학생 밀착 지도 가능', '"소규모 명품 교육" 전략의 구조적 기반'],
    compareData: [{ name: '성결대', val: 5241 }, { name: '한신대', val: 5172 }, { name: '안양대', val: 4353 }, { name: '협성대', val: 3773 }, { name: '평택대', val: 3006 }, { name: '한세대', val: 2509, isHansei: true }],
  },
};

const STYLES = `
  @keyframes floatParticle {
    0%   { transform: translateY(0) scale(0.5); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-95vh) scale(0.2); opacity: 0; }
  }
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(50px,-40px) scale(1.1); }
    66%      { transform: translate(-30px,20px) scale(0.92); }
  }
  @keyframes gradientShift {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-200%); }
    100% { transform: translateX(300%); }
  }
  @keyframes badgePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
    50%      { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
  }
  @keyframes bounce {
    0%,60%,100% { transform: translateY(0); }
    30%         { transform: translateY(-10px); }
  }
  @keyframes scanDown {
    0%   { transform: translateY(-5%); opacity: 0.6; }
    100% { transform: translateY(105%); opacity: 0; }
  }
  @keyframes popIn {
    0%  { transform: scale(0.85) translateY(20px); opacity: 0; }
    100%{ transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes borderGlow {
    0%,100% { box-shadow: 0 0 30px rgba(124,58,237,0.1); }
    50%      { box-shadow: 0 0 60px rgba(124,58,237,0.25), 0 0 120px rgba(124,58,237,0.08); }
  }
  @keyframes heroTextGlow {
    0%,100% { filter: drop-shadow(0 0 20px rgba(167,139,250,0.5)); }
    50%      { filter: drop-shadow(0 0 40px rgba(196,181,253,0.9)); }
  }
  @keyframes countPop {
    0%  { transform: scale(0.7); opacity: 0; }
    80% { transform: scale(1.05); }
    100%{ transform: scale(1); opacity: 1; }
  }
`;

function formatCount(val, unit, key) {
  if (unit === '%') return `${val.toFixed(key === 'facultyRateByQuota' ? 2 : 1)}%`;
  if (unit === ':1') return `${val.toFixed(1)}:1`;
  if (unit === '원') return `${Math.round(val)}만원`;
  if (unit === '천원') return `${Math.round(val).toLocaleString()}천원`;
  if (unit === '명') return `${Math.round(val).toLocaleString()}명`;
  return val.toFixed(1);
}

function Ticker() {
  const items = [
    '🏆 취업률 비교군 1위 · 71.0%',
    '💰 1인당 장학금 비교군 1위 · 431만원',
    '📚 1인당 교육비 비교군 1위 · 13,445천원',
    '🎯 신입생 경쟁률 비교군 공동 1위 · 11.7:1',
    '⭐ 경기·인천권 취업률 3위 이내',
    '🎓 소규모 명품 교육 · 재학생 2,509명',
    '🌟 4대 핵심 지표 비교군 1위 달성',
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', background: 'linear-gradient(90deg,rgba(124,58,237,0.1),rgba(255,77,109,0.06),rgba(124,58,237,0.1))', borderTop: '1px solid rgba(124,58,237,0.3)', borderBottom: '1px solid rgba(124,58,237,0.3)', padding: '11px 0' }}>
      <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ color: '#c4b5fd', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', padding: '0 32px' }}>
            {item}<span style={{ color: 'rgba(167,139,250,0.3)', marginLeft: 32 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function KPICard({ ind, index, onClick }) {
  const [count, setCount] = useState(0);
  const [barW, setBarW] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setBarW(Math.min(100, (ind.numVal / ind.max) * 100)), 300);
      let s = null;
      const dur = 1600;
      const step = (ts) => {
        if (!s) s = ts;
        const p = Math.min((ts - s) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setCount(e * ind.numVal);
        if (p < 1) requestAnimationFrame(step);
        else setCount(ind.numVal);
      };
      requestAnimationFrame(step);
    }, index * 85);
    return () => clearTimeout(t);
  }, [ind.numVal, ind.max, index]);

  const isGreen  = ind.rankColor === '#4ade80';
  const isRed    = ind.rankColor === '#f87171';
  const isPurple = ind.rankColor === '#a78bfa';
  const glow = isGreen ? '#4ade80' : isRed ? '#f87171' : isPurple ? '#a78bfa' : '#fb923c';
  const valGrad = isGreen
    ? 'linear-gradient(135deg,#4ade80,#22d3ee)'
    : isRed
      ? 'linear-gradient(135deg,#f87171,#fb923c)'
      : isPurple
        ? 'linear-gradient(135deg,#a78bfa,#818cf8)'
        : 'linear-gradient(135deg,#fb923c,#fbbf24)';
  const barGrad = isGreen
    ? 'linear-gradient(90deg,#4ade80,#22d3ee)'
    : isRed
      ? 'linear-gradient(90deg,#f87171,#fb923c)'
      : isPurple
        ? 'linear-gradient(90deg,#a78bfa,#818cf8)'
        : 'linear-gradient(90deg,#fb923c,#fbbf24)';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))',
        border: `1px solid ${glow}35`,
        borderRadius: 20, padding: '24px 20px', cursor: 'pointer',
        backdropFilter: 'blur(14px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.94)',
        transition: `opacity 0.55s ease ${index * 0.07}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s, box-shadow 0.25s ease, border-color 0.25s ease`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
        e.currentTarget.style.boxShadow = `0 28px 64px ${glow}30, 0 0 0 1px ${glow}55`;
        e.currentTarget.style.borderColor = `${glow}70`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${glow}35`;
      }}
    >
      {/* shimmer sweep */}
      <div style={{ position:'absolute',inset:0,pointerEvents:'none', background:'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.065) 50%,transparent 70%)', animation:`shimmer ${4+index*0.4}s ease-in-out infinite`, animationDelay:`${index*0.25}s` }} />
      {/* corner glow */}
      <div style={{ position:'absolute',top:0,right:0,width:70,height:70, background:`radial-gradient(circle at top right,${glow}22,transparent 70%)`, borderRadius:'0 20px 0 0', pointerEvents:'none' }} />

      <div style={{ fontSize: 26, marginBottom: 10 }}>{ind.icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.5px', background: valGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontVariantNumeric:'tabular-nums', animation: visible ? `countPop 0.5s cubic-bezier(0.16,1,0.3,1) ${index*0.07+0.1}s both` : 'none' }}>
        {formatCount(count, ind.unit, ind.key)}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontWeight: 500 }}>{ind.label}</div>
      <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:`${glow}14`, border:`1px solid ${glow}38`, borderRadius:20, padding:'3px 10px', marginBottom:12, animation: isGreen ? `badgePulse 2.8s ${index*0.4}s ease-in-out infinite` : 'none' }}>
        {isGreen && <span style={{ fontSize:8, color:glow }}>▲</span>}
        <span style={{ fontSize:10, color:glow, fontWeight:700 }}>{ind.rank}</span>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:4, width:`${barW}%`, transition:`width 2s cubic-bezier(0.16,1,0.3,1) ${index*0.08+0.3}s`, background:barGrad, boxShadow:`0 0 14px ${glow}55` }} />
      </div>
      <div style={{ fontSize:10, color:'#475569', marginTop:8, lineHeight:1.5 }}>{ind.desc}</div>
    </div>
  );
}

function AnimatedBar({ val, max, color, delay, isHansei }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((val / max) * 100), delay);
    return () => clearTimeout(t);
  }, [val, max, delay]);
  return (
    <div style={{ flex:1, height:22, background:'rgba(255,255,255,0.04)', borderRadius:6, overflow:'hidden', position:'relative' }}>
      <div style={{ height:'100%', borderRadius:6, width:`${w}%`, transition:`width 1.3s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, background: isHansei ? 'linear-gradient(90deg,#ff4d6d,#ff8c69)' : 'linear-gradient(90deg,rgba(124,58,237,0.5),rgba(124,58,237,0.25))', boxShadow: isHansei ? '0 0 16px rgba(255,77,109,0.5)' : 'none', display:'flex', alignItems:'center', paddingLeft:8, fontSize:11, color:'rgba(255,255,255,0.9)', fontWeight: isHansei ? 800 : 500 }}>
        {w > 0 && `${val}`}
      </div>
    </div>
  );
}

function DetailModal({ detail, onClose }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 80); return () => clearTimeout(t); }, []);

  if (!detail) return null;
  const data = DETAIL_DATA[detail.detail];
  if (!data) return null;
  const maxVal = Math.max(...data.compareData.map(d => d.val));

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(10px)', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'linear-gradient(135deg,#0d0b1e,#12103a)', border:'1px solid rgba(124,58,237,0.55)', borderRadius:24, padding:32, maxWidth:660, width:'100%', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 0 100px rgba(124,58,237,0.4)', animation:'popIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:32, marginBottom:6 }}>{detail.icon}</div>
            <h3 style={{ fontSize:22, fontWeight:800, color:'#e2e8f0', margin:0 }}>{data.title}</h3>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#94a3b8', fontSize:18, cursor:'pointer', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <div style={{ background:'rgba(124,58,237,0.08)', borderLeft:'3px solid #7c3aed', borderRadius:'0 8px 8px 0', padding:'14px 16px', marginBottom:28 }}>
          <p style={{ fontSize:13, lineHeight:1.8, color:'#94a3b8', margin:0 }}>{data.summary}</p>
        </div>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, color:'#475569', marginBottom:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>비교군 순위</div>
          {data.compareData.map((d, i) => (
            <div key={d.name} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <div style={{ width:56, fontSize:11, textAlign:'right', color: d.isHansei ? '#ff4d6d' : '#64748b', fontWeight: d.isHansei ? 800 : 400, flexShrink:0 }}>
                {d.isHansei ? '★' : `${i+1}.`} {d.name}
              </div>
              <AnimatedBar val={d.val} max={maxVal} isHansei={d.isHansei} delay={go ? i * 90 : 9999} />
              <span style={{ fontSize:11, color: d.isHansei ? '#ff4d6d' : '#475569', fontWeight: d.isHansei ? 800 : 400, flexShrink:0, width:70 }}>{d.val}{data.unit}</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize:11, color:'#475569', marginBottom:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>핵심 인사이트</div>
          {data.points.map((p, i) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:10, alignItems:'flex-start' }}>
              <div style={{ width:22, height:22, flexShrink:0, marginTop:1, background:'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(167,139,250,0.2))', border:'1px solid rgba(124,58,237,0.4)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#a78bfa', fontWeight:700 }}>{i+1}</div>
              <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7, margin:0 }}>{p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
          <a href="/report.html" target="_blank" rel="noopener noreferrer" style={{ color:'#a78bfa', fontSize:12, textDecoration:'none' }}>📄 전체 보고서에서 자세히 보기 →</a>
        </div>
      </div>
    </div>
  );
}

const mdComponents = {
  h1: ({ children }) => <h2 style={{ fontSize:22, fontWeight:800, color:'#c4b5fd', marginBottom:12, marginTop:24 }}>{children}</h2>,
  h2: ({ children }) => <h3 style={{ fontSize:18, fontWeight:700, color:'#a78bfa', marginBottom:10, marginTop:20 }}>{children}</h3>,
  h3: ({ children }) => <h4 style={{ fontSize:15, fontWeight:600, color:'#e2e8f0', marginBottom:8, marginTop:16 }}>{children}</h4>,
  strong: ({ children }) => <strong style={{ color:'#c4b5fd', fontWeight:700 }}>{children}</strong>,
  p: ({ children }) => <p style={{ fontSize:14, lineHeight:1.9, color:'#cbd5e1', marginBottom:10 }}>{children}</p>,
  li: ({ children }) => <li style={{ fontSize:13, lineHeight:1.8, color:'#94a3b8', marginBottom:4 }}>{children}</li>,
  ul: ({ children }) => <ul style={{ paddingLeft:20, marginBottom:12 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft:20, marginBottom:12 }}>{children}</ol>,
};

function AIChat() {
  const [messages, setMessages] = useState([{ role:'assistant', content:'안녕하세요! 한세대학교 데이터 분석 AI 어시스턴트입니다. 대학 지표, 비교 분석, 발전 전략 등에 대해 질문해 주세요. 📊' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const SYSTEM_PROMPT = `당신은 한세대학교 대학 데이터 분석 전문가입니다.
대학알리미 2025년 공시 데이터를 기반으로 한세대학교의 경쟁력을 분석하고 답변합니다.

한세대학교 핵심 데이터:
- 소재지: 경기도 군포시 / 사립대학 / 입학정원 566명 / 재학생 2,509명 / 전임교원 100명
- 취업률: 71.0% (비교군 1위, 경기·인천권 3위 이내)
- 신입생 경쟁률: 11.7:1 (비교군 공동 1위)
- 신입생 충원율: 99.8% (비교군 최하위 — 유일 100% 미달)
- 교원확보율(정원): 62.89% (비교군 5위)
- 전임교원 강의비율: 48.3% (비교군 최하위)
- 1인당 장학금: 431만원 (비교군 1위)
- 1인당 교육비: 13,445천원 (비교군 1위)
- 기숙사 수용률: 12.2% (비교군 4위)

비교 대학: 안양대, 성결대, 협성대, 평택대, 한신대 (모두 경기 소재 사립대)
교육부 2025 정책: RISE 체계 전국 도입, 대학혁신지원사업 1.7조원 규모 (충원율 가중치 1.5배 강화)
강점: 취업률·장학금·교육비 비교군 1위 / 약점: 전임교원 강의비율·충원율 최하위

한국어로 전문적이고 명확하게 답변하세요. 마크다운을 활용하여 구조적으로 설명해주세요.`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:'user', content:input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const history = messages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts:[{ text:m.content }] }));
      history.push({ role:'user', parts:[{ text:input }] });
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ system_instruction:{ parts:[{ text:SYSTEM_PROMPT }] }, contents:history, generationConfig:{ temperature:0.7, maxOutputTokens:3000 } }),
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 받지 못했습니다.';
      setMessages(prev => [...prev, { role:'assistant', content:text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role:'assistant', content:`오류가 발생했습니다: ${e.message}` }]);
    } finally { setLoading(false); }
  };

  const quickQuestions = ['한세대 취업률이 높은 이유는?', '가장 시급한 개선 과제는?', '교육부 정책 대응 전략은?', '소규모 대학의 장단점은?'];

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:20, padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#ff4d6d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 0 20px rgba(124,58,237,0.5)' }}>🤖</div>
        <div>
          <div style={{ fontWeight:700, fontSize:18, color:'#e2e8f0' }}>AI 분석 어시스턴트</div>
          <div style={{ fontSize:12, color:'#64748b' }}>Gemini 2.5 Flash · 한세대 데이터 기반</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {quickQuestions.map(q => (
          <button key={q} onClick={() => setInput(q)} style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', color:'#a78bfa', borderRadius:20, padding:'6px 14px', fontSize:12, cursor:'pointer', transition:'all 0.2s' }}>{q}</button>
        ))}
      </div>
      <div style={{ height:420, overflowY:'auto', marginBottom:16, padding:'4px 0', scrollbarWidth:'thin', scrollbarColor:'rgba(124,58,237,0.3) transparent' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom:16 }}>
            <div style={{ maxWidth:'85%', background: msg.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#9b59b6)' : 'rgba(255,255,255,0.04)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding:'12px 16px' }}>
              {msg.role === 'assistant'
                ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{msg.content}</ReactMarkdown>
                : <p style={{ fontSize:14, color:'#fff', margin:0 }}>{msg.content}</p>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:6, padding:'12px 16px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#7c3aed', animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="한세대 데이터에 대해 질문해보세요..." style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 16px', color:'#e2e8f0', fontSize:14, outline:'none' }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg,#7c3aed,#9b59b6)', border:'none', borderRadius:12, padding:'12px 20px', color:'white', fontSize:14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight:600, boxShadow: !loading && input.trim() ? '0 0 20px rgba(124,58,237,0.4)' : 'none' }}>전송</button>
      </div>
    </div>
  );
}

export default function Stage3() {
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: (i % 3) + 2,
      left: (i * 19 + 5) % 100,
      bottom: (i * 11) % 25,
      duration: 11 + (i % 10),
      delay: -((i * 1.4) % 13),
      color: ['#7c3aed','#ff4d6d','#22d3ee','#a78bfa','#4ade80'][i % 5],
    })), []
  );

  const STRENGTHS = [
    { label:'취업률',       val:71.0,  avg:60.7,  max:100,   display:'71.0%',        unit:'%',   avgDisp:'평균 60.7%' },
    { label:'신입생 경쟁률', val:11.7,  avg:9.0,   max:15,    display:'11.7:1',       unit:':1',  avgDisp:'평균 9.0:1' },
    { label:'1인당 장학금',  val:431,   avg:389,   max:460,   display:'431만원',      unit:'만원', avgDisp:'평균 389만원' },
    { label:'1인당 교육비',  val:13445, avg:12639, max:14500, display:'13,445천원',   unit:'천원', avgDisp:'평균 12,639천원' },
  ];
  const CHALLENGES = [
    { label:'전임교원 강의비율', val:48.3,  avg:65.1,  max:75,  display:'48.3%',  rank:'6위' },
    { label:'신입생 충원율',     val:99.8,  avg:100.1, max:105, display:'99.8%',  rank:'6위' },
    { label:'교원확보율',        val:62.89, avg:66.1,  max:100, display:'62.89%', rank:'5위' },
    { label:'기숙사 수용률',     val:12.2,  avg:14.9,  max:35,  display:'12.2%',  rank:'4위' },
  ];

  return (
    <div style={{ padding:0, position:'relative', overflow:'hidden' }}>
      <style>{STYLES}</style>

      {/* Background orbs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { x:'-8%',  y:'2%',  color:'#7c3aed', size:450, dur:22 },
          { x:'75%',  y:'15%', color:'#ff4d6d', size:320, dur:28 },
          { x:'45%',  y:'55%', color:'#22d3ee', size:260, dur:19 },
          { x:'5%',   y:'65%', color:'#a78bfa', size:200, dur:24 },
        ].map((o, i) => (
          <div key={i} style={{ position:'absolute', left:o.x, top:o.y, width:o.size, height:o.size, borderRadius:'50%', background:o.color, filter:'blur(110px)', opacity:0.06, animation:`orbFloat ${o.dur}s ease-in-out infinite`, animationDelay:`${i*4}s` }} />
        ))}
        {particles.map(p => (
          <div key={p.id} style={{ position:'absolute', left:`${p.left}%`, bottom:`${p.bottom}%`, width:p.size, height:p.size, borderRadius:'50%', background:p.color, opacity:0, animation:`floatParticle ${p.duration}s ease-in-out infinite`, animationDelay:`${p.delay}s`, boxShadow:`0 0 8px ${p.color}` }} />
        ))}
      </div>

      {/* Hero header */}
      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'52px 24px 40px', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)', animation:'scanDown 5s linear infinite' }} />
        </div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.35em', color:'#7c3aed', textTransform:'uppercase', marginBottom:14 }}>◆ 대학알리미 2025 공시 기준 ◆</div>
        <h1 style={{ fontSize:'clamp(26px,5vw,54px)', fontWeight:900, margin:'0 0 14px', background:'linear-gradient(135deg,#e2e8f0 0%,#c4b5fd 35%,#a78bfa 60%,#ff4d6d 100%)', backgroundSize:'200% 200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'gradientShift 5s ease-in-out infinite, heroTextGlow 3s ease-in-out infinite', lineHeight:1.15 }}>
          한세대학교 경쟁력 대시보드
        </h1>
        <p style={{ fontSize:14, color:'#64748b', margin:'0 0 28px', letterSpacing:'0.04em' }}>
          비교군 6개 대학(안양대 · 성결대 · 협성대 · 평택대 · 한신대) 종합 분석
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          {[{ label:'취업률', badge:'비교군 1위' }, { label:'장학금', badge:'비교군 1위' }, { label:'교육비', badge:'비교군 1위' }, { label:'경쟁률', badge:'비교군 공동 1위' }].map((s, i) => (
            <div key={i} style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.28)', borderRadius:30, padding:'7px 18px', display:'flex', alignItems:'center', gap:8, animation:`badgePulse 3s ${i*0.6}s ease-in-out infinite` }}>
              <span style={{ fontSize:12, color:'#64748b' }}>{s.label}</span>
              <span style={{ fontSize:13, fontWeight:800, color:'#4ade80' }}>{s.badge}</span>
            </div>
          ))}
        </div>
      </div>

      <Ticker />

      {/* KPI grid */}
      <div style={{ position:'relative', zIndex:1, padding:'36px 0 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:4, height:28, background:'linear-gradient(180deg,#7c3aed,#ff4d6d)', borderRadius:2 }} />
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#e2e8f0' }}>핵심 지표</h2>
          <span style={{ fontSize:12, color:'#475569' }}>— 클릭하면 상세 분석</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14 }}>
          {INDICATORS.map((ind, i) => (
            <KPICard key={ind.key} ind={ind} index={i} onClick={() => setSelectedIndicator(ind)} />
          ))}
        </div>
      </div>

      {/* Overall assessment */}
      <div style={{ position:'relative', zIndex:1, marginTop:44 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:4, height:28, background:'linear-gradient(180deg,#22d3ee,#7c3aed)', borderRadius:2 }} />
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#e2e8f0' }}>종합 평가</h2>
        </div>
        <div style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(255,77,109,0.04))', border:'1px solid rgba(124,58,237,0.22)', borderRadius:24, padding:'32px', animation:'borderGlow 5s ease-in-out infinite' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:32 }}>
            {/* Strengths */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 14px #4ade80' }} />
                <span style={{ fontSize:11, color:'#4ade80', fontWeight:700, letterSpacing:'0.1em' }}>STRENGTHS — 비교군 1위</span>
              </div>
              {STRENGTHS.map((item, i) => (
                <StrengthRow key={item.label} item={item} delay={i * 120 + 400} />
              ))}
            </div>
            {/* Challenges */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#f87171', boxShadow:'0 0 14px #f87171' }} />
                <span style={{ fontSize:11, color:'#f87171', fontWeight:700, letterSpacing:'0.1em' }}>CHALLENGES — 개선 과제</span>
              </div>
              {CHALLENGES.map((item, i) => (
                <ChallengeRow key={item.label} item={item} delay={i * 120 + 600} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat */}
      <div style={{ position:'relative', zIndex:1, marginTop:44 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:4, height:28, background:'linear-gradient(180deg,#7c3aed,#ff4d6d)', borderRadius:2 }} />
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:'#e2e8f0' }}>AI 분석 어시스턴트</h3>
        </div>
        <AIChat />
      </div>

      {selectedIndicator && <DetailModal detail={selectedIndicator} onClose={() => setSelectedIndicator(null)} />}
    </div>
  );
}

function StrengthRow({ item, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((item.val / item.max) * 100), delay); return () => clearTimeout(t); }, [item.val, item.max, delay]);
  const avgW = (item.avg / item.max) * 100;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:12, color:'#94a3b8' }}>{item.label}</span>
        <div>
          <span style={{ fontSize:13, fontWeight:800, color:'#4ade80' }}>{item.display}</span>
          <span style={{ fontSize:10, color:'#475569', marginLeft:8 }}>{item.avgDisp}</span>
        </div>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'visible', position:'relative' }}>
        <div style={{ height:'100%', borderRadius:4, width:`${w}%`, transition:`width 1.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, background:'linear-gradient(90deg,#4ade80,#22d3ee)', boxShadow:'0 0 12px rgba(74,222,128,0.5)', position:'relative', zIndex:1 }} />
        <div style={{ position:'absolute', top:-3, bottom:-3, left:`${avgW}%`, width:2, background:'rgba(255,255,255,0.3)', borderRadius:1, transition:`left 1.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, zIndex:2 }} />
      </div>
    </div>
  );
}

function ChallengeRow({ item, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((item.val / item.max) * 100), delay); return () => clearTimeout(t); }, [item.val, item.max, delay]);
  const avgW = (item.avg / item.max) * 100;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:12, color:'#94a3b8' }}>{item.label}</span>
        <div>
          <span style={{ fontSize:13, fontWeight:800, color:'#f87171' }}>{item.display}</span>
          <span style={{ fontSize:10, color:'#475569', marginLeft:8 }}>비교군 {item.rank}</span>
        </div>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'visible', position:'relative' }}>
        <div style={{ height:'100%', borderRadius:4, width:`${w}%`, transition:`width 1.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, background:'linear-gradient(90deg,#f87171,#fb923c)', boxShadow:'0 0 12px rgba(248,113,113,0.4)', position:'relative', zIndex:1 }} />
        <div style={{ position:'absolute', top:-3, bottom:-3, left:`${avgW}%`, width:2, background:'rgba(255,255,255,0.35)', borderRadius:1, transition:`left 1.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, zIndex:2 }} />
      </div>
    </div>
  );
}
