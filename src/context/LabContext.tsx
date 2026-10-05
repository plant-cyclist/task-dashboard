import React, { createContext, useContext, useState, useEffect } from 'react';
import { LabTask, CompletedTask, TaskTemplate, LabMember } from '../types/lab';
import {
  DEFAULT_MEMBERS,
  DEFAULT_TEMPLATES,
  DEFAULT_ACTIVE_TASKS,
  DEFAULT_ARCHIVE_TASKS,
} from '../data/defaultLabData';

interface LabContextType {
  activeTasks: LabTask[];
  archiveTasks: CompletedTask[];
  templates: TaskTemplate[];
  members: LabMember[];
  currentUser: LabMember | null;
  isAdmin: boolean;
  adminPin: string;
  // Task Actions
  addTask: (task: Omit<LabTask, 'id' | 'createdAt'>) => void;
  spawnTaskFromTemplate: (templateId: string, customDueDate?: string, requestedBy?: string) => void;
  completeTask: (
    taskId: string,
    completionData: {
      completedBy: string;
      completedByMemberId?: string;
      completedAt: string;
      batchNotes?: string;
      volumeMade?: string;
    }
  ) => void;
  undoCompleteTask: (archiveId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteArchiveTask: (archiveId: string) => void;
  updateTask: (taskId: string, updates: Partial<LabTask>) => void;
  // Template Actions (Admin)
  addTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
  updateTemplate: (templateId: string, updates: Partial<TaskTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  // Member Actions
  addMember: (member: Omit<LabMember, 'id'>) => void;
  updateMember: (memberId: string, updates: Partial<LabMember>) => void;
  deleteMember: (memberId: string) => void;
  setCurrentUser: (member: LabMember | null) => void;
  // Admin Auth
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPin: (newPin: string) => void;
  // Utilities
  resetToDefaultData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'labsync_data_v3';

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTasks, setActiveTasks] = useState<LabTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.activeTasks)) return parsed.activeTasks;
      }
    } catch (e) {
      console.error('Failed to parse active tasks from localStorage', e);
    }
    return DEFAULT_ACTIVE_TASKS;
  });

  const [archiveTasks, setArchiveTasks] = useState<CompletedTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.archiveTasks)) return parsed.archiveTasks;
      }
    } catch (e) {
      console.error('Failed to parse archive tasks from localStorage', e);
    }
    return DEFAULT_ARCHIVE_TASKS;
  });

  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.templates)) return parsed.templates;
      }
    } catch (e) {
      console.error('Failed to parse templates from localStorage', e);
    }
    return DEFAULT_TEMPLATES;
  });

  const [members, setMembers] = useState<LabMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.members)) return parsed.members;
      }
    } catch (e) {
      console.error('Failed to parse members from localStorage', e);
    }
    return DEFAULT_MEMBERS;
  });

  const [currentUser, setCurrentUser] = useState<LabMember | null>(() => {
    try {
      const savedId = localStorage.getItem('labsync_current_user_id');
      if (savedId) {
        const found = DEFAULT_MEMBERS.find((m) => m.id === savedId);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return DEFAULT_MEMBERS[1]; // Elena Vance as default active viewer
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('labsync_admin_active') === 'true';
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('labsync_admin_pin') || '1234';
  });

  // Persist primary data
  useEffect(() => {
    try {
      const dataToSave = {
        activeTasks,
        archiveTasks,
        templates,
        members,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [activeTasks, archiveTasks, templates, members]);

  // Persist current user id
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('labsync_current_user_id', currentUser.id);
    }
  }, [currentUser]);

  // Persist admin session
  useEffect(() => {
    sessionStorage.setItem('labsync_admin_active', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed.activeTasks) setActiveTasks(parsed.activeTasks);
          if (parsed.archiveTasks) setArchiveTasks(parsed.archiveTasks);
          if (parsed.templates) setTemplates(parsed.templates);
          if (parsed.members) setMembers(parsed.members);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Task Actions
  const addTask = (taskInput: Omit<LabTask, 'id' | 'createdAt'>) => {
    const newTask: LabTask = {
      ...taskInput,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setActiveTasks((prev) => [newTask, ...prev]);
  };

  const spawnTaskFromTemplate = (templateId: string, customDueDate?: string, requestedBy?: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    // Default due date: tomorrow if none specified
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const dueDateStr = customDueDate || defaultDate.toISOString().split('T')[0];

    const newTask: LabTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: tpl.title,
      priority: tpl.priority,
      dueDate: dueDateStr,
      quantity: tpl.defaultQuantity,
      recipeNotes: tpl.recipeNotes,
      requestedBy: requestedBy || (currentUser ? currentUser.name : 'Lab Team'),
      assignedTo: currentUser ? currentUser.name : (members[0]?.name || 'Lab Member'),
      createdAt: new Date().toISOString(),
      templateId: tpl.id,
    };

    setActiveTasks((prev) => [newTask, ...prev]);
  };

  const completeTask = (
    taskId: string,
    completionData: {
      completedBy: string;
      completedByMemberId?: string;
      completedAt: string;
      batchNotes?: string;
      volumeMade?: string;
    }
  ) => {
    const taskToComplete = activeTasks.find((t) => t.id === taskId);
    if (!taskToComplete) return;

    const completedRecord: CompletedTask = {
      ...taskToComplete,
      completedAt: completionData.completedAt || new Date().toISOString(),
      completedBy: completionData.completedBy,
      completedByMemberId: completionData.completedByMemberId,
      batchNotes: completionData.batchNotes || '',
      volumeMade: completionData.volumeMade || taskToComplete.quantity || '',
    };

    setActiveTasks((prev) => prev.filter((t) => t.id !== taskId));
    setArchiveTasks((prev) => [completedRecord, ...prev]);
  };

  const undoCompleteTask = (archiveId: string) => {
    const record = archiveTasks.find((t) => t.id === archiveId);
    if (!record) return;

    // Remove completion fields and put back in active tasks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completedAt, completedBy, completedByMemberId, batchNotes, volumeMade, ...taskOnly } = record;

    setArchiveTasks((prev) => prev.filter((t) => t.id !== archiveId));
    setActiveTasks((prev) => [taskOnly as LabTask, ...prev]);
  };

  const deleteTask = (taskId: string) => {
    setActiveTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const deleteArchiveTask = (archiveId: string) => {
    setArchiveTasks((prev) => prev.filter((t) => t.id !== archiveId));
  };

  const updateTask = (taskId: string, updates: Partial<LabTask>) => {
    setActiveTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  // Template Actions
  const addTemplate = (tplInput: Omit<TaskTemplate, 'id'>) => {
    const newTpl: TaskTemplate = {
      ...tplInput,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTemplates((prev) => [...prev, newTpl]);
  };

  const updateTemplate = (templateId: string, updates: Partial<TaskTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, ...updates } : t)));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  // Member Actions
  const addMember = (memberInput: Omit<LabMember, 'id'>) => {
    const newMember: LabMember = {
      ...memberInput,
      id: `mem-${Date.now()}`,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateMember = (memberId: string, updates: Partial<LabMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m)));
    if (currentUser?.id === memberId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (currentUser?.id === memberId) {
      setCurrentUser(members.find((m) => m.id !== memberId) || null);
    }
  };

  // Admin Auth
  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === adminPin.trim()) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const changeAdminPin = (newPin: string) => {
    if (newPin.trim().length >= 4) {
      setAdminPin(newPin.trim());
      localStorage.setItem('labsync_admin_pin', newPin.trim());
    }
  };

  // Utilities
  const resetToDefaultData = () => {
    setActiveTasks(DEFAULT_ACTIVE_TASKS);
    setArchiveTasks(DEFAULT_ARCHIVE_TASKS);
    setTemplates(DEFAULT_TEMPLATES);
    setMembers(DEFAULT_MEMBERS);
    setCurrentUser(DEFAULT_MEMBERS[1]);
  };

  const exportDataJson = (): string => {
    return JSON.stringify(
      {
        activeTasks,
        archiveTasks,
        templates,
        members,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      },
      null,
      2
    );
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.activeTasks) && Array.isArray(parsed.archiveTasks)) {
        setActiveTasks(parsed.activeTasks);
        setArchiveTasks(parsed.archiveTasks);
        if (Array.isArray(parsed.templates)) setTemplates(parsed.templates);
        if (Array.isArray(parsed.members)) setMembers(parsed.members);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import', e);
    }
    return false;
  };

  return (
    <LabContext.Provider
      value={{
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
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
