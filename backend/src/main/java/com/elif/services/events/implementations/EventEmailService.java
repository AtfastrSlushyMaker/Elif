package com.elif.services.events.implementations;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventParticipant;
import com.elif.entities.user.User;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
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
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventEmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    @Value("${app.backend.base-url:http://localhost:8087/elif}")
    private String backendBaseUrl;

    // Couleurs ELIF
    private static final Color ELIF_GREEN = new DeviceRgb(29, 158, 117);
    private static final Color ELIF_ORANGE = new DeviceRgb(245, 158, 11);
    private static final Color ELIF_DARK = new DeviceRgb(30, 41, 59);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a", Locale.ENGLISH);

    private static final DateTimeFormatter PDF_DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy - HH:mm");

    // ============================================
    // QR CODE GENERATION (HAUTE QUALITÉ)
    // ============================================

    private byte[] generateQRCode(String data, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.MARGIN, 0);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);

            int margin = 4;
            int totalWidth = width + (margin * 2);
            int totalHeight = height + (margin * 2);

            BitMatrix finalMatrix = new BitMatrix(totalWidth, totalHeight);
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    if (bitMatrix.get(x, y)) {
                        finalMatrix.set(x + margin, y + margin);
                    }
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            MatrixToImageConfig config = new MatrixToImageConfig(
                    0xFF000000,
                    0xFFFFFFFF
            );

            MatrixToImageWriter.writeToStream(finalMatrix, "PNG", outputStream, config);

            return outputStream.toByteArray();

        } catch (WriterException | IOException e) {
            log.error("QR code generation failed: {}", e.getMessage());
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
            writer.setCompressionLevel(9);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A6);
            document.setMargins(20, 20, 20, 20);

            // HEADER
            Paragraph brand = new Paragraph("ELIF")
                    .setFontSize(22)
                    .setBold()
                    .setFontColor(ELIF_GREEN)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(brand);

            Paragraph ticketTitle = new Paragraph("ENTRY TICKET")
                    .setFontSize(11)
                    .setFontColor(ELIF_ORANGE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(-8);
            document.add(ticketTitle);

            document.add(new Paragraph(" ").setMarginTop(8));

            // TABLE DES INFORMATIONS
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{38, 62}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(8);

            addInfoRow(infoTable, "Event:", event.getTitle(), ELIF_GREEN);
            addInfoRow(infoTable, "Date:", event.getStartDate().format(PDF_DATE_FMT), ELIF_GREEN);
            addInfoRow(infoTable, "Location:", event.getLocation(), ELIF_GREEN);
            addInfoRow(infoTable, "Participant:", user.getFirstName() + " " + user.getLastName(), ELIF_GREEN);
            addInfoRow(infoTable, "Seats:", String.valueOf(participant.getNumberOfSeats()), ELIF_GREEN);

            document.add(infoTable);
            document.add(new Paragraph(" ").setMarginTop(5));

            // QR CODE
            String qrData = String.format(
                    "%s/api/events/%d/validate-ticket/%d?token=%s",
                    backendBaseUrl,
                    event.getId(),
                    participant.getId(),
                    generateTicketToken(participant)
            );

            log.info("📱 QR Code URL for ticket: {}", qrData);

            byte[] qrBytes = generateQRCode(qrData, 350, 350);

            if (qrBytes != null && qrBytes.length > 0) {
                Image qrImage = new Image(ImageDataFactory.create(qrBytes))
                        .setWidth(110)
                        .setHeight(110)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER)
                        .setMarginTop(5)
                        .setMarginBottom(5);
                document.add(qrImage);

                Paragraph scanMsg = new Paragraph("Scan this QR code at the entrance")
                        .setFontSize(7)
                        .setFontColor(new DeviceRgb(100, 116, 139))
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(0);
                document.add(scanMsg);
            } else {
                Paragraph fallbackMsg = new Paragraph("[QR Code - Present this ticket at entrance]")
                        .setFontSize(8)
                        .setFontColor(ELIF_ORANGE)
                        .setTextAlignment(TextAlignment.CENTER);
                document.add(fallbackMsg);
            }

            document.add(new Paragraph(" ").setMarginTop(5));

            // TICKET CODE
            String ticketCode = generateTicketCode(event, user, participant);
            Paragraph codePara = new Paragraph("Ticket #: " + ticketCode)
                    .setFontSize(8)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ELIF_DARK);
            document.add(codePara);

            // FOOTER
            Paragraph footer = new Paragraph("This ticket is non-transferable • Valid only for the named participant")
                    .setFontSize(6)
                    .setFontColor(new DeviceRgb(148, 163, 184))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10);
            document.add(footer);

            String eventDate = event.getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            Paragraph dateFooter = new Paragraph("© ELIF • " + eventDate)
                    .setFontSize(6)
                    .setFontColor(new DeviceRgb(148, 163, 184))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(0);
            document.add(dateFooter);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate ticket", e);
        }
    }

    private String generateTicketToken(EventParticipant participant) {
        String raw = participant.getId() + "|" +
                participant.getEvent().getId() + "|" +
                participant.getUser().getId() + "|" +
                participant.getEvent().getStartDate().toLocalDate().toString();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().substring(0, 16);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String generateTicketCode(Event event, User user, EventParticipant participant) {
        return String.format("ELIF-%d-%d-%d", event.getId(), user.getId(), participant.getId());
    }

    private void addInfoRow(Table table, String label, String value, Color labelColor) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontSize(9).setFontColor(labelColor))
                .setBorder(null)
                .setPadding(2);

        Cell valueCell = new Cell()
                .add(new Paragraph(value != null && !value.isBlank() ? value : "—").setFontSize(9))
                .setBorder(null)
                .setPadding(2);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    // ============================================
    // EMAIL METHODS WITH TEMPLATE
    // ============================================

    @Async
    public void sendTicketWithPdf(String toEmail, String firstName, String eventTitle, Long eventId, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("🎫 Your ticket for " + eventTitle);

            // ✅ Utilisation du template Thymeleaf ticket.html
            Context context = new Context(Locale.ENGLISH);
            context.setVariable("firstName", firstName);
            context.setVariable("eventTitle", eventTitle);
            context.setVariable("eventUrl", frontendBaseUrl + "/events/" + eventId);
            context.setVariable("baseUrl", frontendBaseUrl);

            String html = templateEngine.process("emails/ticket", context);

            helper.setText(html, true);
            helper.addAttachment("ticket_" + eventTitle.replace(" ", "_") + ".pdf",
                    new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Ticket email sent to {} using template", toEmail);
        } catch (Exception e) {
            log.error("Failed to send ticket email: {}", e.getMessage());
        }
    }

    @Async
    public void sendRegistrationConfirmedWithTicket(String toEmail, String firstName,
                                                    Event event, User user,
                                                    EventParticipant participant) {
        try {
            log.info("Generating ticket for: {} - Event: {}", toEmail, event.getTitle());
            byte[] pdfBytes = generateTicketPDF(event, user, participant);
            sendTicketWithPdf(toEmail, firstName, event.getTitle(), event.getId(), pdfBytes);
        } catch (Exception e) {
            log.error("Failed to send confirmation with ticket: {}", e.getMessage());
            sendRegistrationConfirmed(toEmail, firstName, event.getTitle(),
                    event.getId(), event.getLocation(), event.getStartDate());
        }
    }

    @Async
    public void sendRegistrationConfirmed(String toEmail, String firstName,
                                          String eventTitle, Long eventId,
                                          String eventLocation, LocalDateTime startDate) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventLocation", eventLocation);
        ctx.setVariable("startDate", startDate.format(DATE_FMT));
        ctx.setVariable("eventUrl", frontendBaseUrl + "/events/" + eventId);
        ctx.setVariable("baseUrl", frontendBaseUrl);

        send(toEmail,
                "✅ Registration confirmed: " + eventTitle,
                "emails/registration-confirmed",
                ctx);
    }

    @Async
    public void sendRegistrationPending(String toEmail, String firstName, String eventTitle) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "⏳ Registration received: " + eventTitle, "emails/registration-pending", ctx);
    }

    @Async
    public void sendRegistrationApproved(String toEmail, String firstName, String eventTitle, Long eventId) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventUrl", frontendBaseUrl + "/events/" + eventId);
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "🎉 Your registration for " + eventTitle + " has been approved!", "emails/registration-approved", ctx);
    }

    @Async
    public void sendRegistrationRejected(String toEmail, String firstName, String eventTitle) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventsUrl", frontendBaseUrl + "/events");
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "❌ Update on your registration for " + eventTitle, "emails/registration-rejected", ctx);
    }

    @Async
    public void sendRegistrationCancelled(String toEmail, String firstName, String eventTitle) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventsUrl", frontendBaseUrl + "/events");
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "🗑️ Registration cancelled: " + eventTitle, "emails/registration-cancelled", ctx);
    }

    @Async
    public void sendWaitlistOffer(String toEmail, String firstName, String eventTitle, Long eventId, Long waitlistEntryId, int deadlineHours) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("deadlineHours", deadlineHours);
        ctx.setVariable("confirmUrl", frontendBaseUrl + "/events/" + eventId + "/waitlist/confirm");
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "🎟️ A spot opened up for " + eventTitle + " — confirm within " + deadlineHours + "h!", "emails/waitlist-offer", ctx);
    }

    @Async
    public void sendWaitlistExpired(String toEmail, String firstName, String eventTitle) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("eventsUrl", frontendBaseUrl + "/events");
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "⏰ Confirmation deadline expired for " + eventTitle, "emails/waitlist-expired", ctx);
    }

    @Async
    public void sendEventReminder(String toEmail, String firstName, String eventTitle, Long eventId, String location, LocalDateTime startDate, String reminderLabel) {
        Context ctx = new Context(Locale.ENGLISH);
        ctx.setVariable("firstName", firstName);
        ctx.setVariable("eventTitle", eventTitle);
        ctx.setVariable("location", location);
        ctx.setVariable("startDate", startDate.format(DATE_FMT));
        ctx.setVariable("reminderLabel", reminderLabel);
        ctx.setVariable("eventUrl", frontendBaseUrl + "/events/" + eventId);
        ctx.setVariable("baseUrl", frontendBaseUrl);
        send(toEmail, "🔔 Reminder: " + eventTitle + " — " + reminderLabel, "emails/event-reminder", ctx);
    }

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
            log.info("Email '{}' sent to {}", subject, to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}