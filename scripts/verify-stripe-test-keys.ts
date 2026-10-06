import assert from 'node:assert/strict';
import { getStripeSecretKey, getStripePublishableKey } from '../server/stripeClient';

// All credentials below are synthetic fixtures; no Stripe requests are made.
process.env.NODE_ENV = 'development';
process.env.REPLIT_DEPLOYMENT = '0';
process.env.STRIPE_TEST_SECRET_KEY = ' sk_test_fixture ';
process.env.STRIPE_TEST_PUBLISHABLE_KEY = ' pk_test_fixture ';

assert.equal(await getStripeSecretKey(), 'sk_test_fixture');
assert.equal(await getStripePublishableKey(), 'pk_test_fixture');

delete process.env.STRIPE_TEST_PUBLISHABLE_KEY;
await assert.rejects(getStripeSecretKey, /Set both/);
process.env.STRIPE_TEST_PUBLISHABLE_KEY = 'pk_test_fixture';
process.env.STRIPE_TEST_SECRET_KEY = 'sk_live_fixture';
await assert.rejects(getStripeSecretKey, /test-mode keys/);
process.env.STRIPE_TEST_SECRET_KEY = 'sk_test_fixture';
process.env.STRIPE_TEST_PUBLISHABLE_KEY = 'pk_live_fixture';
await assert.rejects(getStripeSecretKey, /test-mode keys/);
process.env.STRIPE_TEST_SECRET_KEY = 'rk_test_fixture';
process.env.STRIPE_TEST_PUBLISHABLE_KEY = 'pk_test_fixture';
assert.equal(await getStripeSecretKey(), 'rk_test_fixture');

let connectorCalls = 0;
globalThis.fetch = (async (url: string | URL | Request) => {
  connectorCalls++;
  const environment = new URL(String(url)).searchParams.get('environment');
  assert.equal(environment, process.env.REPLIT_DEPLOYMENT === '1' ? 'production' : 'development');
  return new Response(JSON.stringify({
    items: [{ settings: { secret: 'managed_fixture', publishable: 'managed_public_fixture' } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;
process.env.REPLIT_CONNECTORS_HOSTNAME = 'connector.invalid';
process.env.REPL_IDENTITY = 'synthetic_fixture';

process.env.REPLIT_DEPLOYMENT = '1';
assert.equal(await getStripeSecretKey(), 'managed_fixture');
process.env.REPLIT_DEPLOYMENT = '0';
process.env.NODE_ENV = 'production';
assert.equal(await getStripeSecretKey(), 'managed_fixture');
process.env.NODE_ENV = 'development';
delete process.env.STRIPE_TEST_SECRET_KEY;
delete process.env.STRIPE_TEST_PUBLISHABLE_KEY;
assert.equal(await getStripeSecretKey(), 'managed_fixture');
assert.equal(connectorCalls, 3);
console.log('PASS: test overrides, missing/invalid keys, managed fallback, and production isolation');
