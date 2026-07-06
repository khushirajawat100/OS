import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  Activity,
  FolderGit2,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { executives } from '@/config/executives';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Core items
  const coreItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" /> 
    },
  ];

  // Workspace items
  const workspaceItems = [
    { 
      name: 'Projects', 
      path: '/projects', 
      icon: <FolderGit2 className="h-4 w-4 shrink-0" /> 
    },
    { 
      name: 'Calendar', 
      path: '/calendar', 
      icon: <Calendar className="h-4 w-4 shrink-0" /> 
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: <BarChart3 className="h-4 w-4 shrink-0" /> 
    },
  ];

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="glass-sidebar flex h-screen flex-col justify-between p-4 text-zinc-400 select-none overflow-hidden shrink-0 relative"
    >
      {/* Brand Header */}
      <div className="flex flex-col space-y-4">
        <div className={`flex items-center justify-between px-2 py-1.5 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black font-extrabold tracking-tighter text-lg shadow-[0_0_15px_rgba(255,255,255,0.15)] overflow-hidden">
              O
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
            </div>
            
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden"
                >
                  <span className="text-sm font-semibold tracking-tight text-white leading-none">OS</span>
                  <span className="text-[10px] font-mono tracking-wider text-zinc-500 mt-1 uppercase">Autonomous C-Suite</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Button - Sleek floating/aligned toggle */}
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {isCollapsed && (
          <div className="flex justify-center py-1">
            <button 
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="h-[1px] bg-zinc-900" />

        {/* Main Nav */}
        <div className="space-y-4">
          {/* Core */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-mono tracking-widest text-zinc-650 uppercase block">Core</span>
            )}
            
            {coreItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end
                className={({ isActive }) =>
                  `relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 group ${
                    isCollapsed ? 'justify-center px-0' : 'justify-start'
                  } ${isActive ? 'text-white' : 'hover:text-zinc-200 hover:bg-zinc-950/50'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-lg bg-zinc-900 border border-zinc-800 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.icon}
                    
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Tooltip for Collapsed View */}
                    {isCollapsed && (
                      <span className="opacity-0 pointer-events-none absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-white rounded transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* AI Executives */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-mono tracking-widest text-zinc-650 uppercase block">AI Executives</span>
            )}
            
            {executives.map((exec) => (
              <NavLink
                key={exec.id}
                to={`/${exec.id}`}
                className={({ isActive }) =>
                  `relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 group ${
                    isCollapsed ? 'justify-center px-0 space-x-0' : 'justify-start space-x-3'
                  } ${isActive ? 'text-white' : 'hover:text-zinc-200 hover:bg-zinc-950/50'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-lg bg-zinc-900 border border-zinc-800 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative shrink-0">
                      <img 
                        src={exec.avatar} 
                        alt={exec.id.toUpperCase()} 
                        className="h-5 w-5 rounded-full object-cover grayscale brightness-90 contrast-125" 
                      />
                      <span className={`absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full border border-black ${
                        exec.status === 'online' ? 'bg-emerald-500' :
                        exec.status === 'analyzing' ? 'bg-cyan-500' :
                        'bg-zinc-600'
                      }`} />
                    </div>

                    {!isCollapsed && <span className="text-zinc-300 group-hover:text-white transition-colors">{exec.id.toUpperCase()}</span>}

                    {/* Tooltip for Collapsed View */}
                    {isCollapsed && (
                      <span className="opacity-0 pointer-events-none absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-white rounded transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                        {exec.id.toUpperCase()} Office
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Workspace */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-mono tracking-widest text-zinc-650 uppercase block">Workspace</span>
            )}
            
            {workspaceItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 group ${
                    isCollapsed ? 'justify-center px-0' : 'justify-start'
                  } ${isActive ? 'text-white' : 'hover:text-zinc-200 hover:bg-zinc-950/50'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-lg bg-zinc-900 border border-zinc-800 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.icon}
                    
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Tooltip for Collapsed View */}
                    {isCollapsed && (
                      <span className="opacity-0 pointer-events-none absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-white rounded transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / System Settings */}
      <div className="flex flex-col space-y-3">
        <nav className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 group ${
                isCollapsed ? 'justify-center px-0' : 'justify-start'
              } ${isActive ? 'text-white' : 'hover:text-zinc-200 hover:bg-zinc-950/50'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-lg bg-zinc-900 border border-zinc-800 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Settings className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Settings</span>}

                {/* Tooltip for Collapsed View */}
                {isCollapsed && (
                  <span className="opacity-0 pointer-events-none absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-white rounded transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
                    Settings
                  </span>
                )}
              </>
            )}
          </NavLink>
        </nav>

        {/* Sync Status / System Load */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950/50 p-2.5">
            <div className="flex items-center space-x-2">
              <Activity className="h-3.5 w-3.5 text-zinc-650" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-medium">Sync Active</span>
                <span className="text-[8px] font-mono text-zinc-650">v1.0.0-alpha</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              SECURE
            </span>
          </div>
        ) : (
          <div className="flex justify-center p-1 cursor-help group relative">
            <Activity className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            
            {/* Tooltip for Sync status when collapsed */}
            <span className="opacity-0 pointer-events-none absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-white rounded transition-opacity duration-150 group-hover:opacity-100 z-50 whitespace-nowrap">
              Sync Active (Secure)
            </span>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
export default Sidebar;
