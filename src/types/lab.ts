export type Priority = 'urgent' | 'medium' | 'low';

export interface LabMember {
  id: string;
  name: string;
  role: 'PI / Lab Head' | 'Postdoc' | 'PhD Researcher' | 'Lab Manager' | 'Research Assistant' | 'Student';
  color: string;
  avatarInitials: string;
}

export interface LabTask {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string; // ISO string YYYY-MM-DD
  quantity?: string; // e.g. "25-30 plates"
  recipeNotes?: string;
  requestedBy: string;
  assignedTo?: string;
  createdAt: string; // ISO timestamp
  templateId?: string;
}

export interface CompletedTask extends LabTask {
  completedAt: string; // ISO timestamp
  completedBy: string;
  completedByMemberId?: string;
  batchNotes?: string;
  volumeMade?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  priority: Priority;
  defaultQuantity: string;
  recipeNotes: string;
  frequencyRecommendation?: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'When Empty' | 'Daily';
  standardEffortMinutes?: number;
}
