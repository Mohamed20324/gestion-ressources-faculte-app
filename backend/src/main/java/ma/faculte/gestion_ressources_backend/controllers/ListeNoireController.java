package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.ListeNoireDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IListeNoireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/liste-noire")
@CrossOrigin(origins = "*")
public class ListeNoireController {

    @Autowired
    private IListeNoireService listeNoireService;

    @PostMapping("/fournisseur/{fournisseurId}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> ajouter(
            @PathVariable Long fournisseurId,
            @RequestParam String motif) {
        try {
            ListeNoireDTO dto = listeNoireService.ajouterFournisseur(fournisseurId, motif);
            return ResponseEntity.status(201).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(erreur(e.getMessage()));
        }
    }

    @GetMapping("/fournisseur/{fournisseurId}/existe")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> existe(@PathVariable Long fournisseurId) {
        return ResponseEntity.ok(Map.of("listeNoire", listeNoireService.estListeNoire(fournisseurId)));
    }

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<List<ListeNoireDTO>> getAll() {
        return ResponseEntity.ok(listeNoireService.getAll());
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        try {
            listeNoireService.supprimerFournisseur(id);
            return ResponseEntity.ok().build();
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
