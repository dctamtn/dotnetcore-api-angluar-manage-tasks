import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal backdrop -->
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal -->
        <div class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <!-- Modal header -->
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <!-- Icon -->
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                   [ngClass]="getIconClasses()">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path *ngIf="data?.type === 'danger'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  <path *ngIf="data?.type === 'warning'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  <path *ngIf="data?.type === 'info'" stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  <path *ngIf="data?.type === 'success'" stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <!-- Content -->
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                  {{ data?.title || 'Confirm Action' }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ data?.message || 'Are you sure you want to proceed?' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modal footer -->
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
              [ngClass]="getConfirmButtonClasses()"
              (click)="onConfirm()"
              [disabled]="loading"
            >
              <svg *ngIf="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Processing...' : (data?.confirmText || 'Confirm') }}
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              (click)="onCancel()"
              [disabled]="loading"
            >
              {{ data?.cancelText || 'Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() data: ConfirmationModalData | null = null;
  @Input() loading = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getIconClasses(): string {
    const baseClasses = 'mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10';
    
    switch (this.data?.type) {
      case 'danger':
        return `${baseClasses} bg-danger-100`;
      case 'warning':
        return `${baseClasses} bg-warning-100`;
      case 'info':
        return `${baseClasses} bg-primary-100`;
      case 'success':
        return `${baseClasses} bg-success-100`;
      default:
        return `${baseClasses} bg-gray-100`;
    }
  }

  getConfirmButtonClasses(): string {
    const baseClasses = 'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto';
    
    switch (this.data?.type) {
      case 'danger':
        return `${baseClasses} bg-danger-600 hover:bg-danger-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600`;
      case 'warning':
        return `${baseClasses} bg-warning-600 hover:bg-warning-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-600`;
      case 'info':
        return `${baseClasses} bg-primary-600 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`;
      case 'success':
        return `${baseClasses} bg-success-600 hover:bg-success-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-600`;
      default:
        return `${baseClasses} bg-gray-600 hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600`;
    }
  }
}
