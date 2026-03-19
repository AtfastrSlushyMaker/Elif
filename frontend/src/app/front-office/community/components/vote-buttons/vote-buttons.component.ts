import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-vote-buttons',
  templateUrl: './vote-buttons.component.html',
  styleUrl: './vote-buttons.component.css'
})
export class VoteButtonsComponent {
  @Input() score = 0;
  @Input() userVote: 1 | -1 | null = null;
  @Output() voted = new EventEmitter<1 | -1>();

  vote(value: 1 | -1): void {
    this.voted.emit(value);
  }
}
