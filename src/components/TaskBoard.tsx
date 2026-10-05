import React, { useState, useMemo } from 'react';
import { LabTask, Priority, LabMember, TaskTemplate } from '../types/lab';
import { TaskCard } from './TaskCard';
import { getDueDateStatus } from '../utils/labHelpers';
import {
  Search,
  AlertCircle,
  Plus,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: LabTask[];
  templates: TaskTemplate[];
  members: LabMember[];
  currentUser: LabMember | null;
  isAdmin: boolean;
  onOpenCompleteModal: (task: LabTask) => void;
  onUpdateTask: (taskId: string, updates: Partial<LabTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTaskModal: (templateId?: string) => void;
  onSpawnTemplate: (templateId: string) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  templates,
  members,
  currentUser,
  isAdmin,
  onOpenCompleteModal,
  onUpdateTask,
  onDeleteTask,
  onOpenAddTaskModal,
  onSpawnTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDueStatus, setSelectedDueStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'taskFor' | 'created'>('dueDate');

  // Quick templates (the 4 default presets)
  const quickTemplates = useMemo(() => templates.slice(0, 6), [templates]);

  // Urgent count and overdue count
  const stats = useMemo(() => {
    let overdue = 0;
    let urgent = 0;
    let dueToday = 0;

    tasks.forEach((t) => {
      const status = getDueDateStatus(t.dueDate);
      if (status.isOverdue) overdue++;
      if (status.isToday) dueToday++;
      if (t.priority === 'urgent') urgent++;
    });

    return { overdue, urgent, dueToday, total: tasks.length };
  }, [tasks]);

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchNotes = task.recipeNotes?.toLowerCase().includes(q);
          const matchRequester = task.requestedBy.toLowerCase().includes(q);
          const matchTaskFor = (task.assignedTo || 'Anyone').toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchRequester && !matchTaskFor) return false;
        }

        // Priority
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Due Status
        if (selectedDueStatus !== 'all') {
          const status = getDueDateStatus(task.dueDate);
          if (selectedDueStatus === 'overdue' && !status.isOverdue) return false;
          if (selectedDueStatus === 'today' && !status.isToday) return false;
          if (selectedDueStatus === 'upcoming' && (status.isOverdue || status.isToday)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const weight: Record<Priority, number> = { urgent: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'taskFor') {
          const forA = (a.assignedTo || 'Anyone').toLowerCase();
          const forB = (b.assignedTo || 'Anyone').toLowerCase();
          const cmp = forA.localeCompare(forB);
          if (cmp !== 0) return cmp;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, searchQuery, selectedPriority, selectedDueStatus, sortBy]);

  return (
    <div className="space-y-6">
      {/* Quick Spawn Presets Bar */}
      {quickTemplates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Quick Request Presets
            </span>
            <button
              onClick={() => onOpenAddTaskModal()}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold cursor-pointer"
            >
              + Custom Task
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {quickTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onOpenAddTaskModal(tpl.id)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 rounded-lg text-xs text-slate-700 hover:text-cyan-900 whitespace-nowrap transition-colors flex items-center gap-1.5 font-medium shrink-0 shadow-2xs cursor-pointer"
                title={`Generate "${tpl.title}" and specify who it is for`}
              >
                <span>+</span>
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Dashboard Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Row 1: Search + Status Alerts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active tasks, recipes, or requester..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:bg-white text-slate-900 transition-colors"
            />
          </div>

          {/* Quick Alert Chips / Status Counters */}
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums shrink-0">
            {stats.overdue > 0 && (
              <button
                onClick={() => setSelectedDueStatus(selectedDueStatus === 'overdue' ? 'all' : 'overdue')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedDueStatus === 'overdue'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{stats.overdue} Overdue</span>
              </button>
            )}

            {stats.dueToday > 0 && (
              <button
                onClick={() => setSelectedDueStatus(selectedDueStatus === 'today' ? 'all' : 'today')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedDueStatus === 'today'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{stats.dueToday} Due Today</span>
              </button>
            )}

            <div className="px-2.5 py-1.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-medium">
              {stats.total} Active
            </div>
          </div>
        </div>

        {/* Row 2: Priority & Sorting Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
          {/* Priority filter buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Priority:</span>
            <button
              onClick={() => setSelectedPriority('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPriority === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedPriority('urgent')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPriority === 'urgent'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-rose-700'
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => setSelectedPriority('medium')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPriority === 'medium'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-amber-700'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setSelectedPriority('low')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPriority === 'low'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Low
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-medium cursor-pointer"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="taskFor">Sort by "Task for"</option>
              <option value="created">Sort by Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {tasks.length === 0
              ? 'All lab tasks completed!'
              : 'No tasks match current filters'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {tasks.length === 0
              ? 'Great teamwork! No pending tasks requested. Click any preset above or request a new task when stocks run low.'
              : 'Try clearing your priority or search filters to see all pending items.'}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            {tasks.length !== 0 && (
              <button
                onClick={() => {
                  setSelectedPriority('all');
                  setSelectedDueStatus('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => onOpenAddTaskModal()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lab Task</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenCompleteModal={onOpenCompleteModal}
              onDelete={onDeleteTask}
              currentUser={currentUser}
              isAdmin={isAdmin}
              members={members}
            />
          ))}
        </div>
      )}
    </div>
  );
};
