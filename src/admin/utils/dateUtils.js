export function formatDateForDisplay(value) {
  if (!value) return '—';

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function toInputDateValue(value) {
  if (!value) return '';

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSubscriptionPlanDates(plan, baseDate = new Date()) {
  if (!plan) {
    return {
      subscription_start: '',
      subscription_end: ''
    };
  }

  const start = new Date(baseDate || new Date());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  switch (plan) {
    case 'trial':
      end.setDate(end.getDate() + 14);
      break;
    case 'starter':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'pro':
      end.setFullYear(end.getFullYear() + 1);
      break;
    default:
      return {
        subscription_start: '',
        subscription_end: ''
      };
  }

  return {
    subscription_start: toSupabaseDateValue(start),
    subscription_end: toSupabaseDateValue(end)
  };
}

export function toSupabaseDateValue(value) {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
