package com.elif.controllers.adoption;

import com.elif.services.adoption.interfaces.IFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/adoption/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final IFileStorageService fileStorageService;

    @PostMapping("/pet")
    public ResponseEntity<Map<String, String>> uploadPetImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storePetImage(file);
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/shelter-logo")
    public ResponseEntity<Map<String, String>> uploadShelterLogo(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeShelterLogo(file);
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/files/{fileId}/content")
    public ResponseEntity<byte[]> getUploadedFile(@PathVariable Long fileId) {
        IFileStorageService.StoredFileContent fileContent = fileStorageService.getFileContent(fileId);
        String contentType = fileContent.contentType();

        MediaType mediaType;
        try {
            mediaType = contentType != null && !contentType.isBlank()
                    ? MediaType.parseMediaType(contentType)
                    : MediaType.APPLICATION_OCTET_STREAM;
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(Objects.requireNonNull(mediaType))
                .header("Cache-Control", "public, max-age=86400")
                .body(fileContent.data());
    }
}