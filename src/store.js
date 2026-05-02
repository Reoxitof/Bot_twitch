// =============================================
//   STORE - Persistance en mémoire
//   Points viewers + logs structurés
// =============================================

// ── Points viewers ────────────────────────────────────────────────────────────
// Map userId → { username, points, messages, lastSeen }
const pointsStore = new Map();

function getUser(userId, username) {
  if (!pointsStore.has(userId)) {
    pointsStore.set(userId, { username, points: 0, messages: 0, lastSeen: Date.now() });
  }
  const u = pointsStore.get(userId);
  if (username) u.username = username; // mise à jour du pseudo
  return u;
}

function addPoints(userId, username, amount = 1) {
  const u = getUser(userId, username);
  u.points += amount;
  u.messages++;
  u.lastSeen = Date.now();
  return u.points;
}

function getPoints(userId, username) {
  return getUser(userId, username).points;
}

function getTop(n = 5) {
  return [...pointsStore.values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, n);
}

// ── Logs structurés ───────────────────────────────────────────────────────────
const logs = [];
const MAX_LOGS = 500;

const LOG_LEVELS = { INFO: 'INFO', CMD: 'CMD', MOD: 'MOD', WARN: 'WARN', ERROR: 'ERROR' };

function log(level, message, meta = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();

  // Affichage console coloré
  const colors = { INFO: '\x1b[36m', CMD: '\x1b[32m', MOD: '\x1b[33m', WARN: '\x1b[33m', ERROR: '\x1b[31m' };
  const reset = '\x1b[0m';
  const color = colors[level] || '';
  const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  console.log(`${color}[${entry.ts.slice(11,19)}][${level}]${reset} ${message}${metaStr}`);
}

function getLogs(n = 50, level = null) {
  let result = level ? logs.filter(l => l.level === level) : logs;
  return result.slice(-n);
}

module.exports = { getUser, addPoints, getPoints, getTop, log, getLogs, LOG_LEVELS };
