import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent, ButtonComponent, CardComponent],
  imports: [CommonModule, RouterModule, MatIconModule],
  exports: [NavbarComponent, SidebarComponent, ButtonComponent, CardComponent, MatIconModule]
})
export class SharedModule {}
