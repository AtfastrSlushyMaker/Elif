package com.elif.services.events.implementations;

import com.elif.entities.adoption.Contract;
import com.elif.entities.events.Event;
import com.elif.entities.events.EventParticipant;
import com.elif.entities.pet_transit.TravelPlan;
import com.elif.entities.user.User;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventEmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.base-url:http://localhost:4200}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE dd MMMM yyyy 'à' HH'h'mm", Locale.FRENCH);

    private static final DateTimeFormatter PDF_DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    // ============================================
    // QR CODE GENERATION
    // ============================================

    private byte[] generateQRCode(String data, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Erreur génération QR code: {}", e.getMessage());
            return null;
        }
    }

    // ============================================
    // PDF TICKET GENERATION
    // ============================================

    public byte[] generateTicketPDF(Event event, User user, EventParticipant participant) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A6);
            document.setMargins(20, 20, 20, 20);

            // Titre
            Paragraph title = new Paragraph("🎟️ BILLET D'ENTRÉE")
                    .setFontSize(16).setBold().setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            // Informations
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                    .setWidth(UnitValue.createPercentValue(100));
            infoTable.addCell("Événement:").addCell(event.getTitle());
            infoTable.addCell("Date:").addCell(event.getStartDate().format(PDF_DATE_FMT));
            infoTable.addCell("Lieu:").addCell(event.getLocation());
            infoTable.addCell("Participant:").addCell(user.getFirstName() + " " + user.getLastName());
            infoTable.addCell("Places:").addCell(String.valueOf(participant.getNumberOfSeats()));
            document.add(infoTable);

            // QR Code
            String qrData = String.format(
                    "EVENT:%d|USER:%d|TICKET:%d|SEATS:%d",
                    event.getId(), user.getId(), participant.getId(), participant.getNumberOfSeats()
            );
            byte[] qrBytes = generateQRCode(qrData, 150, 150);
            if (qrBytes != null) {
                Image qrImage = new Image(ImageDataFactory.create(qrBytes))
                        .setWidth(100).setHeight(100)
                        .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
                document.add(qrImage);
            }

            // Code unique
            String ticketCode = "TKT-" + event.getId() + "-" + user.getId();
            document.add(new Paragraph("Code: " + ticketCode)
                    .setFontSize(8).setTextAlignment(TextAlignment.CENTER));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erreur génération PDF: {}", e.getMessage());
            throw new RuntimeException("Erreur génération billet", e);
        }
    }

    // ============================================
    // EMAIL AVEC BILLET PDF EN PIÈCE JOINTE
    // ============================================

    @Async
    public void sendTicketWithPdf(String toEmail, String firstName, String eventTitle, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("🎫 Votre billet pour " + eventTitle);

            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2d7a6a;">✅ Inscription confirmée !</h2>
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Votre inscription à <strong>%s</strong> est confirmée.</p>
                        <p>Vous trouverez votre billet en pièce jointe.</p>
                        <p>📱 Présentez le QR code à l'entrée de l'événement.</p>
                        <p style="margin-top: 20px;">À bientôt !</p>
                    </div>
                </body>
                </html>
                """, firstName, eventTitle);

            helper.setText(html, true);
            helper.addAttachment("billet_" + eventTitle.replace(" ", "_") + ".pdf",
                    new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Email avec billet envoyé à {}", toEmail);
        } catch (Exception e) {
            log.error("Erreur envoi email avec billet: {}", e.getMessage());
        }
    }

    // ============================================
    // NOTIFICATIONS ÉVÉNEMENTS
    // ============================================

    @Async
    public void sendRegistrationConfirmed(String toEmail, String firstName,
                                          String eventTitle, Long eventId,
                                          String eventLocation, LocalDateTime startDate) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventLocation", eventLocation);
        ctx.setVariable("startDate", startDate.format(DATE_FMT));
        ctx.setVariable("eventUrl", baseUrl + "/events/" + eventId);
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Votre inscription à \"" + eventTitle + "\" est confirmée !",
                "emails/registration-confirmed",
                ctx);
    }

    @Async
    public void sendRegistrationPending(String toEmail, String firstName,
                                        String eventTitle) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Demande reçue pour \"" + eventTitle + "\"",
                "emails/registration-pending",
                ctx);
    }

    @Async
    public void sendRegistrationApproved(String toEmail, String firstName,
                                         String eventTitle, Long eventId) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventUrl", baseUrl + "/events/" + eventId);
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Bonne nouvelle ! Votre inscription à \"" + eventTitle + "\" est approuvée",
                "emails/registration-approved",
                ctx);
    }

    @Async
    public void sendRegistrationRejected(String toEmail, String firstName,
                                         String eventTitle) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventsUrl", baseUrl + "/events");
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Votre demande pour \"" + eventTitle + "\" n'a pas été retenue",
                "emails/registration-rejected",
                ctx);
    }

    @Async
    public void sendRegistrationCancelled(String toEmail, String firstName,
                                          String eventTitle) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventsUrl", baseUrl + "/events");
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Annulation de votre inscription à \"" + eventTitle + "\"",
                "emails/registration-cancelled",
                ctx);
    }

    @Async
    public void sendWaitlistOffer(String toEmail, String firstName,
                                  String eventTitle, Long eventId,
                                  Long waitlistEntryId, int deadlineHours) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("deadlineHours", deadlineHours);
        ctx.setVariable("confirmUrl",
                baseUrl + "/events/" + eventId + "/waitlist/confirm");
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Une place s'est libérée pour \"" + eventTitle + "\" — confirmez dans " + deadlineHours + "h !",
                "emails/waitlist-offer",
                ctx);
    }

    @Async
    public void sendWaitlistExpired(String toEmail, String firstName,
                                    String eventTitle) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventsUrl", baseUrl + "/events");
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Délai de confirmation expiré — \"" + eventTitle + "\"",
                "emails/waitlist-expired",
                ctx);
    }

    @Async
    public void sendEventReminder(String toEmail, String firstName,
                                  String eventTitle, Long eventId,
                                  String location, LocalDateTime startDate,
                                  String reminderLabel) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("location", location);
        ctx.setVariable("startDate", startDate.format(DATE_FMT));
        ctx.setVariable("reminderLabel", reminderLabel);
        ctx.setVariable("eventUrl", baseUrl + "/events/" + eventId);
        ctx.setVariable("baseUrl", baseUrl);

        send(toEmail,
                "Rappel : \"" + eventTitle + "\" — " + reminderLabel,
                "emails/event-reminder",
                ctx);
    }

    // ============================================
    // MÉTHODES GÉNÉRIQUES
    // ============================================

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("Email HTML envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi email HTML: {}", e.getMessage());
        }
    }

    @Async
    public void sendTextEmail(String to, String subject, String textBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, false);
            mailSender.send(msg);
            log.info("Email texte envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi email texte: {}", e.getMessage());
        }
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private void send(String to, String subject, String template, Context ctx) {
        try {
            String html = templateEngine.process(template, ctx);
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email '{}' envoyé à {}", subject, to);
        } catch (Exception e) {
            log.error("Échec envoi email à {} — subject='{}' : {}", to, subject, e.getMessage());
        }
    }
}