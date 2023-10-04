import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';
import GetToken from 'src/app/shared/helpers/get-token';

@Injectable({
  providedIn: 'root'
})
export class RequestLogService {
  private baseUrl = 'https://localhost:44394/api/log';

  constructor(private http: HttpClient, private toast: NgToastService) {}

  private handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    // Check for specific HTTP status codes
    if (error.status === 400 || error.status === 401 || error.status === 404 || error.status === 500) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Something went wrong while processing the request.';
    }

    // Display toastr error message
    this.toast.error({ detail: "ERROR", summary: errorMessage, duration: 3000 });

    // Rethrow the error
    return throwError(() => error);
  }

  getLogs(startTime?: string, endTime?: string): Observable<any> {
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http.get(this.baseUrl, { params}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
