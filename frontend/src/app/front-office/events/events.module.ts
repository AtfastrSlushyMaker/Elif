import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsRoutingModule } from './events-routing.module';

// Composants standalone
import { EventsListComponent } from './pages/events-list/events-list.component';

@NgModule({
  imports: [
    CommonModule,
    EventsRoutingModule,
    EventsListComponent,
  ],
})
export class EventsModule {}