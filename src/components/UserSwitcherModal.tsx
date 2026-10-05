import React from 'react';
import { LabMember } from '../types/lab';
import { X, Check, UserPlus } from 'lucide-react';
import { getMemberColorStyle } from '../utils/labHelpers';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: LabMember[];
  currentUser: LabMember | null;
  onSelectUser: (member: LabMember) => void;
  onOpenManageRoster: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUser,
  onSelectUser,
  onOpenManageRoster,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Select Active Lab Member</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tasks you complete or request will default to this identity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-1.5 max-h-80 overflow-y-auto">
          {members.map((member) => {
            const isSelected = currentUser?.id === member.id;
            const style = getMemberColorStyle(member.color);
            return (
              <button
                key={member.id}
                onClick={() => {
                  onSelectUser(member);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-cyan-50/80 border border-cyan-200 text-slate-900'
                    : 'hover:bg-slate-50 border border-transparent text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${style.bg} ${style.text}`}
                  >
                    {member.avatarInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenManageRoster();
            }}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Set & Manage Lab Members
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
