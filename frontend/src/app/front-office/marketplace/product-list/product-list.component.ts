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
  recommendedProducts: Product[] = [];
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
        this.refreshRecommendations();
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
    this.refreshRecommendations();
    this.applyFilters();
  }

  search(query: string): void {
    this.searchQuery = query.trim();
    this.applyFilters();
  }

  private refreshRecommendations(): void {
    const categoryProducts = this.selectedCategory
      ? this.products.filter((product) => product.category === this.selectedCategory)
      : this.products;

    this.recommendedProducts = this.selectRecommendedProducts(categoryProducts);
  }

  private applyFilters(): void {
    const normalizedQuery = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !normalizedQuery || 
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.description || '').toLowerCase().includes(normalizedQuery);
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

  private selectRecommendedProducts(products: Product[]): Product[] {
    return [...products]
      .filter((product) => product.active && product.stock > 0)
      .sort((a, b) => {
        const stockDiff = b.stock - a.stock;
        if (stockDiff !== 0) {
          return stockDiff;
        }

        return b.price - a.price;
      })
      .slice(0, 4);
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['products', productId], { relativeTo: this.route.parent });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
