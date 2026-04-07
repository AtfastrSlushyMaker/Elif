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
