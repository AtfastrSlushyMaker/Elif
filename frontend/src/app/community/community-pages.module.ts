import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommunitySharedModule } from './community-shared.module';
import { CommunityListComponent } from './components/community-list/community-list.component';
import { CommunityDetailComponent } from './components/community-detail/community-detail.component';
import { CommunityCreateComponent } from './components/community-create/community-create.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PostCreateComponent } from './components/post-create/post-create.component';
import { InboxComponent } from './components/inbox/inbox.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';

@NgModule({
  declarations: [
    CommunityListComponent,
    CommunityDetailComponent,
    CommunityCreateComponent,
    PostDetailComponent,
    PostCreateComponent,
    InboxComponent,
    ChatWindowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommunitySharedModule
  ]
})
export class CommunityPagesModule {}
