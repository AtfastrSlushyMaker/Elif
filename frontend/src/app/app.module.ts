import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ❌ SUPPRIMER CET IMPORT
// import { PetSuggestionWizardComponent } from './front-office/adoption/components/pet-suggestion-wizard/pet-suggestion-wizard.component';

@NgModule({
  declarations: [
    AppComponent
    // ❌ SUPPRIMER PetSuggestionWizardComponent d'ici
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }