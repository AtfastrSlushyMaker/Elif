package com.elif.services.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${app.upload.base-dir}")
    private String baseUploadDir;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Valider le type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Seules les images sont acceptées (JPG, PNG, GIF)");
        }

        // Valider la taille (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("L'image ne doit pas dépasser 5MB");
        }

        // Créer le dossier events dans uploads
        Path uploadDir = Paths.get(baseUploadDir, "events");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Générer un nom unique
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String originalName = file.getOriginalFilename();
        String extension = originalName.substring(originalName.lastIndexOf("."));
        String fileName = timestamp + "_" + uniqueId + extension;

        // Sauvegarder
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Retourner le chemin relatif pour l'URL
        return "/uploads/events/" + fileName;
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;

        try {
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(baseUploadDir, "events", fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Erreur suppression image: " + e.getMessage());
        }
    }
}