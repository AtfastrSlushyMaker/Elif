import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PetProfile, PetProfilePayload, PetSpecies } from '../models/pet-profile.model';

@Injectable({ providedIn: 'root' })
export class PetProfileService {
  private readonly api = 'http://localhost:8087/elif/api/user-pets';

  constructor(private http: HttpClient) {}

  private headers(userId: number): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) };
  }

  getMyPets(userId: number, species?: PetSpecies): Observable<PetProfile[]> {
    let params = new HttpParams();
    if (species) {
      params = params.set('species', species);
    }
    return this.http.get<PetProfile[]>(this.api, { ...this.headers(userId), params });
  }

  getMyPetById(userId: number, petId: number): Observable<PetProfile> {
    return this.http.get<PetProfile>(`${this.api}/${petId}`, this.headers(userId));
  }

  createMyPet(userId: number, payload: PetProfilePayload): Observable<PetProfile> {
    return this.http.post<PetProfile>(this.api, payload, this.headers(userId));
  }

  updateMyPet(userId: number, petId: number, payload: PetProfilePayload): Observable<PetProfile> {
    return this.http.put<PetProfile>(`${this.api}/${petId}`, payload, this.headers(userId));
  }

  deleteMyPet(userId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${petId}`, this.headers(userId));
  }

  getAllPetsForAdmin(userId: number, species?: PetSpecies): Observable<PetProfile[]> {
    let params = new HttpParams();
    if (species) {
      params = params.set('species', species);
    }
    return this.http.get<PetProfile[]>(`${this.api}/admin`, { ...this.headers(userId), params });
  }

  updatePetAsAdmin(userId: number, petId: number, payload: PetProfilePayload): Observable<PetProfile> {
    return this.http.put<PetProfile>(`${this.api}/admin/${petId}`, payload, this.headers(userId));
  }

  deletePetAsAdmin(userId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/${petId}`, this.headers(userId));
  }
}
