import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { ConfirmationService } from '../../services/confirmation.service';
import { Task, TaskStatus, TaskPriority, CreateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent, ConfirmationModalComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header Section -->
        <header class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="mb-4 sm:mb-0">
              <h1 class="text-4xl font-bold text-gray-900 mb-2">Task Management</h1>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                class="btn btn-outline" 
                (click)="loadTasks()"
                [disabled]="taskService.isOperationLoading('loadTasks')"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {{ taskService.isOperationLoading('loadTasks') ? 'Loading...' : 'Refresh Tasks' }}
              </button>
              <button class="btn btn-success" (click)="navigateToCreate()">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Task
              </button>
            </div>
          </div>
        </header>

        <!-- Add Task Form -->
        @if (showAddForm()) {
          <div class="card mb-8 animate-slide-up">
            <div class="p-6">
              <div class="flex items-center mb-6">
                <div class="flex-shrink-0">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900">Add New Task</h3>
                  <p class="text-sm text-gray-600">Create a new task for your team</p>
                </div>
              </div>
              
              <form (ngSubmit)="addTask()" #taskForm="ngForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title" 
                      [(ngModel)]="newTask.title" 
                      required 
                      #titleInput="ngModel"
                      class="form-input"
                      [class.border-danger-300]="titleInput.invalid && titleInput.touched"
                      placeholder="Enter task title"
                    >
                    @if (titleInput.invalid && titleInput.touched) {
                      <p class="mt-1 text-sm text-danger-600">Title is required</p>
                    }
                  </div>

                  <div>
                    <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select 
                      id="priority" 
                      name="priority" 
                      [(ngModel)]="newTask.priority" 
                      required
                      class="form-select"
                    >
                      <option value="">Select Priority</option>
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    [(ngModel)]="newTask.description" 
                    class="form-textarea"
                    rows="3"
                    placeholder="Enter task description"
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="assignee" class="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                    <input 
                      type="text" 
                      id="assignee" 
                      name="assignee" 
                      [(ngModel)]="newTask.assignee" 
                      class="form-input"
                      placeholder="Enter assignee name"
                    >
                  </div>

                  <div>
                    <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input 
                      type="date" 
                      id="dueDate" 
                      name="dueDate" 
                      [(ngModel)]="newTask.dueDate" 
                      class="form-input"
                    >
                  </div>
                </div>

                <div>
                  <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input 
                    type="text" 
                    id="tags" 
                    name="tags" 
                    [(ngModel)]="tagsInput" 
                    class="form-input"
                    placeholder="Enter tags separated by commas"
                  >
                  <p class="mt-1 text-sm text-gray-500">Separate multiple tags with commas</p>
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    class="btn btn-outline" 
                    (click)="cancelAdd()"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="taskForm.invalid || taskService.isOperationLoading('createTask')"
                  >
                    @if (taskService.isOperationLoading('createTask')) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    } @else {
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add Task
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Filters and Search -->
        <div class="card mb-8">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
              </svg>
              <h3 class="text-lg font-semibold text-gray-900">Filters & Search</h3>
            </div>
            
            <div class="space-y-4">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="searchTerm" 
                  (input)="onSearchChange()"
                  placeholder="Search tasks by title, description, or assignee..."
                  class="form-input pl-10"
                >
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    [(ngModel)]="statusFilter" 
                    (change)="onFilterChange()"
                    class="form-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="in_review">👀 In Review</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    [(ngModel)]="priorityFilter" 
                    (change)="onFilterChange()"
                    class="form-select"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select 
                    [(ngModel)]="assigneeFilter" 
                    (change)="onFilterChange()"
                    class="form-select"
                  >
                    <option value="">All Assignees</option>
                    @for (assignee of taskService.availableAssignees(); track assignee) {
                      <option [value]="assignee">👤 {{ assignee }}</option>
                    }
                  </select>
                </div>

                <div class="flex items-end">
                  <button 
                    class="btn btn-outline w-full" 
                    (click)="clearFilters()"
                    [disabled]="!hasActiveFilters()"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div class="card card-hover">
            <div class="p-4 text-center">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-full">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ taskService.taskStats().total }}</h3>
              <p class="text-sm text-gray-600">Total Tasks</p>
            </div>
          </div>
          
          <div class="card card-hover">
            <div class="p-4 text-center">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ taskService.taskStats().todo }}</h3>
              <p class="text-sm text-gray-600">To Do</p>
            </div>
          </div>
          
          <div class="card card-hover">
            <div class="p-4 text-center">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ taskService.taskStats().inProgress }}</h3>
              <p class="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
          
          <div class="card card-hover">
            <div class="p-4 text-center">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ taskService.taskStats().inReview }}</h3>
              <p class="text-sm text-gray-600">In Review</p>
            </div>
          </div>
          
          <div class="card card-hover">
            <div class="p-4 text-center">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-success-100 rounded-full">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">{{ taskService.taskStats().done }}</h3>
              <p class="text-sm text-gray-600">Done</p>
            </div>
          </div>
          
          <div class="card card-hover">
            <div class="p-4 text-center">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-danger-100 rounded-full">
                <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-danger-600">{{ taskService.taskStats().overdue }}</h3>
              <p class="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        @if (taskService.error()) {
          <div class="mb-6 bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium text-danger-800">Error</h3>
                <div class="mt-1 text-sm text-danger-700">{{ taskService.error() }}</div>
              </div>
              <div class="ml-auto pl-3">
                <button 
                  class="inline-flex text-danger-400 hover:text-danger-600"
                  (click)="taskService.setError(null)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Tasks List -->
        <div class="space-y-6">
          @if (taskService.loading() && taskService.tasks().length === 0) {
            <div class="card">
              <div class="p-12 text-center">
                <div class="flex justify-center mb-4">
                  <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Loading tasks...</h3>
                <p class="text-gray-600">Please wait while we fetch your tasks</p>
              </div>
            </div>
          } @else if (taskService.filteredTasks().length === 0) {
            <div class="card">
              <div class="p-12 text-center">
                <div class="flex justify-center mb-4">
                  <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p class="text-gray-600 mb-4">
                  @if (hasActiveFilters()) {
                    Try adjusting your filters or search terms to find tasks
                  } @else {
                    Get started by creating your first task
                  }
                </p>
                @if (!hasActiveFilters()) {
                  <button class="btn btn-primary" (click)="navigateToCreate()">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create First Task
                  </button>
                }
              </div>
            </div>
          } @else {
            <div class="space-y-4">
              @for (task of taskService.filteredTasks(); track task.id) {
                <app-task-card
                  [task]="task"
                  [isSelected]="selectedTaskId() === task.id"
                  [loading]="taskService.isOperationLoading('updateTask') || taskService.isOperationLoading('deleteTask')"
                  (edit)="onEditTask($event)"
                  (delete)="onDeleteTask($event)"
                  (statusChange)="onStatusChange($event)"
                />
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="confirmationService.isOpen()"
      [data]="confirmationService.data()"
      [loading]="confirmationService.loading()"
      (confirm)="confirmationService.onConfirm()"
      (cancel)="confirmationService.onCancel()"
    />
  `
})
export class TasksComponent implements OnInit {
  // Inject services
  taskService = inject(TaskService);
  confirmationService = inject(ConfirmationService);

  // Component state using signals
  showAddForm = signal<boolean>(false);
  selectedTaskId = signal<number | null>(null);

  // Filter state
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  assigneeFilter = '';

  // Form data
  newTask: CreateTaskRequest = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    assignee: '',
    dueDate: undefined,
    tags: []
  };

  tagsInput = '';

  // Computed properties
  hasActiveFilters = computed(() => {
    return this.searchTerm || this.statusFilter || this.priorityFilter || this.assigneeFilter;
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.loadTasks().subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
  }

  addTask(): void {
    if (!this.newTask.title || !this.newTask.priority) {
      return;
    }

    // Parse tags
    const tags = this.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const taskRequest: CreateTaskRequest = {
      ...this.newTask,
      tags,
      dueDate: this.newTask.dueDate ? new Date(this.newTask.dueDate) : undefined
    };

    this.taskService.createTask(taskRequest).subscribe({
      next: () => {
        this.cancelAdd();
      },
      error: (error) => {
        console.error('Error creating task:', error);
      }
    });
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
    this.newTask = {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      assignee: '',
      dueDate: undefined,
      tags: []
    };
    this.tagsInput = '';
  }

  onEditTask(task: Task): void {
    this.selectedTaskId.set(task.id);
    this.taskService.navigateToEditTask(task.id);
  }

  onDeleteTask(task: Task): void {
    this.taskService.deleteTaskWithConfirmation(task);
  }

  onStatusChange(event: { task: Task; newStatus: TaskStatus }): void {
    this.taskService.updateTask({
      id: event.task.id,
      status: event.newStatus
    }).subscribe({
      next: () => {
        // Status updated successfully
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  onSearchChange(): void {
    this.taskService.setFilter({ searchTerm: this.searchTerm });
  }

  onFilterChange(): void {
    this.taskService.setFilter({
      status: this.statusFilter as TaskStatus || undefined,
      priority: this.priorityFilter as TaskPriority || undefined,
      assignee: this.assigneeFilter || undefined,
      searchTerm: this.searchTerm || undefined
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.assigneeFilter = '';
    this.taskService.clearFilter();
  }

  navigateToCreate(): void {
    this.taskService.navigateToCreateTask();
  }
}
