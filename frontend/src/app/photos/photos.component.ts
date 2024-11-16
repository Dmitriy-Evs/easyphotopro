import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-photos',
  template: `
    <h1>Photos Page</h1>
    <p>Browse and select your favorite photos.</p>
  `,
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent { }
