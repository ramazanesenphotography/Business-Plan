const STATUS_FILTERS = ['all', 'pending', 'approved', 'suspended'];

export default function UserFilters({ filter, onChange }) {
  return (
    <div className="admin-filter-row">
      {STATUS_FILTERS.map((value) => (
        <button
          key={value}
          className={filter === value ? 'active' : ''}
          onClick={() => onChange(value)}
        >
          {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
        </button>
      ))}
    </div>
  );
}
