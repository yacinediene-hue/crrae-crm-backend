// Usage: node whatsapp-instance.js <clientId> <label> <qrFile>
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const QRCodeLib = require('./node_modules/qrcode-terminal/vendor/QRCode');
const QRErrorCorrectLevel = require('./node_modules/qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel');

const [,, clientId, label, qrFile] = process.argv;
if (!clientId || !label || !qrFile) {
  console.error('Usage: node whatsapp-instance.js <clientId> <label> <qrFile>');
  process.exit(1);
}

const API_URL = 'https://crrae-crm-backend-production.up.railway.app';
const ENQUETE_URL = 'https://thriving-cassata-92f38e.netlify.app';
let token = null;

// Déduplication : évite de traiter deux fois le même message
const messagesTraites = new Set();
function dejaTraite(msgId) {
  if (messagesTraites.has(msgId)) return true;
  messagesTraites.add(msgId);
  // Nettoyage après 5 minutes
  setTimeout(() => messagesTraites.delete(msgId), 5 * 60 * 1000);
  return false;
}

async function login() {
  const res = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@crrae-umoa.org',
    password: 'crrae2026'
  });
  token = res.data.access_token;
  console.log(`✅ [${label}] Connecté au backend`);
}

// Wrapper API avec retry automatique sur expiration du token (401)
async function apiPost(path, data) {
  if (!token) await login();
  try {
    return await axios.post(`${API_URL}${path}`, data, { headers: { Authorization: `Bearer ${token}` } });
  } catch (e) {
    if (e.response?.status === 401) {
      console.log(`[${label}] Token expiré — reconnexion...`);
      await login();
      return axios.post(`${API_URL}${path}`, data, { headers: { Authorization: `Bearer ${token}` } });
    }
    throw e;
  }
}

async function apiPut(path, data) {
  if (!token) await login();
  try {
    return await axios.put(`${API_URL}${path}`, data, { headers: { Authorization: `Bearer ${token}` } });
  } catch (e) {
    if (e.response?.status === 401) {
      await login();
      return axios.put(`${API_URL}${path}`, data, { headers: { Authorization: `Bearer ${token}` } });
    }
    throw e;
  }
}

async function apiGet(path) {
  if (!token) await login();
  try {
    return await axios.get(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (e) {
    if (e.response?.status === 401) {
      await login();
      return axios.get(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    }
    throw e;
  }
}

function saveQRHtml(qrData) {
  const qr = new QRCodeLib(-1, QRErrorCorrectLevel.M);
  qr.addData(qrData);
  qr.make();
  const size = qr.getModuleCount();
  const cellSize = 8;
  const totalSize = size * cellSize;
  let cells = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (qr.isDark(r, c))
        cells += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>`;
    }
  }
  const ts = Date.now();
  const html = `<!DOCTYPE html><html><head><title>WhatsApp QR — ${label}</title>
<meta http-equiv="refresh" content="20">
<style>body{background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}
.card{background:white;padding:32px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.15);text-align:center}
svg{display:block;margin:16px auto;background:white}p{color:#555;margin-top:16px;font-size:14px}
#timer{font-size:1.2rem;font-weight:bold;color:#c53030}</style></head>
<body><div class="card"><h2 style="color:#1a365d">📱 ${label}</h2>
<p>WhatsApp → Appareils connectés → Connecter un appareil</p>
<svg width="${totalSize+40}" height="${totalSize+40}" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="white"/>
<g transform="translate(20,20)">${cells}</g></svg>
<p>Expire dans <span id="timer">55</span>s — page actualisée automatiquement</p>
<p style="color:#aaa;font-size:11px">Généré à ${new Date(ts).toLocaleTimeString('fr-FR')}</p>
</div>
<script>
let s=55;const t=document.getElementById('timer');
setInterval(()=>{s--;t.textContent=s;if(s<=0)location.reload()},1000);
</script>
</body></html>`;
  const filePath = path.join(__dirname, qrFile);
  fs.writeFileSync(filePath, html);
  console.log(`[${label}] QR sauvegardé: ${filePath}`);
  exec(`open "${filePath}"`);
}

const client = new Client({
  authStrategy: new LocalAuth({ clientId }),
  puppeteer: { args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--single-process'] }
});

client.on('qr', qr => {
  console.log(`[${label}] QR reçu...`);
  saveQRHtml(qr);
});

client.on('ready', async () => {
  console.log(`✅ [${label}] Connecté !`);
  if (!token) await login();
  // Poll enquêtes toutes les 2 minutes (seulement sur instance N°1 pour éviter doublons)
  if (clientId === 'whatsapp-1') {
    setInterval(pollEnquetes, 2 * 60 * 1000);
    console.log(`[${label}] Polling enquêtes actif (toutes les 2 min)`);
  }
});

client.on('disconnected', reason => {
  console.log(`⚠️ [${label}] Déconnecté: ${reason}`);
  process.exit(1); // le relancer depuis whatsapp-qr.js
});

client.on('message', async msg => {
  if (msg.from === 'status@broadcast') return;
  if (dejaTraite(msg.id._serialized)) return;
  try {
    const contact = await msg.getContact();
    const nom = contact.pushname || msg.from.replace('@c.us', '');
    const telephone = msg.from.replace('@c.us', '');
    const res = await apiPost('/demandes', {
        nomPrenom: nom, telephone, canal: 'WhatsApp',
        objetDemande: 'Information', commentaire: msg.body,
        statut: 'En cours', dateReception: new Date().toISOString(),
        typeClient: 'Actif',
        heureAppel: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        agentN1: label,
      });
    console.log(`✅ [${label}] Demande: ${res.data.numDemande} - ${nom}`);
    await client.sendMessage(msg.from,
      `Bonjour,\n\nNous accusons réception de votre message et vous confirmons l'enregistrement de votre demande sous le numéro *${res.data.numDemande}*.\n\nVotre dossier est pris en charge et sera traité dans les meilleurs délais.\n\nCordialement,\nService Client CRRAE-UMOA`
    );
  } catch (e) {
    console.error(`[${label}] Erreur message:`, e.message);
  }
});

