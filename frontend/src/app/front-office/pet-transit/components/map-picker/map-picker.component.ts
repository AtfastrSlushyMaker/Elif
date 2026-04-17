import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() readonly = false;
  @Input() height = '320px';
  @Input() markerLabel = '';

  @Output() readonly locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild('mapContainer', { static: true }) private readonly mapContainer!: ElementRef<HTMLDivElement>;

  selectedLat: number | null = null;
  selectedLng: number | null = null;

  private leafletNamespace: typeof import('leaflet') | null = null;
  private map: import('leaflet').Map | null = null;
  private marker: import('leaflet').Marker | null = null;
  private customIcon: import('leaflet').DivIcon | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngAfterViewInit(): Promise<void> {
    const L = await import('leaflet');
    this.leafletNamespace = L;

    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'assets/leaflet/marker-icon.png',
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const defaultCenter: [number, number] = [36.8065, 10.1815];
    const center: [number, number] =
      this.latitude != null && this.longitude != null ? [this.latitude, this.longitude] : defaultCenter;

    this.map = L.map(this.mapContainer.nativeElement, {
      center,
      zoom: this.latitude != null ? 10 : 5,
      scrollWheelZoom: !this.readonly
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">' +
        'OpenStreetMap</a> contributors',
      maxZoom: 19,
      crossOrigin: true
    }).addTo(this.map);

    this.customIcon = L.divIcon({
      className: '',
      html: `<div class="map-marker-pin">
             <span class="material-icons-round">place</span>
           </div>`,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44]
    });

    if (this.latitude != null && this.longitude != null) {
      this.placeMarker(this.latitude, this.longitude);
      this.selectedLat = this.latitude;
      this.selectedLng = this.longitude;

      if (this.readonly && this.markerLabel) {
        this.marker?.bindPopup(this.markerLabel).openPopup();
      }
    }

    if (!this.readonly) {
      this.map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        this.placeMarker(lat, lng);
        this.locationSelected.emit({ lat, lng });
        this.selectedLat = lat;
        this.selectedLng = lng;
        this.cdr.markForCheck();
      });
    }

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private placeMarker(lat: number, lng: number): void {
    if (!this.map || !this.leafletNamespace || !this.customIcon) {
      return;
    }

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.leafletNamespace.marker([lat, lng], { icon: this.customIcon }).addTo(this.map);
    }

    if (this.readonly && this.markerLabel) {
      this.marker.bindPopup(this.markerLabel).openPopup();
    }
  }
}
