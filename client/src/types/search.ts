export interface SearchTaskResult {
  id: string;
  taskKey: string;
  title: string;
  status: string;
  priority: string;
  project?: { name: string; key: string };
}

export interface SearchProjectResult {
  id: string;
  key: string;
  name: string;
  status: string;
}

export interface SearchTeamResult {
  id: string;
  name: string;
  description?: string;
}

export interface SearchMemberResult {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface SearchResults {
  tasks: SearchTaskResult[];
  projects: SearchProjectResult[];
  teams: SearchTeamResult[];
  members: SearchMemberResult[];
}
