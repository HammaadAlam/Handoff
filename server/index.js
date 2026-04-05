/**
 * Minimal Express server — add auth routes, listings, and DB layer.
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'handoff-api' });
});

// Example: extend with POST /auth/login, GET /listings, etc.

app.listen(PORT, () => {
  console.log(`Handoff API listening on http://localhost:${PORT}`);
});
