import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = "https://localhost:44394/api";
  constructor(private http: HttpClient, private router: Router) { }


  register(userObj: any): Observable<any> {
    sessionStorage.setItem('isAuthenticated', 'false');
    return this.http.post<any>(`${this.baseUrl}/register`, userObj);
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

  

  login(loginData: any): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/login`;
    return this.http.post(url, loginData, { headers });
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
