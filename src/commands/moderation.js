// =============================================
//   COMMANDES MODÉRATION - Streamer en Papier
// =============================================

const commands = {

  // !commandes - Liste toutes les commandes
  commandes: {
    description: 'Affiche la liste des commandes',
    cooldown: 30,
    handler: () => {
      return `📄 Commandes disponibles : !bonjour !lurk !unlurk !origami !papier !defi !plie !froisse !ciseau !colle !score !figures !rps !8ball !dé !citation !hug !lancer !pp !discord !reseaux !planning | Mods: !so !timeout !warn 📄`;
    }
  },

  // !aide - Alias de !commandes
  aide: {
    description: 'Affiche l\'aide',
    cooldown: 30,
    handler: () => {
      return `📄 Commandes disponibles : !bonjour !lurk !unlurk !origami !papier !defi !plie !froisse !ciseau !colle !score !figures !rps !8ball !dé !citation !hug !lancer !pp !discord !reseaux !planning | Mods: !so !timeout !warn 📄`;
    }
  },

  // !help - Alias anglais
  help: {
    description: 'Affiche l\'aide',
    cooldown: 30,
    handler: () => {
      return `📄 Commands: !bonjour !lurk !unlurk !origami !papier !defi !plie !froisse !ciseau !colle !score !figures !rps !8ball !dé !citation !hug !lancer !pp !discord !reseaux !planning | Mods: !so !timeout !warn 📄`;
    }
  },

  // !warn - Avertissement (mod only)
  warn: {
    description: 'Avertit un utilisateur (mod only)',
    modOnly: true,
    cooldown: 5,
    handler: (client, channel, userstate, args) => {
      if (!args[0]) return `❌ Usage: !warn @pseudo [raison]`;
      const target = args[0].replace('@', '');
      const raison = args.slice(1).join(' ') || 'comportement inapproprié';
      return `⚠️ @${target} : Avertissement ! Raison : ${raison}. Prochaine fois c'est un timeout ! 📄`;
    }
  },

  // !timeout - Timeout (mod only)
  timeout: {
    description: 'Timeout un utilisateur (mod only)',
    modOnly: true,
    cooldown: 5,
    handler: (client, channel, userstate, args) => {
      if (!args[0]) return `❌ Usage: !timeout @pseudo [durée en secondes]`;
      const target = args[0].replace('@', '');
      const duree = parseInt(args[1]) || 60;
      client.timeout(channel, target, duree, 'Timeout par modérateur');
      return `✂️ @${target} a été mis en timeout pour ${duree} secondes ! 📄`;
    }
  },

  // !rules - Règles du chat
  rules: {
    description: 'Affiche les règles du chat',
    cooldown: 30,
    handler: () => {
      return `📋 Règles du chat : 1️⃣ Respect mutuel 2️⃣ Pas de spam 3️⃣ Pas de pub non autorisée 4️⃣ Pas de spoilers 5️⃣ Amusez-vous ! 📄✂️ Merci de respecter ces règles pour que tout le monde profite du stream !`;
    }
  },

  // !regles - Alias français
  regles: {
    description: 'Affiche les règles du chat',
    cooldown: 30,
    handler: () => {
      return `📋 Règles du chat : 1️⃣ Respect mutuel 2️⃣ Pas de spam 3️⃣ Pas de pub non autorisée 4️⃣ Pas de spoilers 5️⃣ Amusez-vous ! 📄✂️ Merci de respecter ces règles pour que tout le monde profite du stream !`;
    }
  },

  // !titre - Affiche le titre du stream (mod only pour changer)
  titre: {
    description: 'Affiche ou change le titre du stream',
    cooldown: 10,
    handler: (client, channel, userstate, args, context) => {
      if (args.length > 0 && (userstate.mod || userstate['user-type'] === 'mod' || userstate.badges?.broadcaster)) {
        context.streamTitle = args.join(' ');
        return `📝 Titre du stream mis à jour : "${context.streamTitle}" 📄`;
      }
      return `📺 Stream actuel : "${context.streamTitle || 'Streamer en Papier - Live Origami !'}" 📄`;
    }
  },

};

module.exports = commands;
