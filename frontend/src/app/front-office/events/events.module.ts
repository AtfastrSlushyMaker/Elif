// src/app/front-office/events/events.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsRoutingModule } from './events-routing.module';

// Composants standalone
import { EventsListComponent } from './pages/events-list/events-list.component';
import { EventDetailComponent } from './pages/detail/event-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EventsRoutingModule,
    EventsListComponent,    // ✅ Composant standalone
    EventDetailComponent,   // ✅ Composant standalone (à ajouter)
  ],
})
export class EventsModule {}