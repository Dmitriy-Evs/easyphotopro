import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <h1>Welcome to Home Page</h1>
    <p>This is the main entry point of the application.</p>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent { }
