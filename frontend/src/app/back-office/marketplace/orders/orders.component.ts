import { Component, OnInit } from '@angular/core';
import { CartService, Order } from '../../../shared/services/cart.service';

@Component({
  selector: 'app-marketplace-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  statusError = '';
  updatingOrderId: number | null = null;
  currentPage = 1;
  readonly pageSize = 8;

  constructor(private readonly cartService: CartService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    this.cartService.getAllOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders = this.sortOrders(orders);
        this.clampCurrentPage();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.error || 'Unable to load orders';
        this.loading = false;
      }
    });
  }

  get totalRevenue(): number {
    return this.orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }

  get pendingCount(): number {
    return this.orders.filter(order => order.status === 'PENDING').length;
  }

  get completedCount(): number {
    return this.orders.filter(order => order.status === 'CONFIRMED' || order.status === 'DELIVERED').length;
  }

  get averageOrderValue(): number {
    return this.orders.length === 0 ? 0 : this.totalRevenue / this.orders.length;
  }

  get pagedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.orders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const pages = Math.ceil(this.orders.length / this.pageSize);
    return pages > 0 ? pages : 1;
  }

  get visibleStart(): number {
    return this.orders.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get visibleEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.orders.length);
  }

  orderItemsCount(order: Order): number {
    return order.orderItems.reduce((sum: number, item) => sum + item.quantity, 0);
  }

  formatDate(value: string): string {
    return value ? new Date(value).toLocaleString() : '-';
  }

  statusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'orders-status-success';
      case 'CANCELLED':
        return 'orders-status-danger';
      case 'PENDING':
        return 'orders-status-warning';
      default:
        return 'orders-status-neutral';
    }
  }

  canToggleCompletion(order: Order): boolean {
    return order.status === 'PENDING' || order.status === 'CONFIRMED';
  }

  toggleCompletion(order: Order): void {
    if (!this.canToggleCompletion(order) || this.updatingOrderId !== null) {
      return;
    }

    const targetStatus: 'PENDING' | 'CONFIRMED' = order.status === 'PENDING' ? 'CONFIRMED' : 'PENDING';
    this.statusError = '';
    this.updatingOrderId = order.id;

    this.cartService.updateOrderStatus(order.id, targetStatus).subscribe({
      next: (updatedOrder: Order) => {
        this.orders = this.sortOrders(
          this.orders.map(existing => (existing.id === updatedOrder.id ? updatedOrder : existing))
        );
        this.clampCurrentPage();
        this.updatingOrderId = null;
      },
      error: (err: any) => {
        this.statusError = err?.error?.error || 'Unable to update order status';
        this.updatingOrderId = null;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  private sortOrders(orders: Order[]): Order[] {
    return [...orders].sort((a, b) => {
      const aCompleted = this.isCompletedStatus(a.status) ? 1 : 0;
      const bCompleted = this.isCompletedStatus(b.status) ? 1 : 0;

      if (aCompleted !== bCompleted) {
        return aCompleted - bCompleted;
      }

      return this.toTime(b.createdAt) - this.toTime(a.createdAt);
    });
  }

  private isCompletedStatus(status: string): boolean {
    return status === 'CONFIRMED' || status === 'DELIVERED';
  }

  private clampCurrentPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  private toTime(value: string): number {
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }
}