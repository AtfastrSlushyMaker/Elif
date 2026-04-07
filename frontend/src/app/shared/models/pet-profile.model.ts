export type PetSpecies = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'HAMSTER' | 'FISH' | 'REPTILE' | 'OTHER';
export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

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
