import { Component, Input } from '@angular/core';
import { Resultado } from '../../../../core/services/votaciones.service';

@Component({
  selector: 'app-proyector-vibe-list',
  templateUrl: './proyector-vibe-list.component.html',
  styleUrls: ['./proyector-vibe-list.component.scss']
})
export class ProyectorVibeListComponent {
  @Input() resultados: Resultado[] = [];
}
