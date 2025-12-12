const axios = require('axios');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';
const TIMEOUT = 10000;

function log(title, msg) {
  console.log('---', title);
  if (msg) console.log(msg);
}

async function testHealth() {
  log('Health', `GET ${BACKEND}/api/health`);
  const res = await axios.get(`${BACKEND}/api/health`, { timeout: TIMEOUT });
  console.log(res.data);
}

async function testRate(to = 'VND', from = 'JPY') {
  log('Rate', `GET ${BACKEND}/api/rate?from=${from}&to=${to}`);
  const res = await axios.get(`${BACKEND}/api/rate`, { params: { from, to }, timeout: TIMEOUT });
  console.log(res.data);
  return res.data;
}

async function testSaveHistory(userId, userName = 'test-user', from = 'JPY', to = 'VND', rate = 190.5) {
  const payload = {
    from,
    to,
    rate,
    note: 'Automated test save',
    userId,
    userName,
  };

  log('Save History', `POST ${BACKEND}/api/history`);
  const res = await axios.post(`${BACKEND}/api/history`, payload, { timeout: TIMEOUT });
  console.log(res.data);
  return res.data;
}

async function testPublicHistory(limit = 5, filters = {}) {
  log('Public History', `GET ${BACKEND}/api/history/public?limit=${limit}&${new URLSearchParams(filters).toString()}`);
  const res = await axios.get(`${BACKEND}/api/history/public`, { params: { limit, ...filters }, timeout: TIMEOUT });
  console.log(`count=${res.data.length}`);
  return res.data;
}

async function testPersonalHistory(userId, filters = {}) {
  log('Personal History', `GET ${BACKEND}/api/history/me?userId=${userId}&${new URLSearchParams(filters).toString()}`);
  const res = await axios.get(`${BACKEND}/api/history/me`, { params: { userId, ...filters }, timeout: TIMEOUT });
  console.log(`count=${res.data.length}`);
  return res.data;
}

function uuid() {
  return 'uid-' + Math.random().toString(36).slice(2, 10);
}

function isoNowMinus(ms) {
  return new Date(Date.now() - ms).toISOString();
}

async function run() {
  try {
    await testHealth();
    await testRate('VND');

    const userId = uuid();
    console.log('Using test userId:', userId);

    const saved = await testSaveHistory(userId, 'automated-test');
    if (!saved || !saved.id) throw new Error('Save responded without id');

    // Test public history filter by date range (include item just inserted)
    const start = isoNowMinus(60 * 1000); // 1 minute ago
    const end = new Date().toISOString();
    const pub = await testPublicHistory(10, { fromDate: start, toDate: end });
    if (!Array.isArray(pub)) throw new Error('Public history response invalid');

    // Test personal history filter by date range
    const me = await testPersonalHistory(userId, { fromDate: start, toDate: end });
    if (!Array.isArray(me) || me.length === 0) throw new Error('Personal history missing saved item');

    // Test public history filter by specific date (YYYY-MM-DD)
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const pubDate = await testPublicHistory(10, { date: todayStr });
    const meDate = await testPersonalHistory(userId, { date: todayStr });
    if (!Array.isArray(meDate)) throw new Error('Personal date filter failed');
    if (!Array.isArray(pubDate)) throw new Error('Public date filter failed');

    // Test public history filter by currency
    const pubCurrency = await testPublicHistory(10, { to_currency: 'VND' });
    if (!Array.isArray(pubCurrency)) throw new Error('Public currency filter failed');

    console.log('\nAll tests passed');
    process.exit(0);
  } catch (err) {
    console.error('\nTest failed:', err.message || err);
    if (err.response) console.error('Response data:', err.response.data);
    process.exit(1);
  }
}

run();
