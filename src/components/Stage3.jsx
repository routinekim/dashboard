import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hansei, competitors } from '../data/universities';

const INDICATORS = [
  {
    key: 'employmentRate', label: '취업률', value: '71.0%', unit: '%',
    rank: '비교군 1위', rankColor: '#4ade80', icon: '💼',
    avg: 60.7, max: 100, numVal: 71.0,
    detail: 'employment',
    desc: '경기·인천권 3위, 전국 최상위권',
  },
  {
    key: 'competitionRate', label: '신입생 경쟁률', value: '11.7:1', unit: ':1',
    rank: '비교군 공동 1위', rankColor: '#4ade80', icon: '🎯',
    avg: 9.0, max: 15, numVal: 11.7,
    detail: 'competition',
    desc: '수험생 선호도 최상위',
  },
  {
    key: 'fillRate', label: '신입생 충원율', value: '99.8%', unit: '%',
    rank: '비교군 6위', rankColor: '#fb923c', icon: '📋',
    avg: 100.1, max: 105, numVal: 99.8,
    detail: 'fill',
    desc: '100% 달성 목표 관리 필요',
  },
  {
    key: 'facultyRateByQuota', label: '교원확보율', value: '62.89%', unit: '%',
    rank: '비교군 5위', rankColor: '#fb923c', icon: '👩‍🏫',
    avg: 66.1, max: 100, numVal: 62.89,
    detail: 'faculty',
    desc: '전임교원 확충 필요',
  },
  {
    key: 'scholarshipPerStudent', label: '1인당 장학금', value: '431만원', unit: '원',
    rank: '비교군 1위', rankColor: '#4ade80', icon: '🎓',
    avg: 389, max: 450, numVal: 431,
    detail: 'scholarship',
    desc: '학생 경제적 지원 최강',
  },
  {
    key: 'educationCostPerStudent', label: '1인당 교육비', value: '13,445천원', unit: '천원',
    rank: '비교군 1위', rankColor: '#4ade80', icon: '📚',
    avg: 12639, max: 14000, numVal: 13445,
    detail: 'education',
    desc: '교육 투자 집중도 최상위',
  },
  {
    key: 'dormitoryRate', label: '기숙사 수용률', value: '12.2%', unit: '%',
    rank: '비교군 4위', rankColor: '#fb923c', icon: '🏠',
    avg: 14.9, max: 35, numVal: 12.2,
    detail: 'dormitory',
    desc: '확충 통한 지방학생 유치 필요',
  },
  {
    key: 'fullTimeLectureRatio', label: '전임교원 강의비율', value: '48.3%', unit: '%',
    rank: '비교군 6위', rankColor: '#f87171', icon: '🎤',
    avg: 65.1, max: 75, numVal: 48.3,
    detail: 'lecture',
    desc: '시급한 개선 과제',
  },
  {
    key: 'enrolled', label: '재학생 수', value: '2,509명', unit: '명',
    rank: '소규모 특화', rankColor: '#a78bfa', icon: '👥',
    avg: 4009, max: 6000, numVal: 2509,
    detail: 'students',
    desc: '집중 투자 가능한 소규모',
  },
];

