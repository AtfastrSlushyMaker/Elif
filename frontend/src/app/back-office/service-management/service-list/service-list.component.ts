import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { Service, ServiceService } from '../../services/service.service';
import { AuthService } from '../../../auth/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {
  private allServices$ = new BehaviorSubject<Service[]>([]); // on met le tableau dans un BehaviorSubject
  filteredServices$!: Observable<Service[]>;

  searchControl = new FormControl('');
  statusFilter = new FormControl('ALL');
  loading = false;

  currentUserId: number | undefined;

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router, private route: ActivatedRoute
  ) {
    this.currentUserId = this.authService.getCurrentUser()?.id;
  }

  ngOnInit(): void {
    this.loadServices();
    this.setupFilter();
  }

  private loadServices(): void {
    if (!this.currentUserId) {
      this.notificationService.error('Erreur', 'Utilisateur non connecté');
      this.allServices$.next([]);
      return;
    }

    this.loading = true;

    this.serviceService.findByProviderId(this.currentUserId).subscribe({
      next: (services) => {
        this.allServices$.next(services); // on met directement dans le BehaviorSubject
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Erreur', 'Erreur lors du chargement des services');
        console.error('Load services error:', err);
        this.allServices$.next([]);
      }
    });
  }

  private setupFilter(): void {
    this.filteredServices$ = combineLatest([
      this.allServices$,
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.statusFilter.valueChanges.pipe(startWith('ALL'))
    ]).pipe(
      map(([services, searchTerm, statusFilter]): Service[] => {
        return services.filter(service => {
          const matchesSearch =
            !searchTerm ||
            service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;

          return matchesSearch && matchesStatus;
        });
      })
    );
  }

  onCreate(): void {
    this.router.navigate(['/backoffice/services/pick-category']);
  }

  onEdit(service: Service): void {
    this.router.navigate(['/backoffice/services', service.id, 'edit']);
  }

  onDelete(service: Service): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`)) {
      this.loading = true;
      this.serviceService.delete(service.id).subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Service supprimé avec succès');
          this.loadServices(); // recharge la liste
        },
        error: (err) => {
          this.loading = false;
          this.notificationService.error('Erreur', 'Erreur lors de la suppression du service');
          console.error('Delete error:', err);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }
  goToBookings(serviceId: number) {
    this.router.navigate(['service-bookings', serviceId], { relativeTo: this.route });
  }
}