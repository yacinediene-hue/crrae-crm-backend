import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

const CLOS = ['Traité', 'Clôturé', 'Clôturée'];
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

  private getAnthropicOrThrow() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new InternalServerErrorException('ANTHROPIC_API_KEY non configurée');
    }
    return this.anthropic;
  }

  private async callAnthropic(system: string, userContent: string, maxTokens = 2500) {
    const client = this.getAnthropicOrThrow();
    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: userContent }],
      });
      return message;
    } catch (e: any) {
      this.logger.error('[StoryService] Erreur Anthropic:', e?.message);
      const status = e?.status;
      if (status === 401) throw new InternalServerErrorException('Clé API Anthropic invalide (401).');
      if (status === 429) throw new InternalServerErrorException('Limite Anthropic atteinte. Réessayez (429).');
      if (status === 529 || e?.message?.includes('overloaded')) throw new InternalServerErrorException('API Anthropic surchargée.');
      throw new InternalServerErrorException(`Erreur Anthropic : ${e?.message || 'inconnue'}`);
    }
  }

  async generateReport(body: {
    periode: string;
    debut?: string;
    fin?: string;
    type?: string;
    service?: string;
    agent?: string;
  }) {
    const all = await this.prisma.demande.findMany({ orderBy: { createdAt: 'desc' } });
    const now = new Date();

    const filtered = all.filter(d => {
      const ref = (d as any).dateReception || d.createdAt;
      if (ref) {
        const date = new Date(ref);
        if (body.periode === 'semaine' && (now.getTime() - date.getTime()) / 86400000 > 7) return false;
        if (body.periode === 'mois' && (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear())) return false;
        if (body.periode === 'trimestre') { const t = new Date(); t.setMonth(now.getMonth() - 3); if (date < t) return false; }
        if (body.periode === 'annee' && date.getFullYear() !== now.getFullYear()) return false;
        if (body.periode === 'custom') {
          if (body.debut && date < new Date(body.debut)) return false;
          if (body.fin && date > new Date(body.fin + 'T23:59:59')) return false;
        }
      }
      if (body.service && (d as any).service !== body.service) return false;
      if (body.agent) {
        const ag = body.agent.toLowerCase();
        if ((d as any).agentN1?.toLowerCase() !== ag && (d as any).agentN2?.toLowerCase() !== ag) return false;
      }
      return true;
    });

    const total      = filtered.length;
    const traites    = filtered.filter(d => CLOS.includes(d.statut)).length;
    const enCours    = filtered.filter(d => d.statut === 'En cours').length;
    const enAttente  = filtered.filter(d => d.statut === 'En attente client').length;
    const escalades  = filtered.filter(d => (d as any).niveauTraitement === 2).length;
    const horsSla    = filtered.filter(d => {
      if (CLOS.includes(d.statut)) return false;
      const dl = (d as any).dateLimite;
      if (dl) return new Date(dl) < now;
      return d.respectDelai === 'NON';
    }).length;
    const slaOk      = total - horsSla;
    const tauxTraite = total > 0 ? Math.round(traites / total * 100) : 0;
    const tauxSla    = total > 0 ? Math.round(slaOk / total * 100) : 0;

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
        if (!CLOS.includes(d.statut)) {
          const dl = (d as any).dateLimite;
          if (!(dl ? new Date(dl) < now : d.respectDelai === 'NON')) acc[s].slaOk++;
        } else {
          acc[s].slaOk++;
        }
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

    // Évolution mensuelle
    const byMois = Object.entries(
      all.filter(d => {
        const ref = (d as any).dateReception || d.createdAt;
        if (!ref) return false;
        const date = new Date(ref);
        return date.getFullYear() >= now.getFullYear() - 1;
      }).filter(d => {
        if (body.service && (d as any).service !== body.service) return false;
        if (body.agent) {
          const ag = body.agent.toLowerCase();
          if ((d as any).agentN1?.toLowerCase() !== ag && (d as any).agentN2?.toLowerCase() !== ag) return false;
        }
        return true;
      }).reduce((acc: Record<string, { total: number; traites: number; horsSla: number }>, d) => {
        const ref = (d as any).dateReception || d.createdAt;
        const date = new Date(ref);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = { total: 0, traites: 0, horsSla: 0 };
        acc[key].total++;
        if (CLOS.includes(d.statut)) acc[key].traites++;
        if (!CLOS.includes(d.statut)) {
          const dl = (d as any).dateLimite;
          if (dl ? new Date(dl) < now : d.respectDelai === 'NON') acc[key].horsSla++;
        }
        return acc;
      }, {})
    ).map(([mois, v]) => ({
      mois,
      label: new Date(mois + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      total: v.total,
      traites: v.traites,
      horsSla: v.horsSla,
      tauxSla: v.total > 0 ? Math.round((v.total - v.horsSla) / v.total * 100) : 100,
    })).sort((a, b) => a.mois.localeCompare(b.mois)).slice(-12);

    const periodeLabels: Record<string, string> = {
      semaine: 'cette semaine', mois: 'ce mois en cours',
      trimestre: 'ce trimestre', annee: `l'année ${now.getFullYear()}`,
    };
    const periodeLabel = body.debut && body.fin
      ? `du ${new Date(body.debut).toLocaleDateString('fr-FR')} au ${new Date(body.fin).toLocaleDateString('fr-FR')}`
      : periodeLabels[body.periode] || body.periode;

    const scopeLabel = [body.service && `service ${body.service}`, body.agent && `agent ${body.agent}`].filter(Boolean).join(', ');

    const dataSummary = `
DONNÉES SERVICE CLIENT CRRAE-UMOA — ${periodeLabel.toUpperCase()}${scopeLabel ? ` (${scopeLabel})` : ''}
Date : ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

─── VOLUME & STATUTS ───
• Total demandes reçues : ${total}
• Traitées / Clôturées : ${traites} (${tauxTraite}%)
• En cours de traitement : ${enCours}
• En attente client : ${enAttente}
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
      executif: 'Génère un résumé exécutif synthétique destiné à l\'ouverture d\'un Comité de Direction. Structure-le en 3 à 4 sections courtes (## Situation générale, ## Points d\'attention, ## Recommandations). Chaque section est rédigée en 2 à 3 paragraphes de prose fluide. Inclus les chiffres clés dans le corps du texte.',
      complet: 'Génère un rapport complet structuré en sections (## Synthèse générale, ## Volume et traitement, ## Qualité de service, ## Satisfaction client, ## Performance par service, ## Recommandations). Chaque section est rédigée en paragraphes de prose continue, sans liste à puces. Intègre les chiffres précis dans le fil du texte.',
      tendances: 'Génère une analyse orientée tendances et perspectives, structurée en sections (## Faits marquants, ## Signaux positifs, ## Points de vigilance, ## Feuille de route). Rédige chaque section en paragraphes de prose argumentée, sans liste à puces. Appuie-toi sur les données chiffrées pour étayer chaque point.',
    };
    const typeInstruction = typeMap[body.type || 'complet'] || typeMap.complet;

    const message = await this.callAnthropic(
      `Tu es un expert senior en relation client pour des institutions financières d'Afrique de l'Ouest. Tu rédiges des rapports pour le Comité de Direction de la CRRAE-UMOA (Caisse de Retraite des agents des États de l'UMOA). RÈGLES ABSOLUES : rédige exclusivement en français professionnel et impeccable ; base-toi uniquement sur les données fournies sans inventer ; utilise uniquement des titres de section ## et ### pour structurer, mais le CONTENU de chaque section doit être rédigé en paragraphes de texte continu — AUCUNE liste à puces, AUCUN tiret, AUCUN point de liste ; intègre tous les chiffres dans la prose. ${typeInstruction}`,
      `Voici les données du service client CRRAE-UMOA pour ${periodeLabel} :\n\n${dataSummary}\n\nGénère le rapport.`,
      2500,
    );

    const rapport = message.content[0].type === 'text' ? message.content[0].text : '';

    const byStatut = [
      { name: 'Traité / Clôturé', value: traites,   color: '#276749' },
      { name: 'En cours',          value: enCours,   color: '#2b6cb0' },
      { name: 'En attente',        value: enAttente, color: '#b7791f' },
      { name: 'Escaladé N2',       value: escalades, color: '#6b46c1' },
    ].filter(s => s.value > 0);

    const passifs = notes.filter(n => n === 3).length;
    const satisfaction = notes.length > 0 ? [
      { name: 'Satisfaits (≥4/5)',   value: promoteurs,  color: '#276749' },
      { name: 'Neutres (3/5)',        value: passifs,     color: '#b7791f' },
      { name: 'Insatisfaits (≤2/5)', value: detracteurs, color: '#c53030' },
    ].filter(s => s.value > 0) : [];

    return {
      rapport,
      analytics: { byStatut, byService, byAgent, byType, byCanal, byMois, satisfaction },
      metadata: {
        periode: periodeLabel,
        scopeLabel,
        genereLe: now.toISOString(),
        totalDemandes: total,
        traites, enCours, enAttente, escalades, horsSla,
        tauxTraite, tauxSla, delaiMoyen, moyNote, nps,
        notesCount: notes.length,
        enquetesEnvoyees: filtered.filter(d => (d as any).enqueteEnvoyee).length,
        tokensUtilises: message.usage.input_tokens + message.usage.output_tokens,
      },
    };
  }

  async chat(body: { question: string; contexteData: string }) {
    const message = await this.callAnthropic(
      `Tu es l'assistant IA du CRM CRRAE-UMOA. Tu réponds à des questions sur les données du service client. Sois concis (3-5 phrases max), factuel, en français professionnel. Si la question dépasse les données disponibles, dis-le clairement.`,
      `Contexte des données :\n${body.contexteData}\n\nQuestion : ${body.question}`,
      600,
    );
    return { reponse: message.content[0].type === 'text' ? message.content[0].text : '' };
  }
}
