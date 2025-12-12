const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// const db = require('./db'); // no longer used with direct Postgres
const { supabase } = require('./supabaseClient');
const { getRate } = require('./revolutClient');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get live rate from -> to currency
app.get('/api/rate', async (req, res) => {
  const { from = 'JPY', to } = req.query;

  if (!to) {
    return res.status(400).json({ error: 'Missing query param: to' });
  }

  try {
    const { from: fromCode, to: toCode, rate, raw } = await getRate(from, to);
    res.json({
      from: fromCode,
      to: toCode,
      rate,
      provider: 'revolut',
      fetchedAt: new Date().toISOString(),
      // rawResponse: raw, // Uncomment if you want to debug full payload
    });
  } catch (error) {
    console.error('Error in /api/rate:', error.message);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

// Save a rate to shared history
app.post('/api/history', async (req, res) => {
  const { from = 'JPY', to, rate, note = null, userId, userName = null } = req.body || {};

  if (!to || typeof rate !== 'number' || !userId) {
    return res.status(400).json({
      error: 'Missing or invalid fields. Required: to, rate(number), userId',
    });
  }

  const allowedCurrencies = ['JPY', 'PHP', 'VND', 'IDR', 'USD', 'CAD', 'SGD'];
  if (!allowedCurrencies.includes(from) || !allowedCurrencies.includes(to)) {
    return res.status(400).json({ error: 'Unsupported currency code' });
  }

  try {
    const { data, error } = await supabase
      .from('saved_rates')
      .insert([
        {
          from_currency: from,
          to_currency: to,
          rate,
          note,
          user_id: userId,
          user_name: userName,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save rate' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in /api/history (insert):', error.message);
    res.status(500).json({ error: 'Failed to save rate' });
  }
});

// Get public history (latest N records)
app.get('/api/history/public', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const safeLimit = Number.isNaN(limit) ? 50 : Math.min(limit, 200);

  // Optional filters: fromDate, toDate (ISO8601 strings), date (YYYY-MM-DD), from_currency, to_currency
  const { fromDate, toDate, date, from_currency, to_currency } = req.query || {};

  try {
    // validate date inputs
    if (date) {
      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format; expected YYYY-MM-DD' });
      }
    }
    if (fromDate) {
      const d = new Date(fromDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid fromDate' });
    }
    if (toDate) {
      const d = new Date(toDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid toDate' });
    }
    let query = supabase
      .from('saved_rates')
      .select('id, from_currency, to_currency, rate, note, user_id, user_name, created_at')
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (date) {
      // date in YYYY-MM-DD
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    } else {
      if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString());
      if (toDate) query = query.lte('created_at', new Date(toDate).toISOString());
    }

    if (from_currency) query = query.eq('from_currency', from_currency.toUpperCase());
    if (to_currency) query = query.eq('to_currency', to_currency.toUpperCase());

    const { data, error } = await query;

    if (error) {
      console.error('Supabase public history error:', error);
      return res.status(500).json({ error: 'Failed to load public history' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/history/public:', error.message);
    res.status(500).json({ error: 'Failed to load public history' });
  }
});

// Get personal history for a given userId
app.get('/api/history/me', async (req, res) => {
  const { userId, fromDate, toDate, date, from_currency, to_currency } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing query param: userId' });
  }

  try {
    // validate date inputs
    if (date) {
      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format; expected YYYY-MM-DD' });
      }
    }
    if (fromDate) {
      const d = new Date(fromDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid fromDate' });
    }
    if (toDate) {
      const d = new Date(toDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid toDate' });
    }
    let query = supabase
      .from('saved_rates')
      .select('id, from_currency, to_currency, rate, note, user_id, user_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    } else {
      if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString());
      if (toDate) query = query.lte('created_at', new Date(toDate).toISOString());
    }

    if (from_currency) query = query.eq('from_currency', from_currency.toUpperCase());
    if (to_currency) query = query.eq('to_currency', to_currency.toUpperCase());

    const { data, error } = await query;

    if (error) {
      console.error('Supabase personal history error:', error);
      return res.status(500).json({ error: 'Failed to load user history' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/history/me:', error.message);
    res.status(500).json({ error: 'Failed to load user history' });
  }
});

app.listen(port, () => {
  console.log(`Exchange rate backend listening on port ${port}`);
});
