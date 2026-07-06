import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Command, Cpu, X, Check, CheckCheck } from 'lucide-react';
import { executives } from '@/config/executives';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: string;
  sender: string;
  avatar: string;
  title: string;
  time: string;
  read: boolean;
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Resolve executives mapping for avatars
  const execMap = executives.reduce((acc, exec) => {
    acc[exec.id] = exec;
    return acc;
  }, {} as Record<string, typeof executives[0]>);

  // State Management
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      sender: 'CTO',
      avatar: execMap['cto']?.avatar || '',
      title: 'Database index compression complete (saved $42/mo).',
      time: '4m ago',
      read: false
    },
    {
      id: '2',
      sender: 'CFO',
      avatar: execMap['cfo']?.avatar || '',
      title: 'Stripe balance payout verified & synced.',
      time: '12m ago',
      read: false
    },
    {
      id: '3',
      sender: 'LEGAL',
      avatar: execMap['legal']?.avatar || '',
      title: 'GDPR audit verified. Site registry compliant.',
      time: '35m ago',
      read: true
    },
    {
      id: '4',
      sender: 'CMO',
      avatar: execMap['cmo']?.avatar || '',
      title: 'Campaign Gamma ad queues dispatched.',
      time: '1h ago',
      read: true
    }
  ]);

  // Resolve page header title
  let currentTitle = 'Boardroom Overview';
  let activeExec = null;

  if (path && execMap[path]) {
    activeExec = execMap[path];
    currentTitle = activeExec.role;
  } else if (path === 'settings') {
    currentTitle = 'System Settings';
  } else if (path === 'projects') {
    currentTitle = 'Projects Board';
  } else if (path === 'calendar') {
    currentTitle = 'Calendar Schedule';
  } else if (path === 'reports') {
    currentTitle = 'Report Archives';
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification Operations
  const toggleDropdown = () => setIsOpen(prev => !prev);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="glass-navbar sticky top-0 z-40 flex h-14 w-full items-center justify-between px-6">
      {/* Left side: Path indicator & Active executive status */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">OS</span>
        <span className="h-4 w-[1px] bg-zinc-800"></span>
        <div className="flex items-center space-x-2">
          {activeExec && (
            <span className={`inline-block h-2 w-2 rounded-full ${
              activeExec.status === 'online' ? 'bg-emerald-500 animate-pulse' :
              activeExec.status === 'analyzing' ? 'bg-cyan-500 animate-pulse' :
              'bg-amber-500'
            }`} />
          )}
          <span className="text-sm font-medium text-zinc-200">{currentTitle}</span>
        </div>
      </div>

      {/* Middle: Command Bar (Linear style) */}
      <div className="hidden md:flex items-center max-w-md w-96">
        <button 
          className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 transition-all duration-200 group"
          onClick={() => console.log('Open Command Center')}
        >
          <div className="flex items-center space-x-2">
            <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
            <span className="group-hover:text-zinc-400 transition-colors">Search command center...</span>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[10px] bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-400">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right side: Actions, AI Status, and User (Founder) */}
      <div className="flex items-center space-x-4 relative">
        {/* System Load / AI status */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-zinc-500 border border-zinc-900 rounded-full bg-zinc-950/40 px-3 py-1">
          <Cpu className="h-3 w-3 text-cyan-500" />
          <span>Core AI Load:</span>
          <span className="text-emerald-400 font-bold">12%</span>
        </div>

        {/* Notifications Button */}
        <button 
          ref={buttonRef}
          onClick={toggleDropdown}
          className={`relative rounded-lg border p-2 transition-all duration-200 ${
            isOpen 
              ? 'border-zinc-700 bg-zinc-900 text-white' 
              : 'border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          )}
          <Bell className="h-4 w-4" />
        </button>

        {/* Dynamic Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              ref={dropdownRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-12 w-80 rounded-xl border border-zinc-900 bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-4 space-y-3 z-50 text-xs text-zinc-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-white font-mono text-[10px] uppercase tracking-wider">C-Suite Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-cyan-500/10 text-cyan-400 font-mono text-[9px] px-1.5 py-0.2 rounded-full border border-cyan-500/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="flex items-center space-x-1 text-[10px] text-zinc-500 hover:text-white transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-650 font-mono">
                    <Check className="h-5 w-5 text-zinc-700 mb-1" />
                    <span>No active notifications</span>
                  </div>
                ) : (
                  notifications.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex gap-3 p-2 rounded-lg border transition-colors relative group/item ${
                        item.read 
                          ? 'bg-zinc-950/20 border-zinc-900/40 text-zinc-500' 
                          : 'bg-zinc-900/30 border-zinc-900 text-zinc-200'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 relative">
                        <img 
                          src={item.avatar} 
                          alt="" 
                          className={`h-7 w-7 rounded-full object-cover border border-zinc-800 grayscale ${
                            item.read ? 'opacity-40' : 'brightness-95'
                          }`}
                        />
                        {!item.read && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-500 border border-zinc-950" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5 flex-1 pr-4">
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-[9px] tracking-wide text-zinc-400 font-bold uppercase">
                            {item.sender}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-600">{item.time}</span>
                        </div>
                        <p className="text-[11px] leading-tight pr-1">{item.title}</p>
                      </div>

                      {/* Actions Overlays */}
                      <div className="absolute right-2 top-2 flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {!item.read && (
                          <button 
                            onClick={() => markAsRead(item.id)}
                            className="p-0.5 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-emerald-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-2.5 w-2.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(item.id)}
                          className="p-0.5 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Separator */}
        <span className="h-6 w-[1px] bg-zinc-800"></span>

        {/* Founder Profile */}
        <div className="flex items-center space-x-3 pl-1">
          <div className="flex flex-col text-right">
            <span className="text-xs font-medium text-zinc-200">Founder</span>
            <span className="text-[10px] font-mono text-zinc-500">Only Human</span>
          </div>
          <div className="relative">
            <div className="h-8 w-8 rounded-full border border-yellow-500/50 bg-zinc-900 p-0.5">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-yellow-600 to-amber-400 flex items-center justify-center text-xs font-bold text-black select-none">
                F
              </div>
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-black bg-emerald-500"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
