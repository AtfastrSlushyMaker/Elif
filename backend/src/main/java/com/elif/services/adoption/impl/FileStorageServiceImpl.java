package com.elif.services.adoption.impl;

import com.elif.entities.adoption.AdoptionImage;
import com.elif.repositories.adoption.AdoptionImageRepository;
import com.elif.services.adoption.interfaces.IFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements IFileStorageService {

    private static final String PET_IMAGE_CATEGORY = "PET";
    private static final String SHELTER_LOGO_CATEGORY = "SHELTER_LOGO";

    private final AdoptionImageRepository adoptionImageRepository;

    @Override
    public String storePetImage(MultipartFile file) {
        return storeImage(file, PET_IMAGE_CATEGORY);
    }

    @Override
    public String storeShelterLogo(MultipartFile file) {
        return storeImage(file, SHELTER_LOGO_CATEGORY);
    }

    @Override
    public StoredFileContent getFileContent(Long fileId) {
        if (fileId == null) {
            throw new IllegalArgumentException("Image id is required");
        }

        AdoptionImage image = adoptionImageRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Image not found"));

        byte[] data = image.getFileData();
        if (data == null || data.length == 0) {
            throw new IllegalStateException("Image content is empty");
        }

        return new StoredFileContent(data, image.getContentType());
    }

    private String storeImage(MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            originalFileName = "uploaded-image";
        }
        originalFileName = originalFileName.replace("..", "").replace('\\', '/');

        try {
            AdoptionImage image = new AdoptionImage();
            image.setCategory(category);
            image.setFileName(originalFileName);
            image.setContentType(contentType);
            image.setFileData(file.getBytes());

            AdoptionImage saved = adoptionImageRepository.save(image);
            return "/api/adoption/upload/files/" + saved.getId() + "/content";
        } catch (IOException ex) {
            throw new RuntimeException("Could not store image " + originalFileName, ex);
        }
    }
}