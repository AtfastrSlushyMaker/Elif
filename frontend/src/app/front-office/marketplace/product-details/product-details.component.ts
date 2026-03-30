import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductService } from '../../../shared/services/product.service';
import { CartService } from '../../../shared/services/cart.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  loading = false;
  isLoggedIn = false;
  cartMessage = '';
  showCartMessage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(Number(productId));
    }
  }

  /**
   * Load product details
   */
  private loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  /**
   * Add product to cart with specified quantity
   */
  addToCart(): void {
    if (!this.isLoggedIn) {
      alert('Please login to add items to cart');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.product) {
      return;
    }

    if (this.quantity < 1 || this.quantity > this.product.stock) {
      alert('Invalid quantity');
      return;
    }

    // Add multiple quantities to cart
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product);
    }

    // Show success message
    this.cartMessage = `✓ Added ${this.quantity} ${this.quantity === 1 ? 'item' : 'items'} to cart!`;
    this.showCartMessage = true;

    // Hide message after 3 seconds
    setTimeout(() => {
      this.showCartMessage = false;
    }, 3000);

    // Reset quantity
    this.quantity = 1;
  }

  /**
   * Increase quantity
   */
  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  /**
   * Decrease quantity
   */
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /**
   * Go back to product list
   */
  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  /**
   * Navigate to cart
   */
  viewCart(): void {
    this.router.navigate(['../../cart'], { relativeTo: this.route });
  }
}
