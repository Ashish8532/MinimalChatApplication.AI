import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import GetToken from 'src/app/shared/helpers/get-token';
import { TokenApiModel } from 'src/app/shared/models/TokenApiModel';

/**
 * Service for handling communication with the server related to user authentication and user related data.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Base URL for API requests. This URL is used as the prefix for all API endpoint requests.
  private baseUrl: string = "https://localhost:44394/api";

  // Stores the current user's authentication state. Initialized as null until a user logs in or authenticates.
  user!: SocialUser | null;

  /**
 * BehaviorSubject to manage the current username. Other components or services can subscribe to this subject
 * to receive updates on the username when it changes.
 */
  private usernameSubject = new BehaviorSubject<string>('');


  /**
 * Initializes the AuthService, setting up dependencies such as HTTP client, router, toast service,
 * and social authentication service. Also, subscribes to the authState of the social authentication
 * service to keep track of the user's authentication state.
 * @param http - Angular HTTP client for making HTTP requests.
 * @param router - Angular router service for navigation.
 * @param toast - NgToastService for displaying toast notifications.
 * @param socialAuthService - Angularx Social Login service for social authentication.
 */
  constructor(private http: HttpClient,
    private router: Router,
    private toast: NgToastService,
    private socialAuthService: SocialAuthService) {
    this.user = null;

    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      this.user = user;
    });
  }


  /**
   * Handles API errors and displays an error toast notification.
   * @param error - The HTTP error response.
   * @returns An observable that emits an error.
   */
  private handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    // Handle different HTTP error statuses and display appropriate error messages
    if (error.status === 400 || error.status === 401 || error.status === 404 || error.status === 409 || error.status === 500) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Something went wrong while processing the request.';
    }
    this.toast.error({ detail: "ERROR", summary: errorMessage, duration: 3000 });
    return throwError(() => error);
  }


  /**
 * Registers a user by sending a POST request to the registration API endpoint.
 * @param userObj - User registration details.
 * @returns An observable with the API response.
 */
  register(userObj: any): Observable<any> {
    sessionStorage.setItem('isAuthenticated', 'false');
    return this.http.post<any>(`${this.baseUrl}/register`, userObj).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
 * Stores the authentication token in local storage and updates the username subject.
 * @param tokenValue - The authentication token value.
 */
  storeToken(tokenValue: string) {
    const decodedToken = GetToken.decodeToken(tokenValue);
    const username = decodedToken.Username;
    localStorage.setItem('token', tokenValue);
    this.usernameSubject.next(username);
  }


  /**
 * Stores the refresh token in local storage.
 * @param tokenValue - The refresh token value.
 */
  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue);
  }


  /**
 * Gets the observable for the username subject.
 * @returns An observable with the username.
 */
  getUsername(): Observable<string> {
    return this.usernameSubject.asObservable();
  }


  /**
 * Logs in a user by sending a POST request to the login API endpoint.
 * @param loginData - User login details.
 * @returns An observable with the API response.
 */
  login(loginData: any): Observable<any> {
    const url = `${this.baseUrl}/login`;
    return this.http.post(url, loginData).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
   * Checks if a user is logged in by verifying the presence of the authentication token.
   * @returns True if the user is logged in; otherwise, false.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }


  /**
 * Logs out the user by clearing local storage and navigating to the login page.
 */
  logOut() {
    localStorage.clear();
    if (this.user) {
      this.socialAuthService.signOut();
      this.user = null;
    }
    this.router.navigate(['login']);
  }


  /**
 * Initiates the Google sign-in process using the Angularx Social Login service.
 */
  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }


  /**
 * Handles the Google sign-in process by sending a POST request to the Google sign-in API endpoint.
 * @param idToken - Google sign-in ID token.
 * @returns An observable with the API response.
 */
  googleSignIn(idToken: string): Observable<any> {
    const url = `${this.baseUrl}/google-signin?idToken=${idToken}`;
    return this.http.post(url, null).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
 * Refreshes the user's access token using the provided token API model.
 * @param tokenApiModel - Token API model containing the access and refresh tokens.
 * @returns An observable with the API response.
 */
  refreshToken(tokenApiModel: TokenApiModel): Observable<any> {
    let params = new HttpParams()
      .set('accessToken', tokenApiModel.accessToken)
      .set('refreshToken', tokenApiModel.refreshToken);
    const url = `${this.baseUrl}/refresh-token`;
    return this.http.post(url, null, { params: params });
  }


  /**
 * Updates the user's online status by sending a POST request to the status API endpoint.
 * @param userId - The ID of the user whose status is being updated.
 * @param previousUserId - The previous ID of the user, if applicable.
 * @returns An observable with the API response.
 */
  updateUserStatus(userId?: string, previousUserId?: string): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId!)
      .set('previousUserId', previousUserId!);
    return this.http.post(`${this.baseUrl}/status`, null, { params: params });
  }
}
