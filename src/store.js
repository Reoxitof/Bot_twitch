// =============================================
//   STORE - Persistance PostgreSQL
//   Points viewers + logs structurés
// =============================================

const { Pool } = require('pg');

// ── Connexion PostgreSQL ──────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.PG_HOST     || 'postgres-5ljq.internal',
  port:     parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DB       || 'mydb',
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || 'montage2026',
  ssl: false,
  max: 5,
  idleTimeoutMillis: 30000,
});

// ── Cache mémoire (évite trop de requêtes DB) ─────────────────────────────────
const pointsCache = new Map(); // userId → { username, points, messages }
const logsBuffer  = [];        // buffer avant flush en DB
const MAX_LOG_BUFFER = 20;     // flush tous les 20 logs

// ── Init DB ───────────────────────────────────────────────────────────────────
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_points (
        user_id   TEXT PRIMARY KEY,
        username  TEXT NOT NULL,
        points    INTEGER DEFAULT 0,
        messages  INTEGER DEFAULT 0,
        last_seen TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_logs (
        id         SERIAL PRIMARY KEY,
        ts         TIMESTAMP DEFAULT NOW(),
        level      TEXT NOT NULL,
        message    TEXT NOT NULL,
        meta       JSONB DEFAULT '{}'
      )
    `);
    // Index pour requêtes rapides
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bot_logs_ts ON bot_logs(ts DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON bot_logs(level)`);
    console.log('[DB] Tables bot_points et bot_logs prêtes ✅');
  } catch (e) {
    console.error('[DB] Erreur init:', e.message);
  }
}

// ── Points viewers ────────────────────────────────────────────────────────────

async function addPoints(userId, username, amount = 1) {
  // Mise à jour cache
  const cached = pointsCache.get(userId) || { username, points: 0, messages: 0 };
  cached.points   += amount;
  cached.messages += 1;
  cached.username  = username;
  pointsCache.set(userId, cached);

  // Upsert en DB (async, non bloquant)
  pool.query(
    `INSERT INTO bot_points (user_id, username, points, messages, last_seen)
     VALUES ($1, $2, $3, 1, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       username  = EXCLUDED.username,
       points    = bot_points.points + $3,
       messages  = bot_points.messages + 1,
       last_seen = NOW()`,
    [userId, username, amount]
  ).catch(e => console.error('[DB] addPoints:', e.message));

  return cached.points;
}

async function getPoints(userId, username) {
  // Cache d'abord
  if (pointsCache.has(userId)) return pointsCache.get(userId).points;

  try {
    const res = await pool.query('SELECT points FROM bot_points WHERE user_id = $1', [userId]);
    const pts = res.rows[0]?.points || 0;
    pointsCache.set(userId, { username, points: pts, messages: 0 });
    return pts;
  } catch (e) {
    return 0;
  }
}

async function getTop(n = 5) {
  try {
    const res = await pool.query(
      'SELECT username, points, messages FROM bot_points ORDER BY points DESC LIMIT $1', [n]
    );
    return res.rows;
  } catch (e) {
    // Fallback cache
    return [...pointsCache.values()]
      .sort((a, b) => b.points - a.points)
      .slice(0, n);
  }
}

// ── Logs structurés ───────────────────────────────────────────────────────────
const LOG_LEVELS = { INFO: 'INFO', CMD: 'CMD', MOD: 'MOD', WARN: 'WARN', ERROR: 'ERROR' };

const COLORS = {
  INFO: '\x1b[36m', CMD: '\x1b[32m', MOD: '\x1b[33m',
  WARN: '\x1b[33m', ERROR: '\x1b[31m',
};
const RESET = '\x1b[0m';

function log(level, message, meta = {}) {
  const ts = new Date().toISOString();

  // Console colorée
  const color    = COLORS[level] || '';
  const metaStr  = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  console.log(`${color}[${ts.slice(11,19)}][${level}]${RESET} ${message}${metaStr}`);

  // Buffer pour flush DB
  logsBuffer.push({ ts, level, message, meta });
  if (logsBuffer.length >= MAX_LOG_BUFFER) flushLogs();
}

async function flushLogs() {
  if (logsBuffer.length === 0) return;
  const toFlush = logsBuffer.splice(0, logsBuffer.length);
  try {
    const values = toFlush.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(',');
    const params = toFlush.flatMap(l => [l.ts, l.level, l.message, JSON.stringify(l.meta)]);
    await pool.query(
      `INSERT INTO bot_logs (ts, level, message, meta) VALUES ${values}`,
      params
    );
  } catch (e) {
    console.error('[DB] flushLogs:', e.message);
  }
}

// Flush automatique toutes les 30s
setInterval(flushLogs, 30000);

async function getLogs(n = 50, level = null) {
  try {
    if (level) {
      const res = await pool.query(
        'SELECT ts, level, message, meta FROM bot_logs WHERE level = $1 ORDER BY ts DESC LIMIT $2',
        [level, n]
      );
      return res.rows;
    }
    const res = await pool.query(
      'SELECT ts, level, message, meta FROM bot_logs ORDER BY ts DESC LIMIT $1', [n]
    );
    return res.rows;
  } catch (e) {
    return [];
  }
}

module.exports = { initDB, addPoints, getPoints, getTop, log, getLogs, LOG_LEVELS };
