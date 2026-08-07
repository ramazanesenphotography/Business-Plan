import React, { useEffect, useMemo, useState } from 'react';

const CLIENT_EMPTY = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  avatar: ''
};

const SHOOT_EMPTY = {
  title: '',
  category: 'Sports',
  shoot_date: '',
  location: '',
  status: 'Planned',
  payment_status: 'Unpaid',
  gross_income: 0,
  paid_amount: 0,
  remaining_amount: 0,
  notes: '',
  drive_link: '',
  gallery_link: '',
  invoice_link: '',
  contract_link: ''
};

const STATUS_OPTIONS = [
  'Planned',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled'
];

const PAYMENT_OPTIONS = [
  'Unpaid',
  'Deposit Received',
  'Partial Payment',
  'Paid',
  'Refunded'
];

function money(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = safeDate(value);
  if (!date) return 'No date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(value) {
  const date = safeDate(value);
  if (!date) return '--:--';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function toDateTimeLocal(value) {
  const date = safeDate(value);
  if (!date) return '';

  const pad = (number) => String(number).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
}

function normalizePhone(phone = '') {
  return String(phone).replace(/[^\d+]/g, '');
}

function statusStyle(status) {
  const map = {
    Planned: ['#60A5FA', 'rgba(59,130,246,.13)', 'rgba(59,130,246,.3)'],
    Confirmed: ['#34D399', 'rgba(52,211,153,.13)', 'rgba(52,211,153,.3)'],
    'In Progress': ['#FBBF24', 'rgba(251,191,36,.13)', 'rgba(251,191,36,.3)'],
    Completed: ['#22C55E', 'rgba(34,197,94,.14)', 'rgba(34,197,94,.3)'],
    Cancelled: ['#F87171', 'rgba(248,113,113,.13)', 'rgba(248,113,113,.3)']
  };

  return map[status] || map.Planned;
}

function paymentStyle(status) {
  const map = {
    Unpaid: ['#F87171', 'rgba(248,113,113,.13)', 'rgba(248,113,113,.3)'],
    'Deposit Received': ['#60A5FA', 'rgba(59,130,246,.13)', 'rgba(59,130,246,.3)'],
    'Partial Payment': ['#FBBF24', 'rgba(251,191,36,.13)', 'rgba(251,191,36,.3)'],
    Paid: ['#34D399', 'rgba(52,211,153,.13)', 'rgba(52,211,153,.3)'],
    Refunded: ['#C084FC', 'rgba(192,132,252,.13)', 'rgba(192,132,252,.3)']
  };

  return map[status] || map.Unpaid;
}

function Icon({ name, size = 17 }) {
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
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    phone: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.2A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8.5 8.5c.5 3 2 4.5 5 5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />
  };

  return <svg {...common}>{icons[name]}</svg>;
}

