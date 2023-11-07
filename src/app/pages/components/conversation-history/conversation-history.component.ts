import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SignalRService } from '../../services/signal-r.service';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Message } from '../../models/message';
import { MessageResponse } from '../../models/message-response';
import { ApiResponse } from '../../models/api-response';
import { GifResponse } from '../../models/gif-response';

/**
 * Component for displaying and managing conversation history.
 * - Displays a list of messages exchanged with a specific user.
 * - Allows the user to send new messages, edit, and delete existing messages.
 * - Utilizes real-time updates through SignalR for message-related events.
 */
@Component({
  selector: 'app-conversation-history',
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.css'],
})
export class ConversationHistoryComponent implements OnInit, OnChanges {
  @Input() userId: string = ''; // Input property to receive userId from ChatComponent
  @Input() userName: string = '';
  @Input() statusMessage: string = '';
  conversationHistory: MessageResponse[] = []; // Initialize conversationHistory as an empty array
  isLoadingMoreMessages = false;
  lastScrollTop: number = 0;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  newMessageContent: string = '';

  editForm!: FormGroup;

  selectedMessage: MessageResponse | null = null; // Property to store the selected message
  isContextMenuVisible = false;
  isEditing: boolean = false;
  editedMessageContent: string = '';

  loggedInUserName: string = '';
  loggedUserId: string | undefined;

  IsActive: boolean = false;

  // Emoji picker and select Emoji
  isEmojiPickerVisible: boolean = false;
  selectedEmoji: string = '';

  // Gif Picker and select GIF
  isGifPickerVisible: boolean = false;

  // GIF Preview to send Gif
  isPopupOpen: boolean = false;
  selectedGif: GifResponse | null = null;

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
  constructor(
    private messageService: MessageService,
    private toast: NgToastService,
    private fb: FormBuilder,
    private authService: AuthService,
    private signalRService: SignalRService,
    private router: Router
  ) { }

  /**
   * Initializes the component.
   * - Sets up the form with content field and required validator.
   * - Fetches conversation history for the specified user on component initialization.
   * - Subscribes to the real-time updates for new messages, edited messages, and deleted messages.
   * - Subscribes to real-time updates for the user's status.
   * - Scrolls to the bottom of the conversation.
   */
  ngOnInit() {
    // Set up the form with content field and required validator
    this.editForm = this.fb.group({
      content: ['', Validators.required],
    });

    if (this.userId) {
      // Fetch the conversation history for the specified user
      this.fetchConversationHistory(this.userId);
    }

    /**
     * Subscribes to changes in the user's username through the authService.
     * - Updates the component's loggedInUserName property with the received username.
     *
     * @remarks
     * This subscription allows the component to dynamically reflect any changes in the user's username.
     */
    this.authService.getUsername().subscribe((username) => {
      this.loggedInUserName = username;
    });

    /**
     * Subscribes to changes in the loggedUserId through the AuthService.
     * - Updates the component's loggedUserId property with the received user ID.
     *
     * @remarks
     * This subscription allows the component to dynamically reflect any changes in the logged user's ID.
     */
    this.authService.loggedUserId$.subscribe((userId) => {
      this.loggedUserId = userId;
    });

    /**
     * Subscribes to new message events through SignalR.
     * - Checks if the logged user is the intended receiver of the new message.
     * - Updates the conversation history with the new message if the condition is met.
     * - Scrolls to the bottom of the conversation history.
     *
     * @param data - The data object containing information about the new message.
     */
    this.signalRService.receiveNewMessage$().subscribe((data: MessageResponse) => {
      if (this.loggedUserId === data.receiverId) {
        this.conversationHistory.push(data);
        this.scrollToBottom();
      }
    });

    /**
     * Subscribes to edited message events through SignalR.
     * - Finds the corresponding message in the conversation history based on the received message ID.
     * - Updates the content of the found message with the edited content from the SignalR event.
     *
     * @param data - The data object containing information about the edited message.
     *
     * @remarks
     * This subscription updates the content of a message in the conversation history when an edited
     * message event is received through SignalR. It ensures that the UI reflects real-time changes
     * made to the content of a message.
     */
    this.signalRService.receiveEditedMessage$().subscribe((data: { messageId: number, content: string }) => {
      const editedMessage = this.conversationHistory.find((m: MessageResponse) => m.id === data.messageId);
      if (editedMessage) {
        editedMessage.content = data.content;
      }
    });
    

    /**
     * Subscribes to deleted message events through SignalR.
     * - Filters out the deleted message from the conversation history based on the received message ID.
     *
     * @param messageId - The ID of the deleted message.
     *
     * @remarks
     * This subscription filters out the deleted message from the conversation history when a deleted
     * message event is received through SignalR. It ensures that the UI reflects real-time removal
     * of a message from the conversation history.
     */
    this.signalRService.receiveDeletedMessage$().subscribe((messageId: number) => {
      this.conversationHistory = this.conversationHistory.filter(
        (m: MessageResponse) => m.id !== messageId
      );
    });

    /**
     * Subscribes to updated status events through SignalR.
     * - Updates the `IsActive` property based on the received status information.
     *
     * @param data - The data object containing information about the updated status.
     *
     * @remarks
     * This subscription updates the `IsActive` property when an updated status event is received through SignalR.
     * It ensures that the UI reflects real-time changes in the active status of the user's conversation partner.
     */
    this.signalRService.receiveUpdatedStatus$().subscribe({
      next: (data: { isActive: boolean; receiverId: string }) => {
        if (this.userId === data.receiverId) {
          this.IsActive = data.isActive;
        }
      },
    });


    /**
     * Subscribes to real-time updates for user status message using SignalR.
     * Updates the current user's status message when a change is received.
     * @param data - Data containing user ID and updated status message.
     */
    this.signalRService.receiveStatusMessageUpdate$().subscribe({
      next: (data: { userId: string; statusMessage: string }) => {
        if (this.userId === data.userId) {
          this.statusMessage = data.statusMessage;
        }
      },
    });

    this.scrollToBottom();
  }

