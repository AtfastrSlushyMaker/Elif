import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = 'http://localhost:8087/elif/product';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.api, product);
  }

  updateProduct(id: number, product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
