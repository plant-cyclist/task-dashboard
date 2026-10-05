import React, { useState, useMemo } from 'react';
import { CompletedTask, LabMember } from '../types/lab';
import {
  calculateDistributionAnalytics,
  PRIORITY_INFO,
  formatDateTime,
  getMemberColorStyle,
} from '../utils/labHelpers';
import {
  BarChart3,
  CheckCircle2,
  Download,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

interface FairDistributionViewProps {
  archiveTasks: CompletedTask[];
  members: LabMember[];
  onUndoTask: (archiveId: string) => void;
  onDeleteArchiveTask: (archiveId: string) => void;
  isAdmin: boolean;
}

export const FairDistributionView: React.FC<FairDistributionViewProps> = ({
  archiveTasks,
  members,
  onUndoTask,
  onDeleteArchiveTask,
  isAdmin,
}) => {
  const [subView, setSubView] = useState<'analytics' | 'log'>('analytics');
  const [timeframe, setTimeframe] = useState<'all' | 30 | 7>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  // Analytics calculation
  const analytics = useMemo(() => {
    return calculateDistributionAnalytics(members, archiveTasks, timeframe);
  }, [members, archiveTasks, timeframe]);

  // Filtered archive for the log tab
  const filteredLog = useMemo(() => {
    return archiveTasks.filter((task) => {
      // Timeframe filter
      if (timeframe !== 'all') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - timeframe);
        if (new Date(task.completedAt) < cutoff) return false;
      }

      // Member filter
      if (selectedMemberFilter !== 'all') {
        const matchId = task.completedByMemberId === selectedMemberFilter;
        const matchName = task.completedBy.toLowerCase() === selectedMemberFilter.toLowerCase();
        if (!matchId && !matchName) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesMember = task.completedBy.toLowerCase().includes(query);
        const matchesNotes = task.batchNotes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMember && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [archiveTasks, timeframe, selectedMemberFilter, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Task ID',
      'Title',
      'Priority',
      'Completed By',
      'Completed Date/Time',
      'Volume Made',
      'Batch Notes',
      'Requested By',
      'Due Date',
    ];

    const rows = filteredLog.map((t) => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.priority}"`,
      `"${t.completedBy}"`,
      `"${t.completedAt}"`,
      `"${t.volumeMade || ''}"`,
      `"${(t.batchNotes || '').replace(/"/g, '""')}"`,
      `"${t.requestedBy}"`,
      `"${t.dueDate}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lab_archive_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Lab Archive & Member Contributions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit who prepared what media and review distribution across lab members
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe(30)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === 30
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeframe(7)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === 7
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
          </div>

          {/* Subview Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSubView('analytics')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                subView === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Contributions</span>
            </button>
            <button
              onClick={() => setSubView('log')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                subView === 'log'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Archive ({archiveTasks.length})</span>
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download CSV for lab records"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Subview 1: Analytics & Contributions */}
      {subView === 'analytics' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Completed
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {analytics.totalCompleted}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Logged in archive
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Team Average
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-cyan-700 mt-1">
                {analytics.averagePerMember}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Tasks per member
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active Contributors
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {analytics.memberStats.filter((m) => m.completedCount > 0).length} / {members.length}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Participating researchers
              </span>
            </div>
          </div>

          {/* Member Workload Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Tasks Completed by Member
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total media and preparation tasks completed per researcher
              </p>
            </div>

            <div className="space-y-4">
              {analytics.memberStats.map((stat) => {
                const style = getMemberColorStyle(stat.member.color);

                return (
                  <div
                    key={stat.member.id}
                    className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      {/* Member identity */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${style.bg} ${style.text}`}
                        >
                          {stat.member.avatarInitials}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-900">
                            {stat.member.name}
                          </span>
                          <span className="text-xs text-slate-500 block">{stat.member.role}</span>
                        </div>
                      </div>

                      {/* Completed count and percentage */}
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                            {stat.completedCount}
                          </span>
                          <span className="text-xs text-slate-500">tasks</span>
                          <span className="text-xs font-mono tabular-nums text-slate-400">
                            ({stat.percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-cyan-600"
                        style={{
                          width: `${Math.min(
                            100,
                            analytics.totalCompleted > 0
                              ? (stat.completedCount / analytics.totalCompleted) * 100
                              : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subview 2: Full Historical Archive Log */}
      {subView === 'log' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archive title, batch notes, member..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900"
              />
            </div>

            {/* Filter by Member */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedMemberFilter}
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-800 cursor-pointer"
              >
                <option value="all">All Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Archived Items */}
          {filteredLog.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No completed tasks found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria or timeframe filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLog.map((item) => {
                const priority = PRIORITY_INFO[item.priority];

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    {/* Left: Task details & batch notes */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                        <span className={`inline-flex items-center gap-1 font-semibold ${priority.textClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
                          {priority.label}
                        </span>
                        {item.volumeMade && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-slate-700 font-medium">
                              Made: {item.volumeMade}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>Requested by {item.requestedBy}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>

                      {/* Batch notes */}
                      {item.batchNotes && (
                        <p className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded-md border border-slate-150">
                          {item.batchNotes}
                        </p>
                      )}
                    </div>

                    {/* Right: Completed by member badge & date */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {item.completedBy}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400 block mt-0.5">
                          {formatDateTime(item.completedAt)}
                        </span>
                      </div>

                      {/* Undo / Delete Actions */}
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          onClick={() => onUndoTask(item.id)}
                          className="px-2 py-1 text-xs text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          title="Move back to active needs queue"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => onDeleteArchiveTask(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete permanently (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
