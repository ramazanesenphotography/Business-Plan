import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovmuiosxbfdprgxdjlfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXVpb3N4YmZkcHJneGRqbGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODA3ODYsImV4cCI6MjEwMDY1Njc4Nn0.fw22a_T5f5QyL-qIOxFxOMwPZhIv9U5ANZs3WCWtU4Y';
const supabase = createClient(supabaseUrl, supabaseKey);

function formatDateTR(dateString) {
  if (!dateString) return { day: '----', month: '---', year: '----' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { day: '----', month: '---', year: '----' };
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return { day, month: monthNames[date.getMonth()], year: date.getFullYear() };
}


const DashboardPage = lazy(() => import('./DashboardPage'));
const DashboardTestPage = lazy(() => import('./DashboardTestPage'));
const CalendarPage = lazy(() => import('./CalendarPage'));
const CalendarTestPage = lazy(() => import('./CalendarTestPage'));
const ClientsPage = lazy(() => import('./ClientsPage'));
const ClientsTestPage = lazy(() => import('./ClientsTestPage'));
const ReportsPage = lazy(() => import('./ReportsPage'));
const ReportsTestPage = lazy(() => import('./ReportsTestPage'));
// Toggle temporary dashboard data here.
// true  = 20 demo jobs
// false = live Supabase data
const DASHBOARD_DEMO_MODE = true;
const CALENDAR_DEMO_MODE = true;
const CLIENTS_DEMO_MODE = true;
const REPORTS_DEMO_MODE = true;


function AppIcon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <rect x="14" y="14" width="7" height="7" rx="1.4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    clients: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    reports: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <path d="M7 16v-4M12 16V8M17 16v-7" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    moon: (
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
    )
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function CameraLogo({ size = 46 }) {
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 58 46"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M8 10h10l4-6h15l4 6h9a5 5 0 0 1 5 5v23a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5Z"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="29" cy="26" r="10" stroke="#3B82F6" strokeWidth="3" />
      <circle cx="46" cy="17" r="2" fill="#3B82F6" />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTabPending, startTabTransition] = useTransition();
  const [shoots, setShoots] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [profile, setProfile] = useState({
    name: 'Ramazan Esen',
    title: 'Professional Photographer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  });

  const hasLivePages =
    !DASHBOARD_DEMO_MODE ||
    !CALENDAR_DEMO_MODE ||
    !CLIENTS_DEMO_MODE ||
    !REPORTS_DEMO_MODE;

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (!hasLivePages) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    try {
      const [shootsResult, clientsResult] = await Promise.all([
        supabase
          .from('shoots')
          .select('*, clients(id, name, phone, email, avatar, address, is_featured)')
          .order('shoot_date', { ascending: true }),
        supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true })
      ]);

      if (shootsResult.error) throw shootsResult.error;
      if (clientsResult.error) throw clientsResult.error;

      setShoots(shootsResult.data || []);
      setClients(clientsResult.data || []);
    } catch (error) {
      console.error('Data fetch error:', error.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [hasLivePages]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeTab = useCallback((tab) => {
    startTabTransition(() => setActiveTab(tab));
  }, []);

  const theme = useMemo(() => ({
    bg: isDarkMode ? '#070B14' : '#F8FAFC',
    cardBg: isDarkMode ? '#101826' : '#FFFFFF',
    border: isDarkMode ? '#202C3A' : '#E2E8F0',
    textMain: isDarkMode ? '#F8FAFC' : '#0F172A',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    sidebarBg: isDarkMode ? '#070B14' : '#FFFFFF',
    headerBg: isDarkMode ? '#070B14' : '#FFFFFF',
    hoverBg: isDarkMode ? '#162133' : '#F1F5F9'
  }), [isDarkMode]);

  return (
    <div className="shootflow-app" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: theme.bg, color: theme.textMain, minHeight: '100vh', display: 'flex', transition: 'background 0.3s, color 0.3s', '--shootflow-date-muted': theme.textMuted }}>
      <style>{`
        .shootflow-app {
          width:100%;
          min-width:0;
          overflow-x:hidden;
        }
        .shootflow-sidebar {
          flex:0 0 clamp(220px,16vw,260px);
          width:clamp(220px,16vw,260px) !important;
          min-height:100vh;
        }
        .shootflow-sidebar-top {
          display:flex;
          flex-direction:column;
          gap:32px;
          min-height:0;
        }
        .shootflow-sidebar-bottom {
          position:absolute;
          left:16px;
          right:16px;
          bottom:24px;
          display:flex;
          flex-direction:column;
          gap:10px;
          padding:0;
        }
        .shootflow-content {
          min-width:0;
          width:calc(100% - clamp(220px,16vw,260px));
        }
        .shootflow-header {
          min-width:0;
          overflow:hidden;
          padding-inline:clamp(18px,3vw,40px) !important;
        }
        .shootflow-main {
          min-width:0;
          width:100%;
          max-width:100%;
          overflow-x:hidden;
          padding:clamp(18px,2.6vw,36px) clamp(14px,3vw,40px) !important;
        }
        .shootflow-brand {
          display:flex;
          align-items:center;
          gap:10px;
          padding-left:4px;
          min-width:0;
        }
        .shootflow-brand-copy { min-width:0; }
        .shootflow-wordmark {
          margin:0;
          color:#FACC15;
          font-size:clamp(16px,1.4vw,20px);
          line-height:1;
          letter-spacing:-.35px;
          font-weight:900;
          white-space:nowrap;
        }
        .shootflow-tagline {
          margin:4px 0 0;
          color:#94A3B8;
          font-size:clamp(7px,.65vw,9px);
          letter-spacing:.65px;
          white-space:nowrap;
        }
        .shootflow-nav-icon {
          width:22px;
          height:22px;
          display:grid;
          place-items:center;
          flex:0 0 22px;
        }
        .shootflow-nav-label {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .shootflow-date-wrap {
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          color:var(--shootflow-date-muted);
          white-space:nowrap;
          flex-shrink:0;
          min-width:0;
        }
        .shootflow-date-text,
        .shootflow-date-location {
          white-space:nowrap;
          word-break:normal;
          overflow-wrap:normal;
        }
        .shootflow-date-location {
          color:#3B82F6;
          font-weight:500;
          margin-left:4px;
        }
        @media (max-width: 980px) {
          .shootflow-app { display:block !important; }
          .shootflow-sidebar {
            position:relative !important;
            width:100% !important;
            height:auto !important;
            min-height:auto !important;
            flex:none !important;
          }
          .shootflow-sidebar-bottom {
            position:static;
            margin-top:18px;
            padding:0;
          }
          .shootflow-sidebar nav {
            display:grid !important;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:6px !important;
          }
          .shootflow-sidebar > div:first-child {
            gap:18px !important;
          }
          .shootflow-content { width:100% !important; }
          .shootflow-header {
            position:relative !important;
            padding:14px 18px !important;
            flex-wrap:wrap;
            gap:12px;
          }
          .shootflow-header > div:first-child {
            width:min(100%,420px) !important;
          }
          .shootflow-header > div:last-child {
            width:100%;
            justify-content:space-between;
            gap:10px !important;
          }
          .shootflow-main { padding:18px 14px !important; }
        }
        @media (max-width: 900px) {
          .shootflow-date-location { display:none; }
        }
        @media (max-width: 700px) {
          .shootflow-date-wrap { font-size:11px; }
        }
        @media (max-width: 620px) {
          .shootflow-sidebar nav { grid-template-columns:1fr; }
          .shootflow-header > div:first-child { width:100% !important; }
          .shootflow-header > div:last-child > div:first-child {
            display:none !important;
          }
          .shootflow-wordmark { font-size:18px; }
          .shootflow-tagline { font-size:8px; }
        }
      `}</style>
      
      {/* Sidebar */}
      <aside className="shootflow-sidebar" style={{ width: '260px', backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', padding: '24px 16px 118px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box', zIndex: 100 }}>
        <div className="shootflow-sidebar-top">
          
          <div className="shootflow-brand">
            <CameraLogo size={46} />
            <div className="shootflow-brand-copy">
              <h1 className="shootflow-wordmark">SHOOTFLOW</h1>
              <p className="shootflow-tagline">PHOTOGRAPHY MANAGEMENT</p>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'calendar', label: 'Calendar', icon: 'calendar' },
              { id: 'clients', label: 'Clients', icon: 'clients' },
              { id: 'reports', label: 'Reports', icon: 'reports' },
            ].map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 14px', borderRadius: '12px', border: 'none',
                    backgroundColor: isActive ? theme.hoverBg : 'transparent',
                    color: isActive ? '#3B82F6' : theme.textMuted,
                    cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '600' : '500', textAlign: 'left', transition: 'all 0.2s'
                  }}
                >
                  <span className="shootflow-nav-icon"><AppIcon name={item.icon} size={19} /></span>
                  <span className="shootflow-nav-label">{item.label}</span>
                </button>
              );
            })}

            <div style={{ height: 1, background: theme.border, margin: '8px 8px' }} />

            {[
              {
                label: 'Ramazan Esen',
                icon: 'globe',
                url: 'https://www.ramazanesen.com/'
              },
              {
                label: 'Sport Istanbul',
                icon: 'globe',
                url: 'https://www.sportistanbul.com/'
              }
            ].map(item => (
              <button
                key={item.url}
                type="button"
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = theme.hoverBg;
                  event.currentTarget.style.color = '#3B82F6';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                  event.currentTarget.style.color = theme.textMuted;
                }}
              >
                <span className="shootflow-nav-icon"><AppIcon name={item.icon} size={19} /></span>
                <span className="shootflow-nav-label">{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>↗</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="shootflow-sidebar-bottom">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-pressed={isDarkMode}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, padding: '10px 12px', borderRadius: '14px', cursor: 'pointer', color: theme.textMain }}
          >
            <span style={{ display:'flex', alignItems:'center', gap:9, fontSize: '12px', fontWeight: 650 }}>
              <AppIcon name="moon" size={18} />
              Dark Mode
            </span>
            <span style={{ width: 38, height: 22, borderRadius: 999, padding: 3, display: 'flex', justifyContent: isDarkMode ? 'flex-end' : 'flex-start', background: isDarkMode ? '#3B82F6' : '#334155', transition: 'all .2s' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }} />
            </span>
          </button>
          <span style={{ fontSize: '11px', color: theme.textMuted, paddingLeft: '4px' }}>v1.2.0 Pro</span>
        </div>
      </aside>

      {/* Main content area */}
      <div className="shootflow-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.bg }}>
        
        {/* Top bar */}
        <header className="shootflow-header" style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.border}`, padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '8px 16px', width: '320px', gap: '10px' }}>
            <span style={{ color: theme.textMuted, fontSize: 15 }}>⌕</span>
            <input type="text" placeholder="Search shoots, clients... ⌘K" style={{ background: 'transparent', border: 'none', color: theme.textMain, fontSize: '13px', outline: 'none', width: '100%' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            
            <div className="shootflow-date-wrap">
              <AppIcon name="calendar" size={17} />
              <span className="shootflow-date-text">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="shootflow-date-location">Istanbul, Turkey</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'transparent', padding: '4px 12px 4px 4px', borderRadius: '16px' }}>
              <label style={{ cursor: 'pointer', position: 'relative' }} title="Click to change profile picture">
                <img src={profile.avatar} alt={profile.name} style={{ width: '42px', height: '42px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #3B82F6' }} />
                <input 
                  type="file" accept="image/*" style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => setProfile({ ...profile, avatar: event.target.result });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <div>
                <input 
                  type="text" value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ fontSize: '15px', fontWeight: 'bold', color: theme.textMain, background: 'transparent', border: 'none', outline: 'none', width: '140px' }} 
                />
                <span style={{ fontSize: '11px', color: '#3B82F6', display: 'block', fontWeight: '500' }}>{profile.title}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Main content */}
        <main className="shootflow-main" style={{ flex: 1, padding: '36px 40px', maxWidth: '1600px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Suspense
            fallback={
              <div style={{ textAlign: 'center', marginTop: '64px', color: theme.textMuted }}>
                Loading page...
              </div>
            }
          >
            {loading && hasLivePages ? (
              <div style={{ textAlign: 'center', marginTop: '64px', color: theme.textMuted }}>
                Loading data...
              </div>
            ) : (
              <>
              {activeTab === 'dashboard' && (
                DASHBOARD_DEMO_MODE ? (
                  <DashboardTestPage
                    setActiveTab={changeTab}
                    theme={theme}
                  />
                ) : (
                  <DashboardPage
                    shoots={shoots}
                    clients={clients}
                    setActiveTab={changeTab}
                    refresh={() => fetchData({ silent: true })}
                    theme={theme}
                  />
                )
              )}
              {activeTab === 'calendar' && (
                CALENDAR_DEMO_MODE
                  ? <CalendarTestPage theme={theme} />
                  : <CalendarPage clients={clients} refresh={() => fetchData({ silent: true })} shoots={shoots} theme={theme} supabase={supabase} />
              )}
              {activeTab === 'clients' && (
                CLIENTS_DEMO_MODE
                  ? <ClientsTestPage theme={theme} />
                  : <ClientsPage clients={clients} refresh={() => fetchData({ silent: true })} shoots={shoots} theme={theme} supabase={supabase} />
              )}
              {activeTab === 'reports' && (
                REPORTS_DEMO_MODE
                  ? <ReportsTestPage theme={theme} />
                  : <ReportsPage shoots={shoots} clients={clients} theme={theme} />
              )}
              </>
            )}
          </Suspense>
          {isTabPending && (
            <div
              aria-hidden="true"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg,#3B82F6,#8B5CF6,#10B981)',
                zIndex: 9999
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
