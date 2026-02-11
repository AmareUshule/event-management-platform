import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Event } from '../models/event.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private api = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {


    
  }

  createEvent(data: Event): Observable<Event> {
    return this.http.post<Event>(this.api, data);
  }

  updateEvent(id:number, data:Event): Observable<Event> {
    return this.http.put<Event>(`${this.api}/${id}`, data);
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.api);
  }

  getEventById(id:number): Observable<Event> {
    return this.http.get<Event>(`${this.api}/${id}`);
  }

}
