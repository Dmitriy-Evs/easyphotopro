import { Routes } from '@angular/router';
import { RegisterPhotographerComponent } from './register-photographer/register-photographer.component';
import { EventsComponent } from './events/events.component'
import { PhotosComponent } from './photos/photos.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventsComponent },
  { path: 'photos', component: PhotosComponent },
  { path: 'register-photographer', component: RegisterPhotographerComponent },
  { path: '**', redirectTo: '/home' }
];