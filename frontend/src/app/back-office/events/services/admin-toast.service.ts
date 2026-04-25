// admin-toast.service.ts - NOUVEAU FICHIER
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  private toastsSubject = new Subject<ToastMessage>();
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  show(type: ToastMessage['type'], title: string, message: string, duration = 5000) {
    const id = ++this.counter;
    this.toastsSubject.next({ id, type, title, message, duration });
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  private remove(id: number) {
    this.toastsSubject.next({ id, type: 'info', title: '', message: '', duration: 0 });
  }

  success(title: string, message: string) {
    this.show('success', title, message);
  }

  error(title: string, message: string) {
    this.show('error', title, message);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }
}