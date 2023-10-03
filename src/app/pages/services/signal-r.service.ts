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

  sendMessage$ = (messageResponse: any) => {
    this.hubConnection.invoke('SendMessage', messageResponse)
      .catch(err => console.error(err));
  }

  receiveMessage$ = (): Observable<any> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveMessage', (messageResponse: any) => {
        observer.next(messageResponse);
      });
    });
  }

  editMessage$ = (messageId: number, content: string) => {
    this.hubConnection.invoke('EditMessage', messageId, content)
      .catch(err => console.error(err));
  }

  receiveEditedMessage$ = (): Observable<{ messageId: number, content: string }> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveEditedMessage', (messageId: number, content: string) => {
        observer.next({ messageId, content });
      });
    });
  }

  deleteMessage$ = (messageId: number) => {
    this.hubConnection.invoke('DeleteMessage', messageId)
      .catch(err => console.error(err));
  }

  receiveDeletedMessage$ = (): Observable<number> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveDeletedMessage', (messageId: number) => {
        observer.next(messageId);
      });
    });
  }
}
