import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

const CLOS = ['Traité', 'Clôturé'];
const CANAL_LABELS: Record<string, string> = {
  EMAIL: 'Email', TELEPHONE: 'Téléphone', WHATSAPP: 'WhatsApp',
  SITE_WEB: 'Site Web', GUICHET: 'Guichet', PHYSIQUE: 'Physique',
  LINKEDIN: 'LinkedIn', FACEBOOK: 'Facebook', AUTRE: 'Autre',
};

@Injectable()
export class StoryService {
  private readonly logger = new Logger(StoryService.name);
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
  }

  async generateReport(body: {
    periode: string;
    debut?: string;
    fin?: string;
    type?: string;
  }) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new InternalServerErrorException('ANTHROPIC_API_KEY non configurée');
    }

    const all = await this.prisma.demande.findMany({ orderBy: { createdAt: 'desc' } });

    const now = new Date();
    const filtered = all.filter(d => {
      const ref = (d as any).dateReception || d.createdAt;
      if (!ref) return true;
      const date = new Date(ref);
      if (body.periode === 'semaine') return (now.getTime() - date.getTime()) / 86400000 <= 7;
      if (body.periode === 'mois') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if (body.periode === 'trimestre') { const t = new Date(); t.setMonth(now.getMonth() - 3); return date >= t; }
      if (body.periode === 'annee') return date.getFullYear() === now.getFullYear();
      if (body.periode === 'custom') {
        if (body.debut && date < new Date(body.debut)) return false;
        if (body.fin && date > new Date(body.fin + 'T23:59:59')) return false;
        return true;
      }
      return true;
    });

    const total      = filtered.length;
    const traites    = filtered.filter(d => CLOS.includes(d.statut)).length;
    const enCours    = filtered.filter(d => d.statut === 'En cours').length;
    const enAttente  = filtered.filter(d => d.statut === 'En attente').length;
    const escalades  = filtered.filter(d => (d as any).niveauTraitement === 2).length;
    const slaOui     = filtered.filter(d => d.respectDelai === 'OUI').length;
    const horsSla    = filtered.filter(d => !CLOS.includes(d.statut) && d.respectDelai === 'NON').length;
    const tauxTraite = total > 0 ? Math.round(traites / total * 100) : 0;
    const tauxSla    = total > 0 ? Math.round(slaOui / total * 100) : 0;

    const notes = filtered.filter(d => (d as any).noteSatisfaction).map(d => (d as any).noteSatisfaction as number);
    const moyNote = notes.length > 0 ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : null;
    const promoteurs  = notes.filter(n => n >= 4).length;
    const detracteurs = notes.filter(n => n <= 2).length;
    const nps = notes.length > 0 ? Math.round(((promoteurs - detracteurs) / notes.length) * 100) : null;

    const delaisValides = filtered.filter(d => (d as any).delaiTraitement !== null && (d as any).delaiTraitement !== undefined);
    const delaiMoyen = delaisValides.length > 0
      ? (delaisValides.reduce((s, d) => s + ((d as any).delaiTraitement as number), 0) / delaisValides.length).toFixed(1)
      : null;

    const byService = Object.entries(
      filtered.reduce((acc: Record<string, { total: number; slaOk: number; traites: number }>, d) => {
        const s = (d as any).service || 'Non défini';
        if (!acc[s]) acc[s] = { total: 0, slaOk: 0, traites: 0 };
        acc[s].total++;
        if (d.respectDelai === 'OUI') acc[s].slaOk++;
        if (CLOS.includes(d.statut)) acc[s].traites++;
        return acc;
      }, {})
    ).map(([service, v]) => ({
      service, total: v.total,
      tauxSla: v.total > 0 ? Math.round(v.slaOk / v.total * 100) : 0,
      tauxTraite: v.total > 0 ? Math.round(v.traites / v.total * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    const byAgent = Object.entries(
      filtered.reduce((acc: Record<string, { n1: number; traites: number }>, d) => {
        if ((d as any).agentN1) {
          const a = (d as any).agentN1;
          if (!acc[a]) acc[a] = { n1: 0, traites: 0 };
          acc[a].n1++;
          if (CLOS.includes(d.statut)) acc[a].traites++;
        }
        return acc;
      }, {})
    ).map(([agent, v]) => ({
      agent, total: v.n1,
      taux: v.n1 > 0 ? Math.round(v.traites / v.n1 * 100) : 0,
    })).sort((a, b) => b.total - a.total).slice(0, 6);

    const byType = Object.entries(
      filtered.reduce((acc: Record<string, number>, d) => {
        const k = (d as any).objetDemande || 'Non précisé';
        acc[k] = (acc[k] || 0) + 1; return acc;
      }, {})
    ).map(([type, nb]) => ({ type, nb })).sort((a, b) => b.nb - a.nb).slice(0, 7);

    const byCanal = Object.entries(
      filtered.reduce((acc: Record<string, number>, d) => {
        const k = CANAL_LABELS[(d as any).canal] || (d as any).canal || 'Non défini';
        acc[k] = (acc[k] || 0) + 1; return acc;
      }, {})
    ).map(([canal, nb]) => ({ canal, nb })).sort((a, b) => b.nb - a.nb);

    const periodeLabels: Record<string, string> = {
      semaine: 'cette semaine', mois: 'ce mois en cours',
      trimestre: 'ce trimestre', annee: `l'année ${now.getFullYear()}`,
    };
    const periodeLabel = body.debut && body.fin
      ? `du ${new Date(body.debut).toLocaleDateString('fr-FR')} au ${new Date(body.fin).toLocaleDateString('fr-FR')}`
      : periodeLabels[body.periode] || body.periode;

    const dataSummary = `
DONNÉES SERVICE CLIENT CRRAE-UMOA — ${periodeLabel.toUpperCase()}
Date : ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

─── VOLUME & STATUTS ───
• Total demandes reçues : ${total}
• Traitées / Clôturées : ${traites} (${tauxTraite}%)
• En cours de traitement : ${enCours}
• En attente : ${enAttente}
• Escaladées au niveau N2 : ${escalades} (${total > 0 ? Math.round(escalades / total * 100) : 0}%)

─── QUALITÉ DE SERVICE (SLA) ───
• Taux global de respect des délais : ${tauxSla}%
• Demandes hors délai actives : ${horsSla}
• Délai moyen de traitement : ${delaiMoyen ? `${delaiMoyen} jours` : 'Non calculable'}

─── SATISFACTION CLIENT ───
• Note moyenne de satisfaction : ${moyNote ? `${moyNote}/5` : 'Données insuffisantes'}
• Nombre d'avis collectés : ${notes.length}
• Clients satisfaits (≥4/5) : ${promoteurs} (${notes.length > 0 ? Math.round(promoteurs / notes.length * 100) : 0}%)
• Clients insatisfaits (≤2/5) : ${detracteurs}
• Score NPS : ${nps !== null ? nps : 'Non calculable'}
• Enquêtes envoyées : ${filtered.filter(d => (d as any).enqueteEnvoyee).length}

─── PERFORMANCE PAR SERVICE ───
${byService.map(s => `• ${s.service} : ${s.total} demandes — SLA ${s.tauxSla}% — Taux traitement ${s.tauxTraite}%`).join('\n') || '• Aucune donnée'}

─── TOP AGENTS (volume N1) ───
${byAgent.map((a, i) => `${i + 1}. ${a.agent} : ${a.total} demandes — Taux traitement ${a.taux}%`).join('\n') || '• Aucune donnée'}

─── TYPES DE DEMANDES (TOP 7) ───
${byType.map(t => `• ${t.type} : ${t.nb} (${total > 0 ? Math.round(t.nb / total * 100) : 0}%)`).join('\n') || '• Aucune donnée'}

─── CANAUX DE CONTACT ───
${byCanal.map(c => `• ${c.canal} : ${c.nb} (${total > 0 ? Math.round(c.nb / total * 100) : 0}%)`).join('\n') || '• Aucune donnée'}
`.trim();

    const typeMap: Record<string, string> = {
      executif: 'Génère un résumé exécutif synthétique (1 à 2 pages maximum) avec uniquement les points essentiels pour le Comité de Direction. Va à l\'essentiel : 3 chiffres clés, 2 points d\'attention, 2 recommandations prioritaires.',
      complet: 'Génère un rapport complet et structuré couvrant toutes les dimensions : volume, qualité, satisfaction, performance par service et par agent, points d\'attention et recommandations.',
      tendances: 'Génère une analyse orientée tendances et perspectives. Identifie les signaux positifs, les dérives à surveiller et propose une feuille de route opérationnelle.',
    };

    const typeInstruction = typeMap[body.type || 'complet'] || typeMap.complet;

    let message: Awaited<ReturnType<typeof this.anthropic.messages.create>>;
    try {
      message = await this.anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 2500,
        system: `Tu es un expert senior en relation client et en analyse de données pour des institutions financières d'Afrique de l'Ouest. Tu rédiges des rapports pour le Comité de Direction de la CRRAE-UMOA (Caisse de Retraite et de Renouvellement des Agents des États de l'UMOA), une institution de retraite servant les fonctionnaires des 8 pays de l'UMOA.

RÈGLES ABSOLUES :
- Rédige exclusivement en français professionnel et impeccable
- Base-toi uniquement sur les données fournies, sans inventer
- Utilise des titres markdown ## et ### pour structurer
- Inclus des chiffres précis dans chaque section
- Adopte un ton factuel, professionnel et constructif
- Mets en valeur les succès autant que les axes d'amélioration
- Les recommandations doivent être concrètes et actionnables

${typeInstruction}`,
        messages: [{
          role: 'user',
          content: `Voici les données du service client CRRAE-UMOA pour ${periodeLabel} :\n\n${dataSummary}\n\nGénère le rapport pour le Comité de Direction.`,
        }],
      });
    } catch (e: any) {
      this.logger.error('[StoryService] Erreur Anthropic API:', e?.message, e?.status, e?.error);
      const status = e?.status;
      if (status === 401) throw new InternalServerErrorException('Clé API Anthropic invalide ou expirée (401). Vérifiez ANTHROPIC_API_KEY sur Railway.');
      if (status === 429) throw new InternalServerErrorException('Limite de débit Anthropic atteinte. Réessayez dans quelques instants (429).');
      if (status === 529 || e?.message?.includes('overloaded')) throw new InternalServerErrorException('L\'API Anthropic est momentanément surchargée. Réessayez dans quelques secondes.');
      throw new InternalServerErrorException(`Erreur API Anthropic : ${e?.message || 'erreur inconnue'}`);
    }

    const rapport = message.content[0].type === 'text' ? message.content[0].text : '';

    // Statuts distribution for chart
    const byStatut = [
      { name: 'Traité / Clôturé', value: traites, color: '#276749' },
      { name: 'En cours',         value: enCours,   color: '#2b6cb0' },
      { name: 'En attente',       value: enAttente,  color: '#b7791f' },
      { name: 'Escaladé N2',      value: escalades,  color: '#6b46c1' },
    ].filter(s => s.value > 0);

    // Satisfaction distribution
    const passifs = notes.filter(n => n === 3).length;
    const satisfaction = notes.length > 0 ? [
      { name: 'Satisfaits (≥4/5)',    value: promoteurs,  color: '#276749' },
      { name: 'Neutres (3/5)',         value: passifs,     color: '#b7791f' },
      { name: 'Insatisfaits (≤2/5)',  value: detracteurs, color: '#c53030' },
    ].filter(s => s.value > 0) : [];

    return {
      rapport,
      analytics: {
        byStatut,
        byService,
        byAgent,
        byType,
        byCanal,
        satisfaction,
      },
      metadata: {
        periode: periodeLabel,
        genereLe: now.toISOString(),
        totalDemandes: total,
        traites,
        enCours,
        enAttente,
        escalades,
        horsSla,
        tauxTraite,
        tauxSla,
        delaiMoyen,
        moyNote,
        nps,
        notesCount: notes.length,
        enquetesEnvoyees: filtered.filter(d => (d as any).enqueteEnvoyee).length,
        tokensUtilises: message.usage.input_tokens + message.usage.output_tokens,
      },
    };
  }
}
