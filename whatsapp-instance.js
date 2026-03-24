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
  const html = `<!DOCTYPE html><html><head><title>WhatsApp QR — ${label}</title>
<style>body{background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}
.card{background:white;padding:32px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.15);text-align:center}
svg{display:block;margin:16px auto;background:white}p{color:#555;margin-top:16px;font-size:14px}</style></head>
<body><div class="card"><h2 style="color:#1a365d">📱 ${label}</h2>
<p>WhatsApp → Appareils connectés → Connecter un appareil</p>
<svg width="${totalSize+40}" height="${totalSize+40}" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="white"/>
<g transform="translate(20,20)">${cells}</g></svg>
<p style="color:#888;font-size:12px">QR code expire dans 60s</p></div></body></html>`;
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
    const res = await axios.post(`${API_URL}/demandes`,
      {
        nomPrenom: nom, telephone, canal: 'WhatsApp',
        objetDemande: 'Information', commentaire: msg.body,
        statut: 'En cours', dateReception: new Date().toISOString(),
        typeClient: 'Actif',
        heureAppel: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        agentN1: label,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ [${label}] Demande: ${res.data.numDemande} - ${nom}`);
    await client.sendMessage(msg.from,
      `Bonjour,\n\nNous accusons réception de votre message et vous confirmons l'enregistrement de votre demande sous le numéro *${res.data.numDemande}*.\n\nVotre dossier est pris en charge et sera traité dans les meilleurs délais.\n\nCordialement,\nService Client CRRAE-UMOA`
    );
  } catch (e) {
    console.error(`[${label}] Erreur message:`, e.message);
  }
});

console.log(`Démarrage [${label}]...`);
client.initialize();
