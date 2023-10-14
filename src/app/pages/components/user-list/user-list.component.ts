import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { SignalRService } from '../../services/signal-r.service';
import { MessageService } from '../../services/message.service';


/**
 * Component representing a list of users.
 * @remarks
 * - Uses the `UserService` to fetch the user list.
 * - Communicates with the `AuthService` for user-related actions.
 * - Utilizes the `SignalRService` for real-time updates.
 * - Handles user selection and updates chat status.
 * - Displays a notification for unread messages.
 */
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnChanges {

  @Input() users: any[] = []; // Input property for the list of users
  @Output() userSelected = new EventEmitter<{ userId: string, userName: string }>(); // Event emitter for user selection
  selectedUserId: string | null = null; // Currently selected user ID
  previousUserId: string | null = null; // Previous selected user ID
  predefinedColors: string[] = ['red', 'blue', 'orange', 'green', 'purple', 'teal']; // Array of predefined colors
  @Output() showNotification = new EventEmitter<string>(); // Event emitter for displaying notifications


  /**
   * Constructor for initializing services and dependencies.
   * @param userService - Instance of the UserService for fetching user data.
   * @param authService - Instance of the AuthService for user-related actions.
   * @param router - Angular router for navigation.
   * @param toast - Service for displaying toast notifications.
   * @param signalRService - Service for real-time communication using SignalR.
   * @param messageService - Service for handling user messages.
   * @param cdr - ChangeDetectorRef for manual change detection.
   */
  constructor(private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toast: NgToastService,
    private signalRService: SignalRService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef) { }


  /**
 * Lifecycle hook called after Angular has initialized the component.
 * - Fetches the user list.
 * - Subscribes to real-time updates for message counts.
 */
  ngOnInit() {
    this.userService.getUserList().subscribe({
      next: (res) => {
        this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
        this.users = res.data;
      }
    });

    this.signalRService.receiveUpdatedMessageCount$().subscribe({
      next: (data: { messageCount: number, isRead: boolean, userId: string }) => {
        const userToUpdate = this.users.find(user => user.userId === data.userId);
        if (userToUpdate) {
          userToUpdate.messageCount = data.messageCount;
          userToUpdate.isRead = data.isRead;
          this.cdr.detectChanges();
          if (data.messageCount > 0) {
            const notificationMessage = `You have ${data.messageCount} unread message from ${userToUpdate.name}`;
            this.showNotification.emit(notificationMessage);
          }
        }
      }
    });

  }


  /**
   * Lifecycle hook called when one or more data-bound input properties change.
   * - Resets the selected user ID when the users list changes.
   * @param changes - Object containing the changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    // Reset the selectedUserId when users change
    if (changes['users']) { // Access 'users' using square brackets
      this.selectedUserId = null;
      this.previousUserId = null;
    }
  }


  /**
   * Handles the click event on a user.
   * - Emits the selected user information.
   * - Updates the chat status and emits a notification if there are unread messages.
   * @param userId - ID of the clicked user.
   * @param userName - Name of the clicked user.
   */
  onUserClick(userId: string, userName: string) {
    const userSelection = { userId, userName, };
    this.previousUserId = this.selectedUserId;
    this.selectedUserId = userId; // Set the selected user ID
    this.messageService.updateChatStatus(userId, this.previousUserId!).subscribe(
      (response) => { });
    this.userSelected.emit(userSelection);
  }


  /**
   * Generates initials from the user's name.
   * @param name - Full name of the user.
   * @returns Initials derived from the name.
   */
  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }


  /**
   * Generates a random color based on the predefined color array.
   * @param index - Index used to select a color from the array.
   * @returns Random color for styling.
   */
  getRandomColor(index: number): string {
    const colorIndex = index % this.predefinedColors.length;
    return this.predefinedColors[colorIndex];
  }
}
