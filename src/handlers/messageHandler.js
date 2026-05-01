// =============================================
//   GESTIONNAIRE DE MESSAGES - Streamer en Papier
// =============================================

const generalCommands = require('../commands/general');
const papierCommands = require('../commands/papier');
const funCommands = require('../commands/fun');
const moderationCommands = require('../commands/moderation');
const { checkAutoMod, handleAutoModCommand } = require('./automod');

// Fusion de toutes les commandes
const allCommands = {
  ...generalCommands,
  ...papierCommands,
  ...funCommands,
  ...moderationCommands,
};

// Cooldowns par utilisateur et par commande
const cooldowns = new Map();

// Contexte global du stream
const streamContext = {
  streamStart: new Date(),
  streamTitle: 'Streamer en Papier - Live Origami !',
};

/**
 * Vérifie si un utilisateur est modérateur ou broadcaster
 */
function isMod(userstate) {
  return (
    userstate.mod === true ||
    userstate['user-type'] === 'mod' ||
    userstate.badges?.broadcaster === '1' ||
    userstate.badges?.moderator === '1'
  );
}

/**
 * Vérifie le cooldown d'une commande pour un utilisateur
 * @returns {number} Secondes restantes (0 si pas de cooldown)
 */
function checkCooldown(userId, commandName, cooldownSeconds) {
  const key = `${userId}:${commandName}`;
  const now = Date.now();
  const lastUsed = cooldowns.get(key);

  if (lastUsed) {
    const elapsed = (now - lastUsed) / 1000;
    if (elapsed < cooldownSeconds) {
      return Math.ceil(cooldownSeconds - elapsed);
    }
  }

  cooldowns.set(key, now);
  return 0;
}

/**
 * Gestionnaire principal des messages Twitch
 */
function handleMessage(client, channel, userstate, message, self) {
  // Ignorer les messages du bot lui-même
  if (self) return;

  // ── Auto-modération (avant tout le reste) ──────────────────────────────────
  checkAutoMod(client, channel, userstate, message);

  const prefix = process.env.COMMAND_PREFIX || '!';

  // Vérifier si c'est une commande
  if (!message.startsWith(prefix)) return;

  // Parser la commande
  const parts = message.slice(prefix.length).trim().split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Commande spéciale automod (mod only, gérée séparément)
  if (commandName === 'automod') {
    if (!isMod(userstate)) {
      client.say(channel, `❌ @${userstate['display-name'] || userstate.username}, cette commande est réservée aux modérateurs !`);
      return;
    }
    handleAutoModCommand(client, channel, userstate, args);
    return;
  }

  // Chercher la commande
  const command = allCommands[commandName];
  if (!command) return;

  const userId = userstate['user-id'] || userstate.username;
  const username = userstate['display-name'] || userstate.username;

  // Vérifier les permissions mod
  if (command.modOnly && !isMod(userstate)) {
    client.say(channel, `❌ @${username}, cette commande est réservée aux modérateurs ! 📄`);
    return;
  }

  // Vérifier le cooldown (les mods ignorent le cooldown)
  if (!isMod(userstate)) {
    const globalCooldown = parseInt(process.env.COMMAND_COOLDOWN) || 3;
    const commandCooldown = command.cooldown || globalCooldown;
    const remaining = checkCooldown(userId, commandName, commandCooldown);

    if (remaining > 0) {
      if (process.env.DEBUG === 'true') {
        console.log(`[COOLDOWN] ${username} - !${commandName} - ${remaining}s restantes`);
      }
      return; // Silencieux sur le cooldown
    }
  }

  // Exécuter la commande
  try {
    const response = command.handler(client, channel, userstate, args, streamContext);
    if (response) {
      client.say(channel, response);
    }

    if (process.env.DEBUG === 'true') {
      console.log(`[CMD] ${username} → !${commandName} ${args.join(' ')}`);
    }
  } catch (error) {
    console.error(`[ERREUR] Commande !${commandName} :`, error.message);
  }
}

/**
 * Gestionnaire des nouveaux abonnés
 */
function handleSubscription(client, channel, username, method, message, userstate) {
  const months = userstate['msg-param-cumulative-months'] || 1;
  const tier = userstate['msg-param-sub-plan'] === 'Prime' ? 'Twitch Prime' : `Tier ${Math.floor(userstate['msg-param-sub-plan'] / 1000) || 1}`;

  if (months > 1) {
    client.say(channel, `🎉 Merci ${username} pour tes ${months} mois d'abonnement (${tier}) ! Tu es un vrai Maître du Papier ! 📄🦢✨`);
  } else {
    client.say(channel, `🎉 Bienvenue dans la famille ${username} ! Merci pour ton abonnement (${tier}) ! Tu rejoins l'atelier du Streamer en Papier ! 📄✂️🦢`);
  }
}

/**
 * Gestionnaire des gifted subs
 */
function handleGiftedSub(client, channel, username, numbOfSubs, methods, userstate) {
  if (numbOfSubs > 1) {
    client.say(channel, `🎁 INCROYABLE ! ${username} offre ${numbOfSubs} abonnements ! Quelle générosité ! 📄✂️🦢 Merci infiniment !`);
  } else {
    client.say(channel, `🎁 ${username} offre un abonnement ! Trop généreux ! 📄🦢 Merci !`);
  }
}

/**
 * Gestionnaire des raids
 */
function handleRaid(client, channel, username, viewers) {
  client.say(channel, `🚨 RAID ! ${username} débarque avec ${viewers} viewers ! 📄✂️ Bienvenue à toute la team ! Installez-vous, prenez une feuille et profitez du stream ! 🦢`);
}

/**
 * Gestionnaire des bits/cheers
 */
function handleCheer(client, channel, userstate, message) {
  const bits = userstate.bits;
  const username = userstate['display-name'] || userstate.username;

  if (bits >= 1000) {
    client.say(channel, `💎 WOW ! ${username} envoie ${bits} bits ! Tu es une LÉGENDE du Papier ! 📄🐉✨ Merci énormément !`);
  } else if (bits >= 100) {
    client.say(channel, `⭐ ${username} envoie ${bits} bits ! Merci beaucoup ! Tu es un Maître Origami ! 📄🦢`);
  } else {
    client.say(channel, `📄 Merci ${username} pour tes ${bits} bits ! Chaque pli compte ! ✂️`);
  }
}

module.exports = {
  handleMessage,
  handleSubscription,
  handleGiftedSub,
  handleRaid,
  handleCheer,
};
