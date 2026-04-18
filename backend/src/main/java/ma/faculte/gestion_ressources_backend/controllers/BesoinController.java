package ma.faculte.gestion_ressources_backend.controllers;

import jakarta.validation.Valid;
import ma.faculte.gestion_ressources_backend.dto.departement.besoins.BesoinRessourceDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IBesoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/besoins")
@CrossOrigin(origins = "*")
public class BesoinController {

    @Autowired
    private IBesoinService besoinService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT','CHEF_DEPARTEMENT')")
    public ResponseEntity<?> soumettre(@Valid @RequestBody BesoinRessourceDTO dto) {
        try {
            return ResponseEntity.status(201).body(besoinService.soumettreBesoins(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT','CHEF_DEPARTEMENT')")
    public ResponseEntity<?> modifier(@PathVariable Long id, @RequestBody BesoinRessourceDTO dto) {
        try {
            return ResponseEntity.ok(besoinService.modifierBesoin(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT','CHEF_DEPARTEMENT')")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        try {
            besoinService.supprimerBesoin(id);
            return ResponseEntity.ok(Map.of("message", "Besoin supprimé"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/departement/{departementId}")
    public ResponseEntity<List<BesoinRessourceDTO>> parDepartement(@PathVariable Long departementId) {
        return ResponseEntity.ok(besoinService.getBesoinsByDepartement(departementId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<BesoinRessourceDTO>> parStatut(@PathVariable String statut) {
        return ResponseEntity.ok(besoinService.getBesoinsByStatut(statut));
    }

    @GetMapping
    public ResponseEntity<List<BesoinRessourceDTO>> getAll() {
        return ResponseEntity.ok(besoinService.getAllBesoins());
    }

    @GetMapping("/enseignant/{enseignantId}")
    public ResponseEntity<List<BesoinRessourceDTO>> parEnseignant(@PathVariable Long enseignantId) {
        return ResponseEntity.ok(besoinService.getBesoinsByEnseignant(enseignantId));
    }

    private Map<String, String> erreur(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("message", message);
        return m;
    }
}
