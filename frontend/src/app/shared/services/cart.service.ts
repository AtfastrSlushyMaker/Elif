import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.service';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  paymentMethod: 'CASH' | 'ONLINE';
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_STORAGE_KEY = 'elif_cart';
  private readonly api = 'http://localhost:8087/elif/order';
  private readonly paymentApi = 'http://localhost:8087/elif/payment';

  private cart = new BehaviorSubject<CartItem[]>(this.loadCart());
  public cart$ = this.cart.asObservable();

  private total = new BehaviorSubject<number>(this.calculateTotal());
  public total$ = this.total.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cart.value;
    const existingItem = currentCart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({ product, quantity });
    }

    this.saveCart(currentCart);
    this.updateTotal();
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cart.value.filter(item => item.product.id !== productId);
    this.saveCart(currentCart);
    this.updateTotal();
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this.cart.value;
    const item = currentCart.find(item => item.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(currentCart);
        this.updateTotal();
      }
    }
  }

  getCart(): CartItem[] {
    return this.cart.value;
  }

  getCartCount(): Observable<number> {
    return this.cart$.pipe(
      map(items => items.reduce((count, item) => count + item.quantity, 0))
    );
  }

  getTotal(): number {
    return this.total.value;
  }

  clearCart(): void {
    this.saveCart([]);
    this.updateTotal();
  }

  checkout(userId: number, paymentMethod: 'CASH' | 'ONLINE'): Observable<Order> {
    const items = this.cart.value.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    return new Observable(observer => {
      this.http.post<Order>(`${this.api}/create`, { userId, items, paymentMethod })
        .subscribe({
          next: (order) => {
            this.clearCart();
            observer.next(order);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
    });
  }

  createStripeCheckoutSession(
    userId: number,
    successUrl: string,
    cancelUrl: string
  ): Observable<StripeCheckoutResponse> {
    const items = this.cart.value.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    return this.http.post<StripeCheckoutResponse>(
      `${this.paymentApi}/stripe/checkout-session`,
      { userId, items, successUrl, cancelUrl }
    );
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}/user/${userId}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.api);
  }

  confirmOrder(orderId: number): Observable<Order> {
    return this.http.put<Order>(`${this.api}/${orderId}/confirm`, {});
  }

  private loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    this.cart.next(cart);
  }

  private calculateTotal(): number {
    return this.cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  private updateTotal(): void {
    this.total.next(this.calculateTotal());
  }
}
