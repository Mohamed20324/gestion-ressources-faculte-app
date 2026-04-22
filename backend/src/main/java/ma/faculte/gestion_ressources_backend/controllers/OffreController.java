package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.OffreDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IOffreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offres")
@CrossOrigin(origins = "*")
public class OffreController {

    @Autowired
    private IOffreService offreService;

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<List<OffreDTO>> getAll() {
        return ResponseEntity.ok(offreService.getAllOffres());
    }

    @GetMapping("/fournisseur/{id}")
    @PreAuthorize("hasRole('FOURNISSEUR') or hasRole('RESPONSABLE')")
    public ResponseEntity<List<OffreDTO>> getByFournisseur(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.getByFournisseur(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FOURNISSEUR')")
    public ResponseEntity<?> soumettre(@RequestBody OffreDTO dto) {
        try {
            return ResponseEntity.status(201).body(offreService.soumettreOffre(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> accepter(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(offreService.accepterOffre(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> rejeter(
            @PathVariable Long id,
            @RequestParam String motif) {
        try {
            return ResponseEntity.ok(offreService.rejeterOffre(id, motif));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/eliminer")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> eliminer(
            @PathVariable Long id,
            @RequestParam String motif) {
        try {
            return ResponseEntity.ok(offreService.eliminerOffre(id, motif));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/appel-offre/{appelOffreId}/moins-disant")
    public ResponseEntity<List<OffreDTO>> moinsDisant(@PathVariable Long appelOffreId) {
        return ResponseEntity.ok(offreService.getMoinsDisant(appelOffreId));
    }

    @GetMapping("/appel-offre/{appelOffreId}")
    public ResponseEntity<List<OffreDTO>> parAppelOffre(@PathVariable Long appelOffreId) {
        return ResponseEntity.ok(offreService.getOffresByAppelOffre(appelOffreId));
    }

    private Map<String, String> erreur(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("message", message);
        return m;
    }
}
