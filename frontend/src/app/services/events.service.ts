import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'http://localhost:5000/api/events'; // URL для взаимодействия с API

  constructor(private http: HttpClient) {}

  // Получение всех событий
  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Получение события по ID
  getEventById(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${eventId}`);
  }

   // Метод для создания события
   createEvent(eventData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, eventData);
  }

  // Метод для обновления события
  updateEvent(id: number, eventData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, eventData);
  }

  // Метод для удаления события
  deleteEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  
}
