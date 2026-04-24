package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.inventaire.RessourceDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IRessourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ressources")
@CrossOrigin(origins = "*")
public class RessourceController {

    @Autowired
    private IRessourceService ressourceService;

    @GetMapping
    public ResponseEntity<List<RessourceDTO>> lister(
            @RequestParam(required = false) String statut) {
        if (statut != null && !statut.isBlank()) {
            return ResponseEntity.ok(ressourceService.listerParStatut(statut.trim()));
        }
        return ResponseEntity.ok(ressourceService.lister());
    }

    @GetMapping("/departement/{departementId}")
    public ResponseEntity<List<RessourceDTO>> parDepartement(@PathVariable Long departementId) {
        return ResponseEntity.ok(ressourceService.listerParDepartement(departementId));
    }

    @GetMapping("/offre/{offreId}")
    public ResponseEntity<List<RessourceDTO>> parOffre(@PathVariable Long offreId) {
        return ResponseEntity.ok(ressourceService.listerParOffre(offreId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ressourceService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(erreur(e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creer(@RequestBody RessourceDTO dto) {
        try {
            return ResponseEntity.status(201).body(ressourceService.creer(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> modifier(@PathVariable Long id, @RequestBody RessourceDTO dto) {
        try {
            return ResponseEntity.ok(ressourceService.modifier(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        try {
            ressourceService.supprimer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/offre/{offreId}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> supprimerParOffre(@PathVariable Long offreId) {
        try {
            ressourceService.supprimerParOffre(offreId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> modifierStatut(@PathVariable Long id, @RequestParam String statut) {
        try {
            return ResponseEntity.ok(ressourceService.modifierStatut(id, statut));
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
