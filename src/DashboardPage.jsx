import React, { useMemo } from 'react';
import {
  DashboardPanel,
  DashboardStatCard,
  UpcomingShoots,
  MostActiveClients,
  FinancialOverview,
  MonthlyRevenueChart,
  DistributionPanel,
  QuickActions,
  StatisticsPanel,
  RecentGalleries,
  InstagramPanel,
  AiSuggestion,
  money,
  safeDate,
  sameDay,
  getClientId,
  getClientName,
  getDriveLink,
  getShootIncome,
  getShootExpense,
  isCompleted,
  isPlanned
} from './components/dashboard/DashboardComponents';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function DashboardPage({
  shoots = [],
  clients = [],
  setActiveTab = () => {},
  refresh,
  theme
}) {
  const now = useMemo(() => new Date(), []);
  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  );

  const totalRevenue = useMemo(
    () => shoots.reduce((sum, shoot) => sum + getShootIncome(shoot), 0),
    [shoots]
  );

  const totalExpenses = useMemo(
    () => shoots.reduce((sum, shoot) => sum + getShootExpense(shoot), 0),
    [shoots]
  );

  const netProfit = totalRevenue - totalExpenses;

  const pendingPayments = useMemo(
    () =>
      shoots
        .filter((shoot) => {
          const status = String(shoot?.payment_status || '').toLowerCase();
          return ['unpaid', 'pending', 'ödenmedi', 'bekliyor'].includes(status);
        })
        .reduce((sum, shoot) => sum + getShootIncome(shoot), 0),
    [shoots]
  );

  const todayShoots = useMemo(
    () =>
      shoots
        .filter((shoot) => sameDay(safeDate(shoot.shoot_date), now))
        .sort((a, b) =>
          String(a.shoot_time || '').localeCompare(String(b.shoot_time || ''))
        ),
    [shoots, now]
  );

  const upcomingShoots = useMemo(
    () =>
      shoots
        .filter((shoot) => {
          const date = safeDate(shoot.shoot_date);
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          return date && date >= todayStart && !sameDay(date, now);
        })
        .sort((a, b) => safeDate(a.shoot_date) - safeDate(b.shoot_date))
        .slice(0, 5),
    [shoots, now]
  );

  const monthlyRevenue = useMemo(
    () =>
      shoots
        .filter((shoot) => {
          const date = safeDate(shoot.shoot_date);
          return (
            date &&
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth()
          );
        })
        .reduce((sum, shoot) => sum + getShootIncome(shoot), 0),
    [shoots, now]
  );

  const completedShoots = useMemo(
    () => shoots.filter(isCompleted),
    [shoots]
  );

  const plannedShoots = useMemo(
    () => shoots.filter(isPlanned),
    [shoots]
  );

  const topClients = useMemo(() => {
    const stats = new Map();

    shoots.forEach((shoot) => {
      const id = getClientId(shoot);
      if (!id) return;

      const client = clientsById.get(id) || shoot.clients || shoot.client || {};
      const current = stats.get(id) || {
        id,
        name: client.name || 'Client',
        avatar: client.avatar || client.logo || '',
        count: 0,
        revenue: 0
      };

      current.count += 1;
      current.revenue += getShootIncome(shoot);
      stats.set(id, current);
    });

    return [...stats.values()]
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
      .slice(0, 5);
  }, [shoots, clientsById]);

  const galleryShoots = useMemo(
    () =>
      completedShoots
        .filter((shoot) => getDriveLink(shoot))
        .sort((a, b) => safeDate(b.shoot_date) - safeDate(a.shoot_date))
        .slice(0, 6),
    [completedShoots]
  );

  const categoryData = useMemo(() => {
    const counts = {};

    shoots.forEach((shoot) => {
      const key = shoot.category || shoot.shoot_type || 'Other';
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [shoots]);

  const monthlyChart = useMemo(
    () =>
      MONTHS.map((month, index) => {
        const monthShoots = shoots.filter((shoot) => {
          const date = safeDate(shoot.shoot_date);
          return (
            date &&
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === index
          );
        });

        const income = monthShoots.reduce(
          (sum, shoot) => sum + getShootIncome(shoot),
          0
        );
        const expenses = monthShoots.reduce(
          (sum, shoot) => sum + getShootExpense(shoot),
          0
        );

        return {
          month,
          short: SHORT_MONTHS[index],
          income,
          expenses,
          net: income - expenses
        };
      }),
    [shoots, now]
  );

  const statusData = [
    { label: 'Completed', value: completedShoots.length },
    { label: 'Scheduled', value: plannedShoots.length },
    {
      label: 'Other',
      value: Math.max(
        0,
        shoots.length - completedShoots.length - plannedShoots.length
      )
    }
  ];

  const openWhatsAppBusiness = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      window.location.href =
        'intent://send#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end';
      return;
    }

    window.open('https://wa.me/', '_blank', 'noopener,noreferrer');
  };

  const quickActions = [
    {
      label: 'New Shoot',
      icon: 'calendar',
      tone: '#367CFF',
      action: () => setActiveTab('calendar')
    },
    {
      label: 'New Client',
      icon: 'user',
      tone: '#14D89A',
      action: () => setActiveTab('clients')
    },
    {
      label: 'Reports',
      icon: 'chart',
      tone: '#A55CFF',
      action: () => setActiveTab('reports')
    },
    {
      label: 'WhatsApp Business',
      icon: 'message',
      tone: '#10D784',
      action: openWhatsAppBusiness
    },
    {
      label: 'Email',
      icon: 'mail',
      tone: '#8B5CF6',
      action: () => {
        window.location.href = 'mailto:';
      }
    },
    {
      label: 'Instagram',
      icon: 'instagram',
      tone: '#F15A9B',
      action: () =>
        window.open(
          'https://www.instagram.com/ramazanesenphotography/',
          '_blank',
          'noopener,noreferrer'
        )
    }
  ];

  return (
    <div
      className="sf-dashboard"
      style={{
        color: theme.textMain,
        '--sf-muted': theme.textMuted,
        '--sf-border': theme.border,
        '--sf-bg': theme.bg,
        '--sf-card': theme.cardBg,
        '--sf-text': theme.textMain
      }}
    >
      <style>{`
        .sf-dashboard {
          display:flex;
          flex-direction:column;
          gap:16px;
          width:100%;
          min-width:0;
          overflow-x:hidden;
        }

        .sf-dashboard * {
          box-sizing:border-box;
          min-width:0;
        }

        .sf-stats-grid {
          display:grid;
          grid-template-columns:repeat(5,minmax(0,1fr));
          gap:12px;
        }

        .sf-pair-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
          align-items:stretch;
        }

        .sf-pair-grid > section {
          height:100%;
        }

        .sf-finance-grid {
          display:grid;
          grid-template-columns:minmax(250px,.9fr) minmax(0,1.1fr);
          gap:16px;
        }

        .sf-media-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
          align-items:stretch;
        }

        .sf-media-grid > section {
          height:100%;
        }

        @media (max-width:1500px) {
          .sf-stats-grid {
            grid-template-columns:repeat(3,minmax(0,1fr));
          }
        }

        @media (max-width:1050px) {
          .sf-stats-grid {
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .sf-pair-grid,
          .sf-finance-grid,
          .sf-media-grid {
            grid-template-columns:1fr;
          }
        }

        @media (max-width:560px) {
          .sf-stats-grid {
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="sf-stats-grid">
        <DashboardStatCard
          theme={theme}
          label="Shoots Today"
          value={todayShoots.length}
          helper="View schedule"
          tone="#367CFF"
          icon="calendar"
          onClick={() => setActiveTab('calendar')}
        />
        <DashboardStatCard
          theme={theme}
          label="Monthly Revenue"
          value={money(monthlyRevenue)}
          helper={`${shoots.length} records`}
          tone="#14D89A"
          icon="trend"
        />
        <DashboardStatCard
          theme={theme}
          label="Net Profit"
          value={money(netProfit)}
          helper={`Expenses: ${money(totalExpenses)}`}
          tone="#FF9D2E"
          icon="profit"
        />
        <DashboardStatCard
          theme={theme}
          label="Pending Payments"
          value={money(pendingPayments)}
          helper="Unpaid shoots"
          tone="#A55CFF"
          icon="wallet"
        />
        <DashboardStatCard
          theme={theme}
          label="Upcoming Shoots"
          value={plannedShoots.length || upcomingShoots.length}
          helper="Scheduled shoots"
          tone="#4A91FF"
          icon="clock"
        />
      </div>

      <div className="sf-pair-grid">
        <UpcomingShoots
          theme={theme}
          shoots={upcomingShoots}
          clientsById={clientsById}
          onViewAll={() => setActiveTab('calendar')}
        />
        <MostActiveClients
          theme={theme}
          clients={topClients}
          onViewAll={() => setActiveTab('clients')}
        />
      </div>

      <div className="sf-finance-grid">
        <FinancialOverview
          theme={theme}
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          pendingPayments={pendingPayments}
        />
        <MonthlyRevenueChart
          theme={theme}
          data={monthlyChart}
          currentMonth={now.getMonth()}
        />
      </div>

      <div className="sf-pair-grid">
        <DistributionPanel
          theme={theme}
          title="Shoot Type Distribution"
          items={categoryData}
          total={shoots.length}
          centerLabel="Shoots"
        />
        <DistributionPanel
          theme={theme}
          title="Job Status"
          items={statusData}
          total={shoots.length}
          centerLabel="Jobs"
        />
      </div>

      <div className="sf-pair-grid">
        <QuickActions theme={theme} actions={quickActions} />
        <StatisticsPanel
          theme={theme}
          clientsCount={clients.length}
          shootsCount={shoots.length}
          completedCount={completedShoots.length}
          averageShoot={shoots.length ? totalRevenue / shoots.length : 0}
          onViewAll={() => setActiveTab('reports')}
        />
      </div>

      <div className="sf-media-grid">
        <RecentGalleries
          theme={theme}
          shoots={galleryShoots}
          clientsById={clientsById}
        />
        <InstagramPanel theme={theme} />
      </div>

      <AiSuggestion
        theme={theme}
        todayShootsCount={todayShoots.length}
      />
    </div>
  );
}
