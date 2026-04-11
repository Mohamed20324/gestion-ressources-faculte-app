package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.FournisseurDTO;
import ma.faculte.gestion_ressources_backend.dto.utilisateurs.InscriptionFournisseurDTO;
import ma.faculte.gestion_ressources_backend.dto.LoginRequest;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Utilisateur;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IUtilisateurRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IUtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/*
 * AUTH CONTROLLER
 * Gère la connexion et l'inscription
 *
 * Endpoints :
 * POST /api/auth/login      → connexion tous les utilisateurs
 * POST /api/auth/register   → inscription fournisseur uniquement
 *
 * IMPORTANT :
 * Pour l'instant le login est basique sans JWT
 * Spring Security JWT sera ajouté à la fin
 * avec tout le groupe
 *
 * LIEN FRONTEND MEMBRES 1 et 2 :
 * Page de login utilise POST /api/auth/login
 * Page d'inscription fournisseur utilise POST /api/auth/register
 */

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
/*
 * @CrossOrigin permet au frontend React
 * de communiquer avec ce backend
 * origins = "*" accepte toutes les origines
 * en production on restreindra à l'URL du frontend
 */
public class AuthController {

    @Autowired
    private IUtilisateurRepository utilisateurRepository;

    @Autowired
    private IUtilisateurService utilisateurService;

    // =====================
    // LOGIN
    // =====================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        /*
         * chercher l'utilisateur par email
         * si non trouvé retourner 401
         */
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository
                .findByEmail(request.getEmail());

        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(creerErreur("Email ou mot de passe incorrect"));
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        /*
         * vérifier mot de passe
         * pour l'instant comparaison simple
         * avec BCrypt plus tard dans Spring Security
         */
        if (!utilisateur.getMotDePasse().equals(request.getPassword())) {
            return ResponseEntity.status(401)
                    .body(creerErreur("Email ou mot de passe incorrect"));
        }

        /*
         * vérifier que le compte est actif
         */
        if (!utilisateur.isActif()) {
            return ResponseEntity.status(403)
                    .body(creerErreur("Compte désactivé contacter le responsable"));
        }

        /*
         * retourner les infos de l'utilisateur connecté
         * sans le mot de passe
         * plus tard on retournera un token JWT ici
         */
        Map<String, Object> reponse = new HashMap<>();
        reponse.put("message", "Connexion réussie");
        reponse.put("id", utilisateur.getId());
        reponse.put("nom", utilisateur.getNom());
        reponse.put("prenom", utilisateur.getPrenom());
        reponse.put("email", utilisateur.getEmail());
        reponse.put("role", utilisateur.getRole());

        return ResponseEntity.ok(reponse);
    }

    // =====================
    // INSCRIPTION FOURNISSEUR
    // =====================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody InscriptionFournisseurDTO dto) {

        /*
         * seul le fournisseur peut s'inscrire seul
         * les utilisateurs internes sont créés par le responsable
         * via UtilisateurController
         */
        try {
            FournisseurDTO fournisseur =
                    utilisateurService.inscrireFournisseur(dto);
            return ResponseEntity.status(201).body(fournisseur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(creerErreur(e.getMessage()));
        }
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