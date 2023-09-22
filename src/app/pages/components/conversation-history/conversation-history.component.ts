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
}
