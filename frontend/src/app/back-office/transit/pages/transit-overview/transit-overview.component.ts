import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  ArcElement,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { finalize } from 'rxjs';
import { TransitStatisticsService } from '../../services/transit-statistics.service';
import { TransitDashboardModel } from '../../models/transit-dashboard.model';
import { TransitExportService } from '../../services/transit-export.service';

Chart.register(
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

/**
 * Transit Overview Dashboard — standalone component.
 * Reuses the same visual primitives (bo-kpi-card, bo-section-card, etc.)
 * as the Community Overview for guaranteed design parity.
 */
@Component({
  selector: 'app-transit-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transit-overview.component.html',
  styleUrls: ['./transit-overview.component.scss']
})
export class TransitOverviewComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  stats: TransitDashboardModel | null = null;
  loading = true;
  error: string | null = null;
  exportingOverviewPdf = false;
  exportingOverviewExcel = false;

  private barChart: any = null;
  private doughnutChart: any = null;

  constructor(
    private readonly statsService: TransitStatisticsService,
    private readonly transitExportService: TransitExportService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    if (this.stats) {
      this.drawCharts();
    }
  }

  ngOnDestroy(): void {
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
      this.doughnutChart = null;
    }
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    this.statsService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        // Draw after next tick so that *ngIf reveals the canvas
        setTimeout(() => this.drawCharts(), 50);
      },
      error: (err) => {
        console.error('[TransitOverview] Failed to load stats', err);
        this.error = 'Could not load dashboard statistics. Please try again.';
        this.loading = false;
      }
    });
  }

  // ── Formatting helpers ────────────────────────────────────────────────────

  get destinationPublishedPct(): number {
    if (!this.stats || this.stats.totalDestinations === 0) return 0;
    return Math.round((this.stats.publishedDestinations / this.stats.totalDestinations) * 100);
  }

  get feedbackResolutionPct(): number {
    if (!this.stats || this.stats.totalFeedback === 0) return 0;
    return Math.round((this.stats.resolvedFeedback / this.stats.totalFeedback) * 100);
  }

  exportOverviewPdf(): void {
    if (this.exportingOverviewPdf) {
      return;
    }

    this.exportingOverviewPdf = true;
    this.transitExportService
      .exportOverviewPdf()
      .pipe(finalize(() => (this.exportingOverviewPdf = false)))
      .subscribe({
        error: (err) => {
          console.error('[TransitOverview] Failed to export overview PDF', err);
          this.error = 'Could not export overview PDF. Please try again.';
        }
      });
  }

  exportOverviewExcel(): void {
    if (this.exportingOverviewExcel) {
      return;
    }

    this.exportingOverviewExcel = true;
    this.transitExportService
      .exportOverviewExcel()
      .pipe(finalize(() => (this.exportingOverviewExcel = false)))
      .subscribe({
        error: (err) => {
          console.error('[TransitOverview] Failed to export overview Excel', err);
          this.error = 'Could not export overview Excel. Please try again.';
        }
      });
  }

  // ── Charts ────────────────────────────────────────────────────────────────

  private drawCharts(): void {
    if (!this.stats) return;
    this.drawBarChart();
    this.drawDoughnutChart();
  }

  private drawBarChart(): void {
    if (!this.barChartCanvas) return;
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.barChart) this.barChart.destroy();

    const s = this.stats!;
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Submitted', 'In Preparation', 'Approved', 'Rejected', 'Completed'],
        datasets: [{
          label: 'Travel Plans',
          data: [
            s.submittedPlans,
            s.inPreparationPlans,
            s.approvedPlans,
            s.rejectedPlans,
            s.completedPlans
          ],
          backgroundColor: [
            'rgba(58, 146, 130, 0.82)',
            'rgba(248, 154, 63, 0.82)',
            'rgba(58, 146, 130, 0.92)',
            'rgba(214, 73, 86, 0.78)',
            'rgba(47, 159, 141, 0.92)'
          ],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1b3145',
            titleColor: '#a8c0d0',
            bodyColor: '#ffffff',
            padding: 12,
            cornerRadius: 10
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b8396', font: { size: 12, weight: 'bold' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(203, 213, 225, 0.35)' },
            ticks: { color: '#6b8396', precision: 0 }
          }
        }
      }
    });
  }

  private drawDoughnutChart(): void {
    if (!this.doughnutCanvas) return;
    const ctx = this.doughnutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.doughnutChart) this.doughnutChart.destroy();

    const s = this.stats!;
    this.doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Published', 'Scheduled', 'Draft', 'Archived'],
        datasets: [{
          data: [
            s.publishedDestinations,
            s.scheduledDestinations,
            s.draftDestinations,
            s.archivedDestinations
          ],
          backgroundColor: [
            '#3a9282',
            '#f89a3f',
            '#688096',
            '#b0c4d4'
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#355066',
              font: { size: 12, weight: 'bold' },
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10
            }
          },
          tooltip: {
            backgroundColor: '#1b3145',
            titleColor: '#a8c0d0',
            bodyColor: '#ffffff',
            padding: 12,
            cornerRadius: 10
          }
        }
      }
    });
  }
}
