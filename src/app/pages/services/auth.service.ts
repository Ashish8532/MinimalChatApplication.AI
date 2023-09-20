import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;

  private baseUrl: string = "https://localhost:44394/api";
  constructor(private http: HttpClient) { }

  register(userObj: any): Observable<any> {
    debugger
    this.isLoggedIn = false;
    sessionStorage.setItem('isLoggedIn', 'false');
    return this.http.post<any>(`${this.baseUrl}/register`, userObj);
  }
 
  isAuthenticated(): boolean {
    return this.isLoggedIn || sessionStorage.getItem('isLoggedIn') === 'true';
  }
}
