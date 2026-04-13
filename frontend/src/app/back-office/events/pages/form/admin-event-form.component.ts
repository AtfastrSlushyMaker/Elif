// back-office/events/pages/form/admin-event-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  AdminEventService, 
  AdminCategoryService, 
  AdminAuthService,
  AdminWeatherService 
} from '../../services/admin-api.service';
import { EventCategory, EventDetail } from '../../models/admin-events.models';

@Component({
  selector: 'app-admin-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './admin-event-form.component.html',
  styleUrls: ['./admin-event-form.component.css']
})
export class AdminEventFormComponent implements OnInit {
  form: any = {
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxParticipants: 50,
    coverImageUrl: '',
    categoryId: null
  };
  
  categories: EventCategory[] = [];
  weather: any = null;
  isEdit = false;
  eventId: number | null = null;
  loading = false;
  error = '';
  success = '';

  get minDate(): string {
    return new Date().toISOString().slice(0, 16);
  }
  
  get isValid(): boolean {
    return !!(this.form.title && this.form.description && this.form.location &&
      this.form.startDate && this.form.endDate && this.form.categoryId &&
      this.form.maxParticipants > 0);
  }
  
  get selectedCategory(): EventCategory | null {
    return this.categories.find(c => c.id === this.form.categoryId) ?? null;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: AdminEventService,
    private categoryService: AdminCategoryService,
    private weatherService: AdminWeatherService,
    private auth: AdminAuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.eventId = +id;
      this.loadEvent(this.eventId);
    }
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (c) => this.categories = c,
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadEvent(id: number) {
    this.eventService.getById(id).subscribe({
      next: (e: EventDetail) => {
        this.form = {
          title: e.title,
          description: e.description,
          location: e.location,
          startDate: e.startDate?.slice(0, 16),
          endDate: e.endDate?.slice(0, 16),
          maxParticipants: e.maxParticipants,
          coverImageUrl: e.coverImageUrl,
          categoryId: e.category?.id
        };
      },
      error: (err) => console.error('Error loading event', err)
    });
  }

  // admin-event-form.component.ts

onLocationBlur() {
  if (!this.form.location) return;
  
  // ✅ Vérifier si la date de l'événement est renseignée
  if (!this.form.startDate) {
    this.weather = null;
    return;
  }
  
  const city = this.form.location.split(',').pop()?.trim() || this.form.location;
  const eventDate = new Date(this.form.startDate);
  
  // ✅ Appeler l'API avec la date de l'événement
  this.weatherService.getByCity(city).subscribe({
    next: (w) => this.weather = w,
    error: (err) => console.error('Weather error', err)
  });
}

// Méthode appelée quand la date change
onDateChange() {
  if (this.form.location && this.form.startDate) {
    this.onLocationBlur(); // Recharger la météo avec la nouvelle date
  }
}

  save() {
    if (!this.isValid) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    
    const userId = this.auth.getAdminId();
    
    const obs = this.isEdit && this.eventId
      ? this.eventService.update(this.eventId, this.form, userId)
      : this.eventService.create(this.form, userId);
    
    obs.subscribe({
      next: (e) => {
        this.loading = false;
        this.success = this.isEdit ? 'Event updated successfully!' : 'Event created successfully!';
        setTimeout(() => this.router.navigate(['/admin/events']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'An error occurred. Please try again.';
      }
    });
  }
}