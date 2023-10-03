import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';
import GetToken from 'src/app/shared/helpers/get-token';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = 'https://localhost:44394/api/messages'; 
  private searchApi = 'https://localhost:44394/api/conversation';

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


  getConversationHistory(userId: string, before?: Date, count: number = 20, sort: string = 'desc'): Observable<any> {
    // const headers = GetToken.getHeaders();
    // Create query parameters
    let params = new HttpParams()
      .set('userId', userId)
      .set('count', count)
      .set('sort', sort);

    if (before) {
      params = params.set('before', before.toISOString());
    }
    return this.http.get(`${this.apiUrl}`, { params}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }

  // Send new Message
  sendMessage(message: { receiverId: string, content: string }): Observable<any> {
    // const headers = GetToken.getHeaders();
    return this.http.post(this.apiUrl, message, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }

  // Update an existing message
  updateMessage(messageId: number, newContent: string): Observable<any> {
    const updatedMessage = {
      content: newContent
    };
    // const headers = GetToken.getHeaders();
    const url = `${this.apiUrl}/${messageId}`;
    return this.http.put(url, updatedMessage, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }

  // Delete Message
  deleteMessage(messageId: number): Observable<any> {
    // const headers = GetToken.getHeaders();
    const deleteUrl = `${this.apiUrl}/${messageId}`; 
    return this.http.delete(deleteUrl, {});
  }


  searchConversations(query: string): Observable<any> {
    debugger
    let params = new HttpParams()
      .set('query', query);
    
    // const headers = GetToken.getHeaders();
    const url = `${this.searchApi}/search`;
    return this.http.get(url, { params}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
