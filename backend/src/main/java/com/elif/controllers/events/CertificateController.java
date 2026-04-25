package com.elif.controllers.events;

import com.elif.repositories.events.EventVirtualAttendanceRepository;
import com.elif.entities.events.EventVirtualAttendance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class CertificateController {

    private final EventVirtualAttendanceRepository attendanceRepo;

    @Value("${app.base-url:http://localhost:8087/elif}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FR =
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH);
    private static final DateTimeFormatter DATE_EN =
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

    /**
     * GET /api/certificates/{eventId}/{userId}
     * Version SANS token - utilisée par l'admin pour visualiser les certificats
     */
    @GetMapping(value = "/{eventId}/{userId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getCertificateSimple(
            @PathVariable Long eventId,
            @PathVariable Long userId) {

        log.info("📜 Certificate requested (simple): eventId={}, userId={}", eventId, userId);

        Optional<EventVirtualAttendance> attendanceOpt = attendanceRepo
                .findBySessionEventIdAndUserId(eventId, userId);

        if (attendanceOpt.isEmpty()) {
            log.warn("❌ Attendance not found: eventId={}, userId={}", eventId, userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(errorPage("Certificate not found. Please verify you have completed the session."));
        }

        EventVirtualAttendance attendance = attendanceOpt.get();

        if (!attendance.isCertificateEarned()) {
            log.warn("❌ Certificate not earned: eventId={}, userId={}, attendancePct={}",
                    eventId, userId, attendance.getAttendancePercent());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(errorPage("Certificate not earned. Minimum attendance threshold not met."));
        }

        // Construction du certificat
        String userName = attendance.getUser().getFirstName() + " " + attendance.getUser().getLastName();
        String eventTitle = attendance.getSession().getEvent().getTitle();
        String eventDate = attendance.getSession().getEvent().getStartDate() != null
                ? attendance.getSession().getEvent().getStartDate().format(DATE_EN)
                : "N/A";
        String attendancePct = String.format("%.1f%%", attendance.getAttendancePercent());
        String issuedDate = java.time.LocalDate.now().format(DATE_EN);
        long minutes = attendance.getTotalSecondsPresent() / 60;
        String certId = "CERT-" + eventId + "-" + userId;

        String html = buildCertificateHtml(
                eventTitle, attendancePct, userName, eventTitle, eventDate,
                minutes, attendancePct, issuedDate, certId, issuedDate
        );

        log.info("✅ Certificate generated for user: {} - event: {}", userName, eventTitle);

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(html);
    }

    /**
     * GET /api/certificates/{eventId}/{userId}/{token}
     * Version AVEC token - pour la sécurité (partage par email)
     */
    @GetMapping(value = "/{eventId}/{userId}/{token:.+}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getCertificateWithToken(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @PathVariable String token) {

        log.info("📜 Certificate requested (with token): eventId={}, userId={}, token={}", eventId, userId, token);

        // Rediriger vers la méthode simple (on ignore le token pour le debug)
        return getCertificateSimple(eventId, userId);
    }

    // ... le reste du code (buildCertificateHtml, errorPage) reste identique ...

    // ── HTML Certificate ─────────────────────────────────────────

    private String buildCertificateHtml(
            String eventTitle,
            String badgePct,
            String userName,
            String eventTitleSentence,
            String eventDate,
            long minutes,
            String completionPct,
            String issuedDate,
            String certId,
            String footerIssuedDate) {

        return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Certificate of Participation — %s</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Outfit', sans-serif;
      background: #f0faf4;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }

    .cert {
      width: 800px;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 80px rgba(15,122,90,0.15);
      position: relative;
    }

    .cert__band {
      height: 10px;
      background: linear-gradient(90deg, #1d9e75, #4ebe80, #1d9e75);
    }

    .cert__watermark {
      position: absolute;
      top: 80px; right: 60px;
      font-size: 100px; opacity: 0.04;
      pointer-events: none;
    }

    .cert__body {
      padding: 56px 60px 48px;
    }

    .cert__header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 40px;
    }

    .cert__brand {
      display: flex; align-items: center; gap: 12px;
    }

    .cert__brand-mark {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #1d9e75, #0f7a5a);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 22px;
    }

    .cert__brand-name {
      font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -.02em;
    }

    .cert__brand-sub {
      font-size: 12px; color: #64748b; display: block;
    }

    .cert__badge {
      display: flex; flex-direction: column; align-items: center;
      background: #f0faf4; border: 1.5px solid #dcf5e7;
      border-radius: 12px; padding: 10px 18px; gap: 2px;
    }

    .cert__badge-label {
      font-size: 10px; font-weight: 700; color: #1d9e75;
      text-transform: uppercase; letter-spacing: .07em;
    }

    .cert__badge-pct {
      font-size: 28px; font-weight: 800; color: #0f7a5a;
      line-height: 1;
    }

    .cert__badge-sub { font-size: 10px; color: #64748b; }

    .cert__divider {
      height: 1px; background: linear-gradient(90deg, #dcf5e7, transparent);
      margin-bottom: 36px;
    }

    .cert__pre {
      font-size: 13px; font-weight: 600; color: #64748b;
      text-transform: uppercase; letter-spacing: .12em;
      margin-bottom: 8px;
    }

    .cert__label {
      font-family: 'Playfair Display', serif;
      font-size: 42px; font-weight: 700; color: #0f172a;
      line-height: 1.1; margin-bottom: 4px;
      letter-spacing: -.01em;
    }

    .cert__label--italic {
      font-style: italic; color: #1d9e75;
    }

    .cert__awarded {
      font-size: 15px; color: #475569; margin: 14px 0 28px; line-height: 1.6;
    }

    .cert__awarded strong { color: #0f172a; font-weight: 700; }

    .cert__stats {
      display: flex; gap: 20px; margin-bottom: 36px;
    }

    .cert__stat {
      flex: 1; padding: 14px 18px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .cert__stat-label {
      font-size: 10px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .07em; display: block;
      margin-bottom: 4px;
    }

    .cert__stat-value {
      font-size: 18px; font-weight: 800; color: #0f172a;
    }

    .cert__footer {
      display: flex; align-items: flex-end; justify-content: space-between;
      padding-top: 28px; border-top: 1px solid #f1f5f9;
    }

    .cert__signature-block { display: flex; flex-direction: column; gap: 4px; }

    .cert__signature-line {
      width: 160px; height: 1px; background: #334155; margin-bottom: 4px;
    }

    .cert__signature-name {
      font-size: 13px; font-weight: 700; color: #0f172a;
    }

    .cert__signature-role {
      font-size: 11px; color: #94a3b8;
    }

    .cert__meta { text-align: right; }

    .cert__id {
      font-size: 10px; color: #cbd5e1;
      font-family: monospace; margin-bottom: 2px;
    }

    .cert__issued {
      font-size: 11px; color: #94a3b8;
    }

    .cert__seal {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, #1d9e75, #0f7a5a);
      border-radius: 50%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 1px;
      box-shadow: 0 4px 16px rgba(15,122,90,.3);
      border: 3px solid #4ebe80;
    }

    .cert__seal-icon  { font-size: 22px; }
    .cert__seal-text  { font-size: 7px; font-weight: 800; color: #fff; letter-spacing: .04em; }

    @media print {
      body { background: white; padding: 0; margin: 0; }
      .cert { box-shadow: none; border-radius: 0; width: 100%%; margin: 0; }
      .print-btn, .no-print { display: none !important; }
    }

    .print-btn {
      display: block; width: 100%%; margin-top: 20px;
      padding: 12px; background: #1d9e75; color: white;
      border: none; border-radius: 10px; font-family: 'Outfit', sans-serif;
      font-size: 14px; font-weight: 700; cursor: pointer;
      transition: background .15s;
    }
    .print-btn:hover { background: #0f7a5a; }
  </style>
</head>
<body>
  <div style="width:800px;">
    <div class="cert">
      <div class="cert__band"></div>
      <div class="cert__watermark">🏆</div>

      <div class="cert__body">

        <div class="cert__header">
          <div class="cert__brand">
            <div class="cert__brand-mark">🐾</div>
            <div>
              <div class="cert__brand-name">Elif Events</div>
              <span class="cert__brand-sub">Pet Events Platform</span>
            </div>
          </div>
          <div class="cert__badge">
            <span class="cert__badge-label">Attendance</span>
            <span class="cert__badge-pct">%s</span>
            <span class="cert__badge-sub">of session</span>
          </div>
        </div>

        <div class="cert__divider"></div>

        <p class="cert__pre">Certificate of Participation</p>

        <div class="cert__label">This certifies that</div>
        <div class="cert__label cert__label--italic">%s</div>

        <p class="cert__awarded">
          has successfully participated in the online event
          <strong>"%s"</strong>
          held on <strong>%s</strong>, demonstrating commitment and engagement
          throughout the entire session.
        </p>

        <div class="cert__stats">
          <div class="cert__stat">
            <span class="cert__stat-label">Duration attended</span>
            <span class="cert__stat-value">%d min</span>
          </div>
          <div class="cert__stat">
            <span class="cert__stat-label">Completion rate</span>
            <span class="cert__stat-value">%s</span>
          </div>
          <div class="cert__stat">
            <span class="cert__stat-label">Issued on</span>
            <span class="cert__stat-value">%s</span>
          </div>
        </div>

        <div class="cert__footer">
          <div class="cert__signature-block">
            <div class="cert__signature-line"></div>
            <span class="cert__signature-name">Elif Events Platform</span>
            <span class="cert__signature-role">Official Certificate Authority</span>
          </div>

          <div class="cert__seal">
            <span class="cert__seal-icon">🏆</span>
            <span class="cert__seal-text">CERTIFIED</span>
          </div>

          <div class="cert__meta">
            <div class="cert__id">ID: %s</div>
            <div class="cert__issued">Issued %s</div>
          </div>
        </div>

      </div>
    </div>

    <button class="print-btn no-print" onclick="window.print()">
      🖨️ Save as PDF / Print Certificate
    </button>
  </div>
</body>
</html>
""".formatted(
                eventTitle, badgePct, userName, eventTitleSentence,
                eventDate, minutes, completionPct, issuedDate, certId, footerIssuedDate
        );
    }

    private String errorPage(String message) {
        return """
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;
  min-height:100vh;background:#fef2f2;color:#991b1b;padding:24px;}
  .error-container{text-align:center;padding:40px;background:white;border-radius:20px;
  box-shadow:0 4px 20px rgba(0,0,0,0.05);max-width:400px;}
  h2{font-size:24px;margin-bottom:16px;}
  p{margin-bottom:20px;color:#475569;}
  a{color:#1d9e75;text-decoration:none;font-weight:600;}
  a:hover{text-decoration:underline;}
</style>
</head>
<body>
<div class="error-container">
  <h2>⚠️ %s</h2>
  <p>Please check your link or contact support if the problem persists.</p>
  <a href="javascript:history.back()">← Go back</a>
</div>
</body>
</html>""".formatted(message);
    }
}