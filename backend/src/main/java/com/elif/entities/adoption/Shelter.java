package com.elif.entities.adoption;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shelter")
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "license_number", unique = true, length = 100)
    private String licenseNumber;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ShelterReview> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AdoptionPet> pets = new ArrayList<>();

    @OneToMany(mappedBy = "shelter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Contract> contracts = new ArrayList<>();

    // ============================================================
    // GETTERS ET SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ShelterReview> getReviews() {
        return reviews;
    }

    public void setReviews(List<ShelterReview> reviews) {
        this.reviews = reviews;
    }

    public List<AdoptionPet> getPets() {
        return pets;
    }

    public void setPets(List<AdoptionPet> pets) {
        this.pets = pets;
    }

    public List<Contract> getContracts() {
        return contracts;
    }

    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }
}