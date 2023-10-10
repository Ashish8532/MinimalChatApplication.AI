import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string = "https://localhost:44394/api/user";
  constructor(private http: HttpClient, private toast: NgToastService) { }

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


  getUserList() {
    return this.http.get<any>(this.baseUrl, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
  
}
