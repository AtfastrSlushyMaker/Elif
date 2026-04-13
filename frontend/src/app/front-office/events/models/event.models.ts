// ============================================
// MODÈLES DE BASE (Partagés)
// ============================================

export interface EventCategory {
  id: number;
  name: string;
  icon: string | null;
  description: string;
  requiresApproval: boolean;
}

export interface EventSummary {
  id: number;
  title: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  remainingSlots: number;
  coverImageUrl: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'FULL';
  category: EventCategory | null;
  organizerName: string;
  organizerId?: number;
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
}

export interface EventDetail extends EventSummary {
  suggestedEvents?: EventSummary[];
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================
// INSCRIPTIONS & LISTE D'ATTENTE
// ============================================

export interface EventParticipantRequest {
  numberOfSeats: number;
  animalName?: string;
  animalBreed?: string;
  animalWeight?: number;
  animalHeight?: number;
  animalPhoto?: string;
  animalAge?: number;
  additionalInfo?: string;
}

export interface EventParticipantResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  numberOfSeats: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED';
  registeredAt: string;
}

export interface WaitlistResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  numberOfSeats: number;
  position: number;
  peopleAhead: number;
  joinedAt: string;
  notified: boolean;
}

// ============================================
// MÉTÉO
// ============================================

export interface WeatherResponse {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  condition: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY' | 'SNOWY';
  recommendation: 'INDOOR' | 'OUTDOOR';
  recommendationMsg: string;
  eventDay: boolean;
  city: string;
}

// ============================================
// AVIS
// ============================================

export interface EventReviewRequest {
  rating: number;
  comment: string;
}

export interface EventReviewResponse {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================
// UI HELPERS
// ============================================

export const STATUS_LABELS: Record<string, string> = {
  'PLANNED': 'Upcoming',
  'ONGOING': 'In Progress',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Cancelled',
  'FULL': 'Full'
};

export const STATUS_COLORS: Record<string, string> = {
  'PLANNED': '#2d7a4f',
  'ONGOING': '#805ad5',
  'COMPLETED': '#6b7280',
  'CANCELLED': '#e53e3e',
  'FULL': '#e07a20'
};

export const SORT_OPTIONS = [
  { value: 'startDate,asc', label: '📅 Closest first' },
  { value: 'startDate,desc', label: '📅 Farthest first' },
  { value: 'averageRating,desc', label: '⭐ Best rated' },
  { value: 'remainingSlots,asc', label: '🔥 Almost full' },
];
export interface EventRecommendation {
  event: EventSummary;
  score: number;
  reason: string;
  matchedByCategory: boolean;
  matchedByPopularity: boolean;
  matchedByRating: boolean;
  breakdown?: {
    categoryScore: number;
    popularityScore: number;
    ratingScore: number;
    proximityScore: number;
    slotsScore: number;
    totalScore: number;
  };
  }