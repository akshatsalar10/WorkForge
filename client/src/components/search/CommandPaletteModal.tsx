import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearchQuery } from '../../services/searchApi';
import { Search, X, CheckSquare, FolderKanban, Users, User, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

export interface CommandPaletteModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  orgId,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useGlobalSearchQuery(
    { orgId, query: searchTerm },
    { skip: !isOpen || searchTerm.trim().length === 0 }
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = data?.data || { tasks: [], projects: [], teams: [], members: [] };
  const hasResults =
    results.tasks.length > 0 ||
    results.projects.length > 0 ||
    results.teams.length > 0 ||
    results.members.length > 0;

  const handleSelectTask = (taskId: string) => {
    onClose();
    navigate('/tasks');
  };

  const handleSelectProject = (projectId: string) => {
    onClose();
    navigate(`/projects/${projectId}`);
  };

  const handleSelectTeam = (teamId: string) => {
    onClose();
    navigate(`/teams/${teamId}`);
  };

  const handleSelectMember = () => {
    onClose();
    navigate('/members');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-brand-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search tasks, projects, teams, or members... (Esc to cancel)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none font-medium"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading && <LoadingSpinner label="Searching workspace..." />}

          {!isLoading && searchTerm.trim().length > 0 && !hasResults && (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-400">No results found for "{searchTerm}"</p>
              <p>Try searching for project keys, task numbers, or member names.</p>
            </div>
          )}

          {!isLoading && searchTerm.trim().length === 0 && (
            <div className="py-10 text-center text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-mono">
                  Cmd / Ctrl + K
                </kbd>
                <span>Global Command Shortcut</span>
              </div>
              <p>Type keywords to navigate instantly across WorkForge entities.</p>
            </div>
          )}

          {/* TASKS SECTION */}
          {results.tasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-brand-400" /> Tasks ({results.tasks.length})
              </h4>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-brand-500/50 hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-400 font-extrabold text-[10px]">
                        {t.taskKey}
                      </span>
                      <span className="text-xs font-bold text-slate-100 group-hover:text-brand-300">{t.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS SECTION */}
          {results.projects.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" /> Projects ({results.projects.length})
              </h4>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-extrabold text-[10px]">
                        {p.key}
                      </span>
                      <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">{p.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEAMS SECTION */}
          {results.teams.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Teams ({results.teams.length})
              </h4>
              <div className="space-y-1">
                {results.teams.map((tm) => (
                  <div
                    key={tm.id}
                    onClick={() => handleSelectTeam(tm.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs font-bold text-slate-100 group-hover:text-purple-300">{tm.name}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEMBERS SECTION */}
          {results.members.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-amber-400" /> Members ({results.members.length})
              </h4>
              <div className="space-y-1">
                {results.members.map((m) => (
                  <div
                    key={m.id}
                    onClick={handleSelectMember}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-700 text-white font-bold text-[10px] flex items-center justify-center">
                        {m.name.slice(0, 2)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.email}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
