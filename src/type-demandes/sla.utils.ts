export const STATUTS_CLOS = ['Clôturée', 'Traité', 'Clôturé'];
export const SLA_SEUIL_RISQUE = 0.20; // 20% du délai restant → "à risque"

export type StatutSla = 'ok' | 'risque' | 'depasse' | 'clos' | 'sans_sla';

export function computeDateLimite(dateReception: Date, delaiMaxJours: number): Date {
  const d = new Date(dateReception);
  d.setDate(d.getDate() + delaiMaxJours);
  return d;
}

export function computeStatutSla(
  dateLimite: Date | null,
  statut: string,
  dateTraitement: Date | null,
  delaiMaxJours: number | null,
): StatutSla {
  if (!dateLimite || delaiMaxJours == null) return 'sans_sla';

  const reference = dateTraitement ? new Date(dateTraitement) : new Date();
  const limite = new Date(dateLimite);

  if (STATUTS_CLOS.includes(statut)) {
    const depasse = reference > limite;
    return depasse ? 'depasse' : 'clos';
  }

  const now = new Date();
  if (now > limite) return 'depasse';

  const totalMs = limite.getTime() - new Date(limite.getTime() - delaiMaxJours * 86400000).getTime();
  const restantMs = limite.getTime() - now.getTime();
  const ratioRestant = restantMs / totalMs;

  return ratioRestant <= SLA_SEUIL_RISQUE ? 'risque' : 'ok';
}
