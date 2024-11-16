import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.routes').then(m => m.routes) },
  { path: 'events', loadChildren: () => import('./events/events.routes').then(m => m.routes) },
  { path: 'photos', loadChildren: () => import('./photos/photos.routes').then(m => m.routes) },
  { path: '**', redirectTo: '/home' }
];