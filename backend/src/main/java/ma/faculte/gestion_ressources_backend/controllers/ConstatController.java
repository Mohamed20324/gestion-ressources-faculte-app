package ma.faculte.gestion_ressources_backend.controllers;

import jakarta.validation.Valid;
import ma.faculte.gestion_ressources_backend.dto.maintenance.ConstatDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IConstatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/constats")
@CrossOrigin(origins = "*")
public class ConstatController {

    @Autowired
    private IConstatService constatService;

    @GetMapping("/par-signalement/{signalementId}")
    public ResponseEntity<?> parSignalement(@PathVariable Long signalementId) {
        try {
            return ResponseEntity.ok(constatService.getBySignalementId(signalementId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(constatService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(erreur(e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('TECHNICIEN')")
    public ResponseEntity<?> rediger(@Valid @RequestBody ConstatDTO dto) {
        try {
            return ResponseEntity.status(201).body(constatService.rediger(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(constatService.getAll());
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/envoyer-fournisseur")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> envoyerAuFournisseur(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(constatService.envoyerAuFournisseur(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/demander-echange")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> demanderEchange(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(constatService.demanderEchange(id));
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
