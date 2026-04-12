package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.departement.DepartementDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IDepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*
 * DÉPARTEMENT CONTROLLER
 *
 * Endpoints :
 * POST /api/departements        → créer département
 * GET  /api/departements        → liste tous les départements
 * GET  /api/departements/{id}   → un département
 * PUT  /api/departements/{id}   → modifier département
 *
 * ACCÈS :
 * POST et PUT réservés au Responsable
 * GET accessible au Responsable et Chef département
 *
 * LIEN MEMBRE 4 :
 * il utilisera GET /api/departements/{id}
 * dans ses affectations de ressources
 */

@RestController
@RequestMapping("/api/departements")
@CrossOrigin(origins = "*")
public class DepartementController {

    @Autowired
    private IDepartementService departementService;

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creer(@RequestBody DepartementDTO dto) {
        try {
            DepartementDTO result = departementService.creerDepartement(dto);
            return ResponseEntity.status(201).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DepartementDTO>> getAll() {
        return ResponseEntity.ok(departementService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(departementService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> modifier(
            @PathVariable Long id,
            @RequestBody DepartementDTO dto) {
        try {
            DepartementDTO result =
                    departementService.modifierDepartement(id, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    private Map<String, String> creerErreur(String message) {
        Map<String, String> erreur = new HashMap<>();
        erreur.put("message", message);
        return erreur;
    }
}