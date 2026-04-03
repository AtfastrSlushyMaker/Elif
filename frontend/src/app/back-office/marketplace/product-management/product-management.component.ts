import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Product, ProductService } from '../../../shared/services/product.service';

type ProductPayload = Omit<Product, 'id'>;

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  showAddForm = false;
  editingId: number | null = null;
  isAdmin = false;

  readonly categories = ['FOOD', 'TOYS', 'ACCESSORIES', 'HEALTH', 'GROOMING', 'OTHER'];

  newProduct: ProductPayload = this.buildEmptyProduct();

  constructor(
    private readonly authService: AuthService,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.loadProducts();
    }
  }

  loadProducts(): void {
    this.loading = true;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  onFormSubmit(): void {
    if (!this.isAdmin) {
      return;
    }

    const payload: ProductPayload = {
      ...this.newProduct,
      name: this.newProduct.name.trim(),
      description: this.newProduct.description.trim(),
      category: this.newProduct.category.trim(),
      imageUrl: this.newProduct.imageUrl?.trim() || ''
    };

    if (!payload.name || !payload.description || !payload.category) {
      return;
    }

    this.loading = true;

    const request$ = this.editingId === null
      ? this.productService.createProduct(payload)
      : this.productService.updateProduct(this.editingId, payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadProducts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  editProduct(product: Product): void {
    this.showAddForm = true;
    this.editingId = product.id;
    this.newProduct = {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      active: product.active
    };
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete product \"${product.name}\"?`)) {
      return;
    }

    this.loading = true;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => {
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.newProduct = this.buildEmptyProduct();
    this.editingId = null;
    this.showAddForm = false;
  }

  private buildEmptyProduct(): ProductPayload {
    return {
      name: '',
      description: '',
      category: this.categories[0],
      price: 0,
      stock: 0,
      imageUrl: '',
      active: true
    };
  }
}
