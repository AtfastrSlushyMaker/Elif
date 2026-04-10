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

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    // ============================================================
    // ✅ NOUVELLE MÉTHODE : GÉNÉRER LE PDF DU CONTRAT
    // ============================================================

    @Override
    public byte[] generateContractPdf(Long contractId) {
        Contract contract = findById(contractId);

        StringBuilder pdfContent = new StringBuilder();

        // Format de date
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // En-tête
        pdfContent.append("%PDF-1.4\n");
        pdfContent.append("1 0 obj\n");
        pdfContent.append("<< /Type /Catalog /Pages 2 0 R >>\n");
        pdfContent.append("endobj\n");
        pdfContent.append("2 0 obj\n");
        pdfContent.append("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n");
        pdfContent.append("endobj\n");
        pdfContent.append("3 0 obj\n");
        pdfContent.append("<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\n");
        pdfContent.append("endobj\n");
        pdfContent.append("4 0 obj\n");
        pdfContent.append("<< /Font << /F1 6 0 R >> >>\n");
        pdfContent.append("endobj\n");
        pdfContent.append("6 0 obj\n");
        pdfContent.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n");
        pdfContent.append("endobj\n");

        // Contenu du PDF
        String content =
                "BT\n" +
                        "/F1 18 Tf\n" +
                        "100 750 Td\n" +
                        "(ADOPTION CONTRACT) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 12 Tf\n" +
                        "100 720 Td\n" +
                        "(Contract Number: " + contract.getNumeroContrat() + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 700 Td\n" +
                        "(Date: " + LocalDateTime.now().format(dateFormatter) + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 14 Tf\n" +
                        "100 660 Td\n" +
                        "(BETWEEN:) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 12 Tf\n" +
                        "100 635 Td\n" +
                        "(Shelter: " + contract.getShelter().getName() + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 14 Tf\n" +
                        "100 595 Td\n" +
                        "(AND:) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 12 Tf\n" +
                        "100 570 Td\n" +
                        "(Adopter: " + contract.getAdoptant().getFirstName() + " " + contract.getAdoptant().getLastName() + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 550 Td\n" +
                        "(Email: " + contract.getAdoptant().getEmail() + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 14 Tf\n" +
                        "100 510 Td\n" +
                        "(ANIMAL DETAILS:) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 12 Tf\n" +
                        "100 485 Td\n" +
                        "(Name: " + contract.getAnimal().getName() + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 465 Td\n" +
                        "(Type: " + contract.getAnimal().getType() + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 445 Td\n" +
                        "(Breed: " + (contract.getAnimal().getBreed() != null ? contract.getAnimal().getBreed() : "N/A") + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 14 Tf\n" +
                        "100 405 Td\n" +
                        "(CONDITIONS:) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 12 Tf\n" +
                        "100 380 Td\n" +
                        "(" + (contract.getConditionsSpecifiques() != null ? contract.getConditionsSpecifiques().replace("(", "\\(").replace(")", "\\)") : "Standard adoption conditions apply.") + ") Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 14 Tf\n" +
                        "100 330 Td\n" +
                        "(ADOPTION FEE: " + contract.getFraisAdoption() + " EUR) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 14 Tf\n" +
                        "100 280 Td\n" +
                        "(SIGNATURES:) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 12 Tf\n" +
                        "100 250 Td\n" +
                        "(Adopter Signature: ___________________) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 225 Td\n" +
                        "(Date: ___________________) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 190 Td\n" +
                        "(Shelter Representative: ___________________) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "100 165 Td\n" +
                        "(Date: ___________________) Tj\n" +
                        "ET\n" +
                        "BT\n" +
                        "/F1 8 Tf\n" +
                        "100 50 Td\n" +
                        "(This document was generated automatically by Elif Pet Adoption Platform) Tj\n" +
                        "ET\n";

        pdfContent.append("5 0 obj\n");
        pdfContent.append("<< /Length " + content.length() + " >>\n");
        pdfContent.append("stream\n");
        pdfContent.append(content);
        pdfContent.append("endstream\n");
        pdfContent.append("endobj\n");
        pdfContent.append("xref\n");
        pdfContent.append("0 7\n");
        pdfContent.append("0000000000 65535 f \n");
        pdfContent.append("0000000009 00000 n \n");
        pdfContent.append("0000000058 00000 n \n");
        pdfContent.append("0000000115 00000 n \n");
        pdfContent.append("0000000218 00000 n \n");
        pdfContent.append("0000000266 00000 n \n");
        pdfContent.append("0000000476 00000 n \n");
        pdfContent.append("trailer\n");
        pdfContent.append("<< /Size 7 /Root 1 0 R >>\n");
        pdfContent.append("startxref\n");
        pdfContent.append("" + (content.length() + 500) + "\n");
        pdfContent.append("%%EOF\n");

        return pdfContent.toString().getBytes();
    }
}