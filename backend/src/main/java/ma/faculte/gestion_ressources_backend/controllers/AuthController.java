package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.FournisseurDTO;
import ma.faculte.gestion_ressources_backend.dto.utilisateurs.InscriptionFournisseurDTO;
import jakarta.validation.Valid;
import ma.faculte.gestion_ressources_backend.dto.LoginRequest;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Utilisateur;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IUtilisateurRepository;
import ma.faculte.gestion_ressources_backend.security.JwtService;
import ma.faculte.gestion_ressources_backend.services.interfaces.IUtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private IUtilisateurRepository utilisateurRepository;

    @Autowired
    private IUtilisateurService utilisateurService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        Optional<Utilisateur> utilisateurOpt = utilisateurRepository
                .findByEmail(request.getEmail());

        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(creerErreur("Email ou mot de passe incorrect"));
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        if (!verifierMotDePasse(request.getPassword(), utilisateur)) {
            return ResponseEntity.status(401)
                    .body(creerErreur("Email ou mot de passe incorrect"));
        }

        if (!utilisateur.isActif() && !utilisateur.getRole().equals("RESPONSABLE")) {
            return ResponseEntity.status(403)
                    .body(creerErreur("Compte désactivé contacter le responsable"));
        }

        String token = jwtService.generateToken(
                utilisateur.getId(),
                utilisateur.getEmail(),
                utilisateur.getRole());

        Map<String, Object> reponse = new HashMap<>();
        reponse.put("message", "Connexion réussie");
        reponse.put("accessToken", token);
        reponse.put("tokenType", "Bearer");
        reponse.put("id", utilisateur.getId());
        reponse.put("nom", utilisateur.getNom());
        reponse.put("prenom", utilisateur.getPrenom());
        reponse.put("email", utilisateur.getEmail());
        reponse.put("role", utilisateur.getRole());

        return ResponseEntity.ok(reponse);
    }

    /**
     * Accepte les mots de passe BCrypt ou, pour migration, l'ancien texte en clair
     * (ré-encodé automatiquement en BCrypt après succès).
     */
    private boolean verifierMotDePasse(String brut, Utilisateur utilisateur) {
        String stocke = utilisateur.getMotDePasse();
        if (stocke == null) {
            return false;
        }
        if (stocke.startsWith("$2a$") || stocke.startsWith("$2b$")) {
            return passwordEncoder.matches(brut, stocke);
        }
        if (brut != null && brut.equals(stocke)) {
            return true;
        }
        return false;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody InscriptionFournisseurDTO dto) {
        try {
            FournisseurDTO fournisseur =
                    utilisateurService.inscrireFournisseur(dto);
            return ResponseEntity.status(201).body(fournisseur);
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
