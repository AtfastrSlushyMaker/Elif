import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = 'http://localhost:8087/elif/api/adoption/upload';
  private readonly mediaBaseUrl = this.apiUrl.replace('/api/adoption/upload', '');

  constructor(private http: HttpClient) {}

  uploadPetImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/pet`, formData);
  }

  uploadShelterLogo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/shelter-logo`, formData);
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
