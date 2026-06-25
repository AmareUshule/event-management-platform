import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MediaCategory {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

export interface MediaSubCategory {
  id: string;
  name: string;
  mediaCategoryId: string;
  thumbnailUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);

  private readonly API_URL = `${environment.apiUrl}/api/media-categories`;
  private readonly REQUEST_TIMEOUT = 15000;

  private handleError(error: any): Observable<never> {
    console.error('MediaService Error:', error);
    // Rethrow a more specific error object for the component to handle
    return new Observable(observer => {
      observer.error(error.error || { message: 'An unknown error occurred.' });
      observer.complete();
    });
  }

  // --- Read Operations ---

  getMediaCategories(): Observable<MediaCategory[]> {
    return this.http.get<MediaCategory[]>(this.API_URL).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError)
    );
  }

  getSubCategories(categoryId: string): Observable<MediaSubCategory[]> {
    const url = `${this.API_URL}/${categoryId}/subcategories`;
    return this.http.get<MediaSubCategory[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError)
    );
  }

  // --- Create Operations (Admin) ---

  createCategory(name: string): Observable<MediaCategory> {
    return this.http.post<MediaCategory>(this.API_URL, { name }).pipe(
      catchError(this.handleError)
    );
  }

  createSubCategory(parentId: string, name: string): Observable<MediaSubCategory> {
    const url = `${this.API_URL}/${parentId}/subcategories`;
    return this.http.post<MediaSubCategory>(url, { name }).pipe(
      catchError(this.handleError)
    );
  }

  // --- Update Operations (Admin) ---

  updateCategory(id: string, name: string): Observable<void> {
    const url = `${this.API_URL}/${id}`;
    return this.http.put<void>(url, { name }).pipe(
      catchError(this.handleError)
    );
  }

  updateSubCategory(id: string, name: string): Observable<void> {
    const url = `${this.API_URL}/subcategories/${id}`;
    return this.http.put<void>(url, { name }).pipe(
      catchError(this.handleError)
    );
  }

  // --- Delete Operations (Admin) ---

  deleteCategory(id: string): Observable<void> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  deleteSubCategory(id: string): Observable<void> {
    const url = `${this.API_URL}/subcategories/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }
}
