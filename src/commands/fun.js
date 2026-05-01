// =============================================
//   COMMANDES FUN - Streamer en Papier
// =============================================

const commands = {

  // !8ball - Boule magique version papier
  '8ball': {
    description: 'Pose une question à la boule de papier magique',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      if (!args.length) return `❓ ${name}, pose une question ! Ex: !8ball Est-ce que je vais réussir mon origami ?`;
      const reponses = [
        '📄 Les plis sont en ta faveur... OUI !',
        '✂️ La feuille dit NON.',
        '🦢 La grue en origami prédit : PEUT-ÊTRE.',
        '📄 Froisse cette idée et recommence... NON.',
        '🌸 Les fleurs de papier disent OUI !',
        '✂️ Snip snip... La réponse est floue.',
        '📄 Absolument OUI ! Plie avec confiance !',
        '🗑️ Cette question finit à la corbeille... NON.',
        '🦢 La grue a parlé : CERTAINEMENT !',
        '📄 Retourne la feuille... OUI de l\'autre côté !',
      ];
      const reponse = reponses[Math.floor(Math.random() * reponses.length)];
      return `🔮 ${name} demande : "${args.join(' ')}" → ${reponse}`;
    }
  },

  // !rps - Pierre Papier Ciseaux
  rps: {
    description: 'Joue à Pierre Papier Ciseaux contre le bot',
    cooldown: 5,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const choixValides = ['pierre', 'papier', 'ciseaux', 'feuille', 'rock', 'paper', 'scissors'];
      const choixJoueur = args[0]?.toLowerCase();

      if (!choixJoueur || !choixValides.includes(choixJoueur)) {
        return `✂️ ${name}, choisis : !rps pierre | !rps papier | !rps ciseaux`;
      }

      const botChoix = ['pierre', 'papier', 'ciseaux'][Math.floor(Math.random() * 3)];
      const emojis = { pierre: '🪨', papier: '📄', ciseaux: '✂️', feuille: '📄', rock: '🪨', paper: '📄', scissors: '✂️' };

      // Normaliser
      const joueur = choixJoueur === 'feuille' ? 'papier' : choixJoueur === 'rock' ? 'pierre' : choixJoueur === 'paper' ? 'papier' : choixJoueur === 'scissors' ? 'ciseaux' : choixJoueur;

      let resultat;
      if (joueur === botChoix) {
        resultat = '🤝 Égalité ! On recommence ?';
      } else if (
        (joueur === 'pierre' && botChoix === 'ciseaux') ||
        (joueur === 'papier' && botChoix === 'pierre') ||
        (joueur === 'ciseaux' && botChoix === 'papier')
      ) {
        resultat = `🎉 ${name} GAGNE ! Bien joué !`;
      } else {
        resultat = `😈 Le bot GAGNE ! Meilleur plieur de papier ici !`;
      }

      return `${emojis[choixJoueur]} ${name} : ${choixJoueur} VS Bot : ${botChoix} ${emojis[botChoix]} → ${resultat}`;
    }
  },

  // !dé / !dice - Lance un dé
  dé: {
    description: 'Lance un dé en papier',
    cooldown: 5,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const faces = parseInt(args[0]) || 6;
      if (faces < 2 || faces > 100) return `📄 ${name}, choisis entre 2 et 100 faces !`;
      const resultat = Math.floor(Math.random() * faces) + 1;
      return `🎲 ${name} lance un dé en papier à ${faces} faces... et obtient ${resultat} ! 📄`;
    }
  },

  // !dice - alias
  dice: {
    description: 'Lance un dé en papier',
    cooldown: 5,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const faces = parseInt(args[0]) || 6;
      if (faces < 2 || faces > 100) return `📄 ${name}, choisis entre 2 et 100 faces !`;
      const resultat = Math.floor(Math.random() * faces) + 1;
      return `🎲 ${name} lance un dé en papier à ${faces} faces... et obtient ${resultat} ! 📄`;
    }
  },

  // !citation - Citation inspirante sur le papier
  citation: {
    description: 'Affiche une citation inspirante',
    cooldown: 15,
    handler: () => {
      const citations = [
        '"Une feuille blanche est une invitation à créer." 📄',
        '"L\'origami transforme le simple en extraordinaire." 🦢',
        '"Chaque pli raconte une histoire." ✂️',
        '"Le papier est patient, il attend que tu le plies." 📄',
        '"Un streamer en papier ne se froisse jamais !" 💪📄',
        '"La créativité, c\'est plier les règles comme du papier." ✂️',
        '"Même les plus grands chefs-d\'œuvre commencent par une feuille blanche." 🌸',
      ];
      return `💬 ${citations[Math.floor(Math.random() * citations.length)]} — Streamer en Papier`;
    }
  },

  // !hug - Câlin en papier
  hug: {
    description: 'Envoie un câlin en papier à quelqu\'un',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const cible = args[0] ? args[0].replace('@', '') : 'tout le chat';
      return `📄 ${name} envoie un câlin en origami à ${cible} ! 🦢💕`;
    }
  },

  // !lancer - Lance quelque chose
  lancer: {
    description: 'Lance un avion en papier sur quelqu\'un',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const cible = args[0] ? args[0].replace('@', '') : 'le streamer';
      const resultats = [
        `✈️ ${name} lance un avion en papier sur ${cible}... DIRECT dans le front ! 📄`,
        `✈️ ${name} lance un avion en papier sur ${cible}... et il atterrit dans la corbeille ! 🗑️`,
        `✈️ ${name} lance un avion en papier sur ${cible}... il fait un looping et revient ! 😂📄`,
        `✈️ ${name} lance un avion en papier sur ${cible}... BULLSEYE ! 🎯📄`,
      ];
      return resultats[Math.floor(Math.random() * resultats.length)];
    }
  },

  // !pp - Profil papier aléatoire fun
  pp: {
    description: 'Génère ton profil de Streamer en Papier',
    cooldown: 20,
    handler: (client, channel, userstate) => {
      const name = userstate['display-name'] || userstate.username;
      const styles = ['Origami Zen', 'Découpeur Fou', 'Plieur Mystique', 'Artiste du Kraft', 'Ninja des Ciseaux', 'Maître du Washi'];
      const outils = ['ciseaux dorés ✂️', 'règle en bambou 📏', 'colle magique 🖊️', 'cutter laser 🔪', 'plioir en jade 💎'];
      const style = styles[Math.floor(Math.random() * styles.length)];
      const outil = outils[Math.floor(Math.random() * outils.length)];
      const niveau = Math.floor(Math.random() * 50) + 1;
      return `📄 Profil de ${name} : Style "${style}" | Outil favori : ${outil} | Niveau : ${niveau} | Spécialité : ${['Grue', 'Fleur', 'Dragon', 'Étoile', 'Avion'][Math.floor(Math.random() * 5)]} ✂️`;
    }
  },

};

module.exports = commands;
