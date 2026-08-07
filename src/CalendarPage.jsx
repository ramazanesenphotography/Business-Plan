import React, { useMemo, useState } from 'react';

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

function formatMoney(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function getClientName(shoot, clients) {
  if (shoot?.clients?.name) return shoot.clients.name;

  const client = clients.find(
    (item) => String(item.id) === String(shoot.client_id)
  );

  return client?.name || 'No Client';
}

function getStatusStyle(status) {
  const map = {
    Planned: {
      color: '#60A5FA',
      background: 'rgba(59,130,246,.13)',
      border: 'rgba(59,130,246,.3)'
    },
    Confirmed: {
      color: '#34D399',
      background: 'rgba(52,211,153,.13)',
      border: 'rgba(52,211,153,.3)'
    },
    'In Progress': {
      color: '#FBBF24',
      background: 'rgba(251,191,36,.13)',
      border: 'rgba(251,191,36,.3)'
    },
    Completed: {
      color: '#22C55E',
      background: 'rgba(34,197,94,.14)',
      border: 'rgba(34,197,94,.3)'
    },
    Cancelled: {
      color: '#F87171',
      background: 'rgba(248,113,113,.13)',
      border: 'rgba(248,113,113,.3)'
    }
  };

  return map[status] || map.Planned;
}

function getPaymentStyle(status) {
  const map = {
    Unpaid: {
      color: '#F87171',
      background: 'rgba(248,113,113,.13)',
      border: 'rgba(248,113,113,.3)'
    },
    'Deposit Received': {
      color: '#60A5FA',
      background: 'rgba(59,130,246,.13)',
      border: 'rgba(59,130,246,.3)'
    },
    'Partial Payment': {
      color: '#FBBF24',
      background: 'rgba(251,191,36,.13)',
      border: 'rgba(251,191,36,.3)'
    },
    Paid: {
      color: '#34D399',
      background: 'rgba(52,211,153,.13)',
      border: 'rgba(52,211,153,.3)'
    },
    Refunded: {
      color: '#C084FC',
      background: 'rgba(192,132,252,.13)',
      border: 'rgba(192,132,252,.3)'
    }
  };

  return map[status] || map.Unpaid;
}


function getShootTotal(shoot) {
  return Number(
    shoot?.gross_income ??
    shoot?.price ??
    shoot?.net_profit ??
    0
  ) || 0;
}

function getPaidAmount(shoot) {
  if (shoot?.payment_status === 'Paid') return getShootTotal(shoot);

  return Number(
    shoot?.paid_amount ??
    shoot?.deposit_amount ??
    0
  ) || 0;
}

function getRemainingAmount(shoot) {
  return Math.max(getShootTotal(shoot) - getPaidAmount(shoot), 0);
}

function stop(event) {
  event.stopPropagation();
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
    money: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v12M16 9.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
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
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    )
  };

  return <svg {...common}>{icons[name]}</svg>;
}

