import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultadosRoutingModule } from './resultados-routing.module';
import { ResultadosComponent } from './pages/resultados/resultados.component';

@NgModule({
  declarations: [ResultadosComponent],
  imports: [CommonModule, ResultadosRoutingModule],
})
export class ResultadosModule {}
