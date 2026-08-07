
import React, { useMemo, useState } from 'react';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function money(value) {
  return `TRY ${Number(value || 0).toLocaleString('tr-TR', {
    maximumFractionDigits: 0
  })}`;
}

function getClientName(shoot, clients) {
  return (
    shoot?.clients?.name ||
    clients.find((client) => String(client.id) === String(shoot.client_id))?.name ||
    'No Client'
  );
}

function getTotal(shoot) {
  return Number(shoot?.gross_income || 0);
}

function getReceived(shoot) {
  if (String(shoot?.payment_status || '').toLowerCase() === 'paid') {
    return getTotal(shoot);
  }
  return Number(shoot?.paid_amount || 0);
}

function getRemaining(shoot) {
  return Math.max(
    Number(shoot?.remaining_amount ?? getTotal(shoot) - getReceived(shoot)) || 0,
    0
  );
}

function getExpense(shoot) {
  return Number(shoot?.total_expense || 0);
}

function getNet(shoot) {
  return Number(shoot?.net_profit ?? getTotal(shoot) - getExpense(shoot)) || 0;
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  const icons = {
    revenue: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M7 12h10M9 9h6M9 15h6" />
      </>
    ),
    received: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    remaining: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    profit: (
      <>
        <path d="M4 17 10 11l4 4 6-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    shoots: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <circle cx="12" cy="13" r="3.5" />
        <path d="m8 6 1.5-2h5L16 6" />
      </>
    ),
    clients: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </>
    ),
    export: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1L6.5 8.5l4.1-1.4Z" />
        <path d="m18.5 14 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7Z" />
      </>
    )
  };

  return <svg {...common}>{icons[name]}</svg>;
}

function StatCard({ icon, label, value, hint, accent, background }) {
  return (
    <div className="report-stat-card">
      <div className="report-stat-icon" style={{ color: accent, background }}>
        <Icon name={icon} size={18} />
      </div>
      <div className="report-stat-label">{label}</div>
      <strong className="report-stat-value">{value}</strong>
      <div className="report-stat-hint">{hint}</div>
    </div>
  );
}

