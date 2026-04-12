import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AzureSpeechService, SpeechState } from '../../services/azure-speech.service';

@Component({
  selector: 'app-speech-mic-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './speech-mic-button.component.html',
  styleUrl: './speech-mic-button.component.scss'
})
export class SpeechMicButtonComponent implements OnDestroy {
  @Input() targetFieldId: string = '';
  @Output() textRecognized = new EventEmitter<string>();
  @Output() stateChanged = new EventEmitter<SpeechState>();

  state: SpeechState = 'idle';
  isListening = false;

  constructor(private readonly speechService: AzureSpeechService) {}

  async toggleRecording(): Promise<void> {
    if (this.state === 'processing') {
      return;
    }

    if (this.state === 'idle' || this.state === 'error') {
      try {
        await this.speechService.startRecognition(
          (text) => this.textRecognized.emit(text),
          (state) => {
            this.state = state;
            this.stateChanged.emit(state);
          }
        );
        this.isListening = true;
      } catch {
        this.state = 'error';
        this.stateChanged.emit(this.state);
        this.isListening = false;
      }
      return;
    }

    if (this.state === 'listening') {
      await this.speechService.stopRecognition();
      this.state = 'idle';
      this.stateChanged.emit(this.state);
      this.isListening = false;
    }
  }

  getLabel(): string {
    switch (this.state) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Starting...';
      case 'error':
        return 'Try again';
      case 'idle':
      default:
        return 'Voice input';
    }
  }

  getTooltip(): string {
    switch (this.state) {
      case 'listening':
        return 'Click to stop recording';
      case 'processing':
        return 'Initializing microphone...';
      case 'error':
        return 'Microphone error. Click to retry.';
      case 'idle':
      default:
        return 'Click to start voice input';
    }
  }

  ngOnDestroy(): void {
    void this.speechService.stopRecognition();
  }
}
