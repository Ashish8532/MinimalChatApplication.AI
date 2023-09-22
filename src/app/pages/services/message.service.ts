import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = 'https://localhost:44394/api/messages'; // Replace with your API URL

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

  getConversationHistory(
    userId: string,
    before?: Date,
    count: number = 20,
    sort: string = 'desc'
  ): Observable<any> {
    const headers = this.getHeaders();
    // Create query parameters
    let params = new HttpParams()
      .set('userId', userId)
      .set('count', count)
      .set('sort', sort);

    if (before) {
      params = params.set('before', before.toISOString());
    }

    // Make the API request
    return this.http.get(`${this.apiUrl}`, { params, headers });
  }

  sendMessage(message: { receiverId: string, content: string }): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl, message, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(error.message));
      })
    );
  }
  // Update an existing message
  updateMessage(messageId: number, newContent: string): Observable<any> {
    debugger
    // Prepare the updated message data
    const updatedMessage = {
      content: newContent
    };

    const headers = this.getHeaders();
    // Send a PUT request to update the message content
    const url = `${this.apiUrl}/${messageId}`;
    return this.http.put(url, updatedMessage, { headers });
  }
}
