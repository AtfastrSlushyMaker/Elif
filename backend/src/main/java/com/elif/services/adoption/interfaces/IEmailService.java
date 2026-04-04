package com.elif.services.adoption.interfaces;

public interface IEmailService {

    /**
     * Envoyer un email HTML
     * @param to Destinataire
     * @param subject Sujet
     * @param htmlBody Corps HTML
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);

    /**
     * Envoyer un email texte simple
     * @param to Destinataire
     * @param subject Sujet
     * @param textBody Corps texte
     */
    void sendTextEmail(String to, String subject, String textBody);
}