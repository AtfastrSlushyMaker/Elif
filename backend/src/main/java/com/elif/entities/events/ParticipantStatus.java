package com.elif.entities.events;

public enum ParticipantStatus {
    PENDING,    // En attente de confirmation
    CONFIRMED,  // Confirmé
    CANCELLED,  // Annulé par l'utilisateur
    ATTENDED,   // A participé (check-in effectué)
    WAITLISTED  // En liste d'attente (si places limitées)
}