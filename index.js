// =============================================
//   BOT TWITCH - STREAMER EN PAPIER 📄✂️🦢
//   Version 1.0.0
// =============================================

require('dotenv').config();
const http = require('http');
const tmi = require('tmi.js');
const {
  handleMessage,
  handleSubscription,
  handleGiftedSub,
  handleRaid,
  handleCheer,
} = require('./src/handlers/messageHandler');
const { startAutoMessages } = require('./src/automessages');
const { startLiveAlert } = require('./src/liveAlert');
const { log, LOG_LEVELS, initDB } = require('./src/store');

// ── Serveur HTTP healthcheck (démarre EN PREMIER pour Sliplane) ──────────────
const PORT = process.env.PORT || 3000;

const healthServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    bot: 'Streamer en Papier',
    uptime: Math.floor(process.uptime()),
  }));
});

healthServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Healthcheck HTTP en écoute sur 0.0.0.0:${PORT}`);
  initDB().then(() => startBot());
});

// ── Démarrage du bot (après le healthcheck) ──────────────────────────────────
function startBot() {
  // Validation de la configuration
  const requiredEnvVars = ['BOT_USERNAME', 'BOT_OAUTH_TOKEN', 'CHANNEL_NAME'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes :');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('📄 Configure les variables sur Sliplane et redéploie.');
    // On ne quitte PAS le process — le healthcheck reste actif
    return;
  }

  // Configuration du client TMI.js
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

  // ── Événements ──────────────────────────────────────────────────────────────

  client.on('connected', (addr, port) => {
    log(LOG_LEVELS.INFO, `Connecté à ${addr}:${port}`, { channel: process.env.CHANNEL_NAME, bot: process.env.BOT_USERNAME });
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

  client.on('disconnected', (reason) => {
    log(LOG_LEVELS.WARN, `Déconnecté`, { reason });
  });

  client.on('reconnect', () => {
    log(LOG_LEVELS.INFO, 'Reconnexion en cours...');
  });

  // Messages du chat
  client.on('message', (channel, userstate, message, self) => {
    if (self) return;
    // Premier message du viewer
    if (userstate['first-msg'] === true) {
      const name = userstate['display-name'] || userstate.username;
      client.say(channel, `🌟 Bienvenue ${name} pour ton premier message ! Heureux de t'accueillir dans l'atelier du Streamer en Papier ! 📄✂️🦢`);
    }
    handleMessage(client, channel, userstate, message, self);
  });

  client.on('cheer', (channel, userstate, message) => {
    handleCheer(client, channel, userstate, message);
  });

  client.on('subscription', (channel, username, method, message, userstate) => {
    handleSubscription(client, channel, username, method, message, userstate);
  });

  client.on('resub', (channel, username, months, message, userstate, methods) => {
    handleSubscription(client, channel, username, methods, message, userstate);
  });

  client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
    const gifterName = userstate['display-name'] || username;
    client.say(channel, `🎁 ${gifterName} offre un abonnement à ${recipient} ! Merci pour ta générosité ! 📄🦢`);
  });

  client.on('submysterygift', (channel, username, numbOfSubs, methods, userstate) => {
    handleGiftedSub(client, channel, username, numbOfSubs, methods, userstate);
  });

  client.on('raided', (channel, username, viewers) => {
    log(LOG_LEVELS.INFO, `Raid reçu`, { from: username, viewers });
    handleRaid(client, channel, username, viewers);
  });

  client.on('hosted', (channel, username, viewers, autohost) => {
    if (!autohost) {
      log(LOG_LEVELS.INFO, `Host reçu`, { from: username, viewers });
      client.say(channel, `📣 ${username} héberge le stream avec ${viewers} viewers ! Merci beaucoup ! 📄✂️🦢`);
    }
  });

  client.on('notice', (channel, msgid, message) => {
    console.warn(`[NOTICE] ${msgid}: ${message}`);
  });

  // ── Connexion ────────────────────────────────────────────────────────────────
  console.log('📄 Connexion au chat Twitch...');
  client.connect().then(() => {
    // Démarrer les auto-messages après connexion
    const intervalMinutes = parseInt(process.env.AUTOMSG_INTERVAL) || 20;
    const minMessages = parseInt(process.env.AUTOMSG_MIN_CHAT) || 5;
    startAutoMessages(client, process.env.CHANNEL_NAME, intervalMinutes, minMessages);

    // Démarrer les alertes Discord live
    const liveCheckInterval = parseInt(process.env.LIVE_CHECK_INTERVAL) || 2;
    startLiveAlert(liveCheckInterval);
  }).catch(err => {
    console.error('❌ Erreur de connexion Twitch :', err.message);
    // Retry après 10s sans tuer le process
    setTimeout(() => startBot(), 10000);
  });

  process.on('SIGINT', () => {
    console.log('\n📄 Arrêt du bot... À bientôt ! ✂️🦢');
    client.disconnect();
    process.exit(0);
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('[ERREUR NON GÉRÉE]', reason);
});
