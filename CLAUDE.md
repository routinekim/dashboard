# 프로젝트 개요

**대학알리미 기반 한세대학교 경쟁력 분석 **

— 청중에게 임팩트를 주는 실시간 인터랙티브 대학 데이터 시각화 앱  

기반 데이터: `대학알리미.xlsx`

---

# 기술 스택

- **Frontend**: React, Recharts, D3.js
- **디자인**: 사이버 터미널 테마 — `#060E1F` 딥 네이비 배경 + 청색 격자 그리드, 시안(`#00d4ff`) 네온 포인트 컬러, 애니메이션 차트, 반응형 레이아웃
- **AI**: Gemini 2.5 Flash API (키는 `.env` 파일의 `GEMINI_API_KEY` 참조)

---

# 개발 순서 및 주요 기능

## 1단계 — 전국 대학 포지셔닝 대시보드

**목표**: 청중의 "와!" 소리가 나오는 인터랙티브 앱

1단계 — 전국 대학 포지셔닝 맵/레이더 차트는 universities_data.json을 참고해— `대학알리미.xlsx` 직접 파싱 금지

① 포지셔닝 맵 (버블차트)

- X축 / Y축 / 버블 크기 — 드롭다운으로 자유롭게 선택 가능 (아래 목록 참조)
- 버블 색상 = 국립 / 사립 / 특별법 구분
- 한세대학교 위치 강조 표시 (빨간 별 + 펄스 애니메이션)
- 마우스 호버 시 대학 상세정보 팝업 (선택된 지표 기준으로 표시)

**축 선택 가능 지표 (X축 · Y축 공통, 10종):**

취업률, 신입생 경쟁률, 신입생 충원율, 교원확보율(정원), 교원확보율(재학),

교원1인당 학생수, 1인당 장학금, 1인당 교육비, 기숙사 수용률, 전임교원 강의비율

**버블 크기 선택 가능 지표 (3종):**

재학생 수, 입학정원, 졸업생 수

### ② 실시간 대학 비교 도구 (레이더 차트)

- 드롭다운으로 안양대, 성결대, 협성대, 평택대, 한신대 선택
- 레이더 차트(거미줄)로 6개 지표 한눈에 비교

  - 취업률, 교원확보율, 학생 1인당 교육비, 장학금, 기숙사 수용률, 경쟁률

---

## 2단계 — 한세대학교 분석 보고서 (A4 20페이지)

- **동일 지역/유형/규모 대학 상위 5개교와 비교 분석
  
  - 데이터 소스: `hansei_report_data.json` 단일 참조** — `대학알리미.xlsx` 직접 파싱 금지
  - 구조: `hansei`(한세대 전체 지표) + `competitors`(비교군 5개교) + `all`(전체)

- 교육부 2025년, 2026년 대학혁신 정책과 연결

- 최신 뉴스·정책 문서는 웹서치로 보완

- Gemini api 호출은 사용하지 말것

- 흰 바탕에 깔끔한 보고서 형식 html로 만들어줘.

- **HTML 섹션별 분할 생성 후 합치기** — 20페이지를 한 번에 생성하지 말 것
  
  - 섹션 1: 표지 + 목차 + 한세대 개요
  - 섹션 2: 강점 지표 분석 (취업률·경쟁률·장학금·교육비)
  - 섹션 3: 개선 과제 분석 (충원율·교원확보율·강의비율·기숙사)
  - 섹션 4: 비교군 종합 비교표 + 시각화
  - 섹션 5: 교육부 정책 대응 전략 (웹서치 결과 반영)
  - 섹션 6: 종합 결론 + 권고사항
  - 각 섹션 독립 생성 → 마지막에 하나의 HTML 파일로 병합
  - 실패 시 해당 섹션만 재생성, 나머지 재사용

---

## 3단계 — 한세대학교 전용 대시보드 (2단계 완료 후 개발)

- 한세대 데이터를 한눈에 볼 수 있는 종합 대시보드
- 각 지표 클릭 시 → 2단계 보고서 기반 분석 자료 팝업/상세 페이지 연결
- 디자인: 사이버 터미널 테마 — `#060E1F` 딥 네이비 + 청색 격자 그리드, 시안(`#00d4ff`) 네온 포인트 컬러

**색상 규칙:**

- 배경: `#060E1F` (딥 네이비)
- 그리드: `rgba(0, 100, 200, 0.045)` — 44px 격자, `background-image: linear-gradient` 이중 레이어
- 강점 지표: `#00d4ff` (시안) — 취업률·경쟁률·충원율·장학금
- 개선 과제: `#ff4444` (레드) / `#ff8800` (오렌지)
- LIVE 닷: `#39ff14` (네온 그린)
- 패널 상단 글로우: 해당 섹션 지표 색상으로 결정
- 1위 배지: `#00d4ff`, 최하위: `#f87171`, 중위: `#fb923c`

**시각 효과 표준 (모든 대시보드 컴포넌트에 적용):**

