import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestLogService {
  private baseUrl = 'https://localhost:44394/api/log';

  constructor(private http: HttpClient) {}

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
  
  getLogs(startTime?: string, endTime?: string): Observable<any> {
    debugger
    const headers = this.getHeaders();
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http.get(this.baseUrl, { params, headers });
  }
}
