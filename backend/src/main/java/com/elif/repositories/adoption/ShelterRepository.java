package com.elif.repositories.adoption;

import com.elif.entities.adoption.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {

    // ============================================================
    // MÉTHODES DE BASE
    // ============================================================

    Optional<Shelter> findByEmail(String email);

    Optional<Shelter> findByLicenseNumber(String licenseNumber);
    Optional<Shelter> findByUserId(Long userId);
    List<Shelter> findByVerifiedTrue();

    List<Shelter> findByVerifiedFalse();

    boolean existsByEmail(String email);

    boolean existsByLicenseNumber(String licenseNumber);


    @Query("SELECT s FROM Shelter s WHERE s.name LIKE %:name%")
    List<Shelter> searchByName(@Param("name") String name);

    // ============================================================
    // MÉTHODES PAR LOCALISATION
    // ============================================================

    /**
     * Trouver les refuges par ville
     * @param city Nom de la ville
     * @return Liste des refuges dans la ville
     */
    @Query("SELECT s FROM Shelter s WHERE s.address LIKE %:city%")
    List<Shelter> findByCity(@Param("city") String city);

    /**
     * Trouver les refuges par code postal
     * @param postalCode Code postal
     * @return Liste des refuges dans le code postal
     */
    @Query("SELECT s FROM Shelter s WHERE s.address LIKE %:postalCode%")
    List<Shelter> findByPostalCode(@Param("postalCode") String postalCode);

    /**
     * Trouver les refuges par région/département
     * @param region Nom de la région ou du département
     * @return Liste des refuges dans la région
     */
    @Query("SELECT s FROM Shelter s WHERE s.address LIKE %:region%")
    List<Shelter> findByRegion(@Param("region") String region);

    /**
     * Trouver les refuges proches (par rayon)
     * Note: Cette méthode nécessite une colonne latitude/longitude dans l'entité Shelter
     * @param latitude Latitude du centre
     * @param longitude Longitude du centre
     * @param radiusKm Rayon en kilomètres
     * @return Liste des refuges dans le rayon
     */
    @Query(value = "SELECT * FROM shelter s WHERE " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(s.latitude)) " +
            "* cos(radians(s.longitude) - radians(:longitude)) + sin(radians(:latitude)) " +
            "* sin(radians(s.latitude)))) <= :radiusKm", nativeQuery = true)
    List<Shelter> findNearby(@Param("latitude") double latitude,
                             @Param("longitude") double longitude,
                             @Param("radiusKm") double radiusKm);

    // ============================================================
    // MÉTHODES DE COMPTAGE PAR REFUGE
    // ============================================================

    /**
     * Compter le nombre total d'animaux par refuge
     * @return Liste d'objets [shelterId, shelterName, petCount]
     */
    @Query("SELECT s.id, s.name, COUNT(p) FROM Shelter s LEFT JOIN AdoptionPet p ON s = p.shelter GROUP BY s.id")
    List<Object[]> countPetsPerShelter();

    /**
     * Compter le nombre d'animaux disponibles par refuge
     * @return Liste d'objets [shelterId, shelterName, availablePetCount]
     */
    @Query("SELECT s.id, s.name, COUNT(p) FROM Shelter s LEFT JOIN AdoptionPet p ON s = p.shelter " +
            "WHERE p.available = true GROUP BY s.id")
    List<Object[]> countAvailablePetsPerShelter();

    /**
     * Compter le nombre d'animaux adoptés par refuge
     * @return Liste d'objets [shelterId, shelterName, adoptedPetCount]
     */
    @Query("SELECT s.id, s.name, COUNT(c) FROM Shelter s LEFT JOIN Contract c ON s = c.shelter " +
            "GROUP BY s.id")
    List<Object[]> countAdoptedPetsPerShelter();

    // ============================================================
    // MÉTHODES POUR CLASSEMENT DES REFUGES
    // ============================================================

    /**
     * Trouver les refuges avec le plus d'adoptions
     * @param limit Nombre maximum de refuges
     * @return Liste d'objets [shelterId, shelterName, adoptionCount]
     */
    @Query("SELECT s.id, s.name, COUNT(c) FROM Shelter s LEFT JOIN Contract c ON s = c.shelter " +
            "GROUP BY s.id ORDER BY COUNT(c) DESC")
    List<Object[]> findTopSheltersByAdoptions(@Param("limit") int limit);

    /**
     * Trouver les refuges avec le plus d'animaux disponibles
     * @param limit Nombre maximum de refuges
     * @return Liste d'objets [shelterId, shelterName, availablePetCount]
     */
    @Query("SELECT s.id, s.name, COUNT(p) FROM Shelter s LEFT JOIN AdoptionPet p ON s = p.shelter " +
            "WHERE p.available = true GROUP BY s.id ORDER BY COUNT(p) DESC")
    List<Object[]> findTopSheltersByAvailablePets(@Param("limit") int limit);

    /**
     * Trouver les refuges avec le plus d'animaux totaux
     * @param limit Nombre maximum de refuges
     * @return Liste d'objets [shelterId, shelterName, petCount]
     */
    @Query("SELECT s.id, s.name, COUNT(p) FROM Shelter s LEFT JOIN AdoptionPet p ON s = p.shelter " +
            "GROUP BY s.id ORDER BY COUNT(p) DESC")
    List<Object[]> findTopSheltersByTotalPets(@Param("limit") int limit);

    // ============================================================
    // MÉTHODES POUR TAUX D'ADOPTION
    // ============================================================

    /**
     * Trouver les refuges avec leur taux d'adoption
     * @return Liste d'objets [shelter, adoptionRate]
     */
    @Query("SELECT s, (COUNT(c) * 1.0 / NULLIF(COUNT(p), 0)) as adoptionRate " +
            "FROM Shelter s LEFT JOIN s.pets p LEFT JOIN Contract c ON p = c.animal " +
            "GROUP BY s")
    List<Object[]> findSheltersWithAdoptionRate();

    /**
     * Trouver les refuges qui ont besoin d'aide (taux d'adoption faible)
     * @param minAdoptionRate Taux minimum d'adoption
     * @return Liste des refuges avec un taux d'adoption inférieur au seuil
     */
    @Query("SELECT s, (COUNT(c) * 1.0 / NULLIF(COUNT(p), 0)) as adoptionRate " +
            "FROM Shelter s LEFT JOIN s.pets p LEFT JOIN Contract c ON p = c.animal " +
            "GROUP BY s HAVING (COUNT(c) * 1.0 / NULLIF(COUNT(p), 0)) < :minAdoptionRate")
    List<Object[]> findSheltersNeedingSupport(@Param("minAdoptionRate") double minAdoptionRate);

    // ============================================================
    // MÉTHODES DE COMPTAGE PAR RÉGION
    // ============================================================

    /**
     * Compter les refuges par région
     * @return Map avec région comme clé et nombre comme valeur
     */
    @Query("SELECT s.address, COUNT(s) FROM Shelter s GROUP BY s.address")
    List<Object[]> countByRegion();

    /**
     * Compter les refuges par ville
     * @return Liste d'objets [city, count]
     */
    @Query("SELECT SUBSTRING(s.address, LOCATE(',', s.address) + 1) as city, COUNT(s) " +
            "FROM Shelter s GROUP BY city")
    List<Object[]> countByCity();

    // ============================================================
    // MÉTHODES DE RECHERCHE AVANCÉE
    // ============================================================

    /**
     * Rechercher des refuges par nom ou description (full text)
     * @param keyword Mot-clé de recherche
     * @return Liste des refuges correspondants
     */
    @Query("SELECT s FROM Shelter s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Shelter> searchShelters(@Param("keyword") String keyword);

    /**
     * Rechercher des refuges par nom, description ou adresse
     * @param keyword Mot-clé de recherche
     * @return Liste des refuges correspondants
     */
    @Query("SELECT s FROM Shelter s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Shelter> searchSheltersFullText(@Param("keyword") String keyword);

    // ============================================================
    // MÉTHODES SUPPLÉMENTAIRES
    // ============================================================

    /**
     * Trouver les refuges avec leurs statistiques complètes
     * @return Liste d'objets [shelter, totalPets, availablePets, totalAdoptions]
     */
    @Query("SELECT s, COUNT(DISTINCT p), COUNT(DISTINCT CASE WHEN p.available = true THEN p END), COUNT(DISTINCT c) " +
            "FROM Shelter s LEFT JOIN s.pets p LEFT JOIN Contract c ON s = c.shelter " +
            "GROUP BY s")
    List<Object[]> findSheltersWithStatistics();

    /**
     * Trouver les refuges vérifiés avec le plus d'animaux disponibles
     * @param limit Nombre maximum de refuges
     * @return Liste des refuges vérifiés
     */
    @Query("SELECT s FROM Shelter s WHERE s.verified = true ORDER BY SIZE(s.pets) DESC")
    List<Shelter> findTopVerifiedShelters(@Param("limit") int limit);

    /**
     * Compter le nombre total de refuges vérifiés
     * @return Nombre de refuges vérifiés
     */
    long countByVerifiedTrue();

    /**
     * Compter le nombre total de refuges non vérifiés
     * @return Nombre de refuges non vérifiés
     */
    long countByVerifiedFalse();
}