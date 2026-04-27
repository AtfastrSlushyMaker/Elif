TASK F Output
Generated: 2026-04-21T01:24:50


1) FULL SCSS/CSS CONTENT

FILE: src/app/back-office/events/components/admin-virtual-session/admin-virtual-session.component.css

/* admin-virtual-session.component.css — VERSION FINALE */

.avs { font-family: inherit; }

/* ── Loading skeletons ───────────────────────────────────────── */
.avs__loading { display: flex; flex-direction: column; gap: 10px; padding: 16px 0; }
.avs-skeleton {
  height: 20px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
  background-size: 200% 100%; border-radius: 6px;
  animation: shimmer 1.4s infinite;
}
.avs-skeleton--sm  { width: 40%; height: 14px; }
.avs-skeleton--lg  { height: 80px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Topbar ──────────────────────────────────────────────────── */
.avs__topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
}
.avs__topbar-left  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.avs__topbar-right { display: flex; align-items: center; gap: 6px; }
.avs__section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.avs__live-dot {
  width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
  animation: blink 1.2s infinite;
}
@keyframes blink { 0%,100%{opacity:1}50%{opacity:.3} }
.avs__live-label { font-size: 11px; font-weight: 700; color: #16a34a; }

.avs__session-started-chip {
  font-size: 11px; font-weight: 600; color: #16a34a;
  background: #dcfce7; padding: 2px 8px; border-radius: 20px;
  border: 1px solid #86efac;
}
.avs__session-waiting-chip {
  font-size: 11px; font-weight: 600; color: #92400e;
  background: #fffbeb; padding: 2px 8px; border-radius: 20px;
  border: 1px solid #fde68a;
}

/* ── Tabs ────────────────────────────────────────────────────── */
.avs__tabs { display: flex; border-bottom: 1.5px solid #e2e8f0; margin-bottom: 18px; gap: 2px; }
.avs__tab {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px; background: none; border: none;
  border-bottom: 2.5px solid transparent; font-family: inherit;
  font-size: 13px; font-weight: 500; color: #64748b;
  cursor: pointer; transition: color .15s; margin-bottom: -1.5px;
}
.avs__tab--active { color: #3a9282; border-bottom-color: #3a9282; }
.avs__tab:hover:not(.avs__tab--active):not(:disabled) { color: #334155; }
.avs__tab:disabled { opacity: .5; cursor: not-allowed; }
.avs__tab-lock { font-size: 10px; }

/* ── Form ────────────────────────────────────────────────────── */
.avs__create-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; }
.avs__create-icon { font-size: 30px; flex-shrink: 0; }
.avs__desc { font-size: 13px; color: #475569; margin: 4px 0 0; line-height: 1.5; }
.avs__form { display: flex; flex-direction: column; gap: 16px; }
.avs__field { display: flex; flex-direction: column; gap: 5px; }
.avs__label { font-size: 13px; font-weight: 600; color: #334155; }
.avs__optional { font-size: 11px; color: #94a3b8; font-weight: 400; margin-left: 4px; }
.avs__input {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; font-family: inherit; outline: none;
  transition: border-color .15s;
}
.avs__input:focus { border-color: #3a9282; box-shadow: 0 0 0 3px rgba(58, 146, 130, 0.12); }
.avs__field-hint { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.avs__slider-row { display: flex; align-items: center; gap: 14px; }
.avs__slider { flex: 1; accent-color: #3a9282; }
.avs__slider-value { font-size: 13px; font-weight: 700; color: #0f172a; min-width: 130px; }

/* ── Email info block ────────────────────────────────────────── */
.avs__email-info {
  background: #f0faf4; border: 1.5px solid #b8eacf;
  border-radius: 10px; padding: 14px 16px;
}
.avs__email-info__title { font-size: 13px; font-weight: 700; color: #0f7a5a; margin-bottom: 10px; }
.avs__email-steps { display: flex; flex-direction: column; gap: 7px; }
.avs__email-step { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #475569; }
.avs__email-step__dot {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.avs__email-step__dot--blue  { background: #3b82f6; }
.avs__email-step__dot--green { background: #16a34a; }
.avs__email-step__dot--amber { background: #f59e0b; }
.avs__email-step__dot--red   { background: #ef4444; }

/* ── Buttons ─────────────────────────────────────────────────── */
.avs__btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0 20px; height: 42px; border: none; border-radius: 10px;
  font-family: inherit; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: opacity .12s, transform .1s;
}
.avs__btn:active { transform: scale(.98); }
.avs__btn:disabled { opacity: .55; cursor: not-allowed; }
.avs__btn--primary { background: #3a9282; color: #fff; box-shadow: 0 2px 8px rgba(29,158,117,.3); }
.avs__btn--primary:hover:not(:disabled) { background: #2f7a6e; }

.avs__spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Mod password card ───────────────────────────────────────── */
.avs__mod-card {
  background: #f5f3ff; border: 1.5px solid #c4b5fd;
  border-radius: 12px; padding: 16px; margin-bottom: 16px;
}
.avs__mod-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.avs__mod-card__title  { font-size: 14px; font-weight: 700; color: #4c1d95; }
.avs__mod-card__status { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
.avs__mod-card__status--open  { background: #fee2e2; color: #991b1b; }
.avs__mod-card__status--sched { background: #fef3c7; color: #92400e; }
.avs__mod-password {
  font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 800;
  color: #4c1d95; letter-spacing: .08em;
  background: #ede9fe; padding: 10px 16px; border-radius: 8px;
  text-align: center; margin-bottom: 10px;
}
.avs__mod-card__hint { font-size: 12px; color: #6d28d9; line-height: 1.5; }

/* ── Config grid ─────────────────────────────────────────────── */
.avs__config-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 10px; margin-bottom: 16px; }
.avs__config-card {
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
  padding: 12px 14px; display: flex; flex-direction: column; gap: 3px;
}
.avs__config-card__icon  { font-size: 18px; }
.avs__config-card__label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
.avs__config-card__value { font-size: 13px; font-weight: 700; color: #0f172a; }

/* ── Notices ─────────────────────────────────────────────────── */
.avs__notice {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; border-radius: 10px; font-size: 13px; line-height: 1.55;
  margin-bottom: 12px;
}
.avs__notice--info    { background: #eff6ff; border: 1.5px solid #bfdbfe; color: #1d4ed8; }
.avs__notice--success { background: #f0fdf4; border: 1.5px solid #86efac; color: #16a34a; }
.avs__notice--warning { background: #fffbeb; border: 1.5px solid #fde68a; color: #92400e; }

/* ── Alerts ──────────────────────────────────────────────────── */
.avs__alert {
  padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
}
.avs__alert--success { background: #dcf5e7; color: #085041; border: 1px solid #4ebe80; }
.avs__alert--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

/* ── KPIs ────────────────────────────────────────────────────── */
.avs__kpi-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap: 12px; margin-bottom: 20px; }
.avs__kpi {
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;
  padding: 16px; display: flex; flex-direction: column; gap: 3px;
}
.avs__kpi--highlight { background: #f0faf4; border-color: #b8eacf; }
.avs__kpi--certs     { background: #fffbeb; border-color: #fde68a; }
.avs__kpi--absent    { background: #fef2f2; border-color: #fecaca; }
.avs__kpi__value     { font-size: 26px; font-weight: 800; color: #0f172a; }
.avs__kpi__label     { font-size: 12px; color: #64748b; font-weight: 500; }
.avs__kpi__sub       { font-size: 11px; color: #94a3b8; }

/* ── Table ───────────────────────────────────────────────────── */
.avs__table-wrap { overflow-x: auto; border: 1.5px solid #e2e8f0; border-radius: 12px; }
.avs__table      { width: 100%; border-collapse: collapse; font-size: 13px; }
.avs__th {
  padding: 12px 14px; text-align: left;
  font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: .06em;
  background: #f8fafc; border-bottom: 1.5px solid #e2e8f0;
}
.avs__th--sortable { cursor: pointer; user-select: none; }
.avs__th--sortable:hover { color: #3a9282; }
.avs__tr:hover { background: #f8fafc; }
.avs__td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.avs__tr:last-child .avs__td { border-bottom: none; }
.avs__td--muted { color: #94a3b8; }
.avs__td--attendance { min-width: 160px; }

/* ── Participant cell ────────────────────────────────────────── */
.avs__participant { display: flex; align-items: center; gap: 10px; }
.avs__avatar {
  width: 32px; height: 32px; background: #3a9282; color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.avs__avatar--cert   { background: #d97706; }
.avs__avatar--absent { background: #94a3b8; }
.avs__participant-name   { font-size: 13px; font-weight: 600; color: #0f172a; }
.avs__participant-sub    { display: block; font-size: 11px; color: #16a34a; }
.avs__participant-absent { display: block; font-size: 11px; color: #94a3b8; }

/* ── Attendance bar ──────────────────────────────────────────── */
.avs__att-bar {
  height: 5px; background: #e2e8f0; border-radius: 3px;
  overflow: visible; position: relative; margin-top: 5px;
}
.avs__att-bar__fill { height: 100%; border-radius: 3px; transition: width .4s; }
.avs__att-bar__fill--ok  { background: #22c55e; }
.avs__att-bar__fill--low { background: #f59e0b; }
.avs__att-bar__threshold {
  position: absolute; top: -3px; width: 2px; height: 11px;
  background: #64748b; transform: translateX(-50%);
}

/* ── Certificate ─────────────────────────────────────────────── */
.avs__cert-link {
  color: #3a9282; font-weight: 700; font-size: 12px;
  text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
}
.avs__cert-link:hover { text-decoration: underline; }
.avs__cert-not-earned { font-size: 11px; color: #94a3b8; }

/* ── Email sent notice ───────────────────────────────────────── */
.avs__email-sent-notice {
  display: flex; align-items: center; gap: 8px;
  background: #f0faf4; border: 1px solid #b8eacf;
  border-radius: 8px; padding: 10px 14px;
  font-size: 12px; color: #0f7a5a; margin-top: 14px;
}

/* ── Empty ───────────────────────────────────────────────────── */
.avs__empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 48px; color: #94a3b8; font-size: 14px; text-align: center;
}
.avs__empty span { font-size: 36px; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 600px) {
  .avs__kpi-grid    { grid-template-columns: 1fr 1fr; }
  .avs__config-grid { grid-template-columns: 1fr 1fr; }
}

-----

FILE: src/app/back-office/events/components/events.component/events.component.css

/* ═══════════════════════════════════════════════════════════════
   ELIF — Events Back-Office
   Thème : fond clair, vert primaire, typographie Outfit
═══════════════════════════════════════════════════════════════ */

/* ── Variables ─────────────────────────────────────────────── */
:host {
  --green-50:  #f0faf4;
  --green-100: #dcf5e7;
  --green-200: #b8eacf;
  --green-400: #4ebe80;
  --green-500: #3a9282;   /* primaire Elif */
  --green-600: #2f7a6e;
  --green-700: #265f56;

  --amber-50:  #fffbeb;
  --amber-400: #fbbf24;
  --amber-600: #d97706;

  --red-50:    #fef2f2;
  --red-500:   #ef4444;
  --red-600:   #dc2626;

  --blue-50:   #eff6ff;
  --blue-500:  #3b82f6;

  --grey-50:   #f8fafc;
  --grey-100:  #f1f5f9;
  --grey-200:  #e2e8f0;
  --grey-300:  #cbd5e1;
  --grey-400:  #94a3b8;
  --grey-500:  #64748b;
  --grey-700:  #334155;
  --grey-900:  #0f172a;

  --bg:        #f8fafc;
  --surface:   #ffffff;
  --border:    #dde7ef;

  --shadow-sm: 0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 12px 28px rgba(15, 23, 42, 0.1);
  --shadow-lg: 0 24px 60px -38px rgba(15, 23, 42, 0.7), 0 4px 12px rgba(15,122,90,.08);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --font: inherit;
  --mono: inherit;

  display: block;
  background: var(--bg);
  min-height: 100vh;
  font-family: var(--font);
  color: var(--grey-900);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Layout wrapper ────────────────────────────────────────── */
.bo-events {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px 60px;
}

/* ══════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════ */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0 14px;
  border-bottom: 1.5px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 100;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--grey-500);
}
.topbar__logo {
  font-weight: 700;
  font-size: 18px;
  color: var(--green-600);
  letter-spacing: -.5px;
}
.topbar__sep { color: var(--grey-300); }
.topbar__page { color: var(--grey-700); font-weight: 600; }

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar__notif {
  position: relative;
  width: 38px; height: 38px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--grey-500);
  transition: border-color .15s, color .15s;
}
.topbar__notif:hover { border-color: var(--green-500); color: var(--green-600); }
.topbar__notif-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: var(--red-500);
  color: #fff;
  font-size: 10px; font-weight: 700;
  min-width: 18px; height: 18px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--bg);
  padding: 0 3px;
}

.btn-icon {
  display: flex; align-items: center; gap: 6px;
  padding: 0 14px; height: 38px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--grey-700);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.btn-icon:hover { border-color: var(--green-500); background: var(--green-50); }
.btn-icon:disabled { opacity: .5; cursor: not-allowed; }

.btn-outline-sm {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0 14px; height: 36px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--green-600);
  cursor: pointer;
  text-decoration: none;
  transition: background .15s;
}
.btn-outline-sm:hover { background: var(--green-50); }

.btn-primary-sm {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0 16px; height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--green-500);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background .15s, transform .1s;
}
.btn-primary-sm:hover { background: var(--green-600); }
.btn-primary-sm:active { transform: scale(.97); }

.btn-ghost {
  padding: 0 14px; height: 36px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--grey-500);
  cursor: pointer;
  transition: border-color .15s;
}
.btn-ghost:hover { border-color: var(--grey-400); }

/* ══════════════════════════════════════════════════════════
   NOTIFICATION PANEL
══════════════════════════════════════════════════════════ */
.notif-panel {
  position: fixed;
  top: 64px; right: 28px;
  width: 360px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
  animation: slideDown .18s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.notif-panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--green-50);
}
.notif-panel__title { font-size: 14px; font-weight: 600; color: var(--grey-900); }
.notif-panel__read-all {
  font-size: 12px; font-weight: 500; color: var(--green-600);
  background: none; border: none; cursor: pointer;
}
.notif-panel__list { max-height: 380px; overflow-y: auto; }
.notif-item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid var(--grey-100);
  cursor: pointer;
  transition: background .12s;
  position: relative;
}
.notif-item:hover { background: var(--green-50); }
.notif-item--unread { background: var(--green-50); }
.notif-item__icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.notif-item__body { flex: 1; min-width: 0; }
.notif-item__title { font-size: 13px; font-weight: 600; color: var(--grey-900); margin-bottom: 2px; }
.notif-item__msg { font-size: 12px; color: var(--grey-500); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-item__time { font-size: 11px; color: var(--grey-400); margin-top: 3px; }
.notif-item__dot {
  width: 8px; height: 8px;
  background: var(--green-500);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.notif-panel__empty { padding: 32px; text-align: center; color: var(--grey-400); font-size: 14px; }

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36px 0 24px;
  gap: 24px;
  flex-wrap: wrap;
}
.hero__title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -.8px;
  color: var(--grey-900);
  line-height: 1.15;
}
.hero__accent {
  color: var(--green-500);
}
.hero__sub {
  font-size: 14px;
  color: var(--grey-500);
  margin-top: 6px;
}
.hero__sub--skeleton {
  color: var(--grey-300);
  font-style: italic;
}

/* KPI strip */
.kpi-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.kpi-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 22px;
  min-width: 120px;
  box-shadow: var(--shadow-sm);
  transition: transform .15s, box-shadow .15s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.kpi-card--green {
  background: var(--green-50);
  border-color: var(--green-200);
}
.kpi-card__val {
  font-size: 24px;
  font-weight: 700;
  color: var(--grey-900);
  letter-spacing: -.5px;
  line-height: 1;
}
.kpi-card--green .kpi-card__val { color: var(--green-600); }
.kpi-card__lbl {
  font-size: 12px;
  color: var(--grey-500);
  margin-top: 4px;
  font-weight: 500;
}

/* ══════════════════════════════════════════════════════════
   FILTERS BAR
══════════════════════════════════════════════════════════ */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);
}
.filters-bar__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
}
.filters-bar__search-icon {
  position: absolute;
  left: 10px;
  color: var(--grey-400);
  pointer-events: none;
}
.filters-bar__input {
  width: 100%;
  padding: 0 36px 0 34px;
  height: 36px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font); font-size: 13px;
  color: var(--grey-900);
  background: var(--grey-50);
  outline: none;
  transition: border-color .15s, background .15s;
}
.filters-bar__input:focus { border-color: var(--green-500); background: #fff; }
.filters-bar__clear {
  position: absolute; right: 10px;
  background: none; border: none;
  color: var(--grey-400); cursor: pointer; font-size: 12px;
}
.filters-bar__select {
  height: 36px;
  padding: 0 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font); font-size: 13px;
  color: var(--grey-700);
  background: var(--grey-50);
  outline: none;
  cursor: pointer;
  transition: border-color .15s;
}
.filters-bar__select:focus { border-color: var(--green-500); }

.filters-bar__right {
  display: flex; align-items: center; gap: 10px;
  margin-left: auto;
}
.filters-bar__count { font-size: 13px; color: var(--grey-500); font-weight: 500; }
.filters-bar__reset {
  font-size: 12px; font-weight: 500; color: var(--green-600);
  background: none; border: none; cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background .12s;
}
.filters-bar__reset:hover { background: var(--green-50); }

/* ══════════════════════════════════════════════════════════
   LOADING STATE
══════════════════════════════════════════════════════════ */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--grey-500);
  font-size: 14px;
}
.spinner {
  width: 22px; height: 22px;
  border: 2.5px solid var(--green-200);
  border-top-color: var(--green-500);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════
   EVENTS GRID
══════════════════════════════════════════════════════════ */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
}

.event-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: transform .18s, box-shadow .18s;
}
.event-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--green-200);
}

/* Ribbon */
.event-card__ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--green-50);
  border-bottom: 1px solid var(--green-100);
}

/* Status pill */
.status-pill {
  font-size: 11px; font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: .3px;
}
.pill--planned  { background: #e0f2fe; color: #0369a1; }
.pill--ongoing  { background: #dcfce7; color: #15803d; }
.pill--completed{ background: #f0f9ff; color: #0284c7; }
.pill--cancelled{ background: #fee2e2; color: #991b1b; }
.pill--full     { background: #fef9c3; color: #854d0e; }

/* Days badge */
.days-badge {
  font-size: 11px; font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}
.days-past   { background: var(--grey-100); color: var(--grey-500); }
.days-today  { background: #fef9c3; color: #854d0e; }
.days-soon   { background: #fee2e2; color: #991b1b; }
.days-normal { background: var(--green-100); color: var(--green-700); }

/* Body */
.event-card__body { padding: 16px 16px 12px; flex: 1; }

.event-card__cat {
  font-size: 11px; font-weight: 600;
  color: var(--green-600);
  text-transform: uppercase;
  letter-spacing: .6px;
  margin-bottom: 6px;
  display: flex; align-items: center; gap: 6px;
}
.event-card__approval-badge {
  font-size: 10px; font-weight: 600;
  background: var(--amber-50);
  color: var(--amber-600);
  padding: 2px 7px;
  border-radius: 12px;
  border: 1px solid #fde68a;
}

.event-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--grey-900);
  line-height: 1.35;
  margin-bottom: 10px;
  letter-spacing: -.2px;
}

.event-card__meta {
  display: flex; flex-direction: column; gap: 4px;
  margin-bottom: 12px;
}
.event-card__meta-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--grey-500);
}
.event-card__meta-item svg { flex-shrink: 0; }

/* Capacity bar */
.event-card__capacity { margin-bottom: 10px; }
.event-card__cap-numbers {
  display: flex; justify-content: space-between;
  font-size: 12px; color: var(--grey-500); margin-bottom: 5px;
}
.event-card__cap-pct { font-weight: 600; color: var(--grey-700); }
.event-card__cap-track {
  height: 5px;
  background: var(--grey-100);
  border-radius: 3px;
  overflow: hidden;
}
.event-card__cap-fill {
  height: 100%;
  border-radius: 3px;
  transition: width .4s ease;
}
.fill-ok   { background: var(--green-400); }
.fill-warn { background: var(--amber-400); }
.fill-full { background: var(--red-500); }

/* Rating */
.event-card__rating {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px;
}
.event-card__rating-val { font-weight: 600; color: var(--grey-700); }
.event-card__review-count { color: var(--grey-400); }
.star-on  { color: #f59e0b; }
.star-off { color: var(--grey-200); }

/* Card footer */
.event-card__footer {
  padding: 10px 14px 14px;
  border-top: 1px solid var(--grey-100);
  display: flex; flex-direction: column; gap: 8px;
}
.event-card__quick-actions {
  display: flex; gap: 6px;
}
.qa-btn {
  width: 30px; height: 30px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--grey-500);
  transition: border-color .12s, color .12s, background .12s;
}
.qa-btn:hover { border-color: var(--green-500); color: var(--green-600); background: var(--green-50); }
.qa-btn--green { border-color: var(--green-200); color: var(--green-600); background: var(--green-50); }
.qa-btn--green:hover { border-color: var(--green-600); background: var(--green-100); }
.qa-btn--danger:hover { border-color: var(--red-500); color: var(--red-500); background: var(--red-50); }

.event-card__main-actions {
  display: flex; gap: 6px;
}
.event-card__btn {
  flex: 1;
  height: 30px;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: opacity .12s, transform .1s;
}
.event-card__btn:active { transform: scale(.97); }
.event-card__btn--view   { background: var(--green-100); color: var(--green-700); }
.event-card__btn--view:hover { background: var(--green-200); }
.event-card__btn--edit   { background: var(--blue-50); color: var(--blue-500); }
.event-card__btn--edit:hover { background: #dbeafe; }
.event-card__btn--cancel { background: var(--amber-50); color: var(--amber-600); }
.event-card__btn--cancel:hover { background: #fde68a; }
.event-card__btn--delete { background: var(--red-50); color: var(--red-600); }
.event-card__btn--delete:hover { background: #fee2e2; }

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════ */
.empty-state {
  text-align: center;
  padding: 80px 0;
}
.empty-state__icon { font-size: 48px; margin-bottom: 16px; }
.empty-state__title { font-size: 20px; font-weight: 600; color: var(--grey-700); }
.empty-state__sub { font-size: 14px; color: var(--grey-500); margin-top: 6px; }
.empty-state__actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }

/* ══════════════════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════════════════ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 0 0;
  flex-wrap: wrap;
}
.pagination__info { font-size: 13px; color: var(--grey-500); }
.pagination__btns { display: flex; gap: 4px; }
.pg-btn {
  width: 34px; height: 34px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--grey-700);
  cursor: pointer;
  transition: border-color .12s, background .12s;
}
.pg-btn:hover:not(:disabled) { border-color: var(--green-500); background: var(--green-50); }
.pg-btn--active { background: var(--green-500); border-color: var(--green-500); color: #fff; }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.pagination__size {
  height: 34px; padding: 0 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 13px;
  background: var(--surface); color: var(--grey-700);
  cursor: pointer; outline: none;
}

/* ══════════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn .15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalIn .18s ease;
}
.modal--lg  { max-width: 760px; }
.modal--sm  { max-width: 440px; }
.modal--confirm { max-width: 420px; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 16px;
  border-bottom: 1.5px solid var(--border);
  position: sticky; top: 0;
  background: var(--surface);
  z-index: 1;
}
.modal__header-title {
  display: flex; align-items: center; gap: 12px;
}
.modal__icon {
  width: 38px; height: 38px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.modal__icon--blue   { background: var(--blue-50); border-color: #bfdbfe; }
.modal__icon--amber  { background: var(--amber-50); border-color: #fde68a; }
.modal__icon--green  { background: var(--green-50); border-color: var(--green-200); }

.modal__header h3 { font-size: 16px; font-weight: 700; color: var(--grey-900); }
.modal__header p  { font-size: 12px; color: var(--grey-500); margin-top: 1px; }

.modal__close {
  width: 30px; height: 30px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--grey-500);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .12s, color .12s;
}
.modal__close:hover { border-color: var(--red-500); color: var(--red-500); }

.modal__body { padding: 20px 22px; }
.modal__body p { font-size: 14px; color: var(--grey-700); line-height: 1.6; }
.modal__desc { font-size: 14px; color: var(--grey-600); margin-bottom: 14px; }
.modal__empty {
  text-align: center; padding: 32px;
  color: var(--grey-400); font-size: 14px;
}
.modal__loading {
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.modal__tabs {
  display: flex;
  border-bottom: 1.5px solid var(--border);
  padding: 0 22px;
}
.modal__tab {
  padding: 10px 16px;
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--grey-500);
  border: none; background: none;
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  transition: color .12s, border-color .12s;
  display: flex; align-items: center; gap: 6px;
  margin-bottom: -1.5px;
}
.modal__tab--active { color: var(--green-600); border-bottom-color: var(--green-500); }
.modal__tab:hover:not(.modal__tab--active) { color: var(--grey-700); }

.modal__footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  padding: 16px 22px;
  border-top: 1.5px solid var(--border);
  position: sticky; bottom: 0;
  background: var(--surface);
}

/* ── Data table ────────────────────────────────────────── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table th {
  text-align: left;
  font-size: 11px; font-weight: 600;
  color: var(--grey-500);
  text-transform: uppercase;
  letter-spacing: .5px;
  padding: 8px 10px;
  border-bottom: 1.5px solid var(--border);
  background: var(--grey-50);
}
.data-table td {
  padding: 10px 10px;
  border-bottom: 1px solid var(--grey-100);
  vertical-align: middle;
}
.data-table tr:hover td { background: var(--green-50); }

.user-cell {
  display: flex; align-items: center; gap: 8px;
  font-weight: 500; color: var(--grey-800);
}
.avatar {
  width: 28px; height: 28px;
  background: var(--green-500);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex-shrink: 0;
}
.avatar--orange { background: var(--amber-400); }

/* ── Badges ────────────────────────────────────────────── */
.badge {
  font-size: 11px; font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-block;
}
.badge--green  { background: var(--green-100); color: var(--green-700); }
.badge--amber  { background: var(--amber-50);  color: var(--amber-600); }
.badge--red    { background: var(--red-50);    color: var(--red-600); }
.badge--grey   { background: var(--grey-100);  color: var(--grey-500); }
.tab-badge {
  font-size: 10px; font-weight: 700;
  background: var(--grey-100); color: var(--grey-600);
  padding: 1px 6px; border-radius: 10px;
}
.tab-badge--orange { background: var(--amber-50); color: var(--amber-600); }

/* ── Capacity modal ────────────────────────────────────── */
.cap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.cap-kpi {
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 12px;
  text-align: center;
}
.cap-kpi--green { background: var(--green-50); border-color: var(--green-200); }
.cap-kpi--orange { background: var(--amber-50); border-color: #fde68a; }
.cap-kpi--red   { background: var(--red-50); border-color: #fecaca; }
.cap-kpi__val { font-size: 22px; font-weight: 700; color: var(--grey-900); line-height: 1; }
.cap-kpi--green .cap-kpi__val { color: var(--green-600); }
.cap-kpi__lbl { font-size: 11px; color: var(--grey-500); margin-top: 4px; }
.gauge { margin-bottom: 14px; }
.gauge__label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: var(--grey-600); }
.gauge__track { height: 8px; background: var(--grey-100); border-radius: 4px; overflow: hidden; }
.gauge__fill { height: 100%; background: var(--green-400); border-radius: 4px; transition: width .4s; }
.gauge__fill--warn { background: var(--amber-400); }
.gauge__fill--full { background: var(--red-500); }
.badge-row { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Waitlist status ───────────────────────────────────── */
.position-badge {
  width: 26px; height: 26px;
  background: var(--green-500);
  color: #fff;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.wl-status {
  font-size: 11px; font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}
.status-waiting  { background: #e0f2fe; color: #0369a1; }
.status-notified { background: var(--amber-50); color: var(--amber-600); }
.status-confirmed{ background: var(--green-100); color: var(--green-700); }
.status-cancelled{ background: var(--grey-100); color: var(--grey-500); }
.status-expired  { background: var(--red-50); color: var(--red-600); }
.deadline-time { font-size: 12px; color: var(--grey-600); display: block; }
.countdown { font-size: 11px; color: var(--amber-600); font-weight: 600; }

/* ── Action buttons ────────────────────────────────────── */
.action-btn {
  padding: 5px 12px; height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: opacity .12s;
}
.action-btn:hover { opacity: .85; }
.action-btn--approve { background: var(--green-100); color: var(--green-700); }
.action-btn--reject  { background: var(--red-50); color: var(--red-600); }
.action-btn--notify  { background: var(--blue-50); color: var(--blue-500); }
.action-btn--warn    { background: var(--amber-50); color: var(--amber-600); }
.inline-actions { display: flex; gap: 6px; }
.text-muted { color: var(--grey-400); font-size: 12px; }

/* ── Weather ───────────────────────────────────────────── */
.weather-hero { text-align: center; padding: 16px 0 20px; }
.weather-big-icon { font-size: 52px; }
.weather-temp { font-size: 36px; font-weight: 700; color: var(--grey-900); margin-top: 4px; }
.weather-city { font-size: 16px; color: var(--grey-500); margin-top: 2px; }
.weather-desc { font-size: 13px; color: var(--grey-400); margin-top: 4px; }
.weather-details { margin: 0 0 16px; }
.wd-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--grey-100); font-size: 14px; color: var(--grey-600); }
.wd-row strong { color: var(--grey-900); font-weight: 600; }
.recommendation-box { border-radius: var(--radius-md); padding: 14px 16px; }
.recommendation-box--outdoor { background: var(--green-50); border: 1.5px solid var(--green-200); }
.recommendation-box--indoor  { background: var(--blue-50);  border: 1.5px solid #bfdbfe; }
.recommendation-box__badge { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
.recommendation-box p { font-size: 13px; color: var(--grey-600); }

/* ── Reviews ───────────────────────────────────────────── */
.reviews-list { display: flex; flex-direction: column; gap: 10px; }
.review-card { background: var(--grey-50); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 14px 16px; }
.review-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.review-card__user { font-weight: 600; font-size: 13px; color: var(--grey-900); }
.review-card__date { font-size: 11px; color: var(--grey-400); }
.review-card__right { display: flex; align-items: center; gap: 10px; }
.review-stars { font-size: 14px; display: flex; align-items: center; gap: 3px; }
.review-card__comment { font-size: 13px; color: var(--grey-600); line-height: 1.5; }

/* ── Reminders ─────────────────────────────────────────── */
.reminder-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.reminder-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--green-50); border: 1.5px solid var(--green-100); border-radius: var(--radius-md); font-size: 13px; color: var(--grey-700); }
.reminder-row__icon { font-size: 16px; }
.reminder-row span:nth-child(2) { flex: 1; }
.warning-box { background: var(--amber-50); border-left: 4px solid var(--amber-400); border-radius: 4px; padding: 12px 14px; font-size: 13px; color: #92400e; line-height: 1.5; }

/* ══════════════════════════════════════════════════════════
   ELIGIBILITY RULES MODAL
══════════════════════════════════════════════════════════ */
.rules-info-banner {
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 13px; color: var(--green-700);
  line-height: 1.5;
  margin-bottom: 20px;
}
.rules-info-banner svg { flex-shrink: 0; margin-top: 2px; }

.rules-section {
  margin-bottom: 24px;
}
.rules-section__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.rules-section__header h4 {
  font-size: 14px; font-weight: 600; color: var(--grey-900);
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.rules-section__scope {
  font-size: 11px; font-weight: 400;
  color: var(--grey-400);
  background: var(--grey-100);
  padding: 2px 8px; border-radius: 12px;
}

.rules-list { display: flex; flex-direction: column; gap: 6px; }
.rule-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color .12s;
}
.rule-row:hover { border-color: var(--green-300); }
.rule-row--inactive { opacity: .5; }
.rule-row__left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.rule-row__value { font-size: 12px; font-family: var(--mono); color: var(--grey-600); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rule-row__right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.rule-row__criteria { font-size: 13px; font-weight: 500; color: var(--grey-800); font-family: var(--mono); }

.rule-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 10px;
  text-transform: uppercase; letter-spacing: .4px;
  flex-shrink: 0;
}
.rule-badge--hard { background: #fee2e2; color: var(--red-600); }
.rule-badge--soft { background: var(--amber-50); color: var(--amber-600); }

.rule-priority {
  font-size: 11px; font-weight: 600;
  background: var(--grey-100); color: var(--grey-500);
  padding: 1px 6px; border-radius: 4px;
  font-family: var(--mono);
}

.rules-empty { font-size: 13px; color: var(--grey-400); padding: 14px 0; font-style: italic; }

/* ── Add Rule Form ─────────────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field--full { grid-column: 1 / -1; }
.form-label { font-size: 13px; font-weight: 600; color: var(--grey-700); }
.form-required { color: var(--red-500); }
.form-hint { font-size: 11px; color: var(--grey-400); font-weight: 400; }
.form-input, .form-select {
  height: 36px;
  padding: 0 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font); font-size: 13px;
  color: var(--grey-900);
  background: var(--grey-50);
  outline: none;
  transition: border-color .15s, background .15s;
  width: 100%;
}
.form-input:focus, .form-select:focus { border-color: var(--green-500); background: #fff; }

.form-checkbox-group { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
.form-checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--grey-700); cursor: pointer; }
.form-checkbox-label input { width: 16px; height: 16px; accent-color: var(--green-500); cursor: pointer; }

.rule-type-toggle { display: flex; gap: 8px; }
.rule-type-btn {
  flex: 1; height: 36px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font); font-size: 12px; font-weight: 500;
  color: var(--grey-600);
  cursor: pointer;
  transition: border-color .12s, background .12s, color .12s;
}
.rule-type-btn--active.rule-type-btn:nth-child(1) {
  border-color: var(--red-500);
  background: var(--red-50);
  color: var(--red-600);
}
.rule-type-btn--active.rule-type-btn:nth-child(2) {
  border-color: var(--amber-400);
  background: var(--amber-50);
  color: var(--amber-600);
}

/* ══════════════════════════════════════════════════════════
   TOAST STACK
══════════════════════════════════════════════════════════ */
.toast-stack {
  position: fixed;
  bottom: 24px; right: 24px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 500;
}
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: var(--grey-900);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  animation: toastIn .2s ease;
  max-width: 340px;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
.toast--success { background: var(--green-600); }
.toast--error   { background: var(--red-600); }
.toast--warning { background: var(--amber-600); }
.toast--info    { background: #1e40af; }
.toast button {
  background: none; border: none; color: rgba(255,255,255,.7);
  cursor: pointer; font-size: 12px; margin-left: auto;
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .bo-events { padding: 0 14px 40px; }
  .hero { flex-direction: column; }
  .events-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .modal--lg { max-width: 100%; }
  .topbar__actions { gap: 6px; }
  .btn-icon span { display: none; }
  .kpi-strip { gap: 8px; }
  .kpi-card { padding: 12px 14px; min-width: 90px; }
}
/* ════════════════════════════════════════════════════════════════
   BACK-OFFICE : Grille des dossiers compétition
════════════════════════════════════════════════════════════════ */

.modal--xl {
  max-width: 960px;
}

.comp-legend {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 22px;
  background: #f8fafc;
  border-bottom: 1px solid #e2ede8;
  flex-wrap: wrap;
}

.comp-legend__item {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.comp-legend__item--high {
  background: #dcf5e7;
  color: #085041;
}

.comp-legend__item--medium {
  background: #fef9c3;
  color: #854d0e;
}

.comp-legend__item--low {
  background: #fee2e2;
  color: #991b1b;
}

.comp-legend__item--warning {
  background: #fffbeb;
  color: #92400e;
}

.comp-entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.comp-entry-card {
  background: #fff;
  border: 1.5px solid #e2ede8;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.15s;
}

.comp-entry-card:hover {
  box-shadow: 0 4px 16px rgba(15, 122, 90, 0.1);
}

.comp-entry-card--warning {
  border-color: #fde68a;
  background: #fffdf0;
}

.comp-entry-card__score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 20px;
}

.comp-entry-card__score.score-high {
  background: #dcf5e7;
}

.comp-entry-card__score.score-medium {
  background: #fef9c3;
}

.comp-entry-card__score.score-low {
  background: #fee2e2;
}

.comp-entry-card__score-val {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.comp-entry-card__score-lbl {
  font-size: 12px;
  color: #64748b;
}

.score-high .comp-entry-card__score-val {
  color: #085041;
}

.score-medium .comp-entry-card__score-val {
  color: #854d0e;
}

.score-low .comp-entry-card__score-val {
  color: #991b1b;
}

.verdict-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 20px;
}

.verdict-badge--ok {
  background: #dcf5e7;
  color: #085041;
}

.verdict-badge--warn {
  background: #fffbeb;
  color: #92400e;
}

.comp-entry-card__pet-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.comp-entry-card__pet-breed {
  font-size: 13px;
  font-weight: 600;
  color: #1d9e75;
}

.comp-entry-card__pet-species {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comp-entry-card__owner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}

.avatar--sm {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.comp-entry-card__owner-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.comp-entry-card__owner-email {
  font-size: 11px;
  color: #64748b;
}

.comp-entry-card__details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comp-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.comp-detail-row strong {
  color: #334155;
  font-weight: 600;
}

.text-green {
  color: #1d9e75 !important;
}

.text-red {
  color: #ef4444 !important;
}

.comp-entry-card__rules-title,
.comp-entry-card__warnings-title {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 5px;
}

.comp-entry-card__rules-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.rule-chip {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 10px;
}

.rule-chip--ok {
  background: #dcf5e7;
  color: #085041;
}

.rule-chip--warn {
  background: #fffbeb;
  color: #92400e;
}

.comp-entry-card__notes {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}

-----

FILE: src/app/back-office/events/pages/categories/admin-categories.component.css

:host {
  display: block;
}

/* ============================================================
   PAGE HEADER & KPI CARDS
   ============================================================ */
.bo-categories-page {
  position: relative;
}

.bo-kpi-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
}

.bo-kpi-card-accent {
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
}

.bo-kpi-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.bo-kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
}

.bo-kpi-copy {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* ============================================================
   BOUTONS
   ============================================================ */
.detail-primary-button,
.detail-secondary-button,
.bo-action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  text-decoration: none;
  border: 1px solid transparent;
}

.detail-primary-button {
  background: linear-gradient(135deg, #3a9282, #2f7a6e);
  color: white;
  box-shadow: 0 12px 24px -18px rgba(58, 146, 130, 0.9);
}

.detail-primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -18px rgba(58, 146, 130, 0.96);
  filter: saturate(108%);
}

.detail-secondary-button {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.bo-action-button-back {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.bo-action-button-back:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.bo-action-button-edit {
  background: #ecfeff;
  border: 1px solid #a5d8d0;
  color: #0d9488;
}

.bo-action-button-edit:hover {
  background: #d1fdf9;
  border-color: #7eccc4;
}

.bo-action-button-delete {
  background: #fff1f2;
  border: 1px solid rgba(214, 73, 86, 0.28);
  color: #b4233b;
}

.bo-action-button-delete:hover {
  background: #ffe4e8;
  border-color: rgba(214, 73, 86, 0.34);
  color: #a71d33;
}

/* ============================================================
   TABLEAU
   ============================================================ */
.bo-section-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.25rem;
}

.bo-categories-table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow-x: auto;
}

.bo-categories-table {
  width: 100%;
  border-collapse: collapse;
}

.bo-categories-table th {
  padding: 0.75rem;
  background: #f8fafc;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.bo-categories-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.bo-categories-table tr:hover {
  background: #f8fafc;
}

.bo-categories-main-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bo-categories-icon-tile {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.bo-categories-title {
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.bo-categories-inline-pill {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #f1f5f9;
  border-radius: 1rem;
  font-size: 0.7rem;
  color: #64748b;
}

.bo-categories-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bo-categories-status-pill-success {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.bo-categories-status-pill-warning {
  background: rgba(248, 154, 63, 0.1);
  color: #b45309;
  border: 1px solid rgba(248, 154, 63, 0.2);
}

.bo-categories-description {
  font-size: 0.8rem;
  color: #475569;
  max-width: 300px;
}

.bo-categories-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* ============================================================
   MODALE - VERSION SIMPLIFIÉE
   ============================================================ */
.bo-categories-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.46);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.bo-categories-modal {
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.78));
  border-radius: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  width: 100%;
  max-width: 31rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px -38px rgba(15, 23, 42, 0.7);
  padding: 0;
}

/* Header modale */
.bo-categories-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.bo-categories-modal-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #64748b;
  margin-bottom: 0.4rem;
}

.bo-categories-modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.bo-categories-modal-subtitle {
  font-size: 0.88rem;
  color: #475569;
  margin: 0.38rem 0 0;
  line-height: 1.5;
}

.bo-categories-close {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  background: #f1f5f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.bo-categories-close:hover {
  border-color: #e2e8f0;
  background: #e2e8f0;
  color: #0f172a;
}

/* Body modale */
.bo-categories-modal-body {
  padding: 1.25rem;
  overflow-y: auto;
}

.bo-categories-form-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 1.25rem;
}

/* Formulaire */
.bo-form-field {
  margin-bottom: 1rem;
}

.bo-form-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.bo-form-input,
.bo-form-textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.bo-form-input:focus,
.bo-form-textarea:focus {
  outline: none;
  border-color: #3a9282;
  box-shadow: 0 0 0 3px rgba(58, 146, 130, 0.12);
}

.bo-form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Toggle */
.bo-toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.bo-toggle-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #0f172a;
}

.bo-toggle-desc {
  font-size: 0.7rem;
  color: #64748b;
}

.bo-toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.bo-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.bo-toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  border-radius: 34px;
  cursor: pointer;
  transition: 0.2s;
}

.bo-toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

input:checked + .bo-toggle-slider {
  background: #3a9282;
}

input:checked + .bo-toggle-slider:before {
  transform: translateX(20px);
}

/* Aperçu */
.bo-preview-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.bo-preview-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.bo-icon-preview {
  width: 56px;
  height: 56px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 0.5rem;
}

.bo-icon-input {
  width: 70px;
  margin: 0 auto;
  text-align: center;
  padding: 0.3rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.bo-icon-hint {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.bo-preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 2rem;
  margin-top: 0.75rem;
  font-size: 0.75rem;
}

.bo-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.bo-status-approval {
  background: #fef3c7;
  color: #b45309;
}

.bo-status-free {
  background: #d1fae5;
  color: #065f46;
}

/* Footer modale */
.bo-categories-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.bo-btn-primary,
.bo-btn-secondary {
  padding: 0.52rem 0.72rem;
  border-radius: 0.72rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.bo-btn-primary {
  background: linear-gradient(145deg, #3a9282, #2f7a6e);
  color: white;
  box-shadow: 0 12px 22px -16px rgba(13, 148, 136, 0.82);
}

.bo-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px -16px rgba(13, 148, 136, 0.9);
}

.bo-btn-secondary {
  background: #fff;
  color: #334155;
  border-color: #d6deea;
}

.bo-btn-secondary:hover {
  transform: translateY(-1px);
  background: #f8fafc;
}

/* États vides et erreurs */
.bo-categories-state,
.bo-categories-error {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
}

.bo-categories-state {
  background: #f8fafc;
  color: #64748b;
}

.bo-categories-error {
  background: #fef2f2;
  color: #b91c1c;
}

.bo-form-error {
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border-radius: 0.5rem;
  color: #b91c1c;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .bo-categories-form-grid {
    grid-template-columns: 1fr;
  }
  
  .bo-categories-table th,
  .bo-categories-table td {
    display: block;
  }
  
  .bo-categories-table thead {
    display: none;
  }
  
  .bo-categories-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.5rem;
  }
  
  .bo-categories-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    padding: 0.3rem 0;
  }
  
  .bo-categories-table td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 0.7rem;
    color: #64748b;
  }
  
  .bo-categories-actions {
    justify-content: flex-start;
  }
}

-----

FILE: src/app/back-office/events/pages/dashboard/admin-dashboard.component.css

:host {
  --green-primary:  #3a9282;
  --green-light:    #2f7a6e;
  --green-bg:       rgba(58, 146, 130, 0.08);
  --green-border:   rgba(58, 146, 130, 0.2);

  --blue:           #1d4ed8;
  --amber:          #d97706;
  --purple:         #7c3aed;
  --red:            #dc2626;

  --bg-page:        #f8fafc;
  --bg-card:        #ffffff;
  --bg-header:      #f8fafc;

  --border:         #e2e8f0;
  --border-light:   #f1f5f9;

  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --text-muted:     #64748b;

  --shadow-sm:      0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-md:      0 12px 28px rgba(15, 23, 42, 0.1);
  --radius:         1rem;
  --radius-sm:      0.75rem;
}

/* ── Layout ── */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
  background: transparent;
}

/* ── Loading ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px;
  color: var(--text-secondary);
  font-size: 14px;
}

.dark-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--green-primary);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════
   KPI GRID
══════════════════════════════════════════════ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.kpi-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: var(--radius) var(--radius) 0 0;
}

.kpi-card--green::before  { background: linear-gradient(90deg, var(--green-primary), var(--green-light)); }
.kpi-card--blue::before   { background: linear-gradient(90deg, #1d4ed8, var(--blue)); }
.kpi-card--amber::before  { background: linear-gradient(90deg, #b45309, var(--amber)); }
.kpi-card--purple::before { background: linear-gradient(90deg, #5b21b6, var(--purple)); }

.kpi-icon {
  font-size: 26px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-card--green  .kpi-icon { background: rgba(58, 146, 130, 0.12); }
.kpi-card--blue   .kpi-icon { background: rgba(29, 122, 79, 0.12); }
.kpi-card--amber  .kpi-icon { background: rgba(217, 119, 6, 0.12); }
.kpi-card--purple .kpi-icon { background: rgba(124, 58, 237, 0.12); }

.kpi-body { flex: 1; }

.kpi-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 3px;
}

.kpi-sub {
  font-size: 11px;
  color: var(--text-muted);
}

.kpi-trend {
  font-size: 18px;
}

.kpi-gauge {
  width: 24px;
  height: 44px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  flex-shrink: 0;
}

.kpi-gauge-fill {
  background: linear-gradient(0deg, var(--amber), #fbbf24);
  border-radius: 4px;
  transition: height 0.8s ease;
}

/* ══════════════════════════════════════════════
   CHARTS ROW
══════════════════════════════════════════════ */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.panel-badge {
  font-size: 11px;
  color: var(--green-primary);
  background: var(--green-bg);
  border: 1px solid var(--green-border);
  padding: 3px 8px;
  border-radius: 50px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.panel-link {
  font-size: 12px;
  color: var(--green-primary);
  text-decoration: none;
  font-weight: 600;
}

.panel-link:hover { text-decoration: underline; }

/* ── Trend bars ── */
.trend-chart {
  height: 150px;
  display: flex;
  align-items: flex-end;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  width: 100%;
  height: 100%;
}

.trend-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.trend-bar-value {
  font-size: 10px;
  color: var(--text-muted);
}

.trend-bar {
  width: 100%;
  min-height: 4px;
  background: rgba(58, 146, 130, 0.1);
  border-radius: 4px 4px 0 0;
  transition: height 0.6s ease;
}

.trend-bar--current {
  background: linear-gradient(0deg, var(--green-primary), var(--green-light));
}

.trend-bar-label {
  font-size: 9px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ── Status / Category bars ── */
.status-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 85px;
  flex-shrink: 0;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--planned   { background: var(--green-light); }
.dot--ongoing   { background: var(--amber); }
.dot--completed { background: var(--blue); }
.dot--cancelled { background: var(--red); }
.dot--full      { background: var(--purple); }

.status-name {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-bar-track {
  flex: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.fill--planned   { background: var(--green-light); }
.fill--ongoing   { background: var(--amber); }
.fill--completed { background: var(--blue); }
.fill--cancelled { background: var(--red); }
.fill--full      { background: var(--purple); }
.fill--category  { background: linear-gradient(90deg, var(--green-primary), var(--green-light)); }

.status-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  width: 24px;
  text-align: right;
}

/* ══════════════════════════════════════════════
   TOP TABLE PANEL
══════════════════════════════════════════════ */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.top-table-wrap { overflow-x: auto; }

.top-table {
  width: 100%;
  border-collapse: collapse;
}

.top-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  background: var(--bg-header);
}

.top-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
  font-size: 13px;
  color: var(--text-primary);
}

.top-table tr:last-child td { border-bottom: none; }
.top-table tr:hover td { background: var(--bg-header); }

/* Rank badge */
.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.rank-1 { background: #fef3c7; color: #92400e; }
.rank-2 { background: #f3f4f6; color: #374151; }
.rank-3 { background: #fef3c7; color: #b45309; }
.rank-4, .rank-5 { background: var(--border-light); color: var(--text-muted); }

.event-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-img-placeholder {
  font-size: 16px;
  width: 28px;
  text-align: center;
}

.event-title-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.cat-pill {
  background: var(--green-bg);
  color: var(--green-primary);
  border: 1px solid var(--green-border);
  padding: 3px 8px;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.loc-cell {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fill-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fill-bar {
  width: 56px;
  height: 5px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.fill-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--green-primary), var(--green-light));
  border-radius: 3px;
}

.fill-cell span {
  font-size: 11px;
  color: var(--text-muted);
  width: 30px;
}

/* Status pills */
.status-pill {
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sp--planned   { background: rgba(16, 185, 129, 0.1); color: #065f46; }
.sp--ongoing   { background: rgba(248, 154, 63, 0.1); color: #b45309; }
.sp--completed { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; }
.sp--cancelled { background: rgba(220, 38, 38, 0.1); color: #991b1b; }
.sp--full      { background: rgba(124, 58, 237, 0.1); color: #5b21b6; }

.row-actions { display: flex; gap: 4px; }

.row-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-header);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.15s ease;
}

.row-btn:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
}

/* ══════════════════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════════════════ */
.quick-actions h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.action-card:hover {
  border-color: var(--green-primary);
  color: var(--green-primary);
  background: var(--green-bg);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-card--primary {
  border-color: var(--green-border);
  color: var(--green-primary);
  background: var(--green-bg);
  border: 1px solid var(--green-border);
}

.action-card--primary:hover {
  background: rgba(58, 146, 130, 0.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.ac-icon { font-size: 22px; }

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .kpi-grid      { grid-template-columns: repeat(2, 1fr); }
  .charts-row    { grid-template-columns: 1fr; }
  .action-cards  { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .kpi-grid     { grid-template-columns: 1fr; }
  .action-cards { grid-template-columns: 1fr; }
}

-----

FILE: src/app/back-office/events/pages/detail/event-detail.component.css

:host {
  display: block;
}

.bo-event-detail-page {
  position: relative;
}

.bo-event-detail-status-pill,
.bo-event-detail-inline-pill,
.bo-event-detail-tab-badge,
.bo-event-detail-table-pill,
.bo-event-detail-index-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  white-space: nowrap;
}

.bo-event-detail-status-pill {
  padding: 0.36rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fff;
}

.bo-event-detail-inline-pill,
.bo-event-detail-table-pill {
  border: 1px solid #dbe5ef;
  background: #f8fafc;
  padding: 0.28rem 0.68rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
}

.bo-event-detail-table-pill-success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.bo-event-detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.92);
  padding-bottom: 1rem;
}


/* ── TOKENS ─────────────────────────────────────────────────── */
:root,
.event-detail {
  --bg:         #f8fafc;
  --surface:    #ffffff;
  --surface2:   #f8fafc;

  /* Teal principal */
  --teal:       #3a9282;
  --teal-h:     #2f7a6e;
  --teal-lt:    #e6f4f1;
  --teal-md:    #b8dfdb;

  /* Texte */
  --text:       #1a1a1a;
  --text2:      #374151;
  --muted:      #6b7280;
  --muted2:     #9ca3af;

  /* Bordures */
  --border:     #dde7ef;
  --border2:    #d9e5ee;

  /* États sémantiques */
  --orange:     #d97706;
  --orange-lt:  #fffbeb;
  --orange-bd:  #fde68a;
  --red:        #dc2626;
  --red-lt:     #fef2f2;
  --red-md:     #fee2e2;
  --red-bd:     #fca5a5;
  --green:      #16a34a;
  --green-lt:   #f0fdf4;
  --green-md:   #bbf7d0;
  --amber:      #b45309;
  --amber-lt:   #fef3c7;
  --purple:     #7c3aed;
  --purple-lt:  #ede9fe;
  --blue:       #1d4ed8;
  --blue-lt:    #eff6ff;

  /* Ombres */
  --shadow:     0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-h:   0 12px 28px rgba(15, 23, 42, 0.1);
  --shadow-lg:  0 24px 60px -38px rgba(15, 23, 42, 0.7);

  /* Rayons */
  --r:          12px;
  --r-sm:       8px;
  --r-pill:     999px;

  font-family: inherit;
  color: var(--text);
}

/* ================================================================
   PAGE SHELL
   ================================================================ */
.event-detail {
  background: var(--bg);
  min-height: 100vh;
}

/* ================================================================
   HEADER — sticky barre de navigation de détail
   ================================================================ */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 12px;
  flex-wrap: wrap;
  box-shadow: var(--shadow);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg);
  border: 1.5px solid var(--border2);
  border-radius: var(--r-sm);
  padding: 7px 14px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}
.btn-back:hover {
  background: var(--surface);
  color: var(--teal);
  border-color: var(--teal-md);
  transform: translateX(-2px);
}

.header-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* ================================================================
   BOUTONS — système complet
   ================================================================ */
.btn {
  padding: 9px 18px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  border: none;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.btn:disabled { opacity: .4; cursor: not-allowed; }

/* Primaire — teal */
.btn-primary {
  background: var(--teal);
  color: #fff;
  border: none;
}
.btn-primary:hover:not(:disabled) {
  background: var(--teal-h);
  transform: translateY(-1px);
}

/* Outline — bordure teal */
.btn-outline {
  background: var(--surface);
  border: 1.5px solid var(--border2);
  color: var(--text2);
}
.btn-outline:hover:not(:disabled) {
  border-color: var(--teal-md);
  color: var(--teal);
  background: var(--teal-lt);
}

/* Ghost — fond gris */
.btn-ghost {
  background: var(--bg);
  border: 1.5px solid var(--border);
  color: var(--muted);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--border);
  color: var(--text);
}

/* Danger — rouge */
.btn-danger {
  background: var(--red-lt);
  border: 1.5px solid var(--red-md);
  color: var(--red);
}
.btn-danger:hover:not(:disabled) {
  background: var(--red);
  color: #fff;
  border-color: var(--red);
}

/* Warning — orange */
.btn-warn {
  background: var(--orange-lt);
  border: 1.5px solid var(--orange-bd);
  color: var(--orange);
}
.btn-warn:hover:not(:disabled) {
  background: var(--orange);
  color: #fff;
  border-color: var(--orange);
}

/* Success — vert */
.btn-success {
  background: var(--green-lt);
  border: 1.5px solid var(--green-md);
  color: var(--green);
}
.btn-success:hover:not(:disabled) {
  background: var(--green);
  color: #fff;
  border-color: var(--green);
}

/* Tailles */
.btn-sm { padding: 7px 14px; font-size: 12.5px; }
.btn-xs { padding: 4px 10px; font-size: 11.5px; border-radius: 6px; }

/* Bouton delete inline (tables) */
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--red-lt);
  border: 1.5px solid var(--red-md);
  border-radius: 6px;
  padding: 4px 10px;
  color: var(--red);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: all .15s;
}
.btn-delete:hover {
  background: var(--red);
  color: #fff;
  border-color: var(--red);
}

/* ================================================================
   COVER — bannière de l'événement
   ================================================================ */
.event-cover {
  height: 260px;
  background-size: cover;
  background-position: center;
  background-color: var(--teal-lt);
  position: relative;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 20, 18, 0.82) 0%,
    rgba(10, 20, 18, 0.45) 60%,
    rgba(10, 20, 18, 0.2) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 36px 48px;
}

.cover-content { width: 100%; }

.event-status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: #fff;
  border: 1px solid rgba(255,255,255,.2);
}

.event-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0 0 12px;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -.3px;
}

.event-meta {
  display: flex;
  gap: 20px;
  color: rgba(255,255,255,.85);
  font-size: 13px;
  flex-wrap: wrap;
}
.event-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ================================================================
   TABS
   ================================================================ */
.tabs {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  overflow-x: auto;
  gap: 0;
}

.tab {
  padding: 13px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  font-family: inherit;
  margin-bottom: -1px;
}
.tab:hover { color: var(--text); background: var(--bg); }
.tab.active {
  color: var(--teal);
  border-bottom-color: var(--teal);
  background: var(--surface);
}

.tab .badge {
  background: var(--red);
  color: #fff;
  padding: 1px 7px;
  border-radius: var(--r-pill);
  font-size: 10.5px;
  font-weight: 700;
}

/* ================================================================
   TAB CONTENT
   ================================================================ */
.tab-content {
  padding: 32px;
  max-width: 1300px;
  margin: 0 auto;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
}
.tab-header h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: var(--text);
}

.inline-loading {
  font-size: 13.5px;
  color: var(--muted);
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ================================================================
   INFO TAB
   ================================================================ */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 22px 24px;
  box-shadow: var(--shadow);
}
.info-card h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}
.info-card p {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text2);
  margin: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.detail-row:last-child { border-bottom: none; }
.detail-row span {
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  flex-shrink: 0;
}
.detail-row strong {
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

/* Capacité */
.capacity-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.capacity-stats .stat {
  flex: 1;
  min-width: 70px;
  background: var(--surface2);
  padding: 12px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border);
  text-align: center;
}
.capacity-stats .stat span {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.capacity-stats .stat strong {
  font-size: 22px;
  font-weight: 800;
  color: var(--teal);
}

.capacity-bar {
  height: 6px;
  background: var(--border);
  border-radius: var(--r-pill);
  overflow: hidden;
  margin-bottom: 14px;
}
.capacity-fill {
  height: 100%;
  background: var(--teal);
  border-radius: var(--r-pill);
  transition: width .5s ease;
}
.capacity-fill.fill-warn { background: var(--orange); }
.capacity-fill.fill-full { background: var(--red); }

.capacity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}

.capacity-actions { margin-top: 12px; }

.text-amber { color: var(--amber); font-weight: 700; }
.text-red   { color: var(--red);   font-weight: 700; }
.text-green { color: var(--green); font-weight: 700; }

/* ================================================================
   PARTICIPANTS TAB
   ================================================================ */
.participants-section { margin-bottom: 36px; }
.participants-section h4 {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .06em;
}

/* ── Data Table ─────────────────────────────────────────────── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.data-table th {
  text-align: left;
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  background: var(--surface2);
  border-bottom: 1.5px solid var(--border);
}
.data-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text2);
  font-size: 13.5px;
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: var(--teal-lt); }

.participant-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text);
}

/* Avatar */
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--teal-lt);
  border: 2px solid var(--teal-md);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--teal);
  flex-shrink: 0;
  text-transform: uppercase;
}
.avatar.pending {
  background: var(--orange-lt);
  border-color: var(--orange-bd);
  color: var(--orange);
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  font-size: 11.5px;
  font-weight: 700;
}
.status-badge.confirmed {
  background: var(--green-lt);
  color: var(--green);
  border: 1px solid var(--green-md);
}

.inline-actions { display: flex; gap: 6px; }

/* ================================================================
   WAITLIST TAB
   ================================================================ */
.position {
  display: inline-flex;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--teal-lt);
  border: 1.5px solid var(--teal-md);
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--teal);
}

.badge-sm {
  display: inline-block;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 700;
  background: var(--surface2);
  border: 1px solid var(--border2);
  color: var(--muted);
}
.badge-sm.badge-ok {
  background: var(--green-lt);
  border-color: var(--green-md);
  color: var(--green);
}

/* ================================================================
   REVIEWS TAB
   ================================================================ */
.reviews-tab h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 20px;
  color: var(--text);
}

.reviews-list { display: flex; flex-direction: column; gap: 12px; }

.review-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 18px 20px;
  box-shadow: var(--shadow);
  transition: border-color .15s, box-shadow .15s;
}
.review-card:hover {
  border-color: var(--teal-md);
  box-shadow: var(--shadow-h);
}

.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
  flex-wrap: wrap;
}

.reviewer { display: flex; align-items: center; gap: 10px; }
.reviewer .name {
  font-weight: 700;
  font-size: 14px;
  color: var(--text);
}
.reviewer .date {
  font-size: 11px;
  color: var(--muted2);
  margin-top: 2px;
}

.rating { display: flex; align-items: center; gap: 3px; }
.rating span {
  color: var(--border2);
  font-size: 16px;
  line-height: 1;
}
.rating .star-filled { color: #f4c542; }
.rating-value {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--muted);
  margin-left: 4px;
}

.review-comment {
  font-size: 13.5px;
  color: var(--text2);
  line-height: 1.6;
  margin: 8px 0 0;
}

/* ================================================================
   WEATHER TAB
   ================================================================ */
.weather-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 36px;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: var(--shadow);
}

.weather-header { margin-bottom: 24px; }
.weather-icon { font-size: 64px; display: block; margin-bottom: 10px; }
.weather-temp {
  font-size: 48px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}
.weather-city {
  font-size: 15px;
  color: var(--muted);
  margin: 8px 0 4px;
}
.weather-desc {
  font-size: 13.5px;
  color: var(--teal);
  font-weight: 600;
}

.weather-details {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 22px;
  gap: 8px;
  flex-wrap: wrap;
}
.weather-details .detail { text-align: center; }
.weather-details .detail span {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 5px;
  font-weight: 600;
}
.weather-details .detail strong {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
}

.recommendation {
  padding: 16px;
  border-radius: var(--r-sm);
}
.recommendation.outdoor {
  background: var(--green-lt);
  border: 1.5px solid var(--green-md);
}
.recommendation.indoor {
  background: var(--blue-lt);
  border: 1.5px solid #bfdbfe;
}
.rec-badge {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .05em;
  margin-bottom: 8px;
  color: var(--text);
}
.recommendation.outdoor .rec-badge { color: var(--green); }
.recommendation.indoor  .rec-badge { color: var(--blue); }
.recommendation p {
  font-size: 13px;
  margin: 0;
  color: var(--text2);
  line-height: 1.55;
}

/* ================================================================
   REMINDERS TAB
   ================================================================ */
.reminders-desc {
  font-size: 13.5px;
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.55;
}

.reminders-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.reminder-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 16px 20px;
  box-shadow: var(--shadow);
  transition: border-color .15s;
}
.reminder-card:hover { border-color: var(--teal-md); }

.reminder-icon { font-size: 22px; flex-shrink: 0; }
.reminder-body { flex: 1; }
.reminder-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.reminder-desc {
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 3px;
}

.warning-box {
  background: var(--orange-lt);
  border: 1.5px solid var(--orange-bd);
  border-radius: var(--r-sm);
  padding: 14px 18px;
  font-size: 13px;
  color: var(--orange);
  line-height: 1.5;
  font-weight: 500;
}

/* ================================================================
   EMPTY STATE
   ================================================================ */
.empty {
  text-align: center;
  padding: 48px 32px;
  color: var(--muted);
  font-size: 14px;
  background: var(--surface);
  border-radius: var(--r);
  border: 1.5px dashed var(--border2);
}

/* ================================================================
   LOADING & ERROR
   ================================================================ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 18px;
  background: var(--bg);
  color: var(--muted);
  font-size: 14px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: spin .75s linear infinite;
}

/* ================================================================
   TOAST
   ================================================================ */
.detail-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-radius: var(--r);
  font-size: 13.5px;
  font-weight: 600;
  z-index: 9999;
  box-shadow: var(--shadow-lg);
  border: 1.5px solid;
  animation: toastIn .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(16px) scale(.96); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
.detail-toast--success {
  background: var(--green-lt);
  border-color: var(--green-md);
  color: var(--green);
}
.detail-toast--error {
  background: var(--red-lt);
  border-color: var(--red-md);
  color: var(--red);
}
.detail-toast--info {
  background: var(--blue-lt);
  border-color: #bfdbfe;
  color: var(--blue);
}
.detail-toast--warning {
  background: var(--orange-lt);
  border-color: var(--orange-bd);
  color: var(--orange);
}

/* ================================================================
   CONFIRM DIALOG
   ================================================================ */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.confirm-dialog {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 28px;
  width: 420px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
  animation: modalIn .22s cubic-bezier(.34,1.56,.64,1);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.confirm-dialog h3 {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 10px;
  color: var(--text);
}
.confirm-dialog p {
  font-size: 13.5px;
  color: var(--muted);
  margin: 0 0 24px;
  line-height: 1.55;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ================================================================
   RESPONSIVE
   ================================================================ */
@media (max-width: 900px) {
  .info-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
  }
  .header-right { width: 100%; }
  .cover-overlay { padding: 24px 20px; }
  .event-title { font-size: 22px; }
  .event-meta { flex-direction: column; gap: 6px; }
  .tabs { padding: 0 16px; }
  .tab { padding: 11px 14px; font-size: 13px; }
  .tab-content { padding: 20px 16px; }
  .weather-card { padding: 24px; }
  .weather-temp { font-size: 38px; }
  .weather-details { flex-direction: column; gap: 14px; }
}

-----

FILE: src/app/back-office/events/pages/form/admin-event-form.component.css

/* admin-event-form.component.css — VERSION COMPLÈTE */

:host {
  --green-50:  #f0faf4;
  --green-100: #dcf5e7;
  --green-200: #b8eacf;
  --green-400: #4ebe80;
  --green-500: #3a9282;
  --green-600: #2f7a6e;
  --green-700: #265f56;

  --amber-50:  #fffbeb;
  --amber-100: #fef3c7;
  --amber-400: #fbbf24;
  --amber-600: #d97706;

  --red-50:    #fef2f2;
  --red-500:   #ef4444;
  --red-600:   #dc2626;

  --blue-50:   #eff6ff;
  --blue-200:  #bfdbfe;
  --blue-500:  #3b82f6;

  --purple-50: #faf5ff;
  --purple-200:#e9d5ff;
  --purple-600:#9333ea;

  --grey-50:   #f8fafc;
  --grey-100:  #f1f5f9;
  --grey-200:  #e2e8f0;
  --grey-300:  #cbd5e1;
  --grey-400:  #94a3b8;
  --grey-500:  #64748b;
  --grey-700:  #334155;
  --grey-900:  #0f172a;

  --bg:        #f8fafc;
  --surface:   #ffffff;
  --border:    #dde7ef;

  --shadow-sm: 0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 12px 28px rgba(15, 23, 42, 0.1);
  --shadow-lg: 0 24px 60px -38px rgba(15, 23, 42, 0.7);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --font: inherit;
  --mono: inherit;

  display: block;
  background: var(--bg);
  min-height: 100vh;
  font-family: var(--font);
  color: var(--grey-900);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Shell wrapper ─────────────────────────────────────────── */
.aef-shell {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* ══════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════ */
.aef-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0 14px;
  border-bottom: 1.5px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 50;
}

.aef-topbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.aef-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--grey-700);
  cursor: pointer;
  text-decoration: none;
  transition: border-color .15s, background .15s;
}

.aef-back-btn:hover { border-color: var(--green-500); background: var(--green-50); }
.aef-topbar__sep { color: var(--grey-300); }
.aef-topbar__title { font-weight: 600; color: var(--grey-900); }

/* ══════════════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════════════ */
.aef-stepper {
  padding: 32px 0 24px;
}

.aef-stepper__track {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.aef-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  position: relative;
}

.aef-step__bubble {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--grey-300);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--grey-400);
  flex-shrink: 0;
  transition: border-color .2s, background .2s, color .2s;
  z-index: 1;
}

.aef-step--active .aef-step__bubble {
  border-color: var(--green-500);
  background: var(--green-500);
  color: #fff;
  box-shadow: 0 0 0 4px var(--green-100);
}

.aef-step--done .aef-step__bubble {
  border-color: var(--green-500);
  background: var(--green-50);
  color: var(--green-600);
}

.aef-step__label { padding-top: 6px; }

.aef-step__name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--grey-400);
  transition: color .2s;
}

.aef-step--active .aef-step__name,
.aef-step--done .aef-step__name { color: var(--grey-900); }

.aef-step__sub {
  display: block;
  font-size: 11px;
  color: var(--grey-400);
  margin-top: 1px;
}

.aef-step__connector {
  flex: 1;
  height: 2px;
  background: var(--grey-200);
  margin-top: 16px;
  margin-left: -8px;
  margin-right: 4px;
  border-radius: 1px;
  transition: background .2s;
}

.aef-step--done + .aef-step .aef-step__connector,
.aef-step--done .aef-step__connector { background: var(--green-400); }

/* ══════════════════════════════════════════════════════════
   ALERTS
══════════════════════════════════════════════════════════ */
.aef-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.aef-alert--error   { background: var(--red-50); color: var(--red-600); border: 1.5px solid #fecaca; }
.aef-alert--success { background: var(--green-50); color: var(--green-700); border: 1.5px solid var(--green-200); }

/* ══════════════════════════════════════════════════════════
   PANEL
══════════════════════════════════════════════════════════ */
.aef-panel {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 20px;
  animation: panelIn .2s ease;
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.aef-panel__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 28px 18px;
  border-bottom: 1.5px solid var(--border);
  background: var(--grey-50);
}

.aef-panel__icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.aef-panel__icon--blue   { background: var(--blue-50);   border: 1.5px solid var(--blue-200);   color: var(--blue-500); }
.aef-panel__icon--amber  { background: var(--amber-50);  border: 1.5px solid var(--amber-100);  color: var(--amber-600); }
.aef-panel__icon--green  { background: var(--green-50);  border: 1.5px solid var(--green-200);  color: var(--green-600); }
.aef-panel__icon--purple { background: var(--purple-50); border: 1.5px solid var(--purple-200); color: var(--purple-600); }
.aef-panel__icon--grey   { background: var(--grey-100);  border: 1.5px solid var(--grey-200);   color: var(--grey-500); }

.aef-panel__title { font-size: 17px; font-weight: 700; color: var(--grey-900); letter-spacing: -.3px; }
.aef-panel__sub   { font-size: 13px; color: var(--grey-500); margin-top: 2px; }

.aef-form-body { padding: 28px; }

/* ══════════════════════════════════════════════════════════
   FORM GRID & FIELDS
══════════════════════════════════════════════════════════ */
.aef-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.aef-field { display: flex; flex-direction: column; gap: 6px; }
.aef-field--full { grid-column: 1 / -1; }

.aef-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--grey-700);
  display: flex;
  align-items: center;
  gap: 4px;
}

.aef-required { color: var(--red-500); }
.aef-field__hint {
  font-size: 11px;
  font-weight: 400;
  color: var(--grey-400);
  margin-top: 4px;
}

.aef-field__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aef-input, .aef-select, .aef-textarea {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font);
  font-size: 14px;
  color: var(--grey-900);
  background: var(--grey-50);
  outline: none;
  transition: border-color .15s, background .15s, box-shadow .15s;
}

.aef-input  { height: 40px; padding: 0 12px; }
.aef-textarea { padding: 12px; resize: vertical; min-height: 120px; }
.aef-select { height: 40px; padding: 0 36px 0 12px; appearance: none; cursor: pointer; }

.aef-input:focus,
.aef-textarea:focus,
.aef-select:focus {
  border-color: var(--green-500);
  background: #fff;
  box-shadow: 0 0 0 3px var(--green-100);
}

.aef-input--error, .aef-textarea--error, .aef-select--error {
  border-color: var(--red-500);
}

.aef-error-msg { font-size: 12px; color: var(--red-500); font-weight: 500; }
.aef-char-count { font-size: 11px; color: var(--grey-400); }

/* Select wrapper */
.aef-select-wrap { position: relative; }

.aef-select-icon {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--grey-400);
}

/* Input with icon */
.aef-input-with-icon { position: relative; display: flex; align-items: center; }
.aef-input-with-icon svg {
  position: absolute; left: 12px;
  color: var(--grey-400); pointer-events: none;
}
.aef-input--icon { padding-left: 36px; }

/* ── FORMAT TOGGLE (nouveau) ────────────────────────────────────── */
.aef-format-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

.aef-format-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  cursor: pointer;
  transition: all .2s ease;
  position: relative;
}

.aef-format-card:hover {
  border-color: var(--green-400);
  background: var(--green-50);
}

.aef-format-card--active {
  border-color: var(--green-500);
  background: var(--green-50);
  box-shadow: 0 0 0 3px var(--green-100);
}

.aef-format-card__icon {
  font-size: 28px;
  flex-shrink: 0;
}

.aef-format-card__info {
  flex: 1;
}

.aef-format-card__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--grey-900);
  margin-bottom: 2px;
}

.aef-format-card__desc {
  font-size: 11px;
  color: var(--grey-500);
}

.aef-format-card__radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--grey-300);
  border-radius: 50%;
  background: var(--surface);
  transition: all .2s;
  flex-shrink: 0;
}