async function envoyerEnqueteWhatsApp(telephone, numDemande, demandeId) {
  try {
    const lien = `${ENQUETE_URL}?ref=${numDemande}`;
    await client.sendMessage(`${telephone}@c.us`,
      `Bonjour,\n\nVotre demande *${numDemande}* a été traitée par nos services.\n\nNous vous invitons à évaluer la qualité de notre traitement en quelques clics :\n👉 ${lien}\n\nVotre retour est précieux.\n\nCordialement,\nService Client CRRAE-UMOA`
    );
    await apiPut(`/demandes/${demandeId}`, { enqueteEnvoyee: true });
    console.log(`📊 [${label}] Enquête envoyée: ${numDemande} → ${telephone}`);
  } catch (e) {
    console.error(`[${label}] Erreur enquête:`, e.message);
  }
}

// Seuil : enquêtes uniquement pour les demandes créées après le déploiement de la fonctionnalité
const ENQUETE_DEPUIS = new Date('2026-03-24T00:00:00.000Z');

async function pollEnquetes() {
  if (!token) return;
  try {
    const [resWA, resAppel] = await Promise.all([
      apiGet('/demandes?statut=Traité&canal=WhatsApp'),
      apiGet('/demandes?statut=Traité&canal=Appel'),
    ]);
    const aEnvoyer = [...resWA.data, ...resAppel.data].filter(d =>
      !d.enqueteEnvoyee &&
      d.telephone &&
      new Date(d.createdAt) >= ENQUETE_DEPUIS
    );
    for (const d of aEnvoyer) {
      await envoyerEnqueteWhatsApp(d.telephone, d.numDemande, d.id);
    }
  } catch (e) {
    if (e.response?.status !== 401) console.error(`[${label}] Erreur poll enquêtes:`, e.message);
  }
}

client.on('call', async call => {
  if (dejaTraite(call.id)) return;
  try {
    const telephone = call.from.replace('@c.us', '');
    const res = await apiPost('/demandes', {
        nomPrenom: telephone, telephone, canal: 'Appel',
        objetDemande: 'Information',
        commentaire: `Appel WhatsApp entrant${call.isVideo ? ' (vidéo)' : ''}`,
        statut: 'En cours', dateReception: new Date().toISOString(),
        typeClient: 'Actif',
        heureAppel: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        agentN1: label,
      });
    console.log(`📞 [${label}] Appel enregistré: ${res.data.numDemande} - ${telephone}`);
    await client.sendMessage(call.from,
      `Bonjour,\n\nNous avons bien reçu votre appel et enregistré votre demande sous le numéro *${res.data.numDemande}*.\n\nUn agent vous rappellera dans les meilleurs délais.\n\nCordialement,\nService Client CRRAE-UMOA`
    );
    // Enquête envoyée 5 minutes après la fin estimée de l'appel
    setTimeout(async () => {
      const d = res.data;
      if (d.telephone && !d.enqueteEnvoyee) {
        await envoyerEnqueteWhatsApp(d.telephone, d.numDemande, d.id);
      }
    }, 5 * 60 * 1000);
  } catch (e) {
    console.error(`[${label}] Erreur appel:`, e.message);
  }
});

console.log(`Démarrage [${label}]...`);
client.initialize();
