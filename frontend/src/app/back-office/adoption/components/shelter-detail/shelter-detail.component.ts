import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-shelter-detail',
  templateUrl: './shelter-detail.component.html',
  styleUrls: ['./shelter-detail.component.css']
})
export class ShelterDetailComponent implements OnInit {
  shelter: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadShelter(id);
    }
  }

  loadShelter(id: number): void {
    this.loading = true;
    this.adminService.getShelterById(id).subscribe({
      next: (data) => {
        this.shelter = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading shelter details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Confirmer l'approbation avec une confirmation
  confirmApprove(): void {
    if (!this.shelter?.userId) {
      alert('Cannot find user ID for this shelter');
      return;
    }
    
    if (confirm(`Are you sure you want to approve "${this.shelter.name}"?`)) {
      this.adminService.approveShelter(this.shelter.userId).subscribe({
        next: () => {
          alert('✅ Shelter approved successfully!');
         this.router.navigate(['/admin/adoption/shelters']);
        },
        error: (err) => {
          alert('Error approving shelter: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }

  // Approuver directement (sans confirmation supplémentaire)
  approveShelter(): void {
    if (!this.shelter?.userId) {
      alert('Cannot find user ID for this shelter');
      return;
    }
    
    this.adminService.approveShelter(this.shelter.userId).subscribe({
      next: () => {
        alert('✅ Shelter approved successfully!');
        this.router.navigate(['/adoption/shelters']);
      },
      error: (err) => {
        alert('Error approving shelter: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  rejectShelter(): void {
    if (!this.shelter?.userId) {
      alert('Cannot find user ID for this shelter');
      return;
    }
    
    if (confirm('Are you sure you want to reject this shelter? This will delete the account.')) {
      this.adminService.rejectShelter(this.shelter.userId).subscribe({
        next: () => {
          alert('❌ Shelter rejected and removed.');
          this.router.navigate(['/adoption/shelters']);
        },
        error: (err) => {
          alert('Error rejecting shelter');
        }
      });
    }
  }

 goBack(): void {
  this.router.navigate(['/admin/adoption/shelters']);
}
}