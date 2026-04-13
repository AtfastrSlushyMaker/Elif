// back-office/events/events.module.ts
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './components/events.component/events.component';

@NgModule({
  declarations: [
    EventsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EventsRoutingModule
    // ❌ NE PAS mettre AdminDashboardComponent ici
  ],
  providers: [DatePipe, DecimalPipe]
})
export class EventsModule { }