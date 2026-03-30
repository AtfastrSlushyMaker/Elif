import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() voted = new EventEmitter<{ value: 1 | -1; postId: number }>();

  vote(value: 1 | -1): void {
    this.voted.emit({ value, postId: this.post.id });
  }
}