const DETAIL_DATA = {
  employment: {
    title: '취업률 상세 분석',
    summary: '한세대학교는 2025년 취업률 71.0%로 비교군 6개 대학 중 압도적 1위를 기록했습니다. 이는 경기·인천권 4년제 대학 중 상위권에 해당하며, 전국 기준으로도 최상위 15% 이내입니다.',
    points: [
      '경기·인천권 4년제 취업률 3위 이내 (73.5% 포함 최고 기록 포함)',
      'REACH 교육혁신 모델 — 18대 혁신과제 추진으로 실무 역량 강화',
      'D3D커리어맵(Do Dream→Design→Development) 학년별 맞춤 운영',
      '대학일자리플러스센터 집중 프로그램 운영',
      '비교군 2위 안양대(64.1%) 대비 +6.9%p 격차 유지',
    ],
    compareData: [
      { name: '한세대', val: 71.0, isHansei: true },
      { name: '안양대', val: 64.1 },
      { name: '성결대', val: 64.0 },
      { name: '한신대', val: 59.0 },
      { name: '평택대', val: 58.4 },
      { name: '협성대', val: 58.1 },
    ],
    unit: '%',
  },
  competition: {
    title: '신입생 경쟁률 상세 분석',
    summary: '신입생 경쟁률 11.7:1은 비교군 공동 1위(안양대와 동일)이며, 비교군 평균 9.0:1 대비 2.7 높은 수준입니다. 높은 취업률이 수험생 선호로 이어지는 선순환 구조가 확인됩니다.',
    points: [
      '취업률 1위 → 수험생 선호도 상승의 선순환 구조',
      '비교군 평균(9.0:1) 대비 +2.7 우위',
      '안양대와 공동 1위 — 수도권 접근성 강점 공유',
      '소규모 정원(566명)으로 경쟁률 유지에 유리한 구조',
    ],
    compareData: [
      { name: '한세대', val: 11.7, isHansei: true },
      { name: '안양대', val: 11.7 },
      { name: '평택대', val: 8.8 },
      { name: '성결대', val: 8.5 },
      { name: '협성대', val: 8.3 },
      { name: '한신대', val: 6.9 },
    ],
    unit: ':1',
  },
  fill: {
    title: '신입생 충원율 상세 분석',
    summary: '신입생 충원율 99.8%는 비교군 중 유일하게 100%를 미달한 수치입니다. 실질적으로 거의 완충 상태이나, 학령인구 감소 추세에서 100% 달성이 핵심 관리 목표입니다.',
    points: [
      '비교군 6위 — 유일한 100% 미달 대학',
      '0.2%p 미달은 현재 미미하나 추세 관리 필요',
      '교육부 2025~2027 평가에서 충원율 가중치 1.5배 확대',
      '취업률 홍보 강화 및 장학금 우위 활용으로 개선 가능',
    ],
    compareData: [
      { name: '안양대', val: 100.4 },
      { name: '성결대', val: 100.0 },
      { name: '협성대', val: 100.0 },
      { name: '평택대', val: 100.0 },
      { name: '한신대', val: 100.0 },
      { name: '한세대', val: 99.8, isHansei: true },
    ],
    unit: '%',
  },
  faculty: {
    title: '교원확보율 상세 분석',
    summary: '교원확보율(정원 기준) 62.89%는 비교군 5위로 하위권입니다. 전임교원 100명 보유로 소규모 대학의 법정 기준 충족이 과제이며, 전임교원 강의비율(48.3%)도 함께 개선이 필요합니다.',
    points: [
      '정원 기준 확보율 62.89% — 비교군 5위',
      '한신대(74.79%) 대비 약 12%p 격차',
      '전임교원 강의담당비율 48.3% — 비교군 최하위 (6위)',
      '교원확보율 개선 없이는 대학재정지원 평가 불이익 위험',
      '3개년 전임교원 채용 로드맵 수립 권장',
    ],
    compareData: [
      { name: '한신대', val: 74.79 },
      { name: '평택대', val: 66.67 },
      { name: '성결대', val: 66.27 },
      { name: '협성대', val: 63.68 },
      { name: '한세대', val: 62.89, isHansei: true },
      { name: '안양대', val: 61.21 },
    ],
    unit: '%',
  },
  scholarship: {
    title: '1인당 장학금 상세 분석',
    summary: '학생 1인당 연간 장학금 431만원은 비교군 1위입니다. 등록금(8,860천원)이 비교군 중 가장 높은 편이지만, 장학금 1위로 실질 부담을 완화하여 학생 유인 효과를 유지하고 있습니다.',
    points: [
      '1인당 장학금 431만원 — 비교군 1위',
      '비교군 최하위(한신대 366만원) 대비 +65만원 우위',
      '소규모 재학생(2,509명)으로 집중 배분 가능한 구조적 강점',
      '등록금 최고(8,860천원) + 장학금 최고 = 실질 납부액 관리',
      '"장학금 1위 대학" 홍보를 통한 신입생 유치 전략 활용 권장',
    ],
    compareData: [
      { name: '한세대', val: 431, isHansei: true },
      { name: '평택대', val: 422 },
      { name: '안양대', val: 402 },
      { name: '협성대', val: 368 },
      { name: '성결대', val: 366 },
      { name: '한신대', val: 366 },
    ],
    unit: '만원',
  },
  education: {
    title: '1인당 교육비 상세 분석',
    summary: '학생 1인당 교육비 13,445천원은 비교군 1위입니다. 대학이 학생 1인당 투자하는 교육 자원이 가장 많음을 의미하며, 소규모 운영 전략의 질적 성과입니다.',
    points: [
      '1인당 교육비 13,445천원 — 비교군 1위',
      '성결대(12,008천원) 대비 +1,437천원 높은 투자 수준',
      '소규모 대학의 집중 투자 효과 — 재학생 적을수록 1인당 투자 증가',
      '대학혁신지원사업 재정 지원으로 교육비 확보',
      '교육 품질 지표로 활용 가능한 홍보 자산',
    ],
    compareData: [
      { name: '한세대', val: 13445, isHansei: true },
      { name: '평택대', val: 13339 },
      { name: '협성대', val: 13158 },
      { name: '안양대', val: 13092 },
      { name: '한신대', val: 12241 },
      { name: '성결대', val: 12008 },
    ],
    unit: '천원',
  },
  dormitory: {
    title: '기숙사 수용률 상세 분석',
    summary: '기숙사 수용률 12.2%는 재학생 2,509명 중 약 306명만 기숙사 이용 가능한 수준입니다. 수도권 위치로 자가 통학자 비율이 높으나, 지방 우수 학생 유치를 위한 확충이 전략적 과제입니다.',
    points: [
      '기숙사 수용률 12.2% — 비교군 4위',
      '평택대(30.1%)가 압도적 1위로 지방 학생 유치에 유리',
      '군포 소재 특성상 수도권 통학 비율 높아 상대적 필요성 낮음',
      '지방 출신 우수 학생 유치 확대 위해 20% 이상 목표 권장',
      '기숙사 신축보다 협력 주거 서비스 도입 검토 권장',
    ],
    compareData: [
      { name: '평택대', val: 30.1 },
      { name: '한신대', val: 14.2 },
      { name: '협성대', val: 12.5 },
      { name: '한세대', val: 12.2, isHansei: true },
      { name: '성결대', val: 11.1 },
      { name: '안양대', val: 6.8 },
    ],
    unit: '%',
  },
  lecture: {
    title: '전임교원 강의비율 상세 분석',
    summary: '전임교원 강의담당비율 48.3%는 비교군 최하위(6위)이며, 교육부 권고 기준(60% 이상)에도 미달합니다. 비전임 강사 의존도가 높아 교육 안정성과 학생 지도 연속성 측면에서 가장 시급한 개선 과제입니다.',
    points: [
      '전임교원 강의비율 48.3% — 비교군 최하위 (6위)',
      '비교군 평균(65.1%) 대비 무려 -16.8%p 격차',
      '교육부 권고 기준(60%) 미달로 재정지원사업 평가 불이익 위험',
      '비전임 강사 의존도 높아 교육 일관성 저하 가능성',
      '2025~2027 전임교원 신규 채용 계획 수립 및 단계적 개선 필요',
    ],
    compareData: [
      { name: '평택대', val: 67.3 },
      { name: '한신대', val: 66.9 },
      { name: '안양대', val: 66.9 },
      { name: '협성대', val: 64.3 },
      { name: '성결대', val: 59.2 },
      { name: '한세대', val: 48.3, isHansei: true },
    ],
    unit: '%',
  },
  students: {
    title: '재학생 규모 분석',
    summary: '재학생 2,509명은 비교군 중 최소 규모입니다. 이는 단순한 규모 열위가 아니라, 소규모 집중 투자 전략의 기반으로 1인당 장학금·교육비 1위라는 질적 우위로 이어집니다.',
    points: [
      '재학생 2,509명 — 비교군 최소 규모',
      '비교군 평균(4,009명) 대비 약 63% 수준',
      '소규모 운영 → 1인당 자원 집중 가능 → 장학금·교육비 1위',
      '취업 맞춤 소그룹 교육, 교수-학생 밀착 지도 가능',
      '"소규모 명품 교육" 전략의 구조적 기반',
    ],
    compareData: [
      { name: '성결대', val: 5241 },
      { name: '한신대', val: 5172 },
      { name: '안양대', val: 4353 },
      { name: '협성대', val: 3773 },
      { name: '평택대', val: 3006 },
      { name: '한세대', val: 2509, isHansei: true },
    ],
    unit: '명',
  },
};