.aef-format-card__radio--on {
  border-color: var(--green-500);
  background: var(--green-500);
  box-shadow: inset 0 0 0 3px var(--surface);
}

/* ── Category badge ────────────────────────────────────── */
.aef-cat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.aef-cat-badge__icon { font-size: 16px; }
.aef-cat-badge__name { font-weight: 600; color: var(--green-700); }

.aef-cat-badge__pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.aef-cat-badge__pill--warn  { background: var(--amber-50); color: var(--amber-600); border: 1px solid var(--amber-100); }
.aef-cat-badge__pill--green { background: var(--green-100); color: var(--green-700); }

.aef-cat-badge__rules {
  font-size: 11px;
  color: var(--green-600);
  background: var(--green-100);
  padding: 2px 8px;
  border-radius: 20px;
  margin-left: auto;
}

/* ── Upload zone ───────────────────────────────────────── */
.aef-upload-zone {
  width: 100%;
  min-height: 160px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: border-color .15s, background .15s;
  background: var(--grey-50);
}

.aef-upload-zone:hover { border-color: var(--green-400); background: var(--green-50); }
.aef-upload-zone--has-image { border-style: solid; border-color: var(--green-200); }

.aef-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--grey-400);
  font-size: 13px;
}

.aef-upload-hint { font-size: 11px; color: var(--grey-300); }

