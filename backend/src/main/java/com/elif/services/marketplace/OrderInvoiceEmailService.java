package com.elif.services.marketplace;

import com.elif.entities.marketplace.Order;
import com.elif.entities.marketplace.OrderItem;
import com.elif.entities.user.User;
import com.elif.repositories.user.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderInvoiceEmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${app.mail.from:}")
    private String fromAddress;

    public void sendOrderInvoiceEmail(Order order) {
        Long userId = Objects.requireNonNull(order.getUserId(), "Order user id is required.");
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found for order: " + order.getId()));

        String targetEmail = user.getEmail();
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new IllegalArgumentException("User email is empty for order: " + order.getId());
        }

        byte[] pdfBytes = generateInvoicePdf(order, user);
        String emailBody = buildEmailBody(user, order);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            if (fromAddress != null && !fromAddress.isBlank()) {
            helper.setFrom(Objects.requireNonNull(fromAddress));
            }

            helper.setTo(Objects.requireNonNull(targetEmail));
            helper.setSubject("ELIF Marketplace Invoice #" + order.getId());
            helper.setText(Objects.requireNonNull(emailBody), false);
            helper.addAttachment(
                    "elif-order-" + order.getId() + ".pdf",
                new ByteArrayResource(Objects.requireNonNull(pdfBytes)),
                    "application/pdf"
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new IllegalArgumentException("Failed to send invoice email: " + e.getMessage());
        }
    }

    private String buildEmailBody(User user, Order order) {
        return "Hello " + user.getFirstName() + ",\n\n"
                + "Thank you for shopping with ELIF."
                + "\nYour order #" + order.getId() + " was created successfully."
                + "\nPayment method: " + (order.getPaymentMethod() == null ? "CASH" : order.getPaymentMethod())
                + "\nTotal amount: $" + order.getTotalAmount()
                + "\n\nPlease find your invoice attached as a PDF."
                + "\n\nRegards,\nELIF Team";
    }

    private byte[] generateInvoicePdf(Order order, User user) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 42, 42);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            document.add(new Paragraph("ELIF Marketplace Invoice", titleFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Order ID: " + order.getId(), headingFont));
            document.add(new Paragraph("Customer: " + user.getFirstName() + " " + user.getLastName()));
            document.add(new Paragraph("Email: " + user.getEmail()));
            document.add(new Paragraph("Payment Method: " + (order.getPaymentMethod() == null ? "CASH" : order.getPaymentMethod())));

            if (order.getCreatedAt() != null) {
                document.add(new Paragraph("Date: " + order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
            }

            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(new float[]{4.2f, 1.2f, 2.0f, 2.0f});
            table.setWidthPercentage(100f);

            table.addCell(headerCell("Product"));
            table.addCell(headerCell("Qty"));
            table.addCell(headerCell("Unit Price"));
            table.addCell(headerCell("Subtotal"));

            for (OrderItem item : order.getOrderItems()) {
                table.addCell(valueCell(item.getProductName()));
                table.addCell(valueCell(String.valueOf(item.getQuantity())));
                table.addCell(valueCell("$" + item.getUnitPrice()));
                table.addCell(valueCell("$" + item.getSubtotal()));
            }

            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total: $" + order.getTotalAmount(), headingFont));

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new IllegalArgumentException("Failed to generate invoice PDF: " + e.getMessage());
        }
    }

    private PdfPCell headerCell(String value) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setPadding(8f);
        return cell;
    }

    private PdfPCell valueCell(String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value));
        cell.setPadding(8f);
        return cell;
    }
}
