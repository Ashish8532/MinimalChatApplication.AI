import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { SignalRService } from '../../services/signal-r.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnChanges {

  @Input() users: any[] = [];
  @Output() userSelected = new EventEmitter<{ userId: string, userName: string }>();
  selectedUserId: string | null = null;
  previousUserId: string | null = null;
  predefinedColors: string[] = ['red', 'blue', 'orange', 'green', 'purple', 'teal'];

  @Output() showNotification = new EventEmitter<string>();

  constructor(private userService: UserService, 
    private authService: AuthService,
    private router: Router,
    private toast: NgToastService,
    private signalRService: SignalRService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userService.getUserList().subscribe({
      next: (res) => {
        this.toast.success({detail:"SUCCESS", summary:res.message, duration:3000});
        this.users = res.data;
      }
    });

    this.signalRService.receiveUpdatedMessageCount$().subscribe({
      next: (data: { messageCount: number, isRead: boolean, userId: string }) => {
        console.log(data);
        const userToUpdate = this.users.find(user => user.userId === data.userId);
      if (userToUpdate) {
        userToUpdate.messageCount = data.messageCount;
        userToUpdate.isRead = data.isRead;
        this.cdr.detectChanges();
        if(data.messageCount > 0)
        {
          const notificationMessage = `You have ${data.messageCount} unread message from ${userToUpdate.name}`;
          this.showNotification.emit(notificationMessage);
        }
      }
      }
    });
    
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reset the selectedUserId when users change
    if (changes['users']) { // Access 'users' using square brackets
      this.selectedUserId = null;
      this.previousUserId = null;
    }
  }

  onUserClick(userId: string, userName: string) {
    const userSelection = { userId, userName,  };
    this.previousUserId = this.selectedUserId;
    this.selectedUserId = userId; // Set the selected user ID
    this.messageService.updateChatStatus(userId, this.previousUserId!).subscribe(
      (response) => {
        // Handle the API response if needed
        console.log(response);
      },
      (error) => {
        // Handle API error
        console.error(error);
      }
    );
    this.userSelected.emit(userSelection); 
  }

  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }
  
  getRandomColor(index: number): string {
    // Use the index to select a color from the predefined array
    const colorIndex = index % this.predefinedColors.length;
    return this.predefinedColors[colorIndex];
  }
}
