import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Brand Bar */}
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full py-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30 group-hover:bg-brand-500 transition-all duration-200">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Work<span className="text-brand-500">Forge</span>
          </span>
        </Link>
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} WorkForge SaaS Platform. All rights reserved.
      </footer>
    </div>
  );
};
