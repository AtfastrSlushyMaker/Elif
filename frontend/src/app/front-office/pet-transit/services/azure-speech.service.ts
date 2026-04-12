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
      speechConfig.speechRecognitionLanguage = lang;

      const audioConfig =
        SDK.AudioConfig.fromDefaultMicrophoneInput();

      this.recognizer = new SDK.SpeechRecognizer(
        speechConfig, audioConfig);

      let accumulated = '';

      this.recognizer.recognizing = (_: any, e: any) => {
        if (e.result.text) {
          onResult(accumulated + ' ' + e.result.text);
        }
      };

      this.recognizer.recognized = (_: any, e: any) => {
        if (e.result.text) {
          accumulated = (accumulated + ' ' + e.result.text)
            .trim();
          onResult(accumulated);
        }
      };

      this.recognizer.canceled = () => {
        onStateChange('error');
        this.stopRecognition();
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