function Panel({ title, subtitle, children, className = '', action = null }) {
  return (
    <section className={`report-panel ${className}`}>
      <div className="report-panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ReportsPage({ shoots = [], clients = [], theme }) {
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterClient, setFilterClient] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const years = useMemo(
    () =>
      [...new Set(
        shoots
          .map((shoot) => safeDate(shoot.shoot_date)?.getFullYear())
          .filter(Boolean)
      )].sort((a, b) => b - a),
    [shoots]
  );

  const categories = useMemo(
    () => [...new Set(shoots.map((shoot) => shoot.category).filter(Boolean))],
    [shoots]
  );

  const filteredShoots = useMemo(
    () =>
      shoots.filter((shoot) => {
        const date = safeDate(shoot.shoot_date);
        if (!date) return false;

        const yearMatch =
          filterYear === 'All' || String(date.getFullYear()) === filterYear;
        const monthMatch =
          filterMonth === 'All' || String(date.getMonth() + 1) === filterMonth;
        const clientMatch =
          filterClient === 'All' || String(shoot.client_id) === filterClient;
        const categoryMatch =
          filterCategory === 'All' || shoot.category === filterCategory;

        return yearMatch && monthMatch && clientMatch && categoryMatch;
      }),
    [shoots, filterYear, filterMonth, filterClient, filterCategory]
  );

  const totals = useMemo(
    () =>
      filteredShoots.reduce(
        (result, shoot) => {
          result.revenue += getTotal(shoot);
          result.received += getReceived(shoot);
          result.remaining += getRemaining(shoot);
          result.expenses += getExpense(shoot);
          result.net += getNet(shoot);
          result.clientIds.add(String(shoot.client_id || ''));
          return result;
        },
        {
          revenue: 0,
          received: 0,
          remaining: 0,
          expenses: 0,
          net: 0,
          clientIds: new Set()
        }
      ),
    [filteredShoots]
  );

  const monthlyData = useMemo(() => {
    const selectedYear =
      filterYear !== 'All'
        ? Number(filterYear)
        : years[0] || new Date().getFullYear();

    return MONTHS.map((month, index) => {
      const monthShoots = filteredShoots.filter((shoot) => {
        const date = safeDate(shoot.shoot_date);
        return (
          date &&
          date.getFullYear() === selectedYear &&
          date.getMonth() === index
        );
      });

      return {
        month: month.slice(0, 3),
        revenue: monthShoots.reduce((sum, shoot) => sum + getTotal(shoot), 0),
        net: monthShoots.reduce((sum, shoot) => sum + getNet(shoot), 0)
      };
    });
  }, [filteredShoots, filterYear, years]);

  const yearlyData = useMemo(() => {
    const map = new Map();

    shoots.forEach((shoot) => {
      const date = safeDate(shoot.shoot_date);
      if (!date) return;
      const year = date.getFullYear();
      const current = map.get(year) || { year, revenue: 0, net: 0, shoots: 0 };
      current.revenue += getTotal(shoot);
      current.net += getNet(shoot);
      current.shoots += 1;
      map.set(year, current);
    });

    return [...map.values()].sort((a, b) => a.year - b.year).slice(-6);
  }, [shoots]);

  const clientData = useMemo(() => {
    const map = new Map();

    filteredShoots.forEach((shoot) => {
      const name = getClientName(shoot, clients);
      const current = map.get(name) || { name, revenue: 0, shoots: 0 };
      current.revenue += getTotal(shoot);
      current.shoots += 1;
      map.set(name, current);
    });

    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredShoots, clients]);

  const categoryData = useMemo(() => {
    const map = new Map();

    filteredShoots.forEach((shoot) => {
      const name = shoot.category || 'Other';
      const current = map.get(name) || {
        name,
        revenue: 0,
        shoots: 0,
        net: 0
      };
      current.revenue += getTotal(shoot);
      current.net += getNet(shoot);
      current.shoots += 1;
      map.set(name, current);
    });

    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [filteredShoots]);

  const totalClientRevenue = clientData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const receivedRate =
    totals.revenue > 0 ? Math.round((totals.received / totals.revenue) * 100) : 0;

  const maxMonthly = Math.max(
    1,
    ...monthlyData.flatMap((item) => [item.revenue, item.net])
  );

  const maxYearly = Math.max(
    1,
    ...yearlyData.flatMap((item) => [item.revenue, item.net])
  );

  const bestYear = yearlyData.reduce(
    (best, item) => (!best || item.revenue > best.revenue ? item : best),
    null
  );

  const topClient = clientData[0];
  const topCategory = categoryData[0];

  const insights = [
    {
      title: 'Outstanding payments',
      value: money(totals.remaining),
      text:
        totals.remaining > 0
          ? `${filteredShoots.filter((shoot) => getRemaining(shoot) > 0).length} shoots still have an outstanding balance.`
          : 'All filtered shoots are fully paid.',
      accent: '#F59E0B'
    },
    {
      title: 'Top client',
      value: topClient?.name || 'No data',
      text: topClient
        ? `${money(topClient.revenue)} revenue from ${topClient.shoots} shoots.`
        : 'Add jobs to see your top client.',
      accent: '#8B5CF6'
    },
    {
      title: 'Best category',
      value: topCategory?.name || 'No data',
      text: topCategory
        ? `${money(topCategory.net)} net earnings across ${topCategory.shoots} shoots.`
        : 'Add jobs to compare categories.',
      accent: '#10B981'
    },
    {
      title: 'Collection rate',
      value: `${receivedRate}%`,
      text: `${money(totals.received)} of ${money(totals.revenue)} has been received.`,
      accent: '#3B82F6'
    }
  ];

  function exportToCSV() {
    const headers = [
      'Client',
      'Title',
      'Category',
      'Date',
      'Status',
      'Payment',
      'Total',
      'Received',
      'Remaining',
      'Expense',
      'Net'
    ];

    const rows = filteredShoots.map((shoot) => [
      getClientName(shoot, clients),
      shoot.title || '',
      shoot.category || '',
      safeDate(shoot.shoot_date)?.toLocaleDateString('en-GB') || '',
      shoot.status || '',
      shoot.payment_status || 'Unpaid',
      getTotal(shoot),
      getReceived(shoot),
      getRemaining(shoot),
      getExpense(shoot),
      getNet(shoot)
    ]);

    const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'business-plan-reports.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="reports-premium">
      <style>{`
        .reports-premium {
          width:100%;
          min-width:0;
          display:flex;
          flex-direction:column;
          gap:16px;
          color:${theme.textMain};
        }

        .reports-premium * {
          box-sizing:border-box;
          min-width:0;
        }

        .report-toolbar,
        .report-panel,
        .report-stat-card {
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          box-shadow:0 16px 48px rgba(0,0,0,.13);
        }

        .report-toolbar {
          border-radius:20px;
          padding:16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:14px;
          flex-wrap:wrap;
        }

        .report-title h2 {
          margin:0;
          font-size:22px;
          letter-spacing:-.4px;
          color:${theme.textMain};
        }

        .report-title p {
          margin:5px 0 0;
          font-size:11px;
          color:${theme.textMuted};
        }

        .report-filters {
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
        }

        .report-select,
        .report-export {
          height:36px;
          border-radius:10px;
          border:1px solid ${theme.border};
          background:${theme.bg};
          color:${theme.textMain};
          padding:0 10px;
          font-size:10px;
          outline:none;
        }

        .report-export {
          background:linear-gradient(135deg,#2563EB,#3B82F6);
          border-color:#3B82F6;
          color:#fff;
          font-weight:750;
          display:inline-flex;
          align-items:center;
          gap:7px;
          cursor:pointer;
        }

        .report-stats-grid {
          display:grid;
          grid-template-columns:repeat(6,minmax(0,1fr));
          gap:10px;
        }

        .report-stat-card {
          position:relative;
          overflow:hidden;
          border-radius:15px;
          padding:13px;
          min-height:118px;
        }

        .report-stat-card::after {
          content:'';
          position:absolute;
          width:90px;
          height:90px;
          border-radius:50%;
          right:-38px;
          top:-38px;
          background:rgba(59,130,246,.06);
        }

        .report-stat-icon {
          width:32px;
          height:32px;
          border-radius:10px;
          display:grid;
          place-items:center;
          margin-bottom:10px;
        }

        .report-stat-label {
          color:${theme.textMuted};
          font-size:9px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .report-stat-value {
          display:block;
          margin-top:5px;
          color:${theme.textMain};
          font-size:15px;
          line-height:1.2;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .report-stat-hint {
          margin-top:6px;
          color:${theme.textMuted};
          font-size:8px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .report-main-grid {
          display:grid;
          grid-template-columns:minmax(0,1.45fr) minmax(280px,.8fr);
          gap:14px;
          align-items:start;
        }

        .report-main-grid > .report-panel {
          height:470px;
          min-height:470px;
          max-height:470px;
        }

        .report-two-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
        }

        .report-panel {
          border-radius:18px;
          padding:16px;
          overflow:hidden;
        }

        .report-panel-head {
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:12px;
          margin-bottom:14px;
        }

        .report-panel-head h3 {
          margin:0;
          color:${theme.textMain};
          font-size:14px;
        }

        .report-panel-head p {
          margin:4px 0 0;
          color:${theme.textMuted};
          font-size:9px;
        }

        .report-line-chart {
          width:100%;
          height:330px;
          display:flex;
          align-items:flex-end;
          gap:7px;
          padding-top:20px;
          border-bottom:1px solid ${theme.border};
          background:
            linear-gradient(to top, transparent 24%, ${theme.border} 25%, transparent 26%),
            linear-gradient(to top, transparent 49%, ${theme.border} 50%, transparent 51%),
            linear-gradient(to top, transparent 74%, ${theme.border} 75%, transparent 76%);
        }

        .report-month {
          flex:1;
          min-width:0;
          height:100%;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          gap:3px;
          position:relative;
          padding-bottom:24px;
        }

        .report-month-bar {
          width:min(13px,38%);
          min-height:2px;
          border-radius:5px 5px 2px 2px;
          transition:.2s ease;
        }

        .report-month:hover .report-month-bar {
          filter:brightness(1.18);
        }

        .report-month-label {
          position:absolute;
          bottom:5px;
          color:${theme.textMuted};
          font-size:7px;
        }

        .report-chart-legend {
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          color:${theme.textMuted};
          font-size:8px;
        }

        .report-chart-legend span {
          display:flex;
          align-items:center;
          gap:5px;
        }

        .report-chart-legend i {
          display:block;
          width:7px;
          height:7px;
          border-radius:2px;
        }

        .report-donut-wrap {
          display:grid;
          place-items:center;
          min-height:195px;
        }

        .report-donut {
          width:160px;
          height:160px;
          border-radius:50%;
          position:relative;
          display:grid;
          place-items:center;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);
        }

        .report-donut::after {
          content:'';
          width:92px;
          height:92px;
          border-radius:50%;
          position:absolute;
          background:${theme.cardBg};
          border:1px solid ${theme.border};
        }

        .report-donut-center {
          position:relative;
          z-index:3;
          text-align:center;
        }

        .report-donut-label {
          position:absolute;
          z-index:2;
          transform:translate(-50%,-50%);
          max-width:72px;
          padding:3px 5px;
          border-radius:7px;
          background:rgba(5,12,24,.78);
          border:1px solid rgba(255,255,255,.08);
          color:#fff;
          font-size:7px;
          font-weight:800;
          line-height:1.15;
          text-align:center;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          pointer-events:none;
          box-shadow:0 6px 16px rgba(0,0,0,.22);
        }

        .report-donut-center strong {
          display:block;
          max-width:120px;
          margin:0 auto;
          font-size:15px;
          line-height:1.15;
          color:${theme.textMain};
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .report-donut-center span {
          font-size:8px;
          color:${theme.textMuted};
        }

        .report-client-list,
        .report-category-list,
        .report-insights {
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .report-main-grid .report-client-list {
          width:100%;
          max-width:100%;
          max-height:205px;
          overflow-y:auto;
          overflow-x:hidden;
          padding-right:8px;
          scrollbar-gutter:stable;
        }

        .report-main-grid .report-client-list::-webkit-scrollbar {
          width:4px;
        }

        .report-main-grid .report-client-list::-webkit-scrollbar-thumb {
          background:${theme.border};
          border-radius:99px;
        }

        .report-client-row,
        .report-category-row {
          width:100%;
          max-width:100%;
          min-width:0;
          display:grid;
          grid-template-columns:minmax(0,1fr) 48px minmax(66px,78px);
          gap:7px;
          align-items:center;
          padding:9px 9px;
          border:1px solid ${theme.border};
          background:${theme.bg};
          border-radius:10px;
          overflow:hidden;
        }

        .report-client-name,
        .report-category-name {
          min-width:0;
          max-width:100%;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          font-size:9px;
          font-weight:700;
        }

        .report-client-shoots,
        .report-category-shoots {
          min-width:0;
          color:${theme.textMuted};
          font-size:8px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          text-align:center;
        }

        .report-client-value,
        .report-category-value {
          min-width:0;
          max-width:100%;
          text-align:right;
          font-size:8px;
          font-weight:750;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .report-progress {
          grid-column:1 / -1;
          height:4px;
          background:${theme.border};
          border-radius:99px;
          overflow:hidden;
        }

        .report-progress span {
          display:block;
          height:100%;
          border-radius:99px;
        }

        .report-payment-grid {
          display:grid;
          grid-template-columns:190px 1fr;
          align-items:center;
          gap:18px;
        }

        .report-payment-info {
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .report-payment-box {
          padding:12px;
          border-radius:12px;
          border:1px solid ${theme.border};
          background:${theme.bg};
        }

        .report-payment-box span {
          display:block;
          color:${theme.textMuted};
          font-size:8px;
          margin-bottom:4px;
        }

        .report-payment-box strong {
          font-size:14px;
        }

        .report-year-chart {
          display:flex;
          align-items:flex-end;
          gap:16px;
          min-height:235px;
          padding:20px 8px 0;
          border-bottom:1px solid ${theme.border};
        }

        .report-year-group {
          flex:1;
          min-width:56px;
          height:205px;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          gap:6px;
          position:relative;
          padding-bottom:28px;
        }

        .report-year-bar {
          width:min(30px,38%);
          min-height:3px;
          border-radius:7px 7px 2px 2px;
        }

        .report-year-label {
          position:absolute;
          bottom:7px;
          color:${theme.textMuted};
          font-size:8px;
        }

        .report-best-year {
          position:absolute;
          top:-5px;
          font-size:15px;
        }

        .report-insights-grid {
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:10px;
        }

        .report-insight {
          border:1px solid ${theme.border};
          background:${theme.bg};
          border-radius:12px;
          padding:12px;
        }

        .report-insight-top {
          display:flex;
          align-items:center;
          gap:7px;
          margin-bottom:8px;
        }

        .report-insight-dot {
          width:9px;
          height:9px;
          border-radius:50%;
          box-shadow:0 0 14px currentColor;
        }

        .report-insight h4 {
          margin:0;
          font-size:9px;
          color:${theme.textMain};
        }

        .report-insight strong {
          display:block;
          font-size:13px;
          margin-bottom:5px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .report-insight p {
          margin:0;
          color:${theme.textMuted};
          font-size:8px;
          line-height:1.5;
        }

        .report-table-wrap {
          overflow:auto;
          border:1px solid ${theme.border};
          border-radius:12px;
        }

        .report-table {
          width:100%;
          min-width:900px;
          border-collapse:collapse;
          font-size:8px;
        }

        .report-table th,
        .report-table td {
          padding:10px;
          text-align:left;
          border-bottom:1px solid ${theme.border};
          white-space:nowrap;
        }

        .report-table th {
          color:${theme.textMuted};
          background:${theme.bg};
          font-weight:700;
        }

        .report-table td {
          color:${theme.textMain};
        }

        .report-table tr:last-child td {
          border-bottom:0;
        }

        .report-empty {
          padding:32px;
          text-align:center;
          color:${theme.textMuted};
          font-size:10px;
        }

        @media (max-width:1200px) {
          .report-stats-grid {
            grid-template-columns:repeat(3,minmax(0,1fr));
          }

          .report-main-grid {
            grid-template-columns:1fr;
          }

          .report-main-grid > .report-panel {
            height:auto;
            min-height:0;
            max-height:none;
          }

          .report-main-grid .report-client-list {
            max-height:none;
            overflow:visible;
          }

          .report-insights-grid {
            grid-template-columns:repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width:780px) {
          .report-stats-grid,
          .report-two-grid {
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .report-payment-grid {
            grid-template-columns:1fr;
          }

          .report-donut {
            width:160px;
            height:160px;
          }

          .report-donut::after {
            width:92px;
            height:92px;
          }
        }

        @media (max-width:520px) {
          .report-stats-grid,
          .report-two-grid,
          .report-insights-grid {
            grid-template-columns:1fr;
          }

          .report-toolbar {
            align-items:stretch;
          }

          .report-filters {
            display:grid;
            grid-template-columns:1fr 1fr;
          }

          .report-export {
            grid-column:1 / -1;
            justify-content:center;
          }

          .report-client-row,
          .report-category-row {
            grid-template-columns:minmax(0,1fr) auto;
          }

          .report-client-shoots,
          .report-category-shoots {
            display:none;
          }
        }

        /* 100% ZOOM PAGE CONSISTENCY */
        .reports-premium {
          width:100%;
          max-width:100%;
          overflow-x:hidden;
        }

        .report-toolbar,
        .report-panel,
        .report-stat-card,
        .report-main-grid,
        .report-two-grid {
          max-width:100%;
          min-width:0;
        }

        @media (max-width:1100px) {
          .report-stats-grid {
            grid-template-columns:repeat(3,minmax(0,1fr));
          }

          .report-main-grid,
          .report-two-grid {
            grid-template-columns:1fr;
          }

          .report-main-grid > .report-panel {
            height:auto;
            min-height:0;
            max-height:none;
          }
        }

      `}</style>

      <div className="report-toolbar">
        <div className="report-title">
          <h2>Reports</h2>
          <p>Financial performance, clients, categories and business growth.</p>
        </div>

        <div className="report-filters">
          <select
            className="report-select"
            value={filterYear}
            onChange={(event) => setFilterYear(event.target.value)}
          >
            <option value="All">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            className="report-select"
            value={filterMonth}
            onChange={(event) => setFilterMonth(event.target.value)}
          >
            <option value="All">All Months</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            className="report-select"
            value={filterClient}
            onChange={(event) => setFilterClient(event.target.value)}
          >
            <option value="All">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>

          <select
            className="report-select"
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button type="button" className="report-export" onClick={exportToCSV}>
            <Icon name="export" size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="report-stats-grid">
        <StatCard
          icon="revenue"
          label="Total Revenue"
          value={money(totals.revenue)}
          hint={`${filteredShoots.length} filtered shoots`}
          accent="#8B5CF6"
          background="rgba(139,92,246,.14)"
        />
        <StatCard
          icon="received"
          label="Received"
          value={money(totals.received)}
          hint={`${receivedRate}% collection rate`}
          accent="#10B981"
          background="rgba(16,185,129,.14)"
        />
        <StatCard
          icon="remaining"
          label="Remaining"
          value={money(totals.remaining)}
          hint="Outstanding balance"
          accent="#F59E0B"
          background="rgba(245,158,11,.14)"
        />
        <StatCard
          icon="profit"
          label="Net Earnings"
          value={money(totals.net)}
          hint={`${money(totals.expenses)} expenses`}
          accent="#3B82F6"
          background="rgba(59,130,246,.14)"
        />
        <StatCard
          icon="shoots"
          label="Total Shoots"
          value={filteredShoots.length}
          hint={`${filteredShoots.filter((shoot) => shoot.status === 'Completed').length} completed`}
          accent="#EC4899"
          background="rgba(236,72,153,.14)"
        />
        <StatCard
          icon="clients"
          label="Active Clients"
          value={[...totals.clientIds].filter(Boolean).length}
          hint="Within selected filters"
          accent="#06B6D4"
          background="rgba(6,182,212,.14)"
        />
      </div>

      <div className="report-main-grid">
        <Panel
          title="Revenue Trend"
          subtitle="Monthly revenue and net earnings"
          action={
            <div className="report-chart-legend">
              <span><i style={{ background: '#3B82F6' }} />Revenue</span>
              <span><i style={{ background: '#10B981' }} />Net</span>
            </div>
          }
        >
          <div className="report-line-chart">
            {monthlyData.map((item) => (
              <div className="report-month" key={item.month}>
                <div
                  className="report-month-bar"
                  title={`${item.month} revenue: ${money(item.revenue)}`}
                  style={{
                    height: `${Math.max((item.revenue / maxMonthly) * 100, 1)}%`,
                    background: 'linear-gradient(180deg,#60A5FA,#2563EB)'
                  }}
                />
                <div
                  className="report-month-bar"
                  title={`${item.month} net: ${money(item.net)}`}
                  style={{
                    height: `${Math.max((item.net / maxMonthly) * 100, 1)}%`,
                    background: 'linear-gradient(180deg,#34D399,#059669)'
                  }}
                />
                <span className="report-month-label">{item.month}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Revenue by Client" subtitle="Top client contribution">
          <div className="report-donut-wrap">
            <div
              className="report-donut"
              style={{
                background:
                  clientData.length && totalClientRevenue > 0
                    ? `conic-gradient(${clientData
                        .map((item, index) => {
                          const previous = clientData
                            .slice(0, index)
                            .reduce((sum, entry) => sum + entry.revenue, 0);
                          const start = (previous / totalClientRevenue) * 100;
                          const end =
                            ((previous + item.revenue) / totalClientRevenue) * 100;
                          return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
                        })
                        .join(',')})`
                    : theme.border
              }}
            >
              {clientData.map((item, index) => {
                const previous = clientData
                  .slice(0, index)
                  .reduce((sum, entry) => sum + entry.revenue, 0);
                const start = totalClientRevenue
                  ? (previous / totalClientRevenue) * 360
                  : 0;
                const end = totalClientRevenue
                  ? ((previous + item.revenue) / totalClientRevenue) * 360
                  : 0;
                const angle = ((start + end) / 2 - 90) * (Math.PI / 180);
                const radius = 37;
                const left = 50 + Math.cos(angle) * radius;
                const top = 50 + Math.sin(angle) * radius;

                return (
                  <span
                    key={`${item.name}-donut-label`}
                    className="report-donut-label"
                    title={`${item.name} · ${money(item.revenue)}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    {item.name}
                  </span>
                );
              })}

              <div className="report-donut-center">
                <strong>{money(totals.revenue)}</strong>
                <span>Total revenue</span>
              </div>
            </div>
          </div>

          <div className="report-client-list">
            {clientData.map((item, index) => (
              <div className="report-client-row" key={item.name}>
                <div className="report-client-name" title={item.name}>{item.name}</div>
                <div className="report-client-shoots">{item.shoots} shoots</div>
                <div className="report-client-value" title={money(item.revenue)}>{money(item.revenue)}</div>
                <div className="report-progress">
                  <span
                    style={{
                      width: `${totalClientRevenue ? (item.revenue / totalClientRevenue) * 100 : 0}%`,
                      background: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
            {!clientData.length && <div className="report-empty">No client data.</div>}
          </div>
        </Panel>
      </div>

      <div className="report-two-grid">
        <Panel title="Category Performance" subtitle="Revenue, net earnings and shoot volume">
          <div className="report-category-list">
            {categoryData.map((item, index) => (
              <div className="report-category-row" key={item.name}>
                <div className="report-category-name">{item.name}</div>
                <div className="report-category-shoots">{item.shoots} shoots</div>
                <div className="report-category-value">{money(item.revenue)}</div>
                <div className="report-progress">
                  <span
                    style={{
                      width: `${totals.revenue ? (item.revenue / totals.revenue) * 100 : 0}%`,
                      background: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
            {!categoryData.length && <div className="report-empty">No category data.</div>}
          </div>
        </Panel>

        <Panel title="Payment Overview" subtitle="Received versus outstanding payments">
          <div className="report-payment-grid">
            <div
              className="report-donut"
              style={{
                background:
                  totals.revenue > 0
                    ? `conic-gradient(#10B981 0 ${receivedRate}%, #F59E0B ${receivedRate}% 100%)`
                    : theme.border
              }}
            >
              <div className="report-donut-center">
                <strong>{receivedRate}%</strong>
                <span>Received</span>
              </div>
            </div>

            <div className="report-payment-info">
              <div className="report-payment-box">
                <span>Received</span>
                <strong style={{ color: '#10B981' }}>{money(totals.received)}</strong>
              </div>
              <div className="report-payment-box">
                <span>Outstanding</span>
                <strong style={{ color: '#F59E0B' }}>{money(totals.remaining)}</strong>
              </div>
              <div className="report-payment-box">
                <span>Total Expenses</span>
                <strong style={{ color: '#F87171' }}>{money(totals.expenses)}</strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        title="Yearly Performance Overview"
        subtitle="Compare revenue and net earnings across years"
        action={
          <div className="report-chart-legend">
            <span><i style={{ background: '#3B82F6' }} />Revenue</span>
            <span><i style={{ background: '#10B981' }} />Net</span>
          </div>
        }
      >
        <div className="report-year-chart">
          {yearlyData.map((item) => (
            <div className="report-year-group" key={item.year}>
              {bestYear?.year === item.year && (
                <span className="report-best-year" title="Best year">🏆</span>
              )}
              <div
                className="report-year-bar"
                title={`${item.year} revenue: ${money(item.revenue)}`}
                style={{
                  height: `${Math.max((item.revenue / maxYearly) * 100, 2)}%`,
                  background: 'linear-gradient(180deg,#60A5FA,#2563EB)'
                }}
              />
              <div
                className="report-year-bar"
                title={`${item.year} net: ${money(item.net)}`}
                style={{
                  height: `${Math.max((item.net / maxYearly) * 100, 2)}%`,
                  background: 'linear-gradient(180deg,#34D399,#059669)'
                }}
              />
              <span className="report-year-label">{item.year}</span>
            </div>
          ))}
          {!yearlyData.length && <div className="report-empty">No yearly data.</div>}
        </div>
      </Panel>

      <Panel
        title="Business Insights"
        subtitle="Automatic insights generated from your filtered records"
        action={<Icon name="spark" size={18} />}
      >
        <div className="report-insights-grid">
          {insights.map((insight) => (
            <div className="report-insight" key={insight.title}>
              <div className="report-insight-top">
                <span
                  className="report-insight-dot"
                  style={{ color: insight.accent, background: insight.accent }}
                />
                <h4>{insight.title}</h4>
              </div>
              <strong style={{ color: insight.accent }}>{insight.value}</strong>
              <p>{insight.text}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Detailed Report" subtitle="All filtered jobs and financial records">
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Received</th>
                <th>Remaining</th>
                <th>Expense</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {filteredShoots.map((shoot) => (
                <tr key={shoot.id}>
                  <td>{getClientName(shoot, clients)}</td>
                  <td>{shoot.title || 'Untitled Shoot'}</td>
                  <td>{shoot.category || 'Other'}</td>
                  <td>{safeDate(shoot.shoot_date)?.toLocaleDateString('en-GB') || '-'}</td>
                  <td>{shoot.status || '-'}</td>
                  <td>{shoot.payment_status || 'Unpaid'}</td>
                  <td>{money(getTotal(shoot))}</td>
                  <td style={{ color: '#10B981' }}>{money(getReceived(shoot))}</td>
                  <td style={{ color: '#F59E0B' }}>{money(getRemaining(shoot))}</td>
                  <td style={{ color: '#F87171' }}>{money(getExpense(shoot))}</td>
                  <td style={{ color: '#60A5FA' }}>{money(getNet(shoot))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredShoots.length && (
            <div className="report-empty">No shoots found for the selected filters.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
