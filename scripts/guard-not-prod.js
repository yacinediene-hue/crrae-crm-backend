#!/usr/bin/env node
/**
 * Bloque l'exécution si NODE_ENV=production ou RAILWAY_ENVIRONMENT=production.
 * Accroché en pre-hook sur toutes les commandes dangereuses (migrate dev, seed, db push...).
 */
const isProd =
  process.env.NODE_ENV === 'production' ||
  process.env.RAILWAY_ENVIRONMENT === 'production';

if (isProd) {
  console.error('');
  console.error('❌  COMMANDE BLOQUÉE EN PRODUCTION');
  console.error('   Cette commande est réservée à l\'environnement local.');
  console.error('   En production, seul "prisma migrate deploy" est autorisé.');
  console.error('   Voir ARCHITECTURE.md — section "Commandes INTERDITES en production".');
  console.error('');
  process.exit(1);
}
