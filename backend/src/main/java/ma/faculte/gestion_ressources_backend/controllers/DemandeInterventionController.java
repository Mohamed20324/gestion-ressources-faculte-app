package ma.faculte.gestion_ressources_backend.controllers;

import jakarta.validation.Valid;
import ma.faculte.gestion_ressources_backend.dto.intervention.DemandeInterventionDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IDemandeInterventionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demandes-intervention")
@CrossOrigin(origins = "*")
public class DemandeInterventionController {

    @Autowired
    private IDemandeInterventionService demandeInterventionService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creer(@Valid @RequestBody DemandeInterventionDTO dto) {
        try {
            return ResponseEntity.status(201).body(demandeInterventionService.creer(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESPONSABLE','FOURNISSEUR')")
    public ResponseEntity<?> lister() {
        try {
            List<DemandeInterventionDTO> list = demandeInterventionService.listerPourUtilisateurConnecte();
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESPONSABLE','FOURNISSEUR')")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(demandeInterventionService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('RESPONSABLE','FOURNISSEUR')")
    public ResponseEntity<?> statut(
            @PathVariable Long id,
            @RequestParam String statut) {
        try {
            return ResponseEntity.ok(demandeInterventionService.changerStatut(id, statut));
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