const mdComponents = {
  h1: ({ children }) => <h2 style={{ fontSize: 22, fontWeight: 800, color: '#c4b5fd', marginBottom: 12, marginTop: 24 }}>{children}</h2>,
  h2: ({ children }) => <h3 style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa', marginBottom: 10, marginTop: 20 }}>{children}</h3>,
  h3: ({ children }) => <h4 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 8, marginTop: 16 }}>{children}</h4>,
  strong: ({ children }) => <strong style={{ color: '#c4b5fd', fontWeight: 700 }}>{children}</strong>,
  p: ({ children }) => <p style={{ fontSize: 14, lineHeight: 1.9, color: '#cbd5e1', marginBottom: 10 }}>{children}</p>,
  li: ({ children }) => <li style={{ fontSize: 13, lineHeight: 1.8, color: '#94a3b8', marginBottom: 4 }}>{children}</li>,
  ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ol>,
};

function DetailModal({ detail, onClose }) {
  if (!detail) return null;
  const data = DETAIL_DATA[detail.detail];
  if (!data) return null;
  const maxVal = Math.max(...data.compareData.map(d => d.val));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #0f0c29, #1a1a3e)',
          border: '1px solid rgba(124,58,237,0.4)', borderRadius: 20,
          padding: '32px', maxWidth: 640, width: '100%',
          maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 0 60px rgba(124,58,237,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{detail.icon}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>{data.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.8, color: '#94a3b8', marginBottom: 24, borderLeft: '3px solid #7c3aed', paddingLeft: 14 }}>
          {data.summary}
        </p>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, fontWeight: 600 }}>비교군 비교</div>
          {data.compareData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 56, fontSize: 11, textAlign: 'right', color: d.isHansei ? '#ff4d6d' : '#94a3b8', fontWeight: d.isHansei ? 700 : 400, flexShrink: 0 }}>
                {d.isHansei ? '★ ' : ''}{d.name}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 22, position: 'relative' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${(d.val / maxVal) * 100}%`,
                  background: d.isHansei ? 'linear-gradient(90deg, #ff4d6d, #ff8c69)' : 'linear-gradient(90deg, #4c1d95, #7c3aed)',
                  display: 'flex', alignItems: 'center', paddingLeft: 8,
                  fontSize: 11, color: 'white', fontWeight: 600,
                }}>
                  {d.val}{data.unit}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, fontWeight: 600 }}>핵심 인사이트</div>
          {data.points.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 20, background: 'rgba(124,58,237,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="/report.html" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', fontSize: 12, textDecoration: 'none' }}>
            📄 전체 보고서에서 자세히 보기 →
          </a>
        </div>
      </div>
    </div>
  );
}

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 한세대학교 데이터 분석 AI 어시스턴트입니다. 대학 지표, 비교 분석, 발전 전략 등에 대해 질문해 주세요. 📊',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const SYSTEM_PROMPT = `당신은 한세대학교 대학 데이터 분석 전문가입니다.
대학알리미 2025년 공시 데이터를 기반으로 한세대학교의 경쟁력을 분석하고 답변합니다.

