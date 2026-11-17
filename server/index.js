const path = require('path');
const express = require('express');
const { sendToSupport } = require('./support');

const crypto = require('crypto');

const formTokens = new Map();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.get('/contact-token', (req, res) => {
  const token = crypto.randomUUID();

  formTokens.set(token, Date.now());

  res.json({ token });
});

app.post('/contact', (req, res) => {
  const website = (req.body.website || '').trim();
  const formToken = (req.body.formToken || '').trim();
  const formLoadedAt = formTokens.get(formToken);

  formTokens.delete(formToken);

  if (website || !formLoadedAt || Date.now() - formLoadedAt < 3000) {
    return res.json({ ok: true });
  }

  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const message = (req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, email and message.' });
  }

  sendToSupport({ name, email, message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Calico Media site running at http://localhost:${PORT}`);
});
