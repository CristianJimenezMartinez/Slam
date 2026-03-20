import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotarComponent } from './pages/votar/votar.component';

const routes: Routes = [{ path: '', component: VotarComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VotarRoutingModule {}
