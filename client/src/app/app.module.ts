import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddTutorialComponent } from './components/add-tutorial/add-tutorial.component';
// import { TutorialDetailsComponent } from './components/tutorial-details/tutorial-details.component';
import { TutorialsListComponent } from './components/tutorials-list/tutorials-list.component';

import { NgSelectModule } from '@ng-select/ng-select'; // Add NgSelectModule

@NgModule({
  declarations: [
    AppComponent,
    AddTutorialComponent,
    // TutorialDetailsComponent,
    TutorialsListComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Enable HttpClientModule for API calls
    FormsModule, // FormsModule for two-way binding with ngModel
    NgSelectModule, // Add NgSelectModule for the dropdown
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})

export class AppModule {}
