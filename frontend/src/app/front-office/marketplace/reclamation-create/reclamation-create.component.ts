import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CartService, Order, OrderItem } from '../../../shared/services/cart.service';
import {
  MarketplaceReclamationService,
  MarketplaceReclamationType
} from '../../../shared/services/marketplace-reclamation.service';

@Component({
  selector: 'app-marketplace-reclamation-create',
  templateUrl: './reclamation-create.component.html',
  styleUrl: './reclamation-create.component.css'
})
export class ReclamationCreateComponent implements OnInit {
  loading = false;
  submitting = false;
  currentUserId: number | null = null;

  orders: Order[] = [];

  selectedOrderId: number | null = null;
  selectedProductId: number | null = null;
  title = '';
  description = '';
  selectedType: MarketplaceReclamationType = 'OTHER';

  formError = '';
  loadError = '';

  readonly reclamationTypes: MarketplaceReclamationType[] = [
    'DELIVERY',
    'DAMAGED_PRODUCT',
    'WRONG_ITEM',
    'PAYMENT',
    'REFUND',
    'OTHER'
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly reclamationService: MarketplaceReclamationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ?? null;

    if (!this.currentUserId) {
      this.loadError = 'Please login to submit marketplace reclamations.';
      return;
    }

    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.currentUserId) {
      return;
    }

    this.loading = true;
    this.loadError = '';

    this.cartService.getUserOrders(this.currentUserId).subscribe({
      next: (orders) => {
        this.orders = [...orders].sort((a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt));
        this.loading = false;
      },
      error: (err) => {
        this.loadError = err?.error?.error || 'Failed to load your orders';
        this.loading = false;
      }
    });
  }

  onOrderSelected(orderIdValue: string): void {
    const parsed = Number(orderIdValue);
    this.selectedOrderId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    this.selectedProductId = null;
  }

  submitReclamation(): void {
    if (!this.currentUserId) {
      this.formError = 'Please login first.';
      return;
    }

    if (!this.selectedOrderId) {
      this.formError = 'Please select a purchase order.';
      return;
    }

    if (!this.title.trim()) {
      this.formError = 'Please enter a title.';
      return;
    }

    if (!this.description.trim()) {
      this.formError = 'Please enter a detailed description.';
      return;
    }

    this.formError = '';
    this.submitting = true;

    this.reclamationService.create({
      userId: this.currentUserId,
      orderId: this.selectedOrderId,
      productId: this.selectedProductId ?? undefined,
      title: this.title.trim(),
      description: this.description.trim(),
      type: this.selectedType
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/app/marketplace/reclamations']);
      },
      error: (err) => {
        this.formError = err?.error?.error || 'Failed to submit reclamation';
        this.submitting = false;
      }
    });
  }

  get productsForSelectedOrder(): OrderItem[] {
    if (!this.selectedOrderId) {
      return [];
    }

    const selectedOrder = this.orders.find((order) => order.id === this.selectedOrderId);
    return selectedOrder?.orderItems ?? [];
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString();
  }

  private toTime(value: string): number {
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
