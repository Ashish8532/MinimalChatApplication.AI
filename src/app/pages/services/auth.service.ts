import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import GetToken from 'src/app/shared/helpers/get-token';
import { TokenApiModel } from 'src/app/shared/models/TokenApiModel';
import { ApiResponse } from '../models/api-response';
import { UserResponse } from '../models/user-response';
import { Register } from '../models/register';
import { TokenResponse } from '../models/token-response';
import { Login } from '../models/login';
import { UserChatResponse } from '../models/user-chat-response';

/**
 * Service for handling communication with the server related to user authentication and user related data.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Base URL for API requests. This URL is used as the prefix for all API endpoint requests.
  private baseUrl: string = 'https://localhost:44394/api';

  // Stores the current user's authentication state. Initialized as null until a user logs in or authenticates.
  user!: SocialUser | null;

  /**
   * BehaviorSubject to manage the current username. Other components or services can subscribe to this subject
   * to receive updates on the username when it changes.
   */
  private usernameSubject = new BehaviorSubject<string>('');

  // BehaviorSubject to manage the current loggedUserId extracted from the token payload.
  private loggedUserIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  // Observable to expose the current loggedUserId to other components.
  loggedUserId$ = this.loggedUserIdSubject.asObservable();

  /**
   * Initializes the AuthService, setting up dependencies such as HTTP client, router, toast service,
   * and social authentication service. Also, subscribes to the authState of the social authentication
   * service to keep track of the user's authentication state.
   * @param http - Angular HTTP client for making HTTP requests.
   * @param router - Angular router service for navigation.
   * @param toast - NgToastService for displaying toast notifications.
   * @param socialAuthService - Angularx Social Login service for social authentication.
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: NgToastService,
    private socialAuthService: SocialAuthService
  ) {
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
    if (
      error.status === 400 ||
      error.status === 401 ||
      error.status === 404 ||
      error.status === 409 ||
      error.status === 500
    ) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Something went wrong while processing the request.';
    }
    this.toast.error({
      detail: 'ERROR',
      summary: errorMessage,
      duration: 3000,
    });
    return throwError(() => error);
  }

  /**
 * Registers a user by sending a POST request to the registration API endpoint.
 * @param registerData - User registration data in the form of a RegisterDto.
 * @returns An observable with the API response containing user registration information.
 */
  register(registerData: Register): Observable<ApiResponse<UserResponse>> {
    sessionStorage.setItem('isAuthenticated', 'false');
    return this.http.post<ApiResponse<UserResponse>>(`${this.baseUrl}/register`, registerData).pipe(
        catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }

  /**
   * Stores the authentication token in local storage and updates the username and loggedUserId subjects.
   * @param tokenValue - The authentication token value.
   *
   * @remarks
   * This method decodes the provided token to extract the username and loggedUserId,
   * updates the local storage with the token, and notifies subscribers about the changes to username and loggedUserId.
   */
  storeToken(tokenValue: string) {
    const decodedToken = GetToken.decodeToken(tokenValue);
    const username = decodedToken.Username;
    const loggedUserId =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
    localStorage.setItem('token', tokenValue);
    this.usernameSubject.next(username);
    this.loggedUserIdSubject.next(loggedUserId);
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
 * Initiates the user login process by sending a POST request to the login API endpoint.
 *
 * @param loginData - User login details, typically including username and password.
 * @returns An observable containing the API response, which includes access and refresh tokens.
 */
  login(loginData: Login): Observable<TokenResponse<UserResponse>> {
    const url = `${this.baseUrl}/login`;
    return this.http.post<TokenResponse<UserResponse>>(url, loginData).pipe(
        catchError((error: HttpErrorResponse) => this.handleApiError(error))
      );
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
 * Initiates the Google sign-in process by sending a POST request to the Google sign-in API endpoint.
 *
 * @param idToken - The Google sign-in ID token.
 * @returns An observable containing the API response, wrapped in a TokenResponse of type UserResponse.
 */
  googleSignIn(idToken: string): Observable<TokenResponse<UserResponse>> {
    const url = `${this.baseUrl}/google-signin?idToken=${idToken}`;
    return this.http.post<TokenResponse<UserResponse>>(url, null).pipe(
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
 * Updates the online status of a user by sending a POST request to the status API endpoint.
 *
 * @returns An observable of type ApiResponse<object> capturing the API response.
 */
  updateUserStatus(): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.baseUrl}/status`, null);
  }
}
