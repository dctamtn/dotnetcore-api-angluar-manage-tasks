# API Integration Guide

## Overview
The TaskService has been updated to use real HTTP API calls with comprehensive error handling and loading state management.

## Key Features

### 1. HTTP API Integration
- **Real HTTP calls** instead of mock data
- **RESTful endpoints** following standard conventions
- **Automatic navigation** after successful operations
- **Optimistic updates** for better UX

### 2. Enhanced Loading States
```typescript
// Global loading state
taskService.loading() // boolean

// Individual operation loading states
taskService.isOperationLoading('loadTasks')    // boolean
taskService.isOperationLoading('createTask')   // boolean
taskService.isOperationLoading('updateTask')   // boolean
taskService.isOperationLoading('deleteTask')   // boolean
taskService.isOperationLoading('loadTask-123') // boolean (for specific task)
```

### 3. Comprehensive Error Handling
```typescript
// Error state
taskService.error() // string | null

// Clear error
taskService.clearError()

// Automatic error handling for:
// - 400: Bad Request
// - 401: Unauthorized
// - 403: Forbidden
// - 404: Not Found
// - 409: Conflict
// - 422: Validation Error
// - 500: Server Error
// - Network errors
```

## API Endpoints

### Base URL
```typescript
private readonly apiUrl = '/api/tasks';
```

### Endpoints
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Query Parameters (for GET /api/tasks)
- `status` - Filter by task status
- `priority` - Filter by task priority
- `assignee` - Filter by assignee
- `search` - Search in title, description, assignee
- `tags` - Filter by tags (comma-separated)

## Usage Examples

### 1. Loading Tasks
```typescript
// Load all tasks
taskService.loadTasks().subscribe({
  next: (tasks) => console.log('Tasks loaded:', tasks),
  error: (error) => console.error('Error:', error)
});

// Load specific task
taskService.loadTaskById(123).subscribe({
  next: (task) => console.log('Task loaded:', task),
  error: (error) => console.error('Error:', error)
});
```

### 2. Creating Tasks
```typescript
const newTask: CreateTaskRequest = {
  title: 'New Task',
  description: 'Task description',
  priority: TaskPriority.HIGH,
  assignee: 'John Doe',
  dueDate: new Date('2024-12-31'),
  tags: ['urgent', 'frontend']
};

taskService.createTask(newTask).subscribe({
  next: (task) => console.log('Task created:', task),
  error: (error) => console.error('Error:', error)
});
// Automatically navigates to /tasks after success
```

### 3. Updating Tasks
```typescript
const updateRequest: UpdateTaskRequest = {
  id: 123,
  title: 'Updated Title',
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.URGENT
};

taskService.updateTask(updateRequest).subscribe({
  next: (task) => console.log('Task updated:', task),
  error: (error) => console.error('Error:', error)
});
// Automatically navigates to /tasks after success
```

### 4. Deleting Tasks
```typescript
taskService.deleteTask(123).subscribe({
  next: () => console.log('Task deleted'),
  error: (error) => console.error('Error:', error)
});
// Stays on current page after deletion
```

### 5. Filtering Tasks
```typescript
// Set filters
taskService.setFilter({
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
  assignee: 'John Doe',
  searchTerm: 'authentication',
  tags: ['backend', 'security']
});

// Clear filters
taskService.clearFilter();

// Access filtered tasks
taskService.filteredTasks() // Computed signal
```

## Component Integration

### 1. Loading States in Templates
```html
<!-- Global loading -->
<div *ngIf="taskService.loading()">Loading...</div>

<!-- Operation-specific loading -->
<button [disabled]="taskService.isOperationLoading('createTask')">
  {{ taskService.isOperationLoading('createTask') ? 'Creating...' : 'Create Task' }}
</button>

<!-- Refresh button -->
<button [disabled]="taskService.isOperationLoading('loadTasks')">
  {{ taskService.isOperationLoading('loadTasks') ? 'Loading...' : 'Refresh' }}
</button>
```

