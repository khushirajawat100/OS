import React from 'react';
import { Sliders, Shield, Key, Database, RefreshCw } from 'lucide-react';

export const SettingsPlaceholder: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient">
          System Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Configure API credentials, core LLM preferences, and manage autonomous agency parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* API Credentials */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-3">
              <Key className="h-4.5 w-4.5 text-zinc-400" />
              <h2 className="text-md font-semibold">API Credentials</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-455">Google Gemini API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value="••••••••••••••••••••••••••••••••" 
                    disabled 
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-400 font-mono focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-600">ENCRYPTED</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-455">Anthropic API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value="••••••••••••••••••••••••••••••••" 
                    disabled 
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-400 font-mono focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-600">ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core LLM Weights */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-3">
              <Sliders className="h-4.5 w-4.5 text-zinc-400" />
              <h2 className="text-md font-semibold">C-Suite Intelligence Parameters</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-zinc-400">Global Executive Temperature</span>
                  <span className="font-mono text-zinc-200">0.25 (High Precision)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value="25" 
                  disabled
                  className="w-full accent-white bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-500">Lower temperature prioritizes deterministic, accurate task output.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-zinc-400">Creative Agency Scale</span>
                  <span className="font-mono text-zinc-200">0.70 (Balanced)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value="70" 
                  disabled
                  className="w-full accent-white bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-500">Higher creative values are dynamically allocated to Nova Sparks (CMO) and Aria Vance (CEO).</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          {/* Security & Access */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-3">
              <Shield className="h-4.5 w-4.5 text-zinc-400" />
              <h2 className="text-md font-semibold">Access Controls</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Human Operator</span>
                <span className="text-zinc-300 font-medium">Founder Only</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Multi-Agent Auth</span>
                <span className="text-emerald-400 font-mono">Secured (GKE)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Workspace Sandbox</span>
                <span className="text-zinc-300">Isolated Virtual Env</span>
              </div>
            </div>
          </div>

          {/* Database & Memory */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white border-b border-zinc-900 pb-3">
              <Database className="h-4.5 w-4.5 text-zinc-400" />
              <h2 className="text-md font-semibold">Memory & State</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Vector Knowledge Base</span>
                <span className="text-zinc-300 font-medium">Active (Pinecone)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Total Vectors Index</span>
                <span className="text-zinc-300 font-mono">142,805</span>
              </div>
              
              <button 
                disabled 
                className="w-full flex items-center justify-center space-x-2 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2 text-xs font-semibold mt-2"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Re-index Vector Memory</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPlaceholder;
