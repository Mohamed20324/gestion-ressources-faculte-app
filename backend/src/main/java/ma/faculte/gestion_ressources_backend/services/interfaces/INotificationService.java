package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.NotificationDTO;

import java.util.List;

public interface INotificationService {

    void envoyerNotification(Long destinataireId, String message, String type);

    void envoyerAcceptation(Long fournisseurId);

    void envoyerRejet(Long fournisseurId, String motif);

    void envoyerRejetMasse(List<Long> fournisseurIds);

    List<NotificationDTO> getNotificationsUtilisateur(Long userId);

    void marquerCommeLu(Long notificationId);
}
