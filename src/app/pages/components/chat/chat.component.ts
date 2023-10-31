import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';

/**
 * Component for managing chat-related functionality.
 * - Handles user selection, searching conversations, and displaying notifications.
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  selectedUserId: string | null = null; // ID of the selected user
  selectedUserName: string = ''; // Name of the selected user
  statusMessage: string = ''; // Status message of user

  searchQuery: string = ''; // Query for searching conversations
  searchResults: any[] = []; // Search results
  showSearchResult: boolean = false; // Flag to control the visibility of search results

  notificationMessage: string | null = null; // Notification message

  /**
   * Constructor of the ChatComponent class.
   * @param route - An instance of ActivatedRoute to access route parameters.
   * @param router - An instance of Router for navigation.
   * @param messageService - An instance of MessageService for message-related operations.
   * @param toast - An instance of NgToastService for displaying toast notifications.
   */
  constructor(private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private toast: NgToastService) { }


  /**
 * Angular lifecycle hook called after the component has been initialized.
 * - Subscribes to the route parameter to get the selected userId.
 */
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.selectedUserId = params['userId'];
    });
  }


  /**
 * Handles user selection from the UserListComponent.
 * - Sets the selected user's ID, name, and status message.
 * - Navigates to the conversation history route with the user's ID.
 * @param userSelection - An object containing the selected user's ID, name, and status message.
 */
  onUserSelected(userSelection: { userId: string, userName: string, statusMessage: string}) {
    this.selectedUserId = userSelection.userId;
    this.selectedUserName = userSelection.userName;
    this.statusMessage = userSelection.statusMessage;
    this.router.navigate(['/chat/user', userSelection.userId]);
  }


  /**
 * Method triggered when the user initiates a search for conversations.
 * - Calls the message service to search for conversations based on the provided query.
 * - Updates the component's searchResults array with the retrieved data.
 * - Displays a success toast notification with the provided message.
 * - Handles errors by displaying appropriate error messages to the user using toast notifications.
 * - Toast messages include a summary and detailed information.
 */
  onSearch() {
    this.messageService.searchConversations(this.searchQuery).subscribe({
      next: (res) => {
        this.searchResults = res.data;
        this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
        this.showSearchResult = true;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 400 || err.status === 404 || err.status === 500) {
          // Display the error message to the user
          this.toast.error({ detail: "ERROR", summary: err.error.message, duration: 3000 });
        } else {
          this.toast.error({ detail: "ERROR", summary: "Something went wrong while processing the request.", duration: 3000 });
        }
      }
    });
  }


  /**
 * Method called when the user closes the search results.
 * - Hides the search results by setting the showSearchResult flag to false.
 * - Clears the search query to reset the search input.
 * - Clears the searchResults array to remove displayed search results.
 */
  onCloseSearch() {
    this.showSearchResult = false;
    this.searchQuery = '';
    this.searchResults = [];
  }


  /**
 * Displays a notification message to the user.
 * - Sets the notificationMessage property with the provided message.
 * - Optionally, uses a timer to clear the notification after a specified duration.
 * 
 * @param message - The message to be displayed as a notification.
 */
  onShowNotification(message: string) {
    this.notificationMessage = message;
    // Optionally, set a timer to clear the notification after a few seconds
    setTimeout(() => {
      this.notificationMessage = null;
    }, 5000); // 5000 milliseconds (adjust as needed)
  }


  /**
 * Closes the currently displayed notification.
 * - Resets the notificationMessage property to null, hiding the notification.
 */
  onCloseNotification() {
    this.notificationMessage = null;
  }
}
