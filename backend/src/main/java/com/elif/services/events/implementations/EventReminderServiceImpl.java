package com.elif.services.events.implementations;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventReminder;
import com.elif.entities.events.ReminderType;
import com.elif.entities.user.User;
import com.elif.repositories.events.EventReminderRepository;
import com.elif.services.events.interfaces.IEventReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventReminderServiceImpl implements IEventReminderService {

    private final EventReminderRepository reminderRepository;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE dd MMMM yyyy 'à' HH'h'mm", Locale.FRENCH);

    // ─── PROGRAMMATION ────────────────────────────────────────────────

    @Override
    public void scheduleReminders(Event event, User user) {
        LocalDateTime eventStart = event.getStartDate();
        List<EventReminder> reminders = new ArrayList<>();

        addReminderIfNeeded(reminders, event, user, eventStart.minusDays(2),   ReminderType.J2);
        addReminderIfNeeded(reminders, event, user, eventStart.minusHours(24), ReminderType.H24);
        addReminderIfNeeded(reminders, event, user, eventStart.minusHours(2),  ReminderType.H2);

        if (!reminders.isEmpty()) {
            reminderRepository.saveAll(reminders);
            log.info("📅 {} rappel(s) programmé(s) pour {} — '{}'",
                    reminders.size(), user.getEmail(), event.getTitle());
        }
    }

    private void addReminderIfNeeded(List<EventReminder> list, Event event, User user,
                                     LocalDateTime reminderTime, ReminderType type) {
        // N'ajouter que si la date du rappel est dans le futur et qu'il n'existe pas déjà
        if (reminderTime.isAfter(LocalDateTime.now())
                && !reminderRepository.existsByEventIdAndUserIdAndType(event.getId(), user.getId(), type)) {
            list.add(EventReminder.builder()
                    .event(event)
                    .user(user)
                    .reminderTime(reminderTime)
                    .type(type)
                    .build());
        }
    }

    // ─── ANNULATION ───────────────────────────────────────────────────

    @Override
    public void cancelReminders(Long eventId, Long userId) {
        reminderRepository.deleteByEventIdAndUserId(eventId, userId);
        log.info("🗑️ Rappels annulés — userId={}, eventId={}", userId, eventId);
    }

    /**
     * Annule tous les rappels liés à un événement (si l'événement est annulé/supprimé).
     */
    @Override
    public void cancelAllRemindersForEvent(Long eventId) {
        reminderRepository.deleteByEventId(eventId);
        log.info("🗑️ Tous les rappels de l'événement {} supprimés", eventId);
    }

    // ─── ENVOI PLANIFIÉ ───────────────────────────────────────────────

    /**
     * Toutes les 30 minutes : envoie (log) les rappels échus et les supprime.
     * En production, remplacer logReminder() par un appel JavaMailSender / SMS / Push.
     */
    @Scheduled(cron = "0 */30 * * * *")
    @Override
    public void sendPendingReminders() {
        List<EventReminder> toSend = reminderRepository.findByReminderTimeBefore(LocalDateTime.now());
        if (toSend.isEmpty()) return;

        log.info("📨 {} rappel(s) à traiter...", toSend.size());
        int success = 0, failure = 0;

        for (EventReminder reminder : toSend) {
            try {
                sendReminder(reminder);
                reminderRepository.delete(reminder);
                success++;
            } catch (Exception e) {
                log.error("❌ Rappel id={} échoué pour {} : {}",
                        reminder.getId(), reminder.getUser().getEmail(), e.getMessage());
                failure++;
                // Le rappel reste en base pour être réessayé au prochain cycle
            }
        }
        log.info("📊 Rappels traités : {} succès, {} échec(s)", success, failure);
    }

    /**
     * Point d'extension : remplacer par JavaMailSender, Firebase, Twilio, etc.
     */
    private void sendReminder(EventReminder reminder) {
        String label = switch (reminder.getType()) {
            case J2  -> "dans 2 jours";
            case H24 -> "dans 24 heures";
            case H2  -> "dans 2 heures";
        };
        log.info("""
            ════════════════════════════════════════
            📧 [RAPPEL] À : {} <{}>
            🎯 Événement : {}
            📍 Lieu      : {}
            🕐 Date      : {}
            ⏰ Commence  : {}
            ════════════════════════════════════════""",
                reminder.getUser().getFirstName(),
                reminder.getUser().getEmail(),
                reminder.getEvent().getTitle(),
                reminder.getEvent().getLocation(),
                reminder.getEvent().getStartDate().format(DATE_FMT),
                label
        );
    }
}
