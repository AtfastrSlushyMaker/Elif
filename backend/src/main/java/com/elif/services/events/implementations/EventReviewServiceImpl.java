package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventReviewRequest;
import com.elif.dto.events.response.EventReviewResponse;
import com.elif.entities.events.Event;
import com.elif.entities.events.EventParticipant;
import com.elif.entities.events.EventReview;
import com.elif.entities.events.EventStatus;
import com.elif.entities.events.ParticipantStatus;
import com.elif.entities.user.User;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.events.EventReviewRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EventReviewServiceImpl implements IEventReviewService {

    private final EventReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @Override
    public EventReviewResponse submitReview(Long eventId, Long userId, EventReviewRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));

        // Vérifier que l'événement est terminé
        if (event.getStatus() != EventStatus.COMPLETED) {
            throw new RuntimeException("Vous ne pouvez laisser un avis que sur un événement terminé.");
        }

        // Vérifier que l'utilisateur a participé
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Vous n'avez pas participé à cet événement."));

        if (participant.getStatus() != ParticipantStatus.CONFIRMED &&
                participant.getStatus() != ParticipantStatus.ATTENDED) {
            throw new RuntimeException("Vous n'avez pas participé à cet événement.");
        }

        // Vérifier si l'utilisateur a déjà laissé un avis
        if (reviewRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("Vous avez déjà laissé un avis pour cet événement.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        EventReview review = EventReview.builder()
                .event(event)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        EventReview saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventReviewResponse> getEventReviews(Long eventId, Pageable pageable) {
        return reviewRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable)
                .map(this::toResponse);
    }

    @Override
    public EventReviewResponse updateReview(Long reviewId, Long userId, EventReviewRequest request) {
        EventReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres avis.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        EventReview updated = reviewRepository.save(review);
        return toResponse(updated);
    }

    @Override
    public void deleteReview(Long reviewId, Long userId) {
        EventReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres avis.");
        }

        reviewRepository.delete(review);
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