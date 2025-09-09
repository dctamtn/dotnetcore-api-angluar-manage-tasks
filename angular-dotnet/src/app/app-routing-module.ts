import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: 'tasks/create',
    loadComponent: () => import('./pages/tasks/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () => import('./pages/tasks/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
