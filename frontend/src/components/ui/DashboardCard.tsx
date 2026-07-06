import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  extraHeader?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  delayIndex?: number;
  className?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  extraHeader,
  children,
  footer,
  delayIndex = 0,
  className = '',
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: delayIndex * 0.05, 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 hover:border-zinc-800 hover:bg-zinc-950 transition-all duration-300 group flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle card top glow */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800/40 to-transparent group-hover:via-zinc-700/60 transition-all" />
      
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest leading-none">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-zinc-400 font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {extraHeader && <div className="shrink-0">{extraHeader}</div>}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          {footer}
        </div>
      )}
    </motion.div>
  );
};
export default DashboardCard;
