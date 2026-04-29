import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Participante } from '../../../../core/services/participantes.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-votar-form',
  templateUrl: './votar-form.component.html'
})
export class VotarFormComponent {
  @Input() poetaActivo!: Participante | null;
  @Input() voteForm!: FormGroup;
  @Input() loading: boolean = false;
  @Input() opcionesVoto: any[] = [];

  @Output() submitVote = new EventEmitter<void>();

  get puntuacion(): FormControl {
    return this.voteForm.get('puntuacion') as FormControl;
  }

  onSubmit() {
    this.submitVote.emit();
  }
}
