import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductService, Product } from '../../../shared/services/product.service';
import { AuthService } from '../../../auth/auth.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  showAddForm = false;
  editingId: number | null = null;
  selectedImageFile: File | null = null;

  categories = ['Food & Feed', 'Health Essentials', 'Accessories', 'Merchandise'];

  isAdmin = false;

  newProduct: Partial<Product> = {
    name: '',
    description: '',
    category: 'Food & Feed',
    price: 0,
    stock: 0,
    active: true
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      console.warn('User is not admin - access denied');
      return;
    }
    this.loadProducts();
  }

  /**
   * Load all products from the backend
   */
  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Add a new product
   */
  addProduct(): void {
    if (!this.validateProductForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    const payload = this.buildFormData();

    this.productService.addProduct(payload).subscribe({
      next: (newProduct) => {
        alert('Product added successfully!');
        this.products.unshift(newProduct);
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to add product:', err);
        alert('Failed to add product: ' + (err.error?.error || err.message));
      }
    });
  }

  /**
   * Edit an existing product
   */
  editProduct(product: Product): void {
    this.editingId = product.id;
    this.newProduct = { ...product };
    this.selectedImageFile = null;
    this.showAddForm = true;
  }

  /**
   * Update an existing product
   */
  updateProduct(): void {
    if (!this.validateProductForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    if (this.editingId === null) {
      return;
    }

    const payload = this.buildFormData();

    this.productService.updateProduct(this.editingId, payload).subscribe({
      next: (updatedProduct) => {
        alert('Product updated successfully!');
        const index = this.products.findIndex(p => p.id === this.editingId);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to update product:', err);
        alert('Failed to update product: ' + (err.error?.error || err.message));
      }
    });
  }

  /**
   * Delete a product with confirmation
   */
  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await firstValueFrom(this.confirmDialogService.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      {
        title: 'Delete marketplace product',
        confirmText: 'Delete product',
        cancelText: 'Keep product',
        tone: 'danger'
      }
    ));

    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        alert('Product deleted successfully!');
        this.products = this.products.filter(p => p.id !== product.id);
      },
      error: (err) => {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product: ' + (err.error?.error || err.message));
      }
    });
  }

  /**
   * Reset the form to initial state
   */
  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      category: 'Food & Feed',
      price: 0,
      stock: 0,
      active: true
    };
    this.selectedImageFile = null;
    this.editingId = null;
    this.showAddForm = false;
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImageFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  /**
   * Validate the product form before submission
   */
  private validateProductForm(): boolean {
    if (!this.newProduct.name || this.newProduct.name.trim() === '') {
      return false;
    }
    if (!this.newProduct.description || this.newProduct.description.trim() === '') {
      return false;
    }
    if (this.newProduct.price === null || this.newProduct.price === undefined || this.newProduct.price <= 0) {
      return false;
    }
    if (this.newProduct.stock === null || this.newProduct.stock === undefined || this.newProduct.stock < 0) {
      return false;
    }
    return true;
  }

  /**
   * Handle form submission (add or update)
   */
  onFormSubmit(): void {
    if (this.editingId !== null) {
      this.updateProduct();
    } else {
      this.addProduct();
    }
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    formData.append('name', String(this.newProduct.name ?? ''));
    formData.append('description', String(this.newProduct.description ?? ''));
    formData.append('category', String(this.newProduct.category ?? ''));
    formData.append('price', String(this.newProduct.price ?? 0));
    formData.append('stock', String(this.newProduct.stock ?? 0));
    formData.append('active', String(this.newProduct.active ?? true));

    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile);
    }

    return formData;
  }
}
