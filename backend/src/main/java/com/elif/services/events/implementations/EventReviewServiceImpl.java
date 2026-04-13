package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventReviewRequest;
import com.elif.dto.events.response.EventReviewResponse;
import com.elif.entities.events.*;
import com.elif.entities.user.User;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.events.EventReviewRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EventReviewServiceImpl implements IEventReviewService {

    private final EventReviewRepository      reviewRepository;
    private final EventRepository            eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository             userRepository;

    @Override
    public EventReviewResponse submitReview(Long eventId, Long userId, EventReviewRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(eventId));

        if (event.getStatus() != EventStatus.COMPLETED) {
            throw new EventExceptions.ReviewNotAllowedException(
                    "Vous ne pouvez laisser un avis que sur un événement terminé.");
        }

        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new EventExceptions.ReviewNotAllowedException(
                        "Vous n'avez pas participé à cet événement."));

        if (participant.getStatus() != ParticipantStatus.CONFIRMED
                && participant.getStatus() != ParticipantStatus.ATTENDED) {
            throw new EventExceptions.ReviewNotAllowedException(
                    "Seuls les participants confirmés peuvent laisser un avis.");
        }

        if (reviewRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new EventExceptions.DuplicateReviewException();
        }

        // Validation de la note (1 à 5)
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new EventExceptions.InvalidDateRangeException(
                    "La note doit être comprise entre 1 et 5.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Utilisateur introuvable : " + userId));

        EventReview review = EventReview.builder()
                .event(event)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        EventReview saved = reviewRepository.save(review);
        log.info("⭐ Avis soumis pour l'événement '{}' par userId={}", event.getTitle(), userId);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventReviewResponse> getEventReviews(Long eventId, Pageable pageable) {
        eventRepository.findById(eventId)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(eventId));
        return reviewRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable)
                .map(this::toResponse);
    }

    @Override
    public EventReviewResponse updateReview(Long reviewId, Long userId, EventReviewRequest request) {
        EventReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EventExceptions.ReviewNotFoundException(reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new EventExceptions.AccessDeniedException(
                    "Vous ne pouvez modifier que vos propres avis.");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new EventExceptions.InvalidDateRangeException(
                    "La note doit être comprise entre 1 et 5.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        log.info("✏️ Avis {} modifié par userId={}", reviewId, userId);
        return toResponse(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long reviewId, Long userId) {
        EventReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EventExceptions.ReviewNotFoundException(reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new EventExceptions.AccessDeniedException(
                    "Vous ne pouvez supprimer que vos propres avis.");
        }

        reviewRepository.delete(review);
        log.info("🗑️ Avis {} supprimé par userId={}", reviewId, userId);
    }

    private EventReviewResponse toResponse(EventReview review) {
        return EventReviewResponse.builder()
                .id(review.getId())
                .eventId(review.getEvent().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
