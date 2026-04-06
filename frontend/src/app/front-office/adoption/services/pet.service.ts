import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdoptionPet } from '../models/adoption-pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:8087/elif/api/adoption/pets';
  private readonly mediaBaseUrl = this.apiUrl.replace('/api/adoption/pets', '');

  constructor(private http: HttpClient) {}

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

  getAll(): Observable<AdoptionPet[]> {
    return this.http.get<AdoptionPet[]>(this.apiUrl);
  }

  create(pet: AdoptionPet, shelterId: number): Observable<AdoptionPet> {
    return this.http.post<AdoptionPet>(`${this.apiUrl}?shelterId=${shelterId}`, pet);
  }

  update(id: number, pet: AdoptionPet): Observable<AdoptionPet> {
    return this.http.put<AdoptionPet>(`${this.apiUrl}/${id}`, pet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Suggestions based on wizard criteria.
  getSuggestions(criteria: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/suggestions`, criteria);
  }

  buildMediaUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    if (path.startsWith('/')) {
      return `${this.mediaBaseUrl}${path}`;
    }

    return `${this.mediaBaseUrl}/${path}`;
  }
}
