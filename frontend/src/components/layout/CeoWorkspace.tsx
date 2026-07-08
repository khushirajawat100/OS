import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  FileText, 
  Target, 
  MessageSquare,
  Activity,
  Check,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff
} from 'lucide-react';
import { executivesData } from '@/context/ThemeContext';

const SpeechRecognitionAPI = typeof window !== 'undefined' 
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) 
  : null;

const isSTTSupported = !!SpeechRecognitionAPI;

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

  const cleanTextForSpeech = (text: string): string => {
    let clean = text.replace(/!\[.*?\]\(.*?\)/g, '');
    clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    clean = clean.replace(/>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi, '');
    clean = clean.replace(/[*_`#]/g, '');
    clean = clean.replace(/<[^>]*>/g, '');
    return clean.trim();
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

    // Search for voice
    const voices = window.speechSynthesis.getVoices();
    
    if (speechLanguageRef.current === 'hi') {
      const hindiVoices = voices.filter(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hindiVoices.length > 0) utterance.voice = hindiVoices[0];
    } else {
      const langVoices = voices.filter(v => v.lang.startsWith('en'));
      const femaleVoices = langVoices.filter(v => 
        ['female', 'zira', 'samantha', 'google us english', 'hazel', 'susan', 'en-us-x-sfg-local'].some(name => 
          v.name.toLowerCase().includes(name)
        )
      );

      if (sender === 'ceo') {
        utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : langVoices[0];
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }
    }

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
        // BARGE-IN: If user speaks while CEO is speaking, stop speaking immediately
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
              
              const voices = window.speechSynthesis.getVoices();
              const langVoices = voices.filter(v => v.lang.startsWith('en'));
              const femaleVoices = langVoices.filter(v => 
                ['female', 'zira', 'samantha', 'google us english', 'hazel', 'susan', 'en-us-x-sfg-local'].some(name => 
                  v.name.toLowerCase().includes(name)
                )
              );
              utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : langVoices[0];
              utterance.pitch = 1.05;
              utterance.rate = 0.95;

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

    // Search for voice
    const voices = window.speechSynthesis.getVoices();
    
    if (speechLanguageRef.current === 'hi') {
      const hindiVoices = voices.filter(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hindiVoices.length > 0) utterance.voice = hindiVoices[0];
    } else {
      const langVoices = voices.filter(v => v.lang.startsWith('en'));
      const femaleVoices = langVoices.filter(v => 
        ['female', 'zira', 'samantha', 'google us english', 'hazel', 'susan', 'en-us-x-sfg-local'].some(name => 
          v.name.toLowerCase().includes(name)
        )
      );
      utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : langVoices[0];
      utterance.pitch = 1.05;
      utterance.rate = 0.95;
    }

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
        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter(v => v.lang.startsWith('en'));
        const femaleVoices = langVoices.filter(v => 
          ['female', 'zira', 'samantha', 'google us english', 'hazel', 'susan', 'en-us-x-sfg-local'].some(name => 
            v.name.toLowerCase().includes(name)
          )
        );
        utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : langVoices[0];
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
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

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessageText = (messageText: string) => {
    if (!messageText.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'founder',
      text: messageText.trim(),
      timestamp: currentTime
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const detectTargetRole = (text: string) => {
      const lowercase = text.toLowerCase();
      const routeWords = ['ask', 'tell', 'query', 'forward to', 'send to', 'request'];
      const roles = [
        { key: 'ceo', name: 'Aria Vance (CEO)' },
        { key: 'cto', name: 'Byte Weaver (CTO)' },
        { key: 'cfo', name: 'Ledger Vance (CFO)' },
        { key: 'cmo', name: 'Nova Sparks (CMO)' },
        { key: 'coo', name: 'Helix Sync (COO)' },
        { key: 'legal', name: 'Justice Code (LEGAL)' }
      ];

      for (const word of routeWords) {
        for (const r of roles) {
          const regex = new RegExp(`\\b${word}\\s+(?:to\\s+)?(?:the\\s+)?${r.key}\\b`, 'i');
          if (regex.test(lowercase)) return r;
          
          const namePart = r.name.toLowerCase().split(' ')[0];
          const regexName = new RegExp(`\\b${word}\\s+(?:to\\s+)?(?:the\\s+)?${namePart}\\b`, 'i');
          if (regexName.test(lowercase)) return r;
        }
      }

      for (const r of roles) {
        const startRegex = new RegExp(`^\\b${r.key}\\b\\s*[,:-]?`, 'i');
        if (startRegex.test(lowercase)) return r;
        
        const namePart = r.name.toLowerCase().split(' ')[0];
        const startRegexName = new RegExp(`^\\b${namePart}\\b\\s*[,:-]?`, 'i');
        if (startRegexName.test(lowercase)) return r;
      }

      return null;
    };

    const target = detectTargetRole(messageText);

    // Simulate CEO processing/response after 1.5s
    setTimeout(() => {
      setIsTyping(false);

      if (target && target.key !== 'ceo') {
        const replies: Record<string, string> = {
          cto: "Byte Weaver (CTO): Engineering resources and repositories are optimized. Production clusters are steady and API latencies average 12ms. Let me know if you want me to inspect any code loops.",
          cfo: "Ledger Vance (CFO): Financial ledger records locked. Q2 burn rate is running at $2,620/mo and total reserves projection provides 18.4 months of runway margin. Ready to authorize payroll wires.",
          cmo: "Nova Sparks (CMO): Click campaign acquisition metrics conversion CTR is optimized at 4.82%. Customer acquisition cost (CAC) remains stable at $1.42.",
          coo: "Helix Sync (COO): Backlogs synchronized. Sprint boards burndown cycle is running at 92% efficiency index. Ready to allocate new developer tasks.",
          legal: "Justice Code (LEGAL): Compliance parameters GDPR index checked at 100% compliant. Mutual NDA templates verified."
        };
        const targetReply = replies[target.key] || "Acknowledged and processed.";
        const currentReply = `I have forwarded your request to **${target.name}**.\n\nHere is their response:\n${targetReply}`;
        const responseMsgId = (Date.now() + 1).toString();

        setMessages(prev => [...prev, {
          id: responseMsgId,
          sender: 'ceo',
          text: currentReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (liveTalkActiveRef.current) {
          playTTSForLiveTalk(responseMsgId, currentReply);
          setTimeout(() => {
            if (liveTalkActiveRef.current) {
              startActiveDictation();
            }
          }, 300);
        }
        return;
      }

      const responses = [
        "Understood, Founder. Directives registered. I am dispatching instructions to Helix Sync (COO) to update the task board and priority queue immediately.",
        "Acknowledged. I will coordinate an immediate review meeting with the executive board (CFO & CTO) and update your dashboard panel shortly.",
        "Strategy updated. We will focus our autonomous pipelines on this objective. I'll summarize the results in your next Executive Briefing."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      const responseMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: responseMsgId,
        sender: 'ceo',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      // If Live Talk is active, automatically read the response aloud
      if (liveTalkActiveRef.current) {
        playTTSForLiveTalk(responseMsgId, randomReply);
        // Concurrently start listening so the user can barge-in/interrupt!
        setTimeout(() => {
          if (liveTalkActiveRef.current) {
            startActiveDictation();
          }
        }, 300);
      }
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    sendMessageText(text);
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

                <div className="space-y-1 max-w-[75%]">
                  <div className={`flex items-center space-x-2 ${msg.sender === 'founder' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {msg.sender === 'founder' ? 'Founder' : ceo.name}
                    </span>
                    <span className="text-[9px] text-zinc-650 font-mono">{msg.timestamp}</span>
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
