import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from '../../../shared/services/product.service';
import { CartService } from '../../../shared/services/cart.service';
import { AuthService } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  selectedCategory: string | null = null;
  searchQuery = '';

  categories = [
    { id: 'Food & Feed', label: 'Food & Feed' },
    { id: 'Health Essentials', label: 'Health Essentials' },
    { id: 'Accessories', label: 'Accessories' },
    { id: 'Merchandise', label: 'Merchandise' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if a category was selected from marketplace landing page
    const storedCategory = sessionStorage.getItem('selectedCategory');
    if (storedCategory) {
      this.selectedCategory = storedCategory;
      sessionStorage.removeItem('selectedCategory');
    }

    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getActiveProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.applyFilters();
  }

  search(query: string): void {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      alert('Please login to add items to cart');
      return;
    }

    if (product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }

    this.cartService.addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['products', productId], { relativeTo: this.route.parent });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
