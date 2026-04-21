import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ServiceService } from '../../../services/service/service.service';
import { BookingService, ServiceBookingDTO } from '../../../services/service/booking.service';
import { AvailabilityService } from '../../../services/service/availabiliy.service';   // ← Chemin corrigé

@Component({
  selector: 'app-form-booking',
  templateUrl: './form-booking.component.html',
  styleUrls: ['./form-booking.component.css']
})
export class FormBookingComponent implements OnInit {

  bookingForm!: FormGroup;
  serviceId!: number;
  service: any = null;
  options: any[] = [];
  availabilities: any[] = [];
  loading = true;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private serviceService: ServiceService,
    private availabilityService: AvailabilityService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('serviceId');
    this.serviceId = idParam ? +idParam : 0;

    if (!this.serviceId || isNaN(this.serviceId)) {
      alert("ID de service invalide");
      this.router.navigate(['/front-office/services']);
      return;
    }

    this.initForm();
    this.loadServiceAndAvailabilities();
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      userId: [1, Validators.required],
      petName: ['', [Validators.required, Validators.minLength(2)]],
      petType: ['', Validators.required],
      petBreed: [''],
      petAge: [1, [Validators.required, Validators.min(0), Validators.max(30)]],
      serviceId: [this.serviceId, Validators.required],
      selectedOptionIds: this.fb.array([]),
      availabilityId: [null, Validators.required],
      status: ['PENDING']
    });
  }

  private loadServiceAndAvailabilities(): void {
    this.loading = true;

    forkJoin({
      service: this.serviceService.findById(this.serviceId),
      availabilities: this.availabilityService.findByServiceId(this.serviceId)
    }).subscribe({
      next: (result) => {
        this.service = result.service;
        this.options = result.service.options || [];
        this.availabilities = result.availabilities.filter((a: any) => a.isAvailable !== false);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement service/disponibilités:', err);
        alert("Impossible de charger le service ou ses créneaux disponibles.");
        this.loading = false;
      }
    });
  }

  onOptionChange(optionId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const formArray = this.bookingForm.get('selectedOptionIds') as FormArray;

    if (checked) {
      formArray.push(new FormControl(optionId));
    } else {
      const index = formArray.controls.findIndex(c => c.value === optionId);
      if (index >= 0) formArray.removeAt(index);
    }
  }

  submitBooking(): void {
    console.log('📋 Valeur du formulaire :', this.bookingForm.value);
    console.log('✅ Form valide ?', this.bookingForm.valid);

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      alert('Veuillez remplir tous les champs obligatoires, surtout le créneau disponible.');
      return;
    }

    const value = this.bookingForm.value;

    const dto: ServiceBookingDTO = {
      userId: value.userId,
      petName: value.petName,
      petType: value.petType,
      petBreed: value.petBreed || '',
      petAge: value.petAge,
      serviceId: value.serviceId,
      selectedOptionIds: value.selectedOptionIds || [],
      availabilityId: value.availabilityId,
      bookingDate: new Date().toISOString(),
      status: 'PENDING'
    };

    console.log('🚀 DTO envoyé :', dto);

    this.bookingService.create(dto).subscribe({
      next: (res) => {
        alert('Réservation créée avec succès !');
        this.router.navigate(['/front-office/services']);
      },
      error: (err) => {
        console.error('Erreur backend :', err);
        alert('Erreur lors de la réservation : ' + (err.error?.message || 'Erreur serveur'));
      }
    });
  }
}