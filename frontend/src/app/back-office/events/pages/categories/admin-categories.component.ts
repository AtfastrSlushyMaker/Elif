// back-office/events/pages/categories/admin-categories.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminCategoryService, AdminAuthService } from '../../services/admin-api.service';
import { EventCategory } from '../../models/admin-events.models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  
  categories: EventCategory[] = [];
  loading = true;
  error = '';
  
  // Form modal
  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  formError = '';
  
  form = {
    name: '',
    icon: '📅',
    description: '',
    requiresApproval: false,
    competitionMode: false  // ✅ AJOUTER
  };
  
  get approvalRequiredCount(): number {
    return this.categories.filter(cat => cat.requiresApproval).length;
  }
  
  get competitionCount(): number {
    return this.categories.filter(cat => cat.competitionMode).length;
  }
  
  constructor(
    private categoryService: AdminCategoryService,
    private auth: AdminAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.isEditing = false;
    this.editingId = null;
    this.form = {
      name: '',
      icon: '📅',
      description: '',
      requiresApproval: false,
      competitionMode: false  // ✅ AJOUTER
    };
    this.formError = '';
    this.showForm = true;
  }

  openEditForm(category: EventCategory) {
    this.isEditing = true;
    this.editingId = category.id;
    this.form = {
      name: category.name,
      icon: category.icon || '📅',
      description: category.description || '',
      requiresApproval: category.requiresApproval,
      competitionMode: category.competitionMode || false  // ✅ AJOUTER
    };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.formError = '';
  }

  saveCategory() {
    if (!this.form.name.trim()) {
      this.formError = 'Category name is required';
      return;
    }

    const adminId = this.auth.getAdminId();
    const data = {
      name: this.form.name.trim(),
      icon: this.form.icon || '📅',
      description: this.form.description,
      requiresApproval: this.form.requiresApproval,
      competitionMode: this.form.competitionMode  // ✅ AJOUTER
    };

    if (this.isEditing && this.editingId) {
      this.categoryService.update(this.editingId, data, adminId).subscribe({
        next: () => {
          this.closeForm();
          this.loadCategories();
        },
        error: (err) => {
          this.formError = err.error?.message || 'Failed to update category';
        }
      });
    } else {
      this.categoryService.create(data, adminId).subscribe({
        next: () => {
          this.closeForm();
          this.loadCategories();
        },
        error: (err) => {
          this.formError = err.error?.message || 'Failed to create category';
        }
      });
    }
  }

  deleteCategory(category: EventCategory) {
    if (!confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    const adminId = this.auth.getAdminId();
    this.categoryService.delete(category.id, adminId).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to delete category';
        alert(message);
      }
    });
  }

  getIconEmoji(icon: string | null | undefined): string {
    return icon || '📅';
  }

  goBack(): void {
    this.router.navigate(['/admin/events']);
  }
}