import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MarketplaceComponent } from './marketplace.component';
import { MarketplaceRoutingModule } from './marketplace-routing.module';

@NgModule({
  declarations: [MarketplaceComponent],
  imports: [
    CommonModule,
    SharedModule,
    MarketplaceRoutingModule
  ]
})
export class MarketplaceModule {}
