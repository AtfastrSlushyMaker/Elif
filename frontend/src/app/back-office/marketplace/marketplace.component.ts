import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ProductService, Product } from '../../shared/services/product.service';

interface Activity {
  title: string;
  time: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-back-office-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent implements OnInit {
  isAdmin = false;
  totalProducts = 0;
  activeProducts = 0;
  totalOrders = 0;
  totalRevenue = 0;

  recentActivities: Activity[] = [
    {
      title: 'Dashboard initialized',
      time: 'Just now',
      icon: 'fas fa-check-circle text-white',
      colorClass: 'bg-green-500'
    },
    {
      title: 'Admin access verified',
      time: '2 minutes ago',
      icon: 'fas fa-shield-alt text-white',
      colorClass: 'bg-blue-500'
    }
  ];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    if (!this.isAdmin) {
      console.warn('User is not admin');
      return;
    }

    this.loadDashboardStats();
  }

  /**
   * Load dashboard statistics
   */
  private loadDashboardStats(): void {
    // Load products
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.totalProducts = products.length;
        this.activeProducts = products.filter(p => p.active).length;
        
        // Calculate revenue (sum of prices)
        this.totalRevenue = products.reduce((sum, p) => sum + (p.price || 0), 0);
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });

    // Mock orders (you can load real orders later)
    this.totalOrders = 3; // Demo value
  }

  /**
   * Navigate to product management page
   */
  goToProductManagement(): void {
    this.router.navigate(['products'], { relativeTo: this.route });
  }
}

