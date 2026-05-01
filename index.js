// =============================================
//   BOT TWITCH - STREAMER EN PAPIER 📄✂️🦢
//   Version 1.0.0
// =============================================

require('dotenv').config();
const tmi = require('tmi.js');
const {
  handleMessage,
  handleSubscription,
  handleGiftedSub,
  handleRaid,
  handleCheer,
} = require('./src/handlers/messageHandler');

// ── Validation de la configuration ──────────────────────────────────────────
const requiredEnvVars = ['BOT_USERNAME', 'BOT_OAUTH_TOKEN', 'CHANNEL_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes :');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n📄 Copie .env.example en .env et remplis les valeurs.');
  process.exit(1);
}

// ── Configuration du client TMI.js ──────────────────────────────────────────
const client = new tmi.Client({
  options: {
    debug: process.env.DEBUG === 'true',
    messagesLogLevel: 'info',
  },
  connection: {
    reconnect: true,
    secure: true,
    maxReconnectAttempts: 10,
    reconnectInterval: 5000,
  },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_OAUTH_TOKEN,
  },
  channels: [process.env.CHANNEL_NAME],
});

// ── Événements du client ─────────────────────────────────────────────────────

// Connexion réussie
client.on('connected', (addr, port) => {
  console.log('');
  console.log('📄 ═══════════════════════════════════════════');
  console.log('📄   BOT TWITCH - STREAMER EN PAPIER');
  console.log('📄 ═══════════════════════════════════════════');
  console.log(`✅  Connecté à ${addr}:${port}`);
  console.log(`📺  Canal : #${process.env.CHANNEL_NAME}`);
  console.log(`🤖  Bot   : ${process.env.BOT_USERNAME}`);
  console.log(`🔧  Préfixe : ${process.env.COMMAND_PREFIX || '!'}`);
  console.log('📄 ═══════════════════════════════════════════');
  console.log('');
});

// Déconnexion
client.on('disconnected', (reason) => {
  console.warn(`⚠️  Déconnecté : ${reason}`);
});

// Reconnexion
client.on('reconnect', () => {
  console.log('🔄 Reconnexion en cours...');
});

// Messages du chat
client.on('message', (channel, userstate, message, self) => {
  handleMessage(client, channel, userstate, message, self);
});

// Cheer (bits)
client.on('cheer', (channel, userstate, message) => {
  handleCheer(client, channel, userstate, message);
});

// Abonnement
client.on('subscription', (channel, username, method, message, userstate) => {
  handleSubscription(client, channel, username, method, message, userstate);
});

// Réabonnement
client.on('resub', (channel, username, months, message, userstate, methods) => {
  handleSubscription(client, channel, username, methods, message, userstate);
});

// Abonnement offert
client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  const gifterName = userstate['display-name'] || username;
  client.say(channel, `🎁 ${gifterName} offre un abonnement à ${recipient} ! Merci pour ta générosité ! 📄🦢`);
});

// Abonnements en masse
client.on('submysterygift', (channel, username, numbOfSubs, methods, userstate) => {
  handleGiftedSub(client, channel, username, numbOfSubs, methods, userstate);
});

// Raid
client.on('raided', (channel, username, viewers) => {
  handleRaid(client, channel, username, viewers);
});

// Hôte
client.on('hosted', (channel, username, viewers, autohost) => {
  if (!autohost) {
    client.say(channel, `📣 ${username} héberge le stream avec ${viewers} viewers ! Merci beaucoup ! 📄✂️🦢`);
  }
});

// Nouveau viewer (première fois dans le chat)
client.on('message', (channel, userstate, message, self) => {
  if (self) return;
  if (userstate['first-msg'] === true) {
    const name = userstate['display-name'] || userstate.username;
    client.say(channel, `🌟 Bienvenue ${name} pour ton premier message ! Heureux de t'accueillir dans l'atelier du Streamer en Papier ! 📄✂️🦢`);
  }
});

// ── Gestion des erreurs ──────────────────────────────────────────────────────
client.on('notice', (channel, msgid, message) => {
  console.warn(`[NOTICE] ${msgid}: ${message}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[ERREUR NON GÉRÉE]', reason);
});

process.on('SIGINT', () => {
  console.log('\n📄 Arrêt du bot Streamer en Papier... À bientôt ! ✂️🦢');
  client.disconnect();
  process.exit(0);
});

// ── Serveur HTTP healthcheck (requis par Sliplane) ───────────────────────────
const http = require('http');
const PORT = process.env.PORT || 3000;

const healthServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', bot: 'Streamer en Papier', uptime: process.uptime() }));
});

healthServer.listen(PORT, () => {
  console.log(`🌐 Healthcheck HTTP sur le port ${PORT}`);
});

// ── Démarrage ────────────────────────────────────────────────────────────────
console.log('📄 Démarrage du Bot Twitch - Streamer en Papier...');
client.connect().catch(err => {
  console.error('❌ Erreur de connexion :', err.message);
  process.exit(1);
});
