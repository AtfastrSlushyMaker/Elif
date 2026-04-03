import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CartService } from '../../../shared/services/cart.service';
import { Product, ProductService } from '../../../shared/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  loading = false;
  cartMessage = '';
  showCartMessage = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.product = null;
      return;
    }

    this.fetchProduct(id);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  increaseQuantity(): void {
    if (!this.product) {
      return;
    }

    if (this.quantity < this.product.stock) {
      this.quantity += 1;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  onQuantityInput(value: number): void {
    if (!this.product) {
      return;
    }

    if (!Number.isFinite(value) || value < 1) {
      this.quantity = 1;
      return;
    }

    this.quantity = Math.min(Math.floor(value), this.product.stock || 1);
  }

  addToCart(): void {
    if (!this.product || this.product.stock <= 0) {
      return;
    }

    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addToCart(this.product, this.quantity);
    this.cartMessage = `${this.quantity} x ${this.product.name} added to cart.`;
    this.showCartMessage = true;

    setTimeout(() => {
      this.showCartMessage = false;
    }, 2000);
  }

  viewCart(): void {
    this.router.navigate(['/app/marketplace/cart']);
  }

  goBack(): void {
    this.router.navigate(['/app/marketplace/products']);
  }

  private fetchProduct(id: number): void {
    this.loading = true;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.quantity = 1;
        this.loading = false;
      },
      error: () => {
        this.product = null;
        this.loading = false;
      }
    });
  }
}
