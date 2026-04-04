import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Comment } from '../../models/comment.model';
import { Post } from '../../models/post.model';
import { CommentService } from '../../services/comment.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post?: Post;
  comments: Comment[] = [];
  loading = true;
  error = '';
  commentError = '';
  showCommentComposer = false;
  newCommentContent = '';
  newCommentImageUrl = '';
  commentImageInputId = 'new-comment-image-input';
  submittingComment = false;
  selectedImageUrl: string | null = null;

  get userId(): number | undefined {
    return this.auth.getCurrentUser()?.id;
  }

  get isLoggedIn(): boolean {
    return !!this.userId;
  }

  get totalCommentCount(): number {
    return this.countComments(this.comments);
  }

  get hasAcceptedAnswer(): boolean {
    return this.comments.some((comment) => this.commentHasAcceptedAnswer(comment));
  }

  get postAuthorLabel(): string {
    if (!this.post) return 'Unknown author';
    const name = this.post.authorName?.trim();
    return name && name.length > 0 ? name : 'Member';
  }

  get latestActivityAt(): string | undefined {
    const latestComment = this.getLatestCommentDate(this.comments);
    if (!latestComment) {
      return this.post?.updatedAt || this.post?.createdAt;
    }

    const postUpdated = this.post?.updatedAt;
    if (!postUpdated) {
      return latestComment;
    }

    return new Date(latestComment).getTime() > new Date(postUpdated).getTime()
      ? latestComment
      : postUpdated;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Post not found.';
      this.loading = false;
      return;
    }

    this.postService.getPost(id, this.userId).subscribe({
      next: (post) => {
        this.post = post;
        this.loadComments(id);
      },
      error: (error) => {
        this.error = this.readErrorMessage(error, 'Unable to load post.');
        this.loading = false;
      }
    });
  }

  onPostVote(value: 1 | -1): void {
    if (!this.post) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const previousVote = this.post.userVote ?? null;
    const previousScore = this.post.voteScore;

    if (previousVote === value) {
      this.post.userVote = null;
      this.post.voteScore -= value;
      this.postService.removeVote(this.post.id, 'POST', this.userId).subscribe({
        error: () => this.restorePostVote(previousVote, previousScore)
      });
      return;
    }

    this.post.userVote = value;
    this.post.voteScore += value - (previousVote ?? 0);
    this.postService.vote(this.post.id, 'POST', value, this.userId).subscribe({
      error: () => this.restorePostVote(previousVote, previousScore)
    });
  }

  onAcceptAnswer(commentId: number): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const previousAcceptedIds = this.collectAcceptedIds(this.comments);
    this.setAcceptedComment(this.comments, commentId);

    this.commentService.accept(commentId, this.userId).subscribe({
      error: (error) => {
        this.restoreAcceptedComments(this.comments, previousAcceptedIds);
        this.commentError = this.readErrorMessage(error, 'Unable to mark the accepted answer.');
      }
    });
  }

  submitComment(): void {
    const content = this.newCommentContent.trim();
    if (!this.post || (!content && !this.newCommentImageUrl)) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submittingComment = true;
    this.commentError = '';
    const payload: Partial<Comment> = {
      content,
      postId: this.post.id,
      imageUrl: this.newCommentImageUrl || undefined
    };
    this.commentService.create(this.post.id, payload, this.userId).subscribe({
      next: (comment) => {
        comment.replies = comment.replies ?? [];
        this.comments = [...this.comments, comment];
        this.newCommentContent = '';
        this.newCommentImageUrl = '';
        this.showCommentComposer = false;
        this.submittingComment = false;
      },
      error: (error) => {
        this.commentError = this.readErrorMessage(error, 'Could not post comment.');
        this.submittingComment = false;
      }
    });
  }

  onCommentImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.newCommentImageUrl = String(reader.result || '');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearCommentImage(): void {
    this.newCommentImageUrl = '';
  }

  openImageModal(imageUrl?: string | null): void {
    if (!imageUrl) {
      return;
    }
    this.selectedImageUrl = imageUrl;
  }

  closeImageModal(): void {
    this.selectedImageUrl = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeImageModal();
  }

  openCommentComposer(): void {
    this.showCommentComposer = true;
  }

  closeCommentComposer(): void {
    if (this.submittingComment) {
      return;
    }
    this.showCommentComposer = false;
    this.newCommentContent = '';
    this.newCommentImageUrl = '';
    this.commentError = '';
  }

  private loadComments(postId: number): void {
    this.commentService.getTree(postId, this.userId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loading = false;
      },
      error: (error) => {
        this.error = this.readErrorMessage(error, 'Unable to load comments.');
        this.loading = false;
      }
    });
  }

  private restorePostVote(previousVote: 1 | -1 | null, previousScore: number): void {
    if (!this.post) return;
    this.post.userVote = previousVote;
    this.post.voteScore = previousScore;
  }

  private countComments(comments: Comment[]): number {
    return comments.reduce((count, comment) => count + 1 + this.countComments(comment.replies ?? []), 0);
  }

  private getLatestCommentDate(comments: Comment[]): string | undefined {
    let latest: string | undefined;

    const visit = (items: Comment[]): void => {
      items.forEach((comment) => {
        if (!latest || new Date(comment.createdAt).getTime() > new Date(latest).getTime()) {
          latest = comment.createdAt;
        }
        if (comment.replies?.length) {
          visit(comment.replies);
        }
      });
    };

    visit(comments);
    return latest;
  }

  private commentHasAcceptedAnswer(comment: Comment): boolean {
    if (comment.acceptedAnswer) {
      return true;
    }

    return (comment.replies ?? []).some((reply) => this.commentHasAcceptedAnswer(reply));
  }

  private collectAcceptedIds(comments: Comment[], ids: number[] = []): number[] {
    comments.forEach((comment) => {
      if (comment.acceptedAnswer) {
        ids.push(comment.id);
      }
      this.collectAcceptedIds(comment.replies ?? [], ids);
    });

    return ids;
  }

  private setAcceptedComment(comments: Comment[], commentId: number): void {
    comments.forEach((comment) => {
      comment.acceptedAnswer = comment.id === commentId;
      this.setAcceptedComment(comment.replies ?? [], commentId);
    });
  }

  private restoreAcceptedComments(comments: Comment[], acceptedIds: number[]): void {
    const acceptedSet = new Set(acceptedIds);
    comments.forEach((comment) => {
      comment.acceptedAnswer = acceptedSet.has(comment.id);
      this.restoreAcceptedComments(comment.replies ?? [], acceptedIds);
    });
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { error?: string } })?.error?.error;
    return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
  }
}
