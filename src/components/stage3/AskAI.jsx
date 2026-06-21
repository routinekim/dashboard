import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const COMPARISON_DATA = {
  안양대학교: { 취업률: 64.1, 신입생경쟁률: 11.7, 신입생충원율: 100.4, 교원확보율_정원: 61.21, 전임교원강의비율: 66.9, 학생1인당장학금: 4024950, 학생1인당교육비: 13092200, 기숙사수용율: 6.8, 재학생수: 4353, 평균등록금: 8261400 },
  성결대학교: { 취업률: 64.0, 신입생경쟁률: 8.5, 신입생충원율: 100.0, 교원확보율_정원: 66.27, 전임교원강의비율: 59.2, 학생1인당장학금: 3661062, 학생1인당교육비: 12008100, 기숙사수용율: 11.1, 재학생수: 5241, 평균등록금: 7857100 },
  협성대학교: { 취업률: 58.1, 신입생경쟁률: 8.3, 신입생충원율: 100.0, 교원확보율_정원: 63.68, 전임교원강의비율: 64.3, 학생1인당장학금: 3683617, 학생1인당교육비: 13157600, 기숙사수용율: 12.5, 재학생수: 3773, 평균등록금: 8135300 },
  평택대학교: { 취업률: 58.4, 신입생경쟁률: 8.8, 신입생충원율: 100.0, 교원확보율_정원: 66.67, 전임교원강의비율: 67.3, 학생1인당장학금: 4225282, 학생1인당교육비: 13339000, 기숙사수용율: 30.1, 재학생수: 3006, 평균등록금: 8198800 },
  한신대학교: { 취업률: 59.0, 신입생경쟁률: 6.9, 신입생충원율: 100.0, 교원확보율_정원: 74.79, 전임교원강의비율: 66.9, 학생1인당장학금: 3660015, 학생1인당교육비: 12240700, 기숙사수용율: 14.2, 재학생수: 5172, 평균등록금: 7882200 },
}

function buildSystemPrompt(hansei) {
  const compRows = Object.entries(COMPARISON_DATA)
    .map(([name, d]) => `| ${name} | ${d.취업률}% | ${d.신입생경쟁률}:1 | ${d.교원확보율_정원}% | ${d.전임교원강의비율}% | ${Math.round(d.학생1인당장학금/10000)}만원 | ${d.기숙사수용율}% |`)
    .join('\n')

  return `당신은 한세대학교 AX(Academic Excellence) 경쟁력 분석 전문 AI 어시스턴트입니다.
아래 데이터와 보고서를 기반으로 사용자의 질문에 정확하고 구체적으로 답변하세요.
답변은 한국어로, 간결하고 명확하게 작성하세요. 필요하면 수치를 인용하세요.

## 한세대학교 핵심 데이터 (2025년 대학알리미 공시)

- 소재지: 경기도 군포시 / 설립: 사립
- 입학정원: ${hansei?.입학정원 || 566}명 / 재학생: ${hansei?.재학생수 || 2509}명
- 전임교원 수: ${hansei?.전임교원수 || 100}명
- **취업률: ${hansei?.취업률 || 71}%** (비교군 1위)
- **신입생경쟁률: ${hansei?.신입생경쟁률 || 11.7}:1** (비교군 1위, 안양대와 공동)
- 신입생충원율: ${hansei?.신입생충원율 || 99.8}% (비교군 유일 100% 미달)
- 교원확보율(정원): ${hansei?.교원확보율_정원 || 62.89}% (비교군 5위)
- **전임교원강의비율: ${hansei?.전임교원강의비율 || 48.3}%** (비교군 최하위 — 가장 심각한 약점)
- 1인당 장학금: ${Math.round((hansei?.학생1인당장학금 || 4313203)/10000)}만원 (비교군 1위)
- 1인당 교육비: ${Math.round((hansei?.학생1인당교육비 || 13445200)/10000)}만원 (비교군 1위)
- 기숙사수용률: ${hansei?.기숙사수용율 || 12.2}% (비교군 4위)
- 평균등록금: ${Math.round((hansei?.평균등록금 || 8859600)/10000)}만원 (비교군 최고)

## 비교 대학군 (경기권 사립 4년제)

| 대학 | 취업률 | 경쟁률 | 교원확보율 | 전임강의비율 | 장학금 | 기숙사 |
|------|--------|--------|-----------|------------|--------|--------|
| **한세대학교** | **71%** | **11.7:1** | 62.89% | **48.3%** | **431만원** | 12.2% |
${compRows}

## 분석 보고서 핵심 요약

### 강점
1. 취업률 71% — 비교군 평균(60.7%) 대비 +10.3%p, 압도적 1위
2. 신입생경쟁률 11.7:1 — 소규모 대학임에도 안양대와 공동 1위
3. 1인당 장학금·교육비 모두 비교군 1위 — 학생 밀착 투자 최대
4. 소규모(2,509명) 특성이 실무형 밀착 교육에 유리

### 약점
1. 전임교원강의비율 48.3% — 비교군 최하, 강의 절반 이상이 비전임 담당
2. 교원확보율 62.89% — 법정기준(100%) 대비 37% 부족
3. 등록금 886만원(최고) + 전임강의비율 최하 = 불균형 리스크
4. 기숙사 수용률 12.2% — 지방 학생 유치 장벽
5. 충원율 99.8% — 비교군 유일 100% 미달

### 전략 제언
- 단기: 전임교원강의비율 55%+ 달성, 취업률 데이터 홍보 전면 활용
- 중기: 기숙사 수용률 20%+ 확충, 교원 충원 계획 수립
- 장기: 글로컬대학 사업 유치, 첨단산업 연계 특성화

### 교육부 2025년 정책 연계
- 대학기본역량진단: 전임교원강의비율 개선 시급 (재정지원제한 리스크)
- 글로컬대학 30: 소규모 특성화 모델로 적합, 교원지표 개선 선행 필요
- 취업률 중심 평가 강화: 한세대의 71% 취업률이 핵심 자산
- 첨단산업 인재양성: 수도권 근접 입지 + 산학협력 취업 강점 활용 가능

질문에 데이터 수치가 필요하면 위 표를 참고하여 정확히 인용하세요.`
}

