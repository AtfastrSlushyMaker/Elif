import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';

export interface ServiceProviderRequest {
  id?: number;
  userId: number;
  userFullName?: string;
  message: string;
  status: RequestStatus;
  createdAt?: string;
  reviewedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceProviderRequestService {
  private readonly apiUrl = 'http://localhost:8087/elif/api/service-provider';

  constructor(private http: HttpClient) {}

  /** Soumettre une demande */
  createRequest(userId: number, message: string): Observable<ServiceProviderRequest> {
    return this.http.post<ServiceProviderRequest>(`${this.apiUrl}/request`, { userId, message });
  }

  /** Récupérer la demande du user connecté */
  getMyRequest(userId: number): Observable<ServiceProviderRequest> {
    return this.http.get<ServiceProviderRequest>(`${this.apiUrl}/request/${userId}`);
  }

  /** Admin : toutes les demandes */
  getAllRequests(): Observable<ServiceProviderRequest[]> {
    return this.http.get<ServiceProviderRequest[]>(`${this.apiUrl}/requests`);
  }

  /** Admin : approuver */
  approveRequest(id: number): Observable<ServiceProviderRequest> {
    return this.http.put<ServiceProviderRequest>(`${this.apiUrl}/request/${id}/approve`, {});
  }

  /** Admin : refuser */
  rejectRequest(id: number): Observable<ServiceProviderRequest> {
    return this.http.put<ServiceProviderRequest>(`${this.apiUrl}/request/${id}/reject`, {});
  }

  /** Vérification rapide — retourne true si APPROVED */
  checkApproval(userId: number): Observable<{ approved: boolean; userId: number }> {
    return this.http.get<{ approved: boolean; userId: number }>(`${this.apiUrl}/check/${userId}`);
  }
}
