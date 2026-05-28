import { Component, Input } from '@angular/core';
import { Resultado } from '../../../../core/services/votaciones.service';

@Component({
  selector: 'app-proyector-podium',
  templateUrl: './proyector-podium.component.html',
  styleUrls: ['./proyector-podium.component.scss']
})
export class ProyectorPodiumComponent {
  @Input() resultados: Resultado[] = [];
}
