# Confirmation Modal Guide

## Overview
A reusable confirmation modal component built with Tailwind CSS that provides a consistent user experience for confirming destructive actions like deletions.

## Features

### 1. Reusable Confirmation Modal Component
- **Tailwind CSS styling** with responsive design
- **Multiple modal types**: danger, warning, info, success
- **Loading states** with spinner animation
- **Keyboard navigation** support
- **Backdrop click** to cancel
- **Accessible** with proper ARIA attributes

### 2. Confirmation Service
- **Promise-based API** for easy integration
- **Centralized state management** using Angular signals
- **Loading state management** during async operations
- **Convenience methods** for common scenarios

## Components

### ConfirmationModalComponent
```typescript
// Usage in template
<app-confirmation-modal
  [isOpen]="confirmationService.isOpen()"
  [data]="confirmationService.data()"
  [loading]="confirmationService.loading()"
  (confirm)="confirmationService.onConfirm()"
  (cancel)="confirmationService.onCancel()"
/>
```

### ConfirmationService
```typescript
// Inject the service
confirmationService = inject(ConfirmationService);

// Show confirmation modal
const confirmed = await this.confirmationService.confirm({
  title: 'Delete Task',
  message: 'Are you sure you want to delete this task?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  type: 'danger'
});

if (confirmed) {
  // User confirmed the action
}
```

## Modal Types

### 1. Danger (Red)
```typescript
{
  title: 'Delete Task',
  message: 'This action cannot be undone.',
  type: 'danger',
  confirmText: 'Delete',
  cancelText: 'Cancel'
}
```
- **Use for**: Deletions, destructive actions
- **Color**: Red theme
- **Icon**: Warning triangle

### 2. Warning (Yellow)
```typescript
{
  title: 'Discard Changes',
  message: 'You have unsaved changes.',
  type: 'warning',
  confirmText: 'Discard',
  cancelText: 'Keep Editing'
}
```
- **Use for**: Unsaved changes, potential data loss
- **Color**: Yellow theme
- **Icon**: Warning circle

### 3. Info (Blue)
```typescript
{
  title: 'Information',
  message: 'This will update your settings.',
  type: 'info',
  confirmText: 'Continue',
  cancelText: 'Cancel'
}
```
- **Use for**: Information, settings changes
- **Color**: Blue theme
- **Icon**: Information circle

### 4. Success (Green)
```typescript
{
  title: 'Complete Action',
  message: 'This will finalize the process.',
  type: 'success',
  confirmText: 'Complete',
  cancelText: 'Cancel'
}
```
- **Use for**: Final confirmations, completions
- **Color**: Green theme
- **Icon**: Check circle

## Usage Examples

### 1. Task Deletion
```typescript
// In TaskService
async deleteTaskWithConfirmation(task: Task): Promise<void> {
  const confirmed = await this.confirmationService.confirmTaskDelete(task.title);
  
  if (confirmed) {
    this.confirmationService.setLoading(true);
    
    this.deleteTask(task.id).subscribe({
      next: () => {
        this.confirmationService.setLoading(false);
        this.confirmationService.onConfirm();
      },
      error: (error) => {
        this.confirmationService.setLoading(false);
        console.error('Error deleting task:', error);
      }
    });
  }
}

// In Component
onDeleteTask(task: Task): void {
  this.taskService.deleteTaskWithConfirmation(task);
}
```

### 2. Form Cancellation with Unsaved Changes
```typescript
async onCancel(): Promise<void> {
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
      this.navigateBack();
    }
  } else {
    this.navigateBack();
  }
}
```

### 3. Bulk Operations
```typescript
async deleteSelectedTasks(): Promise<void> {
  const confirmed = await this.confirmationService.confirm({
    title: 'Delete Multiple Tasks',
    message: `Are you sure you want to delete ${this.selectedTasks.length} tasks? This action cannot be undone.`,
    confirmText: 'Delete All',
    cancelText: 'Cancel',
    type: 'danger'
  });
  
  if (confirmed) {
    // Perform bulk deletion
  }
}
```

### 4. Custom Confirmation
```typescript
async performCustomAction(): Promise<void> {
  const confirmed = await this.confirmationService.confirm({
    title: 'Custom Action',
    message: 'This will perform a custom action that may take several minutes.',
    confirmText: 'Proceed',
    cancelText: 'Cancel',
    type: 'info'
  });
  
  if (confirmed) {
    this.confirmationService.setLoading(true);
    
    try {
      await this.performLongRunningAction();
      this.confirmationService.setLoading(false);
      this.confirmationService.onConfirm();
    } catch (error) {
      this.confirmationService.setLoading(false);
      console.error('Action failed:', error);
    }
  }
}
```

