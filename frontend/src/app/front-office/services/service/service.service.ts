import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service côté front
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: string;
  imageUrl?: string;
  clinicName?: string;
  category: ServiceCategory;
  provider: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Catégorie
export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}

// DTO pour formulaire + CRUD
export interface ServiceDTO {
  id?: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: string;
  categoryId: number;
  providerId: number;
  options?: { id: number; name: string }[];             // options pour booking
  availabilities?: { id: number; startTime: string; endTime: string }[]; // créneaux
}

// Payload pour création service
export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  duration: number;
  status: string;
  categoryId: number;
  providerId: number;
}

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly apiUrl = 'http://localhost:8087/elif/api';

  constructor(private http: HttpClient) {}

  // Tous les services
  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }

  // Services d'un provider
  findByProviderId(providerId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`, {
      params: new HttpParams().set('providerId', providerId.toString())
    });
  }

  // Service par ID
  findById(id: number): Observable<ServiceDTO> {
    return this.http.get<ServiceDTO>(`${this.apiUrl}/services/${id}`);
  }

  // Créer service
  create(payload: CreateServicePayload): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services`, payload);
  }

  // Mettre à jour service
  update(id: number, payload: Partial<CreateServicePayload>): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/services/${id}`, payload);
  }

  // Supprimer service
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/services/${id}`);
  }

  // Services par catégorie
  findByCategoryId(categoryId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services/by-category/${categoryId}`);
  }

  // Services par statut
  findByStatus(status: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services/by-status/${status}`);
  }
}