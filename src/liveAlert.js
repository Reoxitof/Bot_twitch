// =============================================
//   LIVE ALERT DISCORD - Streamer en Papier
//   Annonce automatique quand reoxitof est en live
// =============================================

const https = require('https');

let wasLive = false;
let liveCheckInterval = null;
let twitchAccessToken = null;

/**
 * Obtient un token d'accès Twitch (App Access Token)
 */
async function getTwitchToken() {
  return new Promise((resolve, reject) => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      reject(new Error('TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET manquant'));
      return;
    }

    const postData = `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    const options = {
      hostname: 'id.twitch.tv',
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.access_token);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Vérifie si le streamer est en live via l'API Twitch
 */
async function checkIfLive(channelName) {
  if (!twitchAccessToken) {
    twitchAccessToken = await getTwitchToken();
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twitch.tv',
      path: `/helix/streams?user_login=${channelName}`,
      method: 'GET',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Si token expiré, reset pour le prochain appel
          if (json.status === 401) {
            twitchAccessToken = null;
            resolve(null);
            return;
          }
          const stream = json.data && json.data[0];
          resolve(stream || null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

/**
 * Envoie un message dans le canal Discord via webhook
 */
async function sendDiscordAlert(webhookUrl, streamData, channelName) {
  return new Promise((resolve, reject) => {
    const title = streamData.title || 'Stream en cours !';
    const game = streamData.game_name || 'Jeu inconnu';
    const viewers = streamData.viewer_count || 0;
    const thumbnail = streamData.thumbnail_url
      ? streamData.thumbnail_url.replace('{width}', '440').replace('{height}', '248')
      : '';

    const embed = {
      username: 'Streamer en Papier',
      avatar_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/streamer_en_papier-profile_image-300x300.png',
      embeds: [{
        title: `🔴 ${channelName} est en LIVE !`,
        description: `**${title}**\n\n🎮 Jeu : **${game}**\n👀 Viewers : **${viewers}**\n\n[➡️ Regarder le stream](https://twitch.tv/${channelName})`,
        color: 0x9146FF, // Violet Twitch
        thumbnail: { url: thumbnail },
        fields: [
          {
            name: '📄 Streamer en Papier',
            value: `Viens regarder le live sur [twitch.tv/${channelName}](https://twitch.tv/${channelName}) !`,
            inline: false,
          }
        ],
        footer: {
          text: 'Streamer en Papier • Twitch',
        },
        timestamp: new Date().toISOString(),
      }],
    };

    const body = JSON.stringify(embed);
    const url = new URL(webhookUrl);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Démarre la surveillance du live et les alertes Discord
 * @param {number} checkIntervalMinutes - Intervalle de vérification en minutes (défaut: 2)
 */
async function startLiveAlert(checkIntervalMinutes = 2) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_LIVE;
  const channelName = process.env.CHANNEL_NAME;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!webhookUrl) {
    console.log('⚠️  DISCORD_WEBHOOK_LIVE non configuré — alertes Discord désactivées.');
    return;
  }

  if (!clientSecret) {
    console.log('⚠️  TWITCH_CLIENT_SECRET non configuré — alertes Discord désactivées.');
    return;
  }

  console.log(`🔔 Live Alert Discord activé — vérification toutes les ${checkIntervalMinutes} min`);

  const check = async () => {
    try {
      const stream = await checkIfLive(channelName);
      const isLive = stream !== null;

      if (isLive && !wasLive) {
        // Vient de passer en live !
        console.log(`🔴 ${channelName} est en live ! Envoi de l'alerte Discord...`);
        const status = await sendDiscordAlert(webhookUrl, stream, channelName);
        console.log(`📣 Alerte Discord envoyée (status: ${status})`);
        wasLive = true;
      } else if (!isLive && wasLive) {
        // Stream terminé
        console.log(`⚫ ${channelName} n'est plus en live.`);
        wasLive = false;
      }
    } catch (err) {
      console.error('[LIVE ALERT] Erreur :', err.message);
    }
  };

  // Vérification immédiate au démarrage
  await check();

  // Puis toutes les X minutes
  liveCheckInterval = setInterval(check, checkIntervalMinutes * 60 * 1000);
}

/**
 * Arrête la surveillance
 */
function stopLiveAlert() {
  if (liveCheckInterval) {
    clearInterval(liveCheckInterval);
    liveCheckInterval = null;
  }
}

module.exports = { startLiveAlert, stopLiveAlert };