## Service Methods

### Core Methods
```typescript
// Show confirmation modal
confirm(data: ConfirmationModalData): Promise<boolean>

// Confirm action
onConfirm(): void

// Cancel action
onCancel(): void

// Set loading state
setLoading(loading: boolean): void
```

### Convenience Methods
```typescript
// Delete confirmation
confirmDelete(itemName: string, itemType?: string): Promise<boolean>

// Task deletion confirmation
confirmTaskDelete(taskTitle: string): Promise<boolean>
```

## Styling

### Tailwind CSS Classes
The modal uses Tailwind CSS classes for styling:

```css
/* Modal backdrop */
.fixed.inset-0.z-50.overflow-y-auto

/* Modal container */
.flex.min-h-screen.items-center.justify-center.p-4

/* Modal content */
.relative.transform.overflow-hidden.rounded-lg.bg-white.shadow-xl

/* Button styles */
.bg-danger-600.hover:bg-danger-500  /* Danger button */
.bg-warning-600.hover:bg-warning-500 /* Warning button */
.bg-primary-600.hover:bg-primary-500  /* Info button */
.bg-success-600.hover:bg-success-500  /* Success button */
```

### Custom Styling
You can customize the modal by modifying the component's template or adding custom CSS classes.

## Accessibility

### ARIA Attributes
- **Modal role**: `role="dialog"`
- **Modal title**: `id="modal-title"`
- **Focus management**: Automatic focus on modal open
- **Keyboard navigation**: ESC key to cancel

### Keyboard Support
- **ESC**: Cancel the modal
- **Tab**: Navigate between buttons
- **Enter**: Confirm action
- **Space**: Confirm action

## Integration

### 1. Add to App Module
```typescript
// No need to add to app module - components are standalone
```

### 2. Import in Components
```typescript
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';
import { ConfirmationService } from '../services/confirmation.service';

@Component({
  imports: [ConfirmationModalComponent],
  // ...
})
export class YourComponent {
  confirmationService = inject(ConfirmationService);
}
```

### 3. Add to Template
```html
<app-confirmation-modal
  [isOpen]="confirmationService.isOpen()"
  [data]="confirmationService.data()"
  [loading]="confirmationService.loading()"
  (confirm)="confirmationService.onConfirm()"
  (cancel)="confirmationService.onCancel()"
/>
```

## Best Practices

### 1. Use Appropriate Types
- **Danger**: For destructive actions (delete, remove)
- **Warning**: For potential data loss (unsaved changes)
- **Info**: For informational confirmations
- **Success**: For completion confirmations

### 2. Clear Messaging
```typescript
// Good
message: 'Are you sure you want to delete "Important Task"? This action cannot be undone.'

// Bad
message: 'Delete?'
```

### 3. Loading States
```typescript
// Always show loading during async operations
this.confirmationService.setLoading(true);
try {
  await this.performAction();
} finally {
  this.confirmationService.setLoading(false);
}
```

### 4. Error Handling
```typescript
try {
  await this.performAction();
  this.confirmationService.onConfirm();
} catch (error) {
  this.confirmationService.setLoading(false);
  // Handle error (show toast, etc.)
}
```

## Testing

### Unit Tests
```typescript
describe('ConfirmationService', () => {
  it('should show confirmation modal', async () => {
    const confirmed = await service.confirm({
      title: 'Test',
      message: 'Test message',
      type: 'danger'
    });
    
    expect(confirmed).toBe(true);
  });
});
```

### Component Tests
```typescript
describe('ConfirmationModalComponent', () => {
  it('should emit confirm event', () => {
    spyOn(component.confirm, 'emit');
    component.onConfirm();
    expect(component.confirm.emit).toHaveBeenCalled();
  });
});
```

## Performance

### Lazy Loading
The modal component is lightweight and can be lazy-loaded if needed:

```typescript
// In routing
{
  path: 'confirm',
  loadComponent: () => import('./components/confirmation-modal/confirmation-modal.component')
}
```

### Memory Management
The service automatically cleans up state when the modal is closed, preventing memory leaks.

This confirmation modal provides a consistent, accessible, and user-friendly way to handle destructive actions throughout your application.
