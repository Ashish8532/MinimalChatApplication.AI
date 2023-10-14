import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Service for managing user-related API calls.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Base URL for the user-related API endpoint.
  private baseUrl: string = "https://localhost:44394/api/user";
  constructor(private http: HttpClient, private toast: NgToastService) { }


  /**
   * Handles API errors and displays toastr messages.
   * @param error The HTTP error response.
   * @returns An observable that never completes and emits the error.
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
   * Retrieves the list of users from the API.
   * @returns An observable of the HTTP response with user data.
   */
  getUserList() {
    return this.http.get<any>(this.baseUrl, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
