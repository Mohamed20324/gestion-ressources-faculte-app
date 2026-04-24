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

    @Override
    @Transactional
    public void envoyerNotification(Long destinataireId, Long expediteurId, String message, String type) {
        Utilisateur dest = utilisateurRepository.findById(destinataireId)
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable : " + destinataireId));
        Utilisateur exp = utilisateurRepository.findById(expediteurId)
                .orElseThrow(() -> new RuntimeException("Expéditeur introuvable : " + expediteurId));
        
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
        Responsable exp = responsableRepository.findAll().get(0);
        String msg = "Votre offre a été acceptée pour l'appel d'offres concerné.";
        envoyerNotification(fournisseurId, exp.getId(), msg, Notification.TYPE_ACCEPTATION);
    }

    @Override
    @Transactional
    public void envoyerRejet(Long fournisseurId, String motif) {
        Responsable exp = responsableRepository.findAll().get(0);
        String msg = "Votre offre n'a pas été retenue."
                + (motif != null && !motif.isBlank() ? " Motif : " + motif : "");
        envoyerNotification(fournisseurId, exp.getId(), msg, Notification.TYPE_REJET);
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

    @Override
    @Transactional
    public void envoyerAvertissementRetard(Long fournisseurId, String referenceAO) {
        Responsable exp = responsableRepository.findAll().get(0);
        String msg = "AVERTISSEMENT : Retard constaté pour la livraison liée à l'appel d'offres " + referenceAO 
                   + ". Veuillez régulariser la situation dans les plus brefs délais.";
        envoyerNotification(fournisseurId, exp.getId(), msg, Notification.TYPE_AVERTISSEMENT);
    }

    @Override
    @Transactional
    public void envoyerAffectation(Long destinataireId, Long expediteurId, String ressourceMarque) {
        String msg = "Une nouvelle ressource (" + ressourceMarque + ") vous a été affectée.";
        envoyerNotification(destinataireId, expediteurId, msg, Notification.TYPE_AFFECTATION);
    }

    @Override
    @Transactional
    public void envoyerReponseRetard(Long responsableId, Long fournisseurId, String message) {
        String msg = "Réponse fournisseur concernant le retard : " + message;
        envoyerNotification(responsableId, fournisseurId, msg, Notification.TYPE_REPONSE_FOURNISSEUR);
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
