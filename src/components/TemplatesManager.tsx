import React, { useState } from 'react';
import { TaskTemplate, Priority } from '../types/lab';
import { PRIORITY_INFO } from '../utils/labHelpers';
import {
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  Lock,
  Check,
  X,
  FlaskConical,
  Calendar,
} from 'lucide-react';

interface TemplatesManagerProps {
  templates: TaskTemplate[];
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onSpawnTask: (templateId: string) => void;
  onAddTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<TaskTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  isAdmin,
  onOpenAdminModal,
  onSpawnTask,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [defaultQuantity, setDefaultQuantity] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [frequency, setFrequency] = useState<'Weekly' | 'Bi-weekly' | 'Monthly' | 'When Empty' | 'Daily'>('Weekly');
  const [standardEffortMinutes, setStandardEffortMinutes] = useState<number>(30);
  const [spawnFeedback, setSpawnFeedback] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTitle('');
    setPriority('medium');
    setDefaultQuantity('');
    setRecipeNotes('');
    setFrequency('Weekly');
    setStandardEffortMinutes(30);
    setIsEditorOpen(true);
  };

  const openEditModal = (tpl: TaskTemplate) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setPriority(tpl.priority);
    setDefaultQuantity(tpl.defaultQuantity);
    setRecipeNotes(tpl.recipeNotes);
    setFrequency(tpl.frequencyRecommendation || 'Weekly');
    setStandardEffortMinutes(tpl.standardEffortMinutes || 30);
    setIsEditorOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, {
        title: title.trim(),
        priority,
        defaultQuantity: defaultQuantity.trim(),
        recipeNotes: recipeNotes.trim(),
        frequencyRecommendation: frequency,
        standardEffortMinutes: Number(standardEffortMinutes) || 30,
      });
    } else {
      onAddTemplate({
        title: title.trim(),
        priority,
        defaultQuantity: defaultQuantity.trim(),
        recipeNotes: recipeNotes.trim(),
        frequencyRecommendation: frequency,
        standardEffortMinutes: Number(standardEffortMinutes) || 30,
      });
    }

    setIsEditorOpen(false);
  };

  const handleQuickSpawn = (tpl: TaskTemplate) => {
    onSpawnTask(tpl.id);
  };

  return (
    <div className="space-y-6">
      {/* Feedback toast */}
      {spawnFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{spawnFeedback}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Default Lab Task Presets & SOPs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard laboratory preparation recipes. Spawn tasks directly when stocks run low.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={openCreateModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Preset Template</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login to Edit Presets</span>
            </button>
          )}
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const priority = PRIORITY_INFO[tpl.priority];

          return (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-150"
            >
              <div>
                {/* Priority */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className={`inline-flex items-center gap-1 font-semibold ${priority.textClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
                    {priority.label}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      {confirmDeleteId === tpl.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-semibold">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteTemplate(tpl.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditModal(tpl)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                            title="Edit Template"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(tpl.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-2">{tpl.title}</h3>

                {/* Recipe snippet */}
                {tpl.recipeNotes && (
                  <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150 mb-3 leading-relaxed">
                    {tpl.recipeNotes}
                  </p>
                )}

                {/* Specs */}
                <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  {tpl.defaultQuantity && (
                    <div className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Standard batch: <strong className="font-mono text-slate-700">{tpl.defaultQuantity}</strong></span>
                    </div>
                  )}
                  {tpl.frequencyRecommendation && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Recommended cycle: {tpl.frequencyRecommendation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleQuickSpawn(tpl)}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-200 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Generate Task from Preset</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Editor Modal (Admin) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingTemplate ? 'Edit Task Template' : 'Create Default Lab Preset'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Preset Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LB Plates with Spec (100)"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Standard Batch Amount
                  </label>
                  <input
                    type="text"
                    value={defaultQuantity}
                    onChange={(e) => setDefaultQuantity(e.target.value)}
                    placeholder="e.g. 25-30 plates"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Recommended Cycle
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="When Empty">When Empty</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Recipe / Standard Procedure Notes
                </label>
                <textarea
                  value={recipeNotes}
                  onChange={(e) => setRecipeNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter formula, autoclave settings, cooling temps, or antibiotic addition instructions..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Save Preset Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
