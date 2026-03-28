package com.elif.repositories.user;

import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Récupérer les utilisateurs par rôle et statut de vérification
    List<User> findByRoleAndVerified(Role role, Boolean verified);
}