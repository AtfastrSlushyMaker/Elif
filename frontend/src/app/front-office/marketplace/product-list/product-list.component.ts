import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CartService } from '../../../shared/services/cart.service';
import { Product, ProductService } from '../../../shared/services/product.service';

interface CategoryOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  searchQuery = '';
  selectedCategory = '';

  readonly categories: CategoryOption[] = [
    { id: 'FOOD', label: 'Food' },
    { id: 'TOYS', label: 'Toys' },
    { id: 'ACCESSORIES', label: 'Accessories' },
    { id: 'HEALTH', label: 'Health' },
    { id: 'GROOMING', label: 'Grooming' },
    { id: 'OTHER', label: 'Other' }
  ];

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadProducts(): void {
    this.loading = true;

    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products.filter(product => product.active !== false);
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  search(value: string): void {
    this.searchQuery = value.trim().toLowerCase();
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) {
      alert('Please login to add products to cart.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (product.stock <= 0) {
      return;
    }

    this.cartService.addToCart(product, 1);
    alert(`${product.name} added to cart.`);
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['/app/marketplace/products', productId]);
  }

  private applyFilters(): void {
    this.filteredProducts = this.products.filter((product) => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const query = this.searchQuery;
      const matchesQuery = !query
        || product.name.toLowerCase().includes(query)
        || (product.description || '').toLowerCase().includes(query)
        || (product.category || '').toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }
}
