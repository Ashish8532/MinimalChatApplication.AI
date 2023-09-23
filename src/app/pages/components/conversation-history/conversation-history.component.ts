import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

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
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  newMessageContent: string = '';
  
  editMessageForm!: FormGroup;

  selectedMessage: any; // Property to store the selected message
  isContextMenuVisible = false;
  isEditing: boolean = false;
  editedMessageContent: string = '';

  constructor(private messageService: MessageService, 
    private toast: NgToastService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.editMessageForm = this.fb.group({
      content: ['', [Validators.required]]
    });
    
    if (this.userId) {
      // Fetch the conversation history for the specified user
      this.fetchConversationHistory(this.userId);
    }
  }

  // Method to fetch conversation history based on the userId
  fetchConversationHistory(userId: string) {
    this.messageService.getConversationHistory(userId).subscribe({
      next: (res) => {
        this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
        this.conversationHistory = res.data.reverse(); // Reverse the order for display
        this.scrollToBottom();
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

  fetchMoreConversationHistory(userId: string, before: Date) {
    this.isLoadingMoreMessages = true;
    this.messageService.getConversationHistory(userId, before).subscribe({
      next: (res) => {
        const olderMessages = res.data.reverse(); // Reverse to maintain chronological order
        this.conversationHistory = olderMessages.concat(this.conversationHistory);
        this.isLoadingMoreMessages = false;
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

  onScroll() {
    const container = this.scrollContainer.nativeElement;
    const scrollPosition = container.scrollTop;
    const isNearTop = scrollPosition < 20;

    if (isNearTop && !this.isLoadingMoreMessages) {
      const oldestMessageTimestamp = this.conversationHistory[0].timestamp;
      this.fetchMoreConversationHistory(this.userId, new Date(oldestMessageTimestamp));
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reset the conversation history when userId changes (new user selected)
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.conversationHistory = [];
      if (this.userId) {
        this.fetchConversationHistory(this.userId);
      }
    }
  }

  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }


  sendMessage() {
    debugger
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
        this.conversationHistory.push({
          messageId: res.data.messageId,
          senderId: res.data.senderId,
          receiverId: this.userId, // Assuming the sender is the current user
          content: this.newMessageContent,
          timestamp: res.data.timestamp // You can update the timestamp based on your requirements
        });
        // Clear the input box after sending the message
        this.newMessageContent = '';
        this.scrollToBottom();
      },
      error: (err) => {
        if (err.status === 401 || err.status === 400 || err.status === 500) {
          // Display the error message to the user
          this.toast.error({ detail: "ERROR", summary: err.error.message, duration: 3000 });
        } else {
          this.toast.error({ detail: "ERROR", summary: "Something went wrong while processing the request.", duration: 3000 });
        }
      }
    });
  }

  // Function to show the context menu
  showContextMenu(event: MouseEvent, message: any) {
    event.preventDefault(); // Prevent the default context menu from appearing
    this.selectedMessage = message; // Store the selected message
    this.isContextMenuVisible = true; // Display the context menu
    this.isEditing = false;
    this.scrollToBottom();
  }

  // Function to hide the context menu
  hideContextMenu() {
    this.selectedMessage = null;
    this.isContextMenuVisible = false;
  }


  // Function to edit a message
  editMessageTextBox(message: any) {
    this.selectedMessage = message;
    this.isContextMenuVisible = false;
    this.isEditing = true;
    this.scrollToBottom();
  }
  // Function to accept the edited message
  editMessage(message: any) {
    debugger
    
    this.messageService.updateMessage(message.messageId, message.content).subscribe({
      next: (res) => {
        this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
        this.conversationHistory.push({
          messageId: message.messageId,
          senderId: message.senderId,
          receiverId: this.userId, // Assuming the sender is the current user
          content: message.content,
          timestamp: new Date().toISOString() // You can update the timestamp based on your requirements
        });

        // Exit edit mode
        this.isContextMenuVisible = false;
        this.isEditing = false;
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

  // Function to cancel the edit and discard changes
  cancelEdit() {
    this.isContextMenuVisible = false;
    this.isEditing = false;
  }

  confirmDelete(messageId: number) {
    debugger
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        // User confirmed deletion
        this.deleteMessage(messageId)
        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // User canceled deletion
        Swal.fire('Cancelled', 'Your item is safe :)', 'error');
      }
    });
  }

  deleteMessage(messageId: number)
  {
    debugger
    // Make an API request to delete the message on the server
    this.messageService.deleteMessage(messageId).subscribe({
      next: (res) => {
        // Remove the deleted message from the conversation history
        this.conversationHistory = this.conversationHistory.filter((m: any) => m.messageId !== messageId);
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
