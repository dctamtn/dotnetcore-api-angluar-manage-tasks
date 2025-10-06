## Overview
A modern Angular application for task management with full integration to ASP.NET Core Web API backend.

### Backend Endpoints
| Feature | HTTP Method | Endpoint | Description |
|---------|-------------|----------|-------------|
| **Load Tasks** | GET | `/api/tasks` | Retrieves all tasks with optional status filtering |
| **Load Single Task** | GET | `/api/tasks/{id}` | Gets specific task by ID |
| **Create Task** | POST | `/api/tasks` | Creates a new task |
| **Update Task** | PUT | `/api/tasks/{id}` | Updates existing task |
| **Delete Task** | DELETE | `/api/tasks/{id}` | Removes task from system |
| **Task Statistics** | GET | `/api/tasks/statistics` | Gets task counts and statistics |

### API Configuration
- **Base URL**: `https://localhost:7000/api/tasks`
- **Content Type**: `application/json`
- **CORS**: Configured for cross-origin requests
- **Error Handling**: HTTP status code mapping with user-friendly messages

## Project Structure
```
src/app/
├── components/           # Reusable UI components
│   ├── confirmation-modal/   # Task deletion confirmation
│   └── task-card/           # Individual task display
├── pages/               # Feature pages
│   └── tasks/              # Task management pages
│       ├── task-form/       # Create/Edit task form
│       └── tasks.component  # Task list view
├── services/            # Business logic and API integration
│   ├── task.service.ts     # Main task management service
│   └── confirmation.service # Modal confirmation service
├── models/              # TypeScript interfaces and types
│   └── task.model.ts       # Task data models
├── interceptors/        # HTTP interceptors
│   ├── error.interceptor   # Global error handling
│   └── loading.interceptor # Loading state management
└── app.html             # Main application template

