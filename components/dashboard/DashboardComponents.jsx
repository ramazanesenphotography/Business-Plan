import React from 'react';

export const palette = [
  '#367CFF',
  '#14D89A',
  '#FF9D2E',
  '#A55CFF',
  '#F15A9B'
];

export const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

export const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getClientId = (shoot) =>
  shoot?.client_id ?? shoot?.clients?.id ?? shoot?.client?.id ?? null;

export const getClientName = (shoot, clientsById) => {
  const nestedName = shoot?.clients?.name || shoot?.client?.name;
  if (nestedName) return nestedName;
  const id = getClientId(shoot);
  return clientsById.get(id)?.name || 'Client';
};

export const getDriveLink = (shoot) =>
  shoot?.drive_link ||
  shoot?.gallery_link ||
  shoot?.delivery_link ||
  shoot?.google_drive_link ||
  shoot?.final_link ||
  '';

export const getShootIncome = (shoot) =>
  Number(shoot?.gross_income ?? shoot?.net_profit ?? shoot?.price ?? 0) || 0;

export const getShootExpense = (shoot) =>
  Number(shoot?.total_expense ?? shoot?.expense ?? 0) || 0;

export const isCompleted = (shoot) => {
  const value = String(shoot?.status || '').toLowerCase();
  return [
    'completed',
    'complete',
    'done',
    'finished',
    'tamamlandı',
    'tamamlandi',
    'bitti'
  ].includes(value);
};

export const isPlanned = (shoot) => {
  const value = String(shoot?.status || '').toLowerCase();
  return [
    'planned',
    'planlandı',
    'planlandi',
    'upcoming',
    'scheduled'
  ].includes(value);
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'SF';

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  const icons = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    trend: <path d="m3 17 6-6 4 4 8-9M15 6h6v6" />,
    profit: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v12M16 9.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <path d="M16 11h6v4h-6a2 2 0 0 1 0-4Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
      </>
    ),
    message: (
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.2 9.2 0 0 1-3.8-.8L3 21l1.9-5a8.5 8.5 0 1 1 16.1-4.5Z" />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    external: (
      <>
        <path d="M14 5h5v5M10 14 19 5" />
        <path d="M19 13v6H5V5h6" />
      </>
    )
  };

  return <svg {...common}>{icons[name]}</svg>;
}

export function DashboardPanel({ theme, children, style = {}, className = '' }) {
  return (
    <section
      className={className}
      style={{
        background: `linear-gradient(145deg, ${theme.cardBg}, ${theme.bg})`,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        boxShadow: '0 18px 45px rgba(0,0,0,.14)',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </section>
  );
}

function MiniIcon({ icon, tone }) {
  return (
    <span
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        display: 'grid',
        placeItems: 'center',
        background: `${tone}18`,
        border: `1px solid ${tone}35`,
        color: tone,
        flexShrink: 0
      }}
    >
      <Icon name={icon} size={18} />
    </span>
  );
}

function formatStatValueParts(value) {
  const text = String(value ?? '');
  const match = text.match(/^([A-Z]{3}|₺|\$|€)\s*(.*)$/);

  if (!match) return { currency: '', amount: text };

  return {
    currency: match[1],
    amount: match[2]
  };
}

