// front-office/events/models/event.models.ts
// Aligné exactement avec les DTOs Java du backend ELIFEvents

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Page<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  size:             number;
  number:           number;   // page courante (0-based)
  first:            boolean;
  last:             boolean;
  numberOfElements: number;
}

// ─── Catégorie (EventCategoryResponse.java) ───────────────────────────────────
export interface EventCategory {
  id:               number;
  name:             string;
  icon:             string | null;
  description:      string | null;
  requiresApproval: boolean;   // true = mode compétition → inscription PENDING
}

// ─── Statuts (alignés avec EventStatus.java) ──────────────────────────────────
export type EventStatus = 'PLANNED' | 'ONGOING' | 'FULL' | 'COMPLETED' | 'CANCELLED';
export type ParticipantStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'ATTENDED';
export type WeatherCondition  = 'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY' | 'SNOWY' | 'UNKNOWN';
export type WeatherRec        = 'INDOOR' | 'OUTDOOR';
export type ReminderType      = 'J2' | 'H24' | 'H2';

// ─── EventSummaryResponse.java ────────────────────────────────────────────────
export interface EventSummary {
  id:              number;
  title:           string;
  location:        string;
  startDate:       string;       // ISO-8601
  endDate:         string;
  maxParticipants: number;
  remainingSlots:  number;
  coverImageUrl:   string | null;
  status:          EventStatus;
  category:        EventCategory | null;
  organizerName:   string | null;
  averageRating:   number;       // 0.0–5.0
  reviewCount:     number;
}

// ─── EventDetailResponse.java ─────────────────────────────────────────────────
export interface EventDetail extends EventSummary {
  description:     string | null;
  organizerId:     number | null;
  createdAt:       string;
  suggestedEvents: EventSummary[];
}

// ─── EventParticipantResponse.java ────────────────────────────────────────────
export interface EventParticipant {
  id:            number;
  eventId:       number;
  eventTitle:    string;
  userId:        number | null;
  userName:      string | null;
  numberOfSeats: number;
  status:        ParticipantStatus;
  registeredAt:  string;
}

// ─── WaitlistResponse.java ────────────────────────────────────────────────────
export interface WaitlistEntry {
  id:            number;
  eventId:       number;
  eventTitle:    string;
  userId:        number;
  userName:      string;
  numberOfSeats: number;
  position:      number;
  peopleAhead:   number;
  joinedAt:      string;
  notified:      boolean;
}

// ─── EventReviewResponse.java ─────────────────────────────────────────────────
export interface EventReview {
  id:        number;
  eventId:   number;
  userId:    number;
  userName:  string;
  rating:    number;   // 1–5
  comment:   string | null;
  createdAt: string;
}

// ─── WeatherResponse.java ─────────────────────────────────────────────────────
export interface WeatherData {
  temperature:       number;
  description:       string;
  icon:              string;
  humidity:          number;
  windSpeed:         number;
  condition:         WeatherCondition;
  recommendation:    WeatherRec;
  recommendationMsg: string;
  eventDay:          boolean;
  city:              string;
}

// ─── Request bodies ───────────────────────────────────────────────────────────
// POST /api/events/{id}/join  et  POST /api/events/{id}/waitlist
export interface ParticipantRequest {
  numberOfSeats: number;
}

// POST /api/events/{id}/reviews  &  PUT /api/events/reviews/{id}
export interface ReviewRequest {
  rating:  number;    // 1–5
  comment: string;
}

// ─── État local de la registration (UI state) ─────────────────────────────────
export type RegistrationState =
  | 'none'           // non inscrit
  | 'confirmed'      // CONFIRMED
  | 'pending'        // PENDING (mode compétition)
  | 'on_waitlist'    // sur liste d'attente
  | 'cancelled';     // CANCELLED

// ─── Filtres liste événements ─────────────────────────────────────────────────
export interface EventFilters {
  keyword:     string;
  categoryId:  number | null;
  page:        number;
  size:        number;
  sort:        string;   // ex: "startDate,asc"
}

// ─── Maps utilitaires ─────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<EventStatus, string> = {
  PLANNED:   'Planifié',
  ONGOING:   'En cours',
  FULL:      'Complet',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

export const STATUS_COLORS: Record<EventStatus, string> = {
  PLANNED:   '#6c63ff',
  ONGOING:   '#34d399',
  FULL:      '#fb923c',
  COMPLETED: '#60a5fa',
  CANCELLED: '#f87171',
};

export const WEATHER_ICONS: Record<WeatherCondition, string> = {
  SUNNY:   '☀️',
  CLOUDY:  '⛅',
  RAINY:   '🌧️',
  STORMY:  '⛈️',
  SNOWY:   '❄️',
  UNKNOWN: '🌤️',
};