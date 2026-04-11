package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.TypeRessourceDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.ITypeRessourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*
 * TYPE RESSOURCE CONTROLLER
 *
 * Endpoints :
 * POST /api/types-ressources          → ajouter nouveau type
 * GET  /api/types-ressources          → liste tous les types
 * GET  /api/types-ressources/actifs   → liste types actifs
 *
 * ACCÈS :
 * POST réservé au Responsable
 * GET accessible à tous les utilisateurs
 *
 * LIEN MEMBRE 4 :
 * il utilisera GET /api/types-ressources/actifs
 * pour afficher les types disponibles
 * lors de la création d'une ressource dans l'inventaire
 */

@RestController
@RequestMapping("/api/types-ressources")
@CrossOrigin(origins = "*")
public class TypeRessourceController {

    @Autowired
    private ITypeRessourceService typeRessourceService;

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody TypeRessourceDTO dto) {
        try {
            TypeRessourceDTO result = typeRessourceService.creerType(dto);
            return ResponseEntity.status(201).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TypeRessourceDTO>> getAll() {
        return ResponseEntity.ok(typeRessourceService.getAll());
    }

    @GetMapping("/actifs")
    public ResponseEntity<List<TypeRessourceDTO>> getActifs() {
        return ResponseEntity.ok(typeRessourceService.getActifs());
    }

    private Map<String, String> creerErreur(String message) {
        Map<String, String> erreur = new HashMap<>();
        erreur.put("message", message);
        return erreur;
    }
}