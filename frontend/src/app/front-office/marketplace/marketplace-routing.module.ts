import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';

const routes: Routes = [
  { path: '', component: MarketplaceComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceRoutingModule {}
