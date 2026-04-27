import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceComponent } from './marketplace.component';
import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { ProductManagementComponent } from './product-management/product-management.component';
import { OrdersComponent } from './orders/orders.component';
import { ReclamationsComponent } from './reclamations/reclamations.component';
import { InventoryForecastComponent } from './inventory-forecast/inventory-forecast.component';

@NgModule({
  declarations: [MarketplaceComponent, ProductManagementComponent, OrdersComponent, ReclamationsComponent, InventoryForecastComponent],
  imports: [
    CommonModule,
    FormsModule,
    MarketplaceRoutingModule
  ]
})
export class MarketplaceModule {}
