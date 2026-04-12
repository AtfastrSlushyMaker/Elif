export type PetSpecies = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'HAMSTER' | 'FISH' | 'REPTILE' | 'OTHER';
export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';
export type PetTaskStatus = 'NOW' | 'NEXT' | 'DONE';
export type PetTaskUrgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PetTaskRecurrence = 'NONE' | 'DAILY' | 'WEEKLY';

export interface PetProfile {
  id: number;
  userId: number;
  name: string;
  weight: number | null;
  species: PetSpecies;
  breed: string | null;
  dateOfBirth: string | null;
  ageDisplay: string; 
  gender: PetGender;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  locationUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetProfilePayload {
  name: string;
  weight: number | null;
  species: PetSpecies;
  breed: string | null;
  dateOfBirth: string | null;
  gender: PetGender;
  photoUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PetHealthRecord {
  id: number;
  petId: number;
  recordDate: string;
  visitType: string;
  veterinarian: string | null;
  clinicName: string | null;
  bloodType: string | null;
  spayedNeutered: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  previousOperations: string | null;
  vaccinationHistory: string | null;
  specialDiet: string | null;
  parasitePrevention: string | null;
  emergencyInstructions: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medications: string | null;
  notes: string | null;
  nextVisitDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetHealthRecordPayload {
  recordDate: string;
  visitType: string;
  veterinarian: string | null;
  clinicName: string | null;
  bloodType: string | null;
  spayedNeutered: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  previousOperations: string | null;
  vaccinationHistory: string | null;
  specialDiet: string | null;
  parasitePrevention: string | null;
  emergencyInstructions: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medications: string | null;
  notes: string | null;
  nextVisitDate: string | null;
}

export interface PetCareTask {
  id: number;
  petId: number;
  title: string;
  category: string;
  urgency: PetTaskUrgency;
  status: PetTaskStatus;
  dueDate: string | null;
  notes: string | null;
  recurrence: PetTaskRecurrence;
  createdAt: string;
  updatedAt: string;
}

export interface PetCareTaskPayload {
  title: string;
  category: string;
  urgency: PetTaskUrgency;
  status: PetTaskStatus;
  dueDate: string | null;
  notes: string | null;
  recurrence: PetTaskRecurrence;
}

export interface AdminPetBulkUpdatePayload {
  petIds: number[];
  species?: PetSpecies;
  gender?: PetGender;
  breed?: string;
}

export interface AdminPetBulkDeletePayload {
  petIds: number[];
}

export interface AdminPetBulkOperationResult {
  requested: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export interface AdminPetDashboardStats {
  totalPets: number;
  petsWithPhoto: number;
  petsWithGps: number;
  createdLast30Days: number;
  updatedLast7Days: number;
  speciesBreakdown: Record<string, number>;
}
