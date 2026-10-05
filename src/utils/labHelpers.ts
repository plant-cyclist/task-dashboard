import { Priority, CompletedTask, LabMember } from '../types/lab';

export const PRIORITY_INFO: Record<Priority, { label: string; textClass: string; borderClass: string; bgClass: string; dotClass: string }> = {
  urgent: {
    label: 'Urgent',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    bgClass: 'bg-rose-50',
    dotClass: 'bg-rose-600',
  },
  medium: {
    label: 'Medium',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-600',
  },
  low: {
    label: 'Low',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-200',
    bgClass: 'bg-slate-50',
    dotClass: 'bg-slate-400',
  },
};

export function getDueDateStatus(dueDateStr: string): {
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  daysRemaining: number;
  formattedText: string;
  urgencyClass: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = dueDateStr.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isToday = diffDays === 0;
  const isTomorrow = diffDays === 1;

  let formattedText = '';
  let urgencyClass = 'text-slate-600';

  if (isOverdue) {
    const overdueCount = Math.abs(diffDays);
    formattedText = `${overdueCount} day${overdueCount > 1 ? 's' : ''} overdue`;
    urgencyClass = 'text-rose-600 font-semibold';
  } else if (isToday) {
    formattedText = 'Due today';
    urgencyClass = 'text-amber-600 font-semibold';
  } else if (isTomorrow) {
    formattedText = 'Due tomorrow';
    urgencyClass = 'text-amber-700';
  } else if (diffDays <= 7) {
    formattedText = `In ${diffDays} days`;
    urgencyClass = 'text-slate-700';
  } else {
    formattedText = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    urgencyClass = 'text-slate-600';
  }

  return {
    isOverdue,
    isToday,
    isTomorrow,
    daysRemaining: diffDays,
    formattedText,
    urgencyClass,
  };
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoOrDateString: string): string {
  try {
    const d = new Date(isoOrDateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoOrDateString;
  }
}

export const MEMBER_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-400' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-800', ring: 'ring-cyan-400' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-400' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-400' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-400' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-800', ring: 'ring-teal-400' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-400' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-400' },
};

export function getMemberColorStyle(colorName?: string) {
  if (colorName && MEMBER_COLOR_MAP[colorName]) {
    return MEMBER_COLOR_MAP[colorName];
  }
  return { bg: 'bg-slate-100', text: 'text-slate-800', ring: 'ring-slate-300' };
}

// Distribution Analytics Interfaces
export interface MemberContributionStats {
  member: LabMember;
  completedCount: number;
  percentage: number;
  latestCompletion?: CompletedTask;
  urgentCompletedCount: number;
}

export function calculateDistributionAnalytics(
  members: LabMember[],
  archiveTasks: CompletedTask[],
  daysFilter: number | 'all' = 'all'
): {
  memberStats: MemberContributionStats[];
  totalCompleted: number;
  averagePerMember: number;
} {
  // Filter by timeframe if requested
  let filteredArchive = archiveTasks;
  if (daysFilter !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysFilter);
    filteredArchive = archiveTasks.filter((t) => new Date(t.completedAt) >= cutoff);
  }

  const totalCompleted = filteredArchive.length;
  const averagePerMember = members.length > 0 ? totalCompleted / members.length : 0;

  const memberStats: MemberContributionStats[] = members.map((member) => {
    // Match either by member ID or by name
    const memberTasks = filteredArchive.filter(
      (t) => t.completedByMemberId === member.id || t.completedBy.toLowerCase().trim() === member.name.toLowerCase().trim()
    );

    const count = memberTasks.length;
    const percentage = totalCompleted > 0 ? Math.round((count / totalCompleted) * 100) : 0;

    let urgentCount = 0;
    memberTasks.forEach((t) => {
      if (t.priority === 'urgent') urgentCount++;
    });

    // Sort to find latest
    const sorted = [...memberTasks].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return {
      member,
      completedCount: count,
      percentage,
      latestCompletion: sorted[0],
      urgentCompletedCount: urgentCount,
    };
  });

  // Sort member stats by completed count descending
  memberStats.sort((a, b) => b.completedCount - a.completedCount);

  return {
    memberStats,
    totalCompleted,
    averagePerMember: Math.round(averagePerMember * 10) / 10,
  };
}
