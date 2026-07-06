import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  DollarSign, 
  CheckSquare, 
  Lightbulb, 
  FileText, 
  Cpu, 
  Check,
  X
} from 'lucide-react';
import DashboardCard from '../ui/DashboardCard';
import ExecutiveCard from '../ui/ExecutiveCard';
import { getExecutiveMap } from '@/config/executives';
import { API_BASE_URL } from '@/config/api';

export const BoardroomOverview: React.FC = () => {
  const navigate = useNavigate();
  const executivesData = getExecutiveMap();

  // Dashboard state loaded from API
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchRecs = async () => {
    try {
      const resProj = await fetch(`${API_BASE_URL}/projects`);
      if (resProj.ok) {
        const allProjects = await resProj.json();
        const pendingTasks = allProjects.filter((p: any) => p.column === 'Backlog' || p.column === 'In Review');
        
        const mappedRecs = pendingTasks.map((p: any) => {
          const ownerLower = p.owner.toLowerCase();
          let execId = 'ceo';
          if (ownerLower.includes('aria') || ownerLower.includes('ceo')) execId = 'ceo';
          else if (ownerLower.includes('helix') || ownerLower.includes('coo')) execId = 'coo';
          else if (ownerLower.includes('byte') || ownerLower.includes('cto')) execId = 'cto';
          else if (ownerLower.includes('ledger') || ownerLower.includes('cfo')) execId = 'cfo';
          else if (ownerLower.includes('nova') || ownerLower.includes('cmo')) execId = 'cmo';
          else if (ownerLower.includes('justice') || ownerLower.includes('legal')) execId = 'legal';

          const execInfo = executivesData[execId];
          return {
            id: p.id,
            executor: execId.toUpperCase(),
            avatar: execInfo?.avatar || '',
            color: execInfo?.themeColor || 'text-violet-400',
            action: p.title,
            saving: p.level === 'High' ? 'High Impact Decision' : 'Standard Alignment',
            desc: `Task assigned to ${p.owner} in the ${p.dept} department. Current status: ${p.column}. Approve to start execution.`
          };
        });
        setRecommendations(mappedRecs);
      }
    } catch (err) {
      console.error('Failed to load pending project actions', err);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setActivities(data.activities || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    fetchRecs();
  }, []);

  const handleApprove = async (id: string | number) => {
    try {
      await fetch(`${API_BASE_URL}/projects/${id}/column`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: 'In Progress' })
      });
      
      const rec = recommendations.find(r => r.id === id);
      if (rec) {
        await fetch(`${API_BASE_URL}/chat/${rec.executor.toLowerCase()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `Approved action: **${rec.action}**` })
        });
      }
      fetchRecs();
    } catch (err) {
      console.error('Failed to approve project action', err);
    }
  };

  const handleDismiss = async (id: string | number) => {
    try {
      await fetch(`${API_BASE_URL}/projects/${id}/column`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: 'Done' })
      });
      fetchRecs();
    } catch (err) {
      console.error('Failed to dismiss project action', err);
    }
  };

  // Resolved dynamic values or fallbacks
  const leverage = stats?.leverage || '100.0%';
  const hoursSaved = stats?.hoursSaved || '184 hrs';
  const status = stats?.status || 'Healthy';
  const syncSpeed = stats?.syncSpeed || '12ms';
  const mrr = stats?.revenue?.mrr || '$48,250';
  const arr = stats?.revenue?.arr || '$579,000';
  const overhead = stats?.revenue?.overhead || '$142/mo';
  const margin = stats?.revenue?.margin || '99.7%';

  return (
    <div className="space-y-8 select-none">
      {/* Dashboard Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white text-gradient">
            Founder Control Panel
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            OS C-Suite status. Real-time operation parameters of your AI executives.
          </p>
        </div>
        
        {/* Uptime indicators */}
        <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-900 rounded-lg p-1.5 font-mono text-[10px] text-zinc-550">
          <span className="flex h-2 w-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>OPERATIONAL AUTONOMY: 100%</span>
        </div>
      </div>

      {/* Grid: Health, Revenue, Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Company Health */}
        <DashboardCard 
          title="Company Health" 
          subtitle="System health & department cohesion metrics"
          delayIndex={0}
          extraHeader={<Activity className="h-4 w-4 text-emerald-450" />}
          footer={
            <>
              <span>C-Suite Sync Speed</span>
              <span className="text-white font-mono">{syncSpeed}</span>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold tracking-tight text-white">{status === 'Healthy' ? '99.98%' : '100%'}</span>
              <span className="text-xs font-mono text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">OPTIMAL</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Autonomous Leverage</span>
                <span className="text-emerald-400 font-mono">{leverage}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Manual Hours Saved</span>
                <span className="text-cyan-400 font-mono">{hoursSaved}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">AI Executive Synchronization</span>
                <span className="text-zinc-300 font-mono">100% Sync</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">GKE Cluster Resource Cost</span>
                <span className="text-zinc-300 font-mono">98% Efficient</span>
              </div>
            </div>

            {/* Avatar Row */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block mb-2">Executive Array</span>
              <div className="flex space-x-2">
                {Object.values(executivesData).map(exec => (
                  <div 
                    key={exec.id} 
                    title={exec.role} 
                    className="relative group/avatar cursor-pointer"
                    onClick={() => navigate(`/${exec.id}`)}
                  >
                    <img 
                      src={exec.avatar} 
                      alt="" 
                      className="h-6 w-6 rounded-full object-cover border border-zinc-800 grayscale hover:grayscale-0 hover:scale-105 transition-all"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-black ${
                      exec.status === 'online' ? 'bg-emerald-500' :
                      exec.status === 'analyzing' ? 'bg-cyan-500' :
                      'bg-zinc-650'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* 2. Revenue */}
        <DashboardCard 
          title="Revenue" 
          subtitle="Real-time financial runways & profit margins"
          delayIndex={1}
          extraHeader={<DollarSign className="h-4 w-4 text-emerald-450" />}
          footer={
            <>
              <span>Automated Tax Alloc</span>
              <span className="text-white">Active</span>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold tracking-tight text-white">{mrr}</span>
              <span className="text-xs font-mono text-zinc-400">MRR</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">ARR Run-rate</span>
                <span className="text-zinc-300 font-mono">{arr}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">C-Suite Overhead Cost</span>
                <span className="text-emerald-400 font-mono">{overhead}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Net Profit Margin</span>
                <span className="text-emerald-400 font-mono">{margin}</span>
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="h-8 w-full pt-1">
              <div className="flex items-end justify-between h-full space-x-1.5">
                {[45, 52, 49, 60, 58, 65, 72, 70, 85].map((val, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1 bg-zinc-900 border border-zinc-850 hover:bg-emerald-500 hover:border-emerald-400 rounded-t transition-all cursor-pointer"
                    style={{ height: `${val}%` }}
                    title={`Metric interval: ${val}%`}
                  />
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* 3. Autonomous Tasks */}
        <DashboardCard 
          title="Autonomous Tasks" 
          subtitle="Real-time background agent queue"
          delayIndex={2}
          extraHeader={<CheckSquare className="h-4 w-4 text-zinc-400" />}
          footer={
            <>
              <span>Completed / Total</span>
              <span className="text-white font-mono">
                {stats?.taskCompletion ? `${stats.taskCompletion.completed} / ${stats.taskCompletion.total}` : '3 / 8'}
              </span>
            </>
          }
        >
          <div className="space-y-3 py-1 font-mono text-[11px]">
            <div className="flex justify-between items-start border-b border-zinc-900/60 pb-2">
              <div className="space-y-0.5">
                <span className="text-zinc-300 font-semibold">[CTO] Database Re-index</span>
                <p className="text-[10px] text-zinc-550">Optimizing query cache nodes</p>
              </div>
              <span className="text-cyan-400 animate-pulse">RUNNING</span>
            </div>

            <div className="flex justify-between items-start border-b border-zinc-900/60 pb-2">
              <div className="space-y-0.5">
                <span className="text-zinc-300 font-semibold">[CMO] Social Dispatcher</span>
                <p className="text-[10px] text-zinc-550">Publishing campaign assets</p>
              </div>
              <span className="text-amber-500">PENDING</span>
            </div>

            <div className="flex justify-between items-start pb-1">
              <div className="space-y-0.5">
                <span className="text-zinc-300 font-semibold">[CFO] Payroll Automation</span>
                <p className="text-[10px] text-zinc-550">Disbursing contractor fees</p>
              </div>
              <span className="text-emerald-500">COMPLETED</span>
            </div>
          </div>
        </DashboardCard>

        {/* 4. AI Recommendations */}
        <DashboardCard 
          title="AI Recommendations" 
          subtitle="Decisions awaiting Founder approval"
          delayIndex={3}
          extraHeader={<Lightbulb className="h-4 w-4 text-yellow-500" />}
          footer={
            <>
              <span>Queue Status</span>
              <span className="text-white">{recommendations.length} Pending</span>
            </>
          }
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1">
            {recommendations.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-zinc-500 font-mono text-xs">
                <Check className="h-6 w-6 text-emerald-500 mb-2" />
                <span>Recommendation queue empty. C-Suite is synced.</span>
              </div>
            ) : (
              recommendations.map(rec => (
                <div 
                  key={rec.id} 
                  className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 flex flex-col justify-between hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={rec.avatar} 
                        alt="" 
                        className="h-5 w-5 rounded-full object-cover grayscale brightness-90"
                      />
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">{rec.executor}</span>
                    </div>
                    
                    <span className="text-[11px] font-bold text-white block leading-tight">{rec.action}</span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-3">{rec.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-900/60 mt-3 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono text-emerald-400 font-semibold">{rec.saving}</span>
                    <div className="flex space-x-1.5 shrink-0">
                      <button 
                        onClick={() => handleDismiss(rec.id)}
                        className="p-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-805 text-zinc-450 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => handleApprove(rec.id)}
                        className="p-1 rounded bg-white hover:bg-zinc-200 text-black transition-colors cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        {/* 5. Executive Briefing */}
        <DashboardCard 
          title="Executive Briefing" 
          subtitle="Daily operational report summary"
          delayIndex={4}
          extraHeader={<FileText className="h-4 w-4 text-zinc-450" />}
          footer={
            <>
              <span>Briefing compiled</span>
              <span className="text-white">08:00 AM Sync</span>
            </>
          }
        >
          <div className="space-y-3 py-1">
            <div className="flex items-center space-x-2 text-zinc-300">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono">CEO Briefing note</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              "Founder, today your C-Suite achieved 100% operational velocity. CTO finalized critical API routing integrations, resulting in a 14% performance latency drop. CFO audited the billing cycles, finding zero payment dropouts. The general outlook is optimal with 18.4 months of runway. Standard security compliance certificates have been renewed. We await your approval on recommendations."
            </p>
          </div>
        </DashboardCard>

      </div>

      {/* Board Activities Logs */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase px-1">
          Recent Activity Logs
        </h3>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl divide-y divide-zinc-900">
          {loading ? (
            <div className="flex items-center justify-center p-8 font-mono text-zinc-500 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400 mr-2" />
              <span>Fetching activity parameters...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-zinc-650 font-mono text-xs">No active execution logs.</div>
          ) : (
            activities.map((act, i) => (
              <div key={i} className="p-4 flex items-start space-x-3 text-xs leading-relaxed hover:bg-zinc-900/10 transition-colors">
                <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-16">{act.time}</span>
                <div className="space-y-1">
                  <span className="font-mono text-[9px] font-bold uppercase text-zinc-350">{act.executor}</span>
                  <p className="text-zinc-400">{act.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Executive Workspace Cards */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase px-1">
          Autonomous Executive C-Suite
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(executivesData).map((exec, idx) => (
            <ExecutiveCard
              key={exec.id}
              executive={exec}
              onOpenWorkspace={(id) => navigate(`/${id}`)}
              delayIndex={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper spinner component since Loader2 isn't imported from lucide
const Loader2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default BoardroomOverview;
