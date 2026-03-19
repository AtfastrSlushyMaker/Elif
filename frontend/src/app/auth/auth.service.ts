import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface SessionUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = 'http://localhost:8087/elif/user';
  private readonly STORAGE_KEY = 'elif_user';

  constructor(private http: HttpClient) {}

  register(firstName: string, lastName: string, email: string, password: string): Observable<SessionUser> {
    return this.http.post<SessionUser>(`${this.api}/register`, { firstName, lastName, email, password }).pipe(
      tap(user => this.saveUser(user))
    );
  }

  login(email: string, password: string): Observable<SessionUser> {
    return this.http.post<SessionUser>(`${this.api}/login`, { email, password }).pipe(
      tap(user => this.saveUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): SessionUser | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  hasRole(...roles: string[]): boolean {
    const role = this.getCurrentUser()?.role?.toUpperCase();
    return !!role && roles.map((r) => r.toUpperCase()).includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private saveUser(user: SessionUser): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }
}
