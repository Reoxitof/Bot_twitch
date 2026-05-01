// =============================================
//   AUTO-MODÉRATION - Streamer en Papier
//   Limites configurables via AUTOMOD_CONFIG
// =============================================

// ── Configuration des limites ─────────────────────────────────────────────────
const CONFIG = {
  // Spam : nb de messages identiques ou trop rapides
  spam: {
    enabled: true,
    maxSameMsg: 3,        // nb max de messages identiques consécutifs
    timeWindowMs: 10000,  // fenêtre de temps (10 secondes)
    maxMsgInWindow: 5,    // nb max de messages dans la fenêtre
    action: 'timeout',
    duration: 60,
    warnFirst: true,      // avertir avant de sanctionner
  },

  // Caps : trop de majuscules
  caps: {
    enabled: true,
    minLength: 10,        // ignorer les messages courts
    maxCapsPercent: 70,   // % max de majuscules autorisé
    action: 'warn',
    duration: 30,
    warnFirst: true,
  },

  // Liens : bloquer les URLs non autorisées
  links: {
    enabled: true,
    allowedDomains: ['twitch.tv', 'youtube.com', 'youtu.be', 'discord.gg'],
    action: 'delete',     // 'delete' = timeout 1s pour supprimer
    duration: 1,
    warnFirst: true,
  },

  // Mots interdits
  bannedWords: {
    enabled: true,
    words: [],            // à remplir selon tes besoins
    action: 'timeout',
    duration: 300,
    warnFirst: false,     // ban direct sans avertissement
  },

  // Répétition de caractères : "aaaaaaa"
  repetition: {
    enabled: true,
    maxRepeat: 8,         // nb max de caractères identiques consécutifs
    action: 'warn',
    duration: 30,
    warnFirst: true,
  },

  // Emotes spam
  emoteSpam: {
    enabled: true,
    maxEmotes: 15,        // nb max d'emotes par message
    action: 'warn',
    duration: 30,
    warnFirst: true,
  },
};

// ── Stockage des données utilisateurs ────────────────────────────────────────
const userHistory = new Map();   // historique messages par user
const warnings   = new Map();    // nb d'avertissements par user

function getUserData(userId) {
  if (!userHistory.has(userId)) {
    userHistory.set(userId, { messages: [], lastMsg: '', sameCount: 0 });
  }
  return userHistory.get(userId);
}

function getWarnings(userId) {
  return warnings.get(userId) || 0;
}

function addWarning(userId) {
  const w = getWarnings(userId) + 1;
  warnings.set(userId, w);
  return w;
}

// ── Détecteurs ────────────────────────────────────────────────────────────────

function detectSpam(userId, message) {
  if (!CONFIG.spam.enabled) return false;
  const data = getUserData(userId);
  const now  = Date.now();

  // Nettoyage de la fenêtre
  data.messages = data.messages.filter(t => now - t < CONFIG.spam.timeWindowMs);
  data.messages.push(now);

  // Trop de messages dans la fenêtre
  if (data.messages.length > CONFIG.spam.maxMsgInWindow) return true;

  // Messages identiques consécutifs
  if (message === data.lastMsg) {
    data.sameCount = (data.sameCount || 0) + 1;
    if (data.sameCount >= CONFIG.spam.maxSameMsg) return true;
  } else {
    data.sameCount = 0;
    data.lastMsg   = message;
  }

  return false;
}

function detectCaps(message) {
  if (!CONFIG.caps.enabled) return false;
  if (message.length < CONFIG.caps.minLength) return false;
  const letters   = message.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;
  const capsCount = letters.replace(/[^A-Z]/g, '').length;
  return (capsCount / letters.length) * 100 > CONFIG.caps.maxCapsPercent;
}

function detectLink(message) {
  if (!CONFIG.links.enabled) return false;
  const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi;
  const matches  = message.match(urlRegex);
  if (!matches) return false;
  // Vérifier si le lien est dans les domaines autorisés
  for (const url of matches) {
    const allowed = CONFIG.links.allowedDomains.some(d => url.includes(d));
    if (!allowed) return true;
  }
  return false;
}

function detectBannedWord(message) {
  if (!CONFIG.bannedWords.enabled) return false;
  if (CONFIG.bannedWords.words.length === 0) return false;
  const lower = message.toLowerCase();
  return CONFIG.bannedWords.words.some(w => lower.includes(w.toLowerCase()));
}

function detectRepetition(message) {
  if (!CONFIG.repetition.enabled) return false;
  const regex = new RegExp(`(.)\\1{${CONFIG.repetition.maxRepeat},}`, 'i');
  return regex.test(message);
}

function detectEmoteSpam(message, emoteCount) {
  if (!CONFIG.emoteSpam.enabled) return false;
  return emoteCount > CONFIG.emoteSpam.maxEmotes;
}

// ── Appliquer une sanction ────────────────────────────────────────────────────

