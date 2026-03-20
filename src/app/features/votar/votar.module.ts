import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VotarRoutingModule } from './votar-routing.module';
import { VotarComponent } from './pages/votar/votar.component';

@NgModule({
  declarations: [VotarComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, VotarRoutingModule],
})
export class VotarModule {}
