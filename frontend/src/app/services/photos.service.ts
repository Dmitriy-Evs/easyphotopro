import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {
  private apiUrl = 'http://localhost:5000/api/photos'; // URL для фотографий

  constructor(private http: HttpClient) {}

  // Получение фотографий для определённого события
  getPhotosByEventId(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?eventId=${eventId}`);
  }
}
