package com.elif.services.adoption.interfaces;

import com.elif.entities.adoption.Contract;
import com.elif.entities.pet_transit.TravelPlan;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;

/**
 * Interface pour le service d'envoi d'emails.
 */
public interface IEmailService {

    @Async
    void sendRegistrationConfirmed(String toEmail, String firstName,
                                   String eventTitle, Long eventId,
                                   String eventLocation, LocalDateTime startDate);

    @Async
    void sendRegistrationPending(String toEmail, String firstName,
                                 String eventTitle);

    @Async
    void sendRegistrationApproved(String toEmail, String firstName,
                                  String eventTitle, Long eventId);

    @Async
    void sendRegistrationRejected(String toEmail, String firstName,
                                  String eventTitle);

    @Async
    void sendRegistrationCancelled(String toEmail, String firstName,
                                   String eventTitle);

    @Async
    void sendWaitlistOffer(String toEmail, String firstName,
                           String eventTitle, Long eventId,
                           Long waitlistEntryId, int deadlineHours);

    @Async
    void sendWaitlistExpired(String toEmail, String firstName,
                             String eventTitle);

    @Async
    void sendEventReminder(String toEmail, String firstName,
                           String eventTitle, Long eventId,
                           String location, LocalDateTime startDate,
                           String reminderLabel);

    /**
     * Envoyer un email HTML.
     * @param to Destinataire
     * @param subject Sujet
     * @param htmlBody Corps HTML
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);

    /**
     * Envoyer un email texte simple.
     * @param to Destinataire
     * @param subject Sujet
     * @param textBody Corps texte
     */
    void sendTextEmail(String to, String subject, String textBody);

    /**
     * Envoyer un email de confirmation d'adoption approuvee.
     * @param contract Le contrat d'adoption
     */
    void sendAdoptionApprovedEmail(Contract contract);

    /**
     * Envoyer un email de validation d'un travel plan.
     * @param travelPlan Le travel plan approuve
     */
    void sendTravelPlanApprovedEmail(TravelPlan travelPlan);

    /**
     * Envoyer un email de rejet d'un travel plan.
     * @param travelPlan Le travel plan rejete
     * @param rejectionReason Le commentaire de rejet admin
     */
    void sendTravelPlanRejectedEmail(TravelPlan travelPlan, String rejectionReason);
}
