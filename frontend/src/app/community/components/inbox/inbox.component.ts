import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Conversation } from '../../models/message.model';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css'
})
export class InboxComponent implements OnInit {
  conversations: Conversation[] = [];
  loading = true;
  error = '';
  get userId(): number { return this.auth.getCurrentUser()!.id; }

  constructor(private messagingService: MessagingService, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.messagingService.getInbox(this.userId).subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load inbox.';
        this.loading = false;
      }
    });
  }

  open(conversationId: number): void {
    this.router.navigate(['/app/community/chat', conversationId]);
  }
}
