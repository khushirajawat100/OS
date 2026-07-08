import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Send, 
  FileText, 
  Target, 
  MessageSquare,
  Check,
  X,
  Play,
  Key,
  Trash2,
  Loader2,
  Clock,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff
} from 'lucide-react';
import { getExecutiveMap } from '@/config/executives';
import { API_BASE_URL } from '@/config/api';

const SpeechRecognitionAPI = typeof window !== 'undefined' 
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) 
  : null;

const isSTTSupported = !!SpeechRecognitionAPI;

interface Message {
  id: string;
  sender: 'founder' | 'executive';
  text: string;
  timestamp: string;
}



// Mapped document contents for preview modals
const fileContentMap: Record<string, {
  title: string;
  type: string;
  compiled: string;
  author: string;
  content: React.ReactNode;
}> = {
  'CFO_Q2_Financial_Audit.pdf': {
    title: 'CFO Q2 Financial Audit Report',
    type: 'Financial Statement (PDF)',
    compiled: '2 hours ago',
    author: 'CFO (Finance Department)',
    content: (
      <div className="space-y-4 text-xs font-mono">
        <div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-2 text-zinc-500 uppercase tracking-wider text-[9px]">
          <span>Financial Node</span>
          <span className="text-right">Balance Log</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>Monthly Recurring Revenue (MRR)</span>
            <span className="text-emerald-400 font-bold">$48,250</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>Annual Run Rate (ARR)</span>
            <span className="text-emerald-400 font-bold">$579,000</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>Total C-Suite Operational Cost</span>
            <span className="text-zinc-400">$142/mo</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>Tax Reserve Alloc (21%)</span>
            <span className="text-zinc-400">$10,132</span>
          </div>
          <div className="flex justify-between text-zinc-300">
            <span>Net Corporate Profit Margin</span>
            <span className="text-emerald-400 font-bold">99.7%</span>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded text-[10px] text-zinc-500 leading-relaxed">
          *AUDIT SUMMARY*: Financial parameters verify runway exceeds 18 months under current C-suite resource consumption. Automated tax reserves are running at optimal rates.
        </div>
      </div>
    )
  },
  'CTO_AWS_Security_Scan.json': {
    title: 'CTO AWS Cloud Security Scan Log',
    type: 'Security Registry (JSON)',
    compiled: '5 hours ago',
    author: 'CTO (Engineering Department)',
    content: (
      <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[10px] text-cyan-400 overflow-x-auto leading-normal">
{`{
  "scan_status": "COMPLETED",
  "security_cohesion": 1.0,
  "gke_nodes": {
    "compute_cluster": "os-core-prod",
    "region": "us-east1",
    "nodes_active": 3,
    "utilization": "82.4%"
  },
  "dependencies": {
    "vulnerabilities": 0,
    "packages_checked": 126
  },
  "compliance": {
    "soc2": "verified",
    "ssl_handshake": "optimal"
  }
}`}
      </pre>
    )
  },
  'CMO_Acquisition_Report_W25.pdf': {
    title: 'CMO Customer Acquisition Report (W25)',
    type: 'Marketing Analytics (PDF)',
    compiled: '1 day ago',
    author: 'CMO (Marketing)',
    content: (
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-3 gap-2 text-center text-zinc-500 uppercase tracking-widest text-[9px] font-mono border-b border-zinc-900 pb-2">
          <span>Ad Spend</span>
          <span>Avg CAC</span>
          <span>Click-Through</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-white text-sm py-2">
          <span className="text-zinc-300">$2,450</span>
          <span className="text-emerald-400">$1.42</span>
          <span className="text-cyan-400">4.82%</span>
        </div>
        <div className="space-y-2 text-zinc-305 font-mono text-[11px]">
          <div className="flex justify-between border-b border-zinc-900 pb-1">
            <span>Campaign Gamma (Google Ads)</span>
            <span className="text-emerald-400">+14% Growth</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-1">
            <span>Campaign Beta (X Campaign)</span>
            <span className="text-zinc-500">Unused Budget Shifted</span>
          </div>
          <div className="flex justify-between">
            <span>Organic Traffic Conversion</span>
            <span className="text-cyan-400">+4.2% Reach</span>
          </div>
        </div>
      </div>
    )
  },
  'Legal_NDA_Audit_Logs.md': {
    title: 'SaaS Integration Non-Disclosure Agreement (NDA)',
    type: 'Contract Template (Markdown)',
    compiled: '2 days ago',
    author: 'Legal Counsel',
    content: (
      <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-mono select-text max-h-[250px] overflow-y-auto pr-1">
        <h4 className="text-white font-bold border-b border-zinc-900 pb-1 uppercase tracking-wide">MUTUAL NON-DISCLOSURE CONTRACT</h4>
        <p>This Non-Disclosure Agreement is entered into by and between the **Founder of OS** and the authorizing SaaS Integration Partner.</p>
        <p><strong>1. PURPOSE:</strong> The parties wish to evaluate a technical integration between their systems. During this evaluation, parties may disclose confidential technical assets.</p>
        <p><strong>2. CONFIDENTIAL INFORMATION:</strong> Includes all code blocks, database keys, customer parameters, and C-Suite prompt instructions.</p>
        <p><strong>3. STANDARDS:</strong> Information must be kept secure. GDPR privacy codes must be maintained under 100% compliance guidelines.</p>
      </div>
    )
  },
  'SEO_Authority_Rank.md': {
    title: 'Search Rank Authority Log',
    type: 'SEO Dashboard (Markdown)',
    compiled: '1 day ago',
    author: 'CMO (Marketing)',
    content: (
      <div className="space-y-3 text-xs text-zinc-300 font-mono">
        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
          <span>Organic Google Rank Position #1</span>
          <span className="text-emerald-400">"Autonomous OS"</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
          <span>Organic Google Rank Position #2</span>
          <span className="text-emerald-400">"Founder AI Suite"</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
          <span>Google Visibility Index</span>
          <span className="text-cyan-400">88.2% (+3.4%)</span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded text-[10px] text-zinc-500 leading-relaxed">
          *STRATEGY NOTE*: Product Hunt launch queue is verified. Scheduling posts for maximum conversion exposure.
        </div>
      </div>
    )
  },
  'GDPR_Compliance_Scan.pdf': {
    title: 'GDPR Regulatory Compliance Report',
    type: 'Legal Audit (PDF)',
    compiled: '2 days ago',
    author: 'Legal Counsel',
    content: (
      <div className="space-y-4 text-xs font-mono">
        <div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-2 text-zinc-500 uppercase tracking-wider text-[9px]">
          <span>Compliance Register</span>
          <span className="text-right">Evaluation Status</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>User Data Cookie Policies</span>
            <span className="text-emerald-400 font-bold">100% Compliant</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>System Encryption (TLS 1.3)</span>
            <span className="text-emerald-400 font-bold">Secure</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900/60 pb-1.5 text-zinc-300">
            <span>IP Domain Registrations</span>
            <span className="text-zinc-400">Active</span>
          </div>
          <div className="flex justify-between text-zinc-300">
            <span>GDPR Data Processing Agreement</span>
            <span className="text-emerald-400 font-bold">Verified</span>
          </div>
        </div>
      </div>
    )
  },
  'CEO_Corporate_Objectives_2026.pdf': {
    title: 'CEO Corporate Strategy Objectives 2026',
    type: 'Strategy Blueprint (PDF)',
    compiled: '3 days ago',
    author: 'CEO (Corporate)',
    content: (
      <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-mono">
        <h4 className="text-white font-bold border-b border-zinc-900 pb-1 uppercase tracking-wide">ENTERPRISE ROADMAP OBJECTIVES</h4>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-emerald-400">✔</span>
            <span>Achieve **100% operational leverage** using fully synced LLM workflows.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-emerald-400">✔</span>
            <span>Establish cash-flow runway exceeding **18 months** with $0 manual labor cost.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-cyan-400">✦</span>
            <span>Optimize production cloud workloads (CTO targeting database index log reductions).</span>
          </div>
        </div>
      </div>
    )
  },
  'GKE_Cluster_Logs.log': {
    title: 'GKE production compute logs',
    type: 'System Console Log (.log)',
    compiled: '5 hours ago',
    author: 'CTO (Engineering)',
    content: (
      <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[9px] text-zinc-400 overflow-y-auto max-h-[220px] leading-normal">
{`[INFO] 2026-06-27T08:00:14Z core-ingress-service listening on port 80
[INFO] 2026-06-27T08:02:18Z gke-compute-node-1 CPU utilization steady at 44.8%
[WARN] 2026-06-27T08:04:12Z db-indexer heap utilization reached 88%
[INFO] 2026-06-27T08:04:18Z db-indexer executing dynamic compression index
[INFO] 2026-06-27T08:04:22Z db-indexer compressed 4.8MB logs (completed successfully)
[INFO] 2026-06-27T08:04:25Z db-indexer heap utilization dropped to 24%`}
      </pre>
    )
  },
  'Operations_Sync_v1.md': {
    title: 'COO Operations Alignment Plan',
    type: 'Operational Layout (Markdown)',
    compiled: '2 days ago',
    author: 'COO (Operations)',
    content: (
      <div className="space-y-3 text-xs text-zinc-350 leading-relaxed font-mono">
        <h4 className="text-white font-bold border-b border-zinc-900 pb-1 uppercase tracking-wide">COO ROADMAP PLAN</h4>
        <p>Operational indices report **100% cohesion** between C-Suite automated workflows.</p>
        <p><strong>Active Sprints:</strong> CTO resolving auth integrations, CMO deploying ad queues, CFO verifying contractor payments.</p>
        <p><strong>System check cadence:</strong> Dynamic loop triggers every 15 minutes, refreshing active indices.</p>
      </div>
    )
  },
  'Stripe_Payout_Ledger.csv': {
    title: 'Stripe Ledger Payout History',
    type: 'Financial ledger (.csv)',
    compiled: '12 hours ago',
    author: 'CFO (Finance)',
    content: (
      <div className="space-y-3 text-xs font-mono">
        <div className="grid grid-cols-3 gap-4 border-b border-zinc-900 pb-2 text-zinc-555 uppercase tracking-wider text-[9px]">
          <span>Payout ID</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="space-y-1.5 text-zinc-300">
          <div className="flex justify-between border-b border-zinc-900/40 pb-1">
            <span>po_1H9s21Kx8a</span>
            <span>2026-06-25</span>
            <span className="text-emerald-400 font-bold">$12,450</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900/40 pb-1">
            <span>po_1H7y92Lx4q</span>
            <span>2026-06-18</span>
            <span className="text-emerald-400 font-bold">$14,800</span>
          </div>
          <div className="flex justify-between">
            <span>po_1H5z18Kx9a</span>
            <span>2026-06-11</span>
            <span className="text-emerald-400 font-bold">$11,200</span>
          </div>
        </div>
      </div>
    )
  }
};

