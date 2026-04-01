import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PetProfile, PetProfilePayload, PetSpecies } from '../models/pet-profile.model';

@Injectable({ providedIn: 'root' })
export class PetProfileService {
  private readonly api = 'http://localhost:8087/elif/api/user-pets';
  private readonly backendHost = 'http://localhost:8087';
  private readonly backendContext = '/elif';

  constructor(private http: HttpClient) {}

  private headers(userId: number): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) };
  }

  getMyPets(userId: number, species?: PetSpecies): Observable<PetProfile[]> {
    let params = new HttpParams();
    if (species) {
      params = params.set('species', species);
    }
    return this.http.get<PetProfile[]>(this.api, { ...this.headers(userId), params }).pipe(
      map((pets) => (pets ?? []).map((pet) => this.normalizePet(pet)))
    );
  }

  getMyPetById(userId: number, petId: number): Observable<PetProfile> {
    return this.http.get<PetProfile>(`${this.api}/${petId}`, this.headers(userId)).pipe(
      map((pet) => this.normalizePet(pet))
    );
  }

  createMyPet(userId: number, payload: PetProfilePayload): Observable<PetProfile> {
    return this.http.post<PetProfile>(this.api, payload, this.headers(userId)).pipe(
      map((pet) => this.normalizePet(pet))
    );
  }

  updateMyPet(userId: number, petId: number, payload: PetProfilePayload): Observable<PetProfile> {
    return this.http.put<PetProfile>(`${this.api}/${petId}`, payload, this.headers(userId)).pipe(
      map((pet) => this.normalizePet(pet))
    );
  }

  uploadMyPetPhoto(userId: number, petId: number, file: File): Observable<PetProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PetProfile>(`${this.api}/${petId}/photo`, formData, this.headers(userId)).pipe(
      map((pet) => this.normalizePet(pet))
    );
  }

  deleteMyPet(userId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${petId}`, this.headers(userId));
  }

  getAllPetsForAdmin(userId: number, species?: PetSpecies): Observable<PetProfile[]> {
    let params = new HttpParams();
    if (species) {
      params = params.set('species', species);
    }
    return this.http.get<PetProfile[]>(`${this.api}/admin`, { ...this.headers(userId), params }).pipe(
      map((pets) => (pets ?? []).map((pet) => this.normalizePet(pet)))
    );
  }

  updatePetAsAdmin(userId: number, petId: number, payload: PetProfilePayload): Observable<PetProfile> {
    return this.http.put<PetProfile>(`${this.api}/admin/${petId}`, payload, this.headers(userId)).pipe(
      map((pet) => this.normalizePet(pet))
    );
  }

  uploadPetPhotoAsAdmin(userId: number, petId: number, file: File): Observable<PetProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PetProfile>(`${this.api}/admin/${petId}/photo`, formData, this.headers(userId)).pipe(
      map((pet) => this.normalizePet(pet))
    );
  }

  deletePetAsAdmin(userId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/${petId}`, this.headers(userId));
  }

  private normalizePet(pet: PetProfile): PetProfile {
    return {
      ...pet,
      photoUrl: this.resolveImageUrl(pet.photoUrl)
    };
  }

  private resolveImageUrl(imageUrl?: string | null): string | null {
    const normalized = (imageUrl ?? '').trim();
    if (!normalized) {
      return null;
    }

    if (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('data:') ||
      normalized.startsWith('blob:')
    ) {
      return normalized;
    }

    if (normalized.startsWith('/uploads/')) {
      return `${this.backendHost}${this.backendContext}${normalized}`;
    }

    if (normalized.startsWith('uploads/')) {
      return `${this.backendHost}${this.backendContext}/${normalized}`;
    }

    if (normalized.startsWith('/elif/')) {
      return `${this.backendHost}${normalized}`;
    }

    if (normalized.startsWith('/')) {
      return `${this.backendHost}${normalized}`;
    }

    return normalized;
  }
}
