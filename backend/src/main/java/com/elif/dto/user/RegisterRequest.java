package com.elif.dto.user;

import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String accountType;  // AJOUTER CE CHAMP : "USER" ou "SHELTER"
}