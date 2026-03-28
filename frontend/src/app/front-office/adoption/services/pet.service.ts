import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdoptionPet } from '../models/adoption-pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:8087/elif/api/adoption/pets';

  constructor(private http: HttpClient) {}

  // ============================================================
  // MÉTHODES EXISTANTES
  // ============================================================

  getAvailable(): Observable<AdoptionPet[]> {
    return this.http.get<AdoptionPet[]>(`${this.apiUrl}/available`);
  }

  getById(id: number): Observable<AdoptionPet> {
    return this.http.get<AdoptionPet>(`${this.apiUrl}/${id}`);
  }

  getByShelter(shelterId: number): Observable<AdoptionPet[]> {
    return this.http.get<AdoptionPet[]>(`${this.apiUrl}/shelter/${shelterId}`);
  }

  search(filters: any): Observable<AdoptionPet[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<AdoptionPet[]>(`${this.apiUrl}/search`, { params });
  }

  // ============================================================
  // NOUVELLES MÉTHODES POUR LE REFUGE
  // ============================================================

  // Récupérer tous les animaux
  getAll(): Observable<AdoptionPet[]> {
    return this.http.get<AdoptionPet[]>(this.apiUrl);
  }

  // Créer un animal
  create(pet: AdoptionPet, shelterId: number): Observable<AdoptionPet> {
    return this.http.post<AdoptionPet>(`${this.apiUrl}?shelterId=${shelterId}`, pet);
  }

  // Modifier un animal
  update(id: number, pet: AdoptionPet): Observable<AdoptionPet> {
    return this.http.put<AdoptionPet>(`${this.apiUrl}/${id}`, pet);
  }

  // Supprimer un animal
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}