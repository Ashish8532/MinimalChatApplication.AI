import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';

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


  selectedMessage: any; // Property to store the selected message
isContextMenuVisible = false;
isEditing: boolean = false;
editedMessageContent: string = '';

  constructor(private messageService: MessageService, private toast: NgToastService) {}

  ngOnInit() {
    if (this.userId) {
      // Fetch the conversation history for the specified user
      this.fetchConversationHistory(this.userId);
    }
  }

  // Method to fetch conversation history based on the userId
  fetchConversationHistory(userId: string) {
    this.messageService.getConversationHistory(userId).subscribe(
      res => {
        this.toast.success({detail:"SUCCESS", summary:res.message, duration:3000});
        this.conversationHistory = res.data.reverse(); // Reverse the order for display
        this.scrollToBottom();
      });
  }

  fetchMoreConversationHistory(userId: string, before: Date) {
    this.isLoadingMoreMessages = true;
    this.messageService.getConversationHistory(userId, before).subscribe(
      res => {
        const olderMessages = res.data.reverse(); // Reverse to maintain chronological order
        this.conversationHistory = olderMessages.concat(this.conversationHistory);
        this.isLoadingMoreMessages = false;
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
    this.messageService.sendMessage(message).subscribe(
      (response) => {
        // Message sent successfully, add it to the conversation history
        this.conversationHistory.push({
          receiverId: this.userId, // Assuming the sender is the current user
          content: this.newMessageContent,
          timestamp: new Date().toISOString() // You can update the timestamp based on your requirements
        });
        // Clear the input box after sending the message
        this.newMessageContent = '';
        this.scrollToBottom();
      },
      (error) => {
        // Handle error when the message fails to send
        console.error('Error sending message:', error);
      }
    );
  }

  // Function to show the context menu
showContextMenu(event: MouseEvent, message: any) {
  event.preventDefault(); // Prevent the default context menu from appearing
  this.selectedMessage = message; // Store the selected message
  this.isContextMenuVisible = true; // Display the context menu
  this.isEditing = true;
  this.positionContextMenu(event.clientX, event.clientY); // Position the menu near the cursor
}

  // Function to hide the context menu
hideContextMenu() {
  this.selectedMessage = null; // Clear the selected message
  this.isContextMenuVisible = false; // Hide the context menu
}

// Function to position the context menu
positionContextMenu(x: number, y: number) {
  // Position the context menu at the specified coordinates (x, y)
  // You can use CSS styles or JavaScript to set the menu's position
  // For example:
  const contextMenu = document.querySelector('.context-menu') as HTMLElement;
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
}
  // Function to edit a message
editMessage(message: any) {
  // Initialize the editedMessageContent with the original message content
  this.selectedMessage = message.content;

  // Display the inline editor and hide the context menu
  this.isContextMenuVisible = false;
}
// Function to accept the edited message
acceptEdit(message: any) {
  debugger
  
  // Make an API request to update the message content on the server
  this.messageService.updateMessage(message.messageId, message.content).subscribe(
    (updatedMessage: any) => {
      // Update the message locally with the updated content
      message.content = updatedMessage.content;
     this.conversationHistory.content = message.content;

      // Exit edit mode
      this.isContextMenuVisible = false;
      this.isEditing = false;
      this.fetchConversationHistory(this.userId);
    },
    (error: any) => {
      // Handle any errors that occurred during the update
      console.error('Error updating message:', error);
      // You can display an error message to the user if needed
    }
  );
}

// Function to cancel the edit and discard changes
cancelEdit() {
  // Simply exit edit mode by hiding the inline editor
  this.isContextMenuVisible = false;
  this.isEditing = false;
}

}
