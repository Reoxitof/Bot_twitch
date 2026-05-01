// =============================================
//   AUTO-MESSAGES - Streamer en Papier
//   Messages automatiques en rotation
// =============================================

// Liste des messages automatiques (modifie-les comme tu veux)
const AUTO_MESSAGES = [
  // Réseaux sociaux
  `📱 Suis Streamer en Papier sur les réseaux ! TikTok & Instagram → @StreamerEnPapier 📄`,

  // Discord
  `💬 Rejoins notre Discord pour ne rien rater ! → ${process.env.DISCORD_LINK || 'discord.gg/streamerenpapier'} 🦢`,

  // Commandes
  `📄 Tu découvres le stream ? Tape !commandes pour voir tout ce que le bot peut faire ! ✂️`,

  // Abonnement
  `❤️ Tu kiffes le stream ? Un abonnement ou un follow ça fait toujours plaisir ! 📄🦢`,

  // Origami
  `🦢 Envie d'un défi origami ? Tape !origami pour une figure aléatoire ou !defi pour un challenge ! 📄✂️`,

  // Planning
  `📅 Stream en direct ! Active les notifications Twitch pour ne jamais rater un live 🔔📄`,

  // Fun
  `✂️ Pierre Papier Ciseaux contre le bot ? Tape !rps pierre, !rps papier ou !rps ciseaux ! 📄`,

  // Clip
  `🎬 Tu vois un moment épique ? Fais un clip ! Ça aide énormément la chaîne 📄✂️🦢`,

  // Lurk
  `👀 Tu regardes en silence ? Tape !lurk pour le faire savoir ! Chaque viewer compte 📄`,

  // Raid
  `🚀 Tu connais un streamer cool ? Parle-en dans le chat, on pourrait leur rendre visite après le stream ! 📄✂️`,
];

let currentIndex = 0;
let autoMessageInterval = null;

/**
 * Démarre les auto-messages
 * @param {object} client - Client TMI.js
 * @param {string} channel - Nom du canal
 * @param {number} intervalMinutes - Intervalle en minutes (défaut: 20)
 * @param {number} minMessages - Nombre minimum de messages dans le chat avant d'envoyer (défaut: 5)
 */
function startAutoMessages(client, channel, intervalMinutes = 20, minMessages = 5) {
  // Compteur de messages depuis le dernier auto-message
  let messageCount = 0;

  // Écouter les messages pour compter l'activité du chat
  client.on('message', (ch, userstate, message, self) => {
    if (!self) messageCount++;
  });

  const intervalMs = intervalMinutes * 60 * 1000;

  autoMessageInterval = setInterval(() => {
    // N'envoie que si le chat est actif (évite de spammer un chat vide)
    if (messageCount < minMessages) {
      console.log(`[AUTO-MSG] Chat peu actif (${messageCount} messages), message ignoré.`);
      messageCount = 0;
      return;
    }

    const msg = AUTO_MESSAGES[currentIndex % AUTO_MESSAGES.length];
    client.say(channel, msg);
    console.log(`[AUTO-MSG] Envoyé : ${msg.substring(0, 60)}...`);

    currentIndex++;
    messageCount = 0;
  }, intervalMs);

  console.log(`⏰ Auto-messages activés : toutes les ${intervalMinutes} min (min. ${minMessages} messages dans le chat)`);
}

/**
 * Arrête les auto-messages
 */
function stopAutoMessages() {
  if (autoMessageInterval) {
    clearInterval(autoMessageInterval);
    autoMessageInterval = null;
    console.log('⏹️ Auto-messages désactivés.');
  }
}

module.exports = { startAutoMessages, stopAutoMessages };
