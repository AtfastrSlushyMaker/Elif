import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { Service, ServiceService, CreateServicePayload } from '../../services/service.service';
import { ServiceCategory, ServiceCategoryService } from '../../services/service-category.service';
import { AuthService } from '../../../auth/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.css'
})
export class ServiceFormComponent implements OnInit {
  serviceForm!: FormGroup;
  categories$!: Observable<ServiceCategory[]>;
  isEditMode = false;
  serviceId: number | null = null;
  loading = false;
  saving = false;

  currentUserId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private categoryService: ServiceCategoryService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUserId = this.authService.getCurrentUser()?.id;

    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: [30, [Validators.required, Validators.min(15), Validators.max(480)]],
      status: ['ACTIVE', Validators.required],
      categoryId: [null, Validators.required]
    });

    this.categories$ = this.categoryService.findAll();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.serviceId = +params['id'];
        this.loadService(this.serviceId);
      }
    });
  }

  private loadService(id: number): void {
    this.loading = true;
    this.serviceService.findById(id).subscribe({
      next: (service: Service) => {
        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          status: service.status,
          categoryId: service.category.id
        });
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.notificationService.error('Erreur', 'Erreur lors du chargement du service');
        console.error('Load service error:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.serviceForm.invalid || !this.currentUserId) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;

    const formValue = this.serviceForm.value;
    const payload: CreateServicePayload = {
      ...formValue,
      providerId: this.currentUserId
    };

    const operation = this.isEditMode && this.serviceId
      ? this.serviceService.update(this.serviceId, payload)
      : this.serviceService.create(payload);

    operation.subscribe({
      next: (service: Service) => {
        this.saving = false;
        this.notificationService.success(
          'Succès',
          this.isEditMode ? 'Service modifié avec succès' : 'Service créé avec succès'
        );

        // Redirect after a short delay to show success message
        setTimeout(() => {
          this.router.navigate(['/backoffice/services']);
        }, 1500);
      },
      error: (error: any) => {
        this.saving = false;
        this.notificationService.error(
          'Erreur',
          this.isEditMode ? 'Erreur lors de la modification du service' : 'Erreur lors de la création du service'
        );
        console.error('Save error:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/backoffice/services']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceForm.controls).forEach(key => {
      const control = this.serviceForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.serviceForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${control.errors['minlength'].requiredLength} caractères`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${control.errors['maxlength'].requiredLength} caractères`;
      }
      if (control.errors['min']) {
        return `${this.getFieldLabel(fieldName)} doit être supérieur ou égal à ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${control.errors['max'].max}`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Le nom',
      description: 'La description',
      price: 'Le prix',
      duration: 'La durée',
      status: 'Le statut',
      categoryId: 'La catégorie'
    };
    return labels[fieldName] || fieldName;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}