# Task Service Usage Guide

## Overview
The `TaskService` has been updated to support proper routing and API calls with the following routing structure:
- `/tasks` → List page
- `/tasks/create` → Add form
- `/tasks/edit/:id` → Edit form

## Key Features

### 1. Navigation Methods
```typescript
// Navigate to tasks list
taskService.navigateToTasks();

// Navigate to create task form
taskService.navigateToCreateTask();

// Navigate to edit task form
taskService.navigateToEditTask(taskId);

// Navigate back to tasks list
taskService.navigateBack();
```

### 2. CRUD Operations with Navigation
```typescript
// Create task (automatically navigates to tasks list after success)
taskService.createTask(taskRequest).subscribe({
  next: (task) => console.log('Task created:', task),
  error: (error) => console.error('Error:', error)
});

// Update task (automatically navigates to tasks list after success)
taskService.updateTask(updateRequest).subscribe({
  next: (task) => console.log('Task updated:', task),
  error: (error) => console.error('Error:', error)
});

// Delete task (stays on current page)
taskService.deleteTask(taskId).subscribe({
  next: () => console.log('Task deleted'),
  error: (error) => console.error('Error:', error)
});
```

### 3. Reactive State Management
```typescript
// Read-only signals for components
taskService.tasks()           // All tasks
taskService.filteredTasks()   // Filtered tasks
taskService.loading()         // Loading state
taskService.error()           // Error message
taskService.taskStats()       // Task statistics
taskService.availableAssignees() // Available assignees
taskService.availableTags()   // Available tags
```

### 4. Filtering
```typescript
// Set filters
taskService.setFilter({
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
  assignee: 'John Doe',
  searchTerm: 'authentication',
  tags: ['backend', 'security']
});

// Clear all filters
taskService.clearFilter();
```

## Component Usage Examples

### Tasks List Component
```typescript
export class TasksComponent {
  taskService = inject(TaskService);

  ngOnInit() {
    this.taskService.loadTasks().subscribe();
  }

  onEditTask(task: Task) {
    this.taskService.navigateToEditTask(task.id);
  }

  onDeleteTask(task: Task) {
    this.taskService.deleteTask(task.id).subscribe();
  }

  navigateToCreate() {
    this.taskService.navigateToCreateTask();
  }
}
```

### Task Form Component
```typescript
export class TaskFormComponent {
  taskService = inject(TaskService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        // Load existing task for editing
        const task = this.taskService.getTaskById(+params['id']);
        // Populate form with task data
      }
    });
  }

  onSubmit() {
    if (this.isEditMode) {
      this.taskService.updateTask(updateRequest).subscribe();
    } else {
      this.taskService.createTask(createRequest).subscribe();
    }
  }

  onCancel() {
    this.taskService.navigateBack();
  }
}
```

## API Integration (Future)

When you implement the backend API, you can uncomment and use the API methods in the service:

```typescript
// Replace mock methods with API methods
loadTasksFromAPI(filter?: TaskFilter): Observable<Task[]>
createTaskAPI(taskRequest: CreateTaskRequest): Observable<Task>
updateTaskAPI(taskRequest: UpdateTaskRequest): Observable<Task>
deleteTaskAPI(id: number): Observable<void>
```

The service includes helper methods for building HTTP parameters and is ready for API integration.

## Routing Configuration

The routing is configured in `app-routing-module.ts`:

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', loadComponent: () => import('./pages/tasks/tasks.component') },
  { path: 'tasks/create', loadComponent: () => import('./pages/tasks/task-form/task-form.component') },
  { path: 'tasks/edit/:id', loadComponent: () => import('./pages/tasks/task-form/task-form.component') },
  { path: '**', redirectTo: '/tasks' }
];
```

## Benefits

1. **Centralized Navigation**: All navigation logic is in the service
2. **Automatic Routing**: CRUD operations automatically navigate to appropriate pages
3. **Reactive State**: Uses Angular signals for reactive state management
4. **API Ready**: Prepared for backend integration
5. **Type Safe**: Full TypeScript support with proper interfaces
6. **Error Handling**: Built-in error handling and loading states
