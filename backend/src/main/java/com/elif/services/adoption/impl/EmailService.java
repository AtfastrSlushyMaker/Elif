package com.elif.services.adoption.impl;

import com.elif.services.adoption.interfaces.IEmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService implements IEmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    // ✅ GETTERS pour permettre l'accès depuis AppointmentService
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
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendTextEmail(String to, String subject, String textBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, false);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}