package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.services.interfaces.IUtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*
 * UTILISATEUR CONTROLLER
 * Gère la création et gestion des utilisateurs
 *
 * Endpoints :
 * POST   /api/utilisateurs/enseignant          → créer enseignant
 * POST   /api/utilisateurs/chef                → créer chef département
 * POST   /api/utilisateurs/responsable         → créer responsable
 * POST   /api/utilisateurs/technicien          → créer technicien
 * GET    /api/utilisateurs                     → liste tous
 * GET    /api/utilisateurs/{id}                → un utilisateur
 * GET    /api/utilisateurs/role/{role}         → filtrer par rôle
 * PUT    /api/utilisateurs/{id}                → modifier
 * DELETE /api/utilisateurs/{id}               → désactiver
 * PUT    /api/utilisateurs/fournisseur/{id}/completer → compléter infos
 *
 * ACCÈS :
 * tous ces endpoints sont réservés au Responsable
 * sauf GET qui sera accessible à d'autres rôles
 * Spring Security JWT à ajouter plus tard
 *
 * LIEN MEMBRE 4 :
 * il appellera PUT /api/utilisateurs/fournisseur/{id}/completer
 * lors de la première livraison
 */

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "*")
public class UtilisateurController {

    @Autowired
    private IUtilisateurService utilisateurService;

    // =====================
    // CRÉATION
    // =====================

    @PostMapping("/enseignant")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creerEnseignant(
            @RequestBody EnseignantDTO dto) {
        try {
            UtilisateurDTO result = utilisateurService.creerEnseignant(dto);
            return ResponseEntity.status(201).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @PostMapping("/chef")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creerChef(
            @RequestBody EnseignantDTO dto) {
        try {
            UtilisateurDTO result = utilisateurService.creerChefDepartement(dto);
            return ResponseEntity.status(201).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @PostMapping("/responsable")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creerResponsable(
            @RequestBody EnseignantDTO dto) {
        try {
            UtilisateurDTO result = utilisateurService.creerResponsable(dto);
            return ResponseEntity.status(201).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @PostMapping("/technicien")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> creerTechnicien(
            @RequestBody EnseignantDTO dto) {
        try {
            UtilisateurDTO result = utilisateurService.creerTechnicien(dto);
            return ResponseEntity.status(201).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    // =====================
    // CONSULTATION
    // =====================

    @GetMapping
    public ResponseEntity<List<UtilisateurDTO>> getAll() {
        return ResponseEntity.ok(utilisateurService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(utilisateurService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UtilisateurDTO>> getByRole(
            @PathVariable String role) {
        return ResponseEntity.ok(utilisateurService.getByRole(role));
    }

    // =====================
    // MODIFICATION
    // =====================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> modifier(
            @PathVariable Long id,
            @RequestBody EnseignantDTO dto) {
        try {
            UtilisateurDTO result =
                    utilisateurService.modifierUtilisateur(id, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> modifierMonProfil(
            @PathVariable Long id,
            @RequestBody UtilisateurDTO dto) {
        try {
            UtilisateurDTO result = utilisateurService.modifierUtilisateur(id, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changerMotDePasse(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String password = body.get("password");
            if (password == null || password.isBlank()) {
                return ResponseEntity.status(400).body(creerErreur("Mot de passe obligatoire"));
            }
            utilisateurService.changerMotDePasse(id, password);
            return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    /*
     * IMPORTANT POUR MEMBRE 4 :
     * cet endpoint est appelé après la première livraison
     * pour compléter les informations du fournisseur
     * lieu, adresse, siteInternet, gerant
     */
    @PutMapping("/fournisseur/{id}/completer")
    @PreAuthorize("hasAnyRole('RESPONSABLE','FOURNISSEUR')")
    public ResponseEntity<?> completerInfosFournisseur(
            @PathVariable Long id,
            @RequestBody FournisseurDTO dto) {
        try {
            FournisseurDTO result =
                    utilisateurService.completerInfosFournisseur(id, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
    }

    // =====================
    // SUPPRESSION
    // =====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        try {
            utilisateurService.supprimerUtilisateur(id);
            Map<String, String> reponse = new HashMap<>();
            reponse.put("message", "Compte désactivé avec succès");
            return ResponseEntity.ok(reponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(creerErreur(e.getMessage()));
        }
    }

    @GetMapping("/departement/{id}/enseignants")
    public ResponseEntity<List<UtilisateurDTO>> getEnseignantsParDepartement(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getEnseignantsParDepartement(id));
    }

    // =====================
    // MÉTHODE PRIVÉE
    // =====================

    private Map<String, String> creerErreur(String message) {
        Map<String, String> erreur = new HashMap<>();
        erreur.put("message", message);
        return erreur;
    }
}