import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Participante } from '../../../../core/services/participantes.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-votar-form',
  templateUrl: './votar-form.component.html',
  styleUrls: ['./votar-form.component.scss']
})
export class VotarFormComponent implements OnChanges {
  @Input() poetaActivo!: Participante | null;
  @Input() voteForm!: FormGroup;
  @Input() loading: boolean = false;

  @Output() submitVote = new EventEmitter<void>();

  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  puntuacionBase: number | null = null;
  tieneDecimal: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['poetaActivo'] && changes['poetaActivo'].currentValue) {
      // Resetear teclado cuando cambia el poeta
      this.puntuacionBase = null;
      this.tieneDecimal = false;
      this.puntuacion.setValue(null);
    }
  }

  get puntuacion(): FormControl {
    return this.voteForm.get('puntuacion') as FormControl;
  }

  get puntuacionFinal(): number | null {
    if (this.puntuacionBase === null) return null;
    if (this.puntuacionBase === 10) return 10;
    return this.tieneDecimal ? this.puntuacionBase + 0.5 : this.puntuacionBase;
  }

  get etiquetaPuntuacion(): { texto: string; icono: string } {
    const nota = this.puntuacionFinal;
    if (nota === null) return { texto: 'SELECCIONA UNA NOTA', icono: 'none' };
    if (nota <= 3.5) return { texto: 'MEJORABLE', icono: 'hourglass' };
    if (nota <= 5.5) return { texto: 'CORRECTO', icono: 'scroll' };
    if (nota <= 7.5) return { texto: 'BUEN RECITADO', icono: 'lyre' };
    if (nota <= 8.5) return { texto: 'GRAN ACTUACIÓN', icono: 'quill' };
    return { texto: 'MAGIA ESCÉNICA', icono: 'crown' };
  }

  get colorTermico(): string {
    const nota = this.puntuacionFinal;
    if (nota === null) return '#94a3b8';
    if (nota <= 3.5) return '#ef4444';
    if (nota <= 5.5) return '#f59e0b';
    if (nota <= 7.5) return '#06b6d4';
    if (nota <= 8.5) return '#10b981';
    return '#7AE92B';
  }

  seleccionarNumero(n: number): void {
    this.puntuacionBase = n;
    if (n === 10) {
      this.tieneDecimal = false;
    }
    this.actualizarFormulario();
  }

  toggleDecimal(): void {
    if (this.puntuacionBase === null || this.puntuacionBase === 10) return;
    this.tieneDecimal = !this.tieneDecimal;
    this.actualizarFormulario();
  }

  private actualizarFormulario(): void {
    this.puntuacion.setValue(this.puntuacionFinal);
    this.puntuacion.markAsDirty();
  }

  onSubmit() {
    if (this.puntuacionFinal === null || this.loading) return;
    this.submitVote.emit();
  }
}
