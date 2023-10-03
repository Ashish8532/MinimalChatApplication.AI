import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import GetToken from 'src/app/shared/helpers/get-token';

@Injectable({
  providedIn: 'root'
})
export class RequestLogService {
  private baseUrl = 'https://localhost:44394/api/log';

  constructor(private http: HttpClient) {}

    
  getLogs(startTime?: string, endTime?: string): Observable<any> {
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http.get(this.baseUrl, { params});
  }
}
