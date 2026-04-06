// front-office/events/pages/my-registrations/my-registrations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { EventService, UserAuthService } from '../../services/event.service';
import {
  EventParticipant,
  WaitlistEntry,
} from '../../models/event.models';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.css'],
})
export class MyRegistrationsComponent implements OnInit {

  registrations: EventParticipant[] = [];
  waitlistEntries: WaitlistEntry[] = [];

  loadingReg = true;
  loadingWait = true;
  cancellingId: number | null = null;

  readonly participantStatusLabels: Record<string, string> = {
    CONFIRMED: '✅ Confirmed',
    PENDING:   '⏳ Pending approval',
    CANCELLED: '🚫 Cancelled',
    ATTENDED:  '🎉 Attended',
  };

  toast: { msg: string; type: 'success' | 'error' | 'info' } | null = null;

  constructor(
    private eventSvc: EventService,
    private auth: UserAuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadAll();
  }

  loadAll(): void {
    const userId = this.auth.getUserId()!;

    this.eventSvc.getMyRegistrations(userId, 0, 50)
      .pipe(finalize(() => (this.loadingReg = false)))
      .subscribe({
        next: (r) => (this.registrations = r.content),
        error: () => {},
      });

    this.eventSvc.getMyWaitlistEntries(userId, 0, 20)
      .pipe(finalize(() => (this.loadingWait = false)))
      .subscribe({
        next: (r) => (this.waitlistEntries = r.content),
        error: () => {},
      });
  }

  cancelRegistration(p: EventParticipant): void {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.cancellingId = p.id;

    this.eventSvc.leaveEvent(p.eventId, userId)
      .pipe(finalize(() => (this.cancellingId = null)))
      .subscribe({
        next: () => {
          this.registrations = this.registrations.filter(r => r.id !== p.id);
          this.showToast('Registration cancelled', 'info');
        },
        error: (err) => this.showToast(err?.error?.message ?? 'Error', 'error'),
      });
  }

  leaveWaitlist(w: WaitlistEntry): void {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.cancellingId = w.id;

    this.eventSvc.leaveWaitlist(w.eventId, userId)
      .pipe(finalize(() => (this.cancellingId = null)))
      .subscribe({
        next: () => {
          this.waitlistEntries = this.waitlistEntries.filter(x => x.id !== w.id);
          this.showToast('Removed from waitlist', 'info');
        },
        error: (err) => this.showToast(err?.error?.message ?? 'Error', 'error'),
      });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toast = { msg, type };
    setTimeout(() => (this.toast = null), 3500);
  }
}