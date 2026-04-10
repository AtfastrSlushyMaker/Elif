import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PetProfilesComponent } from './pet-profiles.component';
import { PetProfileDetailComponent } from './pet-profile-detail.component';
import { PetProfilesRoutingModule } from './pet-profiles-routing.module';

@NgModule({
  declarations: [PetProfilesComponent, PetProfileDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PetProfilesRoutingModule
  ]
})
export class PetProfilesModule {}
