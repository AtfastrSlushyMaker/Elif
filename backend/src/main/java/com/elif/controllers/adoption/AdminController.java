package com.elif.controllers.adoption;

import com.elif.dto.adoption.response.AdminStatisticsResponseDTO;
import com.elif.dto.adoption.response.ShelterAdminDTO;
import com.elif.services.adoption.interfaces.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsResponseDTO> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    @GetMapping("/shelters")
    public ResponseEntity<List<ShelterAdminDTO>> getAllShelters() {  // ← MODIFIER
        return ResponseEntity.ok(adminService.getAllShelters());
    }

    @GetMapping("/shelters/{id}")
    public ResponseEntity<ShelterAdminDTO> getShelterById(@PathVariable Long id) {
        ShelterAdminDTO shelter = adminService.getShelterById(id);
        return ResponseEntity.ok(shelter);
    }
}