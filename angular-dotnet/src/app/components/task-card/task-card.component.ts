import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card mt-5" 
         [class.ring-2]="isSelected" 
         [class.ring-primary-500]="isSelected"
         [class.border-l-4]="isOverdue"
         [class.border-danger-500]="isOverdue">
      
      <!-- Task Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900 truncate">{{ task.title }}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                #{{ task.id }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class]="getPriorityClasses(task.priority)">
                {{ getPriorityIcon(task.priority) }} {{ task.priority | titlecase }}
              </span>
              
              @if (isOverdue) {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800 animate-pulse">
                  ⚠️ Overdue
                </span>
              }
            </div>
          </div>
          
          <div class="ml-4 flex-shrink-0">
            <select 
              [value]="task.status" 
              (change)="onStatusChange($event)"
              [disabled]="loading"
              class="form-select text-sm"
            >
              <option value="todo">📋 To Do</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="in_review">👀 In Review</option>
              <option value="done">✅ Done</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Task Content -->
      <div class="p-6">
        @if (task.description) {
          <p class="text-gray-700 mb-4 leading-relaxed">{{ task.description }}</p>
        }
        
        <div class="space-y-3">
          @if (task.assignee) {
            <div class="flex items-center text-sm">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-gray-600">Assigned to</span>
              <span class="ml-1 font-medium text-gray-900">{{ task.assignee }}</span>
            </div>
          }
          
          @if (task.dueDate) {
            <div class="flex items-center text-sm">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span class="text-gray-600">Due</span>
              <span class="ml-1 font-medium" [class]="isOverdue ? 'text-danger-600' : 'text-gray-900'">
                {{ formatDate(task.dueDate) }}
              </span>
            </div>
          }
          
          @if (task.tags.length > 0) {
            <div class="flex items-center text-sm">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <span class="text-gray-600 mr-2">Tags:</span>
              <div class="flex flex-wrap gap-1">
                @for (tag of task.tags; track tag) {
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {{ tag }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Task Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 text-xs text-gray-500">
            <span>Created {{ formatDate(task.createdAt) }}</span>
            @if (task.updatedAt.getTime() !== task.createdAt.getTime()) {
              <span>Updated {{ formatDate(task.updatedAt) }}</span>
            }
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              class="btn btn-outline btn-sm" 
              (click)="onEdit()"
              [disabled]="loading"
              title="Edit task"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit
            </button>
            <button 
              class="btn btn-danger btn-sm" 
              (click)="onDelete()"
              [disabled]="loading"
              title="Delete task"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() isSelected: boolean = false;
  @Input() loading: boolean = false;

  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() statusChange = new EventEmitter<{ task: Task; newStatus: TaskStatus }>();

  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === TaskStatus.DONE) {
      return false;
    }
    return new Date(this.task.dueDate) < new Date();
  }

  onEdit(): void {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task);
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as TaskStatus;
    this.statusChange.emit({ task: this.task, newStatus });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPriorityClasses(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-success-100 text-success-800';
      case TaskPriority.MEDIUM:
        return 'bg-warning-100 text-warning-800';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TaskPriority.URGENT:
        return 'bg-danger-100 text-danger-800 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return '🟢';
      case TaskPriority.MEDIUM:
        return '🟡';
      case TaskPriority.HIGH:
        return '🟠';
      case TaskPriority.URGENT:
        return '🔴';
      default:
        return '⚪';
    }
  }
}
