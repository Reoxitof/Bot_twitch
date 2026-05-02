// =============================================
//   COMMANDES GÉNÉRALES - Streamer en Papier
// =============================================

const commands = {

  // !bonjour - Accueille le viewer
  bonjour: {
    description: 'Le bot te souhaite la bienvenue',
    cooldown: 10,
    handler: (client, channel, userstate) => {
      const name = userstate['display-name'] || userstate.username;
      const messages = [
        `📄 Bienvenue ${name} ! Tu arrives juste à temps pour plier du papier avec nous ! ✂️`,
        `🗂️ Salut ${name} ! Prends une feuille et installe-toi, le stream commence ! 📄`,
        `✂️ Hey ${name} ! Bienvenue dans l'atelier du Streamer en Papier ! 🦢`,
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  },

  // !discord - Lien Discord
  discord: {
    description: 'Affiche le lien Discord',
    cooldown: 30,
    handler: () => {
      return `📄 Rejoins notre communauté Discord ! → ${process.env.DISCORD_LINK || 'https://discord.gg/streamerenpapier'} 🦢`;
    }
  },

  // !reseaux - Réseaux sociaux
  reseaux: {
    description: 'Affiche les réseaux sociaux',
    cooldown: 30,
    handler: () => {
      return `📱 Retrouve Streamer en Papier sur : TikTok → @StreamerEnPapier | Instagram → @StreamerEnPapier | YouTube → StreamerEnPapier 📄`;
    }
  },

  // !planning - Planning des streams
  planning: {
    description: 'Affiche le planning des streams',
    cooldown: 30,
    handler: () => {
      return `📅 Planning des streams : Lundi, Mercredi & Vendredi à 20h00 | Dimanche à 15h00 📄 Active les notifications pour ne rien rater ! 🔔`;
    }
  },

  // !uptime - Durée du stream
  uptime: {
    description: 'Affiche depuis combien de temps le stream est en ligne',
    cooldown: 10,
    handler: (client, channel, userstate, args, context) => {
      if (context.streamStart) {
        const now = new Date();
        const diff = Math.floor((now - context.streamStart) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        return `⏱️ Le stream est en ligne depuis ${h}h ${m}m ${s}s ! 📄`;
      }
      return `⏱️ Le stream est en cours ! Profites-en bien 📄`;
    }
  },

  // !lurk - Mode lurk
  lurk: {
    description: 'Annonce que tu pars en mode lurk',
    cooldown: 60,
    handler: (client, channel, userstate) => {
      const name = userstate['display-name'] || userstate.username;
      return `📄 ${name} part plier du papier dans l'ombre... Le lurk mode activé ! Merci d'être là 🦢`;
    }
  },

  // !unlurk - Retour du lurk
  unlurk: {
    description: 'Annonce ton retour du mode lurk',
    cooldown: 60,
    handler: (client, channel, userstate) => {
      const name = userstate['display-name'] || userstate.username;
      return `✂️ ${name} est de retour de l'atelier ! Bienvenue parmi nous 📄`;
    }
  },

  // !top - Top viewers par points
  top: {
    description: 'Affiche le top 5 des viewers les plus actifs',
    cooldown: 30,
    handler: (client, channel, userstate) => {
      const { getTop } = require('../store');
      const top = getTop(5);
      if (top.length === 0) return `📄 Pas encore de scores ! Chattez pour gagner des points 📄`;
      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
      const list = top.map((u, i) => `${medals[i]} ${u.username} (${u.points}pts)`).join(' | ');
      return `🏆 Top viewers : ${list} 📄`;
    }
  },
  so: {
    description: 'Fait un shoutout à un streamer (mod only)',
    modOnly: true,
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      if (!args[0]) return `❌ Usage: !so @pseudo`;
      const target = args[0].replace('@', '');
      return `📣 Allez faire un tour sur la chaîne de ${target} → twitch.tv/${target.toLowerCase()} ! Montrez-leur de l'amour 📄✂️`;
    }
  },

};

module.exports = commands;
