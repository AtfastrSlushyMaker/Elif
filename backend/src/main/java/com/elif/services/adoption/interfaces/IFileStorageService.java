package com.elif.services.adoption.interfaces;

import org.springframework.web.multipart.MultipartFile;

public interface IFileStorageService {
    String storePetImage(MultipartFile file);

    String storeShelterLogo(MultipartFile file);

    StoredFileContent getFileContent(Long fileId);

    record StoredFileContent(byte[] data, String contentType) {
    }
}