import test from 'node:test';
import assert from 'node:assert/strict';
import { getSubscriptionStatus, isSubscriptionActive, canCreate, canModify } from './subscriptionService.js';

test('expired trial subscriptions become read-only', () => {
  const status = getSubscriptionStatus({
    role: 'photographer',
    subscription_plan: 'trial',
    subscription_end: '2020-01-01T00:00:00.000Z'
  });

  assert.equal(status.isActive, false);
  assert.equal(status.isExpired, true);
  assert.equal(status.canCreate, false);
  assert.equal(status.canModify, false);
  assert.equal(isSubscriptionActive({
    role: 'photographer',
    subscription_plan: 'trial',
    subscription_end: '2020-01-01T00:00:00.000Z'
  }), false);
  assert.equal(canCreate({
    role: 'photographer',
    subscription_plan: 'trial',
    subscription_end: '2020-01-01T00:00:00.000Z'
  }), false);
  assert.equal(canModify({
    role: 'photographer',
    subscription_plan: 'trial',
    subscription_end: '2020-01-01T00:00:00.000Z'
  }), false);
});

test('active subscriptions remain writable', () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const status = getSubscriptionStatus({
    role: 'teacher',
    subscription_plan: 'starter',
    subscription_end: future
  });

  assert.equal(status.isActive, true);
  assert.equal(status.isExpired, false);
  assert.equal(status.canCreate, true);
  assert.equal(status.canModify, true);
  assert.equal(isSubscriptionActive({
    role: 'teacher',
    subscription_plan: 'starter',
    subscription_end: future
  }), true);
  assert.equal(canCreate({
    role: 'teacher',
    subscription_plan: 'starter',
    subscription_end: future
  }), true);
  assert.equal(canModify({
    role: 'teacher',
    subscription_plan: 'starter',
    subscription_end: future
  }), true);
});
