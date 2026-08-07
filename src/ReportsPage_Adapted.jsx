import React, { useState } from 'react';

function formatDateTR(dateString) {
  if (!dateString) return { day: '----', month: '---', year: '----' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { day: '----', month: '---', year: '----' };
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return { day, month: monthNames[date.getMonth()], year: date.getFullYear() };
}

export default function ReportsPage({ shoots = [], clients = [], theme }) {
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterClient, setFilterClient] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const years = [...new Set(shoots.map(s => s.shoot_date ? new Date(s.shoot_date).getFullYear() : null).filter(Boolean))].sort((a, b) => b - a);
  const categories = [...new Set(shoots.map(s => s.category).filter(Boolean))];

  const filteredShoots = shoots.filter(s => {
    if (!s.shoot_date) return false;
    const shootDate = new Date(s.shoot_date);
    const yearMatch = filterYear === 'All' || shootDate.getFullYear().toString() === filterYear;
    const monthMatch = filterMonth === 'All' || (shootDate.getMonth() + 1).toString() === filterMonth;
    const clientMatch = filterClient === 'All' || s.client_id === filterClient;
    const categoryMatch = filterCategory === 'All' || s.category === filterCategory;

    let dateRangeMatch = true;
    if (startDate) dateRangeMatch = dateRangeMatch && shootDate >= new Date(startDate);
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59);
      dateRangeMatch = dateRangeMatch && shootDate <= endD;
    }
    return yearMatch && monthMatch && clientMatch && categoryMatch && dateRangeMatch;
  });

  const totalGross = filteredShoots.reduce((acc, s) => acc + (Number(s.gross_income) || 0), 0);
  const totalReceived = filteredShoots.reduce((acc, s) => {
    const total = Number(s.gross_income) || 0;
    const received = s.payment_status === 'Paid' ? total : (Number(s.paid_amount) || 0);
    return acc + received;
  }, 0);
  const totalRemaining = filteredShoots.reduce((acc, s) => {
    const total = Number(s.gross_income) || 0;
    const received = s.payment_status === 'Paid' ? total : (Number(s.paid_amount) || 0);
    return acc + Math.max(Number(s.remaining_amount ?? total - received) || 0, 0);
  }, 0);
  const totalExpense = filteredShoots.reduce((acc, s) => acc + (Number(s.total_expense) || 0), 0);
  const netEarnings = filteredShoots.reduce(
    (acc, s) => acc + (Number(s.net_profit ?? ((Number(s.gross_income) || 0) - (Number(s.total_expense) || 0))) || 0),
    0
  );
  const earnedMoney = totalReceived;
  const toBeEarnedMoney = totalRemaining;

  const plannedCount = filteredShoots.filter(s => s.status === 'Planned').length;
  const completedCount = filteredShoots.filter(s => s.status === 'Completed').length;
  const cancelledCount = filteredShoots.filter(s => s.status === 'Cancelled').length;

  const moneyTR = value => `₺${Number(value || 0).toLocaleString('tr-TR')}`;
  const getClientName = shoot =>
    shoot.clients?.name ||
    clients.find(client => String(client.id) === String(shoot.client_id))?.name ||
    'No Client';

  const clientRevenueMap = filteredShoots.reduce((acc, shoot) => {
    const clientName = getClientName(shoot);
    acc[clientName] = (acc[clientName] || 0) + (Number(shoot.gross_income) || 0);
    return acc;
  }, {});

  const clientRevenueData = Object.entries(clientRevenueMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const donutColors = ['#10B981', '#2563EB', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#84CC16'];
  let donutProgress = 0;
  const donutSegments = clientRevenueData.map((item, index) => {
    const percentage = totalGross > 0 ? (item.value / totalGross) * 100 : 0;
    const segment = {
      ...item,
      percentage,
      color: donutColors[index % donutColors.length],
      offset: 25 - donutProgress
    };
    donutProgress += percentage;
    return segment;
  });

  const chartMap = filteredShoots.reduce((acc, shoot) => {
    const date = new Date(shoot.shoot_date);
    const key = date.toISOString().slice(0, 10);
    if (!acc[key]) {
      acc[key] = {
        key,
        label: `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`,
        expense: 0,
        net: 0
      };
    }
    acc[key].expense += Number(shoot.total_expense) || 0;
    acc[key].net += Number(shoot.net_profit) || ((Number(shoot.gross_income) || 0) - (Number(shoot.total_expense) || 0));
    return acc;
  }, {});

  const chartData = Object.values(chartMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-12);

  const maxChartValue = Math.max(1, ...chartData.flatMap(item => [item.expense, item.net]));
  const chartWidth = 900;
  const chartHeight = 320;
  const chartPadding = { top: 28, right: 24, bottom: 54, left: 72 };
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const groupWidth = chartData.length > 0 ? innerWidth / chartData.length : innerWidth;
  const barWidth = Math.max(8, Math.min(26, groupWidth * 0.28));
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  function exportToCSV() {
    const headers = ['Client Name', 'Shoot Title', 'Category', 'Date', 'Status', 'Payment Status', 'Total (TL)', 'Received (TL)', 'Remaining (TL)', 'Expense (TL)', 'Net Profit (TL)'];
    const rows = filteredShoots.map(s => [
      `"${getClientName(s)}"`, `"${s.title || ''}"`, `"${s.category || ''}"`, `"${formatDateTR(s.shoot_date).day}.${formatDateTR(s.shoot_date).month}.${formatDateTR(s.shoot_date).year}"`, `"${s.status || ''}"`, `"${s.payment_status || 'Unpaid'}"`, Number(s.gross_income) || 0, s.payment_status === 'Paid' ? (Number(s.gross_income) || 0) : (Number(s.paid_amount) || 0), Math.max(Number(s.remaining_amount ?? ((Number(s.gross_income) || 0) - (Number(s.paid_amount) || 0))) || 0, 0), Number(s.total_expense) || 0, Number(s.net_profit ?? ((Number(s.gross_income) || 0) - (Number(s.total_expense) || 0))) || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'shootflow_filtered_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="reports-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
      <style>{`
        .reports-page * { box-sizing: border-box; min-width: 0; }
        .reports-page select,
        .reports-page input,
        .reports-page button { max-width: 100%; }
        @media (max-width: 1180px) {
          .reports-page .reports-chart-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .reports-page { gap: 14px !important; }
          .reports-page > div { padding: 16px !important; border-radius: 18px !important; }
          .reports-page table { min-width: 760px; }
        }
      `}</style>
      <div style={{ background: 'linear-gradient(145deg, rgba(8,18,33,0.98), rgba(5,14,27,0.98))', border: `1px solid ${theme.border}`, borderRadius: '28px', padding: '28px', boxShadow: '0 24px 80px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '26px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: 'rgba(37,99,235,0.16)', border: '1px solid rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px' }}>📊</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '21px', color: '#F8FAFC', letterSpacing: '-0.3px' }}>Financial Overview</h2>
              <p style={{ margin: '5px 0 0', color: '#94A3B8', fontSize: '13px' }}>Client revenue, payments, expenses and net earnings</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', backgroundColor: 'rgba(15,23,42,0.72)', border: '1px solid #26364D', padding: '10px 14px', borderRadius: '13px', color: '#CBD5E1', fontSize: '13px' }}>
            <span>📅</span>
            <span>{filterMonth === 'All' ? 'All Months' : `${filterMonth}. Ay`} • {filterYear === 'All' ? 'All Years' : filterYear}</span>
          </div>
        </div>

        <div className="reports-chart-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 0.72fr) minmax(0, 1.8fr)', gap: '24px' }}>
          <div style={{ border: '1px solid #24344A', borderRadius: '22px', padding: '24px', backgroundColor: 'rgba(8,17,31,0.72)' }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '16px' }}>Revenue by Client</h3>
              <p style={{ margin: '5px 0 0', color: '#64748B', fontSize: '12px' }}>Distribution of total revenue by client</p>
            </div>

            <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px' }}>
              <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.24))' }}>
                <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#172338" strokeWidth="5.6" />
                {donutSegments.map((segment, index) => (
                  <circle
                    key={`${segment.name}-${index}`}
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="5.6"
                    strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                    strokeDashoffset={segment.offset}
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ color: '#94A3B8', fontSize: '12px' }}>Total Revenue</span>
                <strong style={{ color: '#F8FAFC', fontSize: '24px', marginTop: '4px', letterSpacing: '-0.6px' }}>{moneyTR(totalGross)}</strong>
                <span style={{ color: '#10B981', fontSize: '11px', marginTop: '5px' }}>{filteredShoots.length} shoots</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', maxHeight: '210px', overflowY: 'auto', paddingRight: '4px' }}>
              {donutSegments.length > 0 ? donutSegments.map((item, index) => (
                <div key={`${item.name}-legend-${index}`} style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: '10px', alignItems: 'center', paddingBottom: '10px', borderBottom: index < donutSegments.length - 1 ? '1px solid rgba(51,65,85,0.46)' : 'none' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}55` }}></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#E2E8F0', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ color: '#64748B', fontSize: '10px', marginTop: '2px' }}>%{item.percentage.toFixed(1)}</div>
                  </div>
                  <strong style={{ color: '#F8FAFC', fontSize: '12px' }}>{moneyTR(item.value)}</strong>
                </div>
              )) : (
                <div style={{ color: '#64748B', textAlign: 'center', padding: '30px 10px', fontSize: '13px' }}>No data found for this chart.</div>
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #24344A', borderRadius: '22px', padding: '24px', backgroundColor: 'rgba(8,17,31,0.72)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '16px' }}>Net Earnings and Expenses</h3>
                <p style={{ margin: '5px 0 0', color: '#64748B', fontSize: '12px' }}>Son 12 shoots gününün finansal karşılaştırması</p>
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: '#2563EB', display: 'inline-block' }}></i> Net Earnings</span>
                <span style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: '#EF4444', display: 'inline-block' }}></i> Expenses</span>
              </div>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              {chartData.length > 0 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', minWidth: '680px', height: 'auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="netBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F87171" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>

                  {gridValues.map((ratio, index) => {
                    const y = chartPadding.top + innerHeight - (ratio * innerHeight);
                    const value = Math.round(maxChartValue * ratio);
                    return (
                      <g key={`grid-${index}`}>
                        <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="#24344A" strokeWidth="1" strokeDasharray="5 6" />
                        <text x={chartPadding.left - 12} y={y + 4} fill="#64748B" fontSize="11" textAnchor="end">{value >= 1000 ? `${Math.round(value / 1000)}K` : value}</text>
                      </g>
                    );
                  })}

                  <line x1={chartPadding.left} x2={chartPadding.left} y1={chartPadding.top} y2={chartPadding.top + innerHeight} stroke="#334155" />
                  <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={chartPadding.top + innerHeight} y2={chartPadding.top + innerHeight} stroke="#334155" />

                  {chartData.map((item, index) => {
                    const centerX = chartPadding.left + groupWidth * index + groupWidth / 2;
                    const netHeight = (item.net / maxChartValue) * innerHeight;
                    const expenseHeight = (item.expense / maxChartValue) * innerHeight;
                    return (
                      <g key={item.key}>
                        <rect x={centerX - barWidth - 3} y={chartPadding.top + innerHeight - netHeight} width={barWidth} height={Math.max(0, netHeight)} rx="5" fill="url(#netBarGradient)">
                          <title>{`${item.label} Net Earnings: ${moneyTR(item.net)}`}</title>
                        </rect>
                        <rect x={centerX + 3} y={chartPadding.top + innerHeight - expenseHeight} width={barWidth} height={Math.max(0, expenseHeight)} rx="5" fill="url(#expenseBarGradient)">
                          <title>{`${item.label} Expenses: ${moneyTR(item.expense)}`}</title>
                        </rect>
                        <text x={centerX} y={chartPadding.top + innerHeight + 23} fill="#94A3B8" fontSize="10" textAnchor="middle">{item.label}</text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px' }}>No data found for this chart.</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))', gap: '12px', marginTop: '10px' }}>
              <div style={{ backgroundColor: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '14px', padding: '14px' }}>
                <span style={{ color: '#94A3B8', fontSize: '11px' }}>Toplam Net Earnings</span>
                <strong style={{ display: 'block', color: '#60A5FA', fontSize: '20px', marginTop: '4px' }}>{moneyTR(netEarnings)}</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.23)', borderRadius: '14px', padding: '14px' }}>
                <span style={{ color: '#94A3B8', fontSize: '11px' }}>Toplam Expenses</span>
                <strong style={{ display: 'block', color: '#F87171', fontSize: '20px', marginTop: '4px' }}>{moneyTR(totalExpense)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Year</label>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px', color: theme.textMain, fontSize: '13px' }}>
            <option value="All">All Years</option>
            {years.map((y, idx) => <option key={idx} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Month</label>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px', color: theme.textMain, fontSize: '13px' }}>
            <option value="All">All Months</option>
            <option value="1">January</option><option value="2">February</option><option value="3">March</option>
            <option value="4">April</option><option value="5">May</option><option value="6">June</option>
            <option value="7">July</option><option value="8">August</option><option value="9">September</option>
            <option value="10">October</option><option value="11">November</option><option value="12">December</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Client</label>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px', color: theme.textMain, fontSize: '13px' }}>
            <option value="All">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px', color: theme.textMain, fontSize: '13px' }}>
            <option value="All">All Categories</option>
            {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div><label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '7px', color: theme.textMain, fontSize: '13px', boxSizing: 'border-box' }} /></div>
        <div><label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '7px', color: theme.textMain, fontSize: '13px', boxSizing: 'border-box' }} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}><span style={{ fontSize: '12px', color: theme.textMuted }}>Total Revenue</span><h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#3B82F6', margin: '4px 0 0 0' }}>{moneyTR(totalGross)}</h3></div>
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}><span style={{ fontSize: '12px', color: theme.textMuted }}>Earned</span><h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34D399', margin: '4px 0 0 0' }}>{moneyTR(earnedMoney)}</h3></div>
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}><span style={{ fontSize: '12px', color: theme.textMuted }}>To Be Earned</span><h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FBBF24', margin: '4px 0 0 0' }}>{moneyTR(toBeEarnedMoney)}</h3></div>
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}><span style={{ fontSize: '12px', color: theme.textMuted }}>Total Expenses</span><h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#EF4444', margin: '4px 0 0 0' }}>{moneyTR(totalExpense)}</h3></div>
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}><span style={{ fontSize: '12px', color: theme.textMuted }}>Net Earnings</span><h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#34D399', margin: '4px 0 0 0' }}>{moneyTR(netEarnings)}</h3></div>
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}><span style={{ fontSize: '12px', color: theme.textMuted }}>Shoots (P / C / Ca)</span><h3 style={{ fontSize: '18px', fontWeight: 'bold', color: theme.textMain, margin: '4px 0 0 0' }}>{plannedCount} / {completedCount} / {cancelledCount}</h3></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={exportToCSV} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Export Filtered to Excel (.CSV)</button></div>

      <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}`, color: theme.textMuted, fontSize: '12px' }}>
              <th style={{ padding: '16px' }}>Client</th><th style={{ padding: '16px' }}>Title</th><th style={{ padding: '16px' }}>Category</th><th style={{ padding: '16px' }}>Date</th><th style={{ padding: '16px' }}>Status</th><th style={{ padding: '16px' }}>Payment</th><th style={{ padding: '16px', textAlign: 'right' }}>Net Profit</th>
            </tr>
          </thead>
          <tbody style={{ color: theme.textMain }}>
            {filteredShoots.length > 0 ? (
              filteredShoots.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '16px' }}>{s.clients?.name}</td>
                  <td style={{ padding: '16px' }}>{s.title}</td>
                  <td style={{ padding: '16px', color: theme.textMuted }}>{s.category}</td>
                  <td style={{ padding: '16px' }}>{formatDateTR(s.shoot_date).day}.{formatDateTR(s.shoot_date).month}</td>
                  <td style={{ padding: '16px' }}>{s.status}</td>
                  <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: (s.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'), color: (s.payment_status === 'Paid' ? '#34D399' : '#F87171') }}>{s.payment_status || 'Unpaid'}</span></td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#34D399' }}>{moneyTR(s.net_profit)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: theme.textMuted }}>No shoots found matching the selected criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
