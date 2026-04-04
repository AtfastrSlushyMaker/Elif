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
  @Input() canModerateCommunity = false;
  @Input() acceptedAnswerSelected = false;
  @Output() accept = new EventEmitter<number>();
  @Output() imagePreview = new EventEmitter<string>();

  showReplyForm = false;
  editingComment = false;
  replyContent = '';
  replyImageUrl = '';
  editContent = '';
  editImageUrl = '';
  editError = '';
  replyImageInputId = `reply-image-input-${Math.random().toString(36).slice(2)}`;
  editImageInputId = `edit-image-input-${Math.random().toString(36).slice(2)}`;
  submittingReply = false;
  savingComment = false;
  deletingComment = false;
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

  get canEditComment(): boolean {
    return !!this.userId && this.comment.userId === this.userId;
  }

  get canDeleteComment(): boolean {
    return !!this.userId && (this.comment.userId === this.userId || this.canModerateCommunity);
  }

  get isDeletedComment(): boolean {
    return this.comment.content === '[deleted]';
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

  beginEditComment(): void {
    if (!this.canEditComment || this.isDeletedComment) {
      return;
    }

    this.editingComment = true;
    this.editError = '';
    this.editContent = this.comment.content;
    this.editImageUrl = this.comment.imageUrl || '';
  }

  cancelEditComment(): void {
    if (this.savingComment) {
      return;
    }

    this.editingComment = false;
    this.editError = '';
  }

  saveEditComment(): void {
    if (!this.canEditComment || !this.userId || this.isDeletedComment) {
      return;
    }

    const content = this.editContent.trim();
    if (!content && !this.editImageUrl) {
      this.editError = 'Comment content or image is required.';
      return;
    }

    this.savingComment = true;
    this.editError = '';
    this.commentService.update(this.comment.id, {
      content,
      imageUrl: this.cleanOptional(this.editImageUrl)
    }, this.userId).subscribe({
      next: (updatedComment) => {
        this.comment.content = updatedComment.content;
        this.comment.imageUrl = updatedComment.imageUrl;
        this.comment.acceptedAnswer = updatedComment.acceptedAnswer;
        this.comment.voteScore = updatedComment.voteScore;
        this.comment.userVote = updatedComment.userVote;
        this.editingComment = false;
        this.savingComment = false;
      },
      error: (error) => {
        this.editError = this.readErrorMessage(error, 'Could not save comment changes.');
        this.savingComment = false;
      }
    });
  }

  deleteComment(): void {
    if (!this.canDeleteComment || !this.userId || this.isDeletedComment) {
      return;
    }

    if (!window.confirm('Delete this comment? This action cannot be undone.')) {
      return;
    }

    this.deletingComment = true;
    this.editError = '';
    this.commentService.delete(this.comment.id, this.userId).subscribe({
      next: () => {
        this.comment.content = '[deleted]';
        this.comment.imageUrl = undefined;
        this.comment.acceptedAnswer = false;
        this.editingComment = false;
        this.showReplyForm = false;
        this.deletingComment = false;
      },
      error: (error) => {
        this.editError = this.readErrorMessage(error, 'Could not delete comment.');
        this.deletingComment = false;
      }
    });
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

  onEditImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.editImageUrl = String(reader.result || '');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearEditImage(): void {
    this.editImageUrl = '';
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

  openEditGifPicker(): void {
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

      this.editImageUrl = gif.gifUrl;
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

  private cleanOptional(value: unknown): string | undefined {
    const str = String(value ?? '').trim();
    return str.length ? str : undefined;
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { error?: string } })?.error?.error;
    return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
  }
}
