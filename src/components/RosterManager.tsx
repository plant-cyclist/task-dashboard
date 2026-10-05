import React, { useState } from 'react';
import { LabMember, CompletedTask } from '../types/lab';
import { getMemberColorStyle } from '../utils/labHelpers';
import { UserPlus, UserCheck, Shield, ShieldCheck, Trash2, Edit2, X, Check, Lock } from 'lucide-react';

interface RosterManagerProps {
  members: LabMember[];
  currentUser: LabMember | null;
  onSelectUser: (member: LabMember) => void;
  onAddMember: (member: Omit<LabMember, 'id'>) => void;
  onUpdateMember: (memberId: string, updates: Partial<LabMember>) => void;
  onDeleteMember: (memberId: string) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  archiveTasks: CompletedTask[];
}

export const RosterManager: React.FC<RosterManagerProps> = ({
  members,
  currentUser,
  onSelectUser,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  isAdmin,
  onOpenAdminModal,
  archiveTasks,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LabMember | null>(null);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<LabMember['role']>('PhD Researcher');
  const [color, setColor] = useState('indigo');

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRole('PhD Researcher');
    setColor('indigo');
    setIsAddOpen(true);
  };

  const openEditModal = (member: LabMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setColor(member.color);
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // generate initials
    const parts = name.trim().split(' ');
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

    if (editingMember) {
      onUpdateMember(editingMember.id, {
        name: name.trim(),
        role,
        color,
        avatarInitials: initials,
      });
    } else {
      onAddMember({
        name: name.trim(),
        role,
        color,
        avatarInitials: initials,
      });
    }

    setIsAddOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Lab Members & Roster</h2>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin Access
              </span>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
                title="Log in as admin to edit existing members"
              >
                <Lock className="w-3 h-3 text-slate-400" /> Admin Login to Edit
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'As Admin, you can add, change (edit details/roles), or remove any lab member.'
              : 'Anyone can add new lab members to join the team. Only the Admin can edit or delete existing members.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Lab Member</span>
          </button>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const style = getMemberColorStyle(member.color);
          const isCurrent = currentUser?.id === member.id;
          const completedCount = archiveTasks.filter(
            (t) => t.completedByMemberId === member.id || t.completedBy.toLowerCase() === member.name.toLowerCase()
          ).length;

          return (
            <div
              key={member.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all duration-150 flex flex-col justify-between ${
                isCurrent ? 'border-cyan-300 ring-1 ring-cyan-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${style.bg} ${style.text}`}
                    >
                      {member.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>

                  {/* Admin controls: Edit and Delete */}
                  {isAdmin ? (
                    <div className="flex items-center gap-1">
                      {confirmDeleteMemberId === member.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-semibold">Remove?</span>
                          <button
                            onClick={() => {
                              onDeleteMember(member.id);
                              setConfirmDeleteMemberId(null);
                            }}
                            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteMemberId(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit member details (Admin)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {members.length > 1 && (
                            <button
                              onClick={() => setConfirmDeleteMemberId(member.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Remove member (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Tasks logged in archive:</span>
                    <strong className="font-mono tabular-nums text-slate-800">{completedCount} tasks</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                {isCurrent ? (
                  <span className="w-full py-1.5 px-3 text-xs font-semibold text-cyan-800 bg-cyan-50 rounded-lg flex items-center justify-center gap-1.5 border border-cyan-200">
                    <UserCheck className="w-3.5 h-3.5" /> Active Profile
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectUser(member)}
                    className="w-full py-1.5 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Switch to this Profile
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingMember ? 'Edit Lab Member Details' : 'Add New Lab Member'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingMember(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Morgan"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Lab Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                >
                  <option value="PI / Lab Head">PI / Lab Head</option>
                  <option value="Lab Manager">Lab Manager</option>
                  <option value="Postdoc">Postdoc</option>
                  <option value="PhD Researcher">PhD Researcher</option>
                  <option value="Research Assistant">Research Assistant</option>
                  <option value="Student">Student / Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Avatar Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {['emerald', 'cyan', 'indigo', 'amber', 'rose', 'teal', 'purple'].map((col) => {
                    const st = getMemberColorStyle(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColor(col)}
                        className={`w-7 h-7 rounded-full ${st.bg} border-2 transition-transform ${
                          color === col ? 'scale-110 border-slate-900' : 'border-transparent'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {editingMember ? 'Save Changes' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
