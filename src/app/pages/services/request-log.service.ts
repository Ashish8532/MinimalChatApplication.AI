import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Log } from '../models/log';
import { ErrorMessages } from 'src/app/shared/constant/toast-message';

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
      errorMessage = ErrorMessages.ServerNotRunning;
    }
    this.toast.error({ detail: "ERROR", summary: errorMessage, duration: 3000 });
    return throwError(() => error);
  }


 /**
 * Retrieves logs within a specified time range.
 * - Accepts optional `startTime` and `endTime` parameters to define the time range for the log query.
 * - Calls the API to fetch logs with the specified time range.
 * - Returns an Observable with the logs or an error in case of failure.
 *
 * @param startTime - The start time for the log query.
 * @param endTime - The end time for the log query.
 * @returns An Observable with the logs or an error.
 */
  getLogs(startTime?: string, endTime?: string): Observable<ApiResponse<Log[]>> {
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http.get<ApiResponse<Log[]>>(this.baseUrl, { params }).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
