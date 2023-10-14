import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Observable } from 'rxjs';

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
  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:44394/chatHub', {
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
   * Observable for receiving new messages in real-time.
   * @returns An observable that emits new messages.
   */
  receiveNewMessage$ = (): Observable<any> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveMessage', (messageResponse: any) => {
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
  receiveUpdatedMessageCount$ = (): Observable<{ messageCount: number, isRead: boolean, userId: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('UpdateMessageCount', (messageCount: number, isRead: boolean, userId: string) => {
        observer.next({ messageCount, isRead, userId });
      });
    });
  }
}
