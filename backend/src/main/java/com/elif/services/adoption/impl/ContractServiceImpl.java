package com.elif.services.adoption.impl;

import com.elif.entities.adoption.AdoptionPet;
import com.elif.entities.adoption.Contract;
import com.elif.entities.adoption.Shelter;
import com.elif.entities.adoption.enums.ContractStatus;
import com.elif.entities.user.User;
import com.elif.repositories.adoption.ContractRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.adoption.interfaces.AdoptionPetService;
import com.elif.services.adoption.interfaces.ContractService;
import com.elif.services.adoption.interfaces.ShelterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final ShelterService shelterService;
    private final AdoptionPetService petService;
    private final UserRepository userRepository;

    // ============================================================
    // CONSTRUCTEUR
    // ============================================================

    public ContractServiceImpl(ContractRepository contractRepository,
                               ShelterService shelterService,
                               AdoptionPetService petService,
                               UserRepository userRepository) {
        this.contractRepository = contractRepository;
        this.shelterService = shelterService;
        this.petService = petService;
        this.userRepository = userRepository;
    }

    // ============================================================
    // MÉTHODES DE BASE
    // ============================================================

    @Override
    public List<Contract> findAll() {
        return contractRepository.findAll();
    }

    @Override
    public Contract findById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé avec l'id: " + id));
    }

    @Override
    public Contract findByNumeroContrat(String numeroContrat) {
        return contractRepository.findByNumeroContrat(numeroContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé avec le numéro: " + numeroContrat));
    }

    @Override
    public List<Contract> findByShelterId(Long shelterId) {
        return contractRepository.findByShelterId(shelterId);
    }

    @Override
    public List<Contract> findByAdoptantId(Long adoptantId) {
        return contractRepository.findByAdoptantId(adoptantId);
    }

    @Override
    public List<Contract> findByStatus(ContractStatus status) {
        return contractRepository.findByStatut(status);
    }

    @Override
    public Contract findByAnimalId(Long animalId) {
        return contractRepository.findByAnimalId(animalId)
                .orElse(null);
    }

    @Override
    public Contract create(Long shelterId, Long adoptantId, Long animalId,
                           BigDecimal fraisAdoption, String conditionsSpecifiques) {

        Shelter shelter = shelterService.findById(shelterId);
        User adoptant = userRepository.findById(adoptantId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        AdoptionPet animal = petService.findById(animalId);

        if (contractRepository.existsByAnimalId(animalId)) {
            throw new RuntimeException("Cet animal a déjà un contrat");
        }

        String numeroContrat = generateContractNumber();

        Contract contract = Contract.builder()
                .numeroContrat(numeroContrat)
                .shelter(shelter)
                .adoptant(adoptant)
                .animal(animal)
                .dateAdoption(LocalDateTime.now())
                .statut(ContractStatus.BROUILLON)
                .fraisAdoption(fraisAdoption)
                .conditionsSpecifiques(conditionsSpecifiques)
                .build();

        return contractRepository.save(contract);
    }

    @Override
    public Contract sendForSignature(Long contractId) {
        Contract contract = findById(contractId);
        contract.setStatut(ContractStatus.ENVOYE);
        return contractRepository.save(contract);
    }

    @Override
    public Contract sign(Long contractId, Long userId) {
        Contract contract = findById(contractId);

        if (!contract.getAdoptant().getId().equals(userId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à signer ce contrat");
        }

        if (contract.getStatut() != ContractStatus.ENVOYE) {
            throw new RuntimeException("Ce contrat ne peut pas être signé actuellement");
        }

        contract.setStatut(ContractStatus.SIGNE);
        contract.setDateSignature(LocalDateTime.now());
        return contractRepository.save(contract);
    }

    @Override
    public Contract validate(Long contractId) {
        Contract contract = findById(contractId);

        if (contract.getStatut() != ContractStatus.SIGNE) {
            throw new RuntimeException("Le contrat doit être signé avant validation");
        }

        contract.setStatut(ContractStatus.VALIDE);
        return contractRepository.save(contract);
    }

    @Override
    public Contract activate(Long contractId) {
        Contract contract = findById(contractId);
        contract.setStatut(ContractStatus.ACTIF);
        return contractRepository.save(contract);
    }

    @Override
    public Contract terminate(Long contractId) {
        Contract contract = findById(contractId);
        contract.setStatut(ContractStatus.TERMINE);
        return contractRepository.save(contract);
    }

    @Override
    public Contract rescind(Long contractId, Long userId) {
        Contract contract = findById(contractId);

        if (!contract.getAdoptant().getId().equals(userId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à résilier ce contrat");
        }

        if (contract.getStatut() != ContractStatus.ACTIF) {
            throw new RuntimeException("Seul un contrat actif peut être résilié");
        }

        contract.setStatut(ContractStatus.RESILIE);
        return contractRepository.save(contract);
    }

    @Override
    public Contract cancel(Long contractId) {
        Contract contract = findById(contractId);

        if (contract.getStatut() == ContractStatus.ACTIF ||
                contract.getStatut() == ContractStatus.TERMINE) {
            throw new RuntimeException("Ce contrat ne peut pas être annulé");
        }

        contract.setStatut(ContractStatus.ANNULE);
        return contractRepository.save(contract);
    }

    @Override
    public Contract update(Long contractId, String conditionsSpecifiques, BigDecimal fraisAdoption) {
        Contract contract = findById(contractId);

        if (contract.getStatut() != ContractStatus.BROUILLON) {
            throw new RuntimeException("Le contrat ne peut plus être modifié");
        }

        if (conditionsSpecifiques != null) {
            contract.setConditionsSpecifiques(conditionsSpecifiques);
        }
        if (fraisAdoption != null) {
            contract.setFraisAdoption(fraisAdoption);
        }

        return contractRepository.save(contract);
    }

    @Override
    public boolean hasContract(Long animalId) {
        return contractRepository.existsByAnimalId(animalId);
    }

    private String generateContractNumber() {
        return "CTR-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // ============================================================
    // MÉTHODES POUR CONTRATS PAR TEMPS
    // ============================================================

    @Override
    public List<Contract> findContractsExpiringSoon(int days) {
        return contractRepository.findContractsExpiringSoon(days);
    }

    @Override
    public List<Object[]> countContractsByMonthForShelter(Long shelterId) {
        return contractRepository.countContractsByMonthForShelter(shelterId);
    }

    @Override
    public List<Contract> findContractsSignedToday() {
        return contractRepository.findContractsSignedToday();
    }

    // ============================================================
    // MÉTHODES DE CHIFFRE D'AFFAIRES
    // ============================================================

    @Override
    public BigDecimal calculateTotalAdoptionFees() {
        BigDecimal total = contractRepository.calculateTotalAdoptionFees();
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public List<Object[]> calculateRevenueByShelter() {
        return contractRepository.calculateRevenueByShelter();
    }

    @Override
    public BigDecimal calculateRevenueByShelterId(Long shelterId) {
        BigDecimal revenue = contractRepository.calculateRevenueByShelterId(shelterId);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    // ============================================================
    // MÉTHODES POUR DOCUMENTS
    // ============================================================

    @Override
    public List<Contract> findContractsWithoutDocument() {
        return contractRepository.findContractsWithoutDocument();
    }

    // ============================================================
    // MÉTHODES DE COMPTAGE PAR STATUT
    // ============================================================

    @Override
    public List<Object[]> countByStatus() {
        return contractRepository.countByStatus();
    }

    @Override
    public long countByStatut(ContractStatus statut) {
        return contractRepository.countByStatut(statut);
    }

    // ============================================================
    // MÉTHODES POUR ADOPTANTS MULTIPLES
    // ============================================================

    @Override
    public List<Object[]> findMultipleAdopters(int minAdoptions) {
        return contractRepository.findMultipleAdopters(minAdoptions);
    }

    // ============================================================
    // MÉTHODES POUR STATISTIQUES PAR TYPE D'ANIMAL
    // ============================================================

    @Override
    public List<Object[]> countAdoptionsByPetType() {
        return contractRepository.countAdoptionsByPetType();
    }

    @Override
    public List<Object[]> countAdoptionsByPetSize() {
        return contractRepository.countAdoptionsByPetSize();
    }

    @Override
    public List<Object[]> countAdoptionsByBreed() {
        return contractRepository.countAdoptionsByBreed();
    }

    // ============================================================
    // MÉTHODES AVEC DÉTAILS (FETCH JOIN)
    // ============================================================

    @Override
    public List<Contract> findContractsByStatusWithDetails(ContractStatus status) {
        return contractRepository.findContractsByStatusWithDetails(status);
    }

    @Override
    public List<Contract> findAllWithDetails() {
        return contractRepository.findAllWithDetails();
    }

    @Override
    public Contract findByIdWithDetails(Long id) {
        return contractRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé avec l'id: " + id));
    }

    // ============================================================
    // MÉTHODES SUPPLÉMENTAIRES
    // ============================================================

    @Override
    public List<Contract> findByAdoptantIdAndStatut(Long adoptantId, ContractStatus statut) {
        return contractRepository.findByAdoptantIdAndStatut(adoptantId, statut);
    }

    @Override
    public long countTotalAdoptions() {
        return contractRepository.countTotalAdoptions();
    }

    @Override
    public List<Object[]> countAdoptionsByMonth() {
        return contractRepository.countAdoptionsByMonth();
    }

    @Override
    public List<Contract> findByDateAdoptionBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return contractRepository.findByDateAdoptionBetween(startDate, endDate);
    }
}