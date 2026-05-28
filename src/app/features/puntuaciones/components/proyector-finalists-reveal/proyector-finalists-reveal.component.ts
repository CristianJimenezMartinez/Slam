import { Component, Input } from '@angular/core';
import { Resultado } from '../../../../core/services/votaciones.service';

@Component({
  selector: 'app-proyector-finalists-reveal',
  templateUrl: './proyector-finalists-reveal.component.html',
  styleUrls: ['./proyector-finalists-reveal.component.scss']
})
export class ProyectorFinalistsRevealComponent {
  @Input() finalistas: Resultado[] = [];
}
