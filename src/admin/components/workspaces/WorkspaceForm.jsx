export default function WorkspaceForm({ form, onChange, onSubmit, saving, mode }) {
  return (
    <form className="admin-workspace-form" onSubmit={onSubmit}>
      <label>
        Name
        <input value={form.name || ''} onChange={(event) => onChange('name', event.target.value)} required />
      </label>
      <label>
        Slug
        <input value={form.slug || ''} onChange={(event) => onChange('slug', event.target.value)} required />
      </label>
      <label>
        Description
        <textarea value={form.description || ''} onChange={(event) => onChange('description', event.target.value)} rows={4} />
      </label>
      <label>
        Status
        <select value={form.is_active ? 'active' : 'inactive'} onChange={(event) => onChange('is_active', event.target.value === 'active')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <div className="admin-drawer-actions">
        <button type="submit" className="admin-action-btn approve" disabled={saving}>
          {saving ? 'Saving…' : mode === 'create' ? 'Create workspace' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
