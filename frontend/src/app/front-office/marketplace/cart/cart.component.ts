import { Component, OnInit } from '@angular/core';
import { CartService, CartItem, Order } from '../../../shared/services/cart.service';
import { AuthService, SessionUser } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';

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
  readonly freeShippingThreshold = 100;
  readonly standardShippingFee = 6.99;
  selectedPaymentMethod: 'CASH' | 'ONLINE' = 'CASH';

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

    this.route.queryParamMap.subscribe(params => {
      const stripeState = params.get('stripe');
      const sessionId = params.get('session_id');

      if (stripeState === 'success' && sessionId) {
        this.finalizeStripeCheckout(sessionId);
      }

      if (stripeState === 'cancel') {
        alert('Stripe checkout was cancelled. Your cart is still available.');
        this.clearStripeQueryParams();
      }
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  get itemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  get taxAmount(): number {
    return this.total * 0.1;
  }

  get shippingFee(): number {
    return this.total >= this.freeShippingThreshold || this.total === 0 ? 0 : this.standardShippingFee;
  }

  get amountForFreeShipping(): number {
    if (this.total >= this.freeShippingThreshold) {
      return 0;
    }
    return this.freeShippingThreshold - this.total;
  }

  get freeShippingProgress(): number {
    return Math.min((this.total / this.freeShippingThreshold) * 100, 100);
  }

  get grandTotal(): number {
    return this.total + this.taxAmount + this.shippingFee;
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

    if (this.selectedPaymentMethod === 'ONLINE') {
      this.startStripeCheckout();
      return;
    }

    this.processCashCheckout();
  }

  /**
   * Navigate back to marketplace
   */
  continueShopping(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private processCashCheckout(): void {
    if (!this.currentUser) {
      return;
    }

    this.loading = true;
    this.cartService.checkout(this.currentUser.id, 'CASH').subscribe({
      next: (order: Order) => {
        this.loading = false;
        this.generateOrderPdf(order);
        alert(`Order placed successfully! Order ID: ${order.id}`);
        this.continueShopping();
      },
      error: (err) => {
        this.loading = false;
        alert(`Error placing order: ${err.error?.error || 'Unknown error'}`);
      }
    });
  }

  private startStripeCheckout(): void {
    if (!this.currentUser) {
      return;
    }

    const origin = window.location.origin;
    const successUrl = `${origin}/app/marketplace/cart?stripe=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/app/marketplace/cart?stripe=cancel`;

    this.loading = true;
    this.cartService.createStripeCheckoutSession(this.currentUser.id, successUrl, cancelUrl).subscribe({
      next: (response) => {
        window.location.href = response.checkoutUrl;
      },
      error: (err) => {
        this.loading = false;
        alert(`Stripe checkout error: ${err.error?.error || 'Unable to start Stripe checkout'}`);
      }
    });
  }

  private finalizeStripeCheckout(sessionId: string): void {
    if (!this.currentUser || this.cart.length === 0) {
      this.clearStripeQueryParams();
      return;
    }

    const completionKey = `elif_stripe_checkout_completed_${sessionId}`;
    if (sessionStorage.getItem(completionKey)) {
      this.clearStripeQueryParams();
      return;
    }

    this.loading = true;
    this.cartService.checkout(this.currentUser.id, 'ONLINE').subscribe({
      next: (order: Order) => {
        sessionStorage.setItem(completionKey, '1');
        this.loading = false;
        this.generateOrderPdf(order);
        alert(`Stripe payment successful. Order ID: ${order.id}`);
        this.clearStripeQueryParams();
        this.continueShopping();
      },
      error: (err) => {
        this.loading = false;
        alert(`Error finalizing Stripe order: ${err.error?.error || 'Unknown error'}`);
        this.clearStripeQueryParams();
      }
    });
  }

  private clearStripeQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private generateOrderPdf(order: Order): void {
    const doc = new jsPDF();
    const logoPath = '/images/logo/logo-full.png';
    const logo = new Image();
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 14, 10, 46, 18);
      this.writeInvoiceContent(doc, order);
    };
    logo.onerror = () => {
      this.writeInvoiceContent(doc, order);
    };
    logo.src = logoPath;
  }

  private writeInvoiceContent(doc: jsPDF, order: Order): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ELIF Marketplace Invoice', 14, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Order ID: ${order.id}`, 14, 45);
    doc.text(`Customer ID: ${order.userId}`, 14, 51);
    doc.text(`Payment: ${order.paymentMethod}`, 14, 57);
    doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleString()}`, 14, 63);

    let y = 75;
    doc.setFont('helvetica', 'bold');
    doc.text('Product', 14, y);
    doc.text('Qty', 120, y);
    doc.text('Unit Price', 140, y);
    doc.text('Subtotal', 175, y, { align: 'right' });

    doc.setLineWidth(0.3);
    doc.line(14, y + 2, 196, y + 2);

    doc.setFont('helvetica', 'normal');
    y += 10;

    order.orderItems.forEach((item) => {
      doc.text(item.productName, 14, y);
      doc.text(String(item.quantity), 122, y);
      doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 140, y);
      doc.text(`$${Number(item.subtotal).toFixed(2)}`, 175, y, { align: 'right' });
      y += 8;
    });

    y += 6;
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${Number(order.totalAmount).toFixed(2)}`, 175, y, { align: 'right' });

    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for shopping with ELIF!', 14, y);

    doc.save(`elif-order-${order.id}.pdf`);
  }
}
