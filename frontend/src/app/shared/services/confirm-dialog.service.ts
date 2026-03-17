import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  confirmDelete(entityLabel = 'item'): boolean {
    return window.confirm(`Delete this ${entityLabel}? This action cannot be undone.`);
  }

  confirm(message: string): boolean {
    return window.confirm(message);
  }
}