const QUICK = ['취업률이 왜 높아요?', '가장 시급한 개선 과제는?', '전임교원강의비율 문제는?', '경쟁 대학과의 차이점은?']

const mdComponents = {
  h1: ({ children }) => (
    <div style={{ color: '#a78bfa', fontSize: 20, fontWeight: 800, marginBottom: 10, marginTop: 14, paddingBottom: 8, borderBottom: '1px solid rgba(167,139,250,0.2)' }}>{children}</div>
  ),
  h2: ({ children }) => (
    <div style={{ color: '#a78bfa', fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 14 }}>{children}</div>
  ),
  h3: ({ children }) => (
    <div style={{ color: '#93c5fd', fontSize: 16, fontWeight: 700, marginBottom: 6, marginTop: 12 }}>{children}</div>
  ),
  p: ({ children }) => (
    <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.85, margin: '4px 0 8px' }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: '#fde68a', fontWeight: 700, fontSize: '1.05em' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: '#86efac', fontStyle: 'normal', fontWeight: 600, fontSize: '1.05em' }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul style={{ listStyle: 'none', margin: '6px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ listStyle: 'none', margin: '6px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 5, counterReset: 'li' }}>{children}</ol>
  ),
  li: ({ children, ordered }) => (
    <li style={{ display: 'flex', gap: 8, color: '#cbd5e1', fontSize: 14, lineHeight: 1.75 }}>
      <span style={{ color: '#7c3aed', flexShrink: 0, marginTop: 2 }}>{ordered ? '•' : '▸'}</span>
      <span>{children}</span>
    </li>
  ),
  hr: () => (
    <div style={{ borderTop: '1px solid rgba(124,58,237,0.25)', margin: '12px 0' }} />
  ),
  code: ({ inline, children }) => inline ? (
    <code style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', padding: '1px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{children}</code>
  ) : (
    <pre style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', margin: '8px 0', overflowX: 'auto' }}>
      <code style={{ color: '#a5f3fc', fontSize: 12, fontFamily: 'monospace' }}>{children}</code>
    </pre>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', padding: '6px 10px', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid rgba(124,58,237,0.3)' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ color: '#cbd5e1', padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{children}</td>
  ),
  blockquote: ({ children }) => (
    <div style={{ borderLeft: '3px solid #7c3aed', paddingLeft: 12, margin: '8px 0', color: '#94a3b8', fontStyle: 'italic' }}>{children}</div>
  ),
}

export default function AskAI({ hansei }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: '안녕하세요! 한세대학교 데이터와 분석 보고서에 대해 무엇이든 질문해 주세요.\n\n아래 버튼을 누르거나 직접 입력하세요.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  function getSession() {
    if (sessionRef.current) return sessionRef.current
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY 환경변수가 없습니다.')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: buildSystemPrompt(hansei),
    })
    sessionRef.current = model.startChat({ history: [] })
    return sessionRef.current
  }

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const chat = getSession()
      const result = await chat.sendMessage(msg)
      setMessages(prev => [...prev, { role: 'model', text: result.response.text() }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', text: `오류: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 24,
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(124,58,237,0.12)',
        borderBottom: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>✨</span>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>AI 분석 어시스턴트</div>
          <div style={{ color: '#7c3aed', fontSize: 11 }}>Gemini 2.5 Flash · 한세대 데이터 학습</div>
        </div>
      </div>

      {/* 빠른 질문 버튼 */}
      {messages.length <= 1 && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a78bfa', fontSize: 12, padding: '6px 14px',
              borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 메시지 목록 */}
      <div ref={chatRef} style={{
        height: 340, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: m.role === 'user' ? '75%' : '100%',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '12px',
              background: m.role === 'user'
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : m.role === 'error'
                ? 'rgba(239,68,68,0.12)'
                : 'rgba(255,255,255,0.04)',
              border: m.role !== 'user' ? `1px solid ${m.role === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}` : 'none',
              wordBreak: 'break-word',
            }}>
              {m.role === 'user' ? (
                <span style={{ color: '#f1f5f9', fontSize: 13, lineHeight: 1.7 }}>{m.text}</span>
              ) : m.role === 'error' ? (
                <span style={{ color: '#fca5a5', fontSize: 13 }}>{m.text}</span>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {m.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '8px 4px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%', background: '#7c3aed',
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
            <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}`}</style>
          </div>
        )}
      </div>

      {/* 입력창 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', gap: 8,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="데이터나 보고서에 대해 질문하세요..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 12, color: '#e2e8f0', fontSize: 13,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: loading || !input.trim()
              ? 'rgba(124,58,237,0.2)'
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', color: '#fff', fontSize: 20,
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >↑</button>
      </div>
    </div>
  )
}
