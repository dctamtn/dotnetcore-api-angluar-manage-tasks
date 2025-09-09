import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '../../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <div class="card">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
          </h2>
          
          <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                [(ngModel)]="task.title"
                required
                class="form-input"
                placeholder="Enter task title"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="task.description"
                required
                rows="4"
                class="form-textarea"
                placeholder="Enter task description"
              ></textarea>
            </div>

            <!-- Priority -->
            <div>
              <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                [(ngModel)]="task.priority"
                required
                class="form-select"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <!-- Status (only for edit mode) -->
            <div *ngIf="isEditMode">
              <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                [(ngModel)]="task.status"
                class="form-select"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <!-- Assignee -->
            <div>
              <label for="assignee" class="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <input
                type="text"
                id="assignee"
                name="assignee"
                [(ngModel)]="task.assignee"
                class="form-input"
                placeholder="Enter assignee name"
              />
            </div>

            <!-- Due Date -->
            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                [(ngModel)]="dueDateString"
                class="form-input"
              />
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                [(ngModel)]="tagsString"
                class="form-input"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <!-- Error Message -->
            <div *ngIf="taskService.error()" class="bg-danger-50 border border-danger-200 rounded-md p-4">
              <p class="text-danger-800">{{ taskService.error() }}</p>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="onCancel()"
                class="btn btn-outline"
                [disabled]="taskService.loading()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!taskForm.valid || taskService.loading()"
              >
                <span *ngIf="taskService.loading()" class="animate-spin mr-2">⏳</span>
                {{ isEditMode ? 'Update Task' : 'Create Task' }}
              </button>
            </div>
          </form>
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
  `,
  styles: []
})
export class TaskFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public taskService = inject(TaskService);
  public confirmationService = inject(ConfirmationService);

  task: Partial<Task> = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    assignee: '',
    dueDate: undefined,
    tags: []
  };

  isEditMode = false;
  taskId: number | null = null;
  dueDateString = '';
  tagsString = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTask();
      }
    });
  }

  private loadTask(): void {
    if (this.taskId) {
      // First try to get from local state
      const existingTask = this.taskService.getTaskById(this.taskId);
      if (existingTask) {
        this.populateForm(existingTask);
      } else {
        // Load from API if not in local state
        this.taskService.loadTaskById(this.taskId).subscribe({
          next: (task) => {
            this.populateForm(task);
          },
          error: (error) => {
            console.error('Error loading task:', error);
            // Navigate back if task not found
            this.taskService.navigateBack();
          }
        });
      }
    }
  }

  private populateForm(task: Task): void {
    this.task = { ...task };
    this.dueDateString = task.dueDate ? 
      new Date(task.dueDate).toISOString().split('T')[0] : '';
    this.tagsString = task.tags.join(', ');
  }

  onSubmit(): void {
    if (!this.task.title || !this.task.description || !this.task.priority) {
      return;
    }

    // Convert date string to Date object
    if (this.dueDateString) {
      this.task.dueDate = new Date(this.dueDateString);
    }

    // Convert tags string to array
    this.task.tags = this.tagsString
      ? this.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    if (this.isEditMode && this.taskId) {
      const updateRequest: UpdateTaskRequest = {
        id: this.taskId,
        title: this.task.title,
        description: this.task.description,
        status: this.task.status,
        priority: this.task.priority,
        assignee: this.task.assignee,
        dueDate: this.task.dueDate,
        tags: this.task.tags
      };

      this.taskService.updateTask(updateRequest).subscribe({
        next: () => {
          // Navigation is handled in the service
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
    } else {
      const createRequest: CreateTaskRequest = {
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        assignee: this.task.assignee,
        dueDate: this.task.dueDate,
        tags: this.task.tags
      };

      this.taskService.createTask(createRequest).subscribe({
        next: () => {
          // Navigation is handled in the service
        },
        error: (error) => {
          console.error('Error creating task:', error);
        }
      });
    }
  }

  async onCancel(): Promise<void> {
    // Check if there are unsaved changes
    const hasChanges = this.hasUnsavedChanges();
    
    if (hasChanges) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to leave without saving?',
        confirmText: 'Discard',
        cancelText: 'Keep Editing',
        type: 'warning'
      });
      
      if (confirmed) {
        this.taskService.navigateBack();
      }
    } else {
      this.taskService.navigateBack();
    }
  }

  private hasUnsavedChanges(): boolean {
    // Simple check for unsaved changes
    return !!(this.task.title || this.task.description || this.task.assignee || this.tagsString);
  }
}
