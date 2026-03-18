import { Injectable, inject, OnDestroy, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private injector = inject(Injector);
  
  private readonly API_URL = `${environment.apiUrl}/api/notifications`;
  private readonly HUB_URL = `${environment.apiUrl}/notificationHub`;
  
  private hubConnection?: signalR.HubConnection;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();
  
  private newNotificationSubject = new Subject<Notification>();
  newNotification$ = this.newNotificationSubject.asObservable();

  constructor() {
    // Break circular dependency by using Injector to get AuthService later
    setTimeout(() => {
      const authService = this.injector.get(AuthService);
      authService.currentUser$.subscribe(user => {
        if (user) {
          this.startConnection();
          this.refreshUnreadCount();
        } else {
          this.stopConnection();
          this.unreadCountSubject.next(0);
        }
      });
    }, 0);
  }

  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  private startConnection() {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL, {
        accessTokenFactory: () => this.authService.getToken() || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      this.toastr.info(notification.message, notification.title, {
        positionClass: 'toast-bottom-right',
        progressBar: true,
        timeOut: 5000
      });
      this.newNotificationSubject.next(notification);
      this.refreshUnreadCount();
    });
  }

  private stopConnection() {
    this.hubConnection?.stop();
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API_URL);
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/unread`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/unread-count`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/mark-read/${id}`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  refreshUnreadCount() {
    if (this.authService.isAuthenticated()) {
      this.getUnreadCount().subscribe({
        next: (count) => this.unreadCountSubject.next(count),
        error: (err) => console.error('Error fetching unread count', err)
      });
    }
  }

  ngOnDestroy() {
    this.stopConnection();
  }
}