.aef-upload-preview {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.aef-upload-remove {
  position: absolute;
  top: 8px; right: 8px;
  width: 28px; height: 28px;
  background: rgba(0,0,0,.55);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}

.aef-upload-remove:hover { background: rgba(0,0,0,.75); }
.aef-hidden { display: none; }

.aef-upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 6px;
  padding: 6px 14px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 12px; font-weight: 500;
  color: var(--green-600);
  cursor: pointer;
  transition: background .12s;
}

.aef-upload-btn:hover { background: var(--green-50); }

.aef-uploading {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--grey-500);
  margin-top: 6px;
}

/* ── Duration chip ─────────────────────────────────────── */
.aef-info-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--green-700);
  height: 40px;
}

/* ── Weather card ──────────────────────────────────────── */
.aef-weather-card {
  margin-top: 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.aef-weather-card__header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: var(--grey-50);
  border-bottom: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--grey-700);
}

.aef-weather-card__body { padding: 14px 16px; }

.aef-weather-row {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
}

.aef-weather-icon { font-size: 28px; }
.aef-weather-temp { font-size: 22px; font-weight: 700; color: var(--grey-900); }
.aef-weather-desc { font-size: 14px; color: var(--grey-500); flex: 1; }

.aef-weather-pill {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px;
}

