import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OcrResult {
  documentNumber?: string;
  holderName?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingOrganization?: string;
  detectedDocumentType?: string;
  confidence: number;
  confidenceLabel?: string;
  rawExtractedText?: string;
  missingFields: string[];
  isExpired?: boolean;
  warnings: string[];
  source: string;
}

@Injectable({ providedIn: 'root' })
export class OcrService {

  private base = 'http://localhost:8087/elif';

  constructor(private http: HttpClient) {}

  analyzeDocument(
    planId: number,
    file: File,
    documentType: string
  ): Observable<OcrResult> {

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType',
      documentType || 'UNKNOWN');

    const headers = new HttpHeaders({
      'X-User-Id':
        localStorage.getItem('userId') ?? ''
    });

    return this.http.post<any>(
      `${this.base}/api/travel-plans/`
        + `${planId}/documents/ocr-analyze`,
      formData,
      { headers }
    ).pipe(
      map(response => {
        // Backend returns OcrResultResponse directly
        // (not wrapped in {success, data})
        if (response && response.confidence !== undefined) {
          return response as OcrResult;
        }
        // Handle wrapped response just in case
        if (response?.data) {
          return response.data as OcrResult;
        }
        return response as OcrResult;
      }),
      catchError(err => {
        console.error('OCR error:', err);
        return of({
          confidence: 0,
          source: 'unavailable',
          missingFields: [],
          warnings: ['OCR service unavailable.']
        } as OcrResult);
      })
    );
  }
}
