import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';
import { VoteService } from '../../services/vote.service';

@Component({
  selector: 'app-comment-tree',
  templateUrl: './comment-tree.component.html',
  styleUrl: './comment-tree.component.css'
})
export class CommentTreeComponent {
  @Input() comment!: Comment;
  @Input() postId!: number;
  @Input() postOwnerId!: number;
  @Input() postType!: 'DISCUSSION' | 'QUESTION';
  @Input() depth = 0;
  @Input() userId?: number;
  @Output() accept = new EventEmitter<number>();

  showReplyForm = false;
  replyContent = '';
  replyImageUrl = '';
  replyImageInputId = `reply-image-input-${Math.random().toString(36).slice(2)}`;
  submittingReply = false;

  constructor(private voteService: VoteService, private commentService: CommentService, private router: Router) {}

  get canAccept(): boolean {
    return this.postType === 'QUESTION' && this.userId === this.postOwnerId && !this.comment.acceptedAnswer;
  }

  onVote(value: 1 | -1): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const prev = this.comment.voteScore;
    this.comment.voteScore += value;
    this.voteService.vote(this.comment.id, 'COMMENT', value, this.userId).subscribe({
      error: () => (this.comment.voteScore = prev)
    });
  }

  acceptAnswer(): void {
    this.accept.emit(this.comment.id);
  }

  submitReply(): void {
    const content = this.replyContent.trim();
    if ((!content && !this.replyImageUrl) || this.submittingReply) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submittingReply = true;
    const payload: Partial<Comment> = {
      content,
      postId: this.postId,
      parentCommentId: this.comment.id,
      imageUrl: this.replyImageUrl || undefined
    };
    this.commentService.create(this.postId, payload, this.userId).subscribe({
      next: (reply) => {
        reply.replies = reply.replies ?? [];
        this.comment.replies = [...(this.comment.replies ?? []), reply];
        this.replyContent = '';
        this.replyImageUrl = '';
        this.showReplyForm = false;
        this.submittingReply = false;
      },
      error: () => { this.submittingReply = false; }
    });
  }

  onReplyImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.replyImageUrl = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  clearReplyImage(): void {
    this.replyImageUrl = '';
  }
}
