// =============================================
//   COMMANDES THÉMATIQUES PAPIER - Streamer en Papier
// =============================================

// Figures d'origami disponibles
const FIGURES_ORIGAMI = [
  { nom: '🦢 Grue en origami', difficulte: '⭐⭐⭐', temps: '15 min', symbole: '🦢' },
  { nom: '🐸 Grenouille sauteuse', difficulte: '⭐⭐', temps: '10 min', symbole: '🐸' },
  { nom: '🌸 Fleur de lotus', difficulte: '⭐⭐⭐⭐', temps: '25 min', symbole: '🌸' },
  { nom: '⭐ Étoile ninja', difficulte: '⭐⭐', temps: '8 min', symbole: '⭐' },
  { nom: '🐉 Dragon', difficulte: '⭐⭐⭐⭐⭐', temps: '45 min', symbole: '🐉' },
  { nom: '🚀 Fusée en papier', difficulte: '⭐', temps: '3 min', symbole: '🚀' },
  { nom: '🦋 Papillon', difficulte: '⭐⭐', temps: '12 min', symbole: '🦋' },
  { nom: '🐦 Oiseau qui bat des ailes', difficulte: '⭐⭐⭐', temps: '20 min', symbole: '🐦' },
  { nom: '🌺 Rose en papier', difficulte: '⭐⭐⭐⭐', temps: '30 min', symbole: '🌺' },
  { nom: '🐢 Tortue', difficulte: '⭐⭐⭐', temps: '18 min', symbole: '🐢' },
  { nom: '✈️ Avion en papier', difficulte: '⭐', temps: '2 min', symbole: '✈️' },
  { nom: '🦊 Renard', difficulte: '⭐⭐', temps: '10 min', symbole: '🦊' },
];

// Types de papier
const TYPES_PAPIER = [
  '📄 Papier blanc 80g/m²',
  '🎨 Papier coloré origami 15x15cm',
  '✨ Papier métallisé',
  '🌿 Papier kraft recyclé',
  '🎭 Papier washi japonais',
  '💎 Papier nacré',
  '🖨️ Papier imprimante classique',
  '📰 Papier journal',
];

// Défis papier
const DEFIS = [
  'Plie une grue en moins de 5 minutes ! ⏱️',
  'Crée un avion qui vole plus de 5 mètres ! ✈️',
  'Fais une tour de papier de 30cm sans colle ! 🏗️',
  'Plie 10 étoiles en papier en 10 minutes ! ⭐',
  'Crée un animal en origami les yeux fermés ! 🙈',
  'Fais le plus petit origami possible ! 🔬',
  'Construis un pont en papier qui supporte une pièce de monnaie ! 🌉',
];

const commands = {

  // !origami - Figure aléatoire à réaliser
  origami: {
    description: 'Suggère une figure origami à réaliser',
    cooldown: 15,
    handler: (client, channel, userstate) => {
      const figure = FIGURES_ORIGAMI[Math.floor(Math.random() * FIGURES_ORIGAMI.length)];
      return `${figure.symbole} Défi origami : ${figure.nom} | Difficulté : ${figure.difficulte} | Temps estimé : ${figure.temps} | Bonne chance ! 📄✂️`;
    }
  },

  // !papier - Type de papier aléatoire
  papier: {
    description: 'Suggère un type de papier à utiliser',
    cooldown: 10,
    handler: () => {
      const type = TYPES_PAPIER[Math.floor(Math.random() * TYPES_PAPIER.length)];
      return `📄 Papier du moment : ${type} ! C'est avec ça qu'on crée des chefs-d'œuvre aujourd'hui ✂️`;
    }
  },

  // !defi - Défi papier aléatoire
  defi: {
    description: 'Lance un défi papier aléatoire',
    cooldown: 20,
    handler: (client, channel, userstate) => {
      const name = userstate['display-name'] || userstate.username;
      const defi = DEFIS[Math.floor(Math.random() * DEFIS.length)];
      return `🎯 Défi pour ${name} : ${defi} Tu relèves le défi ? 📄`;
    }
  },

  // !plie - Commande fun de pliage
  plie: {
    description: 'Plie quelque chose en papier',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const cible = args.join(' ') || 'une feuille de papier';
      const actions = [
        `📄 ${name} plie ${cible} avec une précision chirurgicale ! ✂️ Magnifique !`,
        `✂️ ${name} transforme ${cible} en chef-d'œuvre d'origami ! 🦢`,
        `📄 ${name} froisse ${cible}... et recommence depuis le début 😅`,
        `🎨 ${name} crée une œuvre d'art avec ${cible} ! Le Picasso du papier ! 📄`,
      ];
      return actions[Math.floor(Math.random() * actions.length)];
    }
  },

  // !froisse - Froisse quelque chose
  froisse: {
    description: 'Froisse quelque chose en papier',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const cible = args.join(' ') || 'une feuille';
      return `😤 ${name} froisse ${cible} en une boule et la lance dans la corbeille... RATÉ ! 🗑️📄`;
    }
  },

  // !colle - Colle quelque chose
  colle: {
    description: 'Colle quelque chose',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const cible = args.join(' ') || 'deux feuilles';
      return `🖊️ ${name} colle ${cible} ensemble... et se retrouve les doigts collés ! 😂📄`;
    }
  },

  // !ciseau - Coupe quelque chose
  ciseau: {
    description: 'Coupe quelque chose avec des ciseaux',
    cooldown: 10,
    handler: (client, channel, userstate, args) => {
      const name = userstate['display-name'] || userstate.username;
      const cible = args.join(' ') || 'du papier';
      return `✂️ ${name} découpe ${cible} avec une précision de chirurgien ! Snip snip ! 📄`;
    }
  },

  // !figures - Liste les figures disponibles
  figures: {
    description: 'Affiche la liste des figures origami',
    cooldown: 30,
    handler: () => {
      const liste = FIGURES_ORIGAMI.map(f => f.symbole + ' ' + f.nom).join(' | ');
      return `📄 Figures origami disponibles : ${liste} | Utilise !origami pour en avoir une au hasard ! ✂️`;
    }
  },

  // !score - Score de pliage du viewer (fun)
  score: {
    description: 'Affiche ton score de maître origami',
    cooldown: 15,
    handler: (client, channel, userstate) => {
      const name = userstate['display-name'] || userstate.username;
      const score = Math.floor(Math.random() * 1000) + 1;
      const titres = [
        { min: 0, max: 100, titre: '🌱 Apprenti Plisseur' },
        { min: 101, max: 300, titre: '📄 Plieur Amateur' },
        { min: 301, max: 500, titre: '✂️ Artisan du Papier' },
        { min: 501, max: 700, titre: '🦢 Maître Origami' },
        { min: 701, max: 900, titre: '🌸 Grand Maître du Pli' },
        { min: 901, max: 1000, titre: '🐉 Légende du Papier' },
      ];
      const titre = titres.find(t => score >= t.min && score <= t.max);
      return `📊 Score origami de ${name} : ${score} points | Titre : ${titre.titre} 📄✂️`;
    }
  },

};

module.exports = commands;
