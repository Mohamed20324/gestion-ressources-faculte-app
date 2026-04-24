package ma.faculte.gestion_ressources_backend.controllers;

import jakarta.validation.Valid;
import ma.faculte.gestion_ressources_backend.dto.maintenance.SignalementPanneDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.ISignalementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements")
@CrossOrigin(origins = "*")
public class SignalementController {

    @Autowired
    private ISignalementService signalementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT','CHEF_DEPARTEMENT')")
    public ResponseEntity<?> creer(@Valid @RequestBody SignalementPanneDTO dto) {
        try {
            return ResponseEntity.status(201).body(signalementService.creer(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<SignalementPanneDTO>> lister(
            @RequestParam(required = false) String statut) {
        if (statut == null || statut.isBlank()) {
            return ResponseEntity.ok(signalementService.listerTous());
        }
        return ResponseEntity.ok(signalementService.listerParStatut(statut.trim()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(signalementService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/enseignant/{enseignantId}")
    public ResponseEntity<List<SignalementPanneDTO>> getParEnseignant(@PathVariable Long enseignantId) {
        // Implement filtering by teacher ID in the service, or filter the full list here if service method is missing.
        // Let's assume signalementService has listerParEnseignant, if not we will implement it.
        return ResponseEntity.ok(signalementService.listerTous().stream()
                .filter(s -> enseignantId.equals(s.getEnseignantId()))
                .toList());
    }

    @PutMapping("/{id}/technicien")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> assignerTechnicien(
            @PathVariable Long id,
            @RequestParam Long technicienId) {
        try {
            return ResponseEntity.ok(signalementService.assignerTechnicien(id, technicienId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/fermer")
    @PreAuthorize("hasAnyRole('RESPONSABLE','TECHNICIEN')")
    public ResponseEntity<?> fermer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(signalementService.fermer(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/resoudre")
    @PreAuthorize("hasRole('TECHNICIEN')")
    public ResponseEntity<?> resoudre(@PathVariable Long id, @RequestParam Long technicienId) {
        try {
            return ResponseEntity.ok(signalementService.resoudre(id, technicienId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public ResponseEntity<?> annuler(@PathVariable Long id) {
        try {
            signalementService.annuler(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<?> getParFournisseur(@PathVariable Long fournisseurId) {
        try {
            return ResponseEntity.ok(signalementService.listerParFournisseur(fournisseurId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/programmer-echange")
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<?> programmerEchange(@PathVariable Long id, @RequestParam String date) {
        try {
            return ResponseEntity.ok(signalementService.programmerEchange(id, java.time.LocalDate.parse(date)));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/receptionner-echange")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> receptionnerEchange(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(signalementService.receptionnerEchange(id));
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
