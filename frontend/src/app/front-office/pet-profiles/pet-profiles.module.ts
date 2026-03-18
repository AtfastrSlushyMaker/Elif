import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { PetProfilesComponent } from './pet-profiles.component';
import { PetProfilesRoutingModule } from './pet-profiles-routing.module';

@NgModule({
  declarations: [PetProfilesComponent],
  imports: [
    CommonModule,
    SharedModule,
    PetProfilesRoutingModule
  ]
})
export class PetProfilesModule {}
