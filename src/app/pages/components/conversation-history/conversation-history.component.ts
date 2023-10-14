import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SignalRService } from '../../services/signal-r.service';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';

/**
 * Component for displaying and managing conversation history.
 * - Displays a list of messages exchanged with a specific user.
 * - Allows the user to send new messages, edit, and delete existing messages.
 * - Utilizes real-time updates through SignalR for message-related events.
 */
@Component({
  selector: 'app-conversation-history',
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.css']
})
export class ConversationHistoryComponent implements OnInit, OnChanges {
  @Input() userId: string = ''; // Input property to receive userId from ChatComponent
  @Input() userName: string = '';
  conversationHistory: any = []; // Initialize conversationHistory as an empty array
  isLoadingMoreMessages = false;
  lastScrollTop: number = 0;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  newMessageContent: string = '';

  editForm!: FormGroup;

  selectedMessage: any; // Property to store the selected message
  isContextMenuVisible = false;
  isEditing: boolean = false;
  editedMessageContent: string = '';

  loggedInUserName: string = '';

  IsActive: boolean = false;


  /**
   * Constructor of the ConversationHistoryComponent class.
   * - Initializes the component with required services and dependencies.
   * - Creates a form group for editing messages.
   * 
   * @param messageService - An instance of the MessageService for message-related operations.
   * @param toast - An instance of the NgToastService for displaying toast notifications.
   * @param fb - An instance of the FormBuilder for creating and managing forms.
   * @param authService - An instance of the AuthService for user authentication operations.
   * @param signalRService - An instance of the SignalRService for real-time updates.
   */
  constructor(private messageService: MessageService,
    private toast: NgToastService,
    private fb: FormBuilder,
    private authService: AuthService,
    private signalRService: SignalRService) { }


  /**
 * Angular lifecycle hook called after the component has been initialized.
 * - Initializes the edit form and fetches the initial conversation history.
 * - Subscribes to real-time events for new messages, edits, deletions, and status updates.
 * - Scrolls to the bottom to display the latest messages.
 */
  ngOnInit() {
    this.editForm = this.fb.group({
      content: ['', Validators.required] // Add the required validator
    });

    if (this.userId) {
      // Fetch the conversation history for the specified user
      this.fetchConversationHistory(this.userId);
    }

    this.authService.getUsername().subscribe((username) => {
      this.loggedInUserName = username;
    });

    // Subscribe to real-time send
    this.signalRService.receiveNewMessage$().subscribe((data: any) => {
      this.fetchConversationHistory(this.userId);
    });

    // Subscribe to real-time edits
    this.signalRService.receiveEditedMessage$().subscribe((data: any) => {
      this.fetchConversationHistory(this.userId);
    });

    // Subscribe to real-time deletions
    this.signalRService.receiveDeletedMessage$().subscribe((messageId: any) => {
      this.fetchConversationHistory(this.userId);
    });

    this.signalRService.receiveUpdatedStatus$().subscribe({
      next: (data: { isActive: boolean, receiverId: string }) => {
        if (this.userId === data.receiverId) {
          this.IsActive = data.isActive;
        }
      }
    });

    this.scrollToBottom();
  }

  /**
   * Method to fetch conversation history based on the userId.
   * - Calls the message service to retrieve conversation history.
   * - Updates the component properties with the fetched data.
   * - Scrolls to the bottom to display the latest messages.
   * 
   * @param userId - The ID of the user for whom the conversation history is fetched.
   */
  fetchConversationHistory(userId: string) {
    this.messageService.getConversationHistory(userId).subscribe({
      next: (res) => {
        this.conversationHistory = res.data.reverse();
        this.IsActive = res.isActive;
        this.scrollToBottom();
      }
    });
  }


  /**
   * Method to fetch more conversation history.
   * - Calls the message service to retrieve older messages based on the userId and timestamp.
   * - Updates the component properties with the fetched data.
   * - Handles loading state and updates the IsActive property.
   * 
   * @param userId - The ID of the user for whom more conversation history is fetched.
   * @param before - The timestamp of the oldest message to fetch more history.
   */
  fetchMoreConversationHistory(userId: string, before: Date) {
    this.isLoadingMoreMessages = true;
    this.messageService.getConversationHistory(userId, before).subscribe({
      next: (res) => {
        const olderMessages = res.data.reverse(); // Reverse to maintain chronological order
        this.conversationHistory = olderMessages.concat(this.conversationHistory);
        this.isLoadingMoreMessages = false;
        this.IsActive = res.IsActive;
      },
      error: (err) => {
        this.isLoadingMoreMessages = false;
      }
    });
  }


  /**
   * Method to format a timestamp into a human-readable date.
   * 
   * @param timestamp - The timestamp to format.
   * @returns A formatted date string.
   */
  formatDate(timestamp: string | null): string {
    if (timestamp === null) {
      return '';
    }

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(timestamp, 'dd MMMM yyyy') || '';
  }


  /**
   * Method to format a timestamp into a human-readable time.
   * 
   * @param timestamp - The timestamp to format.
   * @returns A formatted time string.
   */
  formatTime(timestamp: string | null): string {
    if (timestamp === null) {
      // Handle the case where timestamp is null
      return '';
    }

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(timestamp, 'shortTime') || '';
  }


