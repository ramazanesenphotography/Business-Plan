export default function UserSearch({ value, onChange }) {
  return (
    <div className="admin-search-box">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name or email"
      />
    </div>
  );
}
