// back-office/events/models/admin-events.models.ts

// ─── Réexports front-office ───────────────────────────────────────────────────
export type { EventSummary, EventCategory, Page } from '../../../front-office/events/models/event.models';
import type { EventSummary, EventCategory, Page } from '../../../front-office/events/models/event.models';

// ─── Extension pour l'admin (ajout du compteur pending) ───────────────────────
export interface AdminEventSummary extends EventSummary {
  
  pendingCount: number;  // Nombre d'inscriptions en attente d'approbation
}

// ─── Alias ────────────────────────────────────────────────────────────────────
export type PageResponse<T> = Page<T>;
// back-office/events/models/admin-events.models.ts

// Ajouter cette interface après EventSummary
export interface EventDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  remainingSlots: number;
  coverImageUrl: string;
  status: string;
  category: EventCategory;
  organizerName: string;
  organizerId: number;
  createdAt: string;
  averageRating: number;
  reviewCount: number;
}
// ─── Capacité ─────────────────────────────────────────────────────────────────
export interface EventCapacityResponse {
  eventId:               number;
  eventTitle:            string;
  maxParticipants:       number;
  remainingSlots:        number;
  confirmedParticipants: number;
  pendingParticipants:   number;  // Inscrits en attente d'approbation
  waitlistCount:         number;
  fillRatePercent:       number;
  isFull:                boolean;
  hasWaitlist:           boolean;
  status:                string;  // PLANNED | FULL | ONGOING | COMPLETED | CANCELLED
}

// ─── Participant ──────────────────────────────────────────────────────────────
export interface EventParticipantResponse {
  id:             number;
  eventId:        number;
  eventTitle:     string;
  userId:         number;
  userName:       string;
  numberOfSeats:  number;
  status:         'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'ATTENDED';
  registeredAt:   string;
}

// ─── Liste d'attente ──────────────────────────────────────────────────────────
export interface WaitlistResponse {
  id:             number;
  eventId:        number;
  eventTitle:     string;
  userId:         number;
  userName:       string;
  numberOfSeats:  number;
  position:       number;
  peopleAhead:    number;
  joinedAt:       string;
  notified:       boolean;
}

// ─── Avis ─────────────────────────────────────────────────────────────────────
export interface EventReviewResponse {
  id:        number;
  eventId:   number;
  userId:    number;
  userName:  string;
  rating:    number;
  comment:   string;
  createdAt: string;
}

// ─── Météo ────────────────────────────────────────────────────────────────────
export interface WeatherResponse {
  temperature:       number;
  description:       string;
  icon:              string;
  humidity:          number;
  windSpeed:         number;
  condition:         'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY' | 'SNOWY' | 'UNKNOWN';
  recommendation:    'INDOOR' | 'OUTDOOR';
  recommendationMsg: string;
  eventDay:          boolean;
  city:              string;
}

// ─── Statistiques Admin ───────────────────────────────────────────────────────
export interface EventStatsResponse {
  totalEvents:       number;
  totalParticipants: number;
  eventsThisWeek:    number;
  eventsThisMonth:   number;
  averageFillRate:   number;
  eventsByStatus:    Record<string, number>;
  eventsByCategory:  Record<string, number>;
  monthlyTrend:      Record<string, number>;   // "2025-04" → count
  topEvents:         EventSummary[];
}

// ─── Rappels ──────────────────────────────────────────────────────────────────
export type ReminderType = 'J2' | 'H24' | 'H2';

export interface EventReminderInfo {
  id:           number;
  eventId:      number;
  eventTitle:   string;
  userId:       number;
  userEmail:    string;
  reminderTime: string;
  type:         ReminderType;
  sent:         boolean;
}

// ─── Tri table ────────────────────────────────────────────────────────────────
export type SortField     = 'title' | 'startDate' | 'status' | 'remainingSlots' | 'averageRating';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field:     SortField;
  direction: SortDirection;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface ToastMessage {
  id:      number;
  msg:     string;
  type:    'success' | 'error' | 'info' | 'warning';
  icon:    string;
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────
export interface ConfirmAction {
  title:    string;
  message:  string;
  label:    string;
  variant:  'danger' | 'warning';
  fn:       () => void;
}