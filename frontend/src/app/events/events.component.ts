import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventsService } from '../services/events.service';

@Component({
  standalone: true,
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
  imports: [CommonModule]
})
export class EventsComponent implements OnInit {
  events: any[] = []; // Массив для хранения событий
  loading = false;
  error: string | null = null;

  constructor(private eventsService: EventsService, private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.error = null;

    this.eventsService.getEvents().subscribe({
      next: (data) => {
        this.events = data; // Сохраняем события
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again later.';
        this.loading = false;
      }
    });
  }

  onSelectEvent(eventId: number) {
    // Переход на страницу фотографий с передачей eventId
    this.router.navigate(['/photos'], { queryParams: { eventId } });
  }
}
