import React from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Stage1 from './pages/Stage1.jsx'
import Stage3 from './pages/Stage3.jsx'

const NAV_STYLE = `
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(6,14,31,0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,212,255,0.2);
  display: flex; align-items: center; padding: 0 24px;
  height: 56px; gap: 8px;
`

const LOGO_STYLE = `
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-weight: 700;
  color: #00d4ff; letter-spacing: 2px;
  margin-right: 24px; white-space: nowrap;
`

export default function App() {
  return (
    <>
      <nav style={{ cssText: NAV_STYLE }}>
        <style>{`
          .nav-wrap {
            position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
            background: rgba(6,14,31,0.95); backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,212,255,0.2);
            display: flex; align-items: center; padding: 0 24px;
            height: 56px; gap: 8px;
          }
          .nav-logo {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px; font-weight: 700;
            color: #00d4ff; letter-spacing: 2px;
            margin-right: 24px; white-space: nowrap;
          }
          .nav-tab {
            padding: 6px 18px; border-radius: 6px;
            font-size: 13px; font-weight: 500;
            color: rgba(224,240,255,0.6);
            border: 1px solid transparent;
            transition: all 0.2s;
            white-space: nowrap;
            text-decoration: none;
            display: inline-flex; align-items: center; gap: 6px;
          }
          .nav-tab:hover {
            color: #00d4ff;
            border-color: rgba(0,212,255,0.3);
            background: rgba(0,212,255,0.05);
          }
          .nav-tab.active {
            color: #00d4ff;
            border-color: rgba(0,212,255,0.5);
            background: rgba(0,212,255,0.1);
          }
          .nav-report-btn {
            padding: 6px 18px; border-radius: 6px;
            font-size: 13px; font-weight: 500;
            color: rgba(224,240,255,0.6);
            border: 1px solid transparent;
            transition: all 0.2s; cursor: pointer;
            white-space: nowrap; background: none;
          }
          .nav-report-btn:hover {
            color: #00d4ff;
            border-color: rgba(0,212,255,0.3);
            background: rgba(0,212,255,0.05);
          }
        `}</style>
        <div className="nav-wrap">
          <span className="nav-logo">HSU·ANALYTICS</span>
          <NavLink to="/" end className={({isActive}) => 'nav-tab' + (isActive ? ' active' : '')}>
            📊 1단계 포지셔닝 맵
          </NavLink>
          <button className="nav-report-btn" onClick={() => window.open('/hansei_report.html', '_blank')}>
            📄 2단계 분석 보고서
          </button>
          <NavLink to="/dashboard" className={({isActive}) => 'nav-tab' + (isActive ? ' active' : '')}>
            ⚡ 3단계 한세대 대시보드
          </NavLink>
        </div>
      </nav>

      <div style={{ paddingTop: 56 }}>
        <Routes>
          <Route path="/" element={<Stage1 />} />
          <Route path="/dashboard" element={<Stage3 />} />
        </Routes>
      </div>
    </>
  )
}
