import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';
import { GifPickerDialogComponent } from '../gif-picker-dialog/gif-picker-dialog.component';
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
  @Input() acceptedAnswerSelected = false;
  @Output() accept = new EventEmitter<number>();
  @Output() imagePreview = new EventEmitter<string>();

  showReplyForm = false;
  replyContent = '';
  replyImageUrl = '';
  replyImageInputId = `reply-image-input-${Math.random().toString(36).slice(2)}`;
  submittingReply = false;
  replyError = '';

  constructor(
    private voteService: VoteService,
    private commentService: CommentService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  get canAccept(): boolean {
    return this.postType === 'QUESTION'
      && this.userId === this.postOwnerId
      && !this.acceptedAnswerSelected
      && !this.comment.acceptedAnswer;
  }

  get hasReplies(): boolean {
    return (this.comment.replies ?? []).length > 0;
  }

  onVote(value: 1 | -1): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const previousVote = this.comment.userVote ?? null;
    const previousScore = this.comment.voteScore;

    if (previousVote === value) {
      this.comment.userVote = null;
      this.comment.voteScore -= value;
      this.voteService.remove(this.comment.id, 'COMMENT', this.userId).subscribe({
        error: () => this.restoreVote(previousVote, previousScore)
      });
      return;
    }

    this.comment.userVote = value;
    this.comment.voteScore += value - (previousVote ?? 0);
    this.voteService.vote(this.comment.id, 'COMMENT', value, this.userId).subscribe({
      error: () => this.restoreVote(previousVote, previousScore)
    });
  }

  acceptAnswer(): void {
    this.accept.emit(this.comment.id);
  }

  toggleReplyForm(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.showReplyForm = !this.showReplyForm;
    if (!this.showReplyForm) {
      this.replyError = '';
    }
  }

  submitReply(): void {
    const content = this.replyContent.trim();
    if ((!content && !this.replyImageUrl) || this.submittingReply) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submittingReply = true;
    this.replyError = '';
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
      error: (error) => {
        this.replyError = this.readErrorMessage(error, 'Could not post reply.');
        this.submittingReply = false;
      }
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
    input.value = '';
  }

  clearReplyImage(): void {
    this.replyImageUrl = '';
  }

  openGifPicker(): void {
    const dialogRef = this.dialog.open(GifPickerDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      panelClass: 'gif-picker-dialog-panel',
      data: { title: 'Choose a GIF' }
    });

    dialogRef.afterClosed().subscribe((gif) => {
      if (!gif) {
        return;
      }

      this.replyImageUrl = gif.gifUrl;
    });
  }

  previewImage(imageUrl?: string | null): void {
    if (!imageUrl) {
      return;
    }
    this.imagePreview.emit(imageUrl);
  }

  private restoreVote(previousVote: 1 | -1 | null, previousScore: number): void {
    this.comment.userVote = previousVote;
    this.comment.voteScore = previousScore;
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { error?: string } })?.error?.error;
    return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
  }
}
