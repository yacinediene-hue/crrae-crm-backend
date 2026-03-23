// Lance les deux instances WhatsApp dans des processus séparés avec reconnexion auto
const { spawn } = require('child_process');
const path = require('path');

const instances = [
  { clientId: 'whatsapp-1', label: 'WhatsApp N°1', qrFile: 'whatsapp-qr-1.html' },
  { clientId: 'whatsapp-2', label: 'WhatsApp N°2', qrFile: 'whatsapp-qr-2.html' },
];

function launchInstance({ clientId, label, qrFile }, delayMs = 0) {
  setTimeout(() => {
    const start = () => {
      console.log(`[Manager] Lancement ${label}...`);
      const proc = spawn('node', [
        path.join(__dirname, 'whatsapp-instance.js'),
        clientId, label, qrFile
      ], { stdio: 'inherit' });

      proc.on('exit', (code) => {
        console.log(`[Manager] ${label} terminé (code ${code}) — relance dans 10s`);
        setTimeout(start, 10000);
      });
    };
    start();
  }, delayMs);
}

// N°2 démarre 8s après N°1 pour éviter les conflits Chromium
launchInstance(instances[0], 0);
launchInstance(instances[1], 15000);