한세대학교 핵심 데이터:
- 소재지: 경기도 군포시 / 사립대학 / 입학정원 566명 / 재학생 2,509명 / 전임교원 100명
- 취업률: 71.0% (비교군 1위, 경기·인천권 3위 이내)
- 신입생 경쟁률: 11.7:1 (비교군 공동 1위)
- 신입생 충원율: 99.8% (비교군 최하위 — 유일 100% 미달)
- 교원확보율(정원): 62.89% (비교군 5위)
- 교원확보율(재학): 64.52%
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
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const history = messages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      history.push({ role: 'user', parts: [{ text: input }] });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: history,
            generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
          }),
        }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 받지 못했습니다.';
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `오류가 발생했습니다: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '한세대 취업률이 높은 이유는?',
    '가장 시급한 개선 과제는?',
    '교육부 정책 대응 전략은?',
    '소규모 대학의 장단점은?',
  ];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 20, padding: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ff4d6d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#e2e8f0' }}>AI 분석 어시스턴트</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Gemini 2.5 Flash · 한세대 데이터 기반</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {quickQuestions.map(q => (
          <button
            key={q}
            onClick={() => setInput(q)}
            style={{
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              color: '#a78bfa', borderRadius: 20, padding: '6px 14px', fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >{q}</button>
        ))}
      </div>

      <div style={{
        height: 420, overflowY: 'auto', marginBottom: 16, padding: '4px 0',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 16,
          }}>
            <div style={{
              maxWidth: '85%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #7c3aed, #9b59b6)'
                : 'rgba(255,255,255,0.04)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: '12px 16px',
            }}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p style={{ fontSize: 14, color: '#fff', margin: 0 }}>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: '#7c3aed',
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="한세대 데이터에 대해 질문해보세요..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, padding: '12px 16px', color: '#e2e8f0', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7c3aed, #9b59b6)',
            border: 'none', borderRadius: 12, padding: '12px 20px', color: 'white',
            fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600,
          }}
        >전송</button>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default function Stage3() {
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const kpiStyle = (ind) => ({
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${selectedIndicator?.key === ind.key ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 16, padding: '20px', cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: selectedIndicator?.key === ind.key ? '0 0 20px rgba(124,58,237,0.3)' : 'none',
  });

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 32, background: 'linear-gradient(180deg, #7c3aed, #ff4d6d)', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>
            한세대학교 전용 대시보드
          </h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, marginLeft: 16, fontSize: 14 }}>
          지표 카드를 클릭하면 상세 분석을 볼 수 있습니다 · 대학알리미 2025 기준
        </p>
      </div>

      {/* 핵심 지표 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {INDICATORS.map(ind => (
          <div
            key={ind.key}
            style={kpiStyle(ind)}
            onClick={() => setSelectedIndicator(ind)}
            onMouseEnter={e => {
              if (selectedIndicator?.key !== ind.key) {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              if (selectedIndicator?.key !== ind.key) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{ind.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{ind.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{ind.label}</div>
            <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: '3px 10px' }}>
              <span style={{ fontSize: 11, color: ind.rankColor, fontWeight: 600 }}>{ind.rank}</span>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${Math.min(100, (ind.numVal / ind.max) * 100)}%`,
                background: ind.rankColor === '#4ade80'
                  ? 'linear-gradient(90deg, #4ade80, #22d3ee)'
                  : ind.rankColor === '#f87171'
                    ? '#f87171'
                    : 'linear-gradient(90deg, #fb923c, #fbbf24)',
              }} />
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>{ind.desc}</div>
          </div>
        ))}
      </div>

      {/* 종합 평가 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(255,77,109,0.05))',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 20, padding: '28px', marginBottom: 32,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
          📊 종합 평가 — 비교군 대비 포지션
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, marginBottom: 12 }}>🏆 강점 지표 (비교군 1위)</div>
            {[
              { label: '취업률', val: '71.0%', vs: '평균 60.7%' },
              { label: '신입생 경쟁률', val: '11.7:1', vs: '평균 9.0:1' },
              { label: '1인당 장학금', val: '431만원', vs: '평균 389만원' },
              { label: '1인당 교육비', val: '13,445천원', vs: '평균 12,639천원' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>{item.label}</span>
                <span><strong style={{ color: '#4ade80' }}>{item.val}</strong> <span style={{ color: '#475569', fontSize: 11 }}>({item.vs})</span></span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#f87171', fontWeight: 700, marginBottom: 12 }}>⚠️ 개선 과제 (비교군 하위)</div>
            {[
              { label: '전임교원 강의비율', val: '48.3%', vs: '평균 65.1%', rank: '6위' },
              { label: '신입생 충원율', val: '99.8%', vs: '평균 100.1%', rank: '6위' },
              { label: '교원확보율', val: '62.89%', vs: '평균 66.1%', rank: '5위' },
              { label: '기숙사 수용률', val: '12.2%', vs: '평균 14.9%', rank: '4위' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>{item.label}</span>
                <span><strong style={{ color: '#f87171' }}>{item.val}</strong> <span style={{ color: '#475569', fontSize: 11 }}>(비교군 {item.rank})</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 챗봇 */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg, #7c3aed, #ff4d6d)', borderRadius: 2 }} />
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>AI 분석 어시스턴트</h3>
        </div>
        <AIChat />
      </div>

      {selectedIndicator && (
        <DetailModal detail={selectedIndicator} onClose={() => setSelectedIndicator(null)} />
      )}
    </div>
  );
}