export function DashboardStatCard({
  theme,
  label,
  value,
  helper,
  tone,
  icon,
  onClick
}) {
  const statValue = formatStatValueParts(value);

  return (
    <DashboardPanel
      theme={theme}
      style={{
        padding: 'clamp(12px,1.1vw,16px)',
        minHeight: 112,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          right: -28,
          top: -26,
          borderRadius: '50%',
          background: `${tone}12`
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'flex-start'
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: theme.textMuted,
              fontSize: 'clamp(10px,.85vw,12px)',
              marginBottom: 8,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {label}
          </div>
          <div
            style={{
              color: tone,
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
              maxWidth: '100%',
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-.25px',
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums'
            }}
            title={String(value)}
          >
            {statValue.currency ? (
              <span
                style={{
                  flex: '0 0 auto',
                  fontSize: 'clamp(9px,.72vw,12px)',
                  fontWeight: 750,
                  opacity: 0.86
                }}
              >
                {statValue.currency}
              </span>
            ) : null}

            <span
              style={{
                minWidth: 0,
                fontSize: 'clamp(15px,1.2vw,20px)',
                overflow: 'visible',
                textOverflow: 'clip'
              }}
            >
              {statValue.amount}
            </span>
          </div>
        </div>
        <MiniIcon icon={icon} tone={tone} />
      </div>
      <button
        type="button"
        onClick={onClick}
        style={{
          border: 0,
          padding: 0,
          background: 'transparent',
          color: onClick ? tone : theme.textMuted,
          fontSize: 'clamp(9px,.8vw,11px)',
          marginTop: 9,
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        {helper}
      </button>
    </DashboardPanel>
  );
}

function PanelHeader({ theme, title, subtitle, action, actionLabel = 'View All' }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 15
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 'clamp(15px,1.3vw,18px)',
            lineHeight: 1.25
          }}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            style={{
              margin: '5px 0 0',
              color: theme.textMuted,
              fontSize: 'clamp(9px,.8vw,11px)',
              lineHeight: 1.45
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <button
          type="button"
          onClick={action}
          style={{
            border: 0,
            background: 'transparent',
            color: '#367CFF',
            cursor: 'pointer',
            fontSize: 11,
            whiteSpace: 'nowrap'
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function UpcomingShoots({
  theme,
  shoots,
  clientsById,
  onViewAll
}) {
  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader
        theme={theme}
        title="Upcoming Shoots"
        action={onViewAll}
      />
      {shoots.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shoots.map((shoot, index) => {
            const date = safeDate(shoot.shoot_date);

            return (
              <div
                key={shoot.id || index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(58px,78px) minmax(0,1fr) auto',
                  gap: 'clamp(8px,1vw,14px)',
                  alignItems: 'center',
                  padding: 'clamp(11px,1.15vw,14px)',
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg
                }}
              >
                <div
                  style={{
                    color: palette[index % palette.length],
                    fontWeight: 800,
                    fontSize: 'clamp(10px,.9vw,12px)',
                    lineHeight: 1.35
                  }}
                >
                  {date
                    ? `${String(date.getDate()).padStart(2, '0')} ${date
                        .toLocaleDateString('en-US', { month: 'short' })
                        .toUpperCase()}`
                    : '--'}
                  <div
                    style={{
                      color: theme.textMuted,
                      fontWeight: 500,
                      fontSize: 10
                    }}
                  >
                    {date?.getFullYear()}
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: 'clamp(10px,.95vw,13px)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {shoot.title || getClientName(shoot, clientsById)}
                  </strong>
                  <div
                    style={{
                      color: theme.textMuted,
                      fontSize: 'clamp(8px,.78vw,10px)',
                      marginTop: 5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {shoot.location || 'No location added'}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    fontSize: 'clamp(9px,.85vw,11px)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <strong>{shoot.shoot_time || '--:--'}</strong>
                  <div
                    style={{
                      marginTop: 5,
                      color: '#7EAEFF',
                      fontSize: 9
                    }}
                  >
                    SCHEDULED
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: 30,
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: 12
          }}
        >
          No upcoming shoots.
        </div>
      )}
    </DashboardPanel>
  );
}

export function MostActiveClients({ theme, clients, onViewAll }) {
  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader
        theme={theme}
        title="Most Active Clients"
        subtitle="Automatically ranked by number of shoots."
        action={onViewAll}
      />
      {clients.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {clients.map((client, index) => (
            <div
              key={client.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: 10,
                borderRadius: 13,
                border: `1px solid ${theme.border}`,
                background: theme.bg
              }}
            >
              {client.avatar ? (
                <img
                  src={client.avatar}
                  alt={client.name}
                  style={{
                    width: 42,
                    height: 42,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: `2px solid ${palette[index % palette.length]}`,
                    flexShrink: 0
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: `${palette[index % palette.length]}22`,
                    border: `1px solid ${palette[index % palette.length]}66`,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    color: palette[index % palette.length],
                    flexShrink: 0
                  }}
                >
                  {getInitials(client.name)}
                </div>
              )}

              <div style={{ minWidth: 0, flex: 1 }}>
                <strong
                  style={{
                    fontSize: 12,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {index + 1}. {client.name}
                </strong>
                <span
                  style={{
                    color: theme.textMuted,
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block'
                  }}
                >
                  {client.count} shoots · {money(client.revenue)}
                </span>
              </div>

              <span
                style={{
                  color: '#14D89A',
                  fontSize: 9,
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}
              >
                TOP {index + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            color: theme.textMuted,
            fontSize: 12,
            textAlign: 'center',
            padding: 25
          }}
        >
          No client activity data yet.
        </div>
      )}
    </DashboardPanel>
  );
}

export function FinancialOverview({
  theme,
  totalRevenue,
  totalExpenses,
  netProfit,
  pendingPayments
}) {
  const items = [
    ['Total Revenue', money(totalRevenue), '#14D89A'],
    ['Total Expenses', money(totalExpenses), '#FF6B6B'],
    ['Net Profit', money(netProfit), '#FFB020'],
    ['Pending Payments', money(pendingPayments), '#A55CFF']
  ];

  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader theme={theme} title="Financial Overview" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
          gap: 14
        }}
      >
        {items.map(([label, value, tone]) => (
          <div
            key={label}
            style={{
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                color: theme.textMuted,
                fontSize: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {label}
            </div>
            <strong
              title={value}
              style={{
                display: 'block',
                color: tone,
                marginTop: 7,
                fontSize: 'clamp(13px,1.15vw,17px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

export function MonthlyRevenueChart({ theme, data, currentMonth }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader theme={theme} title="Monthly Revenue" />
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(12,minmax(12px,1fr))',
          alignItems: 'end',
          gap: 'clamp(3px,.5vw,7px)',
          height: 'clamp(130px,15vw,170px)'
        }}
      >
        {data.map((item, index) => (
          <div
            key={item.month}
            title={`${item.month}: ${money(item.value)}`}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 7,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 'clamp(8px,1.15vw,18px)',
                height: Math.max(6, (item.value / maxValue) * 118),
                borderRadius: '7px 7px 3px 3px',
                background:
                  index === currentMonth
                    ? 'linear-gradient(180deg,#5CA0FF,#367CFF)'
                    : 'linear-gradient(180deg,rgba(92,160,255,.58),rgba(54,124,255,.18))'
              }}
            />
            <span
              style={{
                color: theme.textMuted,
                fontSize: 'clamp(7px,.65vw,9px)',
                whiteSpace: 'nowrap'
              }}
            >
              {item.short}
            </span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

function Donut({ items, total, centerLabel, theme }) {
  let offset = 0;

  const stops = items
    .filter((item) => item.value > 0)
    .map((item, index) => {
      const start = offset;
      const percentage = total ? (item.value / total) * 100 : 0;
      offset += percentage;
      return `${palette[index % palette.length]} ${start}% ${offset}%`;
    })
    .join(', ');

  return (
    <div
      style={{
        width: 'clamp(108px,9vw,128px)',
        aspectRatio: '1',
        borderRadius: '50%',
        background: stops ? `conic-gradient(${stops})` : theme.border,
        position: 'relative',
        flexShrink: 0
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '19%',
          background: theme.cardBg,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          alignContent: 'center',
          border: `1px solid ${theme.border}`
        }}
      >
        <strong
          style={{
            color: theme.textMain,
            fontSize: 'clamp(17px,1.5vw,22px)',
            lineHeight: 1
          }}
        >
          {total}
        </strong>
        <span
          style={{
            color: theme.textMuted,
            fontSize: 9,
            marginTop: 4
          }}
        >
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

export function DistributionPanel({
  theme,
  title,
  items,
  total,
  centerLabel
}) {
  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader theme={theme} title={title} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(108px,128px) minmax(0,1fr)',
          alignItems: 'center',
          gap: 'clamp(14px,1.7vw,22px)'
        }}
      >
        <Donut
          items={items}
          total={total}
          centerLabel={centerLabel}
          theme={theme}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto',
                gap: 8,
                alignItems: 'center',
                fontSize: 'clamp(9px,.8vw,11px)'
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                <i
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: palette[index % palette.length],
                    flexShrink: 0
                  }}
                />
                {item.label}
              </span>
              <strong>
                {total ? Math.round((item.value / total) * 100) : 0}%
              </strong>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}

export function QuickActions({ theme, actions }) {
  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader theme={theme} title="Quick Actions" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 10
        }}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.action}
            style={{
              minHeight: 84,
              borderRadius: 13,
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              color: theme.textMain,
              cursor: 'pointer',
              padding: 9,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <MiniIcon icon={action.icon} tone={action.tone} />
            <span
              style={{
                fontSize: 'clamp(8px,.75vw,10px)',
                textAlign: 'center',
                lineHeight: 1.25,
                maxWidth: '100%'
              }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </DashboardPanel>
  );
}

export function StatisticsPanel({
  theme,
  clientsCount,
  shootsCount,
  completedCount,
  averageShoot,
  onViewAll
}) {
  const items = [
    ['Total Clients', clientsCount],
    ['Total Shoots', shootsCount],
    ['Completed', completedCount],
    ['Average Shoot', money(averageShoot)]
  ];

  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader
        theme={theme}
        title="Statistics"
        action={onViewAll}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
          gap: 14
        }}
      >
        {items.map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: 13,
              borderRadius: 13,
              border: `1px solid ${theme.border}`,
              overflow: 'hidden'
            }}
          >
            <span
              style={{
                color: theme.textMuted,
                fontSize: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
            >
              {label}
            </span>
            <strong
              title={String(value)}
              style={{
                display: 'block',
                marginTop: 6,
                fontSize: 'clamp(14px,1.25vw,18px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

export function RecentGalleries({ theme, shoots, clientsById }) {
  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader
        theme={theme}
        title="Recent Galleries"
        subtitle="Drive links added to completed jobs."
      />
      {shoots.length ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
            gap: 10
          }}
        >
          {shoots.map((shoot, index) => {
            const date = safeDate(shoot.shoot_date);
            const link = getDriveLink(shoot);

            return (
              <button
                key={shoot.id || index}
                type="button"
                onClick={() =>
                  window.open(link, '_blank', 'noopener,noreferrer')
                }
                style={{
                  width: '100%',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.textMain,
                  padding: 10,
                  borderRadius: 13,
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '56px minmax(0,1fr) auto',
                  gap: 10,
                  alignItems: 'center',
                  textAlign: 'left',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 42,
                    borderRadius: 9,
                    overflow: 'hidden',
                    background: `${palette[index % palette.length]}22`,
                    display: 'grid',
                    placeItems: 'center',
                    color: palette[index % palette.length],
                    flexShrink: 0
                  }}
                >
                  {shoot.cover_image || shoot.image_url ? (
                    <img
                      src={shoot.cover_image || shoot.image_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Icon name="chart" size={19} />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {shoot.title || getClientName(shoot, clientsById)}
                  </strong>
                  <span
                    style={{
                      color: theme.textMuted,
                      fontSize: 9,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      marginTop: 4
                    }}
                  >
                    {date
                      ? date.toLocaleDateString('en-US')
                      : 'No date'}{' '}
                    · Drive gallery
                  </span>
                </div>

                <span style={{ color: '#367CFF' }}>
                  <Icon name="external" size={16} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: 24,
            borderRadius: 13,
            border: `1px dashed ${theme.border}`,
            color: theme.textMuted,
            fontSize: 11,
            lineHeight: 1.6,
            textAlign: 'center'
          }}
        >
          No completed jobs with Drive links yet.
        </div>
      )}
    </DashboardPanel>
  );
}

const instagramImages = [
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=500&q=80'
];

export function InstagramPanel({ theme }) {
  return (
    <DashboardPanel
      theme={theme}
      style={{ padding: 'clamp(16px,1.6vw,20px)' }}
    >
      <PanelHeader
        theme={theme}
        title="Instagram"
        subtitle="@ramazanesenphotography"
        action={() =>
          window.open(
            'https://www.instagram.com/ramazanesenphotography/',
            '_blank',
            'noopener,noreferrer'
          )
        }
        actionLabel="Open Profile"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 8
        }}
      >
        {instagramImages.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() =>
              window.open(
                'https://www.instagram.com/ramazanesenphotography/',
                '_blank',
                'noopener,noreferrer'
              )
            }
            style={{
              padding: 0,
              border: 0,
              borderRadius: 11,
              overflow: 'hidden',
              cursor: 'pointer',
              aspectRatio: '1',
              background: theme.bg
            }}
          >
            <img
              src={src}
              alt={`Instagram preview ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </button>
        ))}
      </div>
    </DashboardPanel>
  );
}

export function AiSuggestion({ theme, todayShootsCount }) {
  return (
    <DashboardPanel
      theme={theme}
      style={{
        padding: 'clamp(17px,1.7vw,21px)',
        borderColor: 'rgba(105,92,255,.45)',
        background:
          'linear-gradient(135deg,rgba(37,38,90,.48),rgba(13,18,34,.9))'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <MiniIcon icon="trend" tone="#6C63FF" />
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 'clamp(15px,1.3vw,17px)'
            }}
          >
            AI Assistant Suggestion
          </h3>
          <p
            style={{
              color: theme.textMuted,
              fontSize: 'clamp(10px,.85vw,12px)',
              lineHeight: 1.65,
              margin: '9px 0 0'
            }}
          >
            {todayShootsCount === 0
              ? 'Your schedule is clear today. Use the time to update your portfolio, check your equipment, or reach out to new clients.'
              : `You have ${todayShootsCount} shoots today. Remember to check your gear and delivery checklist before the first session.`}
          </p>
        </div>
      </div>
    </DashboardPanel>
  );
}
