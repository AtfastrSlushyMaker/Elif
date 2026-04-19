import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { PetService } from '../../services/pet.service';
import { ShelterService } from '../../services/shelter.service';
import { RequestService } from '../../services/request.service';
import { AtRiskService, AtRiskPet } from '../../services/at-risk.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-shelter-pets',
  templateUrl: './shelter-pets.component.html',
  styleUrls: ['./shelter-pets.component.css']
})
export class ShelterPetsComponent implements OnInit {

  pets: any[] = [];
  requestsCount: { [petId: number]: number } = {};
  loading = true;
  error: string | null = null;
  shelterId: number | null = null;

  // ✅ Map petId → AtRiskPet
  atRiskMap: Map<number, AtRiskPet> = new Map();

  // ✅ Modale analyse IA (shelter)
  showRiskModal    = false;
  selectedRiskPet: AtRiskPet | null = null;

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private shelterService: ShelterService,
    private requestService: RequestService,
    private atRiskService: AtRiskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'SHELTER') { this.router.navigate(['/']); return; }
    if (!user.id) { this.router.navigate(['/']); return; }
    this.loadShelter(user.id);
  }

  loadShelter(userId: number): void {
    this.shelterService.getShelterByUserId(userId).subscribe({
      next: (shelter) => {
        this.shelterId = shelter.id ?? null;
        this.loadAll();
      },
      error: () => { this.error = 'Shelter not found'; this.loading = false; }
    });
  }

  loadAll(): void {
    if (!this.shelterId) return;
    this.loading = true;

    forkJoin({
      pets:   this.petService.getByShelter(this.shelterId!),
      atRisk: this.atRiskService.getByShelter(this.shelterId!).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ pets, atRisk }) => {
        this.pets = pets as any[];

        // Construire la map at-risk
        this.atRiskMap = new Map();
        (atRisk as AtRiskPet[]).forEach(r => this.atRiskMap.set(r.petId, r));

        this.loading = false;
        this.loadRequestsCount();
      },
      error: () => { this.error = 'Error loading pets'; this.loading = false; }
    });
  }

  loadPets(): void { this.loadAll(); }

  loadRequestsCount(): void {
    if (!this.shelterId) return;
    this.requestService.getByShelter(this.shelterId).subscribe({
      next: (requests) => {
        this.pets.forEach(pet => {
          this.requestsCount[pet.id] = requests.filter(req =>
            req.petId === pet.id &&
            req.status !== 'CANCELLED' &&
            req.status !== 'REJECTED'
          ).length;
        });
      },
      error: () => { this.pets.forEach(pet => { this.requestsCount[pet.id] = 0; }); }
    });
  }

  // ── At-risk helpers ──
  getAtRisk(petId: number): AtRiskPet | undefined { return this.atRiskMap.get(petId); }

  hasRisk(petId: number): boolean {
    const r = this.atRiskMap.get(petId);
    return !!r && r.riskLevel !== 'SAFE';
  }

  // ✅ Ouvrir la modale d'analyse IA complète (shelter)
  openRiskModal(petId: number, event: Event): void {
    event.stopPropagation();
    this.selectedRiskPet = this.atRiskMap.get(petId) || null;
    this.showRiskModal   = true;
  }

  closeRiskModal(): void {
    this.showRiskModal   = false;
    this.selectedRiskPet = null;
  }

  getRiskClass(level: string): string {
    const m: any = { CRITICAL:'badge-critical', AT_RISK:'badge-atrisk', WATCH:'badge-watch' };
    return m[level] || '';
  }

  getRiskLabel(level: string): string {
    const m: any = { CRITICAL:'🔴 Critical', AT_RISK:'🟠 At Risk', WATCH:'🟡 Watch' };
    return m[level] || '';
  }

  // ── Getters ──
  get availablePets(): any[] { return this.pets.filter(p => p.available === true); }
  get adoptedPets():   any[] { return this.pets.filter(p => p.available === false); }

  // ── Navigation ──
  addPet():      void { this.router.navigate(['/app/adoption/shelter/pets/new']); }
  editPet(id: number): void { this.router.navigate(['/app/adoption/shelter/pets/edit', id]); }
  goToRequests():void { this.router.navigate(['/app/adoption/shelter/requests']); }
  viewRequests(petId: number): void {
    this.router.navigate(['/app/adoption/shelter/requests'], { queryParams: { petId } });
  }
  goToAtRisk():  void { this.router.navigate(['/app/adoption/shelter/at-risk']); }

  deletePet(id: number): void {
    if (!confirm('Are you sure you want to delete this pet?')) return;
    this.petService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: () => alert('Error deleting pet')
    });
  }

  // ── Display helpers ──
  getPetTypeLabel(type: string): string {
    const m: any = { CHIEN:'🐕 Dog', CHAT:'🐈 Cat', OISEAU:'🐦 Bird',
      LAPIN:'🐇 Rabbit', RONGEUR:'🐭 Rodent', REPTILE:'🐍 Reptile',
      POISSON:'🐟 Fish', AUTRE:'🐾 Other' };
    return m[type] || type;
  }

  getPetSizeLabel(size: string): string {
    const m: any = { PETIT:'Small', MOYEN:'Medium', GRAND:'Large', TRES_GRAND:'Extra Large' };
    return m[size] || size;
  }

  getPetIcon(name: string): string { return name ? name.charAt(0).toUpperCase() : '🐾'; }

  getFirstPhoto(photos: string | null | undefined): string {
    if (!photos) return '';
    try {
      const arr = JSON.parse(photos);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
    } catch { return photos; }
  }
}