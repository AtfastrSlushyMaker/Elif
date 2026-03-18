import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { UsersComponent } from './users/users.component';
import { CommunityComponent } from './community/community.component';

@NgModule({
  declarations: [
    LayoutComponent,
    UsersComponent,
    CommunityComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    BackOfficeRoutingModule
  ]
})
export class BackOfficeModule {}
