import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { MessageCount } from '../models/message-count';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.development';
import { MessageResponse } from '../models/message-response';

/**
 * Service for managing SignalR connections and receiving real-time updates.
 */
@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  /**
   * SignalR hub connection instance.
   */
  private hubConnection: signalR.HubConnection;

  /**
 * Constructor for SignalRService.
 * Initializes the SignalR hub connection with the specified hub URL and configurations.
 * Starts the SignalR connection.
 */
  constructor(private authService: AuthService) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .configureLogging(LogLevel.Debug)
      .withAutomaticReconnect()
      .build();

    this.startConnection();
  }

  /**
   * Start the SignalR connection.
   */
  private startConnection = () => {
    this.hubConnection
      .start()
      .then(() => { })
      .catch(err => { });
  }

  /**
 * Creates an Observable for receiving new chat messages from the SignalR hub.
 * @returns An Observable that emits incoming chat messages.
 */
  receiveNewMessage$ = (): Observable<MessageResponse> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveMessage', (messageResponse: MessageResponse) => {
        observer.next(messageResponse);
      });
    });
  }

  /**
   * Observable for receiving edited messages in real-time.
   * @returns An observable that emits edited message details.
   */
  receiveEditedMessage$ = (): Observable<{ messageId: number, content: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveEditedMessage', (messageId: number, content: string) => {
        observer.next({ messageId, content });
      });
    });
  }

  /**
   * Observable for receiving deleted messages in real-time.
   * @returns An observable that emits the ID of deleted messages.
   */
  receiveDeletedMessage$ = (): Observable<number> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveDeletedMessage', (messageId: number) => {
        observer.next(messageId);
      });
    });
  }

  /**
   * Observable for receiving updated user status in real-time.
   * @returns An observable that emits updated status details.
   */
  receiveUpdatedStatus$ = (): Observable<{ isActive: boolean, receiverId: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('UpdateStatus', (isActive: boolean, receiverId: string) => {
        observer.next({ isActive, receiverId });
      });
    });
  }

 /**
   * Observable for receiving updated message count in real-time.
   * @returns An observable that emits updated message count details.
   */
 receiveUpdatedMessageCount$ = (): Observable<MessageCount> => {
  return new Observable(observer => {
    this.hubConnection.on('UpdateMessageCount', (messageCount: MessageCount) => {
      observer.next(messageCount);
    });
  });
}


  /**
 * Observable for receiving updated user status message in real-time.
 * @returns An observable that emits updated status message details.
 */
  receiveStatusMessageUpdate$ = (): Observable<{ userId: string, statusMessage: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveStatusMessageUpdate', (userId: string, statusMessage: string) => {
        observer.next({ userId, statusMessage });
      });
    });
  }
}
