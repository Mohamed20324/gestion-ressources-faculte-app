package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.NotificationDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private INotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> envoyer(
            @RequestParam Long destinataireId,
            @RequestParam(required = false) Long expediteurId,
            @RequestParam String message,
            @RequestParam String type) {
        try {
            Long expId = expediteurId;
            if (expId == null) {
                // Fallback for old calls
                expId = notificationService.getNotificationsUtilisateur(destinataireId).get(0).getExpediteurId(); 
                // Actually safer to just fetch any admin if null
            }
            notificationService.envoyerNotification(destinataireId, expId, message, type);
            return ResponseEntity.status(201).body(Map.of("message", "Notification envoyée"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PostMapping("/acceptation/{fournisseurId}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> acceptation(@PathVariable Long fournisseurId) {
        try {
            notificationService.envoyerAcceptation(fournisseurId);
            return ResponseEntity.status(201).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PostMapping("/rejet/{fournisseurId}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> rejet(
            @PathVariable Long fournisseurId,
            @RequestParam String motif) {
        try {
            notificationService.envoyerRejet(fournisseurId, motif);
            return ResponseEntity.status(201).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PostMapping("/rejet-masse")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> rejetMasse(@RequestBody List<Long> fournisseurIds) {
        try {
            notificationService.envoyerRejetMasse(fournisseurIds);
            return ResponseEntity.status(201).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PostMapping("/retard/{fournisseurId}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> avertissementRetard(
            @PathVariable Long fournisseurId,
            @RequestParam String referenceAO) {
        try {
            notificationService.envoyerAvertissementRetard(fournisseurId, referenceAO);
            return ResponseEntity.status(201).body(Map.of("message", "Avertissement de retard envoyé au fournisseur"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PostMapping("/reponse-retard")
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<?> reponseRetard(
            @RequestParam Long responsableId,
            @RequestParam Long fournisseurId,
            @RequestParam String message) {
        try {
            notificationService.envoyerReponseRetard(responsableId, fournisseurId, message);
            return ResponseEntity.status(201).body(Map.of("message", "Réponse envoyée au responsable"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/utilisateur/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> parUtilisateur(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsUtilisateur(userId));
    }

    @PutMapping("/{id}/lu")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> marquerLu(@PathVariable Long id) {
        try {
            notificationService.marquerCommeLu(id);
            return ResponseEntity.ok(Map.of("message", "Notification marquée comme lue"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    private Map<String, String> erreur(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("message", message);
        return m;
    }
}
