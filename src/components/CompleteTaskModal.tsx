import React, { useState, useEffect } from 'react';
import { LabTask, LabMember } from '../types/lab';
import { Check, X, FlaskConical, User } from 'lucide-react';
import { PRIORITY_INFO } from '../utils/labHelpers';

interface CompleteTaskModalProps {
  task: LabTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completionData: {
    completedBy: string;
    completedByMemberId?: string;
    completedAt: string;
    batchNotes?: string;
    volumeMade?: string;
  }) => void;
  members: LabMember[];
  currentUser: LabMember | null;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
  members,
  currentUser,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [completionDate, setCompletionDate] = useState<string>('');
  const [completionTime, setCompletionTime] = useState<string>('');
  const [volumeMade, setVolumeMade] = useState<string>('');
  const [batchNotes, setBatchNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && task) {
      if (currentUser) {
        setSelectedMemberId(currentUser.id);
        setCustomName('');
      } else if (members.length > 0) {
        setSelectedMemberId(members[0].id);
        setCustomName('');
      } else {
        setSelectedMemberId('custom');
        setCustomName('');
      }

      const now = new Date();
      setCompletionDate(now.toISOString().split('T')[0]);
      setCompletionTime(now.toTimeString().slice(0, 5));

      setVolumeMade(task.quantity || '');
      setBatchNotes('');
    }
  }, [isOpen, task, currentUser, members]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let completedByName = '';
    let memberId: string | undefined = undefined;

    if (selectedMemberId === 'custom') {
      completedByName = customName.trim() || 'Anonymous Lab Member';
    } else {
      const found = members.find((m) => m.id === selectedMemberId);
      if (found) {
        completedByName = found.name;
        memberId = found.id;
      } else {
        completedByName = customName.trim() || 'Lab Member';
      }
    }

    let completedAt = new Date().toISOString();
    if (completionDate && completionTime) {
      try {
        completedAt = new Date(`${completionDate}T${completionTime}:00`).toISOString();
      } catch {
        completedAt = new Date().toISOString();
      }
    }

    onConfirm({
      completedBy: completedByName,
      completedByMemberId: memberId,
      completedAt,
      batchNotes: batchNotes.trim(),
      volumeMade: volumeMade.trim(),
    });

    onClose();
  };

  const priority = PRIORITY_INFO[task.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Complete Task</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record completion in archive to track team distribution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="px-6 py-3 bg-cyan-50/50 border-b border-cyan-100/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className={priority.textClass}>● {priority.label}</span>
            <span aria-hidden="true">·</span>
            <span>Requested by {task.requestedBy}</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
          {task.recipeNotes && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic font-mono">
              {task.recipeNotes}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Who completed it */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Completed By <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900"
                  required
                >
                  <optgroup label="Lab Roster Members">
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">+ Other / Enter custom name...</option>
                </select>
              </div>

              {selectedMemberId === 'custom' && (
                <div className="relative animate-in fade-in duration-150">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter name of person who completed this"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required={selectedMemberId === 'custom'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Completion Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono text-slate-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="time"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono text-slate-800"
                required
              />
            </div>
          </div>

          {/* Quantity Prepared */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Quantity / Batch Size Made
            </label>
            <div className="relative">
              <FlaskConical className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={volumeMade}
                onChange={(e) => setVolumeMade(e.target.value)}
                placeholder="e.g. 25 plates, 2x 1000 mL"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Batch / Prep Verification Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Added antibiotic at 50°C, poured under hood."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Mark Completed & Archive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
