import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, throwError } from 'rxjs';


/**
 * Service for handling communication with the server related to messages and conversations.
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // Base URL for message-related API endpoints
  private apiUrl = 'https://localhost:44394/api/messages';

  // Base URL for conversation search API endpoint
  private searchApi = 'https://localhost:44394/api/conversation';


  /**
 * Creates an instance of the MessageService.
 * @param http - The Angular HttpClient for making HTTP requests.
 * @param toast - The NgToastService for displaying toast messages.
 */
  constructor(private http: HttpClient, private toast: NgToastService) { }


  /**
   * Handles API errors and displays Toastr error messages.
   * @param error - The HTTP error response.
   * @returns An observable with an error.
   */
  private handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    // Check for specific HTTP status codes
    if (error.status === 400 || error.status === 401 || error.status === 404 || error.status === 500) {
      errorMessage = error.error.message;
    } else {
      errorMessage = 'Something went wrong while processing the request.';
    }
    this.toast.error({ detail: "ERROR", summary: errorMessage, duration: 3000 });
    return throwError(() => error);
  }


  /**
   * Retrieves conversation history for a user.
   * @param userId - The ID of the user.
   * @param before - Date indicating the starting point for the history.
   * @param count - The number of messages to retrieve (default: 20).
   * @param sort - Sort order for messages (default: 'desc').
   * @returns An observable with the conversation history.
   */
  getConversationHistory(userId: string, before?: Date, count: number = 20, sort: string = 'desc'): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId)
      .set('count', count)
      .set('sort', sort);

    if (before) {
      params = params.set('before', before.toISOString());
    }
    return this.http.get(`${this.apiUrl}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
   * Sends a new message.
   * @param message - The message object with receiverId and content.
   * @returns An observable indicating the success of the operation.
   */
  sendMessage(message: { receiverId: string, content: string }): Observable<any> {
    return this.http.post(this.apiUrl, message, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
  * Updates an existing message.
  * @param messageId - The ID of the message to update.
  * @param newContent - The new content for the message.
  * @returns An observable indicating the success of the operation.
  */
  updateMessage(messageId: number, newContent: string): Observable<any> {
    const updatedMessage = {
      content: newContent
    };
    const url = `${this.apiUrl}/${messageId}`;
    return this.http.put(url, updatedMessage, {}).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
   * Deletes a message.
   * @param messageId - The ID of the message to delete.
   * @returns An observable indicating the success of the operation.
   */
  deleteMessage(messageId: number): Observable<any> {
    const deleteUrl = `${this.apiUrl}/${messageId}`;
    return this.http.delete(deleteUrl, {});
  }


  /**
   * Searches for conversations based on a query.
   * @param query - The search query.
   * @returns An observable with search results.
   */
  searchConversations(query: string): Observable<any> {
    let params = new HttpParams()
      .set('query', query);

    const url = `${this.searchApi}/search`;
    return this.http.get(url, { params }).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }


  /**
   * Updates the chat status for the current and previous users.
   * @param currentUserId - The ID of the current user.
   * @param previousUserId - The ID of the previous user (optional).
   * @returns An observable indicating the success of the operation.
   */
  updateChatStatus(currentUserId: string, previousUserId?: string): Observable<any> {
    let params = new HttpParams()
      .set('currentUserId', currentUserId)
      .set('previousUserId', previousUserId!);

    return this.http.post(`${this.apiUrl}/chat-status`, null, { params: params }).pipe(
      catchError((error: HttpErrorResponse) => this.handleApiError(error)));
  }
}
