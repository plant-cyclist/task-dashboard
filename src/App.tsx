import React, { useState } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Header, ActiveTab } from './components/Header';
import { TaskBoard } from './components/TaskBoard';
import { FairDistributionView } from './components/FairDistributionView';
import { TemplatesManager } from './components/TemplatesManager';
import { RosterManager } from './components/RosterManager';
import { CompleteTaskModal } from './components/CompleteTaskModal';
import { AddTaskModal } from './components/AddTaskModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { AdminModal } from './components/AdminModal';
import { LoginGate } from './components/LoginGate';
import { LabTask, LabMember } from './types/lab';
import { CheckCircle2, Shield, Plus, Sparkles, Lock } from 'lucide-react';

const MainContent: React.FC = () => {
  // App Access Authentication Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const persistent = localStorage.getItem('labtasks_app_auth');
      const session = sessionStorage.getItem('labtasks_app_auth');
      return persistent === 'authenticated_admin' || session === 'authenticated_admin';
    } catch {
      return false;
    }
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('labtasks_app_auth');
      sessionStorage.removeItem('labtasks_app_auth');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const {
    activeTasks,
    archiveTasks,
    templates,
    members,
    currentUser,
    isAdmin,
    adminPin,
    addTask,
    spawnTaskFromTemplate,
    completeTask,
    undoCompleteTask,
    deleteTask,
    deleteArchiveTask,
    updateTask,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addMember,
    updateMember,
    deleteMember,
    setCurrentUser,
    loginAdmin,
    logoutAdmin,
    changeAdminPin,
    resetToDefaultData,
    exportDataJson,
    importDataJson,
  } = useLab();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('board');

  // Modals state
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTaskToComplete, setSelectedTaskToComplete] = useState<LabTask | null>(null);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>(undefined);

  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Quick feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Complete Modal
  const handleOpenCompleteModal = (task: LabTask) => {
    setSelectedTaskToComplete(task);
    setIsCompleteModalOpen(true);
  };

  // Handle open add task modal
  const handleOpenAddTaskModal = (templateId?: string) => {
    setPreselectedTemplateId(templateId);
    setIsAddTaskModalOpen(true);
  };

  // Handle spawn template: opens Add Task modal with template loaded to set Task For
  const handleSpawnTemplate = (templateId: string) => {
    handleOpenAddTaskModal(templateId);
  };

  // Export handling
  const handleExportData = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `labsync_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported full lab database backup.');
  };

  if (!isAuthenticated) {
    return <LoginGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTaskCount={activeTasks.length}
        archiveTaskCount={archiveTasks.length}
        currentUser={currentUser}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAddTaskModal={() => handleOpenAddTaskModal()}
        onLockApp={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'board' && (
          <TaskBoard
            tasks={activeTasks}
            templates={templates}
            members={members}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onOpenCompleteModal={handleOpenCompleteModal}
            onUpdateTask={(id, updates) => {
              updateTask(id, updates);
              if (updates.assignedTo) {
                showToast(`Task designated for: ${updates.assignedTo}`);
              }
            }}
            onDeleteTask={deleteTask}
            onOpenAddTaskModal={handleOpenAddTaskModal}
            onSpawnTemplate={handleSpawnTemplate}
          />
        )}

        {activeTab === 'distribution' && (
          <FairDistributionView
            archiveTasks={archiveTasks}
            members={members}
            onUndoTask={(archiveId) => {
              undoCompleteTask(archiveId);
              showToast('Restored task back to active needs queue.');
            }}
            onDeleteArchiveTask={deleteArchiveTask}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesManager
            templates={templates}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onSpawnTask={handleSpawnTemplate}
            onAddTemplate={addTemplate}
            onUpdateTemplate={updateTemplate}
            onDeleteTemplate={deleteTemplate}
          />
        )}

        {activeTab === 'roster' && (
          <RosterManager
            members={members}
            currentUser={currentUser}
            onSelectUser={(m) => {
              setCurrentUser(m);
              showToast(`Active profile switched to ${m.name}`);
            }}
            onAddMember={addMember}
            onUpdateMember={(id, updates) => {
              updateMember(id, updates);
              showToast('Updated member profile details.');
            }}
            onDeleteMember={(id) => {
              deleteMember(id);
              showToast('Removed member from active roster.');
            }}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            archiveTasks={archiveTasks}
          />
        )}
      </main>

      {/* Modals */}
      <CompleteTaskModal
        task={selectedTaskToComplete}
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedTaskToComplete(null);
        }}
        onConfirm={(completionData) => {
          if (selectedTaskToComplete) {
            completeTask(selectedTaskToComplete.id, completionData);
            showToast(`✓ Task completed by ${completionData.completedBy} and saved to archive.`);
          }
        }}
        members={members}
        currentUser={currentUser}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={(taskData) => {
          addTask(taskData);
          showToast(`+ Added "${taskData.title}" to active needs queue.`);
        }}
        templates={templates}
        members={members}
        currentUser={currentUser}
        initialTemplateId={preselectedTemplateId}
      />

      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        members={members}
        currentUser={currentUser}
        onSelectUser={(member) => {
          setCurrentUser(member);
          showToast(`Active profile switched to ${member.name}`);
        }}
        onOpenManageRoster={() => setActiveTab('roster')}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        adminPin={adminPin}
        onLogin={loginAdmin}
        onLogout={logoutAdmin}
        onChangePin={changeAdminPin}
        onResetData={resetToDefaultData}
        onExportData={handleExportData}
        onImportData={importDataJson}
        onNavigateToRoster={() => setActiveTab('roster')}
      />

      {/* Subdued Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Lab Tasks</span>
            <span aria-hidden="true">·</span>
            <span>Laboratory Task, Media & Buffer Preparation Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('distribution')}
              className="hover:text-slate-900 transition-colors"
            >
              Lab Distribution & Archive
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3 h-3 text-slate-400" />
              <span>Admin Settings</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleLogout}
              className="hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Lock App / Sign Out"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <MainContent />
    </LabProvider>
  );
}