- **파티클 배경**: `useMemo`로 20개 입자 생성 → `floatParticle` 키프레임으로 위로 떠오르는 애니메이션, 색상은 시안/블루 계열 순환
- **배경 오브**: 위치·크기 다른 4개의 대형 블러 원(opacity 0.07)에 `orbFloat` 키프레임 적용, 색상 `#0044cc`/`#0088ff`/`#003388`/`#00aaff`
- **청색 격자 그리드**: `position: fixed; inset: 0` div에 이중 `linear-gradient` 격자 — 항상 화면 전체에 깔림
- **히어로 헤더**: `gradientShift` 키프레임으로 살아있는 그라데이션 텍스트 + `heroTextGlow` 발광 효과(시안 계열) + 스캔라인(`scanDown`)
- **LIVE 표시**: 초록 점멸 닷 `#39ff14` + `livePulse` 키프레임 + "LIVE" 레터스페이싱 텍스트 — 헤더 배지 우측에 배치
- **스크롤 티커**: 핵심 성취 지표를 무한 좌우 스크롤 배너로 표시 (`ticker` 키프레임, 항목 2배 복사로 seamless loop)
- **카운트업 숫자**: `useEffect` + `requestAnimationFrame`으로 0→실제값 easeOut cubic 애니메이션 (duration 1600ms), `text-shadow` 발광 효과 적용
- **숫자 글로우**: 주요 수치에 `text-shadow: 0 0 16px {color}88, 0 0 32px {color}44` 적용
- **패널 분리 구조**: 섹션·카드 상단에 `linear-gradient(90deg, transparent, {color}, transparent)` 1px 라인 + `box-shadow` 글로우, `panelGlow` 키프레임으로 맥동
- **미니 라인 차트** (`MiniLineChart`): 강점 지표 카드에 SVG 스파크라인 — 비교군 6개교 값을 시안 선으로 연결, `feGaussianBlur` 글로우 필터, 한세대 포인트 강조
- **미니 바 차트** (`MiniBarChart`): 개선 과제 카드에 SVG 막대 — 6개교 내림차순 정렬, 한세대 바만 원색 + 글로우
- **카드 스태거 입장**: 각 카드 `opacity 0→1`, `translateY 36px→0` 전환, `index × 85ms` delay로 순서 등장
- **네온 호버 글로우**: `onMouseEnter`에서 `box-shadow` 강화 + `translateY(-8px) scale(1.03)` 적용
- **쉬머 스윕**: 카드 내 절대 위치 div에 `shimmer` 키프레임(translateX -200%→300%) 반복
- **뱃지 펄스**: 1위 배지에 `badgePulse` 키프레임(`box-shadow` 0→8px→0) 적용
- **애니메이션 진행 바**: 초기 width 0% → 실제값으로 `transition: width 2s cubic-bezier(0.16,1,0.3,1)` + `box-shadow` 네온 글로우
- **평균선 마커**: 진행 바 위에 흰색 2px 세로선으로 비교군 평균 위치 표시
- **모달 팝인**: `popIn` 키프레임(`scale 0.85 + translateY 20px → 1 + 0`) 0.35s 등장, 바 애니메이션은 100ms 지연 후 트리거
- **`STYLES` 상수**: 모든 `@keyframes`를 하나의 문자열 상수로 묶어 `<style>{STYLES}</style>`로 주입
  - 필수 keyframes: `floatParticle`, `orbFloat`, `gradientShift`, `heroTextGlow`, `scanDown`, `ticker`, `fadeInUp`, `shimmer`, `badgePulse`, `popIn`, `barGrow`, `livePulse`, `panelGlow`
- 구현 시 사용자 승인 없이 자율 진행, 완료 후 브라우저 자동 실행
- 전체 너비 — 모바일/데스크톱 모두 화면 너비에 맞게 자동 조정
- 헤더 우측 상단에 QR 공유 버튼 — 클릭 시 `https://dashboard-two-kappa-86.vercel.app/` QR 코드를 전체화면 모달로 표시 (ESC 또는 배경 클릭으로 닫기, `qrcode.react` 라이브러리 사용)

<AI 분석 어시스턴트>

- 'gemini-2.5-flash'를 사용해서 사용자가 해당 데이터와 보고서에 대해 질문하면 답변하도록 구현
- 대시보드 하단에 인라인 섹션으로 통합 — 종합 평가 아래 바로 표시
- 답변 메시지 안에 ReactMarkdown을 적용하고 테마에 맞는 컴포넌트 스타일을 추가(제목,소제목, 강조 부분은 폰트크기 크게)
- `generationConfig`의 `maxOutputTokens`는 **3000 이상**으로 설정 — 한국어는 토큰 효율이 낮아 1500 이하로 설정하면 답변이 중간에 잘림

---

# 개발 규칙

- 구현은 사용자가 명시적으로 요청할 때만 시작

- 3단계 대시보드는 2단계 보고서 완료 후 진행

- API 키 등 민감 정보는 `.env` 파일 사용, 코드에 하드코딩 금지

- 3단계 구현 시: 모두 자율 결정, 완료 후 브라우저로 결과 확인

- **앱 수정·완료 시 https://github.com/routinekim/dashboard 에 자동 푸시** (`.env` 제외)
  
  - 항상 **`main`** 브랜치에 push — 로컬 브랜치명과 무관하게 아래 명령어로 고정:
    
    ```
    git fetch origin && git rebase origin/main && git push origin HEAD:main
    ```
  - 원격에 기존 커밋이 있어 충돌이 발생해도 위 순서대로 실행하면 자동 해결됨

---

# 기술 주의사항

## Recharts ScatterChart — 커스텀 shape의 r prop 미전달 버그

- **증상**: `<Scatter shape={(props) => ...}>` 에서 `props.r` 이 `undefined` 또는 0으로 들어와 버블이 안 보임
- **원인**: Recharts v2.x에서 ZAxis가 계산한 반지름이 커스텀 shape 함수에 안정적으로 전달되지 않음
- **해결**: `r` prop 사용 금지 — `payload.sz` 와 사전계산한 `szExtent`로 직접 반지름 계산
  
  ```js
  const [minSz, maxSz] = szExtent
  const t = (payload.sz - minSz) / (maxSz - minSz)
  const r = 5 + Math.sqrt(t) * 16  // 5~21px
  ```

---

# 참고 자료

- `대학알리미.xlsx` — 전국 대학 원본 데이터
- 교육부 2025년 대학혁신 정책 (웹서치로 보완)
- Gemini API 키: `.env` 파일의 `GEMINI_API_KEY` 변수 사용
