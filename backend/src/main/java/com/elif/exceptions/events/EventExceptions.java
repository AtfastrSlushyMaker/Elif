package com.elif.exceptions.events;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceptions métier du module Events.
 * Chaque exception porte un HTTP status sémantiquement correct.
 */
public final class EventExceptions {

    private EventExceptions() {}

    // ─── 404 ──────────────────────────────────────────────────────────
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class EventNotFoundException extends RuntimeException {
        public EventNotFoundException(Long id) {
            super("Événement introuvable : " + id);
        }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class CategoryNotFoundException extends RuntimeException {
        public CategoryNotFoundException(Long id) {
            super("Catégorie introuvable : " + id);
        }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ParticipantNotFoundException extends RuntimeException {
        public ParticipantNotFoundException(String msg) { super(msg); }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ReviewNotFoundException extends RuntimeException {
        public ReviewNotFoundException(Long id) {
            super("Avis introuvable : " + id);
        }
    }

    // ─── 409 Conflict ────────────────────────────────────────────────
    @ResponseStatus(HttpStatus.CONFLICT)
    public static class DuplicateRegistrationException extends RuntimeException {
        public DuplicateRegistrationException(Long userId, Long eventId) {
            super("L'utilisateur " + userId + " est déjà inscrit à l'événement " + eventId + ".");
        }
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class DuplicateCategoryException extends RuntimeException {
        public DuplicateCategoryException(String name) {
            super("Une catégorie avec le nom '" + name + "' existe déjà.");
        }
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class DuplicateReviewException extends RuntimeException {
        public DuplicateReviewException() {
            super("Vous avez déjà laissé un avis pour cet événement.");
        }
    }

    // ─── 422 Unprocessable Entity ────────────────────────────────────
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class EventNotJoinableException extends RuntimeException {
        public EventNotJoinableException(String status) {
            super("Impossible de s'inscrire : l'événement est " + status + ".");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class InsufficientSlotsException extends RuntimeException {
        public InsufficientSlotsException(int remaining, int requested) {
            super("Seulement " + remaining + " place(s) disponible(s), vous en avez demandé " + requested + ".");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class EventNotEditableException extends RuntimeException {
        public EventNotEditableException(String status) {
            super("Impossible de modifier un événement " + status + ".");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class InvalidDateRangeException extends RuntimeException {
        public InvalidDateRangeException(String msg) { super(msg); }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class CapacityReductionException extends RuntimeException {
        public CapacityReductionException(int requested, int booked) {
            super("Nouvelle capacité (" + requested + ") inférieure aux places déjà réservées (" + booked + ").");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class CategoryInUseException extends RuntimeException {
        public CategoryInUseException(Long id) {
            super("Impossible de supprimer la catégorie " + id + " car elle est utilisée par des événements.");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class RegistrationNotPendingException extends RuntimeException {
        public RegistrationNotPendingException() {
            super("Cette inscription n'est pas en attente d'approbation.");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class ReviewNotAllowedException extends RuntimeException {
        public ReviewNotAllowedException(String msg) { super(msg); }
    }

    // ─── 403 Forbidden ───────────────────────────────────────────────
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class AccessDeniedException extends RuntimeException {
        public AccessDeniedException(String msg) { super(msg); }
    }

    // ─── Waitlist ────────────────────────────────────────────────────
    @ResponseStatus(HttpStatus.CONFLICT)
    public static class AlreadyOnWaitlistException extends RuntimeException {
        public AlreadyOnWaitlistException() {
            super("Vous êtes déjà sur la liste d'attente pour cet événement.");
        }
    }

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public static class WaitlistNotOpenException extends RuntimeException {
        public WaitlistNotOpenException() {
            super("La liste d'attente n'est pas disponible pour cet événement.");
        }
    }
}
