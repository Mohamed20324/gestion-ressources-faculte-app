package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.NotificationDTO;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Utilisateur;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.INotificationRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IResponsableRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IUtilisateurRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements INotificationService {

    @Autowired
    private INotificationRepository notificationRepository;

    @Autowired
    private IUtilisateurRepository utilisateurRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    private Responsable premierResponsable() {
        return responsableRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun responsable enregistré"));
    }

    @Override
    @Transactional
    public void envoyerNotification(Long destinataireId, String message, String type) {
        Utilisateur dest = utilisateurRepository.findById(destinataireId)
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable : " + destinataireId));
        Responsable exp = premierResponsable();
        Notification n = new Notification();
        n.setMessage(message);
        n.setType(type);
        n.setDestinataire(dest);
        n.setExpediteur(exp);
        n.setLu(false);
        notificationRepository.save(n);
    }

    @Override
    @Transactional
    public void envoyerAcceptation(Long fournisseurId) {
        String msg = "Votre offre a été acceptée pour l'appel d'offres concerné.";
        envoyerNotification(fournisseurId, msg, Notification.TYPE_ACCEPTATION);
    }

    @Override
    @Transactional
    public void envoyerRejet(Long fournisseurId, String motif) {
        String msg = "Votre offre n'a pas été retenue."
                + (motif != null && !motif.isBlank() ? " Motif : " + motif : "");
        envoyerNotification(fournisseurId, msg, Notification.TYPE_REJET);
    }

    @Override
    @Transactional
    public void envoyerRejetMasse(List<Long> fournisseurIds) {
        if (fournisseurIds == null) {
            return;
        }
        for (Long id : fournisseurIds) {
            envoyerRejet(id, "Une autre offre a été retenue pour cet appel d'offres.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsUtilisateur(Long userId) {
        return notificationRepository.findByDestinataireId(userId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void marquerCommeLu(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable : " + notificationId));
        n.setLu(true);
        notificationRepository.save(n);
    }

    private NotificationDTO versDto(Notification n) {
        NotificationDTO d = new NotificationDTO();
        d.setId(n.getId());
        d.setMessage(n.getMessage());
        d.setDateEnvoi(n.getDateEnvoi());
        d.setType(n.getType());
        d.setLu(n.isLu());
        if (n.getExpediteur() != null) {
            d.setExpediteurId(n.getExpediteur().getId());
            d.setExpediteurNom(n.getExpediteur().getNom() + " " + n.getExpediteur().getPrenom());
        }
        return d;
    }
}