const parseMarkdown = (text: string): string => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded font-mono text-[10px] text-cyan-400">$1</code>');
  html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="list-disc ml-4 my-1 text-zinc-350">$1</li>');
  html = html.replace(/\n/g, '<br />');
  return html;
};

export const ExecutiveWorkspace: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);
  
  const executivesData = getExecutiveMap();
  const exec = executivesData[path];
  


  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [compiledFiles, setCompiledFiles] = useState<any[]>([]);
  const [uploadedFilesContent, setUploadedFilesContent] = useState<Record<string, { title: string; type: string; content: React.ReactNode; compiled?: string; author?: string }>>({});
  const [dynamicFileContent, setDynamicFileContent] = useState<{ title: string; type: string; content: React.ReactNode; author?: string; compiled?: string } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Interactive states
  const [runningTool, setRunningTool] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Calendar synchronization states
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [schedulingPriorityId, setSchedulingPriorityId] = useState<string | number | null>(null);
  const [scheduleDay, setScheduleDay] = useState(() => new Date().getDate().toString().padStart(2, '0'));
  const [scheduleTime, setScheduleTime] = useState('02:00 PM');
  const [successScheduledId, setSuccessScheduledId] = useState<string | number | null>(null);

  // Speech Synthesis & Recognition States & Refs
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [wakeWordListening, setWakeWordListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'en' | 'hi'>('en');
  const [liveTalkActive, setLiveTalkActive] = useState(false);

  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const wakeWordListeningRef = useRef(false);
  const speechLanguageRef = useRef<'en' | 'hi'>('en');
  const liveTalkActiveRef = useRef(false);
  const transcribedTextRef = useRef('');

  // Sync ref values with state changes
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    wakeWordListeningRef.current = wakeWordListening;
  }, [wakeWordListening]);

  useEffect(() => {
    liveTalkActiveRef.current = liveTalkActive;
  }, [liveTalkActive]);

  // Handle language switch
  useEffect(() => {
    speechLanguageRef.current = speechLanguage;
    localStorage.setItem('heyOsLanguage', speechLanguage);
    if (wakeWordListeningRef.current) {
      startWakeWordListening();
    }
  }, [speechLanguage]);

  // Load voices and restore settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }

    const savedWakeWord = localStorage.getItem('heyOsWakeWordActive') === 'true';
    const savedLanguage = localStorage.getItem('heyOsLanguage') as 'en' | 'hi' || 'en';
    setSpeechLanguage(savedLanguage);
    speechLanguageRef.current = savedLanguage;

    if (savedWakeWord && SpeechRecognitionAPI) {
      const startListening = () => {
        setWakeWordListening(true);
        wakeWordListeningRef.current = true;
        startWakeWordListening();
        window.removeEventListener('click', startListening);
        window.removeEventListener('keydown', startListening);
      };

      try {
        setWakeWordListening(true);
        wakeWordListeningRef.current = true;
        startWakeWordListening();
      } catch (e) {
        window.addEventListener('click', startListening);
        window.addEventListener('keydown', startListening);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }
    };
  }, []);

  // Helper to strip markdown and prep text for speech
  const cleanTextForSpeech = (text: string): string => {
    let clean = text.replace(/!\[.*?\]\(.*?\)/g, '');
    clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    clean = clean.replace(/>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi, '');
    clean = clean.replace(/📎\s*Forwarded Document:/gi, 'Forwarded document:');
    clean = clean.replace(/📎\s*Generated Deliverable:/gi, 'Generated deliverable:');
    clean = clean.replace(/[*_`#]/g, '');
    clean = clean.replace(/<[^>]*>/g, '');
    return clean.trim();
  };

  // Map role IDs to specific voice properties (pitch/rate) to give them individual character
  const getVoiceParams = (roleId: string) => {
    switch (roleId.toLowerCase()) {
      case 'ceo':
        return { pitch: 1.05, rate: 0.95 }; // Aria Vance: Clear, confident female voice
      case 'coo':
        return { pitch: 0.95, rate: 1.05 }; // Helix Sync: Efficient, quick male voice
      case 'cto':
        return { pitch: 1.1, rate: 1.1 };   // Byte Weaver: Analytical, slightly higher pitched/faster male voice
      case 'cfo':
        return { pitch: 0.9, rate: 0.95 };  // Ledger Vance: Steady, deep male voice
      case 'cmo':
        return { pitch: 1.15, rate: 1.05 }; // Nova Sparks: Energetic female voice
      case 'legal':
        return { pitch: 0.85, rate: 0.85 }; // Justice Code: Formal, slow, deep voice
      default:
        return { pitch: 1.0, rate: 1.0 };
    }
  };

  // Match role IDs to female/male browser voices
  const getVoiceForExecutive = (roleId: string): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Hindi voice requested
    if (speechLanguageRef.current === 'hi') {
      const hindiVoices = voices.filter(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hindiVoices.length > 0) return hindiVoices[0];
    }

    const langVoices = voices.filter(v => v.lang.startsWith('en'));
    if (langVoices.length === 0) return null;

    const femaleNames = ['female', 'zira', 'samantha', 'google us english', 'hazel', 'susan', 'en-us-x-sfg-local'];
    const maleNames = ['male', 'david', 'mark', 'google uk english male', 'george', 'ravi', 'en-us-x-iom-local'];

    const femaleVoices = langVoices.filter(v => 
      femaleNames.some(name => v.name.toLowerCase().includes(name))
    );
    
    const maleVoices = langVoices.filter(v => 
      maleNames.some(name => v.name.toLowerCase().includes(name))
    );

    const id = roleId.toLowerCase();
    if (id === 'ceo' || id === 'cmo') {
      return femaleVoices.length > 0 ? femaleVoices[0] : langVoices[0];
    } else if (id === 'coo' || id === 'cto' || id === 'cfo' || id === 'legal') {
      return maleVoices.length > 0 ? maleVoices[0] : (langVoices[1] || langVoices[0]);
    }
    return langVoices[0];
  };

  const handlePlayTTS = (msgId: string, text: string, sender: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const roleId = sender === 'founder' ? 'founder' : (exec?.id || 'executive');
    const voice = getVoiceForExecutive(roleId);
    if (voice) {
      utterance.voice = voice;
    }
    
    const { pitch, rate } = getVoiceParams(roleId);
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const startActiveDictation = () => {
    if (!SpeechRecognitionAPI) return;
    if (isRecordingRef.current) return;
    
    setIsRecording(true);
    isRecordingRef.current = true;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = speechLanguageRef.current === 'en' ? 'en-US' : 'hi-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
      };

      recognition.onresult = (event: any) => {
        // BARGE-IN: If user speaks while executive is speaking, stop speaking immediately
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setSpeakingMessageId(null);
        }

        const transcript = event.results[0][0].transcript;
        if (transcript) {
          transcribedTextRef.current = transcript;
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error, event.message);
        }
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognition.onend = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
        
        if (liveTalkActiveRef.current) {
          const textToSend = transcribedTextRef.current;
          transcribedTextRef.current = '';
          if (textToSend.trim()) {
            setInputText(''); // Clear typing field
            sendMessageText(textToSend); // Dispatch and save to chat history
          } else {
            // Silence timeout, restart listening loop
            setTimeout(() => {
              if (liveTalkActiveRef.current && !isRecordingRef.current) {
                startActiveDictation();
              }
            }, 500);
          }
        } else if (wakeWordListeningRef.current) {
          // Resume wake word listener if still toggled
          setTimeout(() => {
            if (wakeWordListeningRef.current && !isRecordingRef.current) {
              startWakeWordListening();
            }
          }, 800);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const startWakeWordListening = () => {
    if (!SpeechRecognitionAPI) return;

    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = speechLanguageRef.current === 'en' ? 'en-US' : 'hi-IN';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript.toLowerCase() + ' ';
        }
        transcript = transcript.trim();

        // English variations (handling accent issues like 'hey boss', 'hey us', 'hey office', etc.)
        const hasOs = transcript.includes('os') || transcript.includes('o s') || transcript.includes('us') || transcript.includes('aws') || transcript.includes('boss') || transcript.includes('house') || transcript.includes('office') || transcript.includes('horse') || transcript.includes('force');
        const hasHey = transcript.includes('hey') || transcript.includes('hi') || transcript.includes('hello') || transcript.includes('hay') || transcript.includes('heyo') || transcript.includes('hai');

        const matchesEn = (hasHey && hasOs) || 
                          transcript.includes('hey os') || 
                          transcript.includes('hay os') || 
                          transcript.includes('hi os') || 
                          transcript.includes('hello os') || 
                          transcript.includes('hayos');
                          
        // Hindi variations
        const matchesHi = transcript.includes('हे ओएस') || 
                          transcript.includes('नमस्ते ओएस') || 
                          transcript.includes('हेलो ओएस') || 
                          transcript.includes('ओएस') || 
                          transcript.includes('ओ एस') ||
                          (transcript.includes('हे') && transcript.includes('ओ'));

        if (matchesEn || matchesHi) {
          rec.abort(); // Stop listening for wake word

          // Trigger Live Talk
          setLiveTalkActive(true);
          liveTalkActiveRef.current = true;

          // Parse and extract trailing command text
          const stripWakeWordPrefix = (text: string): string => {
            const lowercase = text.toLowerCase();
            const prefixes = [
              'hey os', 'hay os', 'hi os', 'hello os', 'k os', 'hayos', 'heyo s', 'heios',
              'hey boss', 'hey us', 'hey office', 'hey aws', 'hey house', 'hey horse', 'hey force',
              'he os', 'hai os', 'hao s', 'a os', 'eos',
              'हे ओएस', 'नमस्ते ओएस', 'हेलो ओएस', 'ओएस', 'ओ एस'
            ];
            
            for (const prefix of prefixes) {
              if (lowercase.startsWith(prefix)) {
                return text.substring(prefix.length).trim();
              }
            }
            
            const osKeywords = ['os', 'us', 'aws', 'boss', 'house', 'office', 'horse', 'force', 'ओएस', 'ओ एस'];
            for (const keyword of osKeywords) {
              const idx = lowercase.indexOf(keyword);
              if (idx !== -1) {
                return text.substring(idx + keyword.length).trim();
              }
            }
            
            return text;
          };

          const commandText = stripWakeWordPrefix(transcript);

          if (commandText && commandText.length > 1) {
            // Dispatch command immediately!
            sendMessageText(commandText);
          } else {
            // Prompt the user for input and start listening
            const confirmText = speechLanguageRef.current === 'en' ? 'Yes, Founder? Live session active.' : 'जी बोलिए, लाइव सत्र सक्रिय है।';

            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(confirmText);
              const roleId = exec?.id || 'ceo';
              const voice = getVoiceForExecutive(roleId);
              if (voice) utterance.voice = voice;
              const { pitch, rate } = getVoiceParams(roleId);
              utterance.pitch = pitch;
              utterance.rate = rate;

              utterance.onend = () => {
                startActiveDictation();
              };
              utterance.onerror = () => {
                startActiveDictation();
              };

              window.speechSynthesis.speak(utterance);
            } else {
              startActiveDictation();
            }
          }
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        console.warn('Wake word recognition error:', event.error);
      };

      rec.onend = () => {
        if (wakeWordListeningRef.current && !isRecordingRef.current) {
          setTimeout(() => {
            if (wakeWordListeningRef.current && !isRecordingRef.current) {
              startWakeWordListening();
            }
          }, 500);
        }
      };

      wakeWordRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start wake word listener:', err);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!SpeechRecognitionAPI) return;

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      isRecordingRef.current = false;
      return;
    }

    if (wakeWordListeningRef.current && wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.abort();
    }

    startActiveDictation();
  };

  const toggleWakeWordListening = () => {
    if (wakeWordListening) {
      setWakeWordListening(false);
      wakeWordListeningRef.current = false;
      localStorage.setItem('heyOsWakeWordActive', 'false');
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }
    } else {
      // Turn off normal recording or Live Talk
      if (isRecording) {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        setIsRecording(false);
        isRecordingRef.current = false;
      }
      if (liveTalkActive) {
        setLiveTalkActive(false);
        liveTalkActiveRef.current = false;
      }
      setWakeWordListening(true);
      wakeWordListeningRef.current = true;
      localStorage.setItem('heyOsWakeWordActive', 'true');
      startWakeWordListening();
    }
  };

  const playTTSForLiveTalk = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const roleId = exec?.id || 'executive';
    const voice = getVoiceForExecutive(roleId);
    if (voice) {
      utterance.voice = voice;
    }
    
    const { pitch, rate } = getVoiceParams(roleId);
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onend = () => {
      setSpeakingMessageId(null);
      if (liveTalkActiveRef.current) {
        startActiveDictation();
      }
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
      if (liveTalkActiveRef.current) {
        startActiveDictation();
      }
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleLiveTalk = () => {
    if (liveTalkActive) {
      setLiveTalkActive(false);
      liveTalkActiveRef.current = false;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsRecording(false);
      isRecordingRef.current = false;
    } else {
      // Turn off wake word
      if (wakeWordListening) {
        setWakeWordListening(false);
        wakeWordListeningRef.current = false;
        if (wakeWordRecognitionRef.current) {
          wakeWordRecognitionRef.current.abort();
        }
      }
      
      setLiveTalkActive(true);
      liveTalkActiveRef.current = true;
      
      const confirmText = speechLanguage === 'en' ? 'Live session established.' : 'लाइव सत्र शुरू हो गया है।';
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(confirmText);
        const roleId = exec?.id || 'ceo';
        const voice = getVoiceForExecutive(roleId);
        if (voice) utterance.voice = voice;
        const { pitch, rate } = getVoiceParams(roleId);
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.onend = () => {
          startActiveDictation();
        };
        utterance.onerror = () => {
          startActiveDictation();
        };
        window.speechSynthesis.speak(utterance);
      } else {
        startActiveDictation();
      }
    }
  };

  // Sync Chat Logs with Backend Database API
  const fetchChatHistory = async (silent = false) => {
    if (!exec) return;
    if (!silent) setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${exec.id}`);
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to sync chat history with database', err);
    } finally {
      if (!silent) setLoadingHistory(false);
    }
  };

  const appendMessages = (newMsgs: Message[]) => {
    setMessages(prev => {
      const next = [...prev];
      newMsgs.forEach(msg => {
        if (msg && !next.some(m => m.id === msg.id)) {
          next.push(msg);
        }
      });
      return next;
    });
  };


  // Fetch calendar events filter by executive role
  const fetchCalendarEvents = async () => {
    if (!exec) return;
    try {
      const res = await fetch(`${API_BASE_URL}/calendar`);
      if (res.ok) {
        const allEvents = await res.json();
        const filtered = Object.entries(allEvents).flatMap(([day, evts]: [string, any]) =>
          evts.map((e: any) => ({ ...e, day }))
        ).filter((evt: any) => evt.lead.toLowerCase() === exec.id.toLowerCase());
        setCalendarEvents(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events', err);
    }
  };

  const handleAddCalendarReminder = async (title: string, priorityId: string | number) => {
    if (!exec) return;
    try {
      const res = await fetch(`${API_BASE_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: scheduleDay,
          time: scheduleTime,
          title: title,
          lead: exec.id.toUpperCase(),
          type: exec.id === 'ceo' ? 'Strategy' :
                exec.id === 'cto' ? 'Engineering' :
                exec.id === 'cfo' ? 'Finance' :
                exec.id === 'cmo' ? 'Marketing' :
                exec.id === 'coo' ? 'Operations' : 'Compliance',
          status: 'upcoming'
        })
      });
      if (res.ok) {
        setSchedulingPriorityId(null);
        setSuccessScheduledId(priorityId);
        fetchCalendarEvents();
        setTimeout(() => setSuccessScheduledId(null), 3000);
      }
    } catch (err) {
      console.error('Failed to schedule priority calendar reminder', err);
    }
  };

  // Fetch dynamic task priorities from Projects API
  const fetchPriorities = async () => {
    if (!exec) return;
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (res.ok) {
        const boardData = await res.json();
        const allTasks: any[] = boardData.flatMap((col: any) => col.tasks || []);
        
        const ownerName = exec.id === 'ceo' ? 'Aria Vance' :
                          exec.id === 'coo' ? 'Helix Sync' :
                          exec.id === 'cto' ? 'Byte Weaver' :
                          exec.id === 'cfo' ? 'Ledger Vance' :
                          exec.id === 'cmo' ? 'Nova Sparks' : 'Justice Code';
                          
        const filteredTasks = allTasks.filter((t: any) => t.owner === ownerName);
        const dynamicPriorities = filteredTasks.map((t: any) => ({
          id: t.id,
          text: t.title,
          done: t.column === 'Done'
        }));
        
        setPriorities(dynamicPriorities);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic priorities from projects API', err);
    }
  };

  // Fetch reports dynamically from backend API
  const fetchReports = async () => {
    if (!exec) return;
    try {
      const res = await fetch(`${API_BASE_URL}/reports`);
      if (res.ok) {
        const allReports = await res.json();
        const roleUpper = exec.id.toUpperCase();
        // Show reports matching this executive's role, or general company reports if CEO
        const filtered = allReports
          .filter((r: any) => {
            const authorUpper = r.author.toUpperCase();
            return authorUpper.includes(roleUpper) || 
                   (roleUpper === 'CEO' && (authorUpper.includes('CEO') || authorUpper.includes('COO') || authorUpper.includes('FOUNDER')));
          })
          .map((r: any) => ({
            name: r.name,
            size: r.size,
            icon: r.type === 'sheet' ? 'sheet' : (r.type === 'code' ? 'code' : 'text')
          }));
        
        setCompiledFiles(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch reports dynamically:', err);
    }
  };

  // Fetch decisions queue/recommendations dynamically from Projects API
  const fetchRecommendations = async () => {
    if (!exec) return;
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (res.ok) {
        const boardData = await res.json();
        const allTasks: any[] = boardData.flatMap((col: any) => col.tasks || []);
        
        const ownerName = exec.id === 'ceo' ? 'Aria Vance' :
                          exec.id === 'coo' ? 'Helix Sync' :
                          exec.id === 'cto' ? 'Byte Weaver' :
                          exec.id === 'cfo' ? 'Ledger Vance' :
                          exec.id === 'cmo' ? 'Nova Sparks' : 'Justice Code';
        
        const filtered = allTasks
          .filter((t: any) => t.owner === ownerName && (t.column === 'Backlog' || t.column === 'In Review'))
          .map((t: any) => ({
            id: t.id,
            action: t.title,
            impact: t.level === 'High' ? 'High Impact' : 'Medium Impact',
            status: t.column.toLowerCase()
          }));
        
        setRecs(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  useEffect(() => {
    // Stop any ongoing speech synthesis, speech recognition, or wake word listening on route change
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.abort();
    }
    setWakeWordListening(false);

    setMessages([]);
    fetchChatHistory(false);
    fetchCalendarEvents();
    fetchPriorities();
    fetchReports();
    fetchRecommendations();
    setUploadedFilesContent({});
    setInputText('');
    setIsTyping(false);
    setRunningTool(null);
    setSelectedFileName(null);
    setSchedulingPriorityId(null);
    setSuccessScheduledId(null);
  }, [path]);

  // Periodic polling hook for real-time dashboard sync
  useEffect(() => {
    if (!exec) return;
    const intervalId = setInterval(() => {
      fetchChatHistory(true);
      fetchPriorities();
      fetchCalendarEvents();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [exec.id]);

  const lastMsgId = messages.length > 0 ? messages[messages.length - 1].id : '';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, lastMsgId, isTyping]);

  useEffect(() => {
    if (!selectedFileName) {
      setDynamicFileContent(null);
      return;
    }
    
    if (fileContentMap[selectedFileName] || uploadedFilesContent[selectedFileName]) {
      setDynamicFileContent(null);
      return;
    }
    
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reports/${selectedFileName}/content`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            let renderedContent = null;
            if (selectedFileName.toLowerCase().endsWith('.json')) {
              renderedContent = (
                <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[10px] text-cyan-400 overflow-x-auto whitespace-pre-wrap leading-normal max-h-[300px] select-text">
                  {data.content}
                </pre>
              );
            } else if (selectedFileName.toLowerCase().endsWith('.csv')) {
              const lines = data.content.trim().split('\n');
              if (lines.length > 0) {
                const headers = lines[0].split(',');
                const rows = lines.slice(1).map((l: string) => l.split(','));
                renderedContent = (
                  <div className="overflow-x-auto max-h-[300px] border border-zinc-900 rounded-lg select-text">
                    <table className="min-w-full divide-y divide-zinc-900 text-[10px] font-mono text-left">
                      <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-wider">
                        <tr>
                          {headers.map((h: string, i: number) => (
                            <th key={i} className="px-3 py-2 border-b border-zinc-900">{h.replace(/"/g, '')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60 bg-zinc-900/10">
                        {rows.map((row: string[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-zinc-900/40 text-zinc-350">
                            {row.map((cell: string, cIdx: number) => (
                              <td key={cIdx} className="px-3 py-2 whitespace-nowrap">{cell.replace(/"/g, '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              } else {
                renderedContent = (
                  <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] select-text">
                    {data.content}
                  </pre>
                );
              }
            } else {
              renderedContent = (
                <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] select-text">
                  {data.content}
                </pre>
              );
            }
            
            setDynamicFileContent({
              title: selectedFileName.replace(/_/g, ' '),
              type: data.type || 'Document File',
              content: renderedContent,
              author: 'C-Suite Executive',
              compiled: 'Just now'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dynamic file content:', err);
      }
    };
    
    fetchContent();
  }, [selectedFileName, uploadedFilesContent]);

  if (!exec) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-white">Office Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2">The requested executive workspace does not exist.</p>
      </div>
    );
  }

  const togglePriority = async (id: string | number) => {
    const priorityItem = priorities.find(p => p.id === id);
    if (!priorityItem) return;
    
    const newDoneState = !priorityItem.done;
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, done: newDoneState } : p));
    
    if (typeof id === 'string' && id.startsWith('task-')) {
      try {
        await fetch(`${API_BASE_URL}/projects/${id}/column`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ column: newDoneState ? 'Done' : 'Backlog' })
        });
      } catch (err) {
        console.error('Failed to toggle task column state on backend', err);
      }
    }
  };

  // Clear Chat history in Database
  const handleClearHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${exec.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Refetch clean history
        fetchChatHistory();
      }
    } catch (err) {
      console.error('Failed to clear database logs', err);
    }
  };

  // Execute C-Suite tool in Database
  const handleExecuteTool = async (toolName: string) => {
    if (runningTool) return;
    setRunningTool(toolName);

    // Call API with custom trigger message
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${exec.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `*Dispatched Command/Tool call*: \`${toolName}\`` })
      });
      if (res.ok) {
        const result = await res.json();
        appendMessages([result.userMessage, result.executiveMessage]);
        fetchCalendarEvents();
      }
    } catch (err) {
      console.error('Failed to execute tool on backend', err);
    } finally {
      setRunningTool(null);
    }
  };

  // Send message to Database API
  const sendMessageText = async (messageText: string) => {
    if (!messageText.trim()) return;
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/${exec.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      });
      if (res.ok) {
        const result = await res.json();
        appendMessages([result.userMessage, result.executiveMessage]);
        fetchCalendarEvents();

        // If Live Talk is active, automatically read the executive response aloud!
        if (liveTalkActiveRef.current && result.executiveMessage) {
          playTTSForLiveTalk(result.executiveMessage.id, result.executiveMessage.text);
          // Concurrently start listening so the user can barge-in/interrupt!
          setTimeout(() => {
            if (liveTalkActiveRef.current) {
              startActiveDictation();
            }
          }, 300);
        }
      }
    } catch (err) {
      console.error('Failed to submit message to backend', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await sendMessageText(text);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !exec) return;

    setIsTyping(true);

    const formatBytes = (bytes: number, decimals = 1) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const fileSizeStr = formatBytes(file.size);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target?.result as string;

      try {
        const res = await fetch(`${API_BASE_URL}/chat/${exec.id}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: fileSizeStr,
            fileType: file.type || 'text/plain',
            fileContent: fileContent
          })
        });

        if (res.ok) {
          const result = await res.json();
          appendMessages([result.userMessage, result.executiveMessage]);
          setCompiledFiles(prev => [
            ...prev,
            { name: file.name, size: fileSizeStr, icon: file.type.includes('pdf') ? 'text' : 'code' }
          ]);

          // Create custom file preview container
          let displayContent: React.ReactNode = null;
          if (file.type.startsWith('image/')) {
            displayContent = <img src={fileContent} alt={file.name} className="max-w-full max-h-[300px] object-contain rounded border border-zinc-900" />;
          } else if (fileContent.startsWith('data:')) {
            try {
              const base64Str = fileContent.split(',')[1];
              const decodedText = atob(base64Str);
              displayContent = <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px]">{decodedText}</pre>;
            } catch (e) {
              displayContent = <div className="text-zinc-500 font-mono text-xs">Binary document uploaded successfully ({fileSizeStr}). Preview not available for binary streams.</div>;
            }
          } else {
            displayContent = <pre className="bg-black/60 border border-zinc-900 rounded p-4 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px]">{fileContent}</pre>;
          }

          setUploadedFilesContent(prev => ({
            ...prev,
            [file.name]: {
              title: file.name,
              type: file.type || 'Plain Text',
              content: displayContent,
              compiled: 'Just now',
              author: 'Founder'
            }
          }));
        }
      } catch (err) {
        console.error('Failed to upload document', err);
      } finally {
        setIsTyping(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const handleApproveRec = async (id: string | number) => {
    const recommendedAction = recs.find(r => r.id === id)?.action || 'Action';
    setRecs(prev => prev.filter(r => r.id !== id));

    try {
      // 1. Move task to In Progress in the database
      await fetch(`${API_BASE_URL}/projects/${id}/column`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: 'In Progress' })
      });

      // 2. Dispatch approval message to chat to invoke autonomous execution
      const res = await fetch(`${API_BASE_URL}/chat/${exec.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Approved action: **${recommendedAction}**` })
      });
      if (res.ok) {
        const result = await res.json();
        appendMessages([result.userMessage, result.executiveMessage]);
        fetchCalendarEvents();
        fetchPriorities();
        fetchRecommendations();
      }
    } catch (err) {
      console.error('Failed to submit recommendation approval to backend', err);
    }
  };

  const activeFile = selectedFileName 
    ? (fileContentMap[selectedFileName] || uploadedFilesContent[selectedFileName] || dynamicFileContent) 
    : null;

  return (
    <div className="space-y-8">
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl">
        <div 
          className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-10 blur-[80px] pointer-events-none"
          style={{ backgroundColor: exec.accentColor }}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={exec.avatar} 
                alt={exec.role} 
                className="h-16 w-16 rounded-xl object-cover border border-zinc-800 grayscale brightness-90 shadow-lg" 
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{exec.role}</h1>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {exec.model}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 bg-zinc-900/40 border border-zinc-900 rounded-lg p-3 max-w-xs text-xs">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Office Status</span>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-300">Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Column 1: Info Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Profile Description */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase border-b border-zinc-900 pb-2">
              Mandate Focus
            </h3>
            <p className="text-xs text-zinc-450 leading-relaxed">
              {exec.description}
            </p>
          </div>

          {/* Executable Agent Tools */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-900 pb-2">
              <span className="text-zinc-550 uppercase tracking-wider">Executable Tools</span>
              <Key className="h-3.5 w-3.5 text-zinc-450" />
            </div>
            
            <div className="space-y-2">
              {exec.futureTools.map((tool, i) => {
                const isRunning = runningTool === tool;

                return (
                  <button 
                    key={i} 
                    onClick={() => handleExecuteTool(tool)}
                    disabled={runningTool !== null}
                    className="w-full text-left flex items-center space-x-2 bg-zinc-950 border border-zinc-900 rounded-lg p-2 font-mono text-[10px] text-zinc-450 group hover:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-all cursor-pointer"
                    title={`Click to execute ${tool}`}
                  >
                    {isRunning ? (
                      <Loader2 className="h-3 w-3 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <Play className="h-2.5 w-2.5 text-zinc-655 group-hover:text-cyan-400 group-hover:scale-110 transition-all shrink-0" />
                    )}
                    <span className="truncate">{tool}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase border-b border-zinc-900 pb-2">
              Compiled Files
            </h3>
            
            <div className="space-y-2.5">
              {compiledFiles.map((rep, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedFileName(rep.name)}
                  className="flex items-center space-x-2 text-xs text-zinc-350 hover:text-white transition-colors cursor-pointer group"
                  title="Click to view file contents"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-550 group-hover:text-cyan-400 group-hover:scale-105 transition-all shrink-0" />
                  <span className="truncate font-mono">{rep.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column 2 & 3: Chat Box */}
        <div className="xl:col-span-2 flex flex-col h-[600px] bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-inner">
          
          {/* Chat Header */}
          <div className="glass-navbar flex h-12 w-full items-center justify-between px-4 border-b border-zinc-900">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-zinc-555" />
              <span className="text-xs font-mono text-zinc-350">{exec.id.toUpperCase()} Chat Feed</span>
            </div>
            
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-1 text-[10px] font-mono text-zinc-500 hover:text-red-400 transition-colors bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded cursor-pointer"
              title="Clear active chat cache"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear Cache</span>
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
            {loadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-550 font-mono text-xs my-auto">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-455 mb-2" />
                <span>Syncing secure conversation log...</span>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 ${msg.sender === 'founder' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="shrink-0">
                      {msg.sender === 'founder' ? (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-yellow-600 to-amber-400 flex items-center justify-center text-xs font-bold text-black font-mono">
                          F
                        </div>
                      ) : (
                        <img 
                          src={exec.avatar} 
                          alt="" 
                          className="h-8 w-8 rounded-lg object-cover border border-zinc-800 grayscale"
                        />
                      )}
                    </div>

                    <div className="space-y-1 max-w-[75%]">
                      <div className={`flex items-center space-x-2 ${msg.sender === 'founder' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          {msg.sender === 'founder' ? 'Founder' : exec.id.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-zinc-650 font-mono">{msg.timestamp}</span>
                        {!msg.text.includes('📎') && (
                          <button
                            type="button"
                            onClick={() => handlePlayTTS(msg.id, msg.text, msg.sender)}
                            className={`p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center ${
                              speakingMessageId === msg.id 
                                ? 'text-cyan-400' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                            title={speakingMessageId === msg.id ? "Stop reading" : "Read aloud"}
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="h-3.5 w-3.5 animate-pulse" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {msg.text.includes('📎') ? (
                        <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 flex flex-col space-y-3 min-w-[280px] shadow-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate font-mono">
                                {msg.text.match(/`([^`]+)`/)?.[1] || msg.text.replace(/📎\s*(?:Uploaded Document:?\s*)?/i, '').split('(')[0].trim() || "document"}
                              </p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {msg.text.match(/\(([^)]+)\)/)?.[1] || "Unknown size"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const fileName = msg.text.match(/`([^`]+)`/)?.[1] || msg.text.replace(/📎\s*(?:Uploaded Document:?\s*)?/i, '').split('(')[0].trim();
                                if (fileName) setSelectedFileName(fileName);
                              }}
                              className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-mono text-[10px] text-center transition-colors cursor-pointer"
                            >
                              Open File
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`rounded-lg p-3 text-xs leading-relaxed ${
                            msg.sender === 'founder' 
                              ? 'bg-zinc-900 border border-zinc-850 text-zinc-200' 
                              : 'bg-zinc-950 border border-zinc-900 text-zinc-300'
                          }`}
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                        />
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Loader / Active Processing */}
                {isTyping && (
                  <div className="flex gap-4">
                    <img 
                      src={exec.avatar} 
                      alt="" 
                      className="h-8 w-8 rounded-lg object-cover border border-zinc-800 grayscale"
                    />
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-550 font-mono uppercase">{exec.id.toUpperCase()}</span>
                      <div className="bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2 flex items-center space-x-2">
                        <Loader2 className="h-3 w-3 text-cyan-400 animate-spin" />
                        <span className="text-[10px] font-mono text-zinc-500">Formulating Directive...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-zinc-900 bg-zinc-950 flex items-center space-x-2.5">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isTyping}
              className="p-2.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Upload document"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            {isSTTSupported && (
              <div className="flex items-center space-x-1.5 shrink-0 bg-zinc-900 border border-zinc-850 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-1.5 rounded transition-all duration-300 flex items-center justify-center cursor-pointer relative ${
                    isRecording 
                      ? 'bg-red-950/60 border border-red-500/40 text-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:bg-red-950/80 hover:text-red-300' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={isRecording ? "Stop listening" : "Dictate message"}
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isRecording && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                  )}
                </button>
                
                {/* Language Toggle */}
                <button
                  type="button"
                  onClick={() => setSpeechLanguage(prev => prev === 'en' ? 'hi' : 'en')}
                  className="px-1.5 py-0.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Toggle speech language (English / Hindi)"
                >
                  {speechLanguage === 'en' ? 'EN' : 'HI'}
                </button>

                {/* Wake Word Selector */}
                <button
                  type="button"
                  onClick={toggleWakeWordListening}
                  className={`px-1.5 py-0.5 border rounded text-[9px] font-mono transition-all flex items-center space-x-1 cursor-pointer ${
                    wakeWordListening 
                      ? 'bg-cyan-950/60 border-cyan-800/40 text-cyan-400 animate-pulse' 
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Toggle 'Hey OS' wake word listener"
                >
                  <span className={`h-1 w-1 rounded-full ${wakeWordListening ? 'bg-cyan-400 animate-ping' : 'bg-zinc-650'}`} />
                  <span>Hey OS</span>
                </button>

                {/* Live Talk Button */}
                <button
                  type="button"
                  onClick={toggleLiveTalk}
                  className={`px-1.5 py-0.5 border rounded text-[9px] font-mono transition-all flex items-center space-x-1 cursor-pointer ${
                    liveTalkActive 
                      ? 'bg-emerald-955/60 border-emerald-500/40 text-emerald-450 animate-pulse font-bold' 
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Toggle continuous Live Voice session"
                >
                  {liveTalkActive ? <PhoneOff className="h-2.5 w-2.5" /> : <Phone className="h-2.5 w-2.5" />}
                  <span>Live Talk</span>
                </button>
              </div>
            )}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Instruct ${exec.id.toUpperCase()} to execute tasks...`}
              className="flex-1 bg-zinc-900/60 border border-zinc-850 focus:border-zinc-700 text-sm text-zinc-200 py-2.5 px-4 rounded-lg focus:outline-none placeholder-zinc-650 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

        {/* Column 4: Checklists & Priorities */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Priorities */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-2">
              <Target className="h-4 w-4 text-zinc-450" />
              <h3 className="text-xs font-mono uppercase tracking-widest">Office Objectives</h3>
            </div>

            <div className="space-y-3">
              {priorities.map(p => {
                const isScheduling = schedulingPriorityId === p.id;
                const isSuccess = successScheduledId === p.id;

                return (
                  <div key={p.id} className="space-y-2 border-b border-zinc-900/40 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between group">
                      <label 
                        className="flex items-start space-x-2.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors flex-1"
                      >
                        <input
                          type="checkbox"
                          checked={p.done}
                          onChange={() => togglePriority(p.id)}
                          className="rounded bg-black border-zinc-800 text-white focus:ring-0 focus:ring-offset-0 h-4 w-4 mt-0.5 cursor-pointer accent-white shrink-0"
                        />
                        <span className={p.done ? 'line-through text-zinc-600' : ''}>
                          {p.text}
                        </span>
                      </label>

                      {isSuccess ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 shrink-0">
                          <Check className="h-3 w-3" />
                          <span>Scheduled</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSchedulingPriorityId(isScheduling ? null : p.id);
                            setSuccessScheduledId(null);
                          }}
                          className="text-zinc-650 hover:text-cyan-400 p-0.5 rounded transition-colors ml-2 shrink-0 cursor-pointer"
                          title="Schedule calendar reminder"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {isScheduling && (
                      <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-2.5 space-y-2.5 animate-in slide-in-from-top-1 duration-155">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div>
                            <span className="text-zinc-500 block mb-1">June Day</span>
                            <select
                              value={scheduleDay}
                              onChange={(e) => setScheduleDay(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-850 rounded p-1 text-zinc-300 focus:outline-none cursor-pointer"
                            >
                              <option value="22">22 (Mon)</option>
                              <option value="23">23 (Tue)</option>
                              <option value="24">24 (Wed)</option>
                              <option value="25">25 (Thu)</option>
                              <option value="26">26 (Fri)</option>
                              <option value="27">27 (Sat)</option>
                              <option value="28">28 (Sun)</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-zinc-550 block mb-1">Time</span>
                            <input
                              type="text"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              placeholder="02:00 PM"
                              className="w-full bg-zinc-900 border border-zinc-850 rounded p-1 text-zinc-200 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddCalendarReminder(p.text, p.id)}
                          className="w-full bg-white hover:bg-zinc-200 text-black text-[10px] py-1 rounded font-semibold transition-colors text-center cursor-pointer"
                        >
                          Confirm Reminder
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Checkpoints / Sync Reminders */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-900 pb-2">
              <div className="flex items-center space-x-2 text-white">
                <Clock className="h-4 w-4 text-zinc-400" />
                <h3 className="uppercase tracking-widest">Calendar Sync</h3>
              </div>
              <span className="text-[9px] text-zinc-550">{calendarEvents.length} Events</span>
            </div>

            {calendarEvents.length === 0 ? (
              <p className="text-xs text-zinc-655 font-mono">No checkpoints scheduled on calendar.</p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {calendarEvents.map((evt, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-zinc-500">{new Date().toLocaleString('default', { month: 'short' }).toUpperCase()} {evt.day} • {evt.time}</span>
                      <span className={`px-1.5 py-0.2 rounded-full border text-[8px] ${
                        evt.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-zinc-900/60 text-zinc-500 border-zinc-850'
                      }`}>
                        {evt.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-200 block leading-tight">{evt.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase border-b border-zinc-900 pb-2">
              Decisions Queue
            </h3>

            {recs.length === 0 ? (
              <p className="text-xs text-zinc-655 font-mono">No decisions awaiting validation.</p>
            ) : (
              <div className="space-y-3.5">
                {recs.map(r => (
                  <div key={r.id} className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-zinc-555 uppercase">OPERATIONS</span>
                      <span className="text-emerald-400 font-semibold">{r.impact}</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-200 block leading-tight">{r.action}</span>
                    
                    <div className="flex space-x-1.5 justify-end pt-1">
                      <button 
                        onClick={() => handleApproveRec(r.id)}
                        className="p-1 rounded bg-zinc-905 hover:bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleApproveRec(r.id)}
                        className="p-1 rounded bg-white hover:bg-zinc-200 text-black transition-colors cursor-pointer"
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

      {/* Compiled Files Preview Modal */}
      {selectedFileName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-zinc-900 pb-3.5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white font-mono">
                  {activeFile ? activeFile.title : selectedFileName}
                </h3>
                <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                  <span className="uppercase">{activeFile ? activeFile.type : 'Compiled Data File'}</span>
                  <span>•</span>
                  <span>Compiled {activeFile ? activeFile.compiled : 'Recently'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedFileName(null)}
                className="p-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-450 hover:text-white transition-colors cursor-pointer"
                title="Close overlay"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="py-2">
              {activeFile ? (
                activeFile.content
              ) : (
                <div className="text-xs text-zinc-450 leading-relaxed font-mono">
                  No structured display adapter configured for: <code className="text-cyan-400">{selectedFileName}</code>. 
                  <br /><br />
                  System file integrity check is <strong>100% optimal</strong>.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-900/60 text-[10px] font-mono text-zinc-500">
              <span>Author: {activeFile ? activeFile.author : 'C-Suite Executive'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ExecutiveWorkspace;
