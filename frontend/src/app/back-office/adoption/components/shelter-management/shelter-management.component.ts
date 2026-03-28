import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

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
  editingShelter: any | null = null;
  editForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      logoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getAllShelters().subscribe({
      next: (data) => {
        console.log('Shelters data (detailed):', JSON.stringify(data, null, 2));
        if (data && data.length > 0) {
          console.log('Keys in first shelter:', Object.keys(data[0]));
        }
        this.shelters = data;
        this.pendingShelters = data.filter((s: any) => !s.verified);
        console.log('Pending shelters:', this.pendingShelters);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading shelters';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Rediriger vers la page de détails pour approbation
  approveShelter(shelter: any): void {
  this.router.navigate(['/admin/adoption/shelters', shelter.id]);
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
          this.loadData();
        },
        error: (err: any) => {
          alert('Error rejecting shelter');
          console.error(err);
        }
      });
    }
  }

  startEdit(shelter: any): void {
    this.editingShelter = shelter;
    this.editForm.patchValue({
      name: shelter.name,
      address: shelter.address,
      phone: shelter.phone,
      email: shelter.email,
      description: shelter.description,
      logoUrl: shelter.logoUrl
    });
  }

  cancelEdit(): void {
    this.editingShelter = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const updatedShelter = {
      ...this.editingShelter,
      ...this.editForm.value
    };

    this.adminService.updateShelter(this.editingShelter.id, updatedShelter).subscribe({
      next: () => {
        this.loadData();
        this.cancelEdit();
      },
      error: (err: any) => {
        alert('Error updating shelter');
        console.error(err);
      }
    });
  }

  deleteShelter(shelter: any): void {
    if (confirm(`Delete shelter "${shelter.name}"? This action cannot be undone.`)) {
      this.adminService.deleteShelter(shelter.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err: any) => {
          alert('Error deleting shelter');
          console.error(err);
        }
      });
    }
  }

 viewShelterDetails(shelter: any): void {
  this.router.navigate(['/admin/adoption/shelters', shelter.id]);
}

  get verifiedShelters(): any[] {
    return this.shelters.filter((s: any) => s.verified);
  }
}