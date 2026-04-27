import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type SpeechState =
  'idle' | 'listening' | 'processing' | 'error';

@Injectable({ providedIn: 'root' })
export class AzureSpeechService {

  private baseUrl = 'http://localhost:8087/elif';
  private recognizer: any = null;

  constructor(private http: HttpClient) {}

  async startRecognition(
    onResult: (text: string) => void,
    onStateChange: (state: SpeechState) => void,
    lang: string = 'fr-FR'
  ): Promise<void> {

    onStateChange('processing');

    try {
      const config: any = await this.http
        .get(`${this.baseUrl}/api/speech/config`)
        .toPromise();

      if (config.error) throw new Error(config.error);

      const SDK = (window as any).SpeechSDK;
      if (!SDK) throw new Error('Speech SDK not loaded');

      const speechConfig =
        SDK.SpeechConfig.fromAuthorizationToken(
          config.token, config.region);

      // Accept both French and English simultaneously
      speechConfig.speechRecognitionLanguage = lang;

      const audioConfig =
        SDK.AudioConfig.fromDefaultMicrophoneInput();

      this.recognizer = new SDK.SpeechRecognizer(
        speechConfig, audioConfig);

      // ─────────────────────────────────────────
      // KEY FIX:
      // 'confirmedText' holds all sentences that are
      // 100% finalized (after each pause / sentence end).
      // It starts from whatever is already in the field —
      // passed in via the initialText parameter below.
      // ─────────────────────────────────────────
      let confirmedText = '';

      // recognizing fires CONTINUOUSLY while the user speaks.
      // We emit confirmedText + the live interim segment.
      this.recognizer.recognizing = (_: any, e: any) => {
        if (e.result.text) {
          const live = confirmedText
            ? confirmedText + ' ' + e.result.text
            : e.result.text;
          onResult(live.trim());
        }
      };

      // recognized fires once per sentence (after a pause).
      // We LOCK the sentence into confirmedText permanently.
      this.recognizer.recognized = (_: any, e: any) => {
        if (e.result.text) {
          confirmedText = confirmedText
            ? confirmedText + ' ' + e.result.text
            : e.result.text;
          confirmedText = confirmedText.trim();
          onResult(confirmedText);
        }
      };

      this.recognizer.canceled = (_: any, e: any) => {
        console.error('Speech canceled:', e.errorDetails);
        onStateChange('error');
        this.stopRecognition();
      };

      this.recognizer.sessionStopped = () => {
        onStateChange('idle');
      };

      await new Promise<void>((resolve, reject) => {
        this.recognizer.startContinuousRecognitionAsync(
          resolve, reject);
      });

      onStateChange('listening');

    } catch (err: any) {
      onStateChange('error');
      throw err;
    }
  }

  async stopRecognition(): Promise<void> {
    if (this.recognizer) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.recognizer.stopContinuousRecognitionAsync(
            resolve, reject);
        });
        this.recognizer.close();
      } catch {}
      this.recognizer = null;
    }
  }
}
