import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessoriesListComponent } from './components/accessories/accessories.component';

const routes: Routes = [
  // { path: '', redirectTo: 'tutorials', pathMatch: 'full' },
  { path: '', component: AccessoriesListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
