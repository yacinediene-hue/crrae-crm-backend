const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const API_URL = 'https://crrae-crm-backend-production.up.railway.app';
let token = null;

async function login() {
  const res = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@crrae-umoa.org',
    password: 'crrae2026'
  });
  token = res.data.access_token;
  console.log('✅ Connecté au backend Railway');
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox'] }
});

client.on('qr', qr => {
  console.log('=== SCANNEZ CE QR CODE AVEC WHATSAPP ===');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ WhatsApp connecté !');
  await login();
});

client.on('message', async msg => {
  if (msg.from === 'status@broadcast') return;
  try {
    const contact = await msg.getContact();
    const nom = contact.pushname || msg.from.replace('@c.us', '');
    const telephone = msg.from.replace('@c.us', '');
    const res = await axios.post(`${API_URL}/demandes`,
      {
        nomPrenom: nom,
        telephone,
        canal: 'WhatsApp',
        objetDemande: 'Information',
        commentaire: msg.body,
        statut: 'En cours',
        dateReception: new Date().toISOString(),
        typeClient: 'Actif',
        heureAppel: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Demande créée: ${res.data.numDemande} - ${nom}`);
    await client.sendMessage(msg.from,
      `Bonjour ${nom},\n\nNous accusons réception de votre demande enregistrée sous le numéro *${res.data.numDemande}*.\n\nVotre dossier est en cours de traitement.\n\nCordialement,\nService Client CRRAE-UMOA`
    );
  } catch(e) {
    console.error('Erreur:', e.message);
  }
});

client.initialize();
console.log('Démarrage WhatsApp...');
