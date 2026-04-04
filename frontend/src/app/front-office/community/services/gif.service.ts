import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GifResult {
  id: string;
  title: string;
  gifUrl: string;
  previewUrl: string;
}

@Injectable({ providedIn: 'root' })
export class GifService {
  private readonly api = 'http://localhost:8087/elif/api/community/gifs';

  constructor(private http: HttpClient) {}

  search(query: string, limit = 12): Observable<GifResult[]> {
    const trimmedQuery = query.trim();
    const params = new HttpParams()
      .set('q', trimmedQuery)
      .set('limit', String(limit));

    return this.http.get<GifResult[]>(`${this.api}/search`, { params });
  }
}
