"use client";

import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --red: #D42B2B;
    --red-light: #FDEAEA;
    --blue: #2563EB;
    --dark: #111111;
    --mid: #444444;
    --muted: #888888;
    --bg: #F7F5F2;
    --white: #FFFFFF;
    --green: #16A34A;
    --border: #E5E1DB;
    --sidebar-w: 240px;
    --topbar-h: 64px;
    --bottom-nav-h: 64px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--dark); min-height: 100vh; }

  /* ── LAYOUT ── */
  .app {
    display: grid;
    grid-template-columns: var(--sidebar-w) 1fr;
    grid-template-rows: var(--topbar-h) 1fr;
    min-height: 100vh;
  }

  /* ── SIDEBAR (desktop) ── */
  .sidebar {
    grid-row: 1 / 3;
    background: var(--dark); color: var(--white);
    display: flex; flex-direction: column;
    padding: 28px 0;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 0 24px 28px; border-bottom: 1px solid #222;
  }

  .sidebar-logo-icon {
    width: 36px; height: 36px; background: var(--red);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  .sidebar-logo-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 14px;
    letter-spacing: 0.02em; line-height: 1.2;
  }

  .sidebar-section { padding: 20px 16px 8px; }

  .sidebar-section-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #555; padding: 0 8px; margin-bottom: 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    font-size: 13.5px; font-weight: 500; color: #999;
    cursor: pointer; transition: all 0.15s;
    margin-bottom: 2px; border: none; background: none;
    width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-item:hover { background: #1a1a1a; color: var(--white); }
  .nav-item.active { background: var(--red); color: var(--white); }

  .nav-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .nav-item.active .nav-icon { background: rgba(255,255,255,0.18); }

  .nav-badge {
    margin-left: auto;
    background: var(--red); color: white;
    font-size: 10px; font-weight: 700;
    padding: 2px 7px; border-radius: 20px;
  }
  .nav-item.active .nav-badge { background: rgba(255,255,255,0.25); }

  .sidebar-bottom {
    margin-top: auto; padding: 20px 16px 0;
    border-top: 1px solid #1e1e1e;
  }

  .sidebar-user {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    cursor: pointer; transition: background 0.15s;
  }
  .sidebar-user:hover { background: #1a1a1a; }

  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, var(--red), #FF6B6B);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white; flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: #666; }

  .user-menu-wrap { position: relative; }

  .user-menu-popover {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0; right: 0;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.4);
    animation: popover-in 0.15s ease;
    z-index: 100;
  }

  @keyframes popover-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .user-menu-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px;
    font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background 0.12s;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
    border-bottom: 1px solid #242424;
    color: #ccc;
  }
  .user-menu-item:last-child { border-bottom: none; }
  .user-menu-item:hover { background: #222; }
  .user-menu-item.danger { color: #F87171; }
  .user-menu-item.danger:hover { background: #2a1414; }
  .user-menu-icon { font-size: 15px; width: 20px; text-align: center; }

  /* ── TOPBAR ── */
  .topbar {
    background: var(--white); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 36px; height: var(--topbar-h);
    position: sticky; top: 0; z-index: 10;
  }

  .breadcrumb { font-size: 13px; color: var(--muted); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
  .breadcrumb-sep { color: var(--border); margin: 0 4px; }
  .breadcrumb-current { color: var(--dark); font-weight: 600; }
  .breadcrumb-link { cursor: pointer; transition: color 0.15s; }
  .breadcrumb-link:hover { color: var(--red); }

  /* ── MAIN ── */
  .main { padding: 36px 40px 60px; overflow-y: auto; }

  /* ── PAGE HEADER ── */
  .page-header { margin-bottom: 32px; }
  .page-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800; line-height: 1.1; margin-bottom: 6px;
  }
  .page-header h1 span { color: var(--red); }
  .page-header p { color: var(--muted); font-size: 14px; line-height: 1.6; }

  /* ── STATS GRID ── */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px; margin-bottom: 32px;
  }

  .stat-card {
    position: relative;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    transition: box-shadow 0.15s;
  }

  .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }

  .stat-card.featured {
    background: var(--red); border-color: var(--red); color: white;
    display: flex; align-items: center; justify-content: space-between;
  }

  .stat-value {
    font-variant-numeric: tabular-nums;
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
  }

  .stat-label {
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
  }
  .stat-card.featured .stat-label { color: rgba(255,255,255,0.7); }

  .stat-trend { font-size: 12px; font-weight: 600; margin-top: 6px; }
  .trend-up { color: var(--green); }
  .stat-card.featured .trend-up { color: rgba(255,255,255,0.85); }

  .featured-graph { width: 90px; height: 54px; flex-shrink: 0; }

  .online-pill {
    position: absolute;
    top: 16px; right: 16px;
    display: inline-flex; align-items: center;
    background: #ECFDF5; border: 1px solid #6EE7B7;
    border-radius: 999px; padding: 4px 10px;
    font-size: 10px; font-weight: 700; color: var(--green); gap: 6px;
  }

  .online-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 0 0 rgba(22,163,74,0.4);
    animation: pulse-green 1.8s infinite;
  }

  @keyframes pulse-green {
    0%   { box-shadow: 0 0 0 0 rgba(22,163,74,0.45); }
    70%  { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
    100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
  }

  .online-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }

  .online-avatar-wrap { position: relative; }

  .online-student-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    color: white; border: 2px solid var(--white);
  }

  .online-indicator {
    position: absolute; bottom: 0; right: 0;
    width: 9px; height: 9px;
    background: var(--green); border-radius: 50%;
    border: 2px solid var(--white);
  }

  /* ── CONTENT GRID ── */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
  }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 700;
  }

  .section-link {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: var(--red); cursor: pointer; white-space: nowrap;
  }

  .tabs { display: flex; gap: 4px; flex-wrap: wrap; }

  .tab-btn {
    font-size: 12px; font-weight: 600;
    padding: 5px 13px; border-radius: 8px;
    border: 1px solid var(--border);
    background: none; cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif; color: var(--muted);
  }
  .tab-btn.active { background: var(--dark); color: white; border-color: var(--dark); }

  .activity-list {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }

  .activity-item {
    display: flex; align-items: center; gap: 14px;
    padding: 15px 20px; border-bottom: 1px solid var(--border);
    transition: background 0.12s; cursor: pointer;
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: var(--bg); }

  .activity-color-bar { width: 3px; height: 36px; border-radius: 2px; flex-shrink: 0; }

  .activity-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .activity-info { flex: 1; min-width: 0; }
  .activity-name { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .activity-meta { font-size: 11.5px; color: var(--muted); }

  .activity-right { text-align: right; flex-shrink: 0; }
  .activity-pts {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; color: var(--green);
  }
  .activity-duration { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── WIDGET ── */
  .widget {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px;
  }

  .widget-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; margin-bottom: 16px;
  }

  .student-list { display: flex; flex-direction: column; gap: 14px; }
  .student-row { display: flex; align-items: center; gap: 10px; }

  .student-medal { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
  .student-rank-num {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700; width: 22px;
    text-align: center; flex-shrink: 0; color: var(--muted);
  }

  .student-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: white;
  }

  .student-details { flex: 1; min-width: 0; }
  .student-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .progress-bar-bg {
    height: 5px; border-radius: 3px;
    background: var(--bg); margin-top: 4px; overflow: hidden;
  }
  .progress-bar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }

  .student-score { font-size: 12px; font-weight: 700; color: var(--mid); white-space: nowrap; }

  /* ── STUDENTS PAGE ── */
  .students-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px; flex-wrap: wrap;
  }

  .search-input-wrap { flex: 1; min-width: 200px; max-width: 340px; position: relative; }

  .search-input {
    width: 100%; padding: 9px 14px 9px 38px;
    border: 1px solid var(--border); border-radius: 10px;
    background: var(--white); font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--dark); outline: none;
    transition: border-color 0.15s;
  }
  .search-input:focus { border-color: var(--red); }
  .search-input::placeholder { color: var(--muted); }

  .search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--muted); display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }

  .filter-select {
    padding: 9px 36px 9px 14px;
    border: 1px solid var(--border); border-radius: 10px;
    background: var(--white); font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--dark); outline: none; cursor: pointer;
    transition: border-color 0.15s; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .filter-select:focus { border-color: var(--red); }

  .students-table-wrap {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }

  /* Horizontal scroll for table on small screens */
  .students-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

  .students-table { width: 100%; border-collapse: collapse; min-width: 600px; }

  .students-table thead tr { background: var(--bg); border-bottom: 1px solid var(--border); }

  .students-table th {
    padding: 12px 20px; font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); text-align: left;
    white-space: nowrap;
  }

  .students-table tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.12s; cursor: pointer;
  }
  .students-table tbody tr:last-child { border-bottom: none; }
  .students-table tbody tr:hover { background: var(--bg); }

  .students-table td { padding: 14px 20px; font-size: 13.5px; }

  .td-student { display: flex; align-items: center; gap: 12px; }

  .td-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0;
  }

  .td-name { font-weight: 600; font-size: 13.5px; white-space: nowrap; }
  .td-email { font-size: 11.5px; color: var(--muted); margin-top: 1px; white-space: nowrap; }

  .td-sala {
    display: inline-flex; align-items: center;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 6px; padding: 3px 10px;
    font-size: 12px; font-weight: 600; color: var(--mid);
    white-space: nowrap;
  }

  .td-score-wrap { display: flex; align-items: center; gap: 10px; }
  .td-score-bar-bg {
    width: 70px; height: 5px; border-radius: 3px;
    background: var(--bg); overflow: hidden; flex-shrink: 0;
  }
  .td-score-bar-fill { height: 100%; border-radius: 3px; }
  .td-score-val { font-size: 12px; font-weight: 700; color: var(--mid); }

  .status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 20px; padding: 3px 10px;
    font-size: 11px; font-weight: 700; white-space: nowrap;
  }
  .status-online { background: #ECFDF5; color: var(--green); }
  .status-offline { background: var(--bg); color: var(--muted); }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .status-online .status-dot { background: var(--green); }
  .status-offline .status-dot { background: var(--muted); }

  .students-count { font-size: 13px; color: var(--muted); margin-left: auto; font-weight: 500; white-space: nowrap; }

  /* ── STUDENT DETAIL ── */
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--white); border: 1px solid var(--border);
    border-radius: 10px; padding: 8px 16px;
    font-size: 13px; font-weight: 600; color: var(--mid);
    cursor: pointer; transition: all 0.15s; margin-bottom: 28px;
  }
  .back-btn:hover { background: var(--bg); color: var(--dark); border-color: var(--dark); }

  .detail-hero {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
    display: flex; align-items: center; gap: 28px;
    margin-bottom: 24px; position: relative; overflow: hidden;
    flex-wrap: wrap;
  }

  .detail-hero::before {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 240px; height: 100%;
    background: linear-gradient(135deg, transparent 40%, rgba(212,43,43,0.04));
    pointer-events: none;
  }

  .detail-hero-avatar {
    width: 80px; height: 80px; border-radius: 20px;
    font-size: 28px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }

  .detail-hero-info { flex: 1; min-width: 200px; }
  .detail-hero-name {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800; margin-bottom: 4px;
  }
  .detail-hero-meta {
    font-size: 13px; color: var(--muted); display: flex; gap: 16px; flex-wrap: wrap;
  }
  .detail-hero-meta span { display: flex; align-items: center; gap: 5px; }

  .detail-hero-stats { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }

  .detail-mini-stat {
    background: var(--bg); border-radius: 12px; padding: 12px 18px; text-align: center;
  }
  .detail-mini-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; line-height: 1;
  }
  .detail-mini-stat-lbl {
    font-size: 10px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;
  }

  .detail-hero-score-block { text-align: center; flex-shrink: 0; }
  .detail-score-ring {
    width: 90px; height: 90px; position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  .detail-score-ring svg { position: absolute; top: 0; left: 0; transform: rotate(-90deg); }
  .detail-score-val {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800; position: relative; z-index: 1;
  }
  .detail-score-lbl { font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 600; }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
  }

  .detail-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px; margin-bottom: 20px;
  }
  .detail-card:last-child { margin-bottom: 0; }

  .detail-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; margin-bottom: 18px;
    display: flex; align-items: center; gap: 8px;
  }
  .detail-card-title-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--bg); display: flex; align-items: center;
    justify-content: center; font-size: 14px;
  }

  .topics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .topic-card {
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: box-shadow 0.15s, transform 0.15s;
    cursor: default;
  }
  .topic-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-2px); }

  .topic-card-name {
    font-size: 12px; font-weight: 600; color: var(--mid);
    line-height: 1.3;
  }

  .topic-card-score-row {
    display: flex; align-items: flex-end; justify-content: space-between;
  }

  .topic-card-score-big {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800; line-height: 1;
  }

  .topic-card-score-pct {
    font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 3px;
  }

  .topic-card-bar-bg {
    height: 4px; border-radius: 2px; background: var(--border); overflow: hidden;
  }
  .topic-card-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s cubic-bezier(.25,.8,.25,1); }

  .topic-card-badge {
    display: inline-flex; align-items: center;
    border-radius: 6px; padding: 2px 8px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
    align-self: flex-start;
  }
  .badge-high { background: #ECFDF5; color: var(--green); }
  .badge-mid  { background: #FFF7ED; color: #C2410C; }
  .badge-low  { background: var(--red-light); color: var(--red); }

  .match-history-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--border);
  }
  .match-history-row:last-child { border-bottom: none; }

  .match-result-badge {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; flex-shrink: 0; letter-spacing: 0.03em;
  }
  .match-win { background: #ECFDF5; color: var(--green); }
  .match-loss { background: var(--red-light); color: var(--red); }

  .match-hist-info { flex: 1; min-width: 0; }
  .match-hist-tema { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .match-hist-meta { font-size: 11px; color: var(--muted); margin-top: 1px; }

  .match-hist-pts {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; text-align: right; white-space: nowrap;
  }
  .match-hist-duration { font-size: 11px; color: var(--muted); text-align: right; white-space: nowrap; }

  .summary-stat-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--border); gap: 12px;
  }
  .summary-stat-row:last-child { border-bottom: none; }
  .summary-stat-label { font-size: 13px; color: var(--muted); font-weight: 500; }
  .summary-stat-value { font-size: 14px; font-weight: 700; text-align: right; }

  .trend-bars {
    display: flex; align-items: flex-end; gap: 6px;
    height: 80px; margin-top: 8px;
  }
  .trend-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .trend-bar {
    width: 100%; border-radius: 4px 4px 0 0;
    transition: height 0.6s ease; min-height: 4px;
  }
  .trend-bar-lbl { font-size: 10px; color: var(--muted); font-weight: 600; }

  .achievements-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .achievement-badge {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 10px; padding: 8px 12px;
    font-size: 12px; font-weight: 600; color: var(--mid);
  }
  .achievement-badge.earned { background: #FFFBEB; border-color: #FCD34D; color: #92400E; }
  .achievement-icon { font-size: 16px; }

  /* ── SETTINGS ── */
  .settings-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .settings-section {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }

  .settings-section-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }

  .settings-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; margin-bottom: 3px;
    display: flex; align-items: center; gap: 8px;
  }

  .settings-section-desc { font-size: 12px; color: var(--muted); }

  .settings-field {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid var(--border); gap: 24px;
    flex-wrap: wrap;
  }
  .settings-field:last-child { border-bottom: none; }

  .settings-field-info { flex: 1; min-width: 160px; }
  .settings-field-label { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; }
  .settings-field-hint { font-size: 12px; color: var(--muted); }

  .settings-input {
    width: 340px; flex-shrink: 0;
    padding: 9px 14px; border: 1px solid var(--border); border-radius: 10px;
    background: var(--bg); font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--dark); outline: none; transition: border-color 0.15s;
  }
  .settings-input:focus { border-color: var(--red); background: var(--white); }

  .settings-select {
    width: 200px; flex-shrink: 0;
    padding: 9px 36px 9px 14px; border: 1px solid var(--border);
    border-radius: 10px; background: var(--bg); font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--dark); outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    transition: border-color 0.15s;
  }
  .settings-select:focus { border-color: var(--red); }

  .toggle-wrap { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .toggle-label-text { font-size: 12px; color: var(--muted); font-weight: 500; min-width: 28px; text-align: right; }

  .toggle { position: relative; width: 42px; height: 24px; flex-shrink: 0; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; cursor: pointer; inset: 0; border-radius: 24px;
    background: var(--border); transition: background 0.2s;
  }
  .toggle-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    left: 3px; top: 3px; background: white;
    transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.18);
  }
  .toggle input:checked + .toggle-slider { background: var(--red); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(18px); }

  .settings-avatar-row { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
  .settings-avatar {
    width: 60px; height: 60px; border-radius: 16px;
    background: linear-gradient(135deg, var(--red), #FF6B6B);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 22px; color: white; flex-shrink: 0;
  }
  .settings-avatar-actions { display: flex; flex-direction: column; gap: 6px; }

  .btn-secondary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px; border: 1px solid var(--border);
    background: var(--white); font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600; color: var(--mid);
    cursor: pointer; transition: all 0.15s;
  }
  .btn-secondary:hover { border-color: var(--dark); color: var(--dark); }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px; border: none; background: var(--red);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: white;
    cursor: pointer; transition: opacity 0.15s;
  }
  .btn-primary:hover { opacity: 0.88; }

  .btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px;
    border: 1px solid #FECACA; background: var(--red-light);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--red);
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .btn-danger:hover { background: #FECACA; }

  .settings-actions {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 0 0; margin-top: 4px; flex-wrap: wrap; gap: 12px;
  }

  .color-swatches { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
  .color-swatch {
    width: 28px; height: 28px; border-radius: 8px;
    cursor: pointer; border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
  }
  .color-swatch:hover { transform: scale(1.1); }
  .color-swatch.selected { border-color: var(--dark); }

  .danger-zone { border-color: #FECACA !important; }
  .danger-zone .settings-section-header { background: var(--red-light); border-bottom-color: #FECACA; }

  .save-toast {
    display: inline-flex; align-items: center; gap: 6px;
    background: #ECFDF5; border: 1px solid #6EE7B7;
    border-radius: 8px; padding: 6px 12px;
    font-size: 12px; font-weight: 600; color: var(--green);
    opacity: 0; transition: opacity 0.3s;
  }
  .save-toast.visible { opacity: 1; }

  /* ── BOTTOM NAV (mobile only, hidden on desktop) ── */
  .bottom-nav {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    height: var(--bottom-nav-h);
    background: var(--dark);
    border-top: 1px solid #222;
    z-index: 50;
    padding: 0 8px;
    align-items: center; justify-content: space-around;
  }

  .bottom-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    flex: 1; padding: 8px 4px;
    cursor: pointer; border: none; background: none;
    font-family: 'DM Sans', sans-serif;
    color: #666; transition: color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .bottom-nav-item.active { color: var(--red); }
  .bottom-nav-item-icon { font-size: 20px; line-height: 1; }
  .bottom-nav-item-label { font-size: 10px; font-weight: 600; letter-spacing: 0.04em; }

  /* ── MOBILE TOPBAR USER BUTTON ── */
  .topbar-user-btn {
    display: none;
    align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    padding: 4px;
  }
  .topbar-user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, var(--red), #FF6B6B);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 12px; color: white; flex-shrink: 0;
  }

  /* ─────────────────────────────────────────────
     RESPONSIVE BREAKPOINTS
  ───────────────────────────────────────────── */

  /* ── TABLET (≤ 1024px): narrower sidebar ── */
  @media (max-width: 1024px) {
    :root { --sidebar-w: 200px; }

    .main { padding: 28px 24px 50px; }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .topics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ── MOBILE (≤ 768px): bottom nav, no sidebar ── */
  @media (max-width: 768px) {
    :root { --sidebar-w: 0px; }

    .app {
      grid-template-columns: 1fr;
      grid-template-rows: var(--topbar-h) 1fr;
    }

    /* Hide desktop sidebar */
    .sidebar { display: none; }

    /* Show bottom nav */
    .bottom-nav { display: flex; }

    /* Show mobile user button in topbar */
    .topbar-user-btn { display: flex; }

    /* Topbar adjustments */
    .topbar { padding: 0 16px; }
    .breadcrumb { font-size: 11px; }

    /* Main padding — add bottom padding for bottom nav */
    .main {
      padding: 20px 16px calc(var(--bottom-nav-h) + 20px);
      grid-column: 1;
    }

    /* Page header */
    .page-header h1 { font-size: 24px; }
    .page-header p { font-size: 13px; }

    /* Stats grid → single column */
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-card.featured {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .featured-graph { width: 100%; height: 44px; }

    /* Content grid → single column */
    .content-grid {
      grid-template-columns: 1fr;
    }

    /* Widget sits below activity list */
    .widget { margin-top: 0; }

    /* Activity items: hide color bar on mobile */
    .activity-color-bar { display: none; }
    .activity-item { padding: 12px 14px; gap: 10px; }
    .activity-icon { width: 32px; height: 32px; font-size: 14px; }
    .activity-name { font-size: 13px; }
    .activity-meta { font-size: 11px; }
    .activity-pts { font-size: 13px; }

    /* Students toolbar: wrap nicely */
    .students-toolbar { gap: 8px; }
    .search-input-wrap { max-width: 100%; width: 100%; }
    .filter-select { flex: 1; min-width: 120px; }
    .students-count { width: 100%; margin-left: 0; }

    /* Detail hero: stack */
    .detail-hero {
      padding: 20px;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .detail-hero-name { font-size: 20px; }
    .detail-hero::before { display: none; }
    .detail-hero-score-block { align-self: flex-start; }
    .detail-mini-stat { padding: 10px 14px; }
    .detail-mini-stat-val { font-size: 17px; }

    /* Topics grid → 2 cols on mobile */
    .topics-grid { grid-template-columns: repeat(2, 1fr); }

    /* Detail grid → single column */
    .detail-grid { grid-template-columns: 1fr; }

    /* Detail card */
    .detail-card { padding: 18px; }

    /* Settings: inputs full width */
    .settings-input { width: 100%; }
    .settings-select { width: 100%; }
    .settings-field {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .settings-field-info { min-width: unset; width: 100%; }
    .settings-avatar-row { width: 100%; }
    .btn-danger { width: 100%; justify-content: center; }
  }

  /* ── SMALL MOBILE (≤ 480px) ── */
  @media (max-width: 480px) {
    .page-header h1 { font-size: 20px; }

    .detail-hero-stats { gap: 8px; }
    .detail-mini-stat { padding: 8px 10px; }

    .topics-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .topic-card { padding: 12px; }
    .topic-card-score-big { font-size: 22px; }

    .stats-grid { gap: 12px; }
    .stat-card { padding: 18px; }
    .stat-value { font-size: 26px; }
  }
`;

interface NavItemType { icon: string; label: string; badge?: string; }
interface Student { name: string; initials: string; score: number; color: string; }
interface OnlineStudent { initials: string; color: string; name: string; }
interface Match { sala: string; tema: string; vencedor: string; tempoAtras: string; duracao: string; pontos: number; color: string; }
interface FullStudent {
  name: string; initials: string; email: string; ano: string; sala: string;
  score: number; color: string; online: boolean; partidas: number;
}

const NAV: NavItemType[] = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "👥", label: "Alunos" },
  { icon: "⚙️", label: "Configurações" },
];

const TOP_STUDENTS: Student[] = [
  { name: "Diana Ramos", initials: "DR", score: 95, color: "#9B59B6" },
  { name: "Ana Luiza", initials: "AL", score: 92, color: "#E74C3C" },
  { name: "Bruno Santos", initials: "BS", score: 87, color: "#3498DB" },
  { name: "Caio Martins", initials: "CM", score: 78, color: "#27AE60" },
  { name: "Eduardo Lima", initials: "EL", score: 64, color: "#F39C12" },
];

const ONLINE_STUDENTS: OnlineStudent[] = [
  { initials: "DR", color: "#9B59B6", name: "Diana Ramos" },
  { initials: "BS", color: "#3498DB", name: "Bruno Santos" },
  { initials: "CM", color: "#27AE60", name: "Caio Martins" },
];

const MATCHES_HOJE: Match[] = [
  { sala: "Sala 03", tema: "Reações Químicas", vencedor: "Bruno S.", tempoAtras: "12 min atrás", duracao: "18 min", pontos: 120, color: "#E74C3C" },
  { sala: "Sala 01", tema: "Química Orgânica", vencedor: "Ana Luiza", tempoAtras: "45 min atrás", duracao: "22 min", pontos: 95, color: "#D42B2B" },
  { sala: "Sala 05", tema: "Eletrólise", vencedor: "Caio M.", tempoAtras: "2h atrás", duracao: "15 min", pontos: 150, color: "#2563EB" },
];

const MATCHES_SEMANA: Match[] = [
  ...MATCHES_HOJE,
  { sala: "Sala 02", tema: "Ligações Químicas", vencedor: "Diana R.", tempoAtras: "Ontem, 14h", duracao: "20 min", pontos: 110, color: "#27AE60" },
  { sala: "Sala 04", tema: "Gases Nobres", vencedor: "Eduardo L.", tempoAtras: "Ontem, 11h", duracao: "17 min", pontos: 88, color: "#9B59B6" },
  { sala: "Sala 01", tema: "Tabela Periódica", vencedor: "Ana Luiza", tempoAtras: "Seg, 09h", duracao: "25 min", pontos: 135, color: "#D42B2B" },
];

const MATCHES_MES: Match[] = [
  ...MATCHES_SEMANA,
  { sala: "Sala 03", tema: "Soluções", vencedor: "Bruno S.", tempoAtras: "12/05, 15h", duracao: "19 min", pontos: 102, color: "#E74C3C" },
  { sala: "Sala 05", tema: "Termoquímica", vencedor: "Diana R.", tempoAtras: "10/05, 10h", duracao: "23 min", pontos: 118, color: "#2563EB" },
];

const MATCHES_BY_TAB: Record<string, Match[]> = { Hoje: MATCHES_HOJE, Semana: MATCHES_SEMANA, Mês: MATCHES_MES };

const ALL_STUDENTS: FullStudent[] = [
  { name: "Diana Ramos", initials: "DR", email: "diana.ramos@escola.br", ano: "1º Ano", sala: "Sala 01", score: 95, color: "#9B59B6", online: true, partidas: 24 },
  { name: "Ana Luiza", initials: "AL", email: "ana.luiza@escola.br", ano: "3º Ano", sala: "Sala 01", score: 92, color: "#E74C3C", online: false, partidas: 21 },
  { name: "Bruno Santos", initials: "BS", email: "bruno.santos@escola.br", ano: "3º Ano", sala: "Sala 03", score: 87, color: "#3498DB", online: true, partidas: 19 },
  { name: "Caio Martins", initials: "CM", email: "caio.martins@escola.br", ano: "2º Ano", sala: "Sala 03", score: 78, color: "#27AE60", online: true, partidas: 17 },
  { name: "Eduardo Lima", initials: "EL", email: "eduardo.lima@escola.br", ano: "1º Ano", sala: "Sala 02", score: 64, color: "#F39C12", online: false, partidas: 14 },
  { name: "Fernanda Costa", initials: "FC", email: "fernanda.costa@escola.br", ano: "2º Ano", sala: "Sala 02", score: 72, color: "#1ABC9C", online: false, partidas: 16 },
  { name: "Gabriel Nunes", initials: "GN", email: "gabriel.nunes@escola.br", ano: "1º Ano", sala: "Sala 04", score: 58, color: "#E67E22", online: false, partidas: 11 },
  { name: "Helena Vieira", initials: "HV", email: "helena.vieira@escola.br", ano: "2º Ano", sala: "Sala 04", score: 83, color: "#8E44AD", online: false, partidas: 18 },
  { name: "Igor Peixoto", initials: "IP", email: "igor.peixoto@escola.br", ano: "3º Ano", sala: "Sala 05", score: 69, color: "#2980B9", online: false, partidas: 13 },
  { name: "Julia Meireles", initials: "JM", email: "julia.meireles@escola.br", ano: "1º Ano", sala: "Sala 05", score: 91, color: "#C0392B", online: false, partidas: 22 },
  { name: "Kevin Alves", initials: "KA", email: "kevin.alves@escola.br", ano: "1º Ano", sala: "Sala 01", score: 55, color: "#16A085", online: false, partidas: 9 },
  { name: "Larissa Teixeira", initials: "LT", email: "larissa.t@escola.br", ano: "2º Ano", sala: "Sala 02", score: 76, color: "#D35400", online: false, partidas: 15 },
];

const SALAS = ["Todas as Salas", "Sala 01", "Sala 02", "Sala 03", "Sala 04", "Sala 05"];
const ANOS = ["Todos os Anos", "1º Ano", "2º Ano", "3º Ano"];
const MEDALS = ["🥇", "🥈", "🥉"];
const ACCENT_COLORS = ["#D42B2B", "#2563EB", "#7C3AED", "#059669", "#D97706", "#DB2777"];

function getStudentDetail(s: FullStudent) {
  const seed = s.name.charCodeAt(0) + s.name.charCodeAt(1);
  const r = (base: number, range: number) => base + ((seed * 7 + base * 3) % range);

  const topics = [
    { name: "Reações Químicas", score: Math.min(100, Math.max(30, s.score + r(-10, 20))) },
    { name: "Química Orgânica", score: Math.min(100, Math.max(30, s.score + r(-15, 25))) },
    { name: "Tabela Periódica", score: Math.min(100, Math.max(30, s.score + r(-5, 18))) },
    { name: "Ligações Químicas", score: Math.min(100, Math.max(30, s.score + r(-20, 22))) },
    { name: "Termoquímica", score: Math.min(100, Math.max(30, s.score + r(-8, 16))) },
    { name: "Eletrólise", score: Math.min(100, Math.max(30, s.score + r(-12, 24))) },
  ];

  const temas = ["Reações Químicas", "Tabela Periódica", "Química Orgânica", "Ligações Químicas", "Eletrólise", "Soluções", "Termoquímica", "Gases Nobres"];
  const wins = Math.round(s.partidas * (s.score / 100));
  const losses = s.partidas - wins;

  const matchHistory = Array.from({ length: Math.min(s.partidas, 8) }, (_, i) => {
    const won = i < wins;
    const tema = temas[i % temas.length];
    const pts = won ? 80 + r(i * 3, 60) : 20 + r(i * 2, 30);
    const days = [0, 0, 1, 2, 3, 5, 7, 10];
    const dateStr = days[i] === 0 ? "Hoje" : days[i] === 1 ? "Ontem" : `${days[i]} dias atrás`;
    return { won, tema, pts: Math.min(150, pts), duracao: `${14 + r(i, 12)} min`, data: dateStr };
  });

  const trendWeeks = ["S1", "S2", "S3", "S4", "S5", "S6"];
  const trendScores = trendWeeks.map((_, i) => Math.min(100, Math.max(20, s.score - 20 + r(i * 5, 30))));

  const achievements = [
    { icon: "🏆", label: "Primeiro lugar", earned: s.score >= 90 },
    { icon: "🔥", label: "5 vitórias seguidas", earned: wins >= 5 },
    { icon: "⚡", label: "Partida rápida", earned: s.partidas >= 10 },
    { icon: "📚", label: "Estudante dedicado", earned: s.partidas >= 15 },
    { icon: "🧪", label: "Mestre químico", earned: s.score >= 80 },
    { icon: "🌟", label: "Top 3 turma", earned: s.score >= 85 },
  ];

  const tempoMedioPartida = `${15 + r(0, 8)} min`;
  const taxaVitoria = Math.round((wins / Math.max(s.partidas, 1)) * 100);
  const pontosTotal = matchHistory.reduce((acc, m) => acc + m.pts, 0) * 2 + r(0, 200);

  return { topics, matchHistory, trendWeeks, trendScores, achievements, wins, losses, tempoMedioPartida, taxaVitoria, pontosTotal };
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 38, cx = 45, cy = 45;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div className="detail-score-ring">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg)" strokeWidth="7" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
      </svg>
      <div className="detail-score-val">{score}%</div>
    </div>
  );
}

function Toggle({ checked, onChange, onLabel = "Sim", offLabel = "Não" }: {
  checked: boolean; onChange: (v: boolean) => void; onLabel?: string; offLabel?: string;
}) {
  return (
    <div className="toggle-wrap">
      <span className="toggle-label-text">{checked ? onLabel : offLabel}</span>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function topicBadge(score: number) {
  if (score >= 80) return { cls: "badge-high", label: "Forte" };
  if (score >= 55) return { cls: "badge-mid", label: "Regular" };
  return { cls: "badge-low", label: "A melhorar" };
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsView() {
  const [savedVisible, setSavedVisible] = useState(false);
  const [nome, setNome] = useState("Prof. Mendes");
  const [email, setEmail] = useState("mendes@escola.br");

  const [accentColor, setAccentColor] = useState("#D42B2B");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [autenticacao2fa, setAutenticacao2fa] = useState(false);

  const handleSave = () => {
    setSavedVisible(true);
    setTimeout(() => setSavedVisible(false), 2500);
  };

  return (
    <>
      <div className="page-header">
        <h1>Confi<span>gurações</span></h1>
        <p>Gerencie seu perfil, aparência e segurança da conta.</p>
      </div>

      <div className="settings-stack">
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">👤 Informações Pessoais</div>
            <div className="settings-section-desc">Dados exibidos para os alunos e relatórios.</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">Foto de perfil</div>
              <div className="settings-field-hint">JPG ou PNG, até 2 MB.</div>
            </div>
            <div className="settings-avatar-row">
              <div className="settings-avatar" style={{ background: accentColor }}>PM</div>
              <div className="settings-avatar-actions">
                <button className="btn-secondary">📷 Alterar foto</button>
                <button className="btn-secondary" style={{ color: "var(--red)", borderColor: "#FECACA" }}>🗑 Remover</button>
              </div>
            </div>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">Nome completo</div>
              <div className="settings-field-hint">Aparece no cabeçalho e nos relatórios.</div>
            </div>
            <input className="settings-input" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">E-mail</div>
              <div className="settings-field-hint">Usado para login e notificações.</div>
            </div>
            <input className="settings-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">🎨 Aparência</div>
            <div className="settings-section-desc">Personalize a cor de destaque do painel.</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">Cor de destaque</div>
              <div className="settings-field-hint">Afeta botões, badges e indicadores ativos.</div>
            </div>
            <div className="color-swatches">
              {ACCENT_COLORS.map((c) => (
                <div key={c} className={`color-swatch ${accentColor === c ? "selected" : ""}`}
                  style={{ background: c }} onClick={() => setAccentColor(c)} title={c} />
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">🔑 Alterar Senha</div>
            <div className="settings-section-desc">Use uma senha forte com letras, números e símbolos.</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-info"><div className="settings-field-label">Senha atual</div></div>
            <input className="settings-input" type="password" placeholder="••••••••" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">Nova senha</div>
              <div className="settings-field-hint">Mínimo de 8 caracteres.</div>
            </div>
            <input className="settings-input" type="password" placeholder="••••••••" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} />
          </div>
          <div className="settings-field">
            <div className="settings-field-info"><div className="settings-field-label">Confirmar nova senha</div></div>
            <input className="settings-input" type="password" placeholder="••••••••" value={senhaConfirm} onChange={(e) => setSenhaConfirm(e.target.value)} />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">🛡 Autenticação em Dois Fatores</div>
            <div className="settings-section-desc">Adicione uma camada extra de proteção à sua conta.</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">Ativar 2FA</div>
              <div className="settings-field-hint">Solicita um código extra ao fazer login.</div>
            </div>
            <Toggle checked={autenticacao2fa} onChange={setAutenticacao2fa} onLabel="Ativo" offLabel="Inativo" />
          </div>
        </div>

        <div className="settings-section danger-zone">
          <div className="settings-section-header">
            <div className="settings-section-title">⚠️ Zona de Perigo</div>
            <div className="settings-section-desc">Ações irreversíveis. Proceda com cuidado.</div>
          </div>
          <div className="settings-field">
            <div className="settings-field-info">
              <div className="settings-field-label">Excluir conta</div>
              <div className="settings-field-hint">Remove permanentemente todos os dados, turmas e histórico.</div>
            </div>
            <button className="btn-danger">🗑 Excluir conta</button>
          </div>
        </div>

        <div className="settings-actions">
          <span className={`save-toast ${savedVisible ? "visible" : ""}`}>✓ Alterações salvas!</span>
          <button className="btn-primary" style={{ marginLeft: "auto" }} onClick={handleSave}>Salvar alterações</button>
        </div>
      </div>
    </>
  );
}

// ─── Student Detail ───────────────────────────────────────────────────────────
function StudentDetailView({ student, onBack }: { student: FullStudent; onBack: () => void }) {
  const detail = getStudentDetail(student);
  const maxTrend = Math.max(...detail.trendScores);

  return (
    <>
      <button className="back-btn" onClick={onBack}>← Voltar para Alunos</button>

      <div className="detail-hero">
        <div className="detail-hero-avatar" style={{ background: student.color }}>{student.initials}</div>
        <div className="detail-hero-info">
          <div className="detail-hero-name">{student.name}</div>
          <div className="detail-hero-meta">
            <span>🎓 {student.ano}</span>
            <span>🏫 {student.sala}</span>
            <span>✉️ {student.email}</span>
            <span className={`status-pill ${student.online ? "status-online" : "status-offline"}`} style={{ fontSize: 11 }}>
              <span className="status-dot" />
              {student.online ? "Online agora" : "Offline"}
            </span>
          </div>
          <div className="detail-hero-stats">
            <div className="detail-mini-stat">
              <div className="detail-mini-stat-val">{student.partidas}</div>
              <div className="detail-mini-stat-lbl">Partidas</div>
            </div>
            <div className="detail-mini-stat">
              <div className="detail-mini-stat-val" style={{ color: "var(--green)" }}>{detail.wins}</div>
              <div className="detail-mini-stat-lbl">Vitórias</div>
            </div>
            <div className="detail-mini-stat">
              <div className="detail-mini-stat-val" style={{ color: "var(--red)" }}>{detail.losses}</div>
              <div className="detail-mini-stat-lbl">Derrotas</div>
            </div>
            <div className="detail-mini-stat">
              <div className="detail-mini-stat-val">{detail.pontosTotal.toLocaleString("pt-BR")}</div>
              <div className="detail-mini-stat-lbl">Pts totais</div>
            </div>
          </div>
        </div>
        <div className="detail-hero-score-block">
          <ScoreRing score={student.score} color={student.color} />
          <div className="detail-score-lbl">Desempenho</div>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="detail-card">
            <div className="detail-card-title">
              <div className="detail-card-title-icon">📚</div>
              Desempenho por Tema
            </div>
            <div className="topics-grid">
              {detail.topics.map((t, i) => {
                const badge = topicBadge(t.score);
                return (
                  <div key={i} className="topic-card">
                    <div className="topic-card-name">{t.name}</div>
                    <div className="topic-card-score-row">
                      <div className="topic-card-score-big" style={{ color: student.color }}>{t.score}</div>
                      <div className="topic-card-score-pct">/ 100</div>
                    </div>
                    <div className="topic-card-bar-bg">
                      <div className="topic-card-bar-fill" style={{ width: `${t.score}%`, background: student.color }} />
                    </div>
                    <span className={`topic-card-badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-title">
              <div className="detail-card-title-icon">🎲</div>
              Histórico de Partidas
            </div>
            {detail.matchHistory.map((m, i) => (
              <div key={i} className="match-history-row">
                <div className={`match-result-badge ${m.won ? "match-win" : "match-loss"}`}>
                  {m.won ? "WIN" : "DEF"}
                </div>
                <div className="match-hist-info">
                  <div className="match-hist-tema">{m.tema}</div>
                  <div className="match-hist-meta">{student.sala} · {m.data}</div>
                </div>
                <div>
                  <div className="match-hist-pts" style={{ color: m.won ? "var(--green)" : "var(--red)" }}>
                    {m.won ? "+" : ""}{m.pts} pts
                  </div>
                  <div className="match-hist-duration">⏱ {m.duracao}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="detail-card">
            <div className="detail-card-title">
              <div className="detail-card-title-icon">📊</div>
              Resumo
            </div>
            {[
              { label: "Taxa de vitória", value: `${detail.taxaVitoria}%` },
              { label: "Tempo médio por partida", value: detail.tempoMedioPartida },
              { label: "Melhor tema", value: detail.topics.reduce((a, b) => a.score > b.score ? a : b).name },
              { label: "Tema a melhorar", value: detail.topics.reduce((a, b) => a.score < b.score ? a : b).name },
              { label: "Total de pontos", value: detail.pontosTotal.toLocaleString("pt-BR") },
            ].map((r, i) => (
              <div key={i} className="summary-stat-row">
                <div className="summary-stat-label">{r.label}</div>
                <div className="summary-stat-value">{r.value}</div>
              </div>
            ))}
          </div>

          <div className="detail-card">
            <div className="detail-card-title">
              <div className="detail-card-title-icon">📈</div>
              Evolução (6 semanas)
            </div>
            <div className="trend-bars">
              {detail.trendScores.map((sc, i) => (
                <div key={i} className="trend-bar-wrap">
                  <div className="trend-bar" style={{
                    height: `${(sc / maxTrend) * 64}px`,
                    background: i === detail.trendScores.length - 1 ? student.color : `${student.color}55`,
                  }} />
                  <div className="trend-bar-lbl">{detail.trendWeeks[i]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-title">
              <div className="detail-card-title-icon">🏅</div>
              Conquistas
            </div>
            <div className="achievements-grid">
              {detail.achievements.map((a, i) => (
                <div key={i} className={`achievement-badge ${a.earned ? "earned" : ""}`}>
                  <span className="achievement-icon">{a.icon}</span>
                  {a.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView() {
  const [activeTab, setActiveTab] = useState<"Hoje" | "Semana" | "Mês">("Hoje");
  const matches = MATCHES_BY_TAB[activeTab];
  const desempMedio = Math.round(TOP_STUDENTS.reduce((acc, s) => acc + s.score, 0) / TOP_STUDENTS.length);

  return (
    <>
      <div className="page-header">
        <h1>Olá, Professor <span>Mendes</span></h1>
        <p>Acompanhe o engajamento das suas turmas e a evolução dos alunos no Dominó Químico.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{ONLINE_STUDENTS.length}</div>
          <div className="stat-label">Alunos Online Agora</div>
          <div className="online-pill"><span className="online-dot" />Ao vivo</div>
          <div className="online-list">
            {ONLINE_STUDENTS.map((s, i) => (
              <div key={i} className="online-avatar-wrap" title={s.name}>
                <div className="online-student-avatar" style={{ background: s.color }}>{s.initials}</div>
                <div className="online-indicator" />
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card featured">
          <div>
            <div className="stat-label" style={{ marginBottom: 8 }}>Desempenho Médio</div>
            <div className="stat-value" style={{ fontSize: 38 }}>{desempMedio}%</div>
            <div className="stat-trend trend-up">↑ 4% vs mês passado</div>
          </div>
          <svg className="featured-graph" viewBox="0 0 90 54" fill="none">
            <polyline points="0,44 18,34 36,36 54,20 72,24 90,8" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" />
            <polyline points="0,44 18,34 36,36 54,20 72,24 90,8 90,54 0,54" fill="rgba(255,255,255,0.12)" />
          </svg>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div className="section-header">
            <div className="section-title">Partidas Recentes</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="tabs">
                {(["Hoje", "Semana", "Mês"] as const).map((t) => (
                  <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
              </div>
              <div className="section-link">Ver Tudo</div>
            </div>
          </div>
          <div className="activity-list">
            {matches.map((m, i) => (
              <div key={i} className="activity-item">
                <div className="activity-color-bar" style={{ background: m.color }} />
                <div className="activity-icon">🎲</div>
                <div className="activity-info">
                  <div className="activity-name">{m.sala} — {m.tema}</div>
                  <div className="activity-meta">Vencedor: <strong>{m.vencedor}</strong> · {m.tempoAtras}</div>
                </div>
                <div className="activity-right">
                  <div className="activity-pts">+{m.pontos} pts</div>
                  <div className="activity-duration">⏱ {m.duracao}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="widget">
          <div className="section-header">
            <div className="widget-title">Top Alunos</div>
            <div className="section-link">Ver todos</div>
          </div>
          <div className="student-list">
            {TOP_STUDENTS.map((s, i) => (
              <div key={i} className="student-row">
                {i < 3 ? <div className="student-medal">{MEDALS[i]}</div> : <div className="student-rank-num">{i + 1}º</div>}
                <div className="student-avatar" style={{ background: s.color }}>{s.initials}</div>
                <div className="student-details">
                  <div className="student-name">{s.name}</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${s.score}%`, background: s.color }} />
                  </div>
                </div>
                <div className="student-score">{s.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Students ─────────────────────────────────────────────────────────────────
function StudentsView({ onSelectStudent }: { onSelectStudent: (s: FullStudent) => void }) {
  const [search, setSearch] = useState("");
  const [anoFilter, setAnoFilter] = useState("Todos os Anos");
  const [salaFilter, setSalaFilter] = useState("Todas as Salas");

  const filtered = ALL_STUDENTS.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchAno = anoFilter === "Todos os Anos" || s.ano === anoFilter;
    const matchSala = salaFilter === "Todas as Salas" || s.sala === salaFilter;
    return matchSearch && matchSala && matchAno;
  });

  return (
    <>
      <div className="page-header">
        <h1>Lista de <span>Alunos</span></h1>
        <p>Clique em um aluno para ver seu desempenho individual detalhado.</p>
      </div>

      <div className="students-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input className="search-input" placeholder="Buscar por nome ou e-mail…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={anoFilter} onChange={(e) => setAnoFilter(e.target.value)}>
          {ANOS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select className="filter-select" value={salaFilter} onChange={(e) => setSalaFilter(e.target.value)}>
          {SALAS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="students-count">{filtered.length} aluno{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="students-table-wrap">
        {/* Wrapper for horizontal scroll on small screens */}
        <div className="students-table-scroll">
          <table className="students-table">
            <thead>
              <tr>
                <th>Aluno</th><th>Ano</th><th>Sala</th><th>Desempenho</th><th>Partidas</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} onClick={() => onSelectStudent(s)} title={`Ver perfil de ${s.name}`}>
                  <td>
                    <div className="td-student">
                      <div className="td-avatar" style={{ background: s.color }}>{s.initials}</div>
                      <div>
                        <div className="td-name">{s.name}</div>
                        <div className="td-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="td-sala">{s.ano}</span></td>
                  <td><span className="td-sala">{s.sala}</span></td>
                  <td>
                    <div className="td-score-wrap">
                      <div className="td-score-bar-bg">
                        <div className="td-score-bar-fill" style={{ width: `${s.score}%`, background: s.color }} />
                      </div>
                      <span className="td-score-val">{s.score}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{s.partidas}</td>
                  <td>
                    <span className={`status-pill ${s.online ? "status-online" : "status-offline"}`}>
                      <span className="status-dot" />
                      {s.online ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", fontSize: 14 }}>
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ProfessorDashboard() {
  const [activeNav, setActiveNav] = useState<string>("Dashboard");
  const [selectedStudent, setSelectedStudent] = useState<FullStudent | null>(null);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showTopbarMenu, setShowTopbarMenu] = useState(false);

  const handleSelectStudent = (s: FullStudent) => setSelectedStudent(s);
  const handleBack = () => setSelectedStudent(null);
  const handleNavChange = (label: string) => {
    setActiveNav(label);
    setSelectedStudent(null);
    setShowSidebarMenu(false);
    setShowTopbarMenu(false);
  };

  const breadcrumbMap: Record<string, string> = {
    Dashboard: "Painel de Controle",
    Alunos: "Lista de Alunos",
    Configurações: "Configurações",
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* ── Desktop Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">⚗</div>
            <div><div className="sidebar-logo-name">Molecular<br />Narrative</div></div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-label">Principal</div>
            {NAV.map((n) => (
              <button key={n.label} className={`nav-item ${activeNav === n.label ? "active" : ""}`} onClick={() => handleNavChange(n.label)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </button>
            ))}
          </div>
          <div className="sidebar-bottom">
            <div className="user-menu-wrap">
              {showSidebarMenu && (
                <div className="user-menu-popover">
                  <button className="user-menu-item" onClick={() => handleNavChange("Configurações")}>
                    <span className="user-menu-icon">⚙️</span> Configurações
                  </button>
                  <button className="user-menu-item danger" onClick={() => setShowSidebarMenu(false)}>
                    <span className="user-menu-icon">🚪</span> Sair da conta
                  </button>
                </div>
              )}
              <div className="sidebar-user" onClick={() => setShowSidebarMenu(v => !v)}>
                <div className="user-avatar">PM</div>
                <div className="user-info">
                  <div className="user-name">Prof. Mendes</div>
                  <div className="user-role">Administrador</div>
                </div>
                <span style={{ color: "#555", fontSize: 14, transition: "transform 0.15s", transform: showSidebarMenu ? "rotate(180deg)" : "none" }}>↗</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Topbar ── */}
        <header className="topbar">
          <span className="breadcrumb">
            <span style={{ display: "none" }} className="breadcrumb-desktop-brand">Molecular Narrative</span>
            <span className="breadcrumb-sep" style={{ display: "none" }}> / </span>
            {selectedStudent ? (
              <>
                <span className="breadcrumb-link" onClick={handleBack}>{breadcrumbMap[activeNav]}</span>
                <span className="breadcrumb-sep"> / </span>
                <span className="breadcrumb-current">{selectedStudent.name}</span>
              </>
            ) : (
              <span className="breadcrumb-current">{breadcrumbMap[activeNav] ?? activeNav}</span>
            )}
          </span>
          {/* Mobile user button */}
          <button className="topbar-user-btn" onClick={() => setShowTopbarMenu(v => !v)}>
            <div className="topbar-user-avatar">PM</div>
          </button>
          {/* Mobile user menu popover — render outside sidebar on mobile */}
          {showTopbarMenu && (
            <div style={{
              position: "fixed", top: 64, right: 12,
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 12, overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              zIndex: 200, minWidth: 180,
              animation: "popover-in 0.15s ease",
            }}>
              <button className="user-menu-item" onClick={() => handleNavChange("Configurações")}>
                <span className="user-menu-icon">⚙️</span> Configurações
              </button>
              <button className="user-menu-item danger" onClick={() => setShowTopbarMenu(false)}>
                <span className="user-menu-icon">🚪</span> Sair da conta
              </button>
            </div>
          )}
        </header>

        {/* ── Main Content ── */}
        <main className="main">
          {activeNav === "Dashboard" && <DashboardView />}
          {activeNav === "Alunos" && !selectedStudent && <StudentsView onSelectStudent={handleSelectStudent} />}
          {activeNav === "Alunos" && selectedStudent && <StudentDetailView student={selectedStudent} onBack={handleBack} />}
          {activeNav === "Configurações" && <SettingsView />}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="bottom-nav">
          {NAV.map((n) => (
            <button
              key={n.label}
              className={`bottom-nav-item ${activeNav === n.label ? "active" : ""}`}
              onClick={() => handleNavChange(n.label)}
            >
              <span className="bottom-nav-item-icon">{n.icon}</span>
              <span className="bottom-nav-item-label">{n.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </>
  );
}