.aef-weather-pill--outdoor { background: var(--green-100); color: var(--green-700); }
.aef-weather-pill--indoor  { background: var(--blue-50); color: var(--blue-500); }

/* ══════════════════════════════════════════════════════════
   VIRTUAL SESSION (nouveau)
══════════════════════════════════════════════════════════ */
.aef-online-skip {
  text-align: center;
  padding: 48px 24px;
  color: var(--grey-500);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--grey-50);
}

.aef-online-skip__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.aef-online-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--blue-50);
  border: 1.5px solid var(--blue-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--blue-700);
  margin-bottom: 24px;
}

.aef-slider-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.aef-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--grey-200);
  outline: none;
  -webkit-appearance: none;
}

.aef-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--green-500);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}

.aef-slider::-webkit-slider-thumb:hover {
  background: var(--green-600);
  transform: scale(1.1);
}

.aef-slider-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--green-700);
  background: var(--green-100);
  padding: 4px 12px;
  border-radius: var(--radius-md);
  min-width: 70px;
  text-align: center;
}

.aef-virtual-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 24px;
  padding: 20px;
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
}

.aef-virtual-summary__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.aef-virtual-summary__icon {
  font-size: 24px;
}

.aef-virtual-summary__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--grey-500);
}

.aef-virtual-summary__val {
  font-size: 14px;
  font-weight: 600;
  color: var(--grey-900);
  margin-top: 2px;
}

