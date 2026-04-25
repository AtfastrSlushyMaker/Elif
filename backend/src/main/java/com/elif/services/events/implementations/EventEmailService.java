package com.elif.services.events.implementations;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventParticipant;
import com.elif.entities.user.User;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
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

    private final JavaMailSender  mailSender;
    private final TemplateEngine  templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    @Value("${app.backend.public-url:http://localhost:8087/elif}")
    private String backendPublicUrl;

    private static final DeviceRgb GREEN  = new DeviceRgb(29, 158, 117);
    private static final DeviceRgb ORANGE = new DeviceRgb(245, 158, 11);
    private static final DeviceRgb DARK   = new DeviceRgb(30, 41, 59);
    private static final DeviceRgb LIGHT  = new DeviceRgb(248, 250, 252);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a", Locale.ENGLISH);
    private static final DateTimeFormatter PDF_DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy - HH:mm");

    // ── QR Code ──────────────────────────────────────────────────────

    private byte[] generateQRCode(String data, int width, int height) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("QR code generation failed: {}", e.getMessage());
            return null;
        }
    }

    private String buildQrData(Event event, User user, EventParticipant participant) {
        String ticketCode = "TKT-" + event.getId() + "-" + user.getId() + "-" + participant.getId();
        String dateStr    = event.getStartDate() != null
                ? event.getStartDate().format(PDF_DATE_FMT) : "TBD";

        return String.format(
                "{\"e\":%d,\"p\":%d,\"u\":%d,\"c\":\"%s\",\"d\":\"%s\",\"t\":\"%s\"}",
                event.getId(),
                participant.getId(),
                user.getId(),
                ticketCode,
                dateStr,
                event.getTitle().replaceAll("\"", "'")
        );
    }

    // ── PDF Ticket ───────────────────────────────────────────────────

    public byte[] generateTicketPDF(Event event, User user, EventParticipant participant) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter pdfWriter = new PdfWriter(baos);
            PdfDocument pdfDoc  = new PdfDocument(pdfWriter);
            Document doc = new Document(pdfDoc, PageSize.A5.rotate());
            doc.setMargins(24, 24, 24, 24);

            Table headerBand = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(100));
            Cell headerCell = new Cell()
                    .setBackgroundColor(GREEN)
                    .setPadding(14)
                    .setBorder(null);

            Paragraph brand = new Paragraph("🐾 ELIF  ·  Entry Ticket")
                    .setFontSize(18).setBold()
                    .setFontColor(new DeviceRgb(255, 255, 255))
                    .setTextAlignment(TextAlignment.CENTER);
            headerCell.add(brand);

            Paragraph eventNameInHeader = new Paragraph(event.getTitle())
                    .setFontSize(11)
                    .setFontColor(new DeviceRgb(220, 245, 235))
                    .setTextAlignment(TextAlignment.CENTER);
            headerCell.add(eventNameInHeader);
            headerBand.addCell(headerCell);
            doc.add(headerBand);

            doc.add(new Paragraph(" ").setMarginBottom(8));

            Table body = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .setWidth(UnitValue.createPercentValue(100));

            Cell infoCell = new Cell().setBorder(null).setPaddingRight(20);

            addInfoLine(infoCell, "Event",       event.getTitle());
            addInfoLine(infoCell, "Date",         event.getStartDate() != null
                    ? event.getStartDate().format(PDF_DATE_FMT) : "TBD");
            addInfoLine(infoCell, "Location",     event.getLocation() != null
                    ? event.getLocation() : "TBD");
            addInfoLine(infoCell, "Participant",
                    user.getFirstName() + " " + user.getLastName());
            addInfoLine(infoCell, "Seats",
                    String.valueOf(participant.getNumberOfSeats()));
            addInfoLine(infoCell, "Ticket code",
                    "TKT-" + event.getId() + "-" + user.getId() + "-" + participant.getId());

            body.addCell(infoCell);

            Cell qrCell = new Cell().setBorder(null)
                    .setTextAlignment(TextAlignment.CENTER);

            String qrData = buildQrData(event, user, participant);
            byte[] qrBytes = generateQRCode(qrData, 200, 200);

            if (qrBytes != null) {
                Image qrImg = new Image(ImageDataFactory.create(qrBytes))
                        .setWidth(130).setHeight(130)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER);
                qrCell.add(qrImg);
            } else {
                qrCell.add(new Paragraph("[QR unavailable]")
                        .setFontColor(ORANGE).setFontSize(9));
            }

            qrCell.add(new Paragraph("Scan at entrance")
                    .setFontSize(9).setFontColor(DARK)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(6));

            qrCell.add(new Paragraph("Valid for 1 entry")
                    .setFontSize(8).setFontColor(new DeviceRgb(148, 163, 184))
                    .setTextAlignment(TextAlignment.CENTER));

            body.addCell(qrCell);
            doc.add(body);

            doc.add(new Paragraph(" ").setMarginTop(10));
            Paragraph footer = new Paragraph(
                    "ELIF Pet Events Platform  ·  This ticket is non-transferable  ·  "
                            + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .setFontSize(7)
                    .setFontColor(new DeviceRgb(148, 163, 184))
                    .setTextAlignment(TextAlignment.CENTER);
            doc.add(footer);

            doc.close();
            log.info("✅ PDF ticket generated: {} bytes for user {} event {}",
                    baos.size(), user.getId(), event.getId());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("❌ PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate ticket PDF", e);
        }
    }

    private void addInfoLine(Cell cell, String label, String value) {
        Table row = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(5);
        row.addCell(new Cell()
                .add(new Paragraph(label).setFontSize(9).setFontColor(new DeviceRgb(100, 116, 139)).setBold())
                .setBorder(null).setPadding(2));
        row.addCell(new Cell()
                .add(new Paragraph(value != null ? value : "—").setFontSize(9).setFontColor(DARK))
                .setBorder(null).setPadding(2));
        cell.add(row);
    }

    // ── Email Ticket ────────────────────────────────────────────────

    @Async
    public void sendTicketWithPdf(String toEmail, String firstName,
                                  String eventTitle, Long eventId, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("🎫 Your ticket for " + eventTitle);

            String html = buildTicketEmailHtml(firstName, eventTitle, eventId);
            helper.setText(html, true);
            helper.addAttachment(
                    "ticket_" + eventTitle.replaceAll("[^a-zA-Z0-9]", "_") + ".pdf",
                    new ByteArrayResource(pdfBytes)
            );
            mailSender.send(message);
            log.info("📧 Ticket email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send ticket email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildTicketEmailHtml(String firstName, String eventTitle, Long eventId) {
        return """
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8"/></head>
        <body style="font-family:sans-serif;background:#f0f0f0;margin:0;padding:20px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1)">
            <div style="background:#1d9e75;padding:24px;text-align:center">
              <div style="font-size:28px;font-weight:800;color:#fff">🐾 ELIF</div>
              <div style="font-size:14px;color:#e0f2e9;margin-top:8px">Pet Events Platform</div>
            </div>
            <div style="padding:32px">
              <h2 style="color:#1e293b;margin:0 0 16px">✅ Registration Confirmed!</h2>
              <p style="color:#334155;line-height:1.6;margin:0 0 20px">
                Hi <strong>%s</strong>,<br>
                Your registration for <strong>%s</strong> is confirmed.
                Your ticket is attached to this email — present the QR code at the entrance.
              </p>
              <div style="background:#f0fdf4;border-left:4px solid #1d9e75;border-radius:8px;padding:16px;margin:20px 0">
                <p style="margin:0 0 6px"><strong>📎 Your ticket (PDF) is attached</strong></p>
                <p style="margin:0;font-size:13px;color:#64748b">
                  The QR code is scanned at the entrance — no internet required for verification.
                </p>
              </div>
              <div style="text-align:center;margin:24px 0">
                <a href="%s/events/%d" style="display:inline-block;padding:12px 32px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
                  View Event Details
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
              <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0">
                © ELIF — Do not reply to this email.
              </p>
            </div>
          </div>
        </body></html>
        """.formatted(firstName, eventTitle, frontendBaseUrl, eventId);
    }

    // ── Email Certificat ────────────────────────────────────────────

    // ══════════════════════════════════════════════════════════════
    // MÉTHODE À REMPLACER dans EventEmailService.java
    // Remplace la méthode sendAttendanceResultEmail existante
    // ══════════════════════════════════════════════════════════════

    @Async
    public void sendAttendanceResultEmail(String toEmail, String userName,
                                          String eventTitle,
                                          double attendancePct,
                                          int    thresholdPct,
                                          boolean certificateEarned,
                                          String  certificateUrl) {

        String subject = certificateEarned
                ? "🏆 Your certificate is ready — " + eventTitle
                : "📊 Your attendance results — " + eventTitle;

        String absoluteUrl = (certificateUrl != null && certificateUrl.startsWith("http"))
                ? certificateUrl
                : backendPublicUrl + "/api" + certificateUrl;

        double barPct   = Math.min(attendancePct, 100.0);
        String barColor = certificateEarned ? "#1a6b45" : (attendancePct >= 50 ? "#f5720a" : "#d94040");

        // ── Certificate earned section ─────────────────────────
        String certSection = certificateEarned
                ? buildCertEarnedSection(absoluteUrl, attendancePct, thresholdPct)
                : buildCertNotEarnedSection(attendancePct, thresholdPct);

        String html = buildAttendanceEmailHtml(
                userName, eventTitle, attendancePct, thresholdPct,
                barPct, barColor, certSection, certificateEarned);

        send(toEmail, subject, html);
    }

    private String buildCertEarnedSection(String certUrl, double pct, int threshold) {
        return String.format("""
        <!-- Certificate earned block -->
        <div style="margin: 28px 0;">
          <!-- Trophy banner -->
          <div style="background: linear-gradient(135deg, #1a6b45, #22894f);
                      border-radius: 16px; padding: 28px; text-align: center;
                      margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
            <h2 style="color: #ffffff; font-size: 1.4rem; margin: 0 0 8px;
                       font-family: Georgia, serif;">Certificate Earned!</h2>
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 0.9rem;">
              You achieved <strong style="color:#ffffff;">%.1f%%</strong> attendance
              — exceeding the required <strong style="color:#ffffff;">%d%%</strong>
            </p>
          </div>

          <!-- Certificate preview card -->
          <div style="border: 2px solid #1a6b45; border-radius: 12px; overflow: hidden;
                      margin-bottom: 20px;">
            <div style="background: #1a6b45; padding: 14px 20px; display: flex;
                        align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 22px;">🐾</span>
                <div>
                  <div style="color: #fff; font-weight: 700; font-size: 0.95rem;">ELIF Platform</div>
                  <div style="color: rgba(255,255,255,0.65); font-size: 0.7rem;
                              text-transform: uppercase; letter-spacing: 0.06em;">
                    Official Certificate
                  </div>
                </div>
              </div>
              <span style="color: rgba(255,255,255,0.7); font-size: 0.75rem;
                           border: 1px solid rgba(255,255,255,0.3); padding: 4px 10px;
                           border-radius: 999px;">📜 Verified</span>
            </div>
            <div style="height: 3px; background: linear-gradient(90deg, #f5720a, #c9a227, #f5720a);"></div>
            <div style="background: #f9fdf9; padding: 24px; text-align: center;">
              <p style="font-size: 0.8rem; color: #6b7e72; margin: 0 0 8px; font-style: italic;">
                This is to certify that
              </p>
              <div style="font-family: Georgia, serif; font-size: 1.8rem; color: #1a6b45;
                          font-weight: bold; margin-bottom: 4px;">
                [Your Name]
              </div>
              <div style="height: 1px; background: #d6ede2; width: 180px;
                          margin: 0 auto 12px;"></div>
              <p style="font-size: 0.8rem; color: #6b7e72; margin: 0 0 12px;">
                has successfully completed the virtual session with
                <strong style="color:#1a6b45;">%.1f%%</strong> attendance
              </p>
              <div style="display: inline-flex; align-items: center; gap: 8px;
                          background: #fff9e6; border: 1px solid #c9a227;
                          border-radius: 8px; padding: 8px 16px; font-size: 0.8rem;
                          color: #7a5c0a;">
                🏆 Attendance threshold exceeded (%d%% required)
              </div>
            </div>
          </div>

          <!-- CTA button -->
          <div style="text-align: center;">
            <a href="%s" target="_blank"
               style="display: inline-block; background: #f5720a; color: #ffffff;
                      padding: 14px 36px; border-radius: 10px; text-decoration: none;
                      font-weight: 700; font-size: 1rem;
                      box-shadow: 0 6px 20px rgba(245,114,10,0.35);">
              📜 View &amp; Download Certificate
            </a>
          </div>
          <p style="text-align: center; font-size: 0.75rem; color: #6b7e72; margin-top: 10px;">
            Opens in a new tab · Print or save as PDF
          </p>
        </div>
        """, pct, threshold, pct, threshold, certUrl);
    }

    private String buildCertNotEarnedSection(double pct, int threshold) {
        return String.format("""
        <!-- Certificate NOT earned -->
        <div style="background: #fff5f5; border: 1.5px solid #fecaca; border-radius: 12px;
                    padding: 20px; margin: 20px 0; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px;">❌</div>
          <h3 style="color: #991b1b; margin: 0 0 8px; font-size: 1rem;">
            Certificate Not Earned
          </h3>
          <p style="color: #7f1d1d; margin: 0; font-size: 0.875rem; line-height: 1.6;">
            Your attendance was <strong>%.1f%%</strong> — the minimum required is
            <strong>%d%%</strong>.
            <br/>No certificate was issued for this session.
          </p>
        </div>
        <div style="background: #f0f8f4; border: 1px solid #d6ede2; border-radius: 10px;
                    padding: 14px 18px; font-size: 0.82rem; color: #1a6b45; margin-top: 8px;">
          💡 Keep attending future events — each session is a new opportunity!
        </div>
        """, pct, threshold);
    }

    private String buildAttendanceEmailHtml(
            String userName, String eventTitle,
            double attendancePct, int thresholdPct,
            double barPct, String barColor,
            String certSection, boolean earned) {

        String headerEmoji = earned ? "🏆" : "📊";
        String headerTitle = earned ? "Session Completed — Certificate Ready" : "Session Attendance Results";
        String headerBg = earned
                ? "linear-gradient(135deg, #1a6b45 0%, #22894f 100%)"
                : "linear-gradient(135deg, #0f4f32 0%, #1a6b45 100%)";

        return String.format("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>%s — %s</title>
        </head>
        <body style="font-family: -apple-system, 'DM Sans', sans-serif; background: #edf2ec;
                     margin: 0; padding: 32px 16px;">

          <div style="max-width: 580px; margin: 0 auto;">

            <!-- Header card -->
            <div style="background: %s; border-radius: 20px 20px 0 0; padding: 36px 32px; text-align: center;">
              <div style="font-size: 44px; margin-bottom: 12px;">%s</div>
              <h1 style="color: #ffffff; font-size: 1.35rem; margin: 0 0 8px; font-weight: 700;">
                %s
              </h1>
              <p style="color: rgba(255,255,255,.7); margin: 0; font-size: 0.875rem;">
                %s
              </p>
            </div>

            <!-- Orange accent stripe -->
            <div style="height: 4px; background: linear-gradient(90deg, #f5720a, #c9a227, #f5720a);"></div>

            <!-- Main body -->
            <div style="background: #ffffff; border-radius: 0 0 20px 20px; padding: 32px;">

              <p style="color: #0f1f16; margin: 0 0 8px;">
                Hi <strong>%s</strong>,
              </p>
              <p style="color: #6b7e72; line-height: 1.65; margin: 0 0 24px; font-size: 0.9rem;">
                Here are your attendance results for the virtual session of
                <strong style="color: #0f1f16;">%s</strong>.
              </p>

              <!-- Attendance bar -->
              <div style="background: #f0f8f4; border-radius: 14px; padding: 20px; margin-bottom: 24px;
                          border: 1px solid #d6ede2;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;
                            align-items: center;">
                  <span style="font-size: 0.82rem; color: #6b7e72; font-weight: 600;">Your attendance</span>
                  <strong style="font-size: 1.5rem; color: #0f1f16;">%.1f%%</strong>
                </div>
                <div style="height: 10px; background: #d6ede2; border-radius: 999px; overflow: hidden;">
                  <div style="height: 100%%; width: %.1f%%; background: %s; border-radius: 999px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px;
                            font-size: 0.75rem;">
                  <span style="color: #6b7e72;">0%%</span>
                  <span style="color: #6b7e72;">Required: %d%%</span>
                  <span style="color: #6b7e72;">100%%</span>
                </div>
              </div>

              <!-- Certificate section (earned or not) -->
              %s

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,.6); font-size: 0.75rem;">
              <span style="color: #6b7e72;">© ELIF Pet Events Platform</span>
              <span style="color: #d6ede2; margin: 0 8px;">·</span>
              <span style="color: #6b7e72;">Do not reply to this email</span>
            </div>

          </div>
        </body>
        </html>
        """,
                headerTitle, eventTitle,
                headerBg,
                headerEmoji,
                headerTitle,
                eventTitle,
                userName,
                eventTitle,
                attendancePct,
                barPct, barColor,
                thresholdPct,
                certSection
        );
    }

    @Async
    public void sendAbsenceEmail(String toEmail, String userName, String eventTitle) {
        String html = String.format("""
        <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
        <body style="font-family:sans-serif;background:#f1f5f9;margin:0;padding:20px">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
            <div style="background:#fef3c7;padding:24px;text-align:center">
              <div style="font-size:48px">😔</div>
              <h2 style="color:#92400e">You missed the session</h2>
            </div>
            <div style="padding:28px">
              <p>Hi <strong>%s</strong>,</p>
              <p style="color:#475569">We noticed you did not join the virtual session for <strong>%s</strong>.</p>
              <p style="color:#475569">No certificate was issued. If you believe this is an error, please contact the organizer.</p>
            </div>
          </div>
        </body></html>
        """, userName, eventTitle);
        send(toEmail, "⚠️ You missed the session — " + eventTitle, html);
    }

    // ── Emails Inscription / Waitlist ───────────────────────────────

    @Async
    public void sendRegistrationConfirmedWithTicket(String toEmail, String firstName,
                                                    Event event, User user, EventParticipant participant) {
        try {
            byte[] pdfBytes = generateTicketPDF(event, user, participant);
            sendTicketWithPdf(toEmail, firstName, event.getTitle(), event.getId(), pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate ticket, fallback to simple email: {}", e.getMessage());
            sendRegistrationConfirmed(toEmail, firstName, event.getTitle(),
                    event.getId(), event.getLocation(), event.getStartDate());
        }
    }

    @Async
    public void sendRegistrationConfirmed(String toEmail, String firstName,
                                          String eventTitle, Long eventId, String eventLocation, LocalDateTime startDate) {
        send(toEmail, "✅ Registration confirmed: " + eventTitle,
                buildSimpleHtml(firstName,
                        "✅ Registration Confirmed!",
                        "You are registered for <strong>" + eventTitle + "</strong>.",
                        "📅 " + (startDate != null ? startDate.format(DATE_FMT) : "") +
                                "<br>📍 " + (eventLocation != null ? eventLocation : ""),
                        frontendBaseUrl + "/events/" + eventId,
                        "View Event"));
    }

    @Async
    public void sendRegistrationPending(String toEmail, String firstName, String eventTitle) {
        send(toEmail, "⏳ Registration received: " + eventTitle,
                buildSimpleHtml(firstName, "⏳ Registration Received",
                        "Your registration for <strong>" + eventTitle + "</strong> is pending admin approval.",
                        "You will be notified once reviewed.",
                        frontendBaseUrl + "/events", "Browse events"));
    }

    @Async
    public void sendRegistrationApproved(String toEmail, String firstName,
                                         String eventTitle, Long eventId) {
        send(toEmail, "🎉 Approved: " + eventTitle,
                buildSimpleHtml(firstName, "🎉 Registration Approved!",
                        "Your registration for <strong>" + eventTitle + "</strong> has been approved.",
                        "", frontendBaseUrl + "/events/" + eventId, "View Event"));
    }

    @Async
    public void sendRegistrationRejected(String toEmail, String firstName, String eventTitle) {
        send(toEmail, "❌ Registration update: " + eventTitle,
                buildSimpleHtml(firstName, "Registration Not Approved",
                        "Unfortunately, your registration for <strong>" + eventTitle + "</strong> was not approved.",
                        "", frontendBaseUrl + "/events", "Browse other events"));
    }

    @Async
    public void sendRegistrationCancelled(String toEmail, String firstName, String eventTitle) {
        send(toEmail, "🗑️ Registration cancelled: " + eventTitle,
                buildSimpleHtml(firstName, "Registration Cancelled",
                        "Your registration for <strong>" + eventTitle + "</strong> has been cancelled.",
                        "", frontendBaseUrl + "/events", "Browse other events"));
    }

    @Async
    public void sendWaitlistOffer(String toEmail, String firstName, String eventTitle,
                                  Long eventId, Long waitlistEntryId, int deadlineHours) {
        send(toEmail, "🎟️ Spot available — " + eventTitle,
                buildSimpleHtml(firstName, "🎟️ A Spot is Available!",
                        "A spot has opened up for <strong>" + eventTitle + "</strong>.",
                        "⏰ You have <strong>" + deadlineHours + " hour(s)</strong> to confirm.",
                        frontendBaseUrl + "/events/" + eventId + "/waitlist/confirm",
                        "Confirm My Spot"));
    }

    @Async
    public void sendWaitlistExpired(String toEmail, String firstName, String eventTitle) {
        send(toEmail, "⏰ Confirmation expired: " + eventTitle,
                buildSimpleHtml(firstName, "Offer Expired",
                        "The confirmation deadline for <strong>" + eventTitle + "</strong> has passed.",
                        "", frontendBaseUrl + "/events", "Browse other events"));
    }

    @Async
    public void sendEventReminder(String toEmail, String firstName, String eventTitle,
                                  Long eventId, String location, LocalDateTime startDate, String reminderLabel) {
        send(toEmail, "🔔 Reminder: " + eventTitle + " — " + reminderLabel,
                buildSimpleHtml(firstName, "🔔 Event Reminder",
                        "This is a reminder for <strong>" + eventTitle + "</strong>.",
                        "📅 " + (startDate != null ? startDate.format(DATE_FMT) : "") +
                                "<br>📍 " + (location != null ? location : "") +
                                "<br>⏰ " + reminderLabel,
                        frontendBaseUrl + "/events/" + eventId, "View Event"));
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private String buildSimpleHtml(String firstName, String title, String body,
                                   String details, String ctaUrl, String ctaLabel) {
        String detailsHtml = details.isBlank() ? "" :
                "<p style=\"color:#475569;font-size:13px;background:#f8fafc;padding:12px;border-radius:8px\">" + details + "</p>";

        return String.format("""
        <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
        <body style="font-family:sans-serif;background:#f1f5f9;margin:0;padding:20px">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;
                      box-shadow:0 2px 8px rgba(0,0,0,.08)">
            <div style="background:#1d9e75;padding:22px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:#fff">🐾 ELIF</div>
            </div>
            <div style="padding:28px">
              <h2 style="color:#0f172a;margin:0 0 14px">%s</h2>
              <p style="color:#334155;line-height:1.6">Hi <strong>%s</strong>,<br>%s</p>
              %s
              <div style="text-align:center;margin:22px 0">
                <a href="%s" style="display:inline-block;padding:11px 28px;background:#1d9e75;
                   color:#fff;text-decoration:none;border-radius:8px;font-weight:600">%s</a>
              </div>
              <p style="font-size:12px;color:#94a3b8;text-align:center">© ELIF — Do not reply to this email.</p>
            </div>
          </div>
        </body></html>
        """, title, firstName, body, detailsHtml, ctaUrl, ctaLabel);
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("📧 Email sent to {} — '{}'", to, subject);
        } catch (Exception e) {
            log.error("❌ Email failed to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        send(to, subject, htmlBody);
    }
}