// Task Management System Models

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  tags: string[];
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  searchTerm?: string;
  tags?: string[];
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  overdue: number;
}