.aef-creating-session {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  color: var(--green-700);
  font-size: 13px;
  font-weight: 500;
}

.aef-session-created {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  color: var(--green-700);
  font-size: 13px;
  text-align: center;
}

/* ══════════════════════════════════════════════════════════
   RULES STEP
══════════════════════════════════════════════════════════ */
.aef-rules-banner {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--green-700);
  line-height: 1.6;
  margin-bottom: 24px;
}

.aef-rules-banner svg { flex-shrink: 0; margin-top: 2px; }

.aef-rules-banner__blocking {
  background: #fee2e2;
  color: var(--red-600);
  padding: 0 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.aef-rules-empty-state {
  text-align: center;
  padding: 48px;
  color: var(--grey-400);
  font-size: 14px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}

.aef-rules-section { margin-bottom: 28px; }

.aef-rules-section__hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}

.aef-rules-section__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: var(--grey-900);
  flex-wrap: wrap;
}

.aef-rules-section__scope {
  font-size: 11px; font-weight: 400;
  background: var(--grey-100);
  color: var(--grey-500);
  padding: 2px 8px;
  border-radius: 20px;
}

.aef-rules-count {
  font-size: 11px; font-weight: 700;
  background: var(--green-100); color: var(--green-700);
  padding: 2px 10px; border-radius: 20px;
}

.aef-add-rule-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  color: var(--green-600);
  cursor: pointer;
  transition: background .12s;
}

.aef-add-rule-btn:hover { background: var(--green-50); }

/* Rule rows */
.aef-rule-list { display: flex; flex-direction: column; gap: 6px; }

.aef-rule-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color .12s;
}

.aef-rule-row:hover { border-color: var(--green-300); }

.aef-rule-row--inherited {
  background: linear-gradient(90deg, var(--green-50), var(--grey-50));
  border-left: 3px solid var(--green-400);
}

.aef-rule-row__left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }

.aef-rule-criteria {
  font-size: 13px; font-weight: 500; color: var(--grey-800);
  font-family: var(--mono);
}

.aef-rule-value {
  font-size: 12px; color: var(--grey-600);
  flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.aef-rule-row__right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.aef-rule-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: .5px;
  flex-shrink: 0;
}

.aef-rule-badge--blocking { background: #fee2e2; color: var(--red-600); }
.aef-rule-badge--warning  { background: var(--amber-50); color: var(--amber-600); }

.aef-rule-values { display: flex; flex-wrap: wrap; gap: 4px; }

.aef-rule-chip {
  font-size: 11px; font-weight: 500;
  background: var(--green-100);
  color: var(--green-700);
  padding: 2px 7px;
  border-radius: 20px;
  font-family: var(--mono);
}

.aef-rule-number, .aef-rule-boolean {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--grey-700);
}

.aef-rule-priority {
  font-size: 10px; font-weight: 700;
  background: var(--grey-100); color: var(--grey-500);
  padding: 1px 6px; border-radius: 4px;
  font-family: var(--mono);
}

.aef-rule-inherited-badge {
  font-size: 10px; font-weight: 600;
  background: var(--green-50); color: var(--green-600);
  padding: 2px 7px; border-radius: 20px;
  border: 1px solid var(--green-200);
}

.aef-rule-delete {
  width: 28px; height: 28px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--grey-400);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .12s, color .12s, background .12s;
}

.aef-rule-delete:hover { border-color: var(--red-500); color: var(--red-500); background: var(--red-50); }

/* Empty rules */
.aef-rules-empty {
  font-size: 13px; color: var(--grey-400);
  padding: 16px 0;
  font-style: italic;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}

.aef-rules-empty__hint { color: var(--grey-300); }

.aef-rules-empty__link {
  color: var(--green-600); text-decoration: none; font-weight: 600;
}

.aef-rules-empty__link:hover { text-decoration: underline; }

/* Add rule inline form */
.aef-add-rule-form {
  border: 1.5px solid var(--green-300);
  border-radius: var(--radius-lg);
  background: var(--green-50);
  overflow: hidden;
  margin-bottom: 14px;
  animation: panelIn .18s ease;
}

.aef-add-rule-form__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  background: var(--green-100);
  font-size: 13px; font-weight: 600; color: var(--green-700);
  border-bottom: 1px solid var(--green-200);
}

.aef-add-rule-form__close {
  background: none; border: none;
  font-size: 16px; color: var(--green-600);
  cursor: pointer;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
}

.aef-add-rule-form__close:hover { background: var(--green-200); }

.aef-rule-form-grid { padding: 18px; display: flex; flex-direction: column; gap: 16px; }

.aef-add-rule-form__footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--green-200);
  background: var(--surface);
}

/* Criteria chips grid */
.aef-criteria-grid {
  display: flex; flex-wrap: wrap; gap: 8px;
}

.aef-criteria-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font); font-size: 12px; font-weight: 500;
  color: var(--grey-700);
  cursor: pointer;
  transition: border-color .12s, background .12s, color .12s;
}

.aef-criteria-chip:hover { border-color: var(--green-400); background: var(--green-50); color: var(--green-700); }

.aef-criteria-chip--active {
  border-color: var(--green-500);
  background: var(--green-100);
  color: var(--green-700);
}

.aef-criteria-chip__icon { font-size: 14px; }

.aef-criteria-chip__type {
  font-size: 10px; font-weight: 700;
  color: var(--grey-400);
  background: var(--grey-100);
  padding: 1px 5px; border-radius: 4px;
  font-family: var(--mono);
}

.aef-criteria-chip--active .aef-criteria-chip__type {
  background: var(--green-200); color: var(--green-700);
}

/* Tag preview */
.aef-tag-preview { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }

/* Number input */
.aef-number-input { display: flex; align-items: center; gap: 10px; }
.aef-number-unit { font-size: 13px; color: var(--grey-500); }

/* Boolean toggle */
.aef-boolean-toggle { padding: 8px 0; }

.aef-toggle-label {
  display: inline-flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 14px; color: var(--grey-700);
  user-select: none;
}

.aef-toggle-label input { display: none; }

.aef-toggle-track {
  width: 40px; height: 22px;
  background: var(--grey-300);
  border-radius: 11px;
  position: relative;
  transition: background .2s;
  flex-shrink: 0;
}

.aef-toggle-label input:checked + .aef-toggle-track { background: var(--green-500); }

.aef-toggle-knob {
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px; left: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
  transition: left .2s;
}

.aef-toggle-label input:checked + .aef-toggle-track .aef-toggle-knob { left: 21px; }

/* Rule type toggle */
.aef-rule-type-row { display: flex; gap: 8px; }

.aef-rule-type-btn {
  flex: 1; height: 38px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--grey-600);
  cursor: pointer;
  transition: border-color .12s, background .12s, color .12s;
}

.aef-rule-type-btn--blocking {
  border-color: var(--red-500); background: var(--red-50); color: var(--red-600);
}

.aef-rule-type-btn--warning {
  border-color: var(--amber-400); background: var(--amber-50); color: var(--amber-600);
}

/* Rules summary chips */
.aef-rules-summary {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.aef-rules-summary__chip {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px;
}

.aef-rules-summary__chip--total    { background: var(--grey-100); color: var(--grey-700); }
.aef-rules-summary__chip--blocking { background: #fee2e2; color: var(--red-600); }
.aef-rules-summary__chip--warning  { background: var(--amber-50); color: var(--amber-600); }

/* ══════════════════════════════════════════════════════════
   RECAP STEP
══════════════════════════════════════════════════════════ */
.aef-recap { display: flex; flex-direction: column; gap: 24px; }

.aef-recap-card {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.aef-recap-card__cover {
  height: 140px;
  background: var(--grey-100);
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex; align-items: flex-end;
}

.aef-recap-card__cover-placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px;
  color: var(--grey-400);
  font-size: 13px;
}

.aef-recap-card__cat {
  position: absolute; top: 12px; left: 14px;
  background: rgba(255,255,255,.9);
  border-radius: var(--radius-sm);
  padding: 3px 10px;
  font-size: 12px; font-weight: 600;
  color: var(--grey-700);
  backdrop-filter: blur(4px);
}

.aef-recap-card__body { padding: 16px 18px; }

.aef-recap-card__title { font-size: 17px; font-weight: 700; color: var(--grey-900); margin-bottom: 6px; }
.aef-recap-card__desc  { font-size: 13px; color: var(--grey-500); line-height: 1.6; }

.aef-recap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.aef-recap-block {
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.aef-recap-block__label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--grey-400);
  margin-bottom: 5px;
}

.aef-recap-block__val {
  font-size: 14px; font-weight: 600; color: var(--grey-900);
  line-height: 1.4;
}

.aef-recap-rules {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.aef-recap-rules__title {
  padding: 10px 16px;
  background: var(--grey-50);
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--grey-500);
  border-bottom: 1px solid var(--border);
}

.aef-recap-rules .aef-rule-row { margin: 8px 16px; }

.aef-recap-warnings {
  background: var(--amber-50);
  border: 1.5px solid var(--amber-100);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.aef-recap-warnings__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700;
  color: var(--amber-600);
  margin-bottom: 8px;
}

.aef-recap-warnings__list {
  list-style: none;
  display: flex; flex-direction: column; gap: 4px;
}

.aef-recap-warnings__list li {
  font-size: 13px; color: #92400e;
  padding-left: 14px;
  position: relative;
}

.aef-recap-warnings__list li::before {
  content: "·";
  position: absolute; left: 0;
  font-weight: 900;
}

/* ══════════════════════════════════════════════════════════
   FOOTER NAVIGATION
══════════════════════════════════════════════════════════ */
.aef-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  position: sticky;
  bottom: 16px;
  backdrop-filter: blur(8px);
  background: rgba(255,255,255,.95);
}

.aef-footer__right { display: flex; align-items: center; gap: 12px; }
.aef-step-indicator { font-size: 12px; color: var(--grey-400); font-weight: 500; }

.aef-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 16px; height: 40px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 14px; font-weight: 500;
  color: var(--grey-500);
  cursor: pointer;
  transition: border-color .15s;
}

.aef-btn-ghost:hover { border-color: var(--grey-400); color: var(--grey-700); }

.aef-btn-next {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 20px; height: 40px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 14px; font-weight: 600;
  color: var(--green-600);
  cursor: pointer;
  transition: background .15s;
}

.aef-btn-next:hover { background: var(--green-50); }

.aef-btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 16px; height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--green-500);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  color: #fff; cursor: pointer;
  transition: background .15s;
}

.aef-btn-primary:hover { background: var(--green-600); }
.aef-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.aef-btn-submit {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 24px; height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--green-500);
  font-family: var(--font); font-size: 14px; font-weight: 700;
  color: #fff; cursor: pointer;
  transition: background .15s, transform .1s;
  box-shadow: 0 2px 8px rgba(29,158,117,.35);
}

.aef-btn-submit:hover:not(:disabled) { background: var(--green-600); }
.aef-btn-submit:active:not(:disabled) { transform: scale(.97); }
.aef-btn-submit:disabled { opacity: .55; cursor: not-allowed; }

/* ── Spinner ───────────────────────────────────────────── */
.aef-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(29,158,117,.3);
  border-top-color: var(--green-500);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

.aef-spinner--white {
  border-color: rgba(255,255,255,.3);
  border-top-color: #fff;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .aef-shell { padding: 0 14px 80px; }
  .aef-grid { grid-template-columns: 1fr; }
  .aef-format-toggle-group { grid-template-columns: 1fr; }
  .aef-stepper__track { gap: 2px; }
  .aef-step__label { display: none; }
  .aef-step--active .aef-step__label { display: block; }
  .aef-recap-grid { grid-template-columns: 1fr 1fr; }
  .aef-virtual-summary { grid-template-columns: 1fr; }
  .aef-footer { flex-direction: column; gap: 10px; padding: 14px 18px; }
  .aef-footer__right { width: 100%; justify-content: flex-end; }
  .aef-criteria-grid { gap: 6px; }
}

