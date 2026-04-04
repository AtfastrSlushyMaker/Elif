import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GifResult, GifService } from '../../services/gif.service';

export interface GifPickerDialogData {
  initialQuery?: string;
  title?: string;
}

@Component({
  selector: 'app-gif-picker-dialog',
  templateUrl: './gif-picker-dialog.component.html',
  styleUrl: './gif-picker-dialog.component.css'
})
export class GifPickerDialogComponent implements OnInit {
  query = 'funny';
  loading = false;
  error = '';
  results: GifResult[] = [];

  constructor(
    private gifService: GifService,
    private dialogRef: MatDialogRef<GifPickerDialogComponent, GifResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: GifPickerDialogData
  ) {}

  ngOnInit(): void {
    this.query = this.data.initialQuery?.trim() || this.query;
    this.search();
  }

  search(): void {
    const trimmed = this.query.trim();
    if (!trimmed) {
      this.error = 'Enter a search term.';
      this.results = [];
      return;
    }

    this.loading = true;
    this.error = '';
    this.gifService.search(trimmed).subscribe({
      next: (results) => {
        this.results = results;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load GIFs.';
        this.loading = false;
      }
    });
  }

  selectGif(gif: GifResult): void {
    this.dialogRef.close(gif);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
