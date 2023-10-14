import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection: signalR.HubConnection;

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:44394/chatHub', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })  // Replace with your SignalR hub URL
      .configureLogging(LogLevel.Debug)
      .withAutomaticReconnect()
      .build();

    this.startConnection();
  }

  private startConnection = () => {
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  receiveNewMessage$ = (): Observable<any> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveMessage', (messageResponse: any) => {
        observer.next(messageResponse);
      });
    });
  }

  receiveEditedMessage$ = (): Observable<{ messageId: number, content: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveEditedMessage', (messageId: number, content: string) => {
        observer.next({ messageId, content });
      });
    });
  }

  receiveDeletedMessage$ = (): Observable<number> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveDeletedMessage', (messageId: number) => {
        observer.next(messageId);
      });
    });
  }

  receiveUpdatedStatus$ = (): Observable<{ isActive: boolean, receiverId: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('UpdateStatus', (isActive: boolean, receiverId: string) => {
        observer.next({isActive, receiverId});
      });
    });
  }

  receiveUpdatedMessageCount$ = (): Observable<{ messageCount: number, isRead: boolean, userId: string}> => {
    return new Observable(observer => {
      this.hubConnection.on('UpdateMessageCount', (messageCount: number, isRead: boolean, userId: string) => {
        observer.next({ messageCount, isRead, userId});
      });
    });
  }
}