function Avatar({ client, size = 46 }) {
  if (client?.avatar) {
    return (
      <img
        src={client.avatar}
        alt={client.name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #3B82F6',
          flex: `0 0 ${size}px`
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(145deg,#2563EB,#1D4ED8)',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: Math.max(13, size * 0.28),
        flex: `0 0 ${size}px`
      }}
    >
      {initials(client?.name)}
    </div>
  );
}

export default function ClientsPage({
  clients = [],
  shoots = [],
  refresh = () => {},
  theme,
  supabase
}) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [clientModalMode, setClientModalMode] = useState(null);
  const [shootModalOpen, setShootModalOpen] = useState(false);
  const [editingShootId, setEditingShootId] = useState(null);
  const [selectedHistoryShoot, setSelectedHistoryShoot] = useState(null);
  const [clientForm, setClientForm] = useState(CLIENT_EMPTY);
  const [shootForm, setShootForm] = useState(SHOOT_EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clients.length) {
      setSelectedClientId('');
      return;
    }

    if (!clients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const selectedClient =
    clients.find((client) => client.id === selectedClientId) || null;

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      if (!query) return true;

      return [
        client.name,
        client.phone,
        client.email,
        client.address
      ].some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [clients, searchTerm]);

  const clientShoots = useMemo(
    () =>
      shoots
        .filter((shoot) => shoot.client_id === selectedClient?.id)
        .sort((a, b) => {
          const first = safeDate(a.shoot_date)?.getTime() || 0;
          const second = safeDate(b.shoot_date)?.getTime() || 0;
          return second - first;
        }),
    [shoots, selectedClient]
  );

  const stats = useMemo(() => {
    return clientShoots.reduce(
      (result, shoot) => {
        const total = Number(shoot.gross_income || 0);
        const paid =
          shoot.payment_status === 'Paid'
            ? total
            : Number(shoot.paid_amount || 0);
        const remaining = Math.max(
          Number(shoot.remaining_amount ?? total - paid) || 0,
          0
        );
        const expenses = Number(shoot.total_expense || 0);
        const net = Number(shoot.net_profit ?? total - expenses) || 0;

        result.revenue += total;
        result.received += paid;
        result.remaining += remaining;
        result.expenses += expenses;
        result.net += net;

        return result;
      },
      {
        revenue: 0,
        received: 0,
        remaining: 0,
        expenses: 0,
        net: 0
      }
    );
  }, [clientShoots]);

  const driveFiles = useMemo(
    () =>
      clientShoots.filter(
        (shoot) =>
          shoot.drive_link ||
          shoot.gallery_link ||
          shoot.invoice_link ||
          shoot.contract_link
      ),
    [clientShoots]
  );

  function openNewClient() {
    setClientForm(CLIENT_EMPTY);
    setClientModalMode('create');
  }

  function openEditClient() {
    if (!selectedClient) return;

    setClientForm({
      name: selectedClient.name || '',
      phone: selectedClient.phone || '',
      email: selectedClient.email || '',
      address: selectedClient.address || '',
      notes: selectedClient.notes || '',
      avatar: selectedClient.avatar || ''
    });
    setClientModalMode('edit');
  }

  function closeClientModal() {
    setClientModalMode(null);
    setClientForm(CLIENT_EMPTY);
  }

  function openNewShoot() {
    if (!selectedClient) return;

    setEditingShootId(null);
    setShootForm(SHOOT_EMPTY);
    setShootModalOpen(true);
  }

  function openEditHistoryShoot(shoot) {
    if (!shoot) return;

    setEditingShootId(shoot.id);
    setShootForm({
      title: shoot.title || '',
      category: shoot.category || 'Sports',
      shoot_date: toDateTimeLocal(shoot.shoot_date),
      location: shoot.location || '',
      status: shoot.status || 'Planned',
      payment_status: shoot.payment_status || 'Unpaid',
      gross_income: Number(shoot.gross_income || 0),
      paid_amount:
        shoot.payment_status === 'Paid'
          ? Number(shoot.gross_income || 0)
          : Number(shoot.paid_amount || 0),
      remaining_amount: Math.max(
        Number(
          shoot.remaining_amount ??
            Number(shoot.gross_income || 0) - Number(shoot.paid_amount || 0)
        ) || 0,
        0
      ),
      notes: shoot.notes || '',
      drive_link: shoot.drive_link || '',
      gallery_link: shoot.gallery_link || '',
      invoice_link: shoot.invoice_link || '',
      contract_link: shoot.contract_link || ''
    });
    setSelectedHistoryShoot(null);
    setShootModalOpen(true);
  }

  function closeShootModal() {
    setShootModalOpen(false);
    setEditingShootId(null);
    setShootForm(SHOOT_EMPTY);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const image = new Image();
      image.src = readerEvent.target.result;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const maximumWidth = 320;
        const ratio = Math.min(maximumWidth / image.width, 1);

        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        setClientForm((current) => ({
          ...current,
          avatar: canvas.toDataURL('image/jpeg', 0.82)
        }));
      };
    };

    reader.readAsDataURL(file);
  }

  async function saveClient(event) {
    event.preventDefault();
    if (!supabase) return;

    setSaving(true);

    const query =
      clientModalMode === 'edit' && selectedClient
        ? supabase.from('clients').update(clientForm).eq('id', selectedClient.id)
        : supabase.from('clients').insert([clientForm]);

    const { error } = await query;

    setSaving(false);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    closeClientModal();
    await refresh();
  }

  async function deleteClient() {
    if (!selectedClient || !supabase) return;

    const approved = window.confirm(
      `Delete "${selectedClient.name}"? Related shoots may also be deleted depending on your database settings.`
    );

    if (!approved) return;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', selectedClient.id);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setSelectedClientId('');
    await refresh();
  }

  async function saveShoot(event) {
    event.preventDefault();
    if (!selectedClient || !supabase) return;

    const grossIncome = Number(shootForm.gross_income || 0);
    const paidAmount = Math.max(
      0,
      Math.min(Number(shootForm.paid_amount || 0), grossIncome)
    );
    const remainingAmount = Math.max(grossIncome - paidAmount, 0);

    let paymentStatus = shootForm.payment_status;

    if (grossIncome > 0 && paidAmount >= grossIncome) {
      paymentStatus = 'Paid';
    } else if (paidAmount > 0 && paymentStatus === 'Unpaid') {
      paymentStatus = 'Partial Payment';
    } else if (paidAmount === 0 && paymentStatus !== 'Refunded') {
      paymentStatus = 'Unpaid';
    }

    const payload = {
      client_id: selectedClient.id,
      title: shootForm.title,
      category: shootForm.category,
      shoot_date: shootForm.shoot_date,
      location: shootForm.location,
      status: shootForm.status,
      payment_status: paymentStatus,
      gross_income: grossIncome,
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      notes: shootForm.notes,
      drive_link: shootForm.drive_link || null,
      gallery_link: shootForm.gallery_link || null,
      invoice_link: shootForm.invoice_link || null,
      contract_link: shootForm.contract_link || null,
      net_profit: grossIncome - Number(shootForm.total_expense || 0)
    };

    setSaving(true);

    const query = editingShootId
      ? supabase.from('shoots').update(payload).eq('id', editingShootId)
      : supabase.from('shoots').insert([
          {
            ...payload,
            expenses: [],
            total_expense: 0,
            net_profit: grossIncome
          }
        ]);

    const { error } = await query;

    setSaving(false);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    closeShootModal();
    setActiveTab('shoots');
    await refresh();
  }

  function openWhatsApp() {
    const phone = normalizePhone(selectedClient?.phone);
    if (!phone) return;

    window.open(`https://wa.me/${phone.replace(/^\+/, '')}`, '_blank');
  }

  function callClient() {
    const phone = normalizePhone(selectedClient?.phone);
    if (!phone) return;

    window.location.href = `tel:${phone}`;
  }

  const tabs = [
    ['overview', 'Overview'],
    ['shoots', `Shoots (${clientShoots.length})`],
    ['payments', 'Payments'],
    ['notes', 'Notes'],
    ['files', 'Files']
  ];

  return (
    <div className="clients-page">
      <style>{`
        .clients-page {
          width:100%;
          max-width:100%;
          min-width:0;
          display:grid;
          grid-template-columns:minmax(240px,290px) minmax(0,1fr);
          gap:14px;
          height:calc(100vh - 132px);
          overflow:hidden;
        }

        .clients-page * {
          box-sizing:border-box;
          min-width:0;
        }

        .clients-panel {
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          border-radius:20px;
        }

        .clients-sidebar {
          padding:14px;
          display:flex;
          flex-direction:column;
          overflow:hidden;
        }

        .clients-search-row {
          display:flex;
          gap:8px;
          margin-bottom:12px;
        }

        .clients-search-wrap {
          position:relative;
          flex:1;
        }

        .clients-search-wrap svg {
          position:absolute;
          left:11px;
          top:50%;
          transform:translateY(-50%);
          color:${theme.textMuted};
          pointer-events:none;
        }

        .clients-control {
          width:100%;
          min-height:38px;
          border-radius:10px;
          border:1px solid ${theme.border};
          background:${theme.bg};
          color:${theme.textMain};
          padding:9px 11px;
          outline:none;
          font-size:12px;
        }

        .clients-search {
          padding-left:35px;
        }

        .clients-add-button {
          width:42px;
          flex:0 0 42px;
          border:0;
          border-radius:10px;
          background:#3B82F6;
          color:#fff;
          display:grid;
          place-items:center;
          cursor:pointer;
        }

        .clients-list {
          flex:1;
          min-height:0;
          overflow:auto;
          display:flex;
          flex-direction:column;
          gap:8px;
          padding-right:2px;
        }

        .client-list-card {
          border:1px solid ${theme.border};
          background:${theme.bg};
          border-radius:13px;
          padding:11px;
          display:flex;
          align-items:center;
          gap:10px;
          cursor:pointer;
          color:${theme.textMain};
          text-align:left;
          transition:.2s ease;
        }

        .client-list-card:hover,
        .client-list-card.active {
          border-color:rgba(59,130,246,.55);
          background:${theme.hoverBg};
        }

        .client-list-copy {
          flex:1;
          overflow:hidden;
        }

        .client-list-copy strong,
        .client-list-copy span {
          display:block;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .client-list-copy strong {
          font-size:12px;
          margin-bottom:4px;
        }

        .client-list-copy span {
          color:${theme.textMuted};
          font-size:9px;
        }

        .client-list-count {
          color:${theme.textMuted};
          font-size:9px;
          white-space:nowrap;
        }

        .clients-detail {
          overflow:auto;
          overflow-x:hidden;
          padding:14px;
          container-type:inline-size;
          container-name:client-detail;
        }

        .client-profile-head {
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:12px;
          padding-bottom:13px;
          border-bottom:1px solid ${theme.border};
        }

        .client-profile-identity {
          display:flex;
          align-items:center;
          gap:14px;
        }

        .client-profile-copy h2 {
          margin:0;
          color:${theme.textMain};
          font-size:18px;
          line-height:1.2;
        }

        .client-profile-copy p {
          margin:5px 0 0;
          color:${theme.textMuted};
          font-size:10px;
        }

        .client-actions {
          display:flex;
          flex-wrap:wrap;
          justify-content:flex-end;
          gap:7px;
        }

        .client-action {
          min-height:34px;
          border-radius:9px;
          border:1px solid ${theme.border};
          background:${theme.bg};
          color:${theme.textMain};
          padding:7px 10px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          font-size:9px;
          font-weight:700;
          cursor:pointer;
        }

        .client-action.primary {
          background:#3B82F6;
          border-color:#3B82F6;
          color:#fff;
        }

        .client-action.danger {
          color:#F87171;
          border-color:rgba(248,113,113,.3);
          background:rgba(248,113,113,.09);
        }

        .client-action:disabled {
          opacity:.45;
          cursor:not-allowed;
        }

        .client-stats {
          display:grid;
          grid-template-columns:repeat(6,minmax(0,1fr));
          gap:7px;
          margin:12px 0;
        }

        .client-stat {
          background:${theme.bg};
          border:1px solid ${theme.border};
          border-radius:11px;
          padding:11px;
        }

        .client-stat span {
          color:${theme.textMuted};
          font-size:8px;
          display:block;
          margin-bottom:5px;
          white-space:nowrap;
        }

        .client-stat strong {
          color:${theme.textMain};
          font-size:12px;
          display:block;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .client-tabs {
          display:flex;
          gap:5px;
          overflow-x:auto;
          padding-bottom:1px;
          margin-bottom:12px;
        }

        .client-tab {
          flex:0 0 auto;
          border:1px solid ${theme.border};
          background:${theme.bg};
          color:${theme.textMuted};
          border-radius:9px;
          padding:7px 11px;
          font-size:9px;
          font-weight:700;
          cursor:pointer;
        }

        .client-tab.active {
          color:#fff;
          border-color:#3B82F6;
          background:#2563EB;
        }

        .client-tab-content {
          min-height:250px;
        }

        .overview-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:10px;
        }

        .info-card {
          background:${theme.bg};
          border:1px solid ${theme.border};
          border-radius:12px;
          padding:13px;
        }

        .info-card label {
          display:block;
          color:${theme.textMuted};
          font-size:8px;
          text-transform:uppercase;
          letter-spacing:.6px;
          margin-bottom:6px;
        }

        .info-card div {
          color:${theme.textMain};
          font-size:11px;
          line-height:1.45;
          overflow-wrap:anywhere;
        }

        .client-shoot-list {
          width:100%;
          min-width:0;
          display:flex;
          flex-direction:column;
          gap:7px;
        }

        .client-shoot-card {
          width:100%;
          max-width:100%;
          min-width:0;
          min-height:78px;
          display:grid;
          grid-template-columns:minmax(160px,1.2fr) minmax(118px,.72fr) minmax(135px,.86fr) minmax(210px,1.15fr) minmax(112px,.66fr) 34px;
          grid-template-areas:"title date location money status open";
          align-items:center;
          gap:8px;
          padding:8px 10px;
          border:1px solid ${theme.border};
          border-radius:14px;
          background:${theme.cardBg};
          overflow:hidden;
          cursor:pointer;
          transition:border-color .18s ease, transform .18s ease;
        }

        .client-shoot-card:hover {
          border-color:rgba(59,130,246,.5);
          transform:translateY(-1px);
        }

        .client-shoot-card > * {
          min-width:0;
          max-width:100%;
        }

        .client-shoot-title {
          grid-area:title;
          overflow:hidden;
        }

        .client-shoot-title strong,
        .client-shoot-title span {
          display:block;
          max-width:100%;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .client-shoot-title strong {
          color:${theme.textMain};
          font-size:11px;
          line-height:1.2;
          margin-bottom:3px;
        }

        .client-shoot-title span {
          color:${theme.textMuted};
          font-size:8px;
        }

        .client-shoot-date { grid-area:date; }
        .client-shoot-location {
          grid-area:location;
          justify-self:start;
          text-align:left;
        }

        .client-shoot-meta {
          display:flex;
          align-items:flex-start;
          gap:5px;
          min-width:0;
          overflow:hidden;
          color:${theme.textMuted};
          font-size:8px;
        }

        .client-shoot-meta svg {
          flex:0 0 auto;
          margin-top:1px;
        }

        .client-shoot-meta > div {
          min-width:0;
          overflow:hidden;
        }

        .client-shoot-meta strong,
        .client-shoot-meta span {
          display:block;
          max-width:100%;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .client-shoot-meta strong {
          color:${theme.textMain};
          font-size:9px;
          line-height:1.2;
        }

        .client-money-grid {
          grid-area:money;
          width:100%;
          min-width:0;
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          border:1px solid ${theme.border};
          border-radius:9px;
          overflow:hidden;
          background:${theme.bg};
        }

        .client-money-grid div {
          min-width:0;
          padding:6px 6px;
          text-align:center;
          border-right:1px solid ${theme.border};
        }

        .client-money-grid div:last-child { border-right:0; }

        .client-money-grid span,
        .client-money-grid strong {
          display:block;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .client-money-grid span {
          color:${theme.textMuted};
          font-size:7px;
          margin-bottom:2px;
        }

        .client-money-grid strong {
          color:${theme.textMain};
          font-size:9px;
        }

        .client-status-stack {
          grid-area:status;
          min-width:0;
          display:flex;
          flex-direction:column;
          gap:4px;
        }

        .client-badge {
          width:100%;
          min-width:0;
          border-radius:7px;
          padding:5px 6px;
          font-size:7px;
          font-weight:750;
          text-align:center;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .client-history-open {
          grid-area:open;
          width:32px;
          height:34px;
          border-radius:9px;
          border:1px solid rgba(59,130,246,.45);
          background:${theme.bg};
          color:#60A5FA;
          display:grid;
          place-items:center;
          cursor:pointer;
          font-size:16px;
        }

        @container client-detail (max-width:920px) {
          .client-shoot-card {
            min-height:104px;
            grid-template-columns:minmax(0,1.2fr) minmax(120px,.72fr) minmax(135px,.86fr) 34px;
            grid-template-areas:
              "title date location open"
              "money money status status";
          }

          .client-status-stack {
            flex-direction:row;
          }

          .client-status-stack .client-badge {
            width:50%;
            flex:1 1 0;
          }
        }

        @container client-detail (max-width:620px) {
          .client-shoot-card {
            grid-template-columns:minmax(0,1fr) 34px;
            grid-template-areas:
              "title open"
              "date date"
              "location location"
              "money money"
              "status status";
          }
        }

        .empty-state {
          border:1px dashed ${theme.border};
          border-radius:13px;
          padding:34px 18px;
          text-align:center;
          color:${theme.textMuted};
          font-size:10px;
        }

        .payment-list,
        .files-list {
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .payment-row,
        .file-row {
          border:1px solid ${theme.border};
          border-radius:11px;
          padding:11px;
          background:${theme.bg};
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
        }

        .payment-row strong,
        .file-row strong {
          display:block;
          color:${theme.textMain};
          font-size:10px;
          margin-bottom:3px;
        }

        .payment-row span,
        .file-row span {
          color:${theme.textMuted};
          font-size:8px;
        }

        .file-links {
          display:flex;
          flex-wrap:wrap;
          gap:6px;
        }

        .file-link {
          color:#7EAEFF;
          border:1px solid rgba(59,130,246,.35);
          background:rgba(59,130,246,.1);
          text-decoration:none;
          border-radius:8px;
          padding:6px 8px;
          font-size:8px;
          font-weight:700;
        }

        .clients-modal-backdrop {
          position:fixed;
          inset:0;
          z-index:600;
          background:rgba(2,6,16,.8);
          backdrop-filter:blur(8px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:16px;
        }

        .clients-modal {
          width:min(620px,100%);
          max-height:90vh;
          overflow:auto;
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          border-radius:18px;
          box-shadow:0 30px 90px rgba(0,0,0,.45);
        }

        .clients-modal-head {
          position:sticky;
          top:0;
          z-index:2;
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:14px;
          padding:16px;
          background:${theme.cardBg};
          border-bottom:1px solid ${theme.border};
        }

        .clients-modal-head h3 {
          margin:0;
          color:${theme.textMain};
          font-size:16px;
        }

        .clients-modal-head p {
          margin:4px 0 0;
          color:${theme.textMuted};
          font-size:9px;
        }

        .clients-close {
          width:32px;
          height:32px;
          border-radius:9px;
          border:1px solid ${theme.border};
          background:${theme.bg};
          color:${theme.textMuted};
          display:grid;
          place-items:center;
          cursor:pointer;
        }

        .clients-form {
          padding:16px;
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:10px;
        }

        .clients-field {
          display:flex;
          flex-direction:column;
          gap:5px;
        }

        .clients-field.full {
          grid-column:1 / -1;
        }

        .clients-field label {
          color:${theme.textMuted};
          font-size:8px;
        }

        .clients-textarea {
          min-height:90px;
          resize:vertical;
          font-family:inherit;
        }

        .clients-form-actions {
          grid-column:1 / -1;
          display:flex;
          justify-content:flex-end;
          gap:8px;
          margin-top:4px;
        }

        @media (max-width:1150px) {
          .client-stats {
            grid-template-columns:repeat(3,minmax(0,1fr));
          }

          .client-shoot-card {
            grid-template-columns:1fr 1fr;
          }

          .client-shoot-title,
          .client-money-grid {
            grid-column:1 / -1;
          }
        }

        @media (max-width:760px) {
          .clients-page {
            grid-template-columns:1fr;
            height:auto;
          }

          .clients-sidebar {
            max-height:340px;
          }

          .clients-detail {
            min-height:520px;
          }

          .client-profile-head {
            flex-direction:column;
          }

          .client-actions {
            justify-content:flex-start;
          }

          .client-stats {
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .overview-grid {
            grid-template-columns:1fr;
          }

          .client-shoot-card {
            grid-template-columns:1fr;
          }

          .client-shoot-title,
          .client-money-grid {
            grid-column:1;
          }

          .clients-form {
            grid-template-columns:1fr;
          }

          .clients-field.full,
          .clients-form-actions {
            grid-column:1;
          }

          .clients-modal-backdrop {
            align-items:flex-end;
            padding:0;
          }

          .clients-modal {
            width:100%;
            max-height:92dvh;
            border-radius:18px 18px 0 0;
            border-bottom:0;
          }
        }

        /* CLIENT HISTORY OVERFLOW SAFETY */
        .client-shoot-card > * {
          min-width:0;
          max-width:100%;
        }

        .client-shoot-title,
        .client-shoot-meta,
        .client-money-grid,
        .client-status-stack {
          overflow:hidden;
        }

        .client-shoot-title strong,
        .client-shoot-title span,
        .client-shoot-meta strong,
        .client-shoot-meta span,
        .client-badge {
          max-width:100%;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .client-money-grid {
          position:relative;
          z-index:1;
        }

        .client-status-stack {
          position:relative;
          z-index:1;
        }

      `}</style>

      <aside className="clients-panel clients-sidebar">
        <div className="clients-search-row">
          <div className="clients-search-wrap">
            <Icon name="search" size={15} />
            <input
              className="clients-control clients-search"
              type="text"
              placeholder="Search client..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="clients-add-button"
            onClick={openNewClient}
            aria-label="Add client"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>

        <div className="clients-list">
          {filteredClients.map((client) => {
            const count = shoots.filter(
              (shoot) => shoot.client_id === client.id
            ).length;

            return (
              <button
                key={client.id}
                type="button"
                className={`client-list-card ${
                  selectedClient?.id === client.id ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setActiveTab('overview');
                }}
              >
                <Avatar client={client} size={40} />

                <div className="client-list-copy">
                  <strong>{client.name}</strong>
                  <span>{client.phone || client.email || 'No contact details'}</span>
                </div>

                <span className="client-list-count">{count} shoots</span>
              </button>
            );
          })}

          {!filteredClients.length && (
            <div className="empty-state">No clients found.</div>
          )}
        </div>
      </aside>

      <section className="clients-panel clients-detail">
        {selectedClient ? (
          <>
            <div className="client-profile-head">
              <div className="client-profile-identity">
                <Avatar client={selectedClient} size={68} />

                <div className="client-profile-copy">
                  <h2>{selectedClient.name}</h2>
                  <p>
                    {selectedClient.phone || 'No phone'} ·{' '}
                    {selectedClient.email || 'No email'}
                  </p>
                </div>
              </div>

              <div className="client-actions">
                <button
                  type="button"
                  className="client-action"
                  onClick={openEditClient}
                >
                  <Icon name="edit" size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  className="client-action"
                  onClick={openWhatsApp}
                  disabled={!selectedClient.phone}
                >
                  <Icon name="whatsapp" size={14} />
                  WhatsApp
                </button>

                <button
                  type="button"
                  className="client-action"
                  onClick={callClient}
                  disabled={!selectedClient.phone}
                >
                  <Icon name="phone" size={14} />
                  Call
                </button>

                <button
                  type="button"
                  className="client-action primary"
                  onClick={openNewShoot}
                >
                  <Icon name="plus" size={14} />
                  New Shoot
                </button>

                <button
                  type="button"
                  className="client-action danger"
                  onClick={deleteClient}
                >
                  <Icon name="trash" size={14} />
                  Delete
                </button>
              </div>
            </div>

            <div className="client-stats">
              <div className="client-stat">
                <span>Total Shoots</span>
                <strong>{clientShoots.length}</strong>
              </div>
              <div className="client-stat">
                <span>Total Revenue</span>
                <strong>{money(stats.revenue)}</strong>
              </div>
              <div className="client-stat">
                <span>Received</span>
                <strong style={{ color: '#34D399' }}>{money(stats.received)}</strong>
              </div>
              <div className="client-stat">
                <span>Remaining</span>
                <strong style={{ color: '#F87171' }}>{money(stats.remaining)}</strong>
              </div>
              <div className="client-stat">
                <span>Expenses</span>
                <strong style={{ color: '#FBBF24' }}>{money(stats.expenses)}</strong>
              </div>
              <div className="client-stat">
                <span>Net Earnings</span>
                <strong style={{ color: '#60A5FA' }}>{money(stats.net)}</strong>
              </div>
            </div>

            <div className="client-tabs">
              {tabs.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`client-tab ${activeTab === value ? 'active' : ''}`}
                  onClick={() => setActiveTab(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="client-tab-content">
              {activeTab === 'overview' && (
                <div className="overview-grid">
                  <div className="info-card">
                    <label>Phone</label>
                    <div>{selectedClient.phone || 'No phone'}</div>
                  </div>

                  <div className="info-card">
                    <label>Email</label>
                    <div>{selectedClient.email || 'No email'}</div>
                  </div>

                  <div className="info-card">
                    <label>Address</label>
                    <div>{selectedClient.address || 'No address'}</div>
                  </div>

                  <div className="info-card">
                    <label>Last Shoot</label>
                    <div>
                      {clientShoots.length
                        ? formatDate(clientShoots[0].shoot_date)
                        : 'No shoots yet'}
                    </div>
                  </div>

                  <div className="info-card" style={{ gridColumn: '1 / -1' }}>
                    <label>Notes</label>
                    <div>{selectedClient.notes || 'No client notes.'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'shoots' && (
                <div className="client-shoot-list">
                  {clientShoots.length ? (
                    clientShoots.map((shoot) => {
                      const total = Number(shoot.gross_income || 0);
                      const received =
                        shoot.payment_status === 'Paid'
                          ? total
                          : Number(shoot.paid_amount || 0);
                      const remaining = Math.max(
                        Number(shoot.remaining_amount ?? total - received) || 0,
                        0
                      );
                      const [statusColor, statusBackground, statusBorder] =
                        statusStyle(shoot.status || 'Planned');
                      const [
                        paymentColor,
                        paymentBackground,
                        paymentBorder
                      ] = paymentStyle(shoot.payment_status || 'Unpaid');

                      return (
                        <div
                          key={shoot.id}
                          className="client-shoot-card"
                          onClick={() => setSelectedHistoryShoot(shoot)}
                        >
                          <div className="client-shoot-title">
                            <strong>{shoot.title || 'Untitled Shoot'}</strong>
                            <span>{shoot.category || 'Uncategorized'}</span>
                          </div>

                          <div className="client-shoot-meta client-shoot-date">
                            <Icon name="calendar" size={14} />
                            <div>
                              <strong>{formatDate(shoot.shoot_date)}</strong>
                              <span>{formatTime(shoot.shoot_date)}</span>
                            </div>
                          </div>

                          <div
                            className="client-shoot-meta client-shoot-location"
                            title={shoot.location || 'No location'}
                          >
                            <Icon name="location" size={14} />
                            <div>
                              <strong>{shoot.location || 'No location'}</strong>
                              <span>{shoot.city || 'Istanbul'}</span>
                            </div>
                          </div>

                          <div className="client-money-grid">
                            <div>
                              <span>Total</span>
                              <strong>{money(total)}</strong>
                            </div>
                            <div>
                              <span>Received</span>
                              <strong style={{ color: '#34D399' }}>
                                {money(received)}
                              </strong>
                            </div>
                            <div>
                              <span>Remaining</span>
                              <strong>{money(remaining)}</strong>
                            </div>
                          </div>

                          <div className="client-status-stack">
                            <div
                              className="client-badge"
                              style={{
                                color: statusColor,
                                background: statusBackground,
                                border: `1px solid ${statusBorder}`
                              }}
                            >
                              {shoot.status || 'Planned'}
                            </div>

                            <div
                              className="client-badge"
                              style={{
                                color: paymentColor,
                                background: paymentBackground,
                                border: `1px solid ${paymentBorder}`
                              }}
                            >
                              {shoot.payment_status || 'Unpaid'}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="client-history-open"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedHistoryShoot(shoot);
                            }}
                            aria-label="Open job details"
                          >
                            ›
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      No shoots found for this client.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="payment-list">
                  {clientShoots.length ? (
                    clientShoots.map((shoot) => {
                      const total = Number(shoot.gross_income || 0);
                      const received =
                        shoot.payment_status === 'Paid'
                          ? total
                          : Number(shoot.paid_amount || 0);
                      const remaining = Math.max(
                        Number(shoot.remaining_amount ?? total - received) || 0,
                        0
                      );

                      return (
                        <div key={shoot.id} className="payment-row">
                          <div>
                            <strong>{shoot.title || 'Untitled Shoot'}</strong>
                            <span>
                              {formatDate(shoot.shoot_date)} ·{' '}
                              {shoot.payment_status || 'Unpaid'}
                            </span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#34D399' }}>
                              Received {money(received)}
                            </strong>
                            <span>Remaining {money(remaining)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      No payment records for this client.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="overview-grid">
                  <div className="info-card" style={{ gridColumn: '1 / -1' }}>
                    <label>Client Notes</label>
                    <div>{selectedClient.notes || 'No client notes.'}</div>
                  </div>

                  {clientShoots.map((shoot) => (
                    <div key={shoot.id} className="info-card">
                      <label>{shoot.title || 'Shoot note'}</label>
                      <div>{shoot.notes || shoot.note || 'No notes.'}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="files-list">
                  {driveFiles.length ? (
                    driveFiles.map((shoot) => {
                      const links = [
                        ['Drive', shoot.drive_link],
                        ['Gallery', shoot.gallery_link],
                        ['Invoice', shoot.invoice_link],
                        ['Contract', shoot.contract_link]
                      ].filter(([, link]) => Boolean(link));

                      return (
                        <div key={shoot.id} className="file-row">
                          <div>
                            <strong>{shoot.title || 'Untitled Shoot'}</strong>
                            <span>{formatDate(shoot.shoot_date)}</span>
                          </div>

                          <div className="file-links">
                            {links.map(([label, link]) => (
                              <a
                                key={label}
                                className="file-link"
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {label}
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      No Drive, gallery, invoice or contract links were found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">Select a client.</div>
        )}
      </section>

      {selectedHistoryShoot && (
        <div
          className="clients-modal-backdrop"
          onMouseDown={() => setSelectedHistoryShoot(null)}
        >
          <div
            className="clients-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="clients-modal-head">
              <div>
                <h3>{selectedHistoryShoot.title || 'Shoot Details'}</h3>
                <p>
                  {formatDate(selectedHistoryShoot.shoot_date)} ·{' '}
                  {formatTime(selectedHistoryShoot.shoot_date)}
                </p>
              </div>

              <button
                type="button"
                className="clients-close"
                onClick={() => setSelectedHistoryShoot(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="clients-form">
              <div className="info-card">
                <label>Category</label>
                <div>{selectedHistoryShoot.category || 'Uncategorized'}</div>
              </div>

              <div className="info-card">
                <label>Location</label>
                <div>{selectedHistoryShoot.location || 'No location'}</div>
              </div>

              <div className="info-card">
                <label>Total</label>
                <div>{money(Number(selectedHistoryShoot.gross_income || 0))}</div>
              </div>

              <div className="info-card">
                <label>Received</label>
                <div style={{ color: '#34D399' }}>
                  {money(
                    selectedHistoryShoot.payment_status === 'Paid'
                      ? Number(selectedHistoryShoot.gross_income || 0)
                      : Number(selectedHistoryShoot.paid_amount || 0)
                  )}
                </div>
              </div>

              <div className="info-card">
                <label>Remaining</label>
                <div>
                  {money(
                    Math.max(
                      Number(
                        selectedHistoryShoot.remaining_amount ??
                          Number(selectedHistoryShoot.gross_income || 0) -
                            Number(selectedHistoryShoot.paid_amount || 0)
                      ) || 0,
                      0
                    )
                  )}
                </div>
              </div>

              <div className="info-card">
                <label>Status</label>
                <div>
                  {selectedHistoryShoot.status || 'Planned'} ·{' '}
                  {selectedHistoryShoot.payment_status || 'Unpaid'}
                </div>
              </div>

              <div className="info-card full" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <div>{selectedHistoryShoot.notes || 'No notes.'}</div>
              </div>

              <div className="clients-field full">
                <label>Links</label>
                <div className="file-links">
                  {[
                    ['Drive', selectedHistoryShoot.drive_link],
                    ['Gallery', selectedHistoryShoot.gallery_link],
                    ['Invoice', selectedHistoryShoot.invoice_link],
                    ['Contract', selectedHistoryShoot.contract_link]
                  ]
                    .filter(([, link]) => Boolean(link))
                    .map(([label, link]) => (
                      <a
                        key={label}
                        className="file-link"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {label}
                      </a>
                    ))}
                  {!selectedHistoryShoot.drive_link &&
                    !selectedHistoryShoot.gallery_link &&
                    !selectedHistoryShoot.invoice_link &&
                    !selectedHistoryShoot.contract_link && (
                      <span style={{ color: theme.textMuted, fontSize: 9 }}>
                        No links added yet.
                      </span>
                    )}
                </div>
              </div>

              <div className="clients-form-actions">
                <button
                  type="button"
                  className="client-action"
                  onClick={() => setSelectedHistoryShoot(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="client-action primary"
                  onClick={() => openEditHistoryShoot(selectedHistoryShoot)}
                >
                  <Icon name="edit" size={14} />
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {clientModalMode && (
        <div className="clients-modal-backdrop" onMouseDown={closeClientModal}>
          <div className="clients-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="clients-modal-head">
              <div>
                <h3>
                  {clientModalMode === 'edit' ? 'Edit Client' : 'Add New Client'}
                </h3>
                <p>
                  {clientModalMode === 'edit'
                    ? 'Update the selected client.'
                    : 'Create a new client profile.'}
                </p>
              </div>

              <button
                type="button"
                className="clients-close"
                onClick={closeClientModal}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form className="clients-form" onSubmit={saveClient}>
              <div className="clients-field full">
                <label>Profile Photo</label>
                <input
                  className="clients-control"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="clients-field full">
                <label>Full Name *</label>
                <input
                  required
                  className="clients-control"
                  type="text"
                  value={clientForm.name}
                  onChange={(event) =>
                    setClientForm({ ...clientForm, name: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Phone</label>
                <input
                  className="clients-control"
                  type="text"
                  value={clientForm.phone}
                  onChange={(event) =>
                    setClientForm({ ...clientForm, phone: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Email</label>
                <input
                  className="clients-control"
                  type="email"
                  value={clientForm.email}
                  onChange={(event) =>
                    setClientForm({ ...clientForm, email: event.target.value })
                  }
                />
              </div>

              <div className="clients-field full">
                <label>Address</label>
                <input
                  className="clients-control"
                  type="text"
                  value={clientForm.address}
                  onChange={(event) =>
                    setClientForm({ ...clientForm, address: event.target.value })
                  }
                />
              </div>

              <div className="clients-field full">
                <label>Notes</label>
                <textarea
                  className="clients-control clients-textarea"
                  value={clientForm.notes}
                  onChange={(event) =>
                    setClientForm({ ...clientForm, notes: event.target.value })
                  }
                />
              </div>

              <div className="clients-form-actions">
                <button
                  type="button"
                  className="client-action"
                  onClick={closeClientModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="client-action primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : clientModalMode === 'edit'
                      ? 'Save Changes'
                      : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {shootModalOpen && selectedClient && (
        <div className="clients-modal-backdrop" onMouseDown={closeShootModal}>
          <div className="clients-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="clients-modal-head">
              <div>
                <h3>{editingShootId ? 'Edit Shoot' : 'New Shoot'}</h3>
                <p>Client: {selectedClient.name}</p>
              </div>

              <button
                type="button"
                className="clients-close"
                onClick={closeShootModal}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form className="clients-form" onSubmit={saveShoot}>
              <div className="clients-field full">
                <label>Title *</label>
                <input
                  required
                  className="clients-control"
                  type="text"
                  value={shootForm.title}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, title: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Category *</label>
                <input
                  required
                  className="clients-control"
                  type="text"
                  value={shootForm.category}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, category: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Date & Time *</label>
                <input
                  required
                  className="clients-control"
                  type="datetime-local"
                  value={shootForm.shoot_date}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, shoot_date: event.target.value })
                  }
                />
              </div>

              <div className="clients-field full">
                <label>Location</label>
                <input
                  className="clients-control"
                  type="text"
                  value={shootForm.location}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, location: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Status</label>
                <select
                  className="clients-control"
                  value={shootForm.status}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, status: event.target.value })
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="clients-field">
                <label>Payment Status</label>
                <select
                  className="clients-control"
                  value={shootForm.payment_status}
                  onChange={(event) =>
                    setShootForm({
                      ...shootForm,
                      payment_status: event.target.value
                    })
                  }
                >
                  {PAYMENT_OPTIONS.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="clients-field">
                <label>Total Price</label>
                <input
                  className="clients-control"
                  type="number"
                  min="0"
                  value={shootForm.gross_income}
                  onChange={(event) => {
                    const total = Number(event.target.value || 0);

                    setShootForm({
                      ...shootForm,
                      gross_income: total,
                      remaining_amount: Math.max(
                        total - Number(shootForm.paid_amount || 0),
                        0
                      )
                    });
                  }}
                />
              </div>

              <div className="clients-field">
                <label>Received Amount</label>
                <input
                  className="clients-control"
                  type="number"
                  min="0"
                  max={Number(shootForm.gross_income || 0)}
                  value={shootForm.paid_amount}
                  onChange={(event) => {
                    const received = Number(event.target.value || 0);

                    setShootForm({
                      ...shootForm,
                      paid_amount: received,
                      remaining_amount: Math.max(
                        Number(shootForm.gross_income || 0) - received,
                        0
                      )
                    });
                  }}
                />
              </div>

              <div className="clients-field full">
                <label>Remaining</label>
                <input
                  readOnly
                  className="clients-control"
                  type="text"
                  value={money(
                    Math.max(
                      Number(shootForm.gross_income || 0) -
                        Number(shootForm.paid_amount || 0),
                      0
                    )
                  )}
                />
              </div>

              <div className="clients-field full">
                <label>Drive Link</label>
                <input
                  className="clients-control"
                  type="url"
                  value={shootForm.drive_link}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, drive_link: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Gallery Link</label>
                <input
                  className="clients-control"
                  type="url"
                  value={shootForm.gallery_link}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, gallery_link: event.target.value })
                  }
                />
              </div>

              <div className="clients-field">
                <label>Invoice Link</label>
                <input
                  className="clients-control"
                  type="url"
                  value={shootForm.invoice_link}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, invoice_link: event.target.value })
                  }
                />
              </div>

              <div className="clients-field full">
                <label>Contract Link</label>
                <input
                  className="clients-control"
                  type="url"
                  value={shootForm.contract_link}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, contract_link: event.target.value })
                  }
                />
              </div>

              <div className="clients-field full">
                <label>Notes</label>
                <textarea
                  className="clients-control clients-textarea"
                  value={shootForm.notes}
                  onChange={(event) =>
                    setShootForm({ ...shootForm, notes: event.target.value })
                  }
                />
              </div>

              <div className="clients-form-actions">
                <button
                  type="button"
                  className="client-action"
                  onClick={closeShootModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="client-action primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingShootId ? 'Save Changes' : 'Create Shoot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
