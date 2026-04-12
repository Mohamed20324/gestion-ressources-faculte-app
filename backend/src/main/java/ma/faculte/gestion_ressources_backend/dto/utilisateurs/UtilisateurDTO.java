package ma.faculte.gestion_ressources_backend.dto.utilisateurs;

import java.time.LocalDate;

/*
 * DTO UTILISATEUR
 * Utilisé pour les réponses API
 * Ne jamais retourner l'entité directement
 * pour ne pas exposer le mot de passe en JSON
 *
 * UTILISÉ PAR : UtilisateurController
 */

public class UtilisateurDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private LocalDate dateCreation;
    private boolean actif;

    /*
     * Champs optionnels pour creerUtilisateur() (jamais exposés en réponse standard)
     */
    private String motDePasse;
    private String matricule;
    private String specialite;
    private Long departementId;
    private String nomSociete;

    public UtilisateurDTO() {}

    public UtilisateurDTO(Long id, String nom, String prenom,
                          String email, String role,
                          LocalDate dateCreation, boolean actif) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
        this.dateCreation = dateCreation;
        this.actif = actif;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public Long getDepartementId() { return departementId; }
    public void setDepartementId(Long departementId) { this.departementId = departementId; }

    public String getNomSociete() { return nomSociete; }
    public void setNomSociete(String nomSociete) { this.nomSociete = nomSociete; }
}