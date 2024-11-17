import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhotosService } from '../services/photos.service';

@Component({
  standalone: true,
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css'],
  imports: [CommonModule]
})
export class PhotosComponent implements OnInit {
  photos: any[] = [];
  eventId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private photosService: PhotosService
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.queryParamMap.get('eventId'));
    if (this.eventId) {
      this.loadPhotos(this.eventId);
    } else {
      this.error = 'Invalid event ID.';
    }
  }

  loadPhotos(eventId: number) {
    this.loading = true;
    this.error = null;

    this.photosService.getPhotosByEventId(eventId).subscribe({
      next: (data) => {
        this.photos = data; // Сохраняем фотографии
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load photos. Please try again later.';
        this.loading = false;
      }
    });
  }
}
