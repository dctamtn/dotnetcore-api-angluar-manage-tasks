import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, delay, finalize, tap } from 'rxjs/operators';
import { ConfirmationService } from './confirmation.service';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilter, 
  TaskStats,
  TaskStatus,
  TaskPriority 
} from '../models/task.model';

// API Response DTOs to match the backend
interface TaskResponseDto {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO string from API
  status: ApiTaskStatus;
  createdAt: string; // ISO string from API
  updatedAt?: string; // ISO string from API
}

interface CreateTaskDto {
  title: string;
  description: string;
  dueDate: string; // ISO string
  status: ApiTaskStatus;
}

interface UpdateTaskDto {
  title: string;
  description: string;
  dueDate: string; // ISO string
  status: ApiTaskStatus;
}

interface TaskStatisticsDto {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

// API TaskStatus enum to match backend
enum ApiTaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly apiUrl = 'https://localhost:7000/api/tasks'; // API base URL
  
  // HTTP options for CORS and headers
  private readonly httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  // Private signals for internal state management
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private filterSignal = signal<TaskFilter>({});
  
  // Enhanced loading states for individual operations
  private operationLoadingSignal = signal<Set<string>>(new Set());

  // Public readonly signals for components
  public readonly tasks = this.tasksSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  public readonly filter = this.filterSignal.asReadonly();
  public readonly operationLoading = this.operationLoadingSignal.asReadonly();

  // Computed signals for derived state
  public readonly filteredTasks = computed(() => {
    const tasks = this.tasks();
    const filter = this.filter();
    
    return tasks.filter(task => {
      // Status filter
      if (filter.status && task.status !== filter.status) {
        return false;
      }
      
      // Priority filter
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }
      
      // Assignee filter
      if (filter.assignee && task.assignee !== filter.assignee) {
        return false;
      }
      
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description.toLowerCase().includes(searchLower);
        const matchesAssignee = task.assignee?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription && !matchesAssignee) {
          return false;
        }
      }
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => task.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      return true;
    });
  });

  public readonly taskStats = computed((): TaskStats => {
    const tasks = this.tasks();
    const now = new Date();
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      inReview: tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length,
      done: tasks.filter(t => t.status === TaskStatus.DONE).length,
      overdue: tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < now && 
        t.status !== TaskStatus.DONE
      ).length
    };
  });

  public readonly availableAssignees = computed(() => {
    const tasks = this.tasks();
    const assignees = new Set(tasks.map(t => t.assignee).filter(Boolean));
    return Array.from(assignees).sort();
  });

  public readonly availableTags = computed(() => {
    const tasks = this.tasks();
    const tags = new Set(tasks.flatMap(t => t.tags));
    return Array.from(tags).sort();
  });

  constructor() {
    // Service initialized - no mock data needed
  }

  // Navigation Methods
  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/tasks/create']);
  }

  navigateToEditTask(id: number): void {
    this.router.navigate(['/tasks/edit', id]);
  }

  navigateBack(): void {
    this.router.navigate(['/tasks']);
  }

  // API Methods
  loadTasks(): Observable<Task[]> {
    this.setLoading(true);
    this.setError(null);
    this.setOperationLoading('loadTasks', true);

    const params = this.buildHttpParams(this.filter());
    
    return this.http.get<TaskResponseDto[]>(this.apiUrl, { params, ...this.httpOptions }).pipe(
      map(apiTasks => {
        const tasks = apiTasks.map(apiTask => this.mapApiTaskToTask(apiTask));
        this.tasksSignal.set(tasks);
        return tasks;
      }),
      catchError(error => this.handleError(error, 'Failed to load tasks')),
      finalize(() => {
        this.setLoading(false);
        this.setOperationLoading('loadTasks', false);
      })
    );
  }

  createTask(taskRequest: CreateTaskRequest): Observable<Task> {
    this.setLoading(true);
    this.setError(null);
    this.setOperationLoading('createTask', true);

    const createTaskDto = this.mapCreateTaskRequestToDto(taskRequest);

    return this.http.post<TaskResponseDto>(this.apiUrl, createTaskDto, this.httpOptions).pipe(
      map(apiTask => {
        const task = this.mapApiTaskToTask(apiTask);
        this.tasksSignal.update(tasks => [...tasks, task]);
        // Navigate back to tasks list after successful creation
        this.navigateToTasks();
        return task;
      }),
      catchError(error => this.handleError(error, 'Failed to create task')),
      finalize(() => {
        this.setLoading(false);
        this.setOperationLoading('createTask', false);
      })
    );
  }

  updateTask(taskRequest: UpdateTaskRequest): Observable<Task> {
    this.setLoading(true);
    this.setError(null);
    this.setOperationLoading('updateTask', true);

    const updateTaskDto = this.mapUpdateTaskRequestToDto(taskRequest);

    return this.http.put<TaskResponseDto>(`${this.apiUrl}/${taskRequest.id}`, updateTaskDto, this.httpOptions).pipe(
      map(apiTask => {
        const task = this.mapApiTaskToTask(apiTask);
        this.tasksSignal.update(tasks => 
          tasks.map(t => t.id === taskRequest.id ? task : t)
        );
        // Navigate back to tasks list after successful update
        this.navigateToTasks();
        return task;
      }),
      catchError(error => this.handleError(error, 'Failed to update task')),
      finalize(() => {
        this.setLoading(false);
        this.setOperationLoading('updateTask', false);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    this.setLoading(true);
    this.setError(null);
    this.setOperationLoading('deleteTask', true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      map(() => {
        this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
        // Stay on current page after deletion (could navigate to tasks list if needed)
        // this.navigateToTasks();
      }),
      catchError(error => this.handleError(error, 'Failed to delete task')),
      finalize(() => {
        this.setLoading(false);
        this.setOperationLoading('deleteTask', false);
      })
    );
  }

  /**
   * Delete task with confirmation modal
   */
  async deleteTaskWithConfirmation(task: Task): Promise<void> {
    const confirmed = await this.confirmationService.confirmTaskDelete(task.title);
    
    if (confirmed) {
      this.confirmationService.setLoading(true);
      
      this.deleteTask(task.id).subscribe({
        next: () => {
          this.confirmationService.setLoading(false);
          // Modal will close automatically after successful deletion
        },
        error: (error) => {
          this.confirmationService.setLoading(false);
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  // Filter methods
  setFilter(filter: Partial<TaskFilter>): void {
    this.filterSignal.update(current => ({ ...current, ...filter }));
  }

  clearFilter(): void {
    this.filterSignal.set({});
  }

  // State management methods
  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  setError(error: string | null): void {
    this.errorSignal.set(error);
  }

  // Enhanced loading state management
  private setOperationLoading(operation: string, loading: boolean): void {
    this.operationLoadingSignal.update(operations => {
      const newOperations = new Set(operations);
      if (loading) {
        newOperations.add(operation);
      } else {
        newOperations.delete(operation);
      }
      return newOperations;
    });
  }

  public isOperationLoading(operation: string): boolean {
    return this.operationLoading().has(operation);
  }

  // Enhanced error handling
  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request: Invalid data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource was not found';
          break;
        case 409:
          errorMessage = 'Conflict: The resource already exists or is in use';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation Error: Please check your input';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        case 0:
          errorMessage = 'Network Error: Please check your connection';
          break;
        default:
          errorMessage = error.error?.message || `Server Error (${error.status}): ${error.statusText}`;
      }
    }

    console.error(`${operation} failed:`, error);
    this.setError(`${operation}: ${errorMessage}`);
    return throwError(() => new Error(errorMessage));
  }

  // Utility methods
  getTaskById(id: number): Task | undefined {
    return this.tasks().find(task => task.id === id);
  }

  // Load a single task by ID from API
  loadTaskById(id: number): Observable<Task> {
    this.setError(null);
    this.setOperationLoading(`loadTask-${id}`, true);

    return this.http.get<TaskResponseDto>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      map(apiTask => this.mapApiTaskToTask(apiTask)),
      catchError(error => this.handleError(error, 'Failed to load task')),
      finalize(() => {
        this.setOperationLoading(`loadTask-${id}`, false);
      })
    );
  }

  // Refresh tasks without changing filters
  refreshTasks(): Observable<Task[]> {
    return this.loadTasks();
  }

  // Load task statistics from API
  loadTaskStatistics(): Observable<TaskStats> {
    this.setError(null);
    this.setOperationLoading('loadStatistics', true);

    return this.http.get<TaskStatisticsDto>(`${this.apiUrl}/statistics`, this.httpOptions).pipe(
      map(apiStats => ({
        total: apiStats.total,
        todo: apiStats.pending,
        inProgress: apiStats.inProgress,
        inReview: 0, // API doesn't have in_review status
        done: apiStats.completed,
        overdue: apiStats.overdue
      })),
      catchError(error => this.handleError(error, 'Failed to load task statistics')),
      finalize(() => {
        this.setOperationLoading('loadStatistics', false);
      })
    );
  }

  // Clear error state
  clearError(): void {
    this.setError(null);
  }

  // API-ready methods
  private buildHttpParams(filter: TaskFilter): HttpParams {
    let params = new HttpParams();
    
    if (filter.status) {
      // Map Angular TaskStatus to API TaskStatus
      const apiStatus = this.mapTaskStatusToApi(filter.status);
      params = params.set('status', apiStatus.toString());
    }
    // Note: API doesn't support priority, assignee, searchTerm, or tags filters yet
    // These can be implemented on the backend later
    
    return params;
  }


  // Mapping methods between API and Angular models
  private mapApiTaskToTask(apiTask: TaskResponseDto): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      status: this.mapApiStatusToTaskStatus(apiTask.status),
      priority: TaskPriority.MEDIUM, // Default since API doesn't have priority
      assignee: undefined, // API doesn't have assignee
      dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
      createdAt: new Date(apiTask.createdAt),
      updatedAt: apiTask.updatedAt ? new Date(apiTask.updatedAt) : new Date(apiTask.createdAt),
      tags: [] // API doesn't have tags
    };
  }

  private mapCreateTaskRequestToDto(request: CreateTaskRequest): CreateTaskDto {
    return {
      title: request.title,
      description: request.description,
      dueDate: request.dueDate ? request.dueDate.toISOString() : new Date().toISOString(),
      status: ApiTaskStatus.Pending // Default status
    };
  }

  private mapUpdateTaskRequestToDto(request: UpdateTaskRequest): UpdateTaskDto {
    return {
      title: request.title || '',
      description: request.description || '',
      dueDate: request.dueDate ? request.dueDate.toISOString() : new Date().toISOString(),
      status: request.status ? this.mapTaskStatusToApi(request.status) : ApiTaskStatus.Pending
    };
  }

  private mapApiStatusToTaskStatus(apiStatus: ApiTaskStatus): TaskStatus {
    switch (apiStatus) {
      case ApiTaskStatus.Pending:
        return TaskStatus.TODO;
      case ApiTaskStatus.InProgress:
        return TaskStatus.IN_PROGRESS;
      case ApiTaskStatus.Completed:
        return TaskStatus.DONE;
      case ApiTaskStatus.Cancelled:
        return TaskStatus.DONE; // Map cancelled to done for now
      default:
        return TaskStatus.TODO;
    }
  }

  private mapTaskStatusToApi(taskStatus: TaskStatus): ApiTaskStatus {
    switch (taskStatus) {
      case TaskStatus.TODO:
        return ApiTaskStatus.Pending;
      case TaskStatus.IN_PROGRESS:
        return ApiTaskStatus.InProgress;
      case TaskStatus.IN_REVIEW:
        return ApiTaskStatus.InProgress; // Map in_review to in_progress for now
      case TaskStatus.DONE:
        return ApiTaskStatus.Completed;
      default:
        return ApiTaskStatus.Pending;
    }
  }
}
