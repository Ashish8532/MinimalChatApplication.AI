import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';
import { UserProfile } from '../models/user-profile';
import { ApiResponse } from '../models/api-response';
import { UpdateProfile } from '../models/update-profile';
import { UserChatResponse } from '../models/user-chat-response';

/**
 * Service for managing user-related API calls.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Base URL for the user-related API endpoint.
  private baseUrl: string = "https://localhost:44394/api";
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
 *
 * This function sends an HTTP GET request to fetch the list of users from the API endpoint.
 * It returns an observable of the `ApiResponse` containing an array of `UserChatResponse` data.
 *
 * @returns An observable of the HTTP response with user chat data.
 */
  getUserList(): Observable<ApiResponse<UserChatResponse[]>> {
    const url = `${this.baseUrl}/user`;

    return this.http.get<ApiResponse<UserChatResponse[]>>(url, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
 * Gets the user's profile details.
 *
 * This function sends an HTTP GET request to retrieve the user's profile details from the API.
 * It returns an observable of the `ApiResponse` containing the user's profile information.
 *
 * @returns An observable of the `ApiResponse` containing the user's profile details.
 */
  getProfileDetails(): Observable<ApiResponse<UserProfile>> {
    const profileUrl = `${this.baseUrl}/profile-details`;
    
    return this.http.get<ApiResponse<UserProfile>>(profileUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error))
    );
  }


  /**
 * Updates the user's profile.
 *
 * This function sends an HTTP PUT request to update the user's profile with the provided data.
 * It returns an observable of the `ApiResponse` containing the updated profile information.
 *
 * @param updateProfile - The data for updating the user's profile.
 * @returns An observable of the `ApiResponse` containing the updated profile details.
 */
  updateProfile(updateProfile: UpdateProfile): Observable<ApiResponse<UpdateProfile>> {
    const updateProfileUrl = `${this.baseUrl}/update-profile`;
    
    return this.http.put<ApiResponse<UpdateProfile>>(updateProfileUrl, updateProfile).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error))
    );
  }
}
