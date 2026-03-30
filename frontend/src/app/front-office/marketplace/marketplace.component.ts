import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../shared/services/cart.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent implements OnInit {
  cartItemCount = 0;
  cartTotal = 0;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.cartService.total$.subscribe(total => {
      this.cartTotal = total;
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  /**
   * Navigate to products page with selected category
   */
  navigateToCategory(category: string): void {
    // Store the selected category to product list component
    sessionStorage.setItem('selectedCategory', category);
    this.router.navigate(['products'], { relativeTo: this.route });
  }

  /**
   * Navigate to products page
   */
  shopNow(): void {
    this.router.navigate(['products'], { relativeTo: this.route });
  }

  /**
   * Navigate to cart
   */
  viewCart(): void {
    this.router.navigate(['cart'], { relativeTo: this.route });
  }
}
