export interface AnalyticsMetrics {
  totalProjects: number;
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  completionRate: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
}

export interface PriorityDistributionItem {
  priority: string;
  label: string;
  count: number;
}

export interface UserWorkload {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
}

export interface AnalyticsSummary {
  metrics: AnalyticsMetrics;
  statusDistribution: StatusDistributionItem[];
  priorityDistribution: PriorityDistributionItem[];
}
