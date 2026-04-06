import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { UploadService } from '../../../../front-office/adoption/services/upload.service';

@Component({
  selector: 'app-shelter-management',
  templateUrl: './shelter-management.component.html',
  styleUrls: ['./shelter-management.component.css']
})
export class ShelterManagementComponent implements OnInit {
  shelters: any[] = [];
  pendingShelters: any[] = [];
  loading = true;
  error: string | null = null;
  submitting = false;

  // Modal edit
  editingShelter: any | null = null;
  editForm: FormGroup;

  // Modal add
  showAddModal = false;
  addForm: FormGroup;
  uploadingAddLogo = false;
  uploadingEditLogo = false;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router,
    private uploadService: UploadService
  ) {
    // Formulaire édition
    this.editForm = this.fb.group({
      name:        ['', Validators.required],
      address:     ['', Validators.required],
      phone:       [''],
      email:       ['', [Validators.required, Validators.email]],
      description: [''],
      logoUrl:     ['']
    });

    // Formulaire ajout
    this.addForm = this.fb.group({
      name:          ['', [Validators.required, Validators.minLength(2)]],
      address:       ['', Validators.required],
      phone:         [''],
      email:         ['', [Validators.required, Validators.email]],
      licenseNumber: [''],
      description:   [''],
      logoUrl:       [''],
      verified:      [false]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getAllShelters().subscribe({
      next: (data) => {
        console.log('Shelters data:', data);
        this.shelters = data;
        this.pendingShelters = data.filter((s: any) => !s.verified);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading shelters';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // ============================================================
  // ADD SHELTER
  // ============================================================

  openAddModal(): void {
    this.showAddModal = true;
    this.addForm.reset({ verified: false });
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.addForm.reset();
    this.submitting = false;
    this.uploadingAddLogo = false;
  }

  submitAddShelter(): void {
    if (this.uploadingAddLogo) {
      return;
    }

    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const shelterData = this.addForm.value;

    this.adminService.createShelter(shelterData).subscribe({
      next: () => {
        alert('✅ Shelter created successfully!');
        this.loadData();
        this.closeAddModal();
      },
      error: (err: any) => {
        alert('Error creating shelter: ' + (err.error?.message || 'Unknown error'));
        console.error(err);
        this.submitting = false;
      }
    });
  }

  // ============================================================
  // APPROVE / REJECT - CORRIGÉ
  // ============================================================

  approveShelter(shelter: any): void {
    // Vérifier si c'est un refuge en attente (userId existe)
    if (shelter.userId) {
      // Appeler l'API pour approuver le refuge
      if (confirm(`Approve shelter "${shelter.name}"? This will activate the shelter.`)) {
        this.adminService.approveShelter(shelter.userId).subscribe({
          next: () => {
            alert('✅ Shelter approved successfully!');
            this.loadData();
          },
          error: (err: any) => {
            alert('Error approving shelter: ' + (err.error?.message || 'Unknown error'));
            console.error(err);
          }
        });
      }
    } else {
      // Si pas de userId, rediriger vers la page de détails
      this.router.navigate(['/admin/adoption/shelters', shelter.id]);
    }
  }

  rejectShelter(shelter: any): void {
    if (confirm(`Reject shelter "${shelter.name}"? This will delete the account.`)) {
      const userId = shelter.userId;
      if (!userId) {
        alert('Cannot find user ID for this shelter');
        return;
      }
      this.adminService.rejectShelter(userId).subscribe({
        next: () => {
          alert('✅ Shelter rejected and deleted!');
          this.loadData();
        },
        error: (err: any) => {
          alert('Error rejecting shelter: ' + (err.error?.message || 'Unknown error'));
          console.error(err);
        }
      });
    }
  }

  // ============================================================
  // EDIT
  // ============================================================

  startEdit(shelter: any): void {
    this.editingShelter = shelter;
    this.editForm.patchValue({
      name:        shelter.name,
      address:     shelter.address,
      phone:       shelter.phone,
      email:       shelter.email,
      description: shelter.description,
      logoUrl:     shelter.logoUrl
    });
  }

  cancelEdit(): void {
    this.editingShelter = null;
    this.editForm.reset();
    this.uploadingEditLogo = false;
  }

  saveEdit(): void {
    if (this.uploadingEditLogo) {
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const updatedShelter = { ...this.editingShelter, ...this.editForm.value };

    this.adminService.updateShelter(this.editingShelter.id, updatedShelter).subscribe({
      next: () => {
        alert('✅ Shelter updated successfully!');
        this.loadData();
        this.cancelEdit();
      },
      error: (err: any) => {
        alert('Error updating shelter: ' + (err.error?.message || 'Unknown error'));
        console.error(err);
      }
    });
  }

  // ============================================================
  // DELETE
  // ============================================================

  deleteShelter(shelter: any): void {
    if (confirm(`Delete shelter "${shelter.name}"? This action cannot be undone.`)) {
      this.adminService.deleteShelter(shelter.id).subscribe({
        next: () => {
          alert('✅ Shelter deleted successfully!');
          this.loadData();
        },
        error: (err: any) => {
          alert('Error deleting shelter: ' + (err.error?.message || 'Unknown error'));
          console.error(err);
        }
      });
    }
  }

  viewShelterDetails(shelter: any): void {
    this.router.navigate(['/admin/adoption/shelters', shelter.id]);
  }

  onAddLogoSelected(event: any): void {
    this.uploadLogo(event, true);
  }

  onEditLogoSelected(event: any): void {
    this.uploadLogo(event, false);
  }

  buildMediaUrl(path: string | undefined): string {
    return path ? this.uploadService.buildMediaUrl(path) : '';
  }

  private uploadLogo(event: any, isAddForm: boolean): void {
    const file: File | null = event?.target?.files?.[0] ?? null;
    if (!file) {
      return;
    }

    if (isAddForm) {
      this.uploadingAddLogo = true;
    } else {
      this.uploadingEditLogo = true;
    }

    this.uploadService.uploadShelterLogo(file).subscribe({
      next: (response) => {
        if (isAddForm) {
          this.addForm.patchValue({ logoUrl: response.url });
          this.uploadingAddLogo = false;
        } else {
          this.editForm.patchValue({ logoUrl: response.url });
          this.uploadingEditLogo = false;
        }
      },
      error: (err: any) => {
        alert('Error uploading logo: ' + (err.error?.message || 'Unknown error'));
        console.error(err);
        if (isAddForm) {
          this.uploadingAddLogo = false;
        } else {
          this.uploadingEditLogo = false;
        }
      }
    });

    event.target.value = '';
  }

  get verifiedShelters(): any[] {
    return this.shelters.filter((s: any) => s.verified);
  }
}
