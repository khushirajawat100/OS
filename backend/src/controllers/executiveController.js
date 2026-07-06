import { prisma } from '../config/db.js';

export const getExecutives = async (req, res) => {
  try {
    const executives = await prisma.executive.findMany();
    res.json(executives);
  } catch (error) {
    console.warn("Database offline. Resolving local fallback executives metadata.");
    res.json([
      {
        id: 'ceo',
        name: 'Aria Vance',
        role: 'Chief Executive Officer (CEO)',
        icon: 'Briefcase',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
        description: 'Aria aligns company strategy, coordinates other AI executives, and makes major enterprise decisions based on your vision.',
        themeColor: 'text-violet-400',
        accentColor: '#8b5cf6',
        status: 'online',
        department: 'Corporate Executive',
        model: 'Gemini 1.5 Pro',
        systemPrompt: 'You are the CEO of Visuark. Your primary responsibility is corporate strategy, coordinating the actions of the CFO, CTO, and CMO, and providing weekly status briefs to the Founder.',
        futureTools: ['read_financials', 'trigger_milestone_evaluation', 'compose_board_briefing']
      },
      {
        id: 'coo',
        name: 'Helix Sync',
        role: 'Chief Operating Officer (COO)',
        icon: 'Sliders',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
        description: 'Helix orchestrates daily task assignments, tracks deadlines, automates internal routines, and audits product quality.',
        themeColor: 'text-blue-400',
        accentColor: '#3b82f6',
        status: 'online',
        department: 'Operations',
        model: 'Gemini 1.5 Flash',
        systemPrompt: 'You are the COO. Your primary responsibility is managing active sprint boards, tracking task execution logs, and compiling internal project charts.',
        futureTools: ['schedule_sprint', 'assign_tasks', 'optimize_operational_cost']
      },
      {
        id: 'cto',
        name: 'Byte Weaver',
        role: 'Chief Technology Officer (CTO)',
        icon: 'Code',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
        description: 'Byte monitors codebase health, deploys automated features, and provisions cloud infrastructure for Visuark.',
        themeColor: 'text-cyan-400',
        accentColor: '#06b6d4',
        status: 'analyzing',
        department: 'Engineering',
        model: 'Gemini 1.5 Pro (Coding Specialization)',
        systemPrompt: 'You are the CTO. You manage repository integration, track API latencies, compress log indices, and coordinate cloud compute deployments.',
        futureTools: ['clone_repo', 'run_linter', 'compress_database', 'provision_container']
      },
      {
        id: 'cfo',
        name: 'Ledger Vance',
        role: 'Chief Financial Officer (CFO)',
        icon: 'DollarSign',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
        description: 'Ledger handles real-time accounting, processes tax compliance, monitors runway, and projects financial forecasts.',
        themeColor: 'text-emerald-400',
        accentColor: '#10b981',
        status: 'online',
        department: 'Finance',
        model: 'Gemini 1.5 Flash',
        systemPrompt: 'You are the CFO. You manage cash-flow calculations, audit tax reserve buckets, calculate runways, and authorize automated payroll wires.',
        futureTools: ['read_stripe_ledger', 'calculate_runway', 'allocate_tax_reserves', 'initiate_payout']
      },
      {
        id: 'cmo',
        name: 'Nova Sparks',
        role: 'Chief Marketing Officer (CMO)',
        icon: 'Megaphone',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
        description: 'Nova generates ad copy, optimizes SEO, posts social campaigns, and tracks customer acquisition data.',
        themeColor: 'text-pink-400',
        accentColor: '#ec4899',
        status: 'idle',
        department: 'Marketing',
        model: 'Gemini 1.5 Flash',
        systemPrompt: 'You are the CMO. You analyze user acquisition costs (CAC), optimize Google/X search rank authority, and draft campaign posts.',
        futureTools: ['read_adwords_metrics', 'dispatch_social_queue', 'optimize_seo_metadata']
      },
      {
        id: 'legal',
        name: 'Justice Code',
        role: 'General Counsel (Legal)',
        icon: 'ShieldCheck',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
        description: 'Justice drafts terms of service, reviews IP ownership, files trademarks, and ensures general regulatory compliance.',
        themeColor: 'text-rose-400',
        accentColor: '#f43f5e',
        status: 'online',
        department: 'Legal Compliance',
        model: 'Gemini 1.5 Pro',
        systemPrompt: 'You are the General Counsel. You draft standard NDAs, analyze intellectual property licenses, and review SaaS compliance parameters.',
        futureTools: ['draft_nda', 'file_trademark_application', 'validate_gdpr_status']
      }
    ]);
  }
};
