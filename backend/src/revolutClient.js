const axios = require('axios');

const REVOLUT_QUOTE_URL = 'https://www.revolut.com/api/exchange/quote';

async function getRevolutQuote(amount, fromCurr, toCurr) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.revolut.com/',
    'Origin': 'https://www.revolut.com',
  };

  const params = {
    amount: parseInt(amount, 10),
    country: 'GB',
    fromCurrency: fromCurr,
    isRecipientAmount: 'false',
    toCurrency: toCurr,
  };

  try {
    const response = await axios.get(REVOLUT_QUOTE_URL, { headers, params });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Revolut API HTTP Error:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Revolut API Error:', error.message);
    }
    throw new Error('Failed to fetch quote from Revolut');
  }
}

async function getRate(fromCurrency, toCurrency) {
  const supported = ['JPY', 'PHP', 'VND', 'IDR', 'USD', 'CAD', 'SGD'];
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (!supported.includes(from) || !supported.includes(to)) {
    throw new Error(`Unsupported currency pair: ${from} -> ${to}`);
  }

  if (from === to) {
    return { from, to, rate: 1, raw: null };
  }

  // Amount is mostly irrelevant because we read the per-unit rate
  const amount = 10000;
  const data = await getRevolutQuote(amount, from, to);

  const rate = data?.rate?.rate;
  const respFrom = data?.rate?.from;
  const respTo = data?.rate?.to;

  if (!rate || respFrom !== from || respTo !== to) {
    throw new Error('Unexpected response format from Revolut');
  }

  return {
    from,
    to,
    rate,
    raw: data,
  };
}

module.exports = {
  getRevolutQuote,
  getRate,
};
