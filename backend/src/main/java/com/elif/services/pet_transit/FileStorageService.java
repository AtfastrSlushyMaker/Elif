package com.elif.services.pet_transit;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeDestinationCover(MultipartFile file);
}
