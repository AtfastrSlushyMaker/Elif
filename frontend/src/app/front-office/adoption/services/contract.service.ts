import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = 'http://localhost:8087/elif/api/adoption/contracts';

  constructor(private http: HttpClient) {}

  // Create contract
  create(contract: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, contract);
  }

  // Shelter contracts
  getByShelter(shelterId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shelter/${shelterId}`);
  }

  // Adopter contracts
  getByAdopter(adopterId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/adoptant/${adopterId}`);
  }

  // Contract details
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Download contract PDF
  downloadPdf(contractId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${contractId}/pdf`, {
        responseType: 'blob'
    });
}
}
