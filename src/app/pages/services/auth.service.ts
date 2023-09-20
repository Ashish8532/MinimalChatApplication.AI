import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = "https://localhost:44394/api";
  constructor(private http: HttpClient) { }

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

  register(userObj: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userObj);
  }

  login(loginData: any): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/login`;
    return this.http.post<any>(url, loginData, { headers });
  }
}
