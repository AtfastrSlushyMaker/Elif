import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';

import {
  VirtualSessionService,
  VirtualSessionResponse,
  SessionStatsResponse,
  AttendanceResponse,
  CreateVirtualSessionRequest
} from '../../services/virtual-session.service';

type AdminTab = 'setup' | 'stats';

@Component({
  selector: 'app-admin-virtual-session',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-virtual-session.component.html',
  styleUrls: ['./admin-virtual-session.component.css']
})
export class AdminVirtualSessionComponent implements OnInit, OnChanges {

  @Input({ required: true }) eventId!: number;
  @Input({ required: true }) adminId!: number;

  activeTab: AdminTab = 'setup';

  session: VirtualSessionResponse | null = null;
  stats: SessionStatsResponse | null = null;

  loading = true;
  statsLoading = false;
  creating = false;
  errorMsg = '';
  successMsg = '';

  createForm: CreateVirtualSessionRequest = {
    earlyAccessMinutes: 15,
    attendanceThresholdPercent: 80,
    externalRoomUrl: null
  };

  statsSortField: keyof AttendanceResponse = 'attendancePercent';
  statsSortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private virtualService: VirtualSessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventId'] && !changes['eventId'].firstChange) {
      this.reset();
      this.load();
    }
  }

  private load(): void {
    this.loading = true;
    this.virtualService
      .getSessionForAdmin(this.eventId, this.adminId)
      .pipe(catchError(() => of(null)))
      .subscribe(session => {
        this.session = session;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private reset(): void {
    this.session = null;
    this.stats = null;
    this.errorMsg = '';
    this.successMsg = '';
    this.activeTab = 'setup';
    this.loading = true;
  }

  createSession(): void {
    this.creating = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: CreateVirtualSessionRequest = {
      earlyAccessMinutes: this.createForm.earlyAccessMinutes,
      attendanceThresholdPercent: this.createForm.attendanceThresholdPercent,
      externalRoomUrl: this.createForm.externalRoomUrl?.trim() || null
    };

    this.virtualService.createSession(this.eventId, this.adminId, payload).subscribe({
      next: session => {
        this.session = session;
        this.successMsg = '✅ Virtual session created!';
        this.creating = false;
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Failed to create virtual session.';
        this.creating = false;
        this.cdr.markForCheck();
      }
    });
  }

  switchTab(tab: AdminTab): void {
    this.activeTab = tab;
    if (tab === 'stats' && !this.stats) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.statsLoading = true;
    this.virtualService.getStats(this.eventId, this.adminId).subscribe({
      next: stats => {
        this.stats = stats;
        this.statsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.statsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get sortedParticipants(): AttendanceResponse[] {
    if (!this.stats?.participantDetails) {
      return [];
    }
    return [...this.stats.participantDetails].sort((a, b) => {
      const av = (a as any)[this.statsSortField] ?? 0;
      const bv = (b as any)[this.statsSortField] ?? 0;
      if (av < bv) {
        return this.statsSortDir === 'asc' ? -1 : 1;
      }
      if (av > bv) {
        return this.statsSortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  sortBy(field: keyof AttendanceResponse): void {
    if (this.statsSortField === field) {
      this.statsSortDir = this.statsSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.statsSortField = field;
      this.statsSortDir = 'desc';
    }
  }

  get sessionStatusLabel(): string {
    const labels: Record<string, string> = {
      SCHEDULED: 'Scheduled',
      OPEN: 'Live',
      CLOSED: 'Closed',
      ARCHIVED: 'Archived'
    };
    return labels[this.session?.status ?? ''] ?? '';
  }

  get sessionStatusClass(): string {
    const classes: Record<string, string> = {
      SCHEDULED: 'badge--blue',
      OPEN: 'badge--green',
      CLOSED: 'badge--orange',
      ARCHIVED: 'badge--gray'
    };
    return classes[this.session?.status ?? ''] ?? '';
  }

  // admin-virtual-session.component.ts
getCertificateUrl(userId: number): string {
  // ✅ Utiliser la méthode sans token
  return this.virtualService.getCertificateUrl(this.eventId, userId);
}

  openCertificate(userId: number): void {
    const url = this.getCertificateUrl(userId);
    window.open(url, '_blank');
  }

  attendanceBadgeClass(pct: number | null): string {
    if (pct === null) {
      return 'badge--gray';
    }
    if (pct >= 80) {
      return 'badge--green';
    }
    if (pct >= 50) {
      return 'badge--orange';
    }
    return 'badge--red';
  }

  trackById(_: number, item: AttendanceResponse): number {
    return item.userId;
  }
}