-----

FILE: src/app/back-office/events/pages/popularity-dashboard/popularity-dashboard.component.css

:host {
  --green-50:#f0faf4;--green-100:#dcf5e7;--green-200:#b8eacf;
  --green-400:#4ebe80;--green-500:#3a9282;--green-600:#2f7a6e;
  --orange-50:#fff7ed;--orange-100:#ffedd5;
  --orange-400:#fb923c;--orange-500:#f97316;--orange-600:#ea580c;
  --amber-50:#fffbeb;--amber-100:#fef3c7;--amber-400:#fbbf24;--amber-600:#d97706;
  --red-50:#fef2f2;--red-500:#ef4444;
  --blue-50:#eff6ff;--blue-500:#3b82f6;
  --violet-500:#8b5cf6;--indigo-500:#6366f1;
  --grey-50:#f8fafc;--grey-100:#f1f5f9;--grey-200:#e2e8f0;--grey-300:#cbd5e1;
  --grey-400:#94a3b8;--grey-500:#64748b;--grey-700:#334155;--grey-900:#0f172a;
  --bg:#f8fafc;--surface:#ffffff;--border:#dde7ef;
  --shadow-sm:0 4px 20px rgba(15, 23, 42, .06);
  --shadow-md:0 12px 28px rgba(15, 23, 42, .1);
  --shadow-lg:0 24px 60px -38px rgba(15, 23, 42, .7);
  --radius-sm:6px;--radius-md:10px;--radius-lg:14px;--radius-xl:20px;
  --font:inherit;--mono:inherit;
  display:block;background:var(--bg);min-height:100vh;
  font-family:var(--font);color:var(--grey-900);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.pd-shell{max-width:1400px;margin:0 auto;padding:0 28px 72px;}

/* TOPBAR */
.pd-topbar{display:flex;align-items:center;justify-content:space-between;padding:18px 0 14px;border-bottom:1.5px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:50;}
.pd-topbar__left{display:flex;align-items:center;gap:8px;font-size:14px;}
.pd-back-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md);background:var(--surface);font-family:var(--font);font-size:13px;font-weight:500;color:var(--grey-700);cursor:pointer;text-decoration:none;transition:border-color .15s,background .15s;}
.pd-back-btn:hover{border-color:var(--green-500);background:var(--green-50);}
.pd-topbar__sep{color:var(--grey-300);}
.pd-topbar__page{font-weight:600;color:var(--grey-900);}
.pd-topbar__right{display:flex;align-items:center;gap:12px;}
.pd-period-label{font-size:12px;color:var(--grey-400);font-family:var(--mono);}
.pd-refresh-btn{display:inline-flex;align-items:center;gap:6px;padding:0 14px;height:34px;border:1.5px solid var(--border);border-radius:var(--radius-md);background:var(--surface);font-family:var(--font);font-size:13px;font-weight:500;color:var(--grey-600);cursor:pointer;transition:border-color .15s,background .15s;}
.pd-refresh-btn:hover{border-color:var(--green-500);background:var(--green-50);}
.pd-refresh-btn:disabled{opacity:.5;cursor:not-allowed;}
.spinning{animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* HERO */
.pd-hero{display:flex;align-items:flex-start;justify-content:space-between;padding:32px 0 28px;gap:24px;flex-wrap:wrap;}
.pd-hero__eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.28em;color:var(--grey-400);margin-bottom:8px;}
.pd-hero__title{font-size:clamp(24px,3vw,36px);font-weight:800;color:var(--grey-900);letter-spacing:-.6px;line-height:1.2;margin-bottom:8px;}
.pd-hero__accent{color:var(--green-500);}
.pd-hero__sub{font-size:14px;color:var(--grey-500);line-height:1.7;max-width:520px;}

/* KPI Strip */
.pd-kpi-strip{display:flex;gap:12px;flex-wrap:wrap;flex-shrink:0;}
.pd-kpi{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:16px 20px;min-width:130px;text-align:center;box-shadow:var(--shadow-sm);}
.pd-kpi--orange{background:var(--orange-50);border-color:var(--orange-100);}
.pd-kpi--green {background:var(--green-50); border-color:var(--green-200);}
.pd-kpi--amber {background:var(--amber-50); border-color:var(--amber-100);}
.pd-kpi__icon{font-size:20px;margin-bottom:6px;}
.pd-kpi__val{font-size:24px;font-weight:800;color:var(--grey-900);line-height:1;}
.pd-kpi--orange .pd-kpi__val{color:var(--orange-600);}
.pd-kpi--green  .pd-kpi__val{color:var(--green-600);}
.pd-kpi--amber  .pd-kpi__val{color:var(--amber-600);}
.pd-kpi__lbl{font-size:12px;color:var(--grey-500);margin-top:4px;}
.pd-kpi.pd-skel{height:110px;background:linear-gradient(90deg,var(--grey-100) 25%,var(--grey-50) 50%,var(--grey-100) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border:none;}
@keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

/* LOADING */
.pd-full-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:80px;font-size:14px;color:var(--grey-500);}
.pd-spinner{width:22px;height:22px;border:2.5px solid var(--green-100);border-top-color:var(--green-500);border-radius:50%;animation:spin .7s linear infinite;}
.pd-spinner--sm{width:16px;height:16px;border-width:2px;}
.pd-top-loading{display:flex;align-items:center;justify-content:center;padding:24px;}

/* CONTENT LAYOUT */
.pd-content{display:flex;flex-direction:column;gap:20px;}
.pd-row{display:grid;gap:20px;}
.pd-row--two{grid-template-columns:1fr 1fr;}

