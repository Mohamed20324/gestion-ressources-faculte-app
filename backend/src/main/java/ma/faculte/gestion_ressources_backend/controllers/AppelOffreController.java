package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.AppelOffreDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IAppelOffreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appels-offres")
@CrossOrigin(origins = "*")
public class AppelOffreController {

    @Autowired
    private IAppelOffreService appelOffreService;

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<List<AppelOffreDTO>> getAll() {
        return ResponseEntity.ok(appelOffreService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creer(@RequestBody AppelOffreDTO dto) {
        try {
            return ResponseEntity.status(201).body(appelOffreService.creerAppelOffre(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/besoins")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> ajouterBesoins(
            @PathVariable Long id,
            @RequestBody List<Long> besoinIds) {
        try {
            return ResponseEntity.ok(appelOffreService.ajouterBesoins(id, besoinIds));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/cloturer")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> cloturer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appelOffreService.cloturerAppelOffre(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/ouverts")
    public ResponseEntity<List<AppelOffreDTO>> ouverts() {
        return ResponseEntity.ok(appelOffreService.getAllOuverts());
    }

    @PutMapping("/{id}/publier")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> publier(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appelOffreService.publierAppelOffre(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        try {
            appelOffreService.supprimerAppelOffre(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/besoins/{besoinId}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> retirerBesoin(@PathVariable Long id, @PathVariable Long besoinId) {
        try {
            return ResponseEntity.ok(appelOffreService.retirerBesoin(id, besoinId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appelOffreService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(erreur(e.getMessage()));
        }
    }

    private Map<String, String> erreur(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("message", message);
        return m;
    }
}
