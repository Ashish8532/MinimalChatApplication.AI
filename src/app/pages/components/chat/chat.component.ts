import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  selectedUserId: string | null = null; 
  selectedUserName: string = '';

  searchQuery: string = '';
  searchResults: any[] = [];
  showSearchResult: boolean = false;

  constructor(private route: ActivatedRoute, 
    private router: Router,
    private messageService: MessageService,
    private toast: NgToastService) {}

  ngOnInit() {
    // Subscribe to the route parameter to get the selected userId
    this.route.params.subscribe(params => {
      this.selectedUserId = params['userId'];
    });
  }

  // Implement the onUserSelected method to handle user selection from UserListComponent
  onUserSelected(userSelection: { userId: string, userName: string }) {
    // Navigate to the conversation history route with the user's ID
    this.selectedUserId = userSelection.userId;
    this.selectedUserName = userSelection.userName;
    this.router.navigate(['/chat/user', userSelection.userId]);
  }


  onSearch() {
    this.messageService.searchConversations(this.searchQuery).subscribe({
        next: (res) => {
          this.searchResults = res.data;
          this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
          this.showSearchResult = true;
        }
      });
  }

  onCloseSearch() {
    this.showSearchResult = false;
    this.searchQuery = ''; // Clear the search query
    this.searchResults = []; // Clear the search results
  }
}
