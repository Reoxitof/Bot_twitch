# 📄 Bot Twitch - Streamer en Papier ✂️🦢

Bot Twitch thématique pour la chaîne **Streamer en Papier**.

## 🚀 Installation

```bash
cd bot-twitch
npm install
cp .env.example .env
# Remplis les valeurs dans .env
node index.js
```

## ⚙️ Configuration (.env)

| Variable | Description |
|---|---|
| `BOT_USERNAME` | Nom du compte bot Twitch |
| `BOT_OAUTH_TOKEN` | Token OAuth (généré sur [twitchapps.com/tmi](https://twitchapps.com/tmi/)) |
| `CHANNEL_NAME` | Nom de ta chaîne (en minuscules) |
| `COMMAND_PREFIX` | Préfixe des commandes (défaut: `!`) |
| `COMMAND_COOLDOWN` | Cooldown global en secondes (défaut: `3`) |
| `DEBUG` | Logs détaillés `true`/`false` |

## 📋 Commandes

### Générales
| Commande | Description |
|---|---|
| `!bonjour` | Accueil personnalisé |
| `!lurk` | Mode lurk |
| `!unlurk` | Retour du lurk |
| `!discord` | Lien Discord |
| `!reseaux` | Réseaux sociaux |
| `!planning` | Planning des streams |
| `!uptime` | Durée du stream |

### 📄 Thème Papier
| Commande | Description |
|---|---|
| `!origami` | Figure origami aléatoire à réaliser |
| `!papier` | Type de papier suggéré |
| `!defi` | Défi papier aléatoire |
| `!plie [cible]` | Plie quelque chose |
| `!froisse [cible]` | Froisse quelque chose |
| `!ciseau [cible]` | Coupe quelque chose |
| `!colle [cible]` | Colle quelque chose |
| `!score` | Ton score de maître origami |
| `!figures` | Liste toutes les figures |

### 🎮 Fun
| Commande | Description |
|---|---|
| `!8ball [question]` | Boule magique en papier |
| `!rps [pierre/papier/ciseaux]` | Pierre Papier Ciseaux |
| `!dé [faces]` | Lance un dé (défaut: 6) |
| `!citation` | Citation inspirante |
| `!hug [@pseudo]` | Câlin en origami |
| `!lancer [@pseudo]` | Lance un avion en papier |
| `!pp` | Ton profil Streamer en Papier |

### 🛡️ Modération (mods only)
| Commande | Description |
|---|---|
| `!so @pseudo` | Shoutout |
| `!warn @pseudo [raison]` | Avertissement |
| `!timeout @pseudo [secondes]` | Timeout |
| `!titre [nouveau titre]` | Change le titre affiché |
| `!rules` / `!regles` | Règles du chat |

## 🐳 Docker

```bash
docker build -t bot-twitch-papier .
docker run --env-file .env bot-twitch-papier
```

## 📁 Structure

```
bot-twitch/
├── index.js                    # Point d'entrée
├── src/
│   ├── commands/
│   │   ├── general.js          # Commandes générales
│   │   ├── papier.js           # Commandes thème papier
│   │   ├── fun.js              # Commandes fun
│   │   └── moderation.js       # Commandes modération
│   └── handlers/
│       └── messageHandler.js   # Gestionnaire de messages
├── .env.example
├── package.json
└── Dockerfile
```