  /**
   * Method triggered when the user scrolls in the conversation container.
   * - Checks scroll direction and triggers the fetching of more messages when scrolling up.
   * - Calls the fetchMoreConversationHistory method to load older messages.
   */
  onScroll() {
    const container = this.scrollContainer.nativeElement;
    const isScrollingUp = container.scrollTop < this.lastScrollTop;

    if (isScrollingUp && !this.isLoadingMoreMessages && container.scrollTop < 20 && this.conversationHistory.length > 0) {
      const oldestMessageTimestamp = this.conversationHistory[0].timestamp;
      this.fetchMoreConversationHistory(this.userId, new Date(oldestMessageTimestamp));
    }
    this.lastScrollTop = container.scrollTop;
  }


  /**
   * Method to scroll to the bottom of the conversation container.
   * - Uses a timeout to ensure the scroll is performed after the view is updated.
   */
  scrollToBottom() {
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 0);
  }


  /**
   * Angular lifecycle hook called when input properties change.
   * - Resets the conversation history when the userId changes (new user selected).
   * - Fetches the conversation history for the new userId.
   * 
   * @param changes - The changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    // Reset the conversation history when userId changes (new user selected)
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.conversationHistory = [];
      if (this.userId) {
        this.fetchConversationHistory(this.userId);
      }
    }
  }


  /**
   * Method to get initials from a user's name.
   * - Splits the name into parts, extracts initials, and joins them.
   * 
   * @param name - The name for which initials are generated.
   * @returns Initials of the user's name.
   */
  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }


  /**
 * Method to send a new message.
 * - Validates the message content to ensure it is not empty.
 * - Creates a message object with the receiver's ID and content.
 * - Calls the message service to send the message.
 * - Updates the conversation history, scrolls to the bottom, and displays a success toast.
 * - Clears the input for new messages after a successful send.
 */
  sendMessage() {
    if (this.newMessageContent.trim() === '') {
      // Handle empty message content, show an error message, or disable the send button
      return;
    }
    // Create a message object with the receiver's ID and content
    const message = {
      receiverId: this.userId,
      content: this.newMessageContent
    };

    // Call the message service to send the message
    this.messageService.sendMessage(message).subscribe({
      next: (res) => {
        this.fetchConversationHistory(this.userId);
        this.scrollToBottom();
        this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
        this.newMessageContent = '';
        this.scrollToBottom();
      }
    });
  }


  /**
  * Method to show the context menu for a message.
  * - Prevents the default context menu.
  * - Stores the selected message and displays the context menu.
  * 
  * @param event - The mouse event triggering the context menu.
  * @param message - The selected message.
  */
  showContextMenu(event: MouseEvent, message: any) {
    event.preventDefault();
    this.selectedMessage = message;
    this.isContextMenuVisible = true;
    this.isEditing = false;
    this.scrollToBottom();
  }


  /**
   * Method to hide the context menu.
   * - Resets the selected message and hides the context menu.
   */
  hideContextMenu() {
    this.selectedMessage = null;
    this.isContextMenuVisible = false;
  }


  /**
 * Initiates the editing of a message.
 * - Sets the selected message, hides the context menu, and enables the editing mode.
 * - Scrolls to the bottom of the conversation.
 *
 * @param message - The message to be edited.
 */
  editMessageTextBox(message: any) {
    this.selectedMessage = message;
    this.isContextMenuVisible = false;
    this.isEditing = true;
    this.scrollToBottom();
  }

  /**
 * Edits a message content.
 * - Calls the message service to update the content of the selected message.
 * - Displays a success toast and updates the conversation history.
 * - Scrolls to the bottom, hides the context menu, and disables editing mode.
 *
 * @param message - The message to be edited.
 */
  editMessage(message: any) {
    this.messageService.updateMessage(message.messageId, message.content).subscribe({
      next: (res) => {
        this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });

        this.fetchConversationHistory(this.userId);
        this.scrollToBottom();
        this.isContextMenuVisible = false;
        this.isEditing = false;
      }
    });
  }

  /**
 * Cancels the ongoing message editing.
 * - Hides the context menu and disables the editing mode.
 */
  cancelEdit() {
    this.isContextMenuVisible = false;
    this.isEditing = false;
  }

  /**
 * Confirms the deletion of a message using a Swal (SweetAlert) confirmation dialog.
 * - Displays a warning dialog to confirm the deletion.
 * - Calls the `deleteMessage` method if the user confirms.
 * - Shows success or cancellation messages based on the user's choice.
 * 
 * @param messageId - The ID of the message to be deleted.
 */
  confirmDelete(messageId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.deleteMessage(messageId)
        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your item is safe :)', 'error');
      }
    });
  }

  /**
 * Deletes a message by calling the `deleteMessage` method from the message service.
 * - Subscribes to the observable returned by the service to handle the success and error cases.
 * - Fetches the updated conversation history upon successful deletion.
 * - Hides the context menu and editing mode.
 * - Displays success or error messages using Swal (SweetAlert).
 * 
 * @param messageId - The ID of the message to be deleted.
 */
  deleteMessage(messageId: number) {
    this.messageService.deleteMessage(messageId).subscribe({
      next: (res) => {
        this.fetchConversationHistory(this.userId);
        this.isContextMenuVisible = false;
        this.isEditing = false;
        Swal.fire('Deleted!', res.message, 'success');
      },
      error: (err) => {
        if (err.status === 401 || err.status === 404 || err.status === 500) {
          Swal.fire('Error', err.error.message, 'error');
        } else {
          Swal.fire('Error', 'Something went wrong while processing the request.', 'error');
        }
      }
    });
  }
}
