import { Component, OnInit } from '@angular/core';
import { CartService, CartItem, Order } from '../../../shared/services/cart.service';
import { AuthService, SessionUser } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  total = 0;
  loading = false;
  currentUser: SessionUser | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    this.cartService.total$.subscribe(total => {
      this.total = total;
    });

    this.currentUser = this.authService.getCurrentUser();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  /**
   * Proceed with checkout
   */
  checkout(): void {
    if (!this.currentUser) {
      alert('Please login to proceed with checkout');
      return;
    }

    if (this.cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    this.loading = true;
    this.cartService.checkout(this.currentUser.id).subscribe({
      next: (order: Order) => {
        this.loading = false;
        alert(`Order placed successfully! Order ID: ${order.id}`);
        this.continueShopping();
      },
      error: (err) => {
        this.loading = false;
        alert(`Error placing order: ${err.error?.error || 'Unknown error'}`);
      }
    });
  }

  /**
   * Navigate back to marketplace
   */
  continueShopping(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
