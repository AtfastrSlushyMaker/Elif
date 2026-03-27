export type TransportType = 'CAR' | 'TRAIN' | 'PLANE' | 'BUS';

export type TravelPlanStatus =
  | 'DRAFT'
  | 'IN_PREPARATION'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SafetyStatus = 'PENDING' | 'VALID' | 'ALERT' | 'INVALID';

export interface TravelPlanCreateRequest {
  petId: number;
  destinationId: number;
  origin: string;
  transportType: TransportType;
  travelDate: string;
  returnDate: string;
  estimatedTravelHours: number;
  estimatedTravelCost: number;
  currency: string;
  animalWeight: number;
  cageLength: number;
  cageWidth: number;
  cageHeight: number;
  hydrationIntervalMinutes: number;
  requiredStops: number;
}

export interface TravelPlanUpdateRequest {
  origin: string;
  transportType: TransportType;
  travelDate: string;
  returnDate: string;
  estimatedTravelHours: number;
  estimatedTravelCost: number;
  currency: string;
  animalWeight: number;
  cageLength: number;
  cageWidth: number;
  cageHeight: number;
  hydrationIntervalMinutes: number;
  requiredStops: number;
}

export interface TravelPlanSummary {
  id: number;
  destinationTitle: string;
  destinationCountry: string;
  travelDate: string;
  status: TravelPlanStatus;
  readinessScore: number;
  safetyStatus: SafetyStatus;
  createdAt: string;
}

export interface TravelPlan {
  id: number;
  ownerId: number;
  ownerName?: string;
  petId: number;
  destinationId: number;
  destinationTitle: string;
  destinationCountry: string;
  origin: string;
  transportType: TransportType;
  travelDate: string;
  returnDate: string;
  estimatedTravelHours: number;
  estimatedTravelCost: number;
  currency: string;
  animalWeight: number;
  cageLength: number;
  cageWidth: number;
  cageHeight: number;
  hydrationIntervalMinutes: number;
  requiredStops: number;
  readinessScore: number;
  safetyStatus: SafetyStatus;
  status: TravelPlanStatus;
  adminDecisionComment?: string;
  reviewedByAdminName?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  CAR: 'Car',
  TRAIN: 'Train',
  PLANE: 'Plane',
  BUS: 'Bus'
};

export const TRAVEL_PLAN_STATUS_CONFIG: Record<
  TravelPlanStatus,
  { label: string; iconClass: string; color: string; bgColor: string }
> = {
  DRAFT: {
    label: 'Draft',
    iconClass: 'fa-solid fa-pen-to-square',
    color: '#6b7280',
    bgColor: '#f3f4f6'
  },
  IN_PREPARATION: {
    label: 'In Preparation',
    iconClass: 'fa-solid fa-route',
    color: '#2563eb',
    bgColor: '#dbeafe'
  },
  SUBMITTED: {
    label: 'Submitted',
    iconClass: 'fa-solid fa-paper-plane',
    color: '#7c3aed',
    bgColor: '#ede9fe'
  },
  APPROVED: {
    label: 'Approved',
    iconClass: 'fa-solid fa-circle-check',
    color: '#15803d',
    bgColor: '#dcfce7'
  },
  REJECTED: {
    label: 'Rejected',
    iconClass: 'fa-solid fa-circle-xmark',
    color: '#b91c1c',
    bgColor: '#fee2e2'
  },
  COMPLETED: {
    label: 'Completed',
    iconClass: 'fa-solid fa-flag-checkered',
    color: '#0f766e',
    bgColor: '#ccfbf1'
  },
  CANCELLED: {
    label: 'Cancelled',
    iconClass: 'fa-solid fa-ban',
    color: '#9a3412',
    bgColor: '#ffedd5'
  }
};

export const SAFETY_STATUS_CONFIG: Record<
  SafetyStatus,
  { label: string; iconClass: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: 'Pending',
    iconClass: 'fa-solid fa-clock',
    color: '#6b7280',
    bgColor: '#f3f4f6'
  },
  VALID: {
    label: 'Valid',
    iconClass: 'fa-solid fa-shield-heart',
    color: '#15803d',
    bgColor: '#dcfce7'
  },
  ALERT: {
    label: 'Alert',
    iconClass: 'fa-solid fa-triangle-exclamation',
    color: '#b45309',
    bgColor: '#fef3c7'
  },
  INVALID: {
    label: 'Invalid',
    iconClass: 'fa-solid fa-octagon-exclamation',
    color: '#b91c1c',
    bgColor: '#fee2e2'
  }
};

export const EDITABLE_TRAVEL_PLAN_STATUSES: TravelPlanStatus[] = ['DRAFT', 'IN_PREPARATION'];

export const DELETABLE_TRAVEL_PLAN_STATUSES: TravelPlanStatus[] = [
  'DRAFT',
  'IN_PREPARATION',
  'REJECTED',
  'CANCELLED',
  'COMPLETED'
];
