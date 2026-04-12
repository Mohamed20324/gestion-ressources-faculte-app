package ma.faculte.gestion_ressources_backend.controllers;

import jakarta.validation.Valid;
import ma.faculte.gestion_ressources_backend.dto.inventaire.AffectationDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IAffectationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/affectations")
@CrossOrigin(origins = "*")
public class AffectationController {

    @Autowired
    private IAffectationService affectationService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> affecter(@Valid @RequestBody AffectationDTO dto) {
        try {
            return ResponseEntity.status(201).body(affectationService.affecter(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/departement/{departementId}")
    public ResponseEntity<List<AffectationDTO>> parDepartement(@PathVariable Long departementId) {
        return ResponseEntity.ok(affectationService.listerParDepartement(departementId));
    }

    @GetMapping("/ressource/{ressourceId}")
    public ResponseEntity<?> parRessource(@PathVariable Long ressourceId) {
        try {
            return ResponseEntity.ok(affectationService.getByRessource(ressourceId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> retirer(@PathVariable Long id) {
        try {
            affectationService.retirerAffectation(id);
            return ResponseEntity.noContent().build();
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
