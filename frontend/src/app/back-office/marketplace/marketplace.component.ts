import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ProductService, Product } from '../../shared/services/product.service';
import { CartService, Order } from '../../shared/services/cart.service';

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
  orders: Order[] = [];

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
    private cartService: CartService,
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
    // Load products stats
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.totalProducts = products.length;
        this.activeProducts = products.filter(p => p.active).length;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });

    // Load order stats + table
    this.cartService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => {
          const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return right - left;
        });
        this.totalOrders = this.orders.length;
        this.totalRevenue = this.orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
      }
    });
  }

  /**
   * Navigate to product management page
   */
  goToProductManagement(): void {
    this.router.navigate(['products'], { relativeTo: this.route });
  }
}

