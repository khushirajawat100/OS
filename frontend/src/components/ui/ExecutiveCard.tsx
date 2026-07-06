import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu } from 'lucide-react';
import type { AIExecutive } from '@/types';

interface ExecutiveCardProps {
  executive: AIExecutive;
  onOpenWorkspace: (id: string) => void;
  delayIndex?: number;
}

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  executive,
  onOpenWorkspace,
  delayIndex = 0
}) => {
  // Resolve status color rings
  const getStatusColor = (status: AIExecutive['status']) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      case 'analyzing':
        return 'bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]';
      case 'idle':
        return 'bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.3)]';
      case 'offline':
        return 'bg-zinc-800';
      default:
        return 'bg-zinc-650';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.12)' }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: delayIndex * 0.04
      }}
      className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/30 p-5 flex flex-col justify-between h-[230px] backdrop-blur-md hover:bg-zinc-950/65 group transition-colors duration-300"
    >
      {/* Subtle glass glow border reflection */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/15 transition-all duration-300" />

      {/* Dynamic accent background radial glow */}
      <div 
        className="absolute right-[-20%] top-[-20%] h-36 w-36 rounded-full opacity-[0.03] blur-[40px] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: executive.accentColor }}
      />

      <div className="space-y-4">
        {/* Header: Avatar, Status & Model Badge */}
        <div className="flex items-start justify-between">
          <div className="relative">
            <img 
              src={executive.avatar} 
              alt={executive.role} 
              className="h-12 w-12 rounded-xl object-cover border border-zinc-850 grayscale brightness-95 contrast-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300 shadow-md"
            />
            {/* Real-time status badge */}
            <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-black flex items-center justify-center ${getStatusColor(executive.status)}`} />
          </div>
          
          <div className="flex items-center space-x-1 font-mono text-[9px] text-zinc-500 bg-zinc-950/80 border border-zinc-900 px-2 py-0.5 rounded-full">
            <Cpu className="h-2.5 w-2.5 text-zinc-550 shrink-0" />
            <span>{executive.model}</span>
          </div>
        </div>

        {/* Executive Identification */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white tracking-tight leading-tight group-hover:text-zinc-100 transition-colors">
            {executive.role}
          </h4>
        </div>
      </div>

      {/* Footer / Department & Action */}
      <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between mt-auto">
        <span className="text-[9px] font-mono tracking-widest text-zinc-550 uppercase">
          {executive.department}
        </span>
        
        <button
          onClick={() => onOpenWorkspace(executive.id)}
          className="flex items-center space-x-1 text-[10px] font-semibold text-zinc-450 hover:text-white transition-colors cursor-pointer group/btn"
        >
          <span>Open Workspace</span>
          <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
export default ExecutiveCard;
