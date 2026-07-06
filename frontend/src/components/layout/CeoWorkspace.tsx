import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  FileText, 
  Target, 
  MessageSquare,
  Activity,
  Check,
  X
} from 'lucide-react';
import { executivesData } from '@/context/ThemeContext';

interface Message {
  id: string;
  sender: 'founder' | 'ceo';
  text: string;
  timestamp: string;
}

export const CeoWorkspace: React.FC = () => {
  const ceo = executivesData.ceo;
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ceo',
      text: "Welcome to the executive suite, Founder. I've audited our current workspace metrics. Operational cohesion is at 100%, and runways are solid. How can I assist you with corporate strategy today?",
      timestamp: '09:00 AM'
    },
    {
      id: '2',
      sender: 'founder',
      text: "We need to align on cost savings for our infrastructure without affecting deployment speeds.",
      timestamp: '09:04 AM'
    },
    {
      id: '3',
      sender: 'ceo',
      text: "Understood. Byte Weaver (CTO) has compiled GKE logs and suggests database compression. I've logged this in the recommendations feed. Initiating a full infrastructure cost review with Ledger Vance (CFO) now.",
      timestamp: '09:05 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Recommendations States
  const [recs, setRecs] = useState([
    { id: 1, action: 'Authorize GKE Cluster Shrink', dept: 'CTO Office', impact: 'Saves $180/mo', status: 'pending' },
    { id: 2, action: 'Compress Log Databases', dept: 'CTO Office', impact: 'Saves $42/mo', status: 'pending' },
  ]);

  // Priorities Checklist
  const [priorities, setPriorities] = useState([
    { id: 1, text: 'Review CFO Monthly Runway Forecast', done: true },
    { id: 2, text: 'Validate CTO GKE Deployment parameters', done: false },
    { id: 3, text: 'Authorize campaign budget shifts (CMO)', done: false },
    { id: 4, text: 'Audit legal compliance certifications', done: true },
  ]);

  const togglePriority = (id: number) => {
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, done: !p.done } : p));
  };

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'founder',
      text: inputText.trim(),
      timestamp: currentTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate CEO processing/response after 1.5s
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Understood, Founder. Directives registered. I am dispatching instructions to Helix Sync (COO) to update the task board and priority queue immediately.",
        "Acknowledged. I will coordinate an immediate review meeting with the executive board (CFO & CTO) and update your dashboard panel shortly.",
        "Strategy updated. We will focus our autonomous pipelines on this objective. I'll summarize the results in your next Executive Briefing."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ceo',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleApproveRec = (id: number) => {
    setRecs(prev => prev.filter(r => r.id !== id));
    // Simulate adding message feed notice
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'founder',
      text: `Approved action: ${recs.find(r => r.id === id)?.action}`,
      timestamp: currentTime
    }, {
      id: (Date.now() + 1).toString(),
      sender: 'ceo',
      text: `Directive processed. Initiating execution immediately with relevant departments.`,
      timestamp: currentTime
    }]);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl">
        <div 
          className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-10 blur-[80px] pointer-events-none"
          style={{ backgroundColor: ceo.accentColor }}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={ceo.avatar} 
                alt={ceo.name} 
                className="h-16 w-16 rounded-xl object-cover border border-zinc-800 grayscale brightness-90 shadow-lg" 
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{ceo.name}</h1>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {ceo.model}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-400">{ceo.role}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 bg-zinc-900/40 border border-zinc-900 rounded-lg p-3 max-w-xs text-xs">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Office Status</span>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-300">Strategy Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Column 1: CEO Profile, Responsibilities & Health (Width 1) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Profile & Responsibilities */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase border-b border-zinc-900 pb-2">
              Core Mandate
            </h3>
            
            <p className="text-xs text-zinc-450 leading-relaxed">
              {ceo.description}
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-medium">Responsibilities</span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Align business strategy to Founder vision</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Coordinate CMO, CFO & CTO action lists</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Compile automated boardroom reporting briefs</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Company Health Card */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-900 pb-2">
              <span className="text-zinc-550 uppercase tracking-wider">C-Suite Health</span>
              <Activity className="h-3.5 w-3.5 text-emerald-450" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Autonomous Sync</span>
                <span className="text-emerald-400 font-mono">100% OK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Response Latency</span>
                <span className="text-zinc-300 font-mono">1.4s (LLM Node)</span>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase border-b border-zinc-900 pb-2">
              Recent Reports
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-xs text-zinc-350 hover:text-white transition-colors cursor-pointer">
                <FileText className="h-3.5 w-3.5 text-zinc-500" />
                <span className="truncate font-mono">CFO_Q2_Runway.pdf</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-350 hover:text-white transition-colors cursor-pointer">
                <FileText className="h-3.5 w-3.5 text-zinc-500" />
                <span className="truncate font-mono">CTO_AWS_Security.json</span>
              </div>
            </div>
          </div>

        </div>

        {/* Column 2 & 3: ChatGPT Chat Interface (Width 2) */}
        <div className="xl:col-span-2 flex flex-col h-[600px] bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
          
          {/* Chat Header */}
          <div className="glass-navbar flex h-12 w-full items-center justify-between px-4 border-b border-zinc-900">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-mono text-zinc-300">Operator Secure Feed</span>
            </div>
            
            <span className="text-[10px] font-mono text-zinc-500 uppercase bg-zinc-900 px-2 py-0.5 rounded">
              Encrypted Socket
            </span>
          </div>

          {/* Chat message feed container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.sender === 'founder' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {msg.sender === 'founder' ? (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-yellow-600 to-amber-400 flex items-center justify-center text-xs font-bold text-black font-mono">
                      F
                    </div>
                  ) : (
                    <img 
                      src={ceo.avatar} 
                      alt="" 
                      className="h-8 w-8 rounded-lg object-cover border border-zinc-800 grayscale"
                    />
                  )}
                </div>

                {/* Message Body */}
                <div className="space-y-1 max-w-[75%]">
                  <div className={`flex items-baseline space-x-2 ${msg.sender === 'founder' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {msg.sender === 'founder' ? 'Founder' : ceo.name}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">{msg.timestamp}</span>
                  </div>
                  
                  <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                    msg.sender === 'founder' 
                      ? 'bg-zinc-900 border border-zinc-850 text-zinc-200' 
                      : 'bg-zinc-950 border border-zinc-900 text-zinc-300'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isTyping && (
              <div className="flex gap-4">
                <img 
                  src={ceo.avatar} 
                  alt="" 
                  className="h-8 w-8 rounded-lg object-cover border border-zinc-800 grayscale"
                />
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-550 font-mono uppercase">{ceo.name}</span>
                  <div className="bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSend} className="p-4 border-t border-zinc-900 bg-zinc-950 flex items-center space-x-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Aria to coordinate plans, review reports..."
              className="flex-1 bg-zinc-900/60 border border-zinc-850 focus:border-zinc-700 text-sm text-zinc-200 py-2.5 px-4 rounded-lg focus:outline-none placeholder-zinc-650 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

        {/* Column 4: Priorities Checklist & Recommendations (Width 1) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Today's Priorities */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-2">
              <Target className="h-4 w-4 text-zinc-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest">Office Priorities</h3>
            </div>

            <div className="space-y-3">
              {priorities.map(p => (
                <label 
                  key={p.id} 
                  className="flex items-start space-x-2.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={p.done}
                    onChange={() => togglePriority(p.id)}
                    className="rounded bg-black border-zinc-800 text-white focus:ring-0 focus:ring-offset-0 h-4 w-4 mt-0.5 cursor-pointer accent-white"
                  />
                  <span className={p.done ? 'line-through text-zinc-600' : ''}>
                    {p.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Recommendations Panel */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase border-b border-zinc-900 pb-2">
              Pending Strategy Decisions
            </h3>

            {recs.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono">No strategy decisions pending approval.</p>
            ) : (
              <div className="space-y-3.5">
                {recs.map(r => (
                  <div key={r.id} className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-zinc-500 uppercase">{r.dept}</span>
                      <span className="text-emerald-400 font-semibold">{r.impact}</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-200 block leading-tight">{r.action}</span>
                    
                    <div className="flex space-x-1.5 justify-end pt-1">
                      <button 
                        onClick={() => handleApproveRec(r.id)}
                        className="p-1 rounded bg-zinc-905 hover:bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleApproveRec(r.id)}
                        className="p-1 rounded bg-white hover:bg-zinc-200 text-black transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default CeoWorkspace;
