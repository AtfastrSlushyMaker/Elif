package com.elif.repositories.veterinarian;

import com.elif.entities.veterinarian.Veterinarian;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VeterinarianRepository extends JpaRepository<Veterinarian, Long> {
    List<Veterinarian> findByAvailable(boolean available);
    List<Veterinarian> findBySpeciality(String speciality);
}
