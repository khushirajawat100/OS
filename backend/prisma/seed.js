import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/visuark_db?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database models...');

  // 1. Seed Founder Profile
  const founder = await prisma.founder.upsert({
    where: { email: 'founder@company.com' },
    update: {},
    create: {
      email: 'founder@company.com',
      password: 'password123', // Mock password (clear text for development skeleton)
      name: 'Khushi Rajawat',
      role: 'Founder',
      companyName: 'Visuark OS',
    },
  });

  console.log(`- Seeded Founder: ${founder.name}`);

  // 2. Seed System Settings
  const settings = await prisma.settings.upsert({
    where: { founderId: founder.id },
    update: {},
    create: {
      founderId: founder.id,
      globalTemperature: 0.25,
      creativeScale: 0.70,
    },
  });

  console.log(`- Seeded System Settings (Founder ID: ${settings.founderId})`);

  // 3. Seed Executives Metadata
  const executivesData = [
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
  ];

  for (const exec of executivesData) {
    const upserted = await prisma.executive.upsert({
      where: { id: exec.id },
      update: exec,
      create: exec,
    });
    console.log(`- Seeded Executive: ${upserted.name} (${upserted.id})`);
  }

  // 4. Seed Projects / Sprints
  await prisma.project.deleteMany();
  const projectsData = [
    { title: 'SEO Keyword Re-indexing', dept: 'Marketing', owner: 'Nova Sparks', level: 'Medium', column: 'Backlog' },
    { title: 'Asset Reserve Auditing', dept: 'Finance', owner: 'Ledger Vance', level: 'Low', column: 'Backlog' },
    { title: 'Database Index Compression', dept: 'Engineering', owner: 'Byte Weaver', level: 'High', column: 'In Progress' },
    { title: 'Privacy Policy Validation', dept: 'Legal', owner: 'Justice Code', level: 'High', column: 'In Review' },
    { title: 'SaaS App Authentication', dept: 'Engineering', owner: 'Byte Weaver', level: 'Medium', column: 'In Review' },
    { title: 'GKE Cloud Deployment', dept: 'Engineering', owner: 'Byte Weaver', level: 'High', column: 'Done' },
    { title: 'Runway Forecast Model v2', dept: 'Finance', owner: 'Ledger Vance', level: 'Medium', column: 'Done' },
    { title: 'Social Copy Queue Dispatch', dept: 'Marketing', owner: 'Nova Sparks', level: 'Low', column: 'Done' },
  ];

  for (const proj of projectsData) {
    await prisma.project.create({ data: proj });
  }
  console.log(`- Seeded ${projectsData.length} Projects`);

  // 5. Seed Reports
  await prisma.report.deleteMany();
  const reportsData = [
    { name: 'CFO_Q2_Financial_Audit.pdf', size: '2.4 MB', compiled: '2 hours ago', author: 'Ledger Vance (CFO)', type: 'sheet' },
    { name: 'CTO_AWS_Security_Scan.json', size: '148 KB', compiled: '5 hours ago', author: 'Byte Weaver (CTO)', type: 'code' },
    { name: 'CMO_Acquisition_Report_W25.pdf', size: '1.8 MB', compiled: '1 day ago', author: 'Nova Sparks (CMO)', type: 'text' },
    { name: 'Legal_NDA_Audit_Logs.md', size: '42 KB', compiled: '2 days ago', author: 'Justice Code (Legal)', type: 'text' },
    { name: 'CEO_Corporate_Objectives_2026.pdf', size: '1.2 MB', compiled: '3 days ago', author: 'Aria Vance (CEO)', type: 'text' }
  ];

  for (const rep of reportsData) {
    await prisma.report.create({ data: rep });
  }
  console.log(`- Seeded ${reportsData.length} Reports`);

  // 6. Seed Company Brain
  await prisma.companyBrain.deleteMany();
  const brainData = [
    {
      key: 'vision',
      value: 'Create the world\'s first fully autonomous agentic operational workspace, where enterprise functions require zero manual input.'
    },
    {
      key: 'mission',
      value: 'To empower founders with a complete, production-grade automated board of directors capable of running development, compliance, finance, and marketing pipelines on demand.'
    },
    {
      key: 'rules',
      value: '- Never share private company keys outside the workspace.\n- Always run automated security scans prior to deploying technical upgrades.\n- Financial reserves must maintain a minimum 12-month runway safeguard.'
    },
    {
      key: 'projects',
      value: 'Active projects include: GKE node optimization, database cache log compaction, campaign budget scaling, and GDPR license audits.'
    },
    {
      key: 'clients',
      value: 'Target clients: Series A high-growth startups, developer platforms, and automation-first SaaS companies looking to optimize resource efficiency.'
    },
    {
      key: 'pricing',
      value: 'Tier 1 Developer Core: $49/mo\nTier 2 Business Autonomy Suite: $149/mo\nEnterprise Private Node deployment: Custom quotation based on SLA requirements.'
    },
    {
      key: 'sops',
      value: '1. If database sizes exceed 90GB, CTO triggers compression loops.\n2. When new contracts are drafted, Legal evaluates the terms against standard compliance templates.\n3. CMO dispatches marketing copy queues on a weekly interval.'
    },
    {
      key: 'brand_guidelines',
      value: 'Visual theme: Sleek Dark Theme modeled after Linear, Apple, and Vercel. Accent tones: Cyan (CTO), Emerald (CFO), Pink (CMO), Violet (CEO). Logotype values: Premium, minimal, precise, and responsive.'
    }
  ];

  for (const item of brainData) {
    await prisma.companyBrain.create({ data: item });
  }
  console.log(`- Seeded ${brainData.length} Company Brain knowledge entries`);

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
