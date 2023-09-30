import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = "https://localhost:44394/api";
  user!: SocialUser | null;
  constructor(private http: HttpClient,
    private router: Router,
    private toast: NgToastService,
    private socialAuthService: SocialAuthService) {
    this.user = null;

    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      this.user = user;
    });
  }


  private handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    // Check for specific HTTP status codes
    if (error.status === 400 || error.status === 401 || error.status === 404 || error.status === 409 || error.status === 500) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Something went wrong while processing the request.';
    }

    // Display toastr error message
    this.toast.error({ detail: "ERROR", summary: errorMessage, duration: 3000 });

    // Rethrow the error
    return throwError(() => error);
  }


  register(userObj: any): Observable<any> {
    sessionStorage.setItem('isAuthenticated', 'false');
    return this.http.post<any>(`${this.baseUrl}/register`, userObj).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue)
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Add JWT token to headers
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Login
  login(loginData: any): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/login`;
    return this.http.post(url, loginData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logOut() {
    localStorage.clear();
    this.user = null;
    this.socialAuthService.signOut();
    this.router.navigate(['login']);
  }

  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  //Google Login
  googleSignIn(idToken: string): Observable<any> {
    const url = `${this.baseUrl}/google-signin?idToken=${idToken}`;
    return this.http.post(url, null).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
