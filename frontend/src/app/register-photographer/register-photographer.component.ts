import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-photographer',
  templateUrl: './register-photographer.component.html',
  styleUrls: ['./register-photographer.component.css'],
  imports: [CommonModule]
})
export class RegisterPhotographerComponent {
  constructor(private authService: AuthService) {}

  registerUser() {
    const userData = { username: 'newuser', password: 'securepassword' }; // Пример данных
    this.authService.registerUser(userData).subscribe({
      next: (response) => {
        console.log('User registered successfully:', response);
      },
      error: (err) => {
        console.error('Error during registration:', err); // Обработка ошибок
      }
    });
  }
}
