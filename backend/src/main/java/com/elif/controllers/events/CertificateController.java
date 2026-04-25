package com.elif.controllers.events;

import com.elif.entities.events.EventVirtualAttendance;
import com.elif.repositories.events.EventVirtualAttendanceRepository;
import com.elif.services.events.implementations.EventEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true", allowedHeaders = "*")
@RequiredArgsConstructor
@Slf4j
public class CertificateController {

    private static final DateTimeFormatter DATE_EN =
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

    private final EventVirtualAttendanceRepository attendanceRepo;
    private final EventEmailService emailService;

    @GetMapping(value = "/{eventId}/{userId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getCertificate(
            @PathVariable Long eventId,
            @PathVariable Long userId) {

        log.info("Certificate requested: eventId={}, userId={}", eventId, userId);

        Optional<EventVirtualAttendance> opt =
                attendanceRepo.findBySessionEventIdAndUserId(eventId, userId);

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorPage(
                            "Certificate Not Found",
                            "No attendance record was found for this event.",
                            "Please ensure you attended the virtual session."
                    ));
        }

        EventVirtualAttendance attendance = opt.get();

        if (!attendance.isCertificateEarned()) {
            double percent = attendance.getAttendancePercent() != null ? attendance.getAttendancePercent() : 0.0;
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorPage(
                            "Certificate Not Earned",
                            String.format(Locale.US, "Your attendance was %.1f%%, below the required threshold.", percent),
                            "Minimum attendance is required before a certificate can be issued."
                    ));
        }

        CertData data = buildData(attendance, eventId, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0")
                .contentType(MediaType.TEXT_HTML)
                .body(buildCertificateHtml(data));
    }

    @PostMapping("/{eventId}/{userId}/send")
    public ResponseEntity<String> sendCertificateByEmail(
            @PathVariable Long eventId,
            @PathVariable Long userId) {

        log.info("Send certificate email: eventId={}, userId={}", eventId, userId);

        Optional<EventVirtualAttendance> opt =
                attendanceRepo.findBySessionEventIdAndUserId(eventId, userId);

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Attendance record not found.");
        }

        EventVirtualAttendance attendance = opt.get();

        if (!attendance.isCertificateEarned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Certificate not earned.");
        }

        String toEmail = attendance.getUser().getEmail();
        String firstName = attendance.getUser().getFirstName();
        String certUrl = "http://localhost:8087/elif/api/certificates/" + eventId + "/" + userId;
        String eventTitle = attendance.getSession().getEvent().getTitle();
        double percent = attendance.getAttendancePercent() != null ? attendance.getAttendancePercent() : 0.0;
        int threshold = attendance.getSession().getAttendanceThresholdPercent();

        emailService.sendAttendanceResultEmail(
                toEmail, firstName, eventTitle, percent, threshold, true, certUrl);

        log.info("Certificate email sent to: {}", toEmail);
        return ResponseEntity.ok("Certificate email sent to " + toEmail);
    }

    private CertData buildData(EventVirtualAttendance attendance, Long eventId, Long userId) {
        String userName = joinName(
                attendance.getUser().getFirstName(),
                attendance.getUser().getLastName()
        );
        String eventTitle = nullSafe(attendance.getSession().getEvent().getTitle(), "Virtual Event");
        String eventDate = attendance.getSession().getEvent().getStartDate() != null
                ? attendance.getSession().getEvent().getStartDate().format(DATE_EN)
                : "N/A";
        String attendancePercent = String.format(
                Locale.US,
                "%.1f%%",
                attendance.getAttendancePercent() != null ? attendance.getAttendancePercent() : 0.0
        );
        long minutes = Math.max(0, attendance.getTotalSecondsPresent() / 60);
        String issuedDate = LocalDate.now().format(DATE_EN);
        String certId = "ELIF-CERT-" + eventId + "-" + userId + "-" + Year.now().getValue();
        String threshold = attendance.getSession().getAttendanceThresholdPercent() + "%";

        return new CertData(
                userName,
                eventTitle,
                eventDate,
                attendancePercent,
                minutes,
                issuedDate,
                certId,
                threshold
        );
    }

    private String buildCertificateHtml(CertData data) {
        Map<String, String> values = new LinkedHashMap<>();
        values.put("PAGE_TITLE", escapeHtml(data.eventTitle()));
        values.put("USER_NAME", escapeHtml(data.userName()));
        values.put("EVENT_TITLE", escapeHtml(data.eventTitle()));
        values.put("EVENT_DATE", escapeHtml(data.eventDate()));
        values.put("MINUTES", String.valueOf(data.minutes()));
        values.put("ATTENDANCE", escapeHtml(data.attendancePercent()));
        values.put("ISSUED_DATE", escapeHtml(data.issuedDate()));
        values.put("THRESHOLD", escapeHtml(data.threshold()));
        values.put("CERT_ID", escapeHtml(data.certId()));

        String template = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Certificate | {{PAGE_TITLE}}</title>
  <style>
    :root {
      --border-color: #334155;
      --text-main: #000000;
      --text-muted: #475569;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #ffffff;
      font-family: "Times New Roman", Times, serif;
      padding: 40px;
      display: flex;
      justify-content: center;
    }
    .page { max-width: 900px; width: 100%; }
    .actions {
      margin-bottom: 30px;
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    .button {
      padding: 10px 20px;
      cursor: pointer;
      background: #000;
      color: #fff;
      border: none;
      font-family: sans-serif;
    }
    .certificate-shell {
      border: 8px double var(--border-color);
      padding: 40px;
      position: relative;
    }
    .certificate-shell::before {
      content: "";
      position: absolute;
      inset: 10px;
      border: 2px solid var(--border-color);
    }
    .certificate {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 40px;
    }
    .brand {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .title {
      font-size: 32px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 20px 0;
      border-bottom: 2px solid var(--border-color);
      display: inline-block;
      padding-bottom: 10px;
    }
    .recipient {
      font-size: 42px;
      font-style: italic;
      margin: 30px 0;
      color: var(--text-main);
    }
    .description {
      font-size: 18px;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    .event-title {
      font-size: 28px;
      font-weight: bold;
      text-decoration: underline;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 40px 0;
      border-top: 1px solid #ccc;
      padding-top: 20px;
    }
    .stat__label { font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 5px; }
    .stat__value { font-weight: bold; font-family: sans-serif; }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 60px;
    }
    .signature { width: 200px; }
    .signature-line { border-top: 1px solid #000; margin-top: 40px; }
    .cert-id { font-size: 12px; font-family: monospace; }

    @media print {
      body { padding: 0; }
      .actions { display: none; }
      .certificate-shell { border-width: 6px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="actions">
      <button class="button" onclick="window.close()">Close</button>
      <button class="button" onclick="window.print()">Print Certificate</button>
    </section>
    <div class="certificate-shell">
      <article class="certificate">
        <div class="brand">ELIF</div>
        <div class="title">Certificate of Participation</div>
        <p>This is to certify that</p>
        <div class="recipient">{{USER_NAME}}</div>
        <div class="description">
          has successfully completed the requirements for the event:<br/>
          <span class="event-title">{{EVENT_TITLE}}</span>
        </div>
        <div class="stats">
          <div><span class="stat__label">Date</span><div class="stat__value">{{EVENT_DATE}}</div></div>
          <div><span class="stat__label">Duration</span><div class="stat__value">{{MINUTES}} min</div></div>
          <div><span class="stat__label">Attendance</span><div class="stat__value">{{ATTENDANCE}}</div></div>
          <div><span class="stat__label">Status</span><div class="stat__value">Verified</div></div>
        </div>
        <div class="footer">
          <div class="signature">
            <div class="signature-line"></div>
            <div>Authorized Signature</div>
          </div>
          <div class="cert-id">ID: {{CERT_ID}}</div>
        </div>
      </article>
    </div>
  </div>
</body>
</html>
""";

        return applyTemplate(template, values);
    }

    private String errorPage(String title, String message, String hint) {
        Map<String, String> values = Map.of(
                "TITLE", escapeHtml(title),
                "MESSAGE", escapeHtml(message),
                "HINT", escapeHtml(hint)
        );

        String template = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{TITLE}}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #ffffff;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #0f172a;
    }
    .card {
      width: min(560px, 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
    }
    h1 { margin: 0 0 12px; font-size: 28px; }
    p { margin: 0; color: #475569; line-height: 1.7; }
    .hint { margin-top: 16px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <article class="card">
    <h1>{{TITLE}}</h1>
    <p>{{MESSAGE}}</p>
    <p class="hint">{{HINT}}</p>
  </article>
</body>
</html>
""";

        return applyTemplate(template, values);
    }

    private String applyTemplate(String template, Map<String, String> values) {
        String html = template;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return html;
    }

    private String joinName(String firstName, String lastName) {
        String combined = (nullSafe(firstName, "") + " " + nullSafe(lastName, "")).trim();
        return combined.isEmpty() ? "Participant" : combined;
    }

    private String nullSafe(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String escapeHtml(String value) {
        String input = value == null ? "" : value;
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private record CertData(
            String userName,
            String eventTitle,
            String eventDate,
            String attendancePercent,
            long minutes,
            String issuedDate,
            String certId,
            String threshold
    ) {}
}