import { Component, Input } from '@angular/core';
import { Resultado } from '../../../../core/services/votaciones.service';

@Component({
  selector: 'app-proyector-vibe-list',
  templateUrl: './proyector-vibe-list.component.html',
  styleUrls: ['./proyector-vibe-list.component.scss']
})
export class ProyectorVibeListComponent {
  @Input() resultados: Resultado[] = [];

  getBadgeInfo(puntuacionMedia: number): { texto: string; icono: string; color: string } {
    const nota = Number(puntuacionMedia) || 0;
    if (nota >= 9.0) return { texto: 'MAGIA ESCÉNICA', icono: 'star', color: '#7AE92B' };
    if (nota >= 8.0) return { texto: 'GRAN ACTUACIÓN', icono: 'flame', color: '#10b981' };
    if (nota >= 6.0) return { texto: 'BUEN RECITADO', icono: 'spark', color: '#06b6d4' };
    if (nota >= 4.0) return { texto: 'CORRECTO', icono: 'check', color: '#f59e0b' };
    return { texto: 'MEJORABLE', icono: 'alert', color: '#ef4444' };
  }
}
