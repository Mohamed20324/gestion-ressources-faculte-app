package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.departement.ReunionDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IReunionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reunions")
@CrossOrigin(origins = "*")
public class ReunionController {

    @Autowired
    private IReunionService reunionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHEF_DEPARTEMENT','RESPONSABLE')")
    public ResponseEntity<?> creer(@RequestBody ReunionDTO dto) {
        try {
            return ResponseEntity.status(201).body(reunionService.creerReunion(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/demarrer")
    @PreAuthorize("hasAnyRole('CHEF_DEPARTEMENT','RESPONSABLE')")
    public ResponseEntity<?> demarrer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reunionService.demarrerReunion(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('CHEF_DEPARTEMENT','RESPONSABLE')")
    public ResponseEntity<?> valider(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reunionService.validerReunion(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/departement/{departementId}")
    public ResponseEntity<List<ReunionDTO>> parDepartement(@PathVariable Long departementId) {
        return ResponseEntity.ok(reunionService.getByDepartement(departementId));
    }

    private Map<String, String> erreur(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("message", message);
        return m;
    }
}
