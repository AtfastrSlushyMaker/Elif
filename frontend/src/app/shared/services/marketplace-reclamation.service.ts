import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type MarketplaceReclamationType =
  | 'DELIVERY'
  | 'DAMAGED_PRODUCT'
  | 'WRONG_ITEM'
  | 'PAYMENT'
  | 'REFUND'
  | 'OTHER';

export type MarketplaceReclamationStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

export interface MarketplaceReclamation {
  id: number;
  userId: number;
  orderId: number;
  productId: number | null;
  title: string;
  description: string;
  type: MarketplaceReclamationType;
  status: MarketplaceReclamationStatus;
  responseMalek: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketplaceReclamationPayload {
  userId: number;
  orderId: number;
  productId?: number;
  title: string;
  description: string;
  type: MarketplaceReclamationType;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceReclamationService {
  private readonly api = 'http://localhost:8087/elif/marketplace-reclamation';

  constructor(private readonly http: HttpClient) {}

  create(payload: CreateMarketplaceReclamationPayload): Observable<MarketplaceReclamation> {
    return this.http.post<MarketplaceReclamation>(this.api, payload);
  }

  getByUser(userId: number): Observable<MarketplaceReclamation[]> {
    return this.http.get<MarketplaceReclamation[]>(`${this.api}/user/${userId}`);
  }

  getAll(): Observable<MarketplaceReclamation[]> {
    return this.http.get<MarketplaceReclamation[]>(this.api);
  }

  updateStatus(id: number, status: MarketplaceReclamationStatus, responseMalek?: string): Observable<MarketplaceReclamation> {
    return this.http.put<MarketplaceReclamation>(`${this.api}/${id}/status`, { status, responseMalek });
  }
}