  /**
 * Fetches the conversation history for a specific user.
 *
 * - Initiates the retrieval of conversation history by calling the message service.
 * - Updates component properties with the fetched data, including the conversation history and IsActive status.
 * - Scrolls to the bottom to ensure the latest messages are displayed.
 *
 * @param userId - The ID of the user for whom the conversation history is being retrieved.
 *
 * @remarks
 * This method serves to fetch conversation history for a user, update relevant component properties, and ensure
 * that the most recent messages are displayed by scrolling to the bottom.
 */
  fetchConversationHistory(userId: string) {
    this.messageService.getConversationHistory(userId).subscribe({
      next: (res: ApiResponse<MessageResponse[]>) => {
        this.conversationHistory = res.data;
        this.IsActive = res.isActive!;
        this.scrollToBottom();
      },
    });
  }
  /**
   * Fetches additional conversation history for a user.
   * - Initiates a call to the message service to retrieve older messages based on the user ID and timestamp.
   * - Updates component properties with the fetched data, including the conversation history.
   * - Manages loading state and updates the IsActive property based on the API response.
   *
   * @param userId - The ID of the user for whom additional conversation history is being fetched.
   * @param before - The timestamp of the oldest message to fetch more history.
   *
   * @remarks
   * This method handles the process of fetching additional conversation history for a user,
   * updating the component properties, managing loading state, and updating the IsActive property.
   */
  fetchMoreConversationHistory(userId: string, before: string) {
    this.isLoadingMoreMessages = true;
    this.messageService.getConversationHistory(userId, before).subscribe({
      next: (res: ApiResponse<MessageResponse[]>) => {
        const olderMessages = res.data;
        this.conversationHistory = olderMessages.concat(
          this.conversationHistory
        );
        this.isLoadingMoreMessages = false;
        this.IsActive = res.isActive!;
      },
      error: (err) => {
        this.isLoadingMoreMessages = false;
      },
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

    if (
      isScrollingUp &&
      !this.isLoadingMoreMessages &&
      container.scrollTop < 20 &&
      this.conversationHistory.length > 0
    ) {
      const oldestMessageTimestamp = this.conversationHistory[0].timestamp;
      this.fetchMoreConversationHistory(this.userId, oldestMessageTimestamp.toString());
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
   * - Resets the conversation history when userId changes (new user selected).
   * - Fetches the conversation history for the new userId.
   * - Hides the GIF picker and Emoji picker when userId changes.
   *
   * @param changes - The changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.conversationHistory = [];
      this.isGifPickerVisible = false;
      this.isEmojiPickerVisible = false;
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
    const initials = nameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
    return initials;
  }

  /**
 * Sends a new message.
 *
 * - Validates the message content to ensure it is not empty.
 * - Creates a message object with the receiver's ID and content.
 * - Calls the message service to send the message.
 * - Updates the conversation history with the sent message, scrolls to the bottom, and displays a success toast.
 * - Clears the input for new messages after a successful send.
 *
 * @remarks
 * This method handles the process of sending a new message, including content validation, service call,
 * updating the conversation history, scrolling to the bottom, and displaying a success toast. It also manages
 * the UI state by clearing the input for new messages after a successful send.
 */
  sendMessage() {
    if (this.newMessageContent.trim() === '' && !this.selectedGif) {
      return;
    }
    const message: Message = {
      receiverId: this.userId,
      content: this.newMessageContent,
    };

    if (this.selectedGif) {
      message.gifId = this.selectedGif.id;
    }

    this.messageService.sendMessage(message).subscribe({
      next: (res: ApiResponse<MessageResponse>) => {
        const existingMessage = this.conversationHistory.find(
          (m: any) => m.id === res.data.id
        );
        if (!existingMessage) {
          this.conversationHistory.push(res.data);
          this.isEmojiPickerVisible = false;
          this.scrollToBottom();
        }
        this.closePopup();
        this.scrollToBottom();
        this.toast.success({
          detail: 'SUCCESS',
          summary: res.message,
          duration: 3000,
        });
        this.newMessageContent = '';
      },
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
  showContextMenu(event: MouseEvent, message: MessageResponse) {
    event.preventDefault();
    this.selectedMessage = message;
    this.isContextMenuVisible = true;
    this.isEditing = false;
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
 * - Sets the selected message to edit.
 * - Hides the context menu.
 * - Enables the editing mode.
 * - Scrolls to the bottom of the conversation.
 * @param message - The message to be edited.
 */
  editMessageTextBox(message: MessageResponse) {
    this.selectedMessage = message;
    this.isContextMenuVisible = false;
    this.isEditing = true;
  }
  /**
   * Edits the content of a message.
   * - Calls the message service to update the content of the selected message.
   * - Displays a success toast and updates the conversation history with the edited message.
   * - Scrolls to the bottom, hides the context menu, and disables editing mode.
   *
   * @param message - The message to be edited.
   *
   * @remarks
   * This method facilitates the editing of the selected message through the message service,
   * provides visual feedback on success using a toast, and ensures that the conversation history
   * reflects the edited message. Additionally, it manages the UI state by scrolling to the bottom,
   * hiding the context menu, and disabling editing mode after the editing process.
   */
  editMessage(message: MessageResponse) {
    this.messageService.updateMessage(message.id, message.content!).subscribe({
      next: (res: ApiResponse<object>) => {
        this.toast.success({ detail: 'SUCCESS', summary: res.message, duration: 3000, });

        const editedMessage = this.conversationHistory.find(
          (m: any) => m.id === message.id);
        if (editedMessage) {
          editedMessage.content = message.content;
        }
        this.scrollToBottom();
        this.isContextMenuVisible = false;
        this.isEditing = false;
      },
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
    this.isContextMenuVisible = false;
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.deleteMessage(messageId);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your item is safe :)', 'error');
      }
    });
  }

  /**
 * Deletes a message by invoking the `deleteMessage` method from the message service.
 * - Subscribes to the observable returned by the service to handle success and error cases.
 * - Updates the conversation history by removing the deleted message upon successful deletion.
 * - Hides the context menu and editing mode.
 * - Displays success or error messages using Swal (SweetAlert).
 *
 * @param messageId - The ID of the message to be deleted.
 *
 * @remarks
 * This method handles the deletion of a message by filtering it out from the conversation history
 * and providing visual feedback through Swal for success or error cases. It also manages the visibility
 * of the context menu and editing mode during and after the deletion process.
 */
  deleteMessage(messageId: number) {
    this.messageService.deleteMessage(messageId).subscribe({
      next: (res: ApiResponse<object>) => {
        Swal.fire('Deleted!', res.message, 'success');
        this.conversationHistory = this.conversationHistory.filter(
          (m: any) => m.id !== messageId
        );
        this.isContextMenuVisible = false;
        this.isEditing = false;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 404 || err.status === 500) {
          Swal.fire('Error', err.error.message, 'error');
        } else {
          Swal.fire('Error', 'Something went wrong while processing the request.', 'error');
        }
      },
    });
  }

  /**
   * Toggles the visibility of the emoji picker.
   *
   * This function is called when the user clicks a button or icon to open/close
   * the emoji picker. It toggles the visibility of the emoji picker container
   * based on the current state.
   */
  openEmojiPicker() {
    if (this.isGifPickerVisible) {
      this.isGifPickerVisible = false;
    }
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  /**
   * Adds a selected emoji to the message content.
   *
   * When the user selects an emoji from the emoji picker, this function is called.
   * It updates the `newMessageContent` by appending the selected emoji to the end.
   *
   * @param emoji The selected emoji object containing emoji details.
   */
  addEmoji(emoji: any) {
    this.selectedEmoji = emoji.emoji.native;
    this.newMessageContent += this.selectedEmoji;
  }

  /**
   * Toggles the visibility of the GIF picker.
   * Closes the emoji picker if it's open.
   */
  openGifPicker() {
    if (this.isEmojiPickerVisible) {
      this.isEmojiPickerVisible = false;
    }
    this.isGifPickerVisible = !this.isGifPickerVisible;
  }

  /**
   * Closes the GIF selection popup.
   * - Clears the selected GIF and closes the popup.
   */
  closePopup() {
    this.selectedGif = null;
    this.isPopupOpen = false;
  }

  /**
   * Handles the selection of a GIF from the GIF picker.
   * - Sets the selected GIF.
   * - Closes the GIF picker.
   * - Opens the GIF popup for additional options.
   *
   * @param selectedGif - The selected GIF to send.
   */
  onGifSelected(selectedGif: any) {
    this.selectedGif = selectedGif;
    this.isGifPickerVisible = false;
    this.isPopupOpen = true;
  }

  /**
   * Hides the GIF and Emoji pickers.
   * - Closes both the GIF picker and the Emoji picker.
   */
  hideGifAndEmojiContainer() {
    this.isGifPickerVisible = false;
    this.isEmojiPickerVisible = false;
  }
}
