import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EventsComponent } from './events.component';
import { EventsRoutingModule } from './events-routing.module';

@NgModule({
  declarations: [EventsComponent],
  imports: [
    CommonModule,
    SharedModule,
    EventsRoutingModule
  ]
})
export class EventsModule {}
