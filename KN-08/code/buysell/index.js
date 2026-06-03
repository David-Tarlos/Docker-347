const express = require('express');
const cors = require('cors');

const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';
const PORT = process.env.PORT || 8002;

const app = express();
app.use(cors());
app.use(express.json());

// --- Account-Service helpers --------------------------------------------------
// Account API (discovered via Swagger):
//   GET  /Account/Cryptos?userId=X      -> current holding (number or {amount})
//   POST /Account/AddCrypto?userId=X&amount=Y    -> response body: true/false
//   POST /Account/RemoveCrypto?userId=X&amount=Y -> response body: true/false

async function getHolding(id) {
  const r = await fetch(`${ACCOUNT_URL}/Account/Cryptos?userId=${id}`);
  if (!r.ok) throw new Error(`Account GET /Cryptos failed: ${r.status}`);
  const data = await r.json();
  if (typeof data === 'number') return data;
  if (data && typeof data.amount === 'number') return data.amount;
  if (data && typeof data.Amount === 'number') return data.Amount;
  throw new Error('Unexpected Cryptos shape: ' + JSON.stringify(data));
}

async function addCrypto(id, amount) {
  const r = await fetch(`${ACCOUNT_URL}/Account/AddCrypto?userId=${id}&amount=${amount}`, { method: 'POST' });
  return r.ok;
}

async function removeCrypto(id, amount) {
  const r = await fetch(`${ACCOUNT_URL}/Account/RemoveCrypto?userId=${id}&amount=${amount}`, { method: 'POST' });
  return r.ok;
}

// --- Routes ------------------------------------------------------------------

app.post('/buy', async (req, res) => {
  try {
    const id = parseInt(req.body.id, 10);
    const amount = parseInt(req.body.amount, 10);
    if (!Number.isFinite(id) || !Number.isFinite(amount) || amount <= 0) {
      return res.json(false);
    }
    const ok = await addCrypto(id, amount);
    res.json(ok);
  } catch (err) {
    console.error('buy error:', err.message);
    res.json(false);
  }
});

app.post('/sell', async (req, res) => {
  try {
    const id = parseInt(req.body.id, 10);
    const amount = parseInt(req.body.amount, 10);
    if (!Number.isFinite(id) || !Number.isFinite(amount) || amount <= 0) {
      return res.json(false);
    }
    // Spec: "Falls mehr abgezogen werden soll als existieren, wird das Total einfach auf 0 gesetzt."
    // We clamp the amount ourselves so we never try to remove more than the user has.
    const current = await getHolding(id);
    const actual = Math.min(current, amount);
    if (actual <= 0) return res.json(true); // already zero, nothing to remove
    const ok = await removeCrypto(id, actual);
    res.json(ok);
  } catch (err) {
    console.error('sell error:', err.message);
    res.json(false);
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'buysell' }));

app.listen(PORT, () => {
  console.log(`BuySell listening on port ${PORT}, Account URL = ${ACCOUNT_URL}`);
});
