import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() voted = new EventEmitter<{ value: 1 | -1; postId: number }>();
  selectedImageUrl: string | null = null;

  get authorLabel(): string {
    const name = this.post?.authorName?.trim();
    return name && name.length > 0 ? name : 'Member';
  }

  vote(value: 1 | -1): void {
    this.voted.emit({ value, postId: this.post.id });
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
}
