import React from 'react';
import { LabMember } from '../types/lab';
import { Plus, Shield, ShieldCheck, UserCheck, ChevronDown, Users, LogOut } from 'lucide-react';
import { getMemberColorStyle } from '../utils/labHelpers';

export type ActiveTab = 'board' | 'distribution' | 'templates' | 'roster';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeTaskCount: number;
  archiveTaskCount: number;
  currentUser: LabMember | null;
  onOpenUserSwitcher: () => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onOpenAddTaskModal: () => void;
  onLockApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeTaskCount,
  currentUser,
  onOpenUserSwitcher,
  isAdmin,
  onOpenAdminModal,
  onOpenAddTaskModal,
  onLockApp,
}) => {
  const memberStyle = getMemberColorStyle(currentUser?.color);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Title Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('board')}
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-cyan-700 transition-colors cursor-pointer text-left"
            >
              LabTasks
            </button>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400 border-l border-slate-200 pl-3">
              Dashboard for Tasks
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'board'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Active Needs</span>
              {activeTaskCount > 0 && (
                <span className="font-mono text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 tabular-nums">
                  {activeTaskCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'distribution'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Archive & Distribution
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Default Presets
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Lab Members</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Active User */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active User Switcher */}
            <button
              onClick={onOpenUserSwitcher}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
              title="Switch active lab member profile"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${memberStyle.bg} ${memberStyle.text}`}
              >
                {currentUser?.avatarInitials || 'LB'}
              </div>
              <span className="hidden sm:inline font-medium truncate max-w-[100px]">
                {currentUser ? currentUser.name.split(' ')[0] : 'Select User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Admin status pill/button */}
            <button
              onClick={onOpenAdminModal}
              className={`px-2 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isAdmin ? 'Admin Mode Active' : 'Admin Login'}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenAddTaskModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>

            {/* Lock / Sign Out of Portal Button */}
            {onLockApp && (
              <button
                onClick={onLockApp}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                title="Lock App (Sign Out)"
                aria-label="Lock App"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
