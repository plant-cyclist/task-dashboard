import React, { useState } from 'react';
import { LabTask, LabMember } from '../types/lab';
import {
  Check,
  Calendar,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  User,
} from 'lucide-react';
import {
  PRIORITY_INFO,
  getDueDateStatus,
  formatDateOnly,
} from '../utils/labHelpers';

interface TaskCardProps {
  task: LabTask;
  onOpenCompleteModal: (task: LabTask) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: LabTask) => void;
  currentUser: LabMember | null;
  isAdmin: boolean;
  members?: LabMember[];
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenCompleteModal,
  onDelete,
  onEdit,
  currentUser,
  isAdmin,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const priority = PRIORITY_INFO[task.priority];
  const dueStatus = getDueDateStatus(task.dueDate);

  const assignedTo = task.assignedTo || 'Anyone';

  return (
    <div
      className={`group relative bg-white border rounded-xl p-5 shadow-xs transition-all duration-150 hover:shadow-md ${
        dueStatus.isOverdue
          ? 'border-rose-300 ring-1 ring-rose-200'
          : task.priority === 'urgent'
          ? 'border-amber-300'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Metadata Row - Priority & Quantity */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 font-semibold ${priority.textClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
            {priority.label}
          </span>
          {task.quantity && (
            <>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="font-mono tabular-nums text-slate-700 font-medium">
                {task.quantity}
              </span>
            </>
          )}
        </div>

        {/* Options Menu Button (Admin or requester) */}
        {(isAdmin || task.requestedBy === currentUser?.name) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20"
                onMouseLeave={() => setShowMenu(false)}
              >
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(task.id);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Title */}
      <h3 className="text-base font-semibold text-slate-900 tracking-tight leading-snug mb-2">
        {task.title}
      </h3>

      {/* Recipe Notes / SOP Details */}
      {task.recipeNotes && (
        <div className="mb-3.5 p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-xs font-mono text-slate-700 leading-relaxed">
          {task.recipeNotes}
        </div>
      )}

      {/* Contextual Specs: Requester & Due Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Left: Requester */}
        <div className="flex items-center gap-1 text-slate-500">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Requested by {task.requestedBy}</span>
        </div>

        {/* Right: Due Date countdown */}
        <div className={`flex items-center gap-1 shrink-0 ${dueStatus.urgencyClass}`}>
          {dueStatus.isOverdue ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className="font-mono tabular-nums">{dueStatus.formattedText}</span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({formatDateOnly(task.dueDate)})
          </span>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* "Task for" Badge (Set when generated, cannot be changed on dashboard) */}
        <div
          className="px-2.5 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50/80 text-cyan-900 text-xs font-medium flex items-center gap-1.5 select-none shadow-2xs"
          title={`Designated for: ${assignedTo} (set at creation)`}
        >
          <User className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
          <span>
            Task for: <strong className="font-semibold">{assignedTo}</strong>
          </span>
        </div>

        {/* Primary Completion Button ("I did this") */}
        <button
          onClick={() => onOpenCompleteModal(task)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 active:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>I did this</span>
        </button>
      </div>
    </div>
  );
};
