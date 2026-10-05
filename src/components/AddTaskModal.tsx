import React, { useState, useEffect } from 'react';
import { LabTask, Priority, TaskTemplate, LabMember } from '../types/lab';
import { X, Plus, Sparkles, FlaskConical } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<LabTask, 'id' | 'createdAt'>) => void;
  templates: TaskTemplate[];
  members: LabMember[];
  currentUser: LabMember | null;
  initialTemplateId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  templates,
  members,
  currentUser,
  initialTemplateId,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [assignedTo, setAssignedTo] = useState('Anyone');

  // Set default due date to tomorrow
  const setDefaultDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDueDate(d.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (isOpen) {
      setDefaultDate(1);
      setRequestedBy(currentUser ? currentUser.name : 'Lab Team');
      setAssignedTo('Anyone');

      if (initialTemplateId) {
        applyTemplate(initialTemplateId);
      } else {
        setSelectedTemplateId('');
        setTitle('');
        setPriority('medium');
        setQuantity('');
        setRecipeNotes('');
      }
    }
  }, [isOpen, initialTemplateId, currentUser]);

  const applyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      setTitle(tpl.title);
      setPriority(tpl.priority);
      setQuantity(tpl.defaultQuantity);
      setRecipeNotes(tpl.recipeNotes);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onAdd({
      title: title.trim(),
      priority,
      dueDate,
      quantity: quantity.trim(),
      recipeNotes: recipeNotes.trim(),
      requestedBy: requestedBy.trim() || 'Lab Team',
      assignedTo: assignedTo.trim() || 'Anyone',
      templateId: selectedTemplateId || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Request New Lab Task</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add media to prepare or solutions to mix
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick Selection */}
        {templates.length > 0 && (
          <div className="px-6 py-3 bg-cyan-50/40 border-b border-cyan-100/50">
            <label className="block text-xs font-semibold text-cyan-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Auto-Fill from Presets</span>
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-cyan-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-800"
            >
              <option value="">-- Choose a standard preset or enter custom --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Title / Reagent Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LB Plates with Spec (100)"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900"
              required
            />
          </div>

          {/* Priority & Quantity Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 font-medium"
              >
                <option value="urgent">Urgent</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity / Batch Size
              </label>
              <div className="relative">
                <FlaskConical className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 25-30 plates"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Due Date with Quick Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDefaultDate(0)}
                  className="text-[11px] px-1.5 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultDate(1)}
                  className="text-[11px] px-1.5 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultDate(3)}
                  className="text-[11px] px-1.5 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultDate(7)}
                  className="text-[11px] px-1.5 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  1 Week
                </button>
              </div>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono text-slate-800"
              required
            />
          </div>

          {/* Recipe / SOP Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Recipe Notes or Instructions
            </label>
            <textarea
              value={recipeNotes}
              onChange={(e) => setRecipeNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Autoclave 20 min @ 121°C. Add antibiotic after cooling to 50°C."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-800 font-mono text-xs"
            />
          </div>

          {/* Task For (Assignment / Lab Member or Anyone) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
              Task For <span className="text-slate-400 font-normal lowercase">(set upon generation)</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 cursor-pointer"
            >
              <option value="Anyone">Anyone</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Designate who will do this task when generated. Displayed on the board and cannot be modified from the dashboard.
            </p>
          </div>

          {/* Requested By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Requested By
            </label>
            <div className="relative">
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="Your name or initials"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Task to Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
