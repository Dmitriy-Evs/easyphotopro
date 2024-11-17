import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent {
  latestEvents = [
    { name: 'Summer Wedding', date: '2023-09-12' },
    { name: 'Corporate Meetup', date: '2023-08-25' },
    { name: 'Family Reunion', date: '2023-08-05' }
  ];

  constructor(private router: Router) {}

  onRegisterPhotographer() {
    // Логика для перехода на страницу регистрации фотографа
    this.router.navigate(['/register-photographer']);
  }
}
