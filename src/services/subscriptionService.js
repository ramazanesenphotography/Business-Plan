const ACTIVE_PLANS = new Set(['trial', 'starter', 'pro']);

function normalizePlan(plan) {
  return String(plan || '').trim().toLowerCase();
}

function normalizeEndDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getSubscriptionStatus(profile = {}) {
  const role = String(profile?.role || '').toLowerCase();
  const plan = normalizePlan(profile?.subscription_plan);
  const endDate = normalizeEndDate(profile?.subscription_end);
  const isAdmin = role === 'admin';

  if (isAdmin) {
    return {
      plan,
      isActive: true,
      isExpired: false,
      canCreate: true,
      canModify: true,
      reason: 'admin'
    };
  }

  const hasActivePlan = ACTIVE_PLANS.has(plan);
  const isActive = Boolean(hasActivePlan && endDate && endDate.getTime() >= Date.now());
  const isExpired = Boolean(endDate && endDate.getTime() < Date.now());

  return {
    plan,
    isActive,
    isExpired,
    canCreate: isActive,
    canModify: isActive,
    reason: isExpired ? 'expired' : isActive ? 'active' : 'inactive'
  };
}

export function isSubscriptionActive(profile = {}) {
  return getSubscriptionStatus(profile).isActive;
}

export function canCreate(profile = {}) {
  return getSubscriptionStatus(profile).canCreate;
}

export function canModify(profile = {}) {
  return getSubscriptionStatus(profile).canModify;
}
