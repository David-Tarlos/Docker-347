const express = require('express');
const cors = require('cors');

const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';
const PORT = process.env.PORT || 8003;

const app = express();
app.use(cors());
app.use(express.json());

// --- Account-Service helpers -------------------------------------------------
// Account API (Swagger):
//   GET  /Account/Cryptos?userId=X   -> number or {amount}
//   GET  /Account/Friends?userId=X   -> list of friend IDs / friend objects
//   POST /Account/AddCrypto?userId=X&amount=Y    -> true/false
//   POST /Account/RemoveCrypto?userId=X&amount=Y -> true/false

async function getHolding(id) {
  const r = await fetch(`${ACCOUNT_URL}/Account/Cryptos?userId=${id}`);
  if (!r.ok) throw new Error(`Account GET /Cryptos failed: ${r.status}`);
  const data = await r.json();
  if (typeof data === 'number') return data;
  if (data && typeof data.amount === 'number') return data.amount;
  if (data && typeof data.Amount === 'number') return data.Amount;
  throw new Error('Unexpected Cryptos shape: ' + JSON.stringify(data));
}

async function getFriendIds(id) {
  const r = await fetch(`${ACCOUNT_URL}/Account/Friends?userId=${id}`);
  if (!r.ok) throw new Error(`Account GET /Friends failed: ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected Friends shape: ' + JSON.stringify(data));
  }
  // Accept either an array of numbers or an array of objects with an id field
  return data
    .map(f => {
      if (typeof f === 'number') return f;
      if (typeof f === 'object' && f !== null) {
        return f.id ?? f.Id ?? f.userId ?? f.UserId ?? f.friendId ?? f.FriendId;
      }
      return null;
    })
    .filter(x => typeof x === 'number');
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

app.post('/send', async (req, res) => {
  try {
    const id = parseInt(req.body.id, 10);
    const receiverId = parseInt(req.body.receiverId, 10);
    const amount = parseInt(req.body.amount, 10);
    if (!Number.isFinite(id) || !Number.isFinite(receiverId) || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'invalid input' });
    }

    const friends = await getFriendIds(id);
    if (!friends.includes(receiverId)) {
      return res.status(400).json({ success: false, error: 'receiver is not a friend' });
    }

    const senderHolding = await getHolding(id);
    if (senderHolding < amount) {
      return res.status(400).json({ success: false, error: 'insufficient balance' });
    }

    const okRemove = await removeCrypto(id, amount);
    const okAdd = await addCrypto(receiverId, amount);

    res.json({ success: okRemove && okAdd });
  } catch (err) {
    console.error('send error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'sendreceive' }));

app.listen(PORT, () => {
  console.log(`SendReceive listening on port ${PORT}, Account URL = ${ACCOUNT_URL}`);
});
