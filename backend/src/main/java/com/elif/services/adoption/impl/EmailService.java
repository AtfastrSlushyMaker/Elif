package com.elif.services.adoption.impl;

import com.elif.entities.adoption.Contract;
import com.elif.services.adoption.interfaces.IEmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Service
public class EmailService implements IEmailService {

  // Package access is used by AppointmentService.
  final JavaMailSender mailSender;

  @Value("${app.mail.from:${spring.mail.username:}}")
  String fromEmail;

  @Value("${app.frontend.base-url:http://localhost:4200}")
  String frontendBaseUrl;

  private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  // Exposed for AppointmentService integration.
  public JavaMailSender getMailSender() {
    return mailSender;
  }

  public String getFromEmail() {
    return fromEmail;
  }

  @Override
  public void sendHtmlEmail(String to, String subject, String htmlBody) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      if (fromEmail != null && !fromEmail.isBlank()) {
        helper.setFrom(Objects.requireNonNull(fromEmail));
      }
      helper.setTo(Objects.requireNonNull(to));
      helper.setSubject(Objects.requireNonNull(subject));
      helper.setText(Objects.requireNonNull(htmlBody), true);
      mailSender.send(message);
      System.out.println("HTML email sent to: " + to);
    } catch (MessagingException e) {
      System.err.println("Failed to send HTML email to " + to + ": " + e.getMessage());
      throw new RuntimeException("Failed to send email", e);
    }
  }

  @Override
  public void sendTextEmail(String to, String subject, String textBody) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
      if (fromEmail != null && !fromEmail.isBlank()) {
        helper.setFrom(Objects.requireNonNull(fromEmail));
      }
      helper.setTo(Objects.requireNonNull(to));
      helper.setSubject(Objects.requireNonNull(subject));
      helper.setText(Objects.requireNonNull(textBody), false);
      mailSender.send(message);
      System.out.println("Text email sent to: " + to);
    } catch (MessagingException e) {
      System.err.println("Failed to send text email to " + to + ": " + e.getMessage());
      throw new RuntimeException("Failed to send email", e);
    }
  }

  @Override
  @Async
  public void sendAdoptionApprovedEmail(Contract contract) {
    if (contract.getAdoptant() == null ||
        contract.getAdoptant().getEmail() == null)
      return;

    String to = contract.getAdoptant().getEmail();
    String firstName = contract.getAdoptant().getFirstName();
    String animalName = contract.getAnimal() != null
        ? contract.getAnimal().getName()
        : "the animal";
    String shelterName = contract.getShelter() != null
        ? contract.getShelter().getName()
        : "the shelter";
    String contractNum = contract.getNumeroContrat();
    String date = contract.getDateAdoption() != null
        ? contract.getDateAdoption().format(DATE_FMT)
        : "today";

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      if (fromEmail != null && !fromEmail.isBlank()) {
        helper.setFrom(Objects.requireNonNull(fromEmail));
      }
      helper.setTo(Objects.requireNonNull(to));
      helper.setSubject(Objects.requireNonNull("Your adoption of " + animalName + " has been approved"));
      helper.setText(Objects.requireNonNull(buildEmailHtml(firstName, animalName, shelterName, contractNum, date)),
          true);
      mailSender.send(message);
      System.out.println("Approval email sent to: " + to);
    } catch (MessagingException e) {
      System.err.println("Failed to send email to " + to + ": " + e.getMessage());
    }
  }

  private String buildEmailHtml(String firstName, String animalName,
      String shelterName, String contractNum, String date) {
    String contractsUrl = frontendBaseUrl + "/app/adoption/my-contracts";
    return """
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
          body{font-family:Arial,sans-serif;background:#f4f6f8;margin:0;padding:0}
          .container{max-width:600px;margin:30px auto;background:white;border-radius:12px;
            overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}
          .header{background:rgb(58,146,130);padding:30px;text-align:center}
          .header h1{color:white;margin:0;font-size:24px}
          .header p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px}
          .body{padding:30px}
          .body p{color:#4a5568;font-size:14px;line-height:1.6}
          .info-box{background:#f0fff4;border-left:4px solid rgb(58,146,130);
            border-radius:8px;padding:16px;margin:20px 0}
          .info-box p{margin:4px 0;font-size:13px;color:#2d3748}
          .info-box strong{color:rgb(58,146,130)}
          .btn{display:inline-block;background:rgb(58,146,130);color:white;
            padding:12px 28px;border-radius:8px;text-decoration:none;
            font-weight:bold;font-size:14px;margin-top:20px}
          .footer{background:#f4f6f8;padding:16px;text-align:center;
            font-size:11px;color:#a0aec0}
        </style></head><body>
        <div class="container">
          <div class="header">
            <h1>Congratulations, %s!</h1>
            <p>Your adoption request has been approved</p>
          </div>
          <div class="body">
            <p>Your adoption of <strong>%s</strong> has been approved by <strong>%s</strong>.</p>
            <p>Your contract is ready to download in <strong>My Contracts</strong>.</p>
            <div class="info-box">
              <p><strong>Contract N° :</strong> %s</p>
              <p><strong>Animal :</strong> %s</p>
              <p><strong>Shelter :</strong> %s</p>
              <p><strong>Date :</strong> %s</p>
            </div>
            <a href="%s" class="btn">
              View My Contracts
            </a>
          </div>
          <div class="footer">This email was sent automatically.</div>
        </div></body></html>
        """.formatted(firstName, animalName, shelterName,
        contractNum, animalName, shelterName, date, contractsUrl);
  }
}