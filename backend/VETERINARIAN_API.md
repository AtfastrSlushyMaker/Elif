# API Veterinarian - Documentation

Cette documentation couvre l'API REST pour la gestion des vétérinaires.

## Base URL
```
http://localhost:8080/api/veterinarians
```

## Endpoints

### 1. Récupérer tous les vétérinaires
**GET** `/api/veterinarians`

```bash
curl -X GET http://localhost:8080/api/veterinarians
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Dr. Jean Dubois",
    "email": "jean@clinic.com",
    "phone": "06 12 34 56 78",
    "speciality": "Chirurgie",
    "experienceYears": 10,
    "clinicAddress": "123 Rue de la Paix, Paris",
    "available": true
  }
]
```

---

### 2. Récupérer un vétérinaire par ID
**GET** `/api/veterinarians/{id}`

```bash
curl -X GET http://localhost:8080/api/veterinarians/1
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Dr. Jean Dubois",
  "email": "jean@clinic.com",
  "phone": "06 12 34 56 78",
  "speciality": "Chirurgie",
  "experienceYears": 10,
  "clinicAddress": "123 Rue de la Paix, Paris",
  "available": true
}
```

**Response (404):** Si le vétérinaire n'existe pas
```json
{
  "timestamp": "2026-03-26T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Veterinarian not found with id: 999"
}
```

---

### 3. Récupérer tous les vétérinaires disponibles
**GET** `/api/veterinarians/available`

```bash
curl -X GET http://localhost:8080/api/veterinarians/available
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Dr. Jean Dubois",
    "email": "jean@clinic.com",
    "phone": "06 12 34 56 78",
    "speciality": "Chirurgie",
    "experienceYears": 10,
    "clinicAddress": "123 Rue de la Paix, Paris",
    "available": true
  }
]
```

---

### 4. Récupérer les vétérinaires par spécialité
**GET** `/api/veterinarians/speciality/{speciality}`

```bash
curl -X GET http://localhost:8080/api/veterinarians/speciality/Dentiste
```

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Dr. Marie Martin",
    "email": "marie@dental.com",
    "phone": "06 98 76 54 32",
    "speciality": "Dentiste",
    "experienceYears": 8,
    "clinicAddress": "456 Avenue des Dents, Lyon",
    "available": true
  }
]
```

---

### 5. Créer un nouveau vétérinaire
**POST** `/api/veterinarians`

```bash
curl -X POST http://localhost:8080/api/veterinarians \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Pierre Laurent",
    "email": "pierre@clinic.com",
    "phone": "06 11 22 33 44",
    "speciality": "Chirurgie",
    "experienceYears": 15,
    "clinicAddress": "789 Boulevard de la Santé, Marseille",
    "available": true
  }'
```

**Request Body (VeterinarianDTO):**
```json
{
  "name": "Dr. Pierre Laurent",
  "email": "pierre@clinic.com",
  "phone": "06 11 22 33 44",
  "speciality": "Chirurgie",
  "experienceYears": 15,
  "clinicAddress": "789 Boulevard de la Santé, Marseille",
  "available": true
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Dr. Pierre Laurent",
  "email": "pierre@clinic.com",
  "phone": "06 11 22 33 44",
  "speciality": "Chirurgie",
  "experienceYears": 15,
  "clinicAddress": "789 Boulevard de la Santé, Marseille",
  "available": true
}
```

---

### 6. Mettre à jour un vétérinaire
**PUT** `/api/veterinarians/{id}`

```bash
curl -X PUT http://localhost:8080/api/veterinarians/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jean Dubois (Retraité)",
    "email": "jean.new@clinic.com",
    "phone": "06 12 34 56 78",
    "speciality": "Chirurgie générale",
    "experienceYears": 12,
    "clinicAddress": "123 Rue de la Paix, Paris",
    "available": false
  }'
```

**Request Body (VeterinarianDTO - tous les champs sont optionnels):**
```json
{
  "name": "Dr. Jean Dubois (Retraité)",
  "email": "jean.new@clinic.com",
  "phone": "06 12 34 56 78",
  "speciality": "Chirurgie générale",
  "experienceYears": 12,
  "clinicAddress": "123 Rue de la Paix, Paris",
  "available": false
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Dr. Jean Dubois (Retraité)",
  "email": "jean.new@clinic.com",
  "phone": "06 12 34 56 78",
  "speciality": "Chirurgie générale",
  "experienceYears": 12,
  "clinicAddress": "123 Rue de la Paix, Paris",
  "available": false
}
```

---

### 7. Mettre à jour la disponibilité d'un vétérinaire
**PATCH** `/api/veterinarians/{id}/availability?available={true|false}`

```bash
curl -X PATCH "http://localhost:8080/api/veterinarians/1/availability?available=true"
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Dr. Jean Dubois",
  "email": "jean@clinic.com",
  "phone": "06 12 34 56 78",
  "speciality": "Chirurgie",
  "experienceYears": 10,
  "clinicAddress": "123 Rue de la Paix, Paris",
  "available": true
}
```

---

### 8. Supprimer un vétérinaire
**DELETE** `/api/veterinarians/{id}`

```bash
curl -X DELETE http://localhost:8080/api/veterinarians/1
```

**Response (204):** Pas de contenu

---

## Codes de réponse HTTP

| Code | Description |
|------|-------------|
| 200 | OK - Succès de la requête |
| 201 | Created - Ressource créée avec succès |
| 204 | No Content - Suppression réussie |
| 404 | Not Found - Ressource non trouvée |
| 400 | Bad Request - Requête invalide |
| 500 | Internal Server Error - Erreur serveur |

---

## Types d'erreurs

### ResourceNotFoundException
Levée quand un vétérinaire n'est pas trouvé.

```json
{
  "timestamp": "2026-03-26T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Veterinarian not found with id: 999"
}
```

---

## Exemples avec JavaScript/TypeScript Angular

### Créer un vétérinaire
```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {}

createVeterinarian(vet: VeterinarianDTO) {
  return this.http.post('/api/veterinarians', vet);
}
```

### Récupérer les vétérinaires disponibles
```typescript
getAvailableVeterinarians() {
  return this.http.get('/api/veterinarians/available');
}
```

### Mettre à jour la disponibilité
```typescript
updateAvailability(id: number, available: boolean) {
  return this.http.patch(
    `/api/veterinarians/${id}/availability`,
    null,
    { params: { available } }
  );
}
```

---

## Validation des données

Lors de la création/mise à jour, les champs suivants sont validés:

- **name**: Non null
- **email**: Unique et au format email
- **phone**: Non null
- **speciality**: Non null
- **experienceYears**: Doit être ≥ 0
- **clinicAddress**: Non null
- **available**: Boolean (défaut: true)

---

## Notes importantes

1. Les DTOs utilisent des types wrapper (Integer, Boolean) pour permettre les champs optionnels.
2. L'endpoint `PUT` supporte les mises à jour partielles - les champs null sont ignorés.
3. L'endpoint `PATCH` `/availability` est idéal pour basculer rapidement la disponibilité.
4. L'email doit être unique au moment de la création.
5. La base de données gère l'auto-incrémentation des ID.
