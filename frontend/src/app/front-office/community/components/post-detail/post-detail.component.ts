import { Component, OnInit } from '@angular/core';
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
  newCommentContent = '';
  newCommentImageUrl = '';
  commentImageInputId = 'new-comment-image-input';
  submittingComment = false;

  get userId(): number | undefined {
    return this.auth.getCurrentUser()?.id;
  }

  get isLoggedIn(): boolean {
    return !!this.userId;
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
    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.post = post;
        this.commentService.getTree(id).subscribe({
          next: (comments) => {
            this.comments = comments;
            this.loading = false;
          },
          error: () => {
            this.error = 'Unable to load comments.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Unable to load post.';
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

    const prev = this.post.voteScore;
    this.post.voteScore += value;
    this.postService.vote(this.post.id, 'POST', value, this.userId).subscribe({
      error: () => {
        if (this.post) this.post.voteScore = prev;
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
        this.submittingComment = false;
      },
      error: () => { this.submittingComment = false; }
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
  }

  clearCommentImage(): void {
    this.newCommentImageUrl = '';
  }
}