/* CARD */
.pd-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm);overflow:hidden;}
.pd-card--wide{width:100%;}
.pd-card--warn{border-color:var(--amber-100);}
.pd-card__header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 14px;border-bottom:1.5px solid var(--border);background:var(--grey-50);flex-wrap:wrap;gap:10px;}
.pd-card__title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--grey-900);}
.pd-card__title--warn{color:var(--amber-700,#92400e);}
.pd-card__sub{font-size:12px;color:var(--grey-400);}
.pd-card__actions{display:flex;align-items:center;gap:10px;}
.pd-card__body{padding:20px 22px;}
.pd-card__body--no-pad{padding:0;}

/* PERIOD TABS */
.pd-period-tabs{display:flex;border:1.5px solid var(--border);border-radius:var(--radius-md);overflow:hidden;}
.pd-period-tab{padding:0 12px;height:30px;border:none;border-right:1px solid var(--border);background:var(--surface);font-family:var(--font);font-size:12px;font-weight:600;color:var(--grey-500);cursor:pointer;transition:background .12s,color .12s;}
.pd-period-tab:last-child{border-right:none;}
.pd-period-tab--active{background:var(--green-500);color:#fff;}
.pd-period-tab:hover:not(.pd-period-tab--active){background:var(--green-50);color:var(--green-700);}

/* BREAKDOWN */
.pd-breakdown{display:flex;flex-direction:column;gap:12px;}
.pd-breakdown-row{display:flex;align-items:center;gap:12px;}
.pd-breakdown-row__left{display:flex;align-items:center;gap:6px;width:180px;flex-shrink:0;}
.pd-breakdown-row__icon{font-size:16px;width:22px;text-align:center;}
.pd-breakdown-row__label{font-size:13px;font-weight:500;color:var(--grey-700);flex:1;}
.pd-breakdown-row__weight{font-size:11px;font-weight:700;color:var(--grey-400);font-family:var(--mono);background:var(--grey-100);padding:1px 5px;border-radius:4px;}
.pd-breakdown-row__bar-wrap{flex:1;display:flex;align-items:center;gap:10px;}
.pd-breakdown-row__bar{flex:1;height:8px;background:var(--grey-100);border-radius:4px;overflow:hidden;}
.pd-breakdown-row__fill{height:100%;border-radius:4px;transition:width .6s ease;}
.pd-breakdown-row__count{font-size:13px;font-weight:700;color:var(--grey-900);font-family:var(--mono);min-width:50px;text-align:right;}

/* FORMULA */
.pd-formula__intro{font-size:13px;color:var(--grey-600);line-height:1.65;margin-bottom:16px;}
.pd-formula-items{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}
.pd-formula-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--grey-50);border-radius:var(--radius-md);}
.pd-formula-item__icon{font-size:16px;width:22px;text-align:center;}
.pd-formula-item__info{flex:1;}
.pd-formula-item__label{display:block;font-size:13px;font-weight:600;color:var(--grey-800);}
.pd-formula-item__desc{font-size:11px;color:var(--grey-400);}
.pd-formula-item__weight{font-size:12px;font-weight:800;padding:3px 10px;border-radius:20px;font-family:var(--mono);flex-shrink:0;}
.pd-formula-eq{font-size:14px;font-weight:700;color:var(--grey-700);font-family:var(--mono);background:var(--green-50);border:1.5px solid var(--green-200);border-radius:var(--radius-md);padding:12px 16px;text-align:center;}

/* TABLE */
.pd-table{width:100%;border-collapse:collapse;font-size:13px;}
.pd-table th{text-align:left;font-size:11px;font-weight:700;color:var(--grey-500);text-transform:uppercase;letter-spacing:.5px;padding:10px 16px;border-bottom:1.5px solid var(--border);background:var(--grey-50);white-space:nowrap;}
.pd-table td{padding:12px 16px;border-bottom:1px solid var(--grey-100);vertical-align:middle;}
.pd-table__row{cursor:pointer;transition:background .12s;}
.pd-table__row:hover td{background:var(--green-50);}
.pd-table__row--warn:hover td{background:var(--amber-50);}
.pd-table__num{text-align:right;font-family:var(--mono);}
.pd-table-empty{padding:32px;text-align:center;color:var(--grey-400);font-size:14px;}

.pd-rank{width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;font-family:var(--mono);}
.pd-rank--gold  {background:#fef3c7;color:#92400e;}
.pd-rank--silver{background:var(--grey-100);color:var(--grey-700);}
.pd-rank--bronze{background:#ffedd5;color:var(--orange-700,#c2410c);}
.pd-rank--default{background:var(--grey-50);color:var(--grey-400);}

.pd-event-cell__name{font-weight:600;color:var(--grey-900);margin-bottom:2px;}
.pd-event-cell__location{font-size:11px;color:var(--grey-400);display:flex;align-items:center;gap:3px;}

.pd-cat-pill{font-size:11px;font-weight:600;background:var(--green-50);color:var(--green-700);padding:2px 8px;border-radius:20px;white-space:nowrap;}

.pd-score-cell{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.pd-score-val{font-size:14px;font-weight:800;color:var(--grey-900);}
.pd-score-bar{width:80px;height:4px;background:var(--grey-100);border-radius:2px;overflow:hidden;}
.pd-score-bar__fill{height:100%;background:linear-gradient(90deg,var(--green-400),var(--green-600));border-radius:2px;transition:width .5s ease;}

.pd-num{font-weight:600;color:var(--grey-700);}

.pd-conv{font-size:13px;font-weight:700;padding:2px 8px;border-radius:20px;}
.pd-conv--high{background:var(--green-100);color:var(--green-700);}
.pd-conv--mid {background:var(--amber-50);color:var(--amber-700,#92400e);}
.pd-conv--low {background:var(--grey-100);color:var(--grey-500);}

.pd-slots{font-size:12px;font-weight:600;}
.pd-slots--full{color:var(--red-500);}
.pd-slots--low {color:var(--orange-600);}

.pd-low-views{font-size:13px;font-weight:700;color:var(--amber-600);}
.pd-date-chip{font-size:12px;color:var(--grey-500);white-space:nowrap;}

.pd-detail-btn{padding:4px 12px;border:1.5px solid var(--green-400);border-radius:var(--radius-sm);background:transparent;font-family:var(--font);font-size:12px;font-weight:600;color:var(--green-600);cursor:pointer;transition:background .12s,border-color .12s;white-space:nowrap;}
.pd-detail-btn:hover{background:var(--green-50);}
.pd-detail-btn--warn{border-color:var(--amber-400);color:var(--amber-700,#92400e);}
.pd-detail-btn--warn:hover{background:var(--amber-50);}

/* MODAL */
.pd-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s ease;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.pd-modal{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);width:100%;max-width:580px;max-height:90vh;overflow-y:auto;animation:modalIn .18s ease;}
@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
.pd-modal__header{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 24px 16px;border-bottom:1.5px solid var(--border);background:var(--grey-50);}
.pd-modal__eyebrow{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.3em;color:var(--grey-400);margin-bottom:4px;}
.pd-modal__title{font-size:17px;font-weight:800;color:var(--grey-900);}
.pd-modal__close{width:30px;height:30px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:transparent;color:var(--grey-500);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .12s,color .12s;}
.pd-modal__close:hover{border-color:var(--red-500);color:var(--red-500);}
.pd-modal__body{padding:22px 24px;}
.pd-modal__loading{display:flex;align-items:center;justify-content:center;padding:40px;}
.pd-modal__footer{display:flex;justify-content:flex-end;padding:14px 24px;border-top:1.5px solid var(--border);}
.pd-btn-ghost{padding:0 14px;height:36px;border:1.5px solid var(--border);border-radius:var(--radius-md);background:transparent;font-family:var(--font);font-size:13px;font-weight:500;color:var(--grey-500);cursor:pointer;}

/* DETAIL MODAL CONTENT */
.pd-detail-hero{display:flex;align-items:center;justify-content:space-around;padding:16px;background:var(--grey-50);border-radius:var(--radius-lg);margin-bottom:20px;}
.pd-detail-score__val{font-size:32px;font-weight:800;color:var(--grey-900);text-align:center;line-height:1;}
.pd-detail-score__lbl{font-size:12px;color:var(--grey-500);text-align:center;margin-top:3px;}
.pd-trend-badge{font-size:14px;font-weight:700;padding:8px 16px;border-radius:20px;}
.pd-trend-badge--rising  {background:var(--green-100);color:var(--green-700);}
.pd-trend-badge--stable  {background:var(--grey-100);color:var(--grey-600);}
.pd-trend-badge--declining{background:var(--red-50);color:var(--red-600);}
.pd-detail-conv__val{font-size:24px;font-weight:800;color:var(--orange-600);text-align:center;line-height:1;}
.pd-detail-conv__lbl{font-size:12px;color:var(--grey-500);text-align:center;margin-top:3px;}
.pd-detail-breakdown__title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--grey-500);margin-bottom:14px;}
.pd-detail-bars{display:flex;flex-direction:column;gap:10px;}
.pd-detail-bar-row{display:flex;align-items:center;gap:8px;}
.pd-detail-bar-row__icon{font-size:14px;width:20px;text-align:center;flex-shrink:0;}
.pd-detail-bar-row__label{font-size:12px;font-weight:500;color:var(--grey-700);width:110px;flex-shrink:0;}
.pd-detail-bar-row__track{flex:1;height:10px;background:var(--grey-100);border-radius:5px;overflow:hidden;}
.pd-detail-bar-row__fill{height:100%;border-radius:5px;transition:width .6s ease;}
.pd-detail-bar-row__count{font-size:12px;font-weight:700;color:var(--grey-900);font-family:var(--mono);min-width:40px;text-align:right;}
.pd-detail-bar-row__unique{font-size:11px;color:var(--grey-400);}

@media(max-width:900px){
  .pd-shell{padding:0 16px 60px;}
  .pd-row--two{grid-template-columns:1fr;}
  .pd-hero{flex-direction:column;}
  .pd-kpi-strip{gap:8px;}
  .pd-kpi{min-width:90px;padding:12px;}
}


-----

FILE: src/app/shared/sidebar/sidebar.component.css

:host {
  display: block;
  --color-primary: #43a047;
  --color-text-muted: #6b7280;
}

.admin-sidebar {
  will-change: transform;
  background: #ffffff;
  border-right: 1px solid #d7e1ea;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.sidebar-top {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #e2eaf1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.brand-name {
  margin: 0;
  font-size: 0.94rem;
  font-weight: 800;
  color: #193247;
}

.brand-subline {
  margin: 0.14rem 0 0;
  font-size: 0.68rem;
  color: #6f8598;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  font-weight: 700;
}

.menu-label {
  margin: 0 0 0.82rem;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #698196;
  font-weight: 800;
}

.sidebar-link {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.66rem 0.82rem;
  border-radius: 0.72rem;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
}

.menu-icon {
  width: 18px;
  font-size: 16px;
  text-align: center;
  flex-shrink: 0;
}

.icon-users {
  color: #e24f61;
}

.icon-community {
  color: #2f9f8d;
}

.icon-pets {
  color: #f39c3d;
}

.icon-services {
  color: #2f9f8d;
}

.icon-adoption {
  color: #f39c3d;
}

.icon-events {
  color: #e24f61;
}

.icon-marketplace {
  color: #2f9f8d;
}

.sidebar-link-idle {
  color: #465f75;
}

.sidebar-link-idle:hover {
  color: var(--color-primary);
  background: rgba(67, 160, 71, 0.08);
}

.sidebar-link-active {
  color: var(--color-primary);
  background: #e6f4f3;
  border-color: #b8dfdb;
}

.transit-trigger {
  cursor: pointer;
}

.transit-plane-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: #e24f61;
}

.expand-icon {
  margin-left: auto;
  color: var(--color-text-muted);
  transition: transform 0.22s ease;
}

.sidebar-link-active .expand-icon {
  transform: rotate(0deg);
}

.transit-submenu {
  margin: 0.18rem 0 0.35rem;
  margin-left: 0.95rem;
  padding: 0.2rem 0.25rem;
  border-left: 1px dashed #d3e0ea;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-2px);
  pointer-events: none;
  transition: max-height 0.3s ease, opacity 0.22s ease, transform 0.22s ease;
}

.transit-submenu-expanded {
  max-height: 320px;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.sub-link {
  margin: 0.18rem 0 0.18rem 0.45rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.52rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.62rem;
  color: #5f7387;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.22s ease, border-color 0.22s ease, color 0.22s ease;
}

.sub-link mat-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
  color: #8ca0b2;
  transition: color 0.22s ease;
}

.sub-link:hover {
  color: #2f9f8d;
  background: #f7fbfc;
  border-color: #d9e5ee;
}

.sub-link:hover mat-icon {
  color: #2f9f8d;
}

.sub-link-active {
  color: #2f9f8d;
  font-weight: 700;
  border-color: #b8dfdb;
  background: #eaf7f5;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.sub-link-active mat-icon {
  color: #2f9f8d;
}

.footer-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.65rem;
  padding: 0.52rem 0.72rem;
  font-size: 0.78rem;
  font-weight: 700;
  transition: all 0.25s ease;
}

.footer-icon {
  width: 16px;
  font-size: 14px;
  text-align: center;
  flex-shrink: 0;
}

.footer-action-primary {
  color: #35536b;
  border: 1px solid #c5d5e2;
  background: #ffffff;
}

.footer-action-primary:hover {
  background: #f1f6fa;
  border-color: #9bb6c9;
}

.footer-action-danger {
  color: #8b1c1c;
  border: 1px solid #f1c7c7;
  background: #fff4f4;
}

.footer-action-danger:hover {
  background: #fee7e7;
  border-color: #e89a9a;
}

@media (min-width: 1024px) {
  .admin-sidebar {
    box-shadow: none;
  }
}

-----


2) HTML DIFF (CHANGED LINES ONLY)

FILE: src/app/back-office/events/components/admin-virtual-session/admin-virtual-session.component.html

-        <h3 class="avs__section-title">���Ѵ�� Virtual Session</h3> // CHANGED
+        <h3 class="avs__section-title"><i class="fas fa-display"></i> Virtual Session</h3> // CHANGED
-        (click)="switchTab('setup')">��ִ�� Configuration</button> // CHANGED
+        (click)="switchTab('setup')"><i class="fas fa-gear"></i> Configuration</button> // CHANGED
-        ���� Attendance Stats // CHANGED
+        <i class="fas fa-chart-column"></i> Attendance Stats // CHANGED
-          class="avs__tab-lock">����</span> // CHANGED
+          class="avs__tab-lock"><i class="fas fa-lock"></i></span> // CHANGED
-          <span class="avs__create-icon">���Ѵ��</span> // CHANGED
+          <span class="avs__create-icon"><i class="fas fa-display"></i></span> // CHANGED
-              <span class="avs__summary-icon">����</span> // CHANGED
+              <span class="avs__summary-icon"><i class="fas fa-clock"></i></span> // CHANGED
-              <span class="avs__summary-icon">����</span> // CHANGED
+              <span class="avs__summary-icon"><i class="fas fa-trophy"></i></span> // CHANGED
-              <span class="avs__summary-icon">����</span> // CHANGED
+              <span class="avs__summary-icon"><i class="fas fa-lock"></i></span> // CHANGED
-              <span class="avs__summary-icon">����</span> // CHANGED
+              <span class="avs__summary-icon"><i class="fas fa-crown"></i></span> // CHANGED
-            <span *ngIf="!creating">���� Create Virtual Session</span> // CHANGED
+            <span *ngIf="!creating"><i class="fas fa-rocket"></i> Create Virtual Session</span> // CHANGED
-            <span>���� Moderator password</span> // CHANGED
+            <span><i class="fas fa-crown"></i> Moderator password</span> // CHANGED
-              {{ session.status === 'OPEN' ? '���� Session can be started now' : '�Ŧ Room not yet open' }} // CHANGED
+              {{ session.status === 'OPEN' ? 'Session can be started now' : 'Room not yet open' }} // CHANGED
-            <span class="avs__config-card__icon">����</span> // CHANGED
+            <span class="avs__config-card__icon"><i class="fas fa-link"></i></span> // CHANGED
-              {{ session.roomUrl?.includes('jit.si') ? '���Ѵ�� Jitsi (built-in)' : '���� External URL' }} // CHANGED
+              {{ session.roomUrl?.includes('jit.si') ? 'Jitsi (built-in)' : 'External URL' }} // CHANGED
-            <span class="avs__config-card__icon">����</span> // CHANGED
+            <span class="avs__config-card__icon"><i class="fas fa-clock"></i></span> // CHANGED
-            <span class="avs__config-card__icon">����</span> // CHANGED
+            <span class="avs__config-card__icon"><i class="fas fa-trophy"></i></span> // CHANGED
-            <span class="avs__config-card__icon">��´��</span> // CHANGED
+            <span class="avs__config-card__icon"><i class="fas fa-play"></i></span> // CHANGED
-            <span class="avs__config-card__icon">�Ŧ���</span> // CHANGED
+            <span class="avs__config-card__icon"><i class="fas fa-stop"></i></span> // CHANGED
-          <span>��ִ��</span> // CHANGED
+          <span><i class="fas fa-gear"></i></span> // CHANGED
-          <span>����</span> // CHANGED
+          <span><i class="fas fa-circle"></i></span> // CHANGED
-          <span>����</span> // CHANGED
+          <span><i class="fas fa-circle-check"></i></span> // CHANGED
-            <span class="avs__kpi__value">���� {{ stats.certificatesEarned }}</span> // CHANGED
+            <span class="avs__kpi__value"><i class="fas fa-trophy"></i> {{ stats.certificatesEarned }}</span> // CHANGED
-                      <span class="avs__participant-sub" *ngIf="p.currentlyConnected">���� Connected</span> // CHANGED
+                      <span class="avs__participant-sub" *ngIf="p.currentlyConnected"><i class="fas fa-circle"></i> Connected</span> // CHANGED
-                    class="avs__cert-link">���� View</a> // CHANGED
+                    class="avs__cert-link"><i class="fas fa-file-lines"></i> View</a> // CHANGED
-        <span>����</span> // CHANGED
+        <span><i class="fas fa-chart-column"></i></span> // CHANGED

-----

FILE: src/app/back-office/events/components/events.component/events.component.html

-      <button class="filters-bar__clear" *ngIf="keyword" (click)="keyword=''; onSearch()">ԣ�</button> // CHANGED
+      <button class="filters-bar__clear" *ngIf="keyword" (click)="keyword=''; onSearch()"><i class="fas fa-xmark"></i></button> // CHANGED
-          <span class="modal__icon modal__icon--blue">����</span> // CHANGED
+          <span class="modal__icon modal__icon--blue"><i class="fas fa-chart-column"></i></span> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-          <span class="badge badge--amber" *ngIf="capacityData.hasWaitlist">�Ŧ Waitlist active</span> // CHANGED
-          <span class="badge badge--green" *ngIf="!capacityData.isFull">���� Available</span> // CHANGED
+          <span class="badge badge--amber" *ngIf="capacityData.hasWaitlist"><i class="fas fa-clock"></i> Waitlist active</span> // CHANGED
+          <span class="badge badge--green" *ngIf="!capacityData.isFull"><i class="fas fa-circle-check"></i> Available</span> // CHANGED
-        <button class="btn-outline-sm" (click)="recalculateCapacity()" [disabled]="modalLoading">���� Recalculate</button> // CHANGED
+        <button class="btn-outline-sm" (click)="recalculateCapacity()" [disabled]="modalLoading"><i class="fas fa-rotate-right"></i> Recalculate</button> // CHANGED
-          <span class="modal__icon modal__icon--blue">����</span> // CHANGED
+          <span class="modal__icon modal__icon--blue"><i class="fas fa-users"></i></span> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-                <td><span class="badge badge--green">ԣ� Confirmed</span></td> // CHANGED
+                <td><span class="badge badge--green"><i class="fas fa-circle-check"></i> Confirmed</span></td> // CHANGED
-                    <button class="action-btn action-btn--approve" (click)="approveParticipant(p)">ԣ� Approve</button> // CHANGED
-                    <button class="action-btn action-btn--reject" (click)="rejectParticipant(p)">��� Reject</button> // CHANGED
+                    <button class="action-btn action-btn--approve" (click)="approveParticipant(p)"><i class="fas fa-circle-check"></i> Approve</button> // CHANGED
+                    <button class="action-btn action-btn--reject" (click)="rejectParticipant(p)"><i class="fas fa-xmark"></i> Reject</button> // CHANGED
-        <button class="btn-outline-sm" (click)="selectedEvent && exportParticipants(selectedEvent)">���� Export CSV</button> // CHANGED
+        <button class="btn-outline-sm" (click)="selectedEvent && exportParticipants(selectedEvent)"><i class="fas fa-file-excel"></i> Export CSV</button> // CHANGED
-          <span class="modal__icon modal__icon--amber">�Ŧ</span> // CHANGED
+          <span class="modal__icon modal__icon--amber"><i class="fas fa-clock"></i></span> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-              <td><div class="user-cell"><div class="avatar">{{ w.userName?.charAt(0) || '?' }}</div>{{ w.userName }}</div></td> // CHANGED
+              <td><div class="user-cell"><div class="avatar">{{ w.userName.charAt(0) || '?' }}</div>{{ w.userName }}</div></td> // CHANGED
-                <span class="text-muted" *ngIf="w.status === 'NOTIFIED'">�Ŧ Pending</span> // CHANGED
+                <span class="text-muted" *ngIf="w.status === 'NOTIFIED'"><i class="fas fa-clock"></i> Pending</span> // CHANGED
-        <button class="btn-outline-sm" (click)="promoteNext()" *ngIf="waitlist.length > 0">��� Auto-promote</button> // CHANGED
+        <button class="btn-outline-sm" (click)="promoteNext()" *ngIf="waitlist.length > 0"><i class="fas fa-arrow-up"></i> Auto-promote</button> // CHANGED
-        <div class="modal__header-title"><span class="modal__icon">�����</span><div><h3>Event Weather</h3><p>{{ selectedEvent?.title }}</p></div></div> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <div class="modal__header-title"><span class="modal__icon"><i class="fas fa-cloud-sun"></i></span><div><h3>Event Weather</h3><p>{{ selectedEvent?.title }}</p></div></div> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-          <div class="wd-row"><span>��Ļ Condition</span><strong>{{ weather.condition }}</strong></div> // CHANGED
+          <div class="wd-row"><span><i class="fas fa-bullseye"></i> Condition</span><strong>{{ weather.condition }}</strong></div> // CHANGED
-        <div class="modal__header-title"><span class="modal__icon">ԡ�</span><div><h3>Reviews</h3><p>{{ selectedEvent?.title }}</p></div></div> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <div class="modal__header-title"><span class="modal__icon"><i class="fas fa-star"></i></span><div><h3>Reviews</h3><p>{{ selectedEvent?.title }}</p></div></div> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-              <div class="user-cell"><div class="avatar">{{ r.userName?.charAt(0) || '?' }}</div><div><div class="review-card__user">{{ r.userName }}</div><div class="review-card__date text-muted">{{ formatDate(r.createdAt) }}</div></div></div> // CHANGED
+              <div class="user-cell"><div class="avatar">{{ r.userName.charAt(0) || '?' }}</div><div><div class="review-card__user">{{ r.userName }}</div><div class="review-card__date text-muted">{{ formatDate(r.createdAt) }}</div></div></div> // CHANGED
-                <button class="action-btn action-btn--reject" (click)="deleteReview(r)">���洩�</button> // CHANGED
+                <button class="action-btn action-btn--reject" (click)="deleteReview(r)"><i class="fas fa-trash-can"></i></button> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-          ��ᴩ� Cancelling all reminders will delete pending notifications for all participants. // CHANGED
+          <i class="fas fa-triangle-exclamation"></i> Cancelling all reminders will delete pending notifications for all participants. // CHANGED
-        <button class="action-btn action-btn--reject" (click)="cancelAllReminders()">���洩� Cancel all reminders</button> // CHANGED
+        <button class="action-btn action-btn--reject" (click)="cancelAllReminders()"><i class="fas fa-trash-can"></i> Cancel all reminders</button> // CHANGED
-          <span class="modal__icon modal__icon--green">����</span> // CHANGED
+          <span class="modal__icon modal__icon--green"><i class="fas fa-trophy"></i></span> // CHANGED
-        <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-                <button class="qa-btn qa-btn--danger" (click)="deleteRule(rule)" title="Delete rule">���洩�</button> // CHANGED
+                <button class="qa-btn qa-btn--danger" (click)="deleteRule(rule)" title="Delete rule"><i class="fas fa-trash-can"></i></button> // CHANGED
-                <button class="qa-btn qa-btn--danger" (click)="deleteRule(rule)">���洩�</button> // CHANGED
+                <button class="qa-btn qa-btn--danger" (click)="deleteRule(rule)"><i class="fas fa-trash-can"></i></button> // CHANGED
-        <button class="modal__close" (click)="activeModal = 'rules'">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="activeModal = 'rules'"><i class="fas fa-xmark"></i></button> // CHANGED
-                ��ܽ Blocking // CHANGED
+                <i class="fas fa-ban"></i> Blocking // CHANGED
-                ��ᴩ� Warning only // CHANGED
+                <i class="fas fa-triangle-exclamation"></i> Warning only // CHANGED
-        <button class="modal__close" (click)="closeConfirm()">ԣ�</button> // CHANGED
+        <button class="modal__close" (click)="closeConfirm()"><i class="fas fa-xmark"></i></button> // CHANGED
-      <button (click)="dismissToast(t.id)">ԣ�</button> // CHANGED
+      <button (click)="dismissToast(t.id)"><i class="fas fa-xmark"></i></button> // CHANGED
-        <span class="modal__icon modal__icon--green">����</span> // CHANGED
+        <span class="modal__icon modal__icon--green"><i class="fas fa-trophy"></i></span> // CHANGED
-      <button class="modal__close" (click)="closeModal()">ԣ�</button> // CHANGED
+      <button class="modal__close" (click)="closeModal()"><i class="fas fa-xmark"></i></button> // CHANGED
-      <span class="comp-legend__item comp-legend__item--warning">��ᴩ� Warning</span> // CHANGED
+      <span class="comp-legend__item comp-legend__item--warning"><i class="fas fa-triangle-exclamation"></i> Warning</span> // CHANGED
-            <span *ngIf="entry.eligibilityVerdict === 'ELIGIBLE'" class="verdict-badge verdict-badge--ok">ԣ� Eligible</span> // CHANGED
-            <span *ngIf="entry.eligibilityVerdict === 'WARNING'" class="verdict-badge verdict-badge--warn">��ᴩ� Warning</span> // CHANGED
+            <span *ngIf="entry.eligibilityVerdict === 'ELIGIBLE'" class="verdict-badge verdict-badge--ok"><i class="fas fa-circle-check"></i> Eligible</span> // CHANGED
+            <span *ngIf="entry.eligibilityVerdict === 'WARNING'" class="verdict-badge verdict-badge--warn"><i class="fas fa-triangle-exclamation"></i> Warning</span> // CHANGED
-            <div class="comp-entry-card__rules-title">ԣ� Rules satisfied</div> // CHANGED
+            <div class="comp-entry-card__rules-title"><i class="fas fa-circle-check"></i> Rules satisfied</div> // CHANGED
-                *ngFor="let r of entry.satisfiedRules?.split(' | ')"> // CHANGED
+                *ngFor="let r of entry.satisfiedRules.split(' | ')"> // CHANGED
-            <div class="comp-entry-card__warnings-title">��ᴩ� Warnings</div> // CHANGED
+            <div class="comp-entry-card__warnings-title"><i class="fas fa-triangle-exclamation"></i> Warnings</div> // CHANGED
-                *ngFor="let w of entry.warnings?.split(' | ')"> // CHANGED
+                *ngFor="let w of entry.warnings.split(' | ')"> // CHANGED
-            <span class="badge badge--green" *ngIf="entry.participantStatus === 'CONFIRMED'">ԣ� Confirmed</span> // CHANGED
-            <span class="badge badge--amber" *ngIf="entry.participantStatus === 'PENDING'">�Ŧ Pending</span> // CHANGED
-            <span class="badge badge--grey"  *ngIf="entry.participantStatus === 'CANCELLED'">��ܽ Cancelled</span> // CHANGED
+            <span class="badge badge--green" *ngIf="entry.participantStatus === 'CONFIRMED'"><i class="fas fa-circle-check"></i> Confirmed</span> // CHANGED
+            <span class="badge badge--amber" *ngIf="entry.participantStatus === 'PENDING'"><i class="fas fa-clock"></i> Pending</span> // CHANGED
+            <span class="badge badge--grey"  *ngIf="entry.participantStatus === 'CANCELLED'"><i class="fas fa-ban"></i> Cancelled</span> // CHANGED

-----

FILE: src/app/back-office/events/pages/categories/admin-categories.component.html

-        <i class="fas fa-tags"></i> // CHANGED
+        <i class="fas fa-tag"></i> // CHANGED
-                  ���� Competition // CHANGED
+                  <i class="fas fa-trophy"></i> Competition // CHANGED
-            <i class="fas fa-times"></i> // CHANGED
+            <i class="fas fa-xmark"></i> // CHANGED
-                      {{ form.competitionMode ? '���� Competition enabled' : '���� Standard mode' }} // CHANGED
+                      {{ form.competitionMode ? 'Competition enabled' : 'Standard mode' }} // CHANGED
-                  <div class="bo-icon-preview">{{ form.icon || '����' }}</div> // CHANGED
-                  <input type="text" [(ngModel)]="form.icon" class="bo-icon-input" maxlength="4" placeholder="����"> // CHANGED
-                  <div class="bo-icon-hint">Examples: ���� ��ġ ��ɥ ����</div> // CHANGED
+                  <div class="bo-icon-preview">{{ form.icon || 'event' }}</div> // CHANGED
+                  <input type="text" [(ngModel)]="form.icon" class="bo-icon-input" maxlength="24" placeholder="event"> // CHANGED
+                  <div class="bo-icon-hint">Examples: trophy, theater, pets, book</div> // CHANGED
-                    <span class="bo-preview-competition" *ngIf="form.competitionMode">����</span> // CHANGED
+                    <span class="bo-preview-competition" *ngIf="form.competitionMode"><i class="fas fa-trophy"></i></span> // CHANGED
-                      <i class="fas" [class.fa-shield-alt]="form.requiresApproval" [class.fa-check-circle]="!form.requiresApproval"></i> // CHANGED
+                      <i class="fas" [class.fa-shield-halved]="form.requiresApproval" [class.fa-circle-check]="!form.requiresApproval"></i> // CHANGED
-            <i class="fas" [class.fa-save]="isEditing" [class.fa-plus]="!isEditing"></i> // CHANGED
+            <i class="fas" [class.fa-floppy-disk]="isEditing" [class.fa-plus]="!isEditing"></i> // CHANGED

-----

FILE: src/app/back-office/events/pages/dashboard/admin-dashboard.component.html

-    ��� Back to Events // CHANGED
+    <i class="fas fa-arrow-left"></i> // CHANGED
+    Back to Events // CHANGED
-      <div class="kpi-icon">����</div> // CHANGED
+      <div class="kpi-icon"><i class="fas fa-calendar-days"></i></div> // CHANGED
-      <div class="kpi-icon">����</div> // CHANGED
+      <div class="kpi-icon"><i class="fas fa-users"></i></div> // CHANGED
-      <div class="kpi-icon">��Ļ</div> // CHANGED
+      <div class="kpi-icon"><i class="fas fa-bullseye"></i></div> // CHANGED
-      <div class="kpi-icon">����</div> // CHANGED
+      <div class="kpi-icon"><i class="fas fa-chart-line"></i></div> // CHANGED
-                <span class="event-img-placeholder">{{ e.category?.icon || '����' }}</span> // CHANGED
+                <span class="event-img-placeholder"><i class="fas fa-calendar-days"></i></span> // CHANGED
-                <a [routerLink]="['/back-office/events', e.id]" class="row-btn" title="View details">�������</a> // CHANGED
+                <a [routerLink]="['/back-office/events', e.id]" class="row-btn" title="View details"><i class="fas fa-eye"></i></a> // CHANGED
-        <span class="ac-icon">�+�</span> // CHANGED
+        <span class="ac-icon"><i class="fas fa-plus"></i></span> // CHANGED
-  <span class="ac-icon">�������</span> // CHANGED
+  <span class="ac-icon"><i class="fas fa-tags"></i></span> // CHANGED
-        <span class="ac-icon">�Ŧ</span> // CHANGED
+        <span class="ac-icon"><i class="fas fa-clock"></i></span> // CHANGED
-        <span class="ac-icon">����</span> // CHANGED
+        <span class="ac-icon"><i class="fas fa-file-excel"></i></span> // CHANGED

-----

FILE: src/app/back-office/events/pages/detail/event-detail.component.html

-        ��� Back to Events // CHANGED
+        <i class="fas fa-arrow-left"></i> // CHANGED
+        Back to Events // CHANGED
-        ԣŴ�� Edit Event // CHANGED
+        <i class="fas fa-pen-to-square"></i> // CHANGED
+        Edit Event // CHANGED
-        ��ܽ Cancel Event // CHANGED
+        <i class="fas fa-circle-xmark"></i> // CHANGED
+        Cancel Event // CHANGED
-        ���洩� Delete // CHANGED
+        <i class="fas fa-trash-can"></i> // CHANGED
+        Delete // CHANGED
-          <span>���� {{ formatDate(event.startDate) }} at {{ formatTime(event.startDate) }}</span> // CHANGED
-          <span>���� {{ event.location }}</span> // CHANGED
-          <span>���� {{ event.maxParticipants }} seats</span> // CHANGED
+          <span><i class="fas fa-calendar-day"></i> {{ formatDate(event.startDate) }} at {{ formatTime(event.startDate) }}</span> // CHANGED
+          <span><i class="fas fa-map-location-dot"></i> {{ event.location }}</span> // CHANGED
+          <span><i class="fas fa-users"></i> {{ event.maxParticipants }} seats</span> // CHANGED
-      ���� Information // CHANGED
+      <i class="fas fa-circle-info"></i> // CHANGED
+      Information // CHANGED
-      ���� Participants // CHANGED
+      <i class="fas fa-users"></i> // CHANGED
+      Participants // CHANGED
-      �Ŧ Waitlist // CHANGED
+      <i class="fas fa-clock"></i> // CHANGED
+      Waitlist // CHANGED
-      ԡ� Reviews // CHANGED
+      <i class="fas fa-star"></i> // CHANGED
+      Reviews // CHANGED
-      ����� Weather // CHANGED
+      <i class="fas fa-cloud-sun"></i> // CHANGED
+      Weather // CHANGED
-    ���� Virtual Session // CHANGED
+    <i class="fas fa-video"></i> // CHANGED
+    Virtual Session // CHANGED
-              <button class="btn btn-sm btn-outline" (click)="recalculateCapacity()">���� Recalculate</button> // CHANGED
+              <button class="btn btn-sm btn-outline" (click)="recalculateCapacity()"><i class="fas fa-rotate-right"></i> Recalculate</button> // CHANGED
-          ���� Export CSV // CHANGED
+          <i class="fas fa-file-excel"></i> // CHANGED
+          Export CSV // CHANGED
-              <td><span class="status-badge confirmed">ԣ� Confirmed</span></td> // CHANGED
+              <td><span class="status-badge confirmed"><i class="fas fa-circle-check"></i> Confirmed</span></td> // CHANGED
-          ���� Promote Next // CHANGED
+          <i class="fas fa-arrow-up"></i> // CHANGED
+          Promote Next // CHANGED
-            <td><span class="badge" [class.success]="w.notified">{{ w.notified ? 'ԣ� Yes' : '���' }}</span></td> // CHANGED
+            <td><span class="badge" [class.success]="w.notified">{{ w.notified ? 'Yes' : '���' }}</span></td> // CHANGED
-            <button class="btn-delete" (click)="deleteReview(r.id)">���洩�</button> // CHANGED
+            <button class="btn-delete" (click)="deleteReview(r.id)"><i class="fas fa-trash-can"></i></button> // CHANGED
-          <div class="detail"><span>��ƺ Humidity:</span><strong>{{ weather.humidity }}%</strong></div> // CHANGED
-          <div class="detail"><span>��ƿ Wind:</span><strong>{{ weather.windSpeed }} km/h</strong></div> // CHANGED
-          <div class="detail"><span>��Ļ Condition:</span><strong>{{ weather.condition }}</strong></div> // CHANGED
-          <div class="detail"><span>���� Event day:</span><strong [class.text-green]="weather.eventDay">{{ weather.eventDay ? 'Yes' : 'No' }}</strong></div> // CHANGED
+          <div class="detail"><span><i class="fas fa-droplet"></i> Humidity:</span><strong>{{ weather.humidity }}%</strong></div> // CHANGED
+          <div class="detail"><span><i class="fas fa-wind"></i> Wind:</span><strong>{{ weather.windSpeed }} km/h</strong></div> // CHANGED
+          <div class="detail"><span><i class="fas fa-bullseye"></i> Condition:</span><strong>{{ weather.condition }}</strong></div> // CHANGED
+          <div class="detail"><span><i class="fas fa-calendar-day"></i> Event day:</span><strong [class.text-green]="weather.eventDay">{{ weather.eventDay ? 'Yes' : 'No' }}</strong></div> // CHANGED

-----

FILE: src/app/back-office/events/pages/form/admin-event-form.component.html

-        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <polyline points="15 18 9 12 15 6"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-arrow-left" aria-hidden="true"></i> // CHANGED
-        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/> // CHANGED
-          <polyline points="14 2 14 8 20 8"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-file-lines" aria-hidden="true"></i> // CHANGED
-              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"> // CHANGED
-                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/> // CHANGED
-                <polyline points="21 15 16 10 5 21"/> // CHANGED
-              </svg> // CHANGED
+              <i class="fas fa-image" aria-hidden="true"></i> // CHANGED
-              (click)="$event.stopPropagation(); removeImage()" type="button">ԣ�</button> // CHANGED
+              (click)="$event.stopPropagation(); removeImage()" type="button"><i class="fas fa-xmark"></i></button> // CHANGED
-              <div class="aef-format-card__icon">����</div> // CHANGED
+                <div class="aef-format-card__icon"><i class="fas fa-map-location-dot" aria-hidden="true"></i></div> // CHANGED
-              <div class="aef-format-card__icon">���Ѵ��</div> // CHANGED
+              <div class="aef-format-card__icon"><i class="fas fa-display" aria-hidden="true"></i></div> // CHANGED
-        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <rect x="3" y="4" width="18" height="18" rx="2"/> // CHANGED
-          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/> // CHANGED
-          <line x1="3" y1="10" x2="21" y2="10"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-calendar-days" aria-hidden="true"></i> // CHANGED
-            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/> // CHANGED
-            </svg> // CHANGED
+            <i class="fas fa-map-location-dot" aria-hidden="true"></i> // CHANGED
-        <div class="aef-weather-card__header">����� Weather forecast for {{ form.location?.split(',')[0] }}</div> // CHANGED
+        <div class="aef-weather-card__header"><i class="fas fa-cloud-sun" aria-hidden="true"></i> Weather forecast for {{ form.location?.split(',')[0] }}</div> // CHANGED
-        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <rect x="2" y="3" width="20" height="14" rx="2"/> // CHANGED
-          <line x1="8" y1="21" x2="16" y2="21"/> // CHANGED
-          <line x1="12" y1="17" x2="12" y2="21"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-display" aria-hidden="true"></i> // CHANGED
-        <div class="aef-online-skip__icon">����</div> // CHANGED
+      <div class="aef-online-skip__icon"><i class="fas fa-map-location-dot"></i></div> // CHANGED
-          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-            <circle cx="12" cy="12" r="10"/> // CHANGED
-            <line x1="12" y1="8" x2="12" y2="12"/> // CHANGED
-            <line x1="12" y1="16" x2="12.01" y2="16"/> // CHANGED
-          </svg> // CHANGED
+          <i class="fas fa-circle-info"></i> // CHANGED
-            <span class="aef-virtual-summary__icon">����</span> // CHANGED
+            <span class="aef-virtual-summary__icon"><i class="fas fa-clock"></i></span> // CHANGED
-            <span class="aef-virtual-summary__icon">����</span> // CHANGED
+            <span class="aef-virtual-summary__icon"><i class="fas fa-trophy"></i></span> // CHANGED
-            <span class="aef-virtual-summary__icon">����</span> // CHANGED
+            <span class="aef-virtual-summary__icon"><i class="fas fa-lock"></i></span> // CHANGED
-            <span class="aef-virtual-summary__icon">����</span> // CHANGED
+            <span class="aef-virtual-summary__icon"><i class="fas fa-link"></i></span> // CHANGED
-          ԣ� Virtual session already configured for this event. // CHANGED
+          Virtual session already configured for this event. // CHANGED
-        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <path d="M9 11l3 3L22 4"/> // CHANGED
-          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-circle-check" aria-hidden="true"></i> // CHANGED
-      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-        <polyline points="15 18 9 12 15 6"/> // CHANGED
-      </svg> // CHANGED
+      <i class="fas fa-chevron-left" aria-hidden="true"></i> // CHANGED
-        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <polyline points="9 18 15 12 9 6"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-chevron-right" aria-hidden="true"></i> // CHANGED
-        <svg *ngIf="!loading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"> // CHANGED
-          <polyline points="20 6 9 17 4 12"/> // CHANGED
-        </svg> // CHANGED
+        <i *ngIf="!loading" class="fas fa-circle-check" aria-hidden="true"></i> // CHANGED

-----

FILE: src/app/back-office/events/pages/popularity-dashboard/popularity-dashboard.component.html

-        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-          <polyline points="15 18 9 12 15 6"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-arrow-left"></i> // CHANGED
-        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" // CHANGED
-          [class.spinning]="loading"> // CHANGED
-          <polyline points="23 4 23 10 17 10"/> // CHANGED
-          <polyline points="1 20 1 14 7 14"/> // CHANGED
-          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/> // CHANGED
-        </svg> // CHANGED
+        <i class="fas fa-rotate-right" [class.spinning]="loading"></i> // CHANGED
-        <div class="pd-kpi__icon">�������</div> // CHANGED
+        <div class="pd-kpi__icon"><i class="fas fa-eye"></i></div> // CHANGED
-        <div class="pd-kpi__icon">���</div> // CHANGED
+        <div class="pd-kpi__icon"><i class="fas fa-bolt"></i></div> // CHANGED
-        <div class="pd-kpi__icon">��Ļ</div> // CHANGED
+        <div class="pd-kpi__icon"><i class="fas fa-bullseye"></i></div> // CHANGED
-        <div class="pd-kpi__icon">��ᴩ�</div> // CHANGED
+        <div class="pd-kpi__icon"><i class="fas fa-triangle-exclamation"></i></div> // CHANGED
-            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/> // CHANGED
-              <line x1="6" y1="20" x2="6" y2="14"/> // CHANGED
-            </svg> // CHANGED
+            <i class="fas fa-chart-column"></i> // CHANGED
-            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-              <circle cx="12" cy="12" r="10"/> // CHANGED
-              <line x1="12" y1="8" x2="12" y2="12"/> // CHANGED
-              <line x1="12" y1="16" x2="12.01" y2="16"/> // CHANGED
-            </svg> // CHANGED
+            <i class="fas fa-circle-info"></i> // CHANGED
-          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> // CHANGED
-            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> // CHANGED
-          </svg> // CHANGED
+          <i class="fas fa-star"></i> // CHANGED
-                  Details // CHANGED
+                  <i class="fas fa-eye"></i> Details // CHANGED
-              <span *ngIf="selectedDetail.trend === 'RISING'">���� Rising</span> // CHANGED
-              <span *ngIf="selectedDetail.trend === 'STABLE'">������ Stable</span> // CHANGED
-              <span *ngIf="selectedDetail.trend === 'DECLINING'">���� Declining</span> // CHANGED
+              <span *ngIf="selectedDetail.trend === 'RISING'"><i class="fas fa-arrow-trend-up"></i> Rising</span> // CHANGED
+              <span *ngIf="selectedDetail.trend === 'STABLE'"><i class="fas fa-right-long"></i> Stable</span> // CHANGED
+              <span *ngIf="selectedDetail.trend === 'DECLINING'"><i class="fas fa-arrow-trend-down"></i> Declining</span> // CHANGED
-                <span class="pd-detail-bar-row__icon">�������</span> // CHANGED
+                <span class="pd-detail-bar-row__icon"><i class="fas fa-eye"></i></span> // CHANGED
-                <span class="pd-detail-bar-row__icon">����</span> // CHANGED
+                <span class="pd-detail-bar-row__icon"><i class="fas fa-magnifying-glass"></i></span> // CHANGED
-                <span class="pd-detail-bar-row__icon">����</span> // CHANGED
+                <span class="pd-detail-bar-row__icon"><i class="fas fa-file-lines"></i></span> // CHANGED
-                <span class="pd-detail-bar-row__icon">�Ŧ</span> // CHANGED
+                <span class="pd-detail-bar-row__icon"><i class="fas fa-clock"></i></span> // CHANGED
-                <span class="pd-detail-bar-row__icon">ԣ�</span> // CHANGED
+                <span class="pd-detail-bar-row__icon"><i class="fas fa-circle-check"></i></span> // CHANGED
-                <span class="pd-detail-bar-row__icon">ԡ�</span> // CHANGED
+                <span class="pd-detail-bar-row__icon"><i class="fas fa-star"></i></span> // CHANGED

-----

FILE: src/app/shared/sidebar/sidebar.component.html

+          <span>{{ child.label }}</span> // CHANGED
+        </a> // CHANGED
+      </div> // CHANGED
+ // CHANGED
+      <button // CHANGED
+        type="button" // CHANGED
+        class="sidebar-link transit-trigger" // CHANGED
+        [ngClass]="isEventsRoute() ? 'sidebar-link-active' : 'sidebar-link-idle'" // CHANGED
+        (click)="toggleEvents()" // CHANGED
+      > // CHANGED
+        <i class="menu-icon fa-solid fa-calendar-days icon-events" aria-hidden="true"></i> // CHANGED
+        <span>Events</span> // CHANGED
+        <mat-icon class="expand-icon">{{ eventsExpanded ? 'expand_more' : 'chevron_right' }}</mat-icon> // CHANGED
+      </button> // CHANGED
+ // CHANGED
+      <div class="transit-submenu" [class.transit-submenu-expanded]="eventsExpanded"> // CHANGED
+        <a // CHANGED
+          *ngFor="let child of eventsLinks" // CHANGED
+          [routerLink]="child.path" // CHANGED
+          class="sub-link" // CHANGED
+          [class.sub-link-active]="isActive(child.path)" // CHANGED
+        > // CHANGED
+          <mat-icon>{{ child.icon }}</mat-icon> // CHANGED

-----


3) SIDEBAR NAV ARRAY (EVENTS) - COMPLETE ENTRY

  readonly eventsLinks: TransitSubLink[] = [
    { path: '/admin/events', label: 'Overview', icon: 'space_dashboard' },
    { path: '/admin/events/categories', label: 'Events Management', icon: 'category' },
    { path: '/admin/events/dashboard', label: 'Dashboard', icon: 'insights' },
    { path: '/admin/events/popularity', label: 'Popularity', icon: 'trending_up' }
  ];