### 2. Error Handling in Templates
```html
<!-- Error display -->
<div *ngIf="taskService.error()" class="error-message">
  {{ taskService.error() }}
  <button (click)="taskService.clearError()">Dismiss</button>
</div>
```

### 3. Reactive Data Binding
```html
<!-- Tasks list -->
<div *ngFor="let task of taskService.filteredTasks()">
  {{ task.title }}
</div>

<!-- Statistics -->
<div>Total: {{ taskService.taskStats().total }}</div>
<div>In Progress: {{ taskService.taskStats().inProgress }}</div>
```

## HTTP Interceptors

### 1. Error Interceptor
- **Global error logging**
- **Centralized error handling**
- **Automatic error propagation**

### 2. Loading Interceptor
- **Request counting**
- **Global loading state management**
- **Automatic cleanup**

## Configuration

### 1. API Base URL
Update the `apiUrl` in the service:
```typescript
private readonly apiUrl = 'https://your-api-domain.com/api/tasks';
```

### 2. HTTP Headers
Add authentication headers in interceptors:
```typescript
// In a new auth interceptor
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  return next.handle(authReq);
}
```

### 3. Environment Configuration
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// In service
private readonly apiUrl = environment.apiUrl + '/tasks';
```

## Error Handling Best Practices

### 1. User-Friendly Messages
```typescript
// Service automatically provides user-friendly error messages
// based on HTTP status codes
```

### 2. Retry Logic
```typescript
// Add retry logic for failed requests
import { retry } from 'rxjs/operators';

return this.http.get<Task[]>(this.apiUrl).pipe(
  retry(3), // Retry up to 3 times
  catchError(error => this.handleError(error, 'Failed to load tasks'))
);
```

### 3. Offline Handling
```typescript
// Check network status
if (!navigator.onLine) {
  this.setError('You are offline. Please check your connection.');
  return;
}
```

## Testing

### 1. Unit Tests
```typescript
// Mock HTTP client
const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

// Test service methods
it('should load tasks', () => {
  const mockTasks = [{ id: 1, title: 'Test Task' }];
  httpClientSpy.get.and.returnValue(of(mockTasks));
  
  service.loadTasks().subscribe(tasks => {
    expect(tasks).toEqual(mockTasks);
  });
});
```

### 2. Integration Tests
```typescript
// Test with real HTTP calls
it('should create task via API', () => {
  const taskRequest = { title: 'Test', priority: 'high' };
  
  service.createTask(taskRequest).subscribe(task => {
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test');
  });
});
```

## Performance Optimizations

### 1. Caching
```typescript
// Implement caching for frequently accessed data
private cache = new Map<string, any>();

getCachedTasks(): Observable<Task[]> {
  const cacheKey = 'tasks';
  if (this.cache.has(cacheKey)) {
    return of(this.cache.get(cacheKey));
  }
  
  return this.loadTasks().pipe(
    tap(tasks => this.cache.set(cacheKey, tasks))
  );
}
```

### 2. Debouncing
```typescript
// Debounce search requests
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

onSearchChange(searchTerm: string) {
  of(searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(term => {
    this.taskService.setFilter({ searchTerm: term });
  });
}
```

## Security Considerations

### 1. Input Validation
```typescript
// Validate input before sending to API
private validateTaskRequest(request: CreateTaskRequest): boolean {
  return request.title?.trim().length > 0 && 
         request.priority && 
         Object.values(TaskPriority).includes(request.priority);
}
```

### 2. XSS Prevention
```typescript
// Sanitize user input
import { DomSanitizer } from '@angular/platform-browser';

sanitizeInput(input: string): string {
  return this.sanitizer.sanitize(SecurityContext.HTML, input) || '';
}
```

This comprehensive API integration provides a robust foundation for your task management application with proper error handling, loading states, and user experience optimizations.
