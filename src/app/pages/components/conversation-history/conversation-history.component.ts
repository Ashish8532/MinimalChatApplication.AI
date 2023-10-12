import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SignalRService } from '../../services/signal-r.service';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';

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

  constructor(private messageService: MessageService,
    private toast: NgToastService,
    private fb: FormBuilder,
    private authService: AuthService,
    private signalRService: SignalRService) { }

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

    this.signalRService.receiveUpdatedStatus$().subscribe((userStatus: boolean) => {
      const conversationToUpdate = this.conversationHistory.find((conversation: { receiverId: string }) => conversation.receiverId === this.userId);

      if (conversationToUpdate) {
        this.IsActive = userStatus;
      }
    });


    this.scrollToBottom();
  }

  // Method to fetch conversation history based on the userId
  fetchConversationHistory(userId: string) {
    this.messageService.getConversationHistory(userId).subscribe({
      next: (res) => {
        this.conversationHistory = res.data.reverse(); 
        this.IsActive = res.isActive;
        this.scrollToBottom();
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
        this.IsActive = res.IsActive;
      },
      error: (err) => {
        this.isLoadingMoreMessages = false;
      }
    });
  }

  formatDate(timestamp: string | null): string {
    if (timestamp === null) {
      // Handle the case where timestamp is null
      return '';
    }

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(timestamp, 'dd MMMM yyyy') || '';
  }

  formatTime(timestamp: string | null): string {
    if (timestamp === null) {
      // Handle the case where timestamp is null
      return '';
    }
  
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(timestamp, 'shortTime') || '';
  }

  
  onScroll() {
    const container = this.scrollContainer.nativeElement;
    const isScrollingUp = container.scrollTop < this.lastScrollTop;

    if (isScrollingUp && !this.isLoadingMoreMessages && container.scrollTop < 20 && this.conversationHistory.length > 0) {
      const oldestMessageTimestamp = this.conversationHistory[0].timestamp;
      this.fetchMoreConversationHistory(this.userId, new Date(oldestMessageTimestamp));
    }
    this.lastScrollTop = container.scrollTop;
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

  cancelEdit() {
    this.isContextMenuVisible = false;
    this.isEditing = false;
  }

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

  // Delete message
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
