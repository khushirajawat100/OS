import React from 'react';
import { useLocation } from 'react-router-dom';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { executivesData } from '@/context/ThemeContext';

export const OfficePlaceholder: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);
  const exec = executivesData[path];

  if (!exec) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-white">Office Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2">The requested AI executive workstation is offline or unconfigured.</p>
      </div>
    );
  }

  // Generate some fake metrics based on department to make it look realistic
  const getMetrics = () => {
    switch (exec.id) {
      case 'ceo':
        return [
          { label: 'Strategic Alignment', value: '98%', status: 'optimal' },
          { label: 'C-Suite Decisions', value: '42 / Week', status: 'active' },
          { label: 'Founder Directives', value: 'Synced', status: 'optimal' },
        ];
      case 'cto':
        return [
          { label: 'Production Deploys', value: '14 Today', status: 'optimal' },
          { label: 'API Gateway Latency', value: '18ms', status: 'optimal' },
          { label: 'Repository Health', value: '99.2%', status: 'optimal' },
        ];
      case 'cfo':
        return [
          { label: 'Monthly Runway', value: '18.4 Months', status: 'optimal' },
          { label: 'Burn Rate', value: '$8,420 / Mo', status: 'stable' },
          { label: 'Revenue Forecast', value: '+14% MoM', status: 'active' },
        ];
      case 'cmo':
        return [
          { label: 'Acquisition Cost', value: '$1.42 / User', status: 'optimal' },
          { label: 'SEO Authority Rank', value: '48/100', status: 'improving' },
          { label: 'Ad Conversion', value: '4.82%', status: 'active' },
        ];
      case 'coo':
        return [
          { label: 'Automation Coverage', value: '82%', status: 'optimal' },
          { label: 'Daily Ticket Deflection', value: '94%', status: 'optimal' },
          { label: 'Sprint Velocity', value: '98 pts', status: 'active' },
        ];
      case 'hr':
        return [
          { label: 'AI Contractor Count', value: '12 Active', status: 'stable' },
          { label: 'Sourcing Duration', value: '< 2 Mins', status: 'optimal' },
          { label: 'Task Cost Saving', value: '88%', status: 'optimal' },
        ];
      case 'legal':
        return [
          { label: 'Compliance Index', value: '100%', status: 'optimal' },
          { label: 'NDA Drafting Time', value: '8 Secs', status: 'optimal' },
          { label: 'Pending IP Filings', value: '3 Active', status: 'active' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-8 shadow-2xl">
        <div 
          className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-10 blur-[80px]"
          style={{ backgroundColor: exec.accentColor }}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img 
                src={exec.avatar} 
                alt={exec.name} 
                className="h-20 w-20 rounded-xl object-cover border border-zinc-800 grayscale shadow-lg brightness-90 contrast-125" 
              />
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-zinc-950 ${
                exec.status === 'online' ? 'bg-emerald-500' :
                exec.status === 'analyzing' ? 'bg-cyan-500' :
                'bg-zinc-650'
              }`} />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{exec.name}</h1>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {exec.model}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-400">{exec.role}</p>
              <div className="flex items-center text-xs text-zinc-500 font-medium">
                <Sparkles className="h-3 w-3 mr-1 text-zinc-400" />
                <span>Department: {exec.department}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 bg-zinc-900/40 border border-zinc-900 rounded-lg p-4 max-w-xs">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Office Status</span>
            <div className="flex items-center space-x-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                exec.status === 'online' ? 'bg-emerald-500' :
                exec.status === 'analyzing' ? 'bg-cyan-500 animate-pulse' :
                'bg-zinc-600'
              }`} />
              <span className="text-xs font-semibold text-zinc-300 capitalize">{exec.status}</span>
            </div>
            <p className="text-[11px] text-zinc-500">Autonomous loop active. Working on workspace objectives.</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-400 max-w-2xl leading-relaxed">{exec.description}</p>
      </div>

      {/* Grid: Metrics & Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Metrics */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase px-1">Performance Indicators</h3>
          
          <div className="space-y-3">
            {getMetrics().map((metric, i) => (
              <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-4 hover:border-zinc-850 transition-colors">
                <span className="text-xs text-zinc-500">{metric.label}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-white tracking-tight">{metric.value}</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Console / Task Console Panel */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Executive Autonomous Feed</h3>
            <span className="text-[10px] font-mono text-zinc-500">Real-time logs</span>
          </div>

          <div className="flex-1 min-h-[250px] bg-zinc-950 border border-zinc-900 rounded-lg p-5 font-mono text-xs text-zinc-400 space-y-3 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-zinc-800 pointer-events-none">
              <TerminalIcon className="h-24 w-24 opacity-5" />
            </div>
            
            <div className="flex items-center space-x-1.5 text-zinc-500">
              <span className="text-emerald-500">os:</span>
              <span>~/{exec.id}-office$</span>
              <span className="text-zinc-200">cat system_init.log</span>
            </div>
            
            <div className="space-y-1.5 text-zinc-500">
              <p className="text-zinc-400">[info] Initializing AI Executive Office Core (Model: {exec.model})...</p>
              <p className="text-zinc-400">[info] Syncing Founder directivs from Workspace Configuration...</p>
              <p className="text-zinc-400">[info] Compiling department intelligence graph...</p>
              <p className="text-emerald-400/90">[ready] {exec.name} Office Interface Active. System healthy.</p>
              <p className="text-zinc-400">[sync] Main dashboard connection established securely.</p>
              <p className="text-cyan-400/95">[status] Current status: "{exec.status === 'analyzing' ? 'Processing strategic workspace nodes' : 'Standing by for instructions'}"</p>
            </div>

            <div className="pt-2 border-t border-zinc-900 flex items-center space-x-2 text-zinc-600">
              <span className="animate-pulse">_</span>
              <span className="italic text-[10px]">Ready to process executive directives...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OfficePlaceholder;
