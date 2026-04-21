
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { NotificationsComponent } from './notifications/notifications.component';


@NgModule({
  declarations: [
    LayoutComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BackOfficeRoutingModule
  ]
})
export class BackOfficeModule {}
