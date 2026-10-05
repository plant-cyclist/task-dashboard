import React, { useState } from 'react';
import { X, ShieldCheck, Key, Lock, RefreshCw, Download, Upload, Check, Users } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminPin: string;
  onLogin: (pin: string) => boolean;
  onLogout: () => void;
  onChangePin: (newPin: string) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onNavigateToRoster?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  adminPin,
  onLogin,
  onLogout,
  onChangePin,
  onResetData,
  onExportData,
  onImportData,
  onNavigateToRoster,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const ok = onLogin(pinInput);
    if (ok) {
      setPinInput('');
      setSuccessMsg('Admin mode unlocked successfully.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } else {
      setErrorMsg('Incorrect PIN. The default lab admin PIN is 1234.');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      setErrorMsg('PIN must be at least 4 characters.');
      return;
    }
    onChangePin(newPinInput.trim());
    setNewPinInput('');
    setShowChangePin(false);
    setSuccessMsg('Admin PIN updated.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const ok = onImportData(importJsonText);
    if (ok) {
      setImportJsonText('');
      setShowImportBox(false);
      setSuccessMsg('Lab data imported successfully.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } else {
      setErrorMsg('Invalid JSON data format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Lab Administrator Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          {!isAdmin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter the lab administrator PIN to manage default task templates, edit presets, and configure team settings.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Admin PIN Code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter PIN (Default: 1234)"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Default PIN: <strong className="text-slate-700">1234</strong>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Unlock Admin Access
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Administrator Mode Active
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      You can manage default templates, modify any task, and configure lab roster.
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                  >
                    Lock / Exit
                  </button>
                </div>
              </div>

              {/* Set & Manage Lab Members Roster */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToRoster) onNavigateToRoster();
                  }}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Set & Manage Lab Members</span>
                  </span>
                  <span className="text-[11px] text-slate-300 font-normal">Add, edit, or remove →</span>
                </button>
              </div>

              {/* Admin Tools */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Admin Maintenance & Backups
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="p-2.5 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Download className="w-3.5 h-3.5 text-cyan-600" />
                      Export Lab JSON
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Download full database</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImportBox(!showImportBox)}
                    className="p-2.5 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Upload className="w-3.5 h-3.5 text-cyan-600" />
                      Import Lab Data
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Restore from backup</p>
                  </button>
                </div>

                {showImportBox && (
                  <form onSubmit={handleImportSubmit} className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
                    <label className="block text-xs font-medium text-slate-700">Paste JSON Data:</label>
                    <textarea
                      value={importJsonText}
                      onChange={(e) => setImportJsonText(e.target.value)}
                      rows={3}
                      className="w-full p-2 text-xs font-mono bg-white border border-slate-300 rounded-md"
                      placeholder='{"activeTasks": [...]}'
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowImportBox(false)}
                        className="px-2 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded-md"
                      >
                        Apply Import
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePin(!showChangePin)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                  >
                    {showChangePin ? 'Cancel changing PIN' : 'Change Admin PIN'}
                  </button>
                </div>

                {showChangePin && (
                  <form onSubmit={handleChangePinSubmit} className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
                    <label className="block text-xs font-medium text-slate-700">New 4+ Digit PIN:</label>
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="e.g. 5678"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-1 text-xs font-semibold text-white bg-slate-900 rounded-md"
                    >
                      Save New PIN
                    </button>
                  </form>
                )}

                <div className="pt-3 border-t border-slate-100">
                  {confirmReset ? (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                      <p className="text-xs text-rose-800 font-medium">Reset all tasks, archive, and presets to initial demo data?</p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-md cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResetData();
                            setConfirmReset(false);
                            setSuccessMsg('Reset to demo lab dataset.');
                            setTimeout(() => setSuccessMsg(''), 2500);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md cursor-pointer"
                        >
                          Yes, Reset All Data
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="w-full py-2 px-3 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                      Reset to Default Lab Demo Data
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
