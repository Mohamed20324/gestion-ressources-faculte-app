package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.NotificationDTO;

import java.util.List;

public interface INotificationService {

    void envoyerNotification(Long destinataireId, Long expediteurId, String message, String type);

    void envoyerAcceptation(Long fournisseurId);

    void envoyerRejet(Long fournisseurId, String motif);

    void envoyerRejetMasse(List<Long> fournisseurIds);

    List<NotificationDTO> getNotificationsUtilisateur(Long userId);

    void marquerCommeLu(Long notificationId);

    void envoyerAvertissementRetard(Long fournisseurId, String referenceAO);

    void envoyerAffectation(Long destinataireId, Long expediteurId, String ressourceMarque);

    void envoyerReponseRetard(Long responsableId, Long fournisseurId, String message);

    void envoyerPublicationAO(Long departementId, String referenceAO);
}
