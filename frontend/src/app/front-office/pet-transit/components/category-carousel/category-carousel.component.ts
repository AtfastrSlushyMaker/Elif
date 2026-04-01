import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  DESTINATION_TYPE_CONFIG,
  DestinationType
} from '../../models/travel-destination.model';

type CategoryItem = {
  label: string;
  icon: string;
  type: DestinationType | null;
  color: string;
  bgColor: string;
};

@Component({
  selector: 'app-category-carousel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './category-carousel.component.html',
  styleUrl: './category-carousel.component.scss'
})
export class CategoryCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedType: DestinationType | null = null;
  @Output() typeSelected = new EventEmitter<DestinationType | null>();

  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;

  readonly categories: CategoryItem[] = [
    {
      label: 'All Destinations',
      icon: 'pets',
      type: null,
      color: 'var(--color-primary)',
      bgColor: '#f0fdf4'
    },
    ...Object.entries(DESTINATION_TYPE_CONFIG).map(([key, value]) => ({
      label: value.label,
      icon: value.icon,
      type: key as DestinationType,
      color: value.color,
      bgColor: value.bgColor
    }))
  ];

  activeAutoIndex = 0;

  private autoPlayTimer: number | null = null;
  private resumeTimer: number | null = null;
  private hoverPaused = false;
  private manualPauseUntil = 0;

  ngOnInit(): void {
    this.syncIndexWithSelectedType();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedType']) {
      this.syncIndexWithSelectedType();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.clearResumeTimer();
  }

  onMouseEnter(): void {
    this.hoverPaused = true;
    this.stopAutoPlay();
  }

  onMouseLeave(): void {
    this.hoverPaused = false;

    if (Date.now() >= this.manualPauseUntil) {
      this.startAutoPlay();
      return;
    }

    this.scheduleResume();
  }

  onCategoryClick(category: CategoryItem, index: number): void {
    this.activeAutoIndex = index;
    this.typeSelected.emit(category.type);
  }

  scrollBackward(): void {
    const nextIndex = this.activeAutoIndex === 0 ? this.categories.length - 1 : this.activeAutoIndex - 1;
    this.activeAutoIndex = nextIndex;
  }

  scrollForward(): void {
    const nextIndex = this.activeAutoIndex === this.categories.length - 1 ? 0 : this.activeAutoIndex + 1;
    this.activeAutoIndex = nextIndex;
  }

  isActive(category: CategoryItem): boolean {
    return this.selectedType === category.type;
  }

  trackByCategory(index: number, category: CategoryItem): string {
    return `${category.label}-${index}`;
  }

  private syncIndexWithSelectedType(): void {
    const nextIndex = this.categories.findIndex((category) => category.type === this.selectedType);
    this.activeAutoIndex = nextIndex >= 0 ? nextIndex : 0;
  }

  private pauseAutoPlayForManualSelection(): void {
    this.manualPauseUntil = Date.now() + 5000;
    this.stopAutoPlay();

    if (!this.hoverPaused) {
      this.scheduleResume();
    }
  }

  private startAutoPlay(): void {
    if (this.autoPlayTimer !== null) {
      return;
    }

    this.autoPlayTimer = window.setInterval(() => {
      if (this.hoverPaused || Date.now() < this.manualPauseUntil) {
        return;
      }

      this.activeAutoIndex =
        this.activeAutoIndex >= this.categories.length - 1 ? 0 : this.activeAutoIndex + 1;
      this.scrollToCategory(this.activeAutoIndex);
    }, 3000);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer === null) {
      return;
    }

    window.clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = null;
  }

  private scheduleResume(): void {
    this.clearResumeTimer();
    const delay = Math.max(this.manualPauseUntil - Date.now(), 0);

    this.resumeTimer = window.setTimeout(() => {
      if (!this.hoverPaused) {
        this.startAutoPlay();
      }
    }, delay);
  }

  private clearResumeTimer(): void {
    if (this.resumeTimer === null) {
      return;
    }

    window.clearTimeout(this.resumeTimer);
    this.resumeTimer = null;
  }

  private scrollToCategory(index: number): void {
    void index;
    return;
  }
}
