import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PostCardComponent } from './components/post-card/post-card.component';
import { CommentTreeComponent } from './components/comment-tree/comment-tree.component';
import { VoteButtonsComponent } from './components/vote-buttons/vote-buttons.component';
import { FlairBadgeComponent } from './components/flair-badge/flair-badge.component';

@NgModule({
  declarations: [
    PostCardComponent,
    CommentTreeComponent,
    VoteButtonsComponent,
    FlairBadgeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    PostCardComponent,
    CommentTreeComponent,
    VoteButtonsComponent,
    FlairBadgeComponent
  ]
})
export class CommunitySharedModule {}
