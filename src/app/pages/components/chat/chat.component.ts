import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  selectedUserId: string | null = null; 
  selectedUserName: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

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
}
