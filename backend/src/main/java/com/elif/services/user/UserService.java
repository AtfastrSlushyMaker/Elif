package com.elif.services.user;

import com.elif.dto.user.LoginRequest;
import com.elif.dto.user.RegisterRequest;
import com.elif.dto.user.UserResponse;
import com.elif.entities.adoption.Shelter;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.repositories.adoption.ShelterRepository;
import com.elif.repositories.user.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserService implements IUserService {

    final UserRepository userRepository;
    final ShelterRepository shelterRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public User addOrUpdateUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long idUser) {
        userRepository.deleteById(idUser);
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User findUser(Long idUser) {
        return userRepository.findById(idUser).orElse(null);
    }

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        Role role;
        boolean verified;

        if ("SHELTER".equals(request.getAccountType())) {
            role = Role.SHELTER;
            verified = false;
        } else {
            role = Role.USER;
            verified = true;
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .verified(verified)
                .build();

        user = userRepository.save(user);

        // Si c'est un shelter, créer l'entrée dans la table shelter
        if ("SHELTER".equals(request.getAccountType())) {
            Shelter shelter = Shelter.builder()
                    .name(request.getOrganizationName())
                    .address(request.getAddress())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .licenseNumber(request.getLicenseNumber())
                    .description(request.getDescription())
                    .logoUrl(request.getLogoUrl())
                    .user(user)
                    .verified(false)
                    .build();
            shelterRepository.save(shelter);
        }

        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name(), user.getVerified());
    }

    @Override
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name(), user.getVerified());
    }

    // ============================================================
    // GESTION DES REFUGES
    // ============================================================

    @Override
    public List<User> getPendingShelters() {
        return userRepository.findByRoleAndVerified(Role.SHELTER, false);
    }

    @Override
    public UserResponse approveShelter(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.SHELTER) {
            throw new IllegalArgumentException("User is not a shelter");
        }

        // Mettre à jour l'utilisateur (si pas déjà vérifié)
        if (!user.getVerified()) {
            user.setVerified(true);
            user = userRepository.save(user);
        }

        // Mettre à jour le shelter associé
        Shelter shelter = shelterRepository.findByUserId(userId).orElse(null);
        if (shelter != null && !shelter.getVerified()) {
            shelter.setVerified(true);
            shelterRepository.save(shelter);
        }

        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name(), user.getVerified());
    }

    @Override
    public void rejectShelter(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.SHELTER) {
            throw new IllegalArgumentException("User is not a shelter");
        }

        // Supprimer le shelter associé
        Shelter shelter = shelterRepository.findByUserId(userId).orElse(null);
        if (shelter != null) {
            shelterRepository.delete(shelter);
        }

        userRepository.delete(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}