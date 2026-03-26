import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EventsComponent } from './events.component';
import { EventsRoutingModule } from './events-routing.module';
import { EventListComponent } from './pages/event-list/event-list.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { EventMyRegistrationsComponent } from './pages/event-my-registrations/event-my-registrations.component';
import { EventCreateComponent } from './pages/event-create/event-create.component';

@NgModule({
  declarations: [EventsComponent, EventListComponent, EventDetailComponent, EventMyRegistrationsComponent, EventCreateComponent],
  imports: [
    CommonModule,
    SharedModule,
    EventsRoutingModule
  ]
})
export class EventsModule {}