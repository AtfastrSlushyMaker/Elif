import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = 'http://localhost:8087/elif/api/adoption/contracts';

  constructor(private http: HttpClient) {}

  create(contract: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, contract);
  }

  getByShelter(shelterId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shelter/${shelterId}`);
  }

  getByAdopter(adopterId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/adoptant/${adopterId}`);
  }
}