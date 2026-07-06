import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

export const AppLayout: React.FC = () => {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-black text-zinc-100">
      {/* Ambient background glows - Linear/Vercel aesthetic */}
      <div className="absolute top-[-10%] right-[10%] h-[500px] w-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] h-[400px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Content wrapper */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Main scrollable section */}
        <main className="flex-1 overflow-y-auto px-8 py-6 relative">
          {/* Snappy micro-animation for page loading */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-6xl w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
export default AppLayout;
