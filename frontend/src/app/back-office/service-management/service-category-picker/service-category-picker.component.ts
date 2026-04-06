import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceCategoryService, ServiceCategory } from '../../../back-office/services/service-category.service';

interface CategoryCard {
  id?: number;
  name: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

@Component({
  selector: 'app-service-category-picker',
  templateUrl: './service-category-picker.component.html',
  styleUrls: ['./service-category-picker.component.css']
})
export class ServiceCategoryPickerComponent implements OnInit {

  loading = true;
  categories: CategoryCard[] = [];
  hoveredCard: string | null = null;

  private readonly categoryMeta: Record<string, Omit<CategoryCard, 'id' | 'name'>> = {
    VETERINARY: {
      label: 'Vétérinaire',
      description: 'Services médicaux, consultations, chirurgie et vaccinations',
      icon: '🩺',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    GROOMING: {
      label: 'Toilettage',
      description: 'Soins et beauté : bain, coupe, produits spéciaux',
      icon: '✂️',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    TRAINING: {
      label: 'Dressage',
      description: 'Éducation canine : obéissance, comportement, agilité',
      icon: '🎓',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    BOARDING: {
      label: 'Garde',
      description: 'Garde de votre animal chez un particulier',
      icon: '🏠',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    HOTEL: {
      label: 'Hôtel',
      description: 'Hébergement premium avec chambres, caméra et personnel',
      icon: '🏨',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    WALKING: {
      label: 'Promenade',
      description: 'Promenades en groupe ou individuelles pour chiens',
      icon: '🚶',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  };

  constructor(
    private router: Router,
    private categoryService: ServiceCategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.findAll().subscribe({
      next: (cats: ServiceCategory[]) => {
        this.categories = cats.map(cat => {
          const meta = this.categoryMeta[cat.name.toUpperCase()] ?? {
            label: cat.name,
            description: cat.description || 'Service spécialisé',
            icon: '🐾',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          };
          return { id: cat.id, name: cat.name, ...meta };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectCategory(cat: CategoryCard): void {
    this.router.navigate(
      ['/backoffice/services/new'],
      { queryParams: { categoryId: cat.id, categoryName: cat.name, categoryLabel: cat.label } }
    );
  }

  goBack(): void {
    this.router.navigate(['/backoffice/services']);
  }
}
