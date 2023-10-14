import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Service for handling requests related to log history.
 */
@Injectable({
  providedIn: 'root'
})
export class RequestLogService {
  // Base URL for the log-related API endpoint.
  private baseUrl = 'https://localhost:44394/api/log';

  /**
   * Creates an instance of RequestLogService.
   * @param http - The Angular HttpClient for making HTTP requests.
   * @param toast - The NgToastService for displaying toast messages.
   */
  constructor(private http: HttpClient, private toast: NgToastService) { }


  /**
   * Handles API errors by displaying a toast message and rethrowing the error.
   * @param error - The HTTP error response.
   * @returns An Observable that never emits a value.
   */
  private handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    // Check for specific HTTP status codes
    if (error.status === 400 || error.status === 401 || error.status === 404 || error.status === 500) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Something went wrong while processing the request.';
    }
    this.toast.error({ detail: "ERROR", summary: errorMessage, duration: 3000 });
    return throwError(() => error);
  }


  /**
   * Gets logs within a specified time range.
   * @param startTime - The start time for the log query.
   * @param endTime - The end time for the log query.
   * @returns An Observable with the logs or an error.
   */
  getLogs(startTime?: string, endTime?: string): Observable<any> {
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http.get(this.baseUrl, { params }).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
