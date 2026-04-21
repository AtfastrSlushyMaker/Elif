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
  imageUrl: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = 'http://localhost:8087/elif/product';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }

  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/active`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/category/${category}`);
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/search`, { params: { keyword } });
  }

  getTrendingProducts(limit = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/trending`, { params: { limit } });
  }

  addProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.api, product);
  }

  updateProduct(id: number, product: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
