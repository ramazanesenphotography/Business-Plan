export default function UserStatsCards({ summary }) {
  const cards = [
    { label: 'Total Users', value: summary.total },
    { label: 'Pending', value: summary.pending },
    { label: 'Approved', value: summary.approved },
    { label: 'Suspended', value: summary.suspended }
  ];

  return (
    <div className="admin-summary-grid">
      {cards.map((card) => (
        <div className="admin-summary-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  );
}