function applySanction(client, channel, username, userId, rule, reason) {
  const cfg     = CONFIG[rule];
  const warnNb  = getWarnings(userId);

  // Si warnFirst et pas encore averti → avertissement
  if (cfg.warnFirst && warnNb === 0) {
    const w = addWarning(userId);
    client.say(channel,
      `⚠️ @${username} : Attention ! ${reason} (Avertissement ${w}/3). Continue et tu seras sanctionné ! 📄`
    );
    return;
  }

  // 3 avertissements → ban temporaire plus long
  if (warnNb >= 3) {
    const longDur = cfg.duration * 5;
    client.timeout(channel, username, longDur, reason);
    warnings.set(userId, 0); // reset après sanction lourde
    client.say(channel,
      `🚫 @${username} a été timeout ${longDur}s — trop d'avertissements. Raison : ${reason} 📄`
    );
    return;
  }

  // Action normale
  if (cfg.action === 'timeout' || cfg.action === 'delete') {
    addWarning(userId);
    client.timeout(channel, username, cfg.duration, reason);
    if (cfg.action === 'timeout') {
      client.say(channel,
        `✂️ @${username} timeout ${cfg.duration}s — ${reason} 📄`
      );
    }
  } else if (cfg.action === 'ban') {
    client.ban(channel, username, reason);
    client.say(channel, `🚫 @${username} a été banni — ${reason} 📄`);
  } else if (cfg.action === 'warn') {
    const w = addWarning(userId);
    client.say(channel,
      `⚠️ @${username} : ${reason} (Avertissement ${w}/3) 📄`
    );
  }
}

// ── Fonction principale appelée sur chaque message ───────────────────────────

function checkAutoMod(client, channel, userstate, message) {
  // Ignorer les mods et le broadcaster
  if (
    userstate.mod ||
    userstate['user-type'] === 'mod' ||
    userstate.badges?.broadcaster === '1' ||
    userstate.badges?.moderator === '1' ||
    userstate.badges?.vip === '1'
  ) return;

  const userId   = userstate['user-id'] || userstate.username;
  const username = userstate['display-name'] || userstate.username;

  // Compter les emotes
  const emoteCount = userstate.emotes
    ? Object.values(userstate.emotes).reduce((acc, v) => acc + v.length, 0)
    : 0;

  // Vérifications dans l'ordre de priorité
  if (detectBannedWord(message)) {
    applySanction(client, channel, username, userId, 'bannedWords', 'mot interdit');
    return;
  }
  if (detectLink(message)) {
    applySanction(client, channel, username, userId, 'links', 'lien non autorisé');
    return;
  }
  if (detectSpam(userId, message)) {
    applySanction(client, channel, username, userId, 'spam', 'spam détecté');
    return;
  }
  if (detectRepetition(message)) {
    applySanction(client, channel, username, userId, 'repetition', 'répétition excessive de caractères');
    return;
  }
  if (detectEmoteSpam(message, emoteCount)) {
    applySanction(client, channel, username, userId, 'emoteSpam', 'spam d\'emotes');
    return;
  }
  if (detectCaps(message)) {
    applySanction(client, channel, username, userId, 'caps', 'trop de majuscules');
    return;
  }
}

// ── Commandes de config pour les mods ────────────────────────────────────────

function handleAutoModCommand(client, channel, userstate, args) {
  const username = userstate['display-name'] || userstate.username;
  const sub      = args[0]?.toLowerCase();

  if (sub === 'status') {
    const status = Object.entries(CONFIG)
      .map(([k, v]) => `${k}:${v.enabled ? '✅' : '❌'}`)
      .join(' | ');
    client.say(channel, `🛡️ AutoMod — ${status}`);
    return;
  }

  if (sub === 'on' || sub === 'off') {
    const rule = args[1]?.toLowerCase();
    if (CONFIG[rule] !== undefined) {
      CONFIG[rule].enabled = sub === 'on';
      client.say(channel, `🛡️ AutoMod — ${rule} ${sub === 'on' ? 'activé ✅' : 'désactivé ❌'} par @${username}`);
    } else {
      client.say(channel, `❌ Règle inconnue. Disponibles : ${Object.keys(CONFIG).join(', ')}`);
    }
    return;
  }

  if (sub === 'addword') {
    const word = args[1];
    if (!word) { client.say(channel, `❌ Usage: !automod addword <mot>`); return; }
    CONFIG.bannedWords.words.push(word.toLowerCase());
    client.say(channel, `✅ Mot "${word}" ajouté à la liste noire 📄`);
    return;
  }

  if (sub === 'removeword') {
    const word = args[1]?.toLowerCase();
    CONFIG.bannedWords.words = CONFIG.bannedWords.words.filter(w => w !== word);
    client.say(channel, `✅ Mot "${word}" retiré de la liste noire 📄`);
    return;
  }

  if (sub === 'resetwarn') {
    const target = args[1]?.replace('@', '').toLowerCase();
    if (!target) { client.say(channel, `❌ Usage: !automod resetwarn @pseudo`); return; }
    // Chercher par username dans la map
    for (const [id] of warnings) {
      warnings.set(id, 0);
    }
    client.say(channel, `✅ Avertissements réinitialisés pour @${target} 📄`);
    return;
  }

  // Aide
  client.say(channel,
    `🛡️ AutoMod — Commandes: !automod status | !automod on/off <règle> | !automod addword <mot> | !automod removeword <mot> | !automod resetwarn @pseudo`
  );
}

module.exports = { checkAutoMod, handleAutoModCommand, CONFIG };
