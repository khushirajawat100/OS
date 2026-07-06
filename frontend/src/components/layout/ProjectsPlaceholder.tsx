import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Task {
  id: string;
  title: string;
  dept: string;
  owner: string;
  level: 'High' | 'Medium' | 'Low';
  column: 'Backlog' | 'In Progress' | 'In Review' | 'Done';
}

interface Column {
  title: Task['column'];
  count: number;
  tasks: Task[];
}

const getOwnerPost = (ownerName: string) => {
  const nameLower = ownerName.toLowerCase();
  if (nameLower.includes('aria') || nameLower.includes('ceo')) return 'CEO';
  if (nameLower.includes('helix') || nameLower.includes('coo')) return 'COO';
  if (nameLower.includes('byte') || nameLower.includes('cto')) return 'CTO';
  if (nameLower.includes('ledger') || nameLower.includes('cfo')) return 'CFO';
  if (nameLower.includes('nova') || nameLower.includes('cmo')) return 'CMO';
  if (nameLower.includes('justice') || nameLower.includes('legal')) return 'LEGAL';
  return ownerName;
};

export const ProjectsPlaceholder: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    { title: 'Backlog', count: 0, tasks: [] },
    { title: 'In Progress', count: 0, tasks: [] },
    { title: 'In Review', count: 0, tasks: [] },
    { title: 'Done', count: 0, tasks: [] }
  ]);
  const [loading, setLoading] = useState(true);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const columnsList: Task['column'][] = ['Backlog', 'In Progress', 'In Review', 'Done'];

  const fetchBoard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (res.ok) {
        const data = await res.json();
        setColumns(data);
      }
    } catch (err) {
      console.error('Failed to load projects board', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, col: Task['column']) => {
    e.preventDefault();
    if (dragOverCol !== col) {
      setDragOverCol(col);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetCol: Task['column']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistic Update
    setColumns(prev => prev.map(col => {
      // Remove task if present in this column
      const tasksFiltered = col.tasks.filter(t => t.id !== taskId);
      
      // Add task if it is the target column
      let tasksUpdated = tasksFiltered;
      if (col.title === targetCol) {
        // Find task from other columns
        const draggedTask = prev.flatMap(c => c.tasks).find(t => t.id === taskId);
        if (draggedTask) {
          tasksUpdated = [...tasksFiltered, { ...draggedTask, column: targetCol }];
        }
      }

      return {
        ...col,
        count: tasksUpdated.length,
        tasks: tasksUpdated
      };
    }));
    
    setDragOverCol(null);

    // Call API to save column state to PostgreSQL database
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${taskId}/column`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: targetCol })
      });
      if (res.ok) {
        fetchBoard();
      }
    } catch (err) {
      console.error('Failed to update task column status', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">
            Projects Board
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Drag and drop card modules between columns to update sprint task status (COO sync).
          </p>
        </div>
        
        <button 
          disabled
          className="flex items-center space-x-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold py-2.5 px-4"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Sprint Module</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 font-mono text-zinc-555 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mb-2" />
          <span>Loading sprint board configurations...</span>
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
          {columnsList.map((colName) => {
            const colObj = columns.find(c => c.title === colName) || { title: colName, count: 0, tasks: [] };
            const colTasks = colObj.tasks;
            const isOver = dragOverCol === colName;

            return (
              <div 
                key={colName} 
                onDragOver={(e) => handleDragOver(e, colName)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, colName)}
                className={`flex flex-col space-y-4 rounded-xl border p-2 transition-all duration-300 ${
                  isOver ? 'border-zinc-700 bg-zinc-900/10' : 'border-transparent bg-transparent'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 px-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-zinc-300">{colName}</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-900 px-1.5 py-0.2 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Task list container */}
                <div className="space-y-3 flex-1 min-h-[450px] p-1 rounded-lg">
                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task) => (
                      <motion.div
                        layout
                        key={task.id} 
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, task.id)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          type: 'spring',
                          stiffness: 400,
                          damping: 30
                        }}
                        className="bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-950 p-4 rounded-lg space-y-3 transition-colors cursor-grab active:cursor-grabbing group shadow-md relative"
                      >
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/10 transition-all" />

                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-zinc-600 font-bold group-hover:text-zinc-500 transition-colors">{task.id}</span>
                          <span className={`px-1.5 py-0.5 rounded ${
                            task.level === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            task.level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-zinc-900 text-zinc-505 border border-zinc-850'
                          }`}>
                            {task.level}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-zinc-200 leading-snug group-hover:text-white transition-colors">
                          {task.title}
                        </h4>

                        <div className="pt-2.5 border-t border-zinc-900/60 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-[10px] text-zinc-450">
                            <User className="h-3 w-3 text-zinc-650" />
                            <span>{getOwnerPost(task.owner)}</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider">{task.dept}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {colTasks.length === 0 && (
                    <div className="h-full border border-dashed border-zinc-900 rounded-lg flex items-center justify-center py-20 text-[10px] font-mono text-zinc-655">
                      Empty Column
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
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

export default ProjectsPlaceholder;
