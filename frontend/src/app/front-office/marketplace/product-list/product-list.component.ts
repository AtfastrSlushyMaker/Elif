import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from '../../../shared/services/product.service';
import { CartService } from '../../../shared/services/cart.service';
import { AuthService } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PetProfileService } from '../../../shared/services/pet-profile.service';
import { PetSpecies } from '../../../shared/models/pet-profile.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  recommendedProducts: Product[] = [];
  trendingProducts: Product[] = [];
  loading = false;
  selectedCategory: string | null = null;
  searchQuery = '';
  recommendationContext = 'based on availability and popularity';
  private preferredSpecies: PetSpecies[] = [];

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
    private petProfileService: PetProfileService,
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
        this.loadTrendingProducts();
        const userId = this.authService.getCurrentUser()?.id;

        if (!userId) {
          this.preferredSpecies = [];
          this.recommendationContext = 'based on availability and popularity';
          this.refreshRecommendations();
          this.applyFilters();
          this.loading = false;
          return;
        }

        this.petProfileService.getMyPets(userId).subscribe({
          next: (pets) => {
            const uniqueSpecies = Array.from(new Set((pets ?? []).map((pet) => pet.species)));
            this.preferredSpecies = uniqueSpecies;
            this.recommendationContext = uniqueSpecies.length > 0
              ? 'based on your pet profile preferences'
              : 'based on availability and popularity';
            this.refreshRecommendations();
            this.applyFilters();
            this.loading = false;
          },
          error: () => {
            this.preferredSpecies = [];
            this.recommendationContext = 'based on availability and popularity';
            this.refreshRecommendations();
            this.applyFilters();
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  private loadTrendingProducts(): void {
    this.productService.getTrendingProducts(4).subscribe({
      next: (products) => {
        this.trendingProducts = (products ?? []).filter((product) => product.active && product.stock > 0);
      },
      error: () => {
        this.trendingProducts = [];
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

    this.recommendedProducts = this.selectRecommendedProducts(categoryProducts, this.preferredSpecies);
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

  private selectRecommendedProducts(products: Product[], preferredSpecies: PetSpecies[]): Product[] {
    return [...products]
      .filter((product) => product.active && product.stock > 0)
      .sort((a, b) => {
        const preferenceDiff = this.preferenceScore(b, preferredSpecies) - this.preferenceScore(a, preferredSpecies);
        if (preferenceDiff !== 0) {
          return preferenceDiff;
        }

        const stockDiff = b.stock - a.stock;
        if (stockDiff !== 0) {
          return stockDiff;
        }

        return b.price - a.price;
      })
      .slice(0, 4);
  }

  private preferenceScore(product: Product, preferredSpecies: PetSpecies[]): number {
    if (preferredSpecies.length === 0) {
      return 0;
    }

    const searchSpace = `${product.name} ${product.description || ''} ${product.category}`.toLowerCase();
    return preferredSpecies.reduce((score, species) => {
      const keywords = this.speciesKeywords(species);
      const matched = keywords.some((keyword) => searchSpace.includes(keyword));
      return matched ? score + 1 : score;
    }, 0);
  }

  private speciesKeywords(species: PetSpecies): string[] {
    const map: Record<PetSpecies, string[]> = {
      DOG: ['dog', 'puppy', 'canine'],
      CAT: ['cat', 'kitten', 'feline'],
      BIRD: ['bird', 'avian', 'parrot'],
      RABBIT: ['rabbit', 'bunny'],
      HAMSTER: ['hamster', 'rodent'],
      FISH: ['fish', 'aquarium'],
      REPTILE: ['reptile', 'lizard', 'snake', 'turtle'],
      OTHER: ['small pet', 'pet']
    };

    return map[species] ?? [];
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['products', productId], { relativeTo: this.route.parent });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
