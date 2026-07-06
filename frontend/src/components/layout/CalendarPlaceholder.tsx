import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, CheckCircle2, Plus } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface EventItem {
  time: string;
  title: string;
  lead: string;
  type: string;
  status: 'completed' | 'upcoming';
}

interface DayItem {
  num: string;
  day: string;
  active: boolean;
  rawDate: Date;
  monthName: string;
}

export const CalendarPlaceholder: React.FC = () => {
  // Helper to get days of the current week based on referenceDate
  const getRealWorldDays = (refDate: Date): DayItem[] => {
    const currentDay = refDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() + diffToMonday);
    
    const weekDays = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const numStr = date.getDate().toString().padStart(2, '0');
      
      const isActive = date.getDate() === refDate.getDate() && 
                      date.getMonth() === refDate.getMonth() && 
                      date.getFullYear() === refDate.getFullYear();
      
      weekDays.push({
        num: numStr,
        day: dayNames[i],
        active: isActive,
        rawDate: date,
        monthName: date.toLocaleString('default', { month: 'short' })
      });
    }
    
    if (!weekDays.some(d => d.active)) {
      weekDays[0].active = true;
    }
    
    return weekDays;
  };

  const [referenceDate, setReferenceDate] = useState(new Date());
  const days = getRealWorldDays(referenceDate);

  // Events dataset mapped by day number
  const [scheduleData, setScheduleData] = useState<Record<string, EventItem[]>>({});

  // State indicators
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('02:00 PM');
  const [newLead, setNewLead] = useState('CEO');
  const [newType, setNewType] = useState('Strategy');
  const [newDay, setNewDay] = useState(() => new Date().getDate().toString().padStart(2, '0'));

  // Load calendar events from backend
  const fetchCalendar = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/calendar`);
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
      }
    } catch (err) {
      console.error('Failed to load calendar events', err);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  // Resolve current active day
  const activeDayObj = days.find(d => d.active) || days[0];
  const activeEvents = scheduleData[activeDayObj.num] || [];

  const handleDayClick = (dayObj: DayItem) => {
    setReferenceDate(dayObj.rawDate);
    setNewDay(dayObj.num);
    setShowSuccessMsg(false);
  };

  const handlePrevWeek = () => {
    const prev = new Date(referenceDate);
    prev.setDate(referenceDate.getDate() - 7);
    setReferenceDate(prev);
    setShowSuccessMsg(false);
  };

  const handleNextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(referenceDate.getDate() + 7);
    setReferenceDate(next);
    setShowSuccessMsg(false);
  };

  // Sync Cycle simulation via backend
  const handleTriggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setShowSuccessMsg(false);

    try {
      const res = await fetch(`${API_BASE_URL}/calendar/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: activeDayObj.num })
      });
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
        setShowSuccessMsg(true);
      }
    } catch (err) {
      console.error('Failed to sync calendar nodes', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add Custom Event handler via backend
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: newDay,
          time: newTime,
          title: newTitle.trim(),
          lead: newLead,
          type: newType,
          status: 'upcoming'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
        setNewTitle('');
        // Switch to target day automatically
        const targetDayObj = days.find(d => d.num === newDay);
        if (targetDayObj) {
          setReferenceDate(targetDayObj.rawDate);
        }
      }
    } catch (err) {
      console.error('Failed to schedule calendar event', err);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">
            AI Sync Schedule
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Configure sync checkpoints and trigger real-time AI node handshakes across the workspace.
          </p>
        </div>
        
        <button 
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="flex items-center space-x-2 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-semibold py-2.5 px-4 transition-colors cursor-pointer"
        >
          {isSyncing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span>{isSyncing ? 'Syncing Nodes...' : 'Sync C-Suite Now'}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {showSuccessMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2.5 p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-mono"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Success: All executive workspace parameters fully synchronized. Active logs committed.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline scheduler */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Week Header */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col xl:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrevWeek}
                  className="p-1.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                  title="Previous Week"
                >
                  &larr;
                </button>
                <span className="text-xs font-mono font-bold text-zinc-350 uppercase tracking-widest min-w-[110px] text-center">
                  {referenceDate.toLocaleString('default', { month: 'long' })} {referenceDate.getFullYear()}
                </span>
                <button 
                  onClick={handleNextWeek}
                  className="p-1.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                  title="Next Week"
                >
                  &rarr;
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono text-zinc-550 uppercase">Jump:</span>
                <input 
                  type="date"
                  value={new Date(referenceDate.getTime() - referenceDate.getTimezoneOffset() * 60000).toISOString().substring(0, 10)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setReferenceDate(new Date(e.target.value));
                    }
                  }}
                  className="bg-zinc-900 border border-zinc-850 text-zinc-350 text-[10px] font-mono rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-700 cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto justify-center sm:justify-start">
              {days.map((d) => (
                <button 
                  key={d.num} 
                  onClick={() => handleDayClick(d)}
                  className={`flex flex-col items-center justify-center h-12 w-10 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    d.active 
                      ? 'bg-white border-white text-black font-semibold shadow-md' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  <span className="text-[9px] font-mono leading-none">{d.day}</span>
                  <span className="text-sm font-bold mt-1 leading-none">{d.num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chronological events feed */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase px-1">
              Events for {activeDayObj.monthName} {activeDayObj.num}
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDayObj.num}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {activeEvents.map((evt, i) => (
                    <div 
                      key={i} 
                      className="bg-zinc-950/40 border border-zinc-900 hover:border-zinc-855 p-4 rounded-xl flex items-center justify-between gap-4 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Time label */}
                        <div className="flex flex-col text-left shrink-0">
                          <span className="text-xs font-mono font-bold text-white">{evt.time}</span>
                          <span className="text-[9px] font-mono text-zinc-550 uppercase mt-0.5">{evt.type}</span>
                        </div>
                        
                        <span className="h-6 w-[1px] bg-zinc-850" />
                        
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">{evt.title}</h4>
                          <p className="text-[10px] text-zinc-500">Lead: {evt.lead}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                          evt.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-900/60 text-zinc-500 border-zinc-850 animate-pulse'
                        }`}>
                          {evt.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {activeEvents.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl font-mono text-xs text-zinc-600">
                      No automated events scheduled for this day.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Right Column: Clock & Design / Reminder Form */}
        <div className="space-y-6">
          
          {/* Boardroom Clock */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-3">
              <Clock className="h-4.5 w-4.5 text-zinc-450" />
              <h2 className="text-md font-semibold">Boardroom Clock</h2>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 font-mono text-[11px]">Autonomous Frequency</span>
                <span className="text-zinc-300 font-mono">1 Hour intervals</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 font-mono text-[11px]">Next Strategy Cycle</span>
                <span className="text-cyan-400 font-mono">
                  {showSuccessMsg ? 'Completed' : 'In 24 mins'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 font-mono text-[11px]">System Timezone</span>
                <span className="text-zinc-300 font-mono">GMT+05:30</span>
              </div>
            </div>
          </div>

          {/* Create Calendar Task / Event Form */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-3">
              <Plus className="h-4.5 w-4.5 text-zinc-400" />
              <h2 className="text-md font-semibold">Schedule C-Suite Checkpoint</h2>
            </div>
            
            <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Checkpoint Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Audit GKE Node Cost"
                  required
                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded p-2 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 03:00 PM"
                    required
                    className="w-full bg-zinc-900/60 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-850 rounded p-2 text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    {days.map(d => (
                      <option key={d.num} value={d.num}>{new Date().toLocaleString('default', { month: 'short' })} {d.num} ({d.day})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider block">Lead Executive</label>
                  <select
                    value={newLead}
                    onChange={(e) => setNewLead(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-850 rounded p-2 text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="CEO">CEO</option>
                    <option value="CTO">CTO</option>
                    <option value="CFO">CFO</option>
                    <option value="CMO">CMO</option>
                    <option value="COO">COO</option>
                    <option value="LEGAL">LEGAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-550 font-mono text-[9px] uppercase tracking-wider block">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-850 rounded p-2 text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="Strategy">Strategy</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black py-2 rounded font-semibold transition-colors mt-2 text-center block cursor-pointer"
              >
                Schedule Checkpoint
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Syncing Overlay Panel */}
      {isSyncing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl flex flex-col items-center space-y-4 max-w-xs text-center">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Syncing Executive Nodes</h3>
              <p className="text-[10px] text-zinc-550">Aligning computational parameters and indexing report ledgers...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CalendarPlaceholder;