export default function CalendarPage({
  shoots = [],
  clients = [],
  refresh = () => {},
  theme,
  supabase
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState(null);
  const [selectedShoot, setSelectedShoot] = useState(null);
  const [savingKey, setSavingKey] = useState('');
  const [paymentEditor, setPaymentEditor] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    category: 'Portrait / Concept',
    shoot_date: '',
    location: '',
    status: 'Planned',
    payment_status: 'Unpaid',
    paid_amount: 0,
    remaining_amount: 0,
    gross_income: 0,
    notes: '',
    drive_link: '',
    gallery_link: '',
    invoice_link: '',
    contract_link: '',
    expenses: []
  });

  const categories = useMemo(
    () => [...new Set(shoots.map((shoot) => shoot.category).filter(Boolean))],
    [shoots]
  );

  const filteredShoots = useMemo(() => {
    return shoots
      .filter((shoot) => {
        const status = shoot.status || 'Planned';
        const category = shoot.category || '';
        const clientName = getClientName(shoot, clients);
        const title = shoot.title || '';

        const matchesStatus =
          filterStatus === 'All' || status === filterStatus;
        const matchesCategory =
          filterCategory === 'All' || category === filterCategory;
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !query ||
          title.toLowerCase().includes(query) ||
          clientName.toLowerCase().includes(query) ||
          String(shoot.location || '').toLowerCase().includes(query);

        const shootDate = safeDate(shoot.shoot_date);
        let matchesDate = true;

        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`);
          matchesDate = Boolean(shootDate && shootDate >= start);
        }

        if (matchesDate && endDate) {
          const end = new Date(`${endDate}T23:59:59`);
          matchesDate = Boolean(shootDate && shootDate <= end);
        }

        return (
          matchesStatus &&
          matchesCategory &&
          matchesSearch &&
          matchesDate
        );
      })
      .sort((a, b) => {
        const normalizeStatus = (value) =>
          String(value || 'Planned').trim().toLowerCase();

        const statusA = normalizeStatus(a.status);
        const statusB = normalizeStatus(b.status);

        const isFinished = (status) =>
          status === 'completed' ||
          status === 'cancelled' ||
          status === 'canceled';

        const finishedA = isFinished(statusA);
        const finishedB = isFinished(statusB);

        // Planned / Confirmed / In Progress always stay above finished jobs.
        if (finishedA !== finishedB) return finishedA ? 1 : -1;

        const dateA = safeDate(a.shoot_date)?.getTime() || 0;
        const dateB = safeDate(b.shoot_date)?.getTime() || 0;

        // Upcoming/active work: nearest date first.
        if (!finishedA) return dateA - dateB;

        // Completed/cancelled work: most recently completed first.
        return dateB - dateA;
      });
  }, [
    shoots,
    clients,
    filterStatus,
    filterCategory,
    startDate,
    endDate,
    searchTerm
  ]);

  async function updateShoot(shootId, patch, key) {
    if (!supabase || !shootId) return;

    setSavingKey(`${shootId}-${key}`);

    const { error } = await supabase
      .from('shoots')
      .update(patch)
      .eq('id', shootId);

    setSavingKey('');

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setSelectedShoot((current) =>
      current?.id === shootId ? { ...current, ...patch } : current
    );

    await refresh();
  }

  async function handleStatusChange(shootId, value, event) {
    stop(event);
    await updateShoot(shootId, { status: value }, 'status');
  }

  async function handlePaymentStatusChange(shoot, value, event) {
    stop(event);

    if (value === 'Deposit Received' || value === 'Partial Payment') {
      setPaymentEditor({
        ...shoot,
        pending_payment_status: value
      });
      setPaymentAmount(
        String(getPaidAmount(shoot) || '')
      );
      return;
    }

    const total = getShootTotal(shoot);
    const paidAmount = value === 'Paid' ? total : 0;

    await updateShoot(
      shoot.id,
      {
        payment_status: value,
        paid_amount: paidAmount,
        remaining_amount: Math.max(total - paidAmount, 0)
      },
      'payment'
    );
  }

  async function savePaymentAmount(event) {
    event.preventDefault();

    if (!paymentEditor?.id) return;

    const total = getShootTotal(paymentEditor);
    const received = Math.max(
      0,
      Math.min(Number(paymentAmount || 0), total)
    );
    const status =
      received >= total && total > 0
        ? 'Paid'
        : paymentEditor.pending_payment_status || 'Partial Payment';

    await updateShoot(
      paymentEditor.id,
      {
        payment_status: status,
        paid_amount: received,
        remaining_amount: Math.max(total - received, 0)
      },
      'payment'
    );

    setPaymentEditor(null);
    setPaymentAmount('');
  }

  function resetShootForm() {
    setEditingShoot(null);
    setFormData({
      client_id: '',
      title: '',
      category: 'Portrait / Concept',
      shoot_date: '',
      location: '',
      status: 'Planned',
      payment_status: 'Unpaid',
      paid_amount: 0,
      remaining_amount: 0,
      gross_income: 0,
      notes: '',
      drive_link: '',
      gallery_link: '',
      invoice_link: '',
      contract_link: '',
      expenses: []
    });
  }

  function closeShootForm() {
    setIsCreateOpen(false);
    resetShootForm();
  }

  function openNewShootForm() {
    resetShootForm();
    setIsCreateOpen(true);
  }

  function openEditShoot(shoot) {
    const total = getShootTotal(shoot);
    const paid = getPaidAmount(shoot);

    setEditingShoot(shoot);
    setFormData({
      client_id: shoot.client_id || shoot.clients?.id || '',
      title: shoot.title || '',
      category: shoot.category || '',
      shoot_date: toDateTimeLocal(shoot.shoot_date),
      location: shoot.location || '',
      status: shoot.status || 'Planned',
      payment_status: shoot.payment_status || 'Unpaid',
      paid_amount: paid,
      remaining_amount: Math.max(total - paid, 0),
      gross_income: total,
      notes: shoot.notes || shoot.note || '',
      drive_link: shoot.drive_link || '',
      gallery_link: shoot.gallery_link || '',
      invoice_link: shoot.invoice_link || '',
      contract_link: shoot.contract_link || '',
      expenses: Array.isArray(shoot.expenses) ? shoot.expenses : []
    });

    setSelectedShoot(null);
    setIsCreateOpen(true);
  }

  async function handleCreateShoot(event) {
    event.preventDefault();

    const total_expense = formData.expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const grossIncome = Number(formData.gross_income || 0);
    const paidAmount = Math.max(
      0,
      Math.min(Number(formData.paid_amount || 0), grossIncome)
    );
    const remainingAmount = Math.max(grossIncome - paidAmount, 0);
    const net_profit = grossIncome - total_expense;

    let paymentStatus = formData.payment_status;

    if (grossIncome > 0 && paidAmount >= grossIncome) {
      paymentStatus = 'Paid';
    } else if (paidAmount > 0 && paymentStatus === 'Unpaid') {
      paymentStatus = 'Partial Payment';
    } else if (paidAmount === 0 && paymentStatus !== 'Refunded') {
      paymentStatus = 'Unpaid';
    }

    const payload = {
      client_id: formData.client_id,
      title: formData.title,
      category: formData.category,
      shoot_date: formData.shoot_date,
      location: formData.location,
      status: formData.status,
      payment_status: paymentStatus,
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      gross_income: grossIncome,
      notes: formData.notes,
      drive_link: formData.drive_link || null,
      gallery_link: formData.gallery_link || null,
      invoice_link: formData.invoice_link || null,
      contract_link: formData.contract_link || null,
      expenses: formData.expenses,
      total_expense,
      net_profit
    };

    const query = editingShoot?.id
      ? supabase.from('shoots').update(payload).eq('id', editingShoot.id)
      : supabase.from('shoots').insert([payload]);

    const { error } = await query;

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    closeShootForm();
    await refresh();
  }

  async function handleDeleteShoot() {
    if (!selectedShoot?.id) return;

    const approved = window.confirm(
      `Delete "${selectedShoot.title || 'this shoot'}"?`
    );

    if (!approved) return;

    const { error } = await supabase
      .from('shoots')
      .delete()
      .eq('id', selectedShoot.id);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setSelectedShoot(null);
    await refresh();
  }

  return (
    <div className="calendar-page">
      <style>{`
        .calendar-page {
          display:flex;
          flex-direction:column;
          gap:13px;
          width:100%;
          min-width:0;
        }

        .calendar-page * {
          box-sizing:border-box;
          min-width:0;
        }

        .calendar-filter-panel {
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          border-radius:20px;
          padding:14px;
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:8px;
        }

        .calendar-search-wrap {
          position:relative;
          flex:1 1 240px;
          max-width:360px;
        }

        .calendar-search-icon {
          position:absolute;
          left:13px;
          top:50%;
          transform:translateY(-50%);
          color:${theme.textMuted};
          pointer-events:none;
        }

        .calendar-control {
          background:${theme.bg};
          border:1px solid ${theme.border};
          border-radius:10px;
          padding:10px 13px;
          color:${theme.textMain};
          font-size:13px;
          outline:none;
          min-height:38px;
        }

        .calendar-search {
          width:100%;
          padding-left:39px;
        }

        .calendar-list {
          display:flex;
          flex-direction:column;
          gap:7px;
        }

        .calendar-card {
          width:100%;
          max-width:100%;
          overflow:hidden;
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          border-radius:14px;
          padding:9px 11px;
          display:flex;
          flex-wrap:wrap;
          gap:8px 11px;
          align-items:center;
          color:${theme.textMain};
          cursor:pointer;
          transition:border-color .2s ease, transform .2s ease, background .2s ease;
        }

        .calendar-card > * {
          min-width:0;
          max-width:100%;
        }

        .calendar-card:hover {
          border-color:rgba(59,130,246,.5);
          transform:translateY(-1px);
        }

        .calendar-primary {
          display:flex;
          align-items:center;
          gap:12px;
          flex:1 1 220px;
          min-width:180px;
        }

        .calendar-category-icon {
          width:32px;
          height:32px;
          border-radius:10px;
          display:grid;
          place-items:center;
          flex:0 0 36px;
          color:#60A5FA;
          background:rgba(59,130,246,.14);
          border:1px solid rgba(59,130,246,.25);
        }

        .calendar-title {
          margin:0;
          font-size:13px;
          font-weight:750;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .calendar-subtitle {
          margin-top:2px;
          color:${theme.textMuted};
          font-size:9px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .calendar-info {
          display:flex;
          align-items:flex-start;
          gap:6px;
          color:${theme.textMuted};
          font-size:10px;
          line-height:1.32;
          flex:1 1 145px;
          min-width:120px;
        }

        .calendar-info strong {
          display:block;
          color:${theme.textMain};
          font-size:11px;
          font-weight:650;
        }

        .calendar-price {
          color:${theme.textMain};
          font-size:13px;
          font-weight:800;
          white-space:nowrap;
          flex:0 1 95px;
          min-width:78px;
        }

        .calendar-status-select {
          appearance:none;
          -webkit-appearance:none;
          padding:7px 27px 7px 10px;
          border-radius:10px;
          font-size:9px;
          font-weight:750;
          outline:none;
          cursor:pointer;
          width:auto;
          min-width:118px;
          max-width:160px;
          flex:0 1 145px;
          background-image:
            linear-gradient(45deg,transparent 50%,currentColor 50%),
            linear-gradient(135deg,currentColor 50%,transparent 50%);
          background-position:
            calc(100% - 14px) 50%,
            calc(100% - 10px) 50%;
          background-size:4px 4px,4px 4px;
          background-repeat:no-repeat;
        }

        .calendar-payment-block {
          display:flex;
          flex-direction:column;
          gap:4px;
          flex:0 1 150px;
          min-width:118px;
        }

        .calendar-payment-summary {
          display:flex;
          justify-content:space-between;
          gap:8px;
          color:${theme.textMuted};
          font-size:8px;
          line-height:1;
          padding:0 2px;
          white-space:nowrap;
        }

        .calendar-payment-summary strong {
          color:${theme.textMain};
          font-weight:700;
        }

        .calendar-open-button {
          width:32px;
          height:32px;
          border-radius:10px;
          border:1px solid #3B82F6;
          color:#7EAEFF;
          background:transparent;
          display:grid;
          place-items:center;
          cursor:pointer;
        }

        .calendar-empty {
          text-align:center;
          padding:46px 18px;
          color:${theme.textMuted};
          background:${theme.cardBg};
          border-radius:18px;
          border:1px solid ${theme.border};
        }

        .calendar-modal-backdrop {
          position:fixed;
          inset:0;
          background:rgba(2,6,16,.78);
          backdrop-filter:blur(8px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:14px;
          z-index:500;
        }

        .calendar-detail-modal {
          width:min(920px,100%);
          max-height:90vh;
          overflow:auto;
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          border-radius:22px;
          box-shadow:0 28px 80px rgba(0,0,0,.42);
        }

        .calendar-modal-head {
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:16px;
          padding:20px;
          border-bottom:1px solid ${theme.border};
        }

        .calendar-modal-body {
          padding:20px;
        }

        .calendar-detail-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
        }

        .calendar-detail-item {
          border:1px solid ${theme.border};
          border-radius:13px;
          padding:13px;
          background:${theme.bg};
        }

        .calendar-detail-label {
          color:${theme.textMuted};
          font-size:9px;
          text-transform:uppercase;
          letter-spacing:.7px;
          margin-bottom:7px;
        }

        .calendar-detail-value {
          color:${theme.textMain};
          font-size:11px;
          font-weight:650;
          line-height:1.5;
          overflow-wrap:anywhere;
        }

        .calendar-modal-actions {
          display:flex;
          justify-content:flex-end;
          gap:10px;
          flex-wrap:wrap;
          margin-top:18px;
        }

        .calendar-action-button {
          border-radius:11px;
          padding:10px 15px;
          font-size:11px;
          font-weight:700;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          gap:8px;
        }

        .calendar-payment-modal {
          width:min(430px,100%);
          background:${theme.cardBg};
          border:1px solid ${theme.border};
          border-radius:20px;
          box-shadow:0 28px 80px rgba(0,0,0,.42);
          overflow:hidden;
        }

        .calendar-payment-form {
          padding:18px;
          display:flex;
          flex-direction:column;
          gap:14px;
        }

        .calendar-payment-totals {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:8px;
        }

        .calendar-payment-total {
          background:${theme.bg};
          border:1px solid ${theme.border};
          border-radius:12px;
          padding:10px;
        }

        @media (max-width:600px) {
          .calendar-modal-backdrop {
            align-items:flex-end;
            padding:0;
          }

          .calendar-detail-modal,
          .calendar-payment-modal {
            width:100%;
            max-height:92dvh;
            border-radius:20px 20px 0 0;
            border-bottom:0;
          }

          .calendar-modal-head {
            padding:14px 16px;
            position:sticky;
            top:0;
            z-index:2;
            background:${theme.cardBg};
          }

          .calendar-modal-body {
            padding:14px 16px calc(18px + env(safe-area-inset-bottom));
          }

          .calendar-payment-form {
            padding:14px 16px calc(18px + env(safe-area-inset-bottom));
          }

          .calendar-payment-totals {
            grid-template-columns:1fr;
          }
        }

        @media (max-width:900px) {
          .calendar-primary {
            flex-basis:100%;
          }

          .calendar-location {
            flex-basis:100%;
          }

          .calendar-status-select {
            flex:1 1 150px;
            max-width:none;
          }
        }

        @media (max-width:600px) {
          .calendar-filter-panel {
            align-items:stretch;
          }

          .calendar-search-wrap {
            max-width:none;
            flex-basis:100%;
          }

          .calendar-control {
            flex:1 1 145px;
          }

          .calendar-card {
            align-items:stretch;
          }

          .calendar-primary,
          .calendar-info,
          .calendar-location,
          .calendar-price {
            flex-basis:100%;
            min-width:0;
          }

          .calendar-status-select {
            width:100%;
            max-width:none;
            flex:1 1 100%;
          }

          .calendar-payment-block {
          display:flex;
          flex-direction:column;
          gap:4px;
          flex:0 1 150px;
          min-width:118px;
        }

        .calendar-payment-summary {
          display:flex;
          justify-content:space-between;
          gap:8px;
          color:${theme.textMuted};
          font-size:8px;
          line-height:1;
          padding:0 2px;
          white-space:nowrap;
        }

        .calendar-payment-summary strong {
          color:${theme.textMain};
          font-weight:700;
        }

        .calendar-open-button {
            width:100%;
          }

          .calendar-detail-grid {
            grid-template-columns:1fr;
          }
        }

        /* FINAL CALENDAR LAYOUT — one compact row, no duplicated price */
        .calendar-list {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .calendar-card.calendar-card-final {
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          height: 76px;
          min-height: 76px;
          max-height: 76px;
          margin: 0;
          padding: 7px 12px;
          overflow: hidden;
          display: grid;
          grid-template-columns:
            minmax(200px, 1.45fr)
            minmax(130px, .82fr)
            minmax(175px, 1.02fr)
            minmax(250px, 1.22fr)
            minmax(145px, .78fr)
            52px
            36px;
          grid-template-rows: 60px;
          align-items: center;
          align-content: center;
          gap: 9px;
          border-radius: 16px;
        }

        .calendar-card.calendar-card-final > * {
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
          min-height: 0;
          margin: 0;
          align-self: center;
        }

        .calendar-final-client {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 10px;
          overflow: hidden;
        }

        .calendar-final-client-copy {
          min-width: 0;
          overflow: hidden;
        }

        .calendar-final-client .calendar-title,
        .calendar-final-client .calendar-subtitle {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .calendar-card-final .calendar-category-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
        }

        .calendar-card-final .calendar-title {
          margin: 0;
          font-size: 13px;
          line-height: 1.2;
        }

        .calendar-card-final .calendar-subtitle {
          margin-top: 4px;
          font-size: 9px;
          line-height: 1.2;
        }

        .calendar-final-date,
        .calendar-final-location {
          width: auto;
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          flex: none;
          font-size: 9px;
          line-height: 1.25;
        }

        .calendar-final-date strong,
        .calendar-final-location strong {
          display: block;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
          line-height: 1.2;
        }

        .calendar-final-time {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .calendar-final-money {
          box-sizing: border-box;
          width: 100%;
          height: 50px;
          min-height: 50px;
          max-height: 50px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          overflow: hidden;
          background: ${theme.bg};
          border: 1px solid ${theme.border};
          border-radius: 11px;
        }

        .calendar-final-money > div {
          box-sizing: border-box;
          min-width: 0;
          height: 48px;
          padding: 5px 7px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid ${theme.border};
        }

        .calendar-final-money > div:last-child {
          border-right: 0;
        }

        .calendar-final-money span {
          display: block;
          margin: 0 0 3px;
          color: ${theme.textMuted};
          font-size: 8px;
          line-height: 1.1;
          white-space: nowrap;
        }

        .calendar-final-money strong {
          display: block;
          min-width: 0;
          color: ${theme.textMain};
          font-size: 10px;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .calendar-money-received {
          color: #34D399 !important;
        }

        .calendar-final-statuses {
          box-sizing: border-box;
          width: 100%;
          height: 50px;
          min-height: 50px;
          max-height: 50px;
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 4px;
          overflow: hidden;
        }

        .calendar-final-statuses .calendar-status-select {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          max-width: none;
          height: 23px;
          min-height: 23px;
          max-height: 23px;
          margin: 0;
          padding: 2px 24px 2px 8px;
          font-size: 8px;
          line-height: 1;
          flex: none;
        }

        .calendar-final-edit {
          box-sizing: border-box;
          width: 52px;
          height: 52px;
          min-height: 52px;
          max-height: 52px;
          padding: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          color: ${theme.textMain};
          background: ${theme.bg};
          border: 1px solid ${theme.border};
          border-radius: 10px;
          cursor: pointer;
          font-size: 8px;
          font-weight: 700;
        }

        .calendar-final-edit:hover {
          color: #7EAEFF;
          border-color: #3B82F6;
        }

        .calendar-final-open {
          box-sizing: border-box;
          width: 36px;
          height: 40px;
          min-height: 40px;
          max-height: 40px;
          justify-self: end;
        }

        /* Medium desktop / tablet: two controlled rows */
        @media (max-width: 1120px) and (min-width: 701px) {
          .calendar-card.calendar-card-final {
            height: 112px;
            min-height: 112px;
            max-height: 112px;
            padding-top: 6px;
            padding-bottom: 6px;
            grid-template-columns: minmax(180px, 1.25fr) minmax(135px, .9fr) minmax(170px, 1fr);
            grid-template-rows: 40px 50px;
            gap: 5px 10px;
          }

          .calendar-final-client {
            grid-column: 1;
            grid-row: 1;
          }

          .calendar-final-date {
            grid-column: 2;
            grid-row: 1;
          }

          .calendar-final-location {
            grid-column: 3;
            grid-row: 1;
          }

          .calendar-final-money {
            grid-column: 1 / 3;
            grid-row: 2;
          }

          .calendar-final-statuses {
            grid-column: 3;
            grid-row: 2;
          }

          .calendar-final-edit,
          .calendar-final-open {
            display: none;
          }
        }

        /* Phone: stacked, touch-friendly, no horizontal overflow */
        @media (max-width: 700px) {
          .calendar-card.calendar-card-final {
            height: auto;
            min-height: 0;
            max-height: none;
            padding: 11px;
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            gap: 8px;
          }

          .calendar-card.calendar-card-final > * {
            grid-column: 1;
            width: 100%;
            max-height: none;
          }

          .calendar-final-money {
            height: 62px;
          }

          .calendar-final-statuses {
            height: auto;
            min-height: 0;
            max-height: none;
          }

          .calendar-final-edit,
          .calendar-final-open {
            width: 100%;
            height: 34px;
            min-height: 34px;
            max-height: 34px;
            flex-direction: row;
          }
        }


        /* FINAL VERTICAL COMPACTNESS OVERRIDE */
        @media (min-width:1121px) {
          .calendar-card.calendar-card-final {
            height:76px !important;
            min-height:76px !important;
            max-height:76px !important;
          }
        }

        @media (max-width:1120px) and (min-width:701px) {
          .calendar-card.calendar-card-final {
            height:112px !important;
            min-height:112px !important;
            max-height:112px !important;
          }

          .calendar-final-money,
          .calendar-final-statuses {
            height:50px !important;
            min-height:50px !important;
            max-height:50px !important;
          }
        }


        /* 100% ZOOM PAGE CONSISTENCY */
        .calendar-page,
        .calendar-page * {
          box-sizing:border-box;
          min-width:0;
        }

        .calendar-list {
          width:100%;
          max-width:100%;
          overflow-x:hidden;
        }

        @media (min-width:1181px) {
          .calendar-card.calendar-card-final {
            width:100% !important;
            max-width:100% !important;
            grid-template-columns:
              minmax(185px,1.25fr)
              minmax(120px,.72fr)
              minmax(150px,.92fr)
              minmax(225px,1.15fr)
              minmax(132px,.72fr)
              52px
              36px !important;
          }
        }

        @media (max-width:1180px) and (min-width:701px) {
          .calendar-card.calendar-card-final {
            width:100% !important;
            max-width:100% !important;
          }
        }


        /* FINAL 100% ZOOM FIT — details open by clicking the row */
        @media (min-width:901px) {
          .calendar-card.calendar-card-final {
            height:76px !important;
            min-height:76px !important;
            max-height:76px !important;
            grid-template-columns:
              minmax(165px,1.15fr)
              minmax(112px,.72fr)
              minmax(130px,.86fr)
              minmax(210px,1.12fr)
              minmax(105px,.64fr) !important;
            gap:8px !important;
          }

          .calendar-final-edit,
          .calendar-final-open {
            display:none !important;
          }

          .calendar-final-client,
          .calendar-final-date,
          .calendar-final-location,
          .calendar-final-money,
          .calendar-final-statuses {
            min-width:0 !important;
            max-width:100% !important;
            overflow:hidden !important;
          }

          .calendar-final-location strong,
          .calendar-final-client .calendar-title,
          .calendar-final-client .calendar-subtitle {
            overflow:hidden !important;
            text-overflow:ellipsis !important;
            white-space:nowrap !important;
          }
        }

        @media (max-width:900px) and (min-width:701px) {
          .calendar-card.calendar-card-final {
            height:112px !important;
            min-height:112px !important;
            max-height:112px !important;
            grid-template-columns:minmax(0,1.2fr) minmax(120px,.72fr) minmax(135px,.82fr) !important;
          }
        }

      `}</style>

      <div className="calendar-filter-panel">
        <div className="calendar-search-wrap">
          <span className="calendar-search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            className="calendar-control calendar-search"
            type="text"
            placeholder="Search shoot, client or location..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          className="calendar-control"
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          className="calendar-control"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <input
          className="calendar-control"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />

        <select
          className="calendar-control"
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={openNewShootForm}
          style={{
            marginLeft: 'auto',
            background: '#3B82F6',
            color: '#fff',
            border: 0,
            minHeight: 42,
            padding: '10px 18px',
            borderRadius: 12,
            fontWeight: 750,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          + New Shoot
        </button>
      </div>

      <div className="calendar-list">
        {filteredShoots.length ? (
          filteredShoots.map((shoot) => {
            const status = shoot.status || 'Planned';
            const paymentStatus = shoot.payment_status || 'Unpaid';
            const statusStyle = getStatusStyle(status);
            const paymentStyle = getPaymentStyle(paymentStatus);
            const clientName = getClientName(shoot, clients);
            const isStatusSaving =
              savingKey === `${shoot.id}-status`;
            const isPaymentSaving =
              savingKey === `${shoot.id}-payment`;

            return (
              <article
                key={shoot.id}
                className="calendar-card calendar-card-final"
                onClick={() => setSelectedShoot(shoot)}
              >
                <div className="calendar-primary calendar-final-client">
                  <div className="calendar-category-icon">
                    <Icon name="user" size={19} />
                  </div>

                  <div className="calendar-final-client-copy">
                    <h3 className="calendar-title">{clientName}</h3>
                    <div className="calendar-subtitle">
                      {shoot.title || 'Untitled Shoot'} ·{' '}
                      {shoot.category || 'Uncategorized'}
                    </div>
                  </div>
                </div>

                <div className="calendar-info calendar-final-date">
                  <Icon name="calendar" size={16} />
                  <div>
                    <strong>{formatDate(shoot.shoot_date)}</strong>
                    <span className="calendar-final-time">
                      <Icon name="clock" size={12} />
                      {formatTime(shoot.shoot_date)}
                    </span>
                  </div>
                </div>

                <div className="calendar-info calendar-location calendar-final-location">
                  <Icon name="location" size={16} />
                  <div>
                    <strong>{shoot.location || 'No location'}</strong>
                    <span>{shoot.city || 'Istanbul'}</span>
                  </div>
                </div>
                <div className="calendar-final-money" onClick={stop}>
                  <div>
                    <span>Total</span>
                    <strong>{formatMoney(getShootTotal(shoot))}</strong>
                  </div>
                  <div>
                    <span>Received</span>
                    <strong className="calendar-money-received">
                      {formatMoney(getPaidAmount(shoot))}
                    </strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>{formatMoney(getRemainingAmount(shoot))}</strong>
                  </div>
                </div>

                <div className="calendar-final-statuses" onClick={stop}>
                  <select
                    className="calendar-status-select"
                    value={status}
                    disabled={isStatusSaving}
                    onClick={stop}
                    onChange={(event) =>
                      handleStatusChange(
                        shoot.id,
                        event.target.value,
                        event
                      )
                    }
                    style={{
                      color: statusStyle.color,
                      backgroundColor: statusStyle.background,
                      border: `1px solid ${statusStyle.border}`,
                      opacity: isStatusSaving ? 0.6 : 1
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        style={{
                          background: theme.cardBg,
                          color: theme.textMain
                        }}
                      >
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    className="calendar-status-select"
                    value={paymentStatus}
                    disabled={isPaymentSaving}
                    onClick={stop}
                    onChange={(event) =>
                      handlePaymentStatusChange(
                        shoot,
                        event.target.value,
                        event
                      )
                    }
                    style={{
                      color: paymentStyle.color,
                      backgroundColor: paymentStyle.background,
                      border: `1px solid ${paymentStyle.border}`,
                      opacity: isPaymentSaving ? 0.6 : 1
                    }}
                  >
                    {PAYMENT_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        style={{
                          background: theme.cardBg,
                          color: theme.textMain
                        }}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="calendar-final-edit"
                  onClick={(event) => {
                    stop(event);
                    openEditShoot(shoot);
                  }}
                >
                  <Icon name="edit" size={15} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className="calendar-open-button calendar-final-open"
                  onClick={(event) => {
                    stop(event);
                    setSelectedShoot(shoot);
                  }}
                  aria-label="Open shoot details"
                >
                  <Icon name="chevron" size={17} />
                </button>
              </article>
            );
          })
        ) : (
          <div className="calendar-empty">
            <strong
              style={{
                display: 'block',
                color: theme.textMain,
                marginBottom: 7
              }}
            >
              No shoots found.
            </strong>
            Try changing the filters or create a new shoot.
          </div>
        )}
      </div>

      {selectedShoot && (
        <div
          className="calendar-modal-backdrop"
          onMouseDown={() => setSelectedShoot(null)}
        >
          <div
            className="calendar-detail-modal"
            onMouseDown={stop}
          >
            <div
              className="calendar-modal-head"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 5,
                background: theme.cardBg
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 19,
                    color: theme.textMain
                  }}
                >
                  {getClientName(selectedShoot, clients)}
                </h2>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: theme.textMuted,
                    fontSize: 11
                  }}
                >
                  {selectedShoot.title || 'Untitled Shoot'} ·{' '}
                  {selectedShoot.category || 'Uncategorized'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedShoot(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.textMuted,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="calendar-modal-body">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 16
                }}
              >
                <select
                  className="calendar-status-select"
                  value={selectedShoot.status || 'Planned'}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedShoot.id,
                      event.target.value,
                      event
                    )
                  }
                  style={{
                    ...getStatusStyle(
                      selectedShoot.status || 'Planned'
                    ),
                    color: getStatusStyle(
                      selectedShoot.status || 'Planned'
                    ).color,
                    backgroundColor: getStatusStyle(
                      selectedShoot.status || 'Planned'
                    ).background,
                    border: `1px solid ${
                      getStatusStyle(
                        selectedShoot.status || 'Planned'
                      ).border
                    }`
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      style={{
                        background: theme.cardBg,
                        color: theme.textMain
                      }}
                    >
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  className="calendar-status-select"
                  value={
                    selectedShoot.payment_status || 'Unpaid'
                  }
                  onChange={(event) =>
                    handlePaymentStatusChange(
                      selectedShoot,
                      event.target.value,
                      event
                    )
                  }
                  style={{
                    color: getPaymentStyle(
                      selectedShoot.payment_status || 'Unpaid'
                    ).color,
                    backgroundColor: getPaymentStyle(
                      selectedShoot.payment_status || 'Unpaid'
                    ).background,
                    border: `1px solid ${
                      getPaymentStyle(
                        selectedShoot.payment_status || 'Unpaid'
                      ).border
                    }`
                  }}
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      style={{
                        background: theme.cardBg,
                        color: theme.textMain
                      }}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calendar-detail-grid">
                {[
                  ['Client', getClientName(selectedShoot, clients)],
                  ['Date', formatDate(selectedShoot.shoot_date)],
                  ['Time', formatTime(selectedShoot.shoot_date)],
                  [
                    'Price',
                    formatMoney(
                      selectedShoot.gross_income ??
                        selectedShoot.price ??
                        selectedShoot.net_profit
                    )
                  ],
                  [
                    'Location',
                    selectedShoot.location || 'No location'
                  ],
                  [
                    'Category',
                    selectedShoot.category || 'Uncategorized'
                  ],
                  [
                    'Received',
                    formatMoney(getPaidAmount(selectedShoot))
                  ],
                  [
                    'Remaining',
                    formatMoney(getRemainingAmount(selectedShoot))
                  ],
                  [
                    'Expenses',
                    formatMoney(
                      selectedShoot.total_expense ??
                        selectedShoot.expense
                    )
                  ],
                  [
                    'Net Profit',
                    formatMoney(
                      selectedShoot.net_profit ??
                        (Number(selectedShoot.gross_income || 0) -
                          Number(
                            selectedShoot.total_expense || 0
                          ))
                    )
                  ],
                  [
                    'Notes',
                    selectedShoot.notes ||
                      selectedShoot.note ||
                      'No notes'
                  ]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="calendar-detail-item"
                  >
                    <div className="calendar-detail-label">
                      {label}
                    </div>
                    <div className="calendar-detail-value">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="calendar-modal-actions">
                <button
                  type="button"
                  className="calendar-action-button"
                  onClick={() => openEditShoot(selectedShoot)}
                  style={{
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    color: theme.textMain
                  }}
                >
                  <Icon name="edit" size={15} />
                  Edit
                </button>

                <button
                  type="button"
                  className="calendar-action-button"
                  onClick={handleDeleteShoot}
                  style={{
                    background: 'rgba(248,113,113,.1)',
                    border: '1px solid rgba(248,113,113,.3)',
                    color: '#F87171'
                  }}
                >
                  <Icon name="trash" size={15} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentEditor && (
        <div
          className="calendar-modal-backdrop"
          onMouseDown={() => setPaymentEditor(null)}
        >
          <div
            className="calendar-payment-modal"
            onMouseDown={stop}
          >
            <div className="calendar-modal-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 17, color: theme.textMain }}>
                  Update Payment
                </h2>
                <p style={{ margin: '4px 0 0', color: theme.textMuted, fontSize: 10 }}>
                  {getClientName(paymentEditor, clients)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPaymentEditor(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.textMuted,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <Icon name="close" size={17} />
              </button>
            </div>

            <form className="calendar-payment-form" onSubmit={savePaymentAmount}>
              <div className="calendar-payment-totals">
                <div className="calendar-payment-total">
                  <div className="calendar-detail-label">Total Price</div>
                  <div className="calendar-detail-value">
                    {formatMoney(getShootTotal(paymentEditor))}
                  </div>
                </div>

                <div className="calendar-payment-total">
                  <div className="calendar-detail-label">Previously Received</div>
                  <div className="calendar-detail-value">
                    {formatMoney(getPaidAmount(paymentEditor))}
                  </div>
                </div>

                <div className="calendar-payment-total">
                  <div className="calendar-detail-label">New Remaining</div>
                  <div className="calendar-detail-value">
                    {formatMoney(
                      Math.max(
                        getShootTotal(paymentEditor) - Number(paymentAmount || 0),
                        0
                      )
                    )}
                  </div>
                </div>
              </div>

              <label>
                <span
                  style={{
                    display: 'block',
                    marginBottom: 7,
                    color: theme.textMuted,
                    fontSize: 10
                  }}
                >
                  Total amount received so far
                </span>
                <input
                  className="calendar-control"
                  type="number"
                  min="0"
                  max={getShootTotal(paymentEditor)}
                  step="1"
                  inputMode="decimal"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  autoFocus
                  style={{ width: '100%', fontSize: 16 }}
                />
              </label>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 9
                }}
              >
                <button
                  type="button"
                  onClick={() => setPaymentEditor(null)}
                  className="calendar-action-button"
                  style={{
                    background: theme.bg,
                    color: theme.textMain,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="calendar-action-button"
                  style={{
                    background: '#3B82F6',
                    color: '#fff',
                    border: 0
                  }}
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div
          className="calendar-modal-backdrop"
          onMouseDown={closeShootForm}
        >
          <div
            className="calendar-detail-modal"
            style={{
              width: 'min(680px,100%)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onMouseDown={stop}
          >
            <div className="calendar-modal-head">
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: theme.textMain,
                    fontSize: 19
                  }}
                >
                  {editingShoot ? 'Edit Shoot' : 'Add New Shoot'}
                </h2>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: theme.textMuted,
                    fontSize: 11
                  }}
                >
                  {editingShoot
                    ? 'Update the job details and save your changes.'
                    : 'Create a new photography job.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeShootForm}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.textMuted,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateShoot}
              className="calendar-modal-body"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                maxHeight: 'calc(92vh - 112px)',
                overflowY: 'auto',
                paddingBottom: 18,
                scrollbarGutter: 'stable'
              }}
            >
              <select
                required
                className="calendar-control"
                value={formData.client_id}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    client_id: event.target.value
                  })
                }
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <input
                required
                className="calendar-control"
                type="text"
                placeholder="Shoot Title"
                value={formData.title}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    title: event.target.value
                  })
                }
              />

              <input
                className="calendar-control"
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    category: event.target.value
                  })
                }
              />

              <input
                required
                className="calendar-control"
                type="number"
                min="0"
                placeholder="Gross Income"
                value={formData.gross_income}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    gross_income: Number(event.target.value),
                    remaining_amount: Math.max(
                      Number(event.target.value || 0) -
                        Number(formData.paid_amount || 0),
                      0
                    )
                  })
                }
              />

              <input
                className="calendar-control"
                type="number"
                min="0"
                max={Number(formData.gross_income || 0)}
                placeholder="Received Amount"
                value={formData.paid_amount}
                onChange={(event) => {
                  const received = Number(event.target.value || 0);
                  const total = Number(formData.gross_income || 0);

                  setFormData({
                    ...formData,
                    paid_amount: received,
                    remaining_amount: Math.max(total - received, 0)
                  });
                }}
              />

              <input
                className="calendar-control"
                type="text"
                readOnly
                value={`Remaining: ${formatMoney(
                  Math.max(
                    Number(formData.gross_income || 0) -
                      Number(formData.paid_amount || 0),
                    0
                  )
                )}`}
                style={{ opacity: 0.82, cursor: 'default' }}
              />

              <input
                required
                className="calendar-control"
                type="datetime-local"
                value={formData.shoot_date}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    shoot_date: event.target.value
                  })
                }
              />

              <input
                className="calendar-control"
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    location: event.target.value
                  })
                }
              />

              <select
                className="calendar-control"
                value={formData.status}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    status: event.target.value
                  })
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                className="calendar-control"
                value={formData.payment_status}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    payment_status: event.target.value
                  })
                }
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <div
                style={{
                  gridColumn: '1 / -1',
                  marginTop: 2,
                  padding: '12px',
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10
                }}
              >
                <div
                  style={{
                    gridColumn: '1 / -1',
                    color: theme.textMain,
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  Delivery Links
                </div>

                <label style={{ display: 'grid', gap: 5 }}>
                  <span style={{ color: theme.textMuted, fontSize: 9 }}>
                    Drive Link
                  </span>
                  <input
                    className="calendar-control"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.drive_link}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        drive_link: event.target.value
                      })
                    }
                  />
                </label>

                <label style={{ display: 'grid', gap: 5 }}>
                  <span style={{ color: theme.textMuted, fontSize: 9 }}>
                    Gallery Link
                  </span>
                  <input
                    className="calendar-control"
                    type="url"
                    placeholder="Gallery URL"
                    value={formData.gallery_link}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        gallery_link: event.target.value
                      })
                    }
                  />
                </label>

                <label style={{ display: 'grid', gap: 5 }}>
                  <span style={{ color: theme.textMuted, fontSize: 9 }}>
                    Invoice Link
                  </span>
                  <input
                    className="calendar-control"
                    type="url"
                    placeholder="Invoice URL"
                    value={formData.invoice_link}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        invoice_link: event.target.value
                      })
                    }
                  />
                </label>

                <label style={{ display: 'grid', gap: 5 }}>
                  <span style={{ color: theme.textMuted, fontSize: 9 }}>
                    Contract Link
                  </span>
                  <input
                    className="calendar-control"
                    type="url"
                    placeholder="Contract URL"
                    value={formData.contract_link}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        contract_link: event.target.value
                      })
                    }
                  />
                </label>
              </div>

              <textarea
                className="calendar-control"
                placeholder="Notes"
                rows="3"
                value={formData.notes}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    notes: event.target.value
                  })
                }
                style={{
                  gridColumn: '1 / -1',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />

              <div
                style={{
                  gridColumn: '1 / -1',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 4,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 8,
                  padding: '12px 0 2px',
                  background: theme.cardBg
                }}
              >
                <button
                  type="button"
                  onClick={closeShootForm}
                  style={{
                    background: theme.bg,
                    color: theme.textMain,
                    border: `1px solid ${theme.border}`,
                    padding: '11px 17px',
                    borderRadius: 11,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    background: '#3B82F6',
                    color: '#fff',
                    border: 0,
                    padding: '11px 17px',
                    borderRadius: 11,
                    fontWeight: 750,
                    cursor: 'pointer'
                  }}
                >
                  {editingShoot ? 'Save Changes' : 'Save Shoot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
