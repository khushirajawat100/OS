import React, { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, FileCode } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface ReportItem {
  name: string;
  size: string;
  compiled: string;
  author: string;
  type: string;
}

export const ReportsPlaceholder: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reports`);
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (err) {
        console.error('Failed to fetch reports list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'sheet':
        return <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-450" />;
      case 'code':
        return <FileCode className="h-4.5 w-4.5 text-cyan-400" />;
      default:
        return <FileText className="h-4.5 w-4.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient">
          C-Suite Report Archives
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Audited files, analytics reports, and corporate briefs compiled automatically by your AI executives.
        </p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-900 bg-zinc-950 p-4 text-[10px] font-mono text-zinc-550 uppercase tracking-wider">
          <div className="col-span-5">Document Name</div>
          <div className="col-span-3">Compiled By</div>
          <div className="col-span-2">Compiled Time</div>
          <div className="col-span-1">File Size</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* List items */}
        <div className="divide-y divide-zinc-900/60">
          {loading ? (
            <div className="flex justify-center items-center py-12 font-mono text-zinc-650 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400 mr-2" />
              <span>Fetching report archives...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-zinc-650 font-mono text-xs">No compiled files found.</div>
          ) : (
            reports.map((rep, idx) => (
              <div 
                key={idx} 
                className="grid grid-cols-12 gap-4 p-4 text-xs items-center hover:bg-zinc-900/40 transition-colors group cursor-pointer"
              >
                <div className="col-span-5 flex items-center space-x-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-850 rounded-lg shrink-0 group-hover:border-zinc-800 transition-colors">
                    {getReportIcon(rep.type)}
                  </div>
                  <span className="font-mono text-zinc-205 group-hover:text-white transition-colors">{rep.name}</span>
                </div>
                
                <div className="col-span-3 text-zinc-400 font-medium">{rep.author}</div>
                
                <div className="col-span-2 text-zinc-500 font-mono">{rep.compiled}</div>
                
                <div className="col-span-1 text-zinc-500 font-mono">{rep.size}</div>
                
                <div className="col-span-1 text-right">
                  <button 
                    onClick={() => window.open(`${API_BASE_URL}/reports/${rep.name}/download`, '_blank')}
                    className="p-1.5 rounded-lg border border-zinc-900 group-hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
                    title="Download File"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Loader2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default ReportsPlaceholder;
