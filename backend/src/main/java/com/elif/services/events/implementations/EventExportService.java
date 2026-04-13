package com.elif.services.events.implementations;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventParticipant;
import com.elif.entities.events.ParticipantStatus;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.services.events.interfaces.IEventExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EventExportService implements IEventExportService {

    private final EventRepository            eventRepository;
    private final EventParticipantRepository participantRepository;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public byte[] exportParticipantsCsv(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(eventId));

        List<EventParticipant> participants = participantRepository
                .findByEventIdAndStatus(eventId, ParticipantStatus.CONFIRMED,
                        PageRequest.of(0, Integer.MAX_VALUE))
                .getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (OutputStreamWriter osw = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             PrintWriter writer = new PrintWriter(osw, true)) {

            // BOM UTF-8 pour Excel
            out.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});

            // En-tête
            writer.println("Événement;Lieu;Date début;Participants confirmés");
            writer.printf("\"%s\";\"%s\";\"%s\";%d%n",
                    escape(event.getTitle()),
                    escape(event.getLocation()),
                    event.getStartDate().format(FMT),
                    participants.size());
            writer.println();
            writer.println("ID Participant;Prénom;Nom;Places réservées;Date d'inscription");

            for (EventParticipant p : participants) {
                writer.printf("%d;\"%s\";\"%s\";%d;\"%s\"%n",
                        p.getId(),
                        escape(p.getUser().getFirstName()),
                        escape(p.getUser().getLastName()),
                        p.getNumberOfSeats(),
                        p.getRegisteredAt() != null ? p.getRegisteredAt().format(FMT) : "");
            }

        } catch (IOException e) {
            log.error("Erreur lors de l'export CSV des participants", e);
            throw new RuntimeException("Erreur lors de la génération du fichier CSV", e);
        }

        log.info("📊 Export CSV : {} participants pour '{}'", participants.size(), event.getTitle());
        return out.toByteArray();
    }

    @Override
    public byte[] exportEventsCsv() {
        List<Event> events = eventRepository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (OutputStreamWriter osw = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             PrintWriter writer = new PrintWriter(osw, true)) {

            out.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
            writer.println("ID;Titre;Catégorie;Lieu;Date début;Date fin;Statut;Capacité;Places restantes;Taux remplissage (%)");

            for (Event e : events) {
                int used = e.getMaxParticipants() - e.getRemainingSlots();
                double fillRate = e.getMaxParticipants() > 0
                        ? Math.round((used * 100.0 / e.getMaxParticipants()) * 10.0) / 10.0
                        : 0.0;

                writer.printf("%d;\"%s\";\"%s\";\"%s\";\"%s\";\"%s\";\"%s\";%d;%d;%.1f%n",
                        e.getId(),
                        escape(e.getTitle()),
                        e.getCategory() != null ? escape(e.getCategory().getName()) : "",
                        escape(e.getLocation()),
                        e.getStartDate().format(FMT),
                        e.getEndDate().format(FMT),
                        e.getStatus().name(),
                        e.getMaxParticipants(),
                        e.getRemainingSlots(),
                        fillRate);
            }

        } catch (IOException e) {
            log.error("Erreur lors de l'export CSV des événements", e);
            throw new RuntimeException("Erreur lors de la génération du fichier CSV", e);
        }

        log.info("📊 Export CSV global : {} événements", events.size());
        return out.toByteArray();
